#!/usr/bin/env python3
"""
Generate AI-powered release notes for SDK releases.

Compares OpenAPI specs between versions and uses Claude to generate
meaningful, human-readable release notes.

Usage:
    python scripts/generate_release_notes.py --from-tag v1.2.0 --to-tag v1.3.0
    python scripts/generate_release_notes.py --from-tag v1.2.0 --to-tag v1.3.0 --output release_notes.md
    python scripts/generate_release_notes.py --dry-run  # Uses current tag and HEAD
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# Import from bump_version for consistency
from bump_version import get_latest_version_tag

PROJECT_ROOT = Path(__file__).parent.parent
OPENAPI_SPEC = PROJECT_ROOT / "generated" / "openapi.json"


def get_api_commits_since_tag(tag: str) -> list[str]:
    """Get API-related commit messages since the given tag.

    Only includes commits that are relevant to SDK users:
    1. Commits with (api) scope - e.g., feat(api):, fix(api):
    2. Commits that touched openapi.json with feat:/fix: prefix

    This ensures SDK release notes only include actual API changes.
    """
    api_commits = []

    # 1. Get commits with (api) scope from backend changes
    if not tag:
        result = subprocess.run(
            ["git", "log", "--pretty=format:%s", "--", "backend/"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )
    else:
        result = subprocess.run(
            ["git", "log", f"{tag}..HEAD", "--pretty=format:%s", "--", "backend/"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )

    for msg in result.stdout.strip().split("\n"):
        if msg and "(api)" in msg.lower():
            api_commits.append(msg)

    # 2. Get feat:/fix: commits that touched openapi.json (actual API changes)
    if not tag:
        result = subprocess.run(
            ["git", "log", "--pretty=format:%s", "--", "generated/openapi.json"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )
    else:
        result = subprocess.run(
            ["git", "log", f"{tag}..HEAD", "--pretty=format:%s", "--", "generated/openapi.json"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )

    for msg in result.stdout.strip().split("\n"):
        if msg and msg.startswith(("feat:", "fix:", "feat(", "fix(")):
            if msg not in api_commits:  # Avoid duplicates
                api_commits.append(msg)

    return api_commits


def get_openapi_at_ref(ref: str) -> dict | None:
    """Get OpenAPI spec at a specific git ref (tag or commit)."""
    if not ref:
        return None

    result = subprocess.run(
        ["git", "show", f"{ref}:generated/openapi.json"],
        capture_output=True,
        text=True,
        cwd=PROJECT_ROOT,
    )

    if result.returncode != 0:
        return None

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def get_current_openapi() -> dict:
    """Get current OpenAPI spec from filesystem."""
    return json.loads(OPENAPI_SPEC.read_text())


def diff_openapi_specs(old_spec: dict | None, new_spec: dict) -> dict:
    """
    Compare two OpenAPI specs and return a structured diff.

    Returns dict with:
    - new_endpoints: List of new endpoint paths
    - removed_endpoints: List of removed endpoint paths
    - changed_endpoints: List of endpoint paths with changes
    - new_schemas: List of new schema names
    - changed_schemas: List of modified schema names
    """
    diff = {
        "new_endpoints": [],
        "removed_endpoints": [],
        "changed_endpoints": [],
        "new_schemas": [],
        "removed_schemas": [],
        "changed_schemas": [],
    }

    if not old_spec:
        # No previous spec, everything is new
        for path, methods in new_spec.get("paths", {}).items():
            for method in methods:
                if method in ["get", "post", "put", "patch", "delete"]:
                    diff["new_endpoints"].append(f"{method.upper()} {path}")
        diff["new_schemas"] = list(new_spec.get("components", {}).get("schemas", {}).keys())
        return diff

    old_paths = old_spec.get("paths", {})
    new_paths = new_spec.get("paths", {})

    # Find new and removed endpoints
    old_endpoints = set()
    new_endpoints = set()

    for path, methods in old_paths.items():
        for method in methods:
            if method in ["get", "post", "put", "patch", "delete"]:
                old_endpoints.add((method.upper(), path))

    for path, methods in new_paths.items():
        for method in methods:
            if method in ["get", "post", "put", "patch", "delete"]:
                new_endpoints.add((method.upper(), path))

    for method, path in new_endpoints - old_endpoints:
        diff["new_endpoints"].append(f"{method} {path}")

    for method, path in old_endpoints - new_endpoints:
        diff["removed_endpoints"].append(f"{method} {path}")

    # Find changed endpoints (same path, different definition)
    for method, path in old_endpoints & new_endpoints:
        old_def = old_paths.get(path, {}).get(method.lower(), {})
        new_def = new_paths.get(path, {}).get(method.lower(), {})
        if old_def != new_def:
            diff["changed_endpoints"].append(f"{method} {path}")

    # Compare schemas
    old_schemas = old_spec.get("components", {}).get("schemas", {})
    new_schemas = new_spec.get("components", {}).get("schemas", {})

    diff["new_schemas"] = list(set(new_schemas.keys()) - set(old_schemas.keys()))
    diff["removed_schemas"] = list(set(old_schemas.keys()) - set(new_schemas.keys()))

    for name in set(old_schemas.keys()) & set(new_schemas.keys()):
        if old_schemas[name] != new_schemas[name]:
            diff["changed_schemas"].append(name)

    return diff


def generate_release_notes_with_ai(
    version: str,
    diff: dict,
    commits: list[str],
    old_spec: dict | None,
    new_spec: dict,
) -> str:
    """Generate release notes using OpenAI API."""
    try:
        from openai import OpenAI
    except ImportError:
        print("WARNING: openai package not installed, falling back to basic notes")
        return generate_basic_release_notes(version, diff, commits)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("WARNING: OPENAI_API_KEY not set, falling back to basic notes")
        return generate_basic_release_notes(version, diff, commits)

    # Build context for the model
    context = {
        "version": version,
        "diff": diff,
        "commits": commits[:20],  # Limit to recent commits
    }

    # Add endpoint details for new/changed endpoints
    endpoint_details = []
    for endpoint in diff["new_endpoints"] + diff["changed_endpoints"]:
        parts = endpoint.split(" ", 1)
        if len(parts) == 2:
            method, path = parts
            method_lower = method.lower()
            endpoint_def = new_spec.get("paths", {}).get(path, {}).get(method_lower, {})
            if endpoint_def:
                endpoint_details.append(
                    {
                        "endpoint": endpoint,
                        "summary": endpoint_def.get("summary", ""),
                        "description": endpoint_def.get("description", "")[:500],
                        "is_new": endpoint in diff["new_endpoints"],
                    }
                )

    context["endpoint_details"] = endpoint_details

    # Add schema details for new/changed schemas
    schema_details = []
    for schema_name in diff["new_schemas"] + diff["changed_schemas"]:
        schema_def = new_spec.get("components", {}).get("schemas", {}).get(schema_name, {})
        if schema_def:
            schema_details.append(
                {
                    "name": schema_name,
                    "description": schema_def.get("description", ""),
                    "properties": list(schema_def.get("properties", {}).keys())[:10],
                    "is_new": schema_name in diff["new_schemas"],
                }
            )

    context["schema_details"] = schema_details

    user_prompt = f"""Generate concise, meaningful release notes for YourApp SDK version {version}.

Context:
{json.dumps(context, indent=2)}

Requirements:
1. Write from a user's perspective - what can they DO now?
2. Be specific about new capabilities
3. Keep it concise - max 10 bullet points total
4. Use present tense ("Add", "Fix", not "Added", "Fixed")
5. Group related changes together
6. Skip internal/minor changes

Format (markdown):
## What's New

- **Feature Name:** Brief description of what users can now do
- **Bug Fix:** What was fixed and the impact

## API Changes

**New Endpoints:**
- `POST /v1/endpoint` - What it does

**Updated Models:**
- `ModelName` - What changed

---
*Generated from YourApp API v{version}*

Only include sections that have content. Be brief and user-focused."""

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-5-mini",
            max_completion_tokens=1024,
            messages=[
                {
                    "role": "developer",
                    "content": "You are a technical writer creating release notes for SDK updates. Be concise and user-focused.",
                },
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"WARNING: OpenAI API error: {e}, falling back to basic notes")
        return generate_basic_release_notes(version, diff, commits)


def generate_basic_release_notes(version: str, diff: dict, commits: list[str]) -> str:
    """Generate basic release notes from diff and commits (fallback)."""
    lines = ["## What's New", ""]

    # Parse commits for features and fixes
    features = []
    fixes = []
    for commit in commits:
        if commit.startswith("feat:") or commit.startswith("feat("):
            # Extract message after prefix
            msg = commit.split(":", 1)[1].strip() if ":" in commit else commit
            features.append(msg)
        elif commit.startswith("fix:") or commit.startswith("fix("):
            msg = commit.split(":", 1)[1].strip() if ":" in commit else commit
            fixes.append(msg)

    if features:
        for feat in features[:5]:
            lines.append(f"- {feat}")
        lines.append("")

    if fixes:
        lines.append("**Bug Fixes:**")
        for fix in fixes[:5]:
            lines.append(f"- {fix}")
        lines.append("")

    # Add API changes section
    if diff["new_endpoints"] or diff["changed_endpoints"] or diff["new_schemas"]:
        lines.append("## API Changes")
        lines.append("")

        if diff["new_endpoints"]:
            lines.append("**New Endpoints:**")
            for endpoint in diff["new_endpoints"][:5]:
                lines.append(f"- `{endpoint}`")
            lines.append("")

        if diff["new_schemas"]:
            lines.append("**New Models:**")
            for schema in diff["new_schemas"][:5]:
                lines.append(f"- `{schema}`")
            lines.append("")

        if diff["changed_endpoints"]:
            lines.append("**Updated Endpoints:**")
            for endpoint in diff["changed_endpoints"][:5]:
                lines.append(f"- `{endpoint}`")
            lines.append("")

    lines.append("---")
    lines.append(f"*Generated from YourApp API v{version}*")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Generate AI-powered release notes for SDK releases",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    Generate notes comparing two tags:
        python scripts/generate_release_notes.py --from-tag v1.2.0 --to-tag v1.3.0

    Output to file:
        python scripts/generate_release_notes.py --from-tag v1.2.0 --to-tag v1.3.0 --output notes.md

    Dry run (show diff without generating):
        python scripts/generate_release_notes.py --dry-run
        """,
    )

    parser.add_argument(
        "--from-tag",
        help="Previous version tag (default: latest version tag)",
    )

    parser.add_argument(
        "--to-tag",
        help="New version tag (default: current HEAD)",
    )

    parser.add_argument(
        "--output",
        "-o",
        help="Output file path (default: stdout)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show diff analysis without generating notes",
    )

    args = parser.parse_args()

    # Determine from-tag
    if args.from_tag:
        from_tag = args.from_tag
    else:
        from_tag, _ = get_latest_version_tag()

    # Get specs
    old_spec = get_openapi_at_ref(from_tag) if from_tag else None
    new_spec = (
        get_openapi_at_ref(args.to_tag) if args.to_tag else get_current_openapi()
    )

    # Get version
    version = new_spec.get("info", {}).get("version", "unknown")
    if args.to_tag:
        version = args.to_tag.lstrip("v")

    # Calculate diff
    diff = diff_openapi_specs(old_spec, new_spec)

    # Get commits
    commits = get_api_commits_since_tag(from_tag)

    if args.dry_run:
        print(f"From: {from_tag or '(none)'}")
        print(f"To: {args.to_tag or 'HEAD'}")
        print(f"Version: {version}")
        print()
        print("OpenAPI Diff:")
        print(json.dumps(diff, indent=2))
        print()
        print(f"API Commits ({len(commits)}):")
        for commit in commits[:10]:
            print(f"  - {commit[:80]}")
        return

    # Generate release notes
    notes = generate_release_notes_with_ai(version, diff, commits, old_spec, new_spec)

    # Output
    if args.output:
        Path(args.output).write_text(notes)
        print(f"Release notes written to {args.output}")
    else:
        print(notes)


if __name__ == "__main__":
    main()
