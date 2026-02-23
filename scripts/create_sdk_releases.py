#!/usr/bin/env python3
"""
Create GitHub releases for all SDK repos.

This triggers the CI/CD workflows in each SDK repo to publish packages
to their respective registries (npm, PyPI, Maven, etc.).

Usage:
    cd backend && uv run python ../scripts/create_sdk_releases.py
    cd backend && uv run python ../scripts/create_sdk_releases.py --lang python
    cd backend && uv run python ../scripts/create_sdk_releases.py --notes-file ../release_notes.md
    cd backend && uv run python ../scripts/create_sdk_releases.py --dry-run
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
OPENAPI_SPEC = PROJECT_ROOT / "generated" / "openapi.json"

# GitHub organization
GITHUB_ORG = "YourOrg"

# SDK repositories
REPOS = {
    "typescript": "typescriptsdk",
    "python": "pythonsdk",
    "java": "javasdk",
    "go": "gosdk",
    "php": "phpsdk",
    "ruby": "rubysdk",
    "csharp": "csharpsdk",
}


def get_api_version() -> str:
    """Get the API version from the OpenAPI spec."""
    try:
        with open(OPENAPI_SPEC) as f:
            spec = json.load(f)
            return spec.get("info", {}).get("version", "unknown")
    except Exception as e:
        print(f"ERROR: Could not read OpenAPI spec: {e}")
        sys.exit(1)


def check_prerequisites() -> bool:
    """Check if GitHub CLI is installed and authenticated."""
    try:
        result = subprocess.run(
            ["gh", "auth", "status"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("ERROR: GitHub CLI not authenticated.")
            print("Run: gh auth login")
            return False
        return True
    except FileNotFoundError:
        print("ERROR: GitHub CLI (gh) not found.")
        print("Install with: brew install gh")
        return False


def release_exists(repo: str, tag: str) -> bool:
    """Check if a release already exists for the given tag."""
    result = subprocess.run(
        ["gh", "release", "view", tag, "-R", f"{GITHUB_ORG}/{repo}"],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def get_default_notes(version: str) -> str:
    """Get default release notes when no custom notes are provided."""
    return f"Synced with YourApp API {version}\n\nThis release was automatically generated."


def create_release(
    repo: str, tag: str, version: str, notes: str, dry_run: bool = False
) -> bool:
    """Create a GitHub release for the given repo."""
    full_repo = f"{GITHUB_ORG}/{repo}"

    if release_exists(repo, tag):
        print(f"  {repo}: Release {tag} already exists, skipping")
        return True

    if dry_run:
        print(f"  {repo}: Would create release {tag}")
        return True

    result = subprocess.run(
        [
            "gh",
            "release",
            "create",
            tag,
            "-R",
            full_repo,
            "--title",
            tag,
            "--notes",
            notes,
            "--latest",
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        print(f"  {repo}: Created release {tag}")
        return True
    else:
        print(f"  {repo}: ERROR - {result.stderr.strip()}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Create GitHub releases for SDK repositories",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    Create releases for all SDKs:
        uv run python ../scripts/create_sdk_releases.py

    Create release for specific language:
        uv run python ../scripts/create_sdk_releases.py --lang python

    Dry run (show what would happen):
        uv run python ../scripts/create_sdk_releases.py --dry-run
        """,
    )

    parser.add_argument(
        "--lang",
        nargs="+",
        choices=list(REPOS.keys()),
        help="Languages to create releases for (default: all)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )

    parser.add_argument(
        "--notes-file",
        type=str,
        help="Path to file containing release notes (default: auto-generated message)",
    )

    args = parser.parse_args()

    # Get version
    version = get_api_version()
    tag = f"v{version}"

    print(f"Creating SDK releases for {tag}")
    print(f"Organization: {GITHUB_ORG}")
    if args.dry_run:
        print("Mode: DRY RUN")
    print()

    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)

    # Load release notes
    if args.notes_file:
        try:
            notes = Path(args.notes_file).read_text()
            print(f"Using release notes from: {args.notes_file}")
        except FileNotFoundError:
            print(f"WARNING: Notes file not found: {args.notes_file}, using default")
            notes = get_default_notes(version)
    else:
        notes = get_default_notes(version)

    # Determine which languages to release
    languages = args.lang if args.lang else list(REPOS.keys())

    # Create releases
    results = {}
    for lang in languages:
        repo = REPOS[lang]
        results[lang] = create_release(repo, tag, version, notes, args.dry_run)

    # Print summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)

    success_count = sum(1 for success in results.values() if success)
    for lang, success in results.items():
        status = "OK" if success else "FAILED"
        repo_url = f"https://github.com/{GITHUB_ORG}/{REPOS[lang]}/releases/tag/{tag}"
        print(f"  {lang:12} : {status:6} - {repo_url}")

    print()
    print(f"Released: {success_count}/{len(languages)} SDKs")

    if success_count < len(languages):
        sys.exit(1)


if __name__ == "__main__":
    main()
