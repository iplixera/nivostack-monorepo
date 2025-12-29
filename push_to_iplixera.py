#!/usr/bin/env python3
import subprocess
import sys
import os
from datetime import datetime

os.chdir('/Users/karim-f/Code/devbridge')

def run_cmd(cmd, description):
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    print(f"Command: {cmd}")
    print("-" * 60)
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=False)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        print(f"Exit code: {result.returncode}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error: {e}")
        return False

print("Starting push process...")
print(f"Working directory: {os.getcwd()}")

# Step 1: Backup
timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup_branch = f"backup-before-clean-{timestamp}"
backup_tag = f"backup-{timestamp}"

run_cmd(f"git branch {backup_branch}", "Creating backup branch")
run_cmd(f"git tag {backup_tag}", "Creating backup tag")

# Step 2: Clean branch
run_cmd("git checkout main", "Switching to main")
run_cmd("git checkout --orphan clean-main", "Creating orphan branch")
run_cmd("git rm -rf .", "Clearing files")
run_cmd("git add -A", "Staging files")

# Step 3: Commit
commit_msg = """Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects"""

run_cmd(
    f'git commit -m "{commit_msg}" --author="iplixera <iplixera@iplixera.com>"',
    "Creating commit"
)

# Step 4: Push
success = run_cmd("git push iplixera clean-main:main --force", "Pushing to repository")

if success:
    print("\n" + "="*60)
    print("✅ SUCCESS! Repository pushed!")
    print(f"📋 https://github.com/iplixera/nivostack-monorepo")
    print(f"📋 Backup: {backup_branch}")
    print("="*60)
else:
    print("\n" + "="*60)
    print("❌ Push may have failed. Check output above.")
    print("="*60)
    sys.exit(1)

