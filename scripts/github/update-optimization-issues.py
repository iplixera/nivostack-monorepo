#!/usr/bin/env python3
"""
Update GitHub Issues for UI Optimization Work

This script searches for issues related to UI optimization, performance, and code cleanup,
and updates their status based on completion.
"""

import sys
import os
import json
import urllib.request
import urllib.parse
from pathlib import Path

def get_github_token():
    """Get GitHub token from environment or config file."""
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    
    tokens_file = Path.home() / ".devbridge_tokens"
    if tokens_file.exists():
        try:
            with open(tokens_file, 'r') as f:
                for line in f:
                    if line.startswith("GITHUB_TOKEN="):
                        token = line.split("=", 1)[1].strip().strip('"\'')
                        if token and token != "ghp_your_token_here":
                            return token
        except Exception:
            pass
    
    return None

def make_api_request(method, url, token, data=None):
    """Make a GitHub API request."""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "NivoStack-Issue-Updater"
    }
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    request = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(request) as response:
            status_code = response.getcode()
            if status_code == 401:
                raise Exception("❌ Authentication failed. Check your GitHub token.")
            if status_code == 404:
                return None
            if status_code >= 400:
                error_body = response.read().decode('utf-8')
                raise Exception(f"❌ API request failed: {status_code} - {error_body}")
            
            response_body = response.read().decode('utf-8')
            return json.loads(response_body) if response_body else None
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise Exception("❌ Authentication failed. Check your GitHub token.")
        if e.code == 404:
            return None
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def search_issues(token, query, state="all"):
    """Search for GitHub issues."""
    repo = "iplixera/nivostack-monorepo"
    # URL encode the query
    encoded_query = urllib.parse.quote(query)
    encoded_repo = urllib.parse.quote(repo)
    url = f"https://api.github.com/search/issues?q=repo:{encoded_repo}+{encoded_query}+state:{state}"
    
    try:
        results = make_api_request("GET", url, token)
        return results.get("items", []) if results else []
    except Exception as e:
        print(f"Error searching issues: {e}")
        return []

def get_issue_labels(issue):
    """Get label names from an issue."""
    return [label["name"] for label in issue.get("labels", [])]

def update_issue_status(token, issue_number, status, comment=None):
    """Update GitHub issue status."""
    repo = "iplixera/nivostack-monorepo"
    issue_url = f"https://api.github.com/repos/{repo}/issues/{issue_number}"
    comments_url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/comments"
    
    # Add comment if provided
    if comment:
        make_api_request("POST", comments_url, token, {"body": comment})
    
    # Update issue state
    if status == "closed":
        make_api_request("PATCH", issue_url, token, {"state": "closed"})
        print(f"✅ Issue #{issue_number} closed")
    elif status == "open":
        make_api_request("PATCH", issue_url, token, {"state": "open"})
        print(f"✅ Issue #{issue_number} reopened")

def add_label(token, issue_number, label):
    """Add a label to an issue."""
    repo = "iplixera/nivostack-monorepo"
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/labels"
    
    try:
        make_api_request("POST", url, token, [label])
        print(f"✅ Added label '{label}' to issue #{issue_number}")
    except Exception as e:
        print(f"⚠️  Could not add label '{label}' to issue #{issue_number}: {e}")

def main():
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found. Set GITHUB_TOKEN environment variable or add to ~/.devbridge_tokens")
        sys.exit(1)
    
    print("🔍 Searching for UI optimization and performance issues...\n")
    
    # Search for issues related to optimization
    queries = [
        "UI optimization",
        "performance optimization",
        "code cleanup",
        "component optimization",
        "React optimization",
        "useCallback",
        "useMemo",
        "memoization"
    ]
    
    all_issues = []
    seen_issues = set()
    
    for query in queries:
        issues = search_issues(token, query)
        for issue in issues:
            if issue["number"] not in seen_issues:
                seen_issues.add(issue["number"])
                all_issues.append(issue)
    
    if not all_issues:
        print("❌ No issues found matching the search criteria.")
        print("\n💡 You may need to create issues for:")
        print("  - UI Performance Optimization")
        print("  - Code Cleanup and Refactoring")
        print("  - Component Memoization")
        print("  - API Call Optimization")
        return
    
    print(f"📋 Found {len(all_issues)} issues:\n")
    
    # Group issues by status
    open_issues = [i for i in all_issues if i["state"] == "open"]
    closed_issues = [i for i in all_issues if i["state"] == "closed"]
    
    print(f"  Open: {len(open_issues)}")
    print(f"  Closed: {len(closed_issues)}\n")
    
    # Show open issues
    if open_issues:
        print("📝 Open Issues:")
        for issue in open_issues[:10]:  # Show first 10
            labels = ", ".join(get_issue_labels(issue))
            print(f"  #{issue['number']}: {issue['title']}")
            print(f"    Labels: {labels}")
            print(f"    URL: {issue['html_url']}\n")
    
    # Ask user what to do
    print("\n" + "="*60)
    print("What would you like to do?")
    print("1. Mark all open optimization issues as 'in progress'")
    print("2. Close completed optimization issues")
    print("3. Show all issues (no changes)")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    if choice == "1":
        print("\n🔄 Marking issues as in progress...\n")
        for issue in open_issues:
            comment = "🔄 **Status: In Progress**\n\n" \
                     "UI optimization work has started. Applying performance optimizations " \
                     "including React.memo, useCallback, useMemo, and code cleanup across all pages."
            update_issue_status(token, issue["number"], "open", comment)
            add_label(token, issue["number"], "in progress")
    
    elif choice == "2":
        print("\n✅ Closing completed issues...\n")
        for issue in open_issues:
            comment = "✅ **Status: Complete**\n\n" \
                     "All UI optimization work has been completed:\n" \
                     "- ✅ Applied React.memo to reusable components\n" \
                     "- ✅ Wrapped all API functions in useCallback\n" \
                     "- ✅ Memoized all computed values with useMemo\n" \
                     "- ✅ Removed duplicate API calls\n" \
                     "- ✅ Cleaned up unused imports\n" \
                     "- ✅ Extracted duplicate code into constants\n" \
                     "- ✅ Optimized all 40 pages\n\n" \
                     "All optimizations are complete and ready for testing."
            update_issue_status(token, issue["number"], "closed", comment)
    
    elif choice == "3":
        print("\n📋 All Issues:")
        for issue in all_issues:
            state_icon = "✅" if issue["state"] == "closed" else "🔄"
            labels = ", ".join(get_issue_labels(issue))
            print(f"{state_icon} #{issue['number']}: {issue['title']}")
            print(f"   Labels: {labels}")
            print(f"   URL: {issue['html_url']}\n")
    
    elif choice == "4":
        print("👋 Exiting...")
        return
    
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()

