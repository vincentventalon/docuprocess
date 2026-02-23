#!/usr/bin/env python3
"""
Publish generated SDKs to their respective GitHub repositories.

Usage:
    cd backend && uv run python ../scripts/publish_sdks.py
    cd backend && uv run python ../scripts/publish_sdks.py --lang python
    cd backend && uv run python ../scripts/publish_sdks.py --dry-run

Prerequisites:
    - GitHub CLI installed and authenticated: gh auth login
    - SDKs generated: uv run python ../scripts/generate_sdks.py

This script:
1. For each language:
   - Clones/pulls the target repo from YourOrg organization
   - Copies generated SDK files (excluding .git)
   - Analyzes changes to generate meaningful commit message
   - Commits and pushes to GitHub
2. GitHub Actions in each repo handles testing + publishing
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
GENERATED_DIR = PROJECT_ROOT / "generated"
SDKS_DIR = GENERATED_DIR / "sdks"
OPENAPI_SPEC = GENERATED_DIR / "openapi.json"
SDK_WORKFLOWS_DIR = Path(__file__).parent / "sdk_workflows"

# GitHub organization - UPDATE THIS
GITHUB_ORG = "YourOrg"


@dataclass
class RepoConfig:
    """Configuration for an SDK repository."""

    name: str
    repo_name: str
    display_name: str


# Repository configurations
# Repo URLs: https://github.com/YourOrg/{lang}sdk
REPOS: dict[str, RepoConfig] = {
    "typescript": RepoConfig(
        name="typescript",
        repo_name="typescriptsdk",
        display_name="TypeScript",
    ),
    "python": RepoConfig(
        name="python",
        repo_name="pythonsdk",
        display_name="Python",
    ),
    "java": RepoConfig(
        name="java",
        repo_name="javasdk",
        display_name="Java",
    ),
    "go": RepoConfig(
        name="go",
        repo_name="gosdk",
        display_name="Go",
    ),
    "php": RepoConfig(
        name="php",
        repo_name="phpsdk",
        display_name="PHP",
    ),
    "ruby": RepoConfig(
        name="ruby",
        repo_name="rubysdk",
        display_name="Ruby",
    ),
    "csharp": RepoConfig(
        name="csharp",
        repo_name="csharpsdk",
        display_name="C#",
    ),
}


def get_api_version() -> str:
    """Get the API version from the OpenAPI spec."""
    try:
        with open(OPENAPI_SPEC) as f:
            spec = json.load(f)
            return spec.get("info", {}).get("version", "unknown")
    except Exception:
        return "unknown"


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


def check_repo_exists(repo_name: str) -> bool:
    """Check if the repository exists on GitHub."""
    result = subprocess.run(
        ["gh", "repo", "view", f"{GITHUB_ORG}/{repo_name}"],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def create_repo(repo_name: str, display_name: str) -> bool:
    """Create a new repository on GitHub."""
    print(f"  Creating repository {GITHUB_ORG}/{repo_name}...")
    result = subprocess.run(
        [
            "gh",
            "repo",
            "create",
            f"{GITHUB_ORG}/{repo_name}",
            "--public",
            "--description",
            f"Official {display_name} SDK",
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ERROR: Failed to create repository: {result.stderr}")
        return False
    print(f"  Repository created successfully")
    return True


def get_authenticated_url(repo_name: str) -> str:
    """Get repository URL with token authentication if GH_TOKEN is set."""
    import os
    token = os.environ.get("GH_TOKEN")
    if token:
        return f"https://x-access-token:{token}@github.com/{GITHUB_ORG}/{repo_name}.git"
    return f"https://github.com/{GITHUB_ORG}/{repo_name}.git"


def clone_repo(repo_name: str, target_dir: Path) -> bool:
    """Clone or pull the repository."""
    repo_url = get_authenticated_url(repo_name)

    if target_dir.exists():
        print(f"  Pulling latest from {repo_name}...")
        # Update remote URL in case token changed
        subprocess.run(
            ["git", "remote", "set-url", "origin", repo_url],
            capture_output=True,
            cwd=target_dir,
        )
        result = subprocess.run(
            ["git", "pull", "--ff-only"],
            capture_output=True,
            text=True,
            cwd=target_dir,
        )
        if result.returncode != 0:
            # Repository might be empty or have conflicts, just continue
            print(f"  Note: Could not pull (possibly empty repo)")
        return True
    else:
        print(f"  Cloning {repo_name}...")
        result = subprocess.run(
            ["git", "clone", repo_url, str(target_dir)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            # If repo is empty, initialize it
            if "empty" in result.stderr.lower() or result.returncode == 128:
                print(f"  Repository is empty, initializing...")
                target_dir.mkdir(parents=True, exist_ok=True)
                subprocess.run(["git", "init"], cwd=target_dir, capture_output=True)
                subprocess.run(
                    ["git", "remote", "add", "origin", repo_url],
                    cwd=target_dir,
                    capture_output=True,
                )
                return True
            print(f"  ERROR: Failed to clone: {result.stderr}")
            return False
        return True


def copy_sdk_files(sdk_dir: Path, repo_dir: Path) -> None:
    """Copy SDK files to the repository, preserving .git and workflows."""
    # Preserve .git directory
    git_dir = repo_dir / ".git"
    git_backup = None
    if git_dir.exists():
        git_backup = tempfile.mkdtemp()
        shutil.move(str(git_dir), git_backup)

    # Preserve .github directory (CI workflows)
    github_dir = repo_dir / ".github"
    github_backup = None
    if github_dir.exists():
        github_backup = tempfile.mkdtemp()
        shutil.move(str(github_dir), github_backup)

    # Clear the repo directory (except .git and .github which we backed up)
    for item in repo_dir.iterdir():
        if item.name in (".git", ".github"):
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()

    # Files/folders to exclude from publishing (generated but not useful for SDK users)
    # Note: .github is excluded because we preserve the existing CI/CD workflows from the repo
    exclude_from_publish = {
        ".git",
        ".github",
        ".openapi-generator",
        ".openapi-generator-ignore",
        "docs",
        "api",  # Contains openapi.yaml copy - not needed
        "git_push.sh",  # Boilerplate script we don't need
        ".travis.yml",  # We use GitHub Actions, not Travis
        ".gitlab-ci.yml",  # We use GitHub Actions, not GitLab CI
        "appveyor.yml",  # We use GitHub Actions, not AppVeyor
    }

    # Copy new SDK files
    for item in sdk_dir.iterdir():
        if item.name in exclude_from_publish:
            continue
        dest = repo_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)

    # Restore .git directory
    if git_backup:
        shutil.move(Path(git_backup) / ".git", str(git_dir))
        shutil.rmtree(git_backup, ignore_errors=True)

    # Restore .github directory
    if github_backup:
        shutil.move(Path(github_backup) / ".github", str(github_dir))
        shutil.rmtree(github_backup, ignore_errors=True)


def copy_workflow_files(lang: str, repo_dir: Path) -> bool:
    """Copy CI/CD workflow files to the repository's .github/workflows/ directory.

    Returns True if workflow files were copied, False otherwise.
    """
    workflow_src = SDK_WORKFLOWS_DIR / lang
    if not workflow_src.exists():
        return False

    workflows_dst = repo_dir / ".github" / "workflows"
    workflows_dst.mkdir(parents=True, exist_ok=True)

    copied = False
    for workflow_file in workflow_src.glob("*.yml"):
        dst = workflows_dst / workflow_file.name
        shutil.copy2(workflow_file, dst)
        print(f"  Copied workflow: {workflow_file.name}")
        copied = True

    return copied


def get_diff_summary(repo_dir: Path) -> tuple[list[str], list[str], list[str]]:
    """Get lists of added, modified, and deleted files."""
    added = []
    modified = []
    deleted = []

    # Get status
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=repo_dir,
    )

    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        status = line[:2]
        filepath = line[3:].strip()

        if status in ["A ", "??", " A"]:
            added.append(filepath)
        elif status in ["M ", " M", "MM"]:
            modified.append(filepath)
        elif status in ["D ", " D"]:
            deleted.append(filepath)
        elif status == "R ":
            # Renamed
            parts = filepath.split(" -> ")
            if len(parts) == 2:
                deleted.append(parts[0])
                added.append(parts[1])

    return added, modified, deleted


def describe_file(filepath: str) -> str:
    """Generate a human-readable description of a file."""
    # Extract meaningful parts from filepath
    parts = Path(filepath).parts
    filename = Path(filepath).stem

    # Common patterns
    if "api" in filepath.lower():
        # Try to extract API name
        match = re.search(r"(\w+)Api", filepath)
        if match:
            return f"{match.group(1)} API client"
        return "API client"
    elif "model" in filepath.lower():
        # Model file
        return f"{filename} model"
    elif filepath.endswith(".md"):
        return f"{filename} documentation"
    elif "test" in filepath.lower():
        return f"{filename} tests"
    elif filepath in ["package.json", "composer.json", "pom.xml", "go.mod", "Gemfile"]:
        return "package configuration"
    elif filepath.endswith(".yaml") or filepath.endswith(".yml"):
        return f"{filename} configuration"
    else:
        return filename


def generate_commit_message(
    added: list[str], modified: list[str], deleted: list[str], api_version: str
) -> str:
    """Generate a professional commit message based on changes."""

    # Determine change type and summary
    if not added and not modified and not deleted:
        return f"chore: sync with API spec v{api_version}\n\nNo functional changes.\n\nGenerated from OpenAPI spec v{api_version}"

    # Analyze what changed
    has_api_changes = any("api" in f.lower() for f in added + modified)
    has_model_changes = any("model" in f.lower() for f in added + modified)
    has_config_changes = any(
        f.endswith((".json", ".yaml", ".yml", ".xml", ".toml")) for f in modified
    )

    # Determine commit type
    if added and not modified and not deleted:
        if has_api_changes:
            commit_type = "feat"
            summary = "add new API endpoints"
        elif has_model_changes:
            commit_type = "feat"
            summary = "add new data models"
        else:
            commit_type = "feat"
            summary = "add new SDK components"
    elif deleted and not added:
        commit_type = "refactor"
        summary = "remove deprecated components"
    elif has_api_changes:
        commit_type = "feat"
        summary = "update API client methods"
    elif has_model_changes:
        commit_type = "fix"
        summary = "update data models"
    elif has_config_changes:
        commit_type = "chore"
        summary = "update configuration"
    else:
        commit_type = "chore"
        summary = "sync with latest API specification"

    # Build detailed description
    details = []

    # Group changes by type
    api_files = [f for f in added + modified if "api" in f.lower()]
    model_files = [f for f in added + modified if "model" in f.lower()]
    other_files = [
        f for f in added + modified if f not in api_files and f not in model_files
    ]

    if api_files:
        details.append("API changes:")
        for f in api_files[:5]:  # Limit to 5 files
            action = "Add" if f in added else "Update"
            details.append(f"  - {action} {describe_file(f)}")
        if len(api_files) > 5:
            details.append(f"  - ... and {len(api_files) - 5} more API files")

    if model_files:
        details.append("Model changes:")
        for f in model_files[:5]:
            action = "Add" if f in added else "Update"
            details.append(f"  - {action} {describe_file(f)}")
        if len(model_files) > 5:
            details.append(f"  - ... and {len(model_files) - 5} more model files")

    if deleted:
        details.append("Removed:")
        for f in deleted[:3]:
            details.append(f"  - Remove {describe_file(f)}")
        if len(deleted) > 3:
            details.append(f"  - ... and {len(deleted) - 3} more files")

    # Build final message
    message = f"{commit_type}: {summary}"

    if details:
        message += "\n\n" + "\n".join(details)

    message += f"\n\nGenerated from OpenAPI spec v{api_version}"

    return message


def publish_sdk(
    lang: str, config: RepoConfig, work_dir: Path, dry_run: bool = False
) -> bool:
    """Publish SDK to its GitHub repository."""
    print(f"\n{'='*60}")
    print(f"Publishing {config.display_name} SDK")
    print(f"{'='*60}")

    sdk_dir = SDKS_DIR / lang
    if not sdk_dir.exists():
        print(f"  ERROR: SDK not found at {sdk_dir}")
        print("  Run 'uv run python ../scripts/generate_sdks.py' first")
        return False

    # Check if repo exists, create if not
    if not check_repo_exists(config.repo_name):
        print(f"  Repository {GITHUB_ORG}/{config.repo_name} does not exist")
        if dry_run:
            print("  [DRY RUN] Would create repository")
        else:
            if not create_repo(config.repo_name, config.display_name):
                return False

    # Clone/pull repo
    repo_dir = work_dir / config.repo_name
    if not clone_repo(config.repo_name, repo_dir):
        return False

    # Copy SDK files
    print(f"  Copying SDK files...")
    copy_sdk_files(sdk_dir, repo_dir)

    # Copy CI/CD workflow files
    copy_workflow_files(lang, repo_dir)

    # Check for changes
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=repo_dir,
    )

    if not result.stdout.strip():
        print(f"  No changes detected, skipping")
        return True

    # Get diff summary
    added, modified, deleted = get_diff_summary(repo_dir)
    total_changes = len(added) + len(modified) + len(deleted)
    print(f"  Changes: {len(added)} added, {len(modified)} modified, {len(deleted)} deleted")

    # Generate commit message
    api_version = get_api_version()
    commit_message = generate_commit_message(added, modified, deleted, api_version)

    print(f"\n  Commit message:")
    print("  " + "-" * 50)
    for line in commit_message.split("\n"):
        print(f"  {line}")
    print("  " + "-" * 50)

    if dry_run:
        print(f"\n  [DRY RUN] Would commit and push {total_changes} changes")
        return True

    # Stage all changes
    subprocess.run(["git", "add", "-A"], cwd=repo_dir, capture_output=True)

    # Commit
    result = subprocess.run(
        ["git", "commit", "-m", commit_message],
        capture_output=True,
        text=True,
        cwd=repo_dir,
    )

    if result.returncode != 0:
        print(f"  ERROR: Commit failed: {result.stderr}")
        return False

    # Push
    print(f"  Pushing to {GITHUB_ORG}/{config.repo_name}...")
    result = subprocess.run(
        ["git", "push", "-u", "origin", "main"],
        capture_output=True,
        text=True,
        cwd=repo_dir,
    )

    # Try 'master' if 'main' fails
    if result.returncode != 0:
        result = subprocess.run(
            ["git", "push", "-u", "origin", "master"],
            capture_output=True,
            text=True,
            cwd=repo_dir,
        )

    # If still failing, try setting upstream
    if result.returncode != 0:
        # Check if we need to set the branch
        subprocess.run(["git", "branch", "-M", "main"], cwd=repo_dir, capture_output=True)
        result = subprocess.run(
            ["git", "push", "-u", "origin", "main"],
            capture_output=True,
            text=True,
            cwd=repo_dir,
        )

    if result.returncode != 0:
        print(f"  ERROR: Push failed: {result.stderr}")
        return False

    print(f"  Published successfully!")
    print(f"  View at: https://github.com/{GITHUB_ORG}/{config.repo_name}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Publish YourApp SDKs to GitHub repositories",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    Publish all SDKs:
        uv run python ../scripts/publish_sdks.py

    Publish specific language:
        uv run python ../scripts/publish_sdks.py --lang python

    Dry run (show what would happen):
        uv run python ../scripts/publish_sdks.py --dry-run

    Publish to custom work directory:
        uv run python ../scripts/publish_sdks.py --work-dir /tmp/sdk-repos
        """,
    )

    parser.add_argument(
        "--lang",
        nargs="+",
        choices=list(REPOS.keys()),
        help="Languages to publish (default: all)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )

    parser.add_argument(
        "--work-dir",
        type=Path,
        help="Directory for cloning repos (default: temp directory)",
    )

    args = parser.parse_args()

    # Determine which languages to publish
    languages = args.lang if args.lang else list(REPOS.keys())

    print("SDK Publisher")
    print(f"Organization: {GITHUB_ORG}")
    print(f"Languages: {', '.join(languages)}")
    if args.dry_run:
        print("Mode: DRY RUN")
    print()

    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)

    # Check SDKs exist
    missing = []
    for lang in languages:
        sdk_dir = SDKS_DIR / lang
        if not sdk_dir.exists():
            missing.append(lang)

    if missing:
        print(f"ERROR: Missing SDKs: {', '.join(missing)}")
        print("Run 'uv run python ../scripts/generate_sdks.py' first")
        sys.exit(1)

    # Create work directory
    if args.work_dir:
        work_dir = args.work_dir
        work_dir.mkdir(parents=True, exist_ok=True)
    else:
        work_dir = Path(tempfile.mkdtemp(prefix="yourapp-sdks-"))

    print(f"Work directory: {work_dir}")

    # Publish SDKs
    results: dict[str, bool] = {}

    for lang in languages:
        config = REPOS[lang]
        results[lang] = publish_sdk(lang, config, work_dir, args.dry_run)

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    success_count = 0
    for lang, success in results.items():
        status = "OK" if success else "FAILED"
        repo_url = f"https://github.com/{GITHUB_ORG}/{REPOS[lang].repo_name}"
        print(f"  {REPOS[lang].display_name:12} : {status:6} - {repo_url}")
        if success:
            success_count += 1

    print()
    print(f"Published: {success_count}/{len(languages)} SDKs")

    if success_count < len(languages):
        sys.exit(1)

    if not args.dry_run:
        print("\nSDKs published successfully!")
        print(f"View organization: https://github.com/{GITHUB_ORG}")


if __name__ == "__main__":
    main()
