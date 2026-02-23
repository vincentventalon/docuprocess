#!/usr/bin/env python3
"""
Publish the n8n community node to its GitHub repository.

Usage:
    cd backend && uv run python ../scripts/publish_n8n.py
    cd backend && uv run python ../scripts/publish_n8n.py --dry-run

Prerequisites:
    - GitHub CLI installed and authenticated: gh auth login

This script:
1. Clones/pulls the target repo from YourOrg organization
2. Copies files from integrations/n8n/ (excluding node_modules, dist)
3. Commits and pushes to GitHub
4. GitHub Actions in the repo handles npm publishing on release
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
N8N_SOURCE_DIR = PROJECT_ROOT / "integrations" / "n8n"
WORKFLOW_SOURCE_DIR = Path(__file__).parent / "n8n_workflows"

# GitHub configuration
GITHUB_ORG = "YourOrg"
REPO_NAME = "n8n-nodes-yourapp"
REPO_URL = f"https://github.com/{GITHUB_ORG}/{REPO_NAME}.git"


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


def check_repo_exists() -> bool:
    """Check if the repository exists on GitHub."""
    result = subprocess.run(
        ["gh", "repo", "view", f"{GITHUB_ORG}/{REPO_NAME}"],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def create_repo() -> bool:
    """Create a new repository on GitHub."""
    print(f"Creating repository {GITHUB_ORG}/{REPO_NAME}...")
    result = subprocess.run(
        [
            "gh",
            "repo",
            "create",
            f"{GITHUB_ORG}/{REPO_NAME}",
            "--public",
            "--description",
            "n8n community node for YourApp PDF generation API",
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"ERROR: Failed to create repository: {result.stderr}")
        return False
    print("Repository created successfully")
    return True


def get_authenticated_url() -> str:
    """Get repository URL with token authentication if GH_TOKEN is set."""
    import os

    token = os.environ.get("GH_TOKEN")
    if token:
        return f"https://x-access-token:{token}@github.com/{GITHUB_ORG}/{REPO_NAME}.git"
    return REPO_URL


def clone_repo(target_dir: Path) -> bool:
    """Clone or pull the repository."""
    repo_url = get_authenticated_url()

    if target_dir.exists():
        print(f"Pulling latest from {REPO_NAME}...")
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
            print("Note: Could not pull (possibly empty repo)")
        return True
    else:
        print(f"Cloning {REPO_NAME}...")
        result = subprocess.run(
            ["git", "clone", repo_url, str(target_dir)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            # If repo is empty, initialize it
            if "empty" in result.stderr.lower() or result.returncode == 128:
                print("Repository is empty, initializing...")
                target_dir.mkdir(parents=True, exist_ok=True)
                subprocess.run(["git", "init"], cwd=target_dir, capture_output=True)
                subprocess.run(
                    ["git", "remote", "add", "origin", repo_url],
                    cwd=target_dir,
                    capture_output=True,
                )
                return True
            print(f"ERROR: Failed to clone: {result.stderr}")
            return False
        return True


def copy_n8n_files(repo_dir: Path) -> None:
    """Copy n8n node files to the repository."""
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

    # Clear the repo directory
    for item in repo_dir.iterdir():
        if item.name in (".git", ".github"):
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()

    # Files/folders to exclude
    exclude_from_publish = {
        ".git",
        ".github",
        "node_modules",
        "dist",
        "pnpm-lock.yaml",
    }

    # Copy n8n files
    for item in N8N_SOURCE_DIR.iterdir():
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


def copy_workflow_files(repo_dir: Path) -> bool:
    """Copy CI/CD workflow files to the repository's .github/workflows/ directory."""
    if not WORKFLOW_SOURCE_DIR.exists():
        return False

    workflows_dst = repo_dir / ".github" / "workflows"
    workflows_dst.mkdir(parents=True, exist_ok=True)

    copied = False
    for workflow_file in WORKFLOW_SOURCE_DIR.glob("*.yml"):
        dst = workflows_dst / workflow_file.name
        shutil.copy2(workflow_file, dst)
        print(f"Copied workflow: {workflow_file.name}")
        copied = True

    return copied


def get_diff_summary(repo_dir: Path) -> tuple[list[str], list[str], list[str]]:
    """Get lists of added, modified, and deleted files."""
    added = []
    modified = []
    deleted = []

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

    return added, modified, deleted


def publish_n8n(work_dir: Path, dry_run: bool = False) -> bool:
    """Publish n8n node to its GitHub repository."""
    print("=" * 60)
    print("Publishing n8n Community Node")
    print("=" * 60)

    if not N8N_SOURCE_DIR.exists():
        print(f"ERROR: n8n source not found at {N8N_SOURCE_DIR}")
        return False

    # Check if repo exists, create if not
    if not check_repo_exists():
        print(f"Repository {GITHUB_ORG}/{REPO_NAME} does not exist")
        if dry_run:
            print("[DRY RUN] Would create repository")
        else:
            if not create_repo():
                return False

    # Clone/pull repo
    repo_dir = work_dir / REPO_NAME
    if not clone_repo(repo_dir):
        return False

    # Copy n8n files
    print("Copying n8n node files...")
    copy_n8n_files(repo_dir)

    # Copy CI/CD workflow files
    copy_workflow_files(repo_dir)

    # Check for changes
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=repo_dir,
    )

    if not result.stdout.strip():
        print("No changes detected, skipping")
        return True

    # Get diff summary
    added, modified, deleted = get_diff_summary(repo_dir)
    total_changes = len(added) + len(modified) + len(deleted)
    print(f"Changes: {len(added)} added, {len(modified)} modified, {len(deleted)} deleted")

    # Generate commit message
    commit_message = "chore: sync n8n node from main repository"

    if dry_run:
        print(f"\n[DRY RUN] Would commit and push {total_changes} changes")
        print(f"Commit message: {commit_message}")
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
        print(f"ERROR: Commit failed: {result.stderr}")
        return False

    # Push
    print(f"Pushing to {GITHUB_ORG}/{REPO_NAME}...")
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
        subprocess.run(["git", "branch", "-M", "main"], cwd=repo_dir, capture_output=True)
        result = subprocess.run(
            ["git", "push", "-u", "origin", "main"],
            capture_output=True,
            text=True,
            cwd=repo_dir,
        )

    if result.returncode != 0:
        print(f"ERROR: Push failed: {result.stderr}")
        return False

    print("Published successfully!")
    print(f"View at: https://github.com/{GITHUB_ORG}/{REPO_NAME}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Publish YourApp n8n community node to GitHub",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    Publish n8n node:
        uv run python ../scripts/publish_n8n.py

    Dry run (show what would happen):
        uv run python ../scripts/publish_n8n.py --dry-run
        """,
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )

    parser.add_argument(
        "--work-dir",
        type=Path,
        help="Directory for cloning repo (default: temp directory)",
    )

    args = parser.parse_args()

    print("YourApp n8n Node Publisher")
    print(f"Repository: {GITHUB_ORG}/{REPO_NAME}")
    if args.dry_run:
        print("Mode: DRY RUN")
    print()

    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)

    # Create work directory
    if args.work_dir:
        work_dir = args.work_dir
        work_dir.mkdir(parents=True, exist_ok=True)
    else:
        work_dir = Path(tempfile.mkdtemp(prefix="yourapp-n8n-"))

    print(f"Work directory: {work_dir}")

    # Publish
    success = publish_n8n(work_dir, args.dry_run)

    if not success:
        sys.exit(1)

    if not args.dry_run:
        print("\n" + "=" * 60)
        print("n8n node published successfully!")
        print(f"Repository: https://github.com/{GITHUB_ORG}/{REPO_NAME}")
        print()
        print("Next steps:")
        print("1. Create a release on GitHub to trigger npm publish")
        print("2. Or publish manually: cd to repo && npm publish --access public")


if __name__ == "__main__":
    main()
