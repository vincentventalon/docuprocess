#!/usr/bin/env python3
"""
Analyze commits since last version tag and determine version bump.

Uses conventional commits to determine version bump, but ONLY considers
commits that actually modified openapi.json (API changes).

- feat: → minor bump (1.0.0 → 1.1.0)
- fix: → patch bump (1.0.0 → 1.0.1)
- feat!: or BREAKING CHANGE: → major bump (1.0.0 → 2.0.0)
- Other commits that touch openapi.json → no bump (requires manual tag)

Usage:
    python scripts/bump_version.py --check-only  # Output JSON with analysis
    python scripts/bump_version.py               # Print human-readable summary
"""

import argparse
import json
import re
import subprocess


def get_latest_version_tag() -> tuple[str, str]:
    """Get the latest version tag and the version string.

    Returns:
        Tuple of (tag_name, version_string) e.g. ("v1.0.0", "1.0.0")
        Returns ("", "0.0.0") if no tags exist.
    """
    try:
        # Get latest tag matching v*.*.* pattern
        result = subprocess.run(
            ["git", "describe", "--tags", "--match", "v[0-9]*.[0-9]*.[0-9]*", "--abbrev=0"],
            capture_output=True,
            text=True,
            check=True,
        )
        tag = result.stdout.strip()
        # Extract version from tag (v1.0.0 → 1.0.0)
        version = tag.lstrip("v")
        return tag, version
    except subprocess.CalledProcessError:
        # No tags exist
        return "", "0.0.0"


def get_api_commits_since_tag(tag: str) -> list[str]:
    """Get commit messages that touched openapi.json since the given tag.

    Only these commits matter for SDK versioning in a monorepo.
    """
    if not tag:
        # No tag exists, get all commits that touched openapi.json
        result = subprocess.run(
            ["git", "log", "--pretty=format:%s", "--", "generated/openapi.json"],
            capture_output=True,
            text=True,
        )
    else:
        # Get commits since tag that touched openapi.json
        result = subprocess.run(
            ["git", "log", f"{tag}..HEAD", "--pretty=format:%s", "--", "generated/openapi.json"],
            capture_output=True,
            text=True,
        )
    return [msg for msg in result.stdout.strip().split("\n") if msg]


def analyze_commits(commits: list[str]) -> str:
    """Determine bump type from commit messages."""
    has_breaking = False
    has_feat = False
    has_fix = False

    for msg in commits:
        msg_lower = msg.lower()
        # Check for breaking changes
        if "breaking change" in msg_lower or re.match(r"^\w+!:", msg):
            has_breaking = True
        # Check for features (feat: or feat(...):)
        elif msg.startswith("feat:") or msg.startswith("feat("):
            has_feat = True
        # Check for fixes
        elif msg.startswith("fix:") or msg.startswith("fix("):
            has_fix = True

    if has_breaking:
        return "major"
    elif has_feat:
        return "minor"
    elif has_fix:
        return "patch"
    return "none"


def bump_version(version: str, bump_type: str) -> str:
    """Calculate new version."""
    major, minor, patch = map(int, version.split("."))
    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    return version


def openapi_changed_since_tag(tag: str) -> bool:
    """Check if openapi.json changed (excluding version field) since the last version tag.

    Version field changes every commit due to setuptools-scm dev versions,
    so we only care about actual API changes.
    """
    from pathlib import Path

    openapi_path = Path(__file__).parent.parent / "generated" / "openapi.json"

    if not tag:
        # No tag exists, check if openapi.json exists in repo
        result = subprocess.run(
            ["git", "ls-files", "generated/openapi.json"],
            capture_output=True,
            text=True,
        )
        return bool(result.stdout.strip())

    # Get openapi.json content at the tag
    result = subprocess.run(
        ["git", "show", f"{tag}:generated/openapi.json"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        # File didn't exist at tag
        return True

    try:
        old_json = json.loads(result.stdout)
        new_json = json.loads(openapi_path.read_text())

        # Remove version field from both for comparison
        old_json.get("info", {}).pop("version", None)
        new_json.get("info", {}).pop("version", None)

        # Compare everything else
        return old_json != new_json
    except (json.JSONDecodeError, FileNotFoundError):
        # If we can't parse, assume changed
        return True


def main():
    parser = argparse.ArgumentParser(
        description="Analyze API commits and determine version bump based on conventional commits"
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Output JSON analysis",
    )
    args = parser.parse_args()

    tag, current_version = get_latest_version_tag()

    # Only get commits that touched openapi.json (API changes)
    api_commits = get_api_commits_since_tag(tag)
    bump_type = analyze_commits(api_commits)
    new_version = bump_version(current_version, bump_type)

    # Publish if: openapi changed AND those commits have feat:/fix: prefix
    openapi_changed = openapi_changed_since_tag(tag)
    should_publish = openapi_changed and bump_type != "none"

    result = {
        "current_version": current_version,
        "current_tag": tag,
        "new_version": new_version,
        "new_tag": f"v{new_version}",
        "bump_type": bump_type,
        "should_publish": should_publish,
        "openapi_changed": openapi_changed,
        "api_commits_analyzed": len(api_commits),
        "api_commits": api_commits[:10],  # Include first 10 for debugging
    }

    if args.check_only:
        print(json.dumps(result))
    else:
        # Print human-readable summary
        print(f"Current version: {current_version} ({tag or 'no tag'})")
        print(f"API commits since tag: {len(api_commits)}")
        if api_commits:
            print(f"  Recent: {api_commits[0][:60]}...")
        print(f"Bump type: {bump_type}")
        print(f"New version: {new_version}")
        print(f"OpenAPI changed: {openapi_changed}")
        print(f"Should publish: {should_publish}")


if __name__ == "__main__":
    main()
