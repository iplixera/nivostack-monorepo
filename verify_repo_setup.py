#!/usr/bin/env python3
"""
Verify new repository and setup branches
"""

import subprocess
import os
import sys

REPO_URL = "https://github.com/iplixera/nivostack-monorepo.git"
CLONE_DIR = "/Users/karim-f/Code/nivostack-monorepo-checkout"

def run_cmd(cmd, description, check=True):
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    print(f"Command: {cmd}")
    print("-" * 60)
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        print(f"Error: {e}")
        return False, "", str(e)

def main():
    print("="*60)
    print("Verifying New Repository and Setting Up Branches")
    print("="*60)
    
    # Step 1: Clone repository
    print("\n📥 Step 1: Cloning repository...")
    if os.path.exists(CLONE_DIR):
        print(f"Removing existing checkout: {CLONE_DIR}")
        run_cmd(f"rm -rf {CLONE_DIR}", "Removing existing directory", check=False)
    
    success, output, error = run_cmd(
        f"git clone {REPO_URL} {CLONE_DIR}",
        "Cloning repository"
    )
    
    if not success:
        print("❌ Failed to clone repository")
        sys.exit(1)
    
    os.chdir(CLONE_DIR)
    print(f"✅ Repository cloned to: {CLONE_DIR}")
    
    # Step 2: Verify repository
    print("\n🔍 Step 2: Verifying repository...")
    success, output, _ = run_cmd("git branch --show-current", "Current branch")
    current_branch = output.strip() if output else "unknown"
    
    success, output, _ = run_cmd("git rev-list --count HEAD", "Commit count")
    commit_count = output.strip() if output else "0"
    
    success, output, _ = run_cmd(
        'git log -1 --pretty=format:"%h - %an <%ae> - %s"',
        "Last commit"
    )
    
    success, output, _ = run_cmd("ls -la | head -15", "Repository structure")
    
    # Step 3: Check remote
    print("\n🌐 Step 3: Remote configuration...")
    run_cmd("git remote -v", "Remote remotes")
    
    # Step 4: Check sync status
    print("\n🔄 Step 4: Checking sync status...")
    run_cmd("git fetch origin", "Fetching from remote", check=False)
    
    success, output, _ = run_cmd("git branch -a", "All branches")
    
    # Step 5: Setup branches
    print("\n🌿 Step 5: Setting up branch strategy...")
    
    # Ensure on main
    run_cmd("git checkout main", "Switching to main", check=False)
    
    # Create develop branch
    success, output, _ = run_cmd("git show-ref --verify --quiet refs/heads/develop", "Check develop", check=False)
    if not success:
        run_cmd("git checkout -b develop", "Creating develop branch")
        print("✅ Created develop branch")
    else:
        run_cmd("git checkout develop", "Switching to develop", check=False)
        print("✅ develop branch already exists")
    
    # Create release branches
    release_branches = ["release/v1.0.0", "release/v1.1.0"]
    for branch in release_branches:
        success, _, _ = run_cmd(f"git show-ref --verify --quiet refs/heads/{branch}", f"Check {branch}", check=False)
        if not success:
            run_cmd(f"git checkout -b {branch} develop", f"Creating {branch}", check=False)
            print(f"✅ Created {branch} branch")
        else:
            print(f"⚠️  {branch} already exists")
    
    # Switch back to main
    run_cmd("git checkout main", "Switching back to main", check=False)
    
    # Step 6: Push branches
    print("\n📤 Step 6: Pushing branches to remote...")
    run_cmd("git push origin main", "Pushing main", check=False)
    run_cmd("git push origin develop", "Pushing develop", check=False)
    for branch in release_branches:
        run_cmd(f"git push origin {branch}", f"Pushing {branch}", check=False)
    
    # Step 7: Final summary
    print("\n" + "="*60)
    print("Summary")
    print("="*60)
    print(f"Repository: {REPO_URL}")
    print(f"Local checkout: {CLONE_DIR}")
    print(f"Current branch: {current_branch}")
    print(f"Total commits: {commit_count}")
    print("\nBranch Strategy:")
    print("  - main: Production-ready code")
    print("  - develop: Development branch")
    print("  - release/v1.0.0: Release branch for v1.0.0")
    print("  - release/v1.1.0: Release branch for v1.1.0")
    print("\n✅ Setup complete!")
    print("="*60)

if __name__ == "__main__":
    main()

