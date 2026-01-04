#!/usr/bin/env python3
"""
List all GitHub issues in the repository
"""

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
        "User-Agent": "NivoStack-Issue-List"
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

def list_all_issues(token, state="all"):
    """List all issues in the repository."""
    repo = "iplixera/nivostack-monorepo"
    url = f"https://api.github.com/repos/{repo}/issues?state={state}&per_page=100"
    
    all_issues = []
    page = 1
    
    while True:
        page_url = f"{url}&page={page}"
        try:
            issues = make_api_request("GET", page_url, token)
            if not issues or len(issues) == 0:
                break
            
            # Filter out pull requests (they have pull_request field)
            issues_only = [i for i in issues if "pull_request" not in i]
            all_issues.extend(issues_only)
            
            if len(issues) < 100:
                break
            
            page += 1
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
    
    return all_issues

def main():
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found. Set GITHUB_TOKEN environment variable or add to ~/.devbridge_tokens")
        return
    
    print("🔍 Fetching all issues...\n")
    
    open_issues = list_all_issues(token, "open")
    closed_issues = list_all_issues(token, "closed")
    
    print(f"📋 Found {len(open_issues)} open issues and {len(closed_issues)} closed issues\n")
    
    # Filter for optimization-related issues
    optimization_keywords = [
        "optimization", "optimize", "performance", "cleanup", "clean up",
        "memo", "useCallback", "useMemo", "refactor", "UI", "component"
    ]
    
    optimization_issues = []
    for issue in open_issues + closed_issues:
        title_lower = issue["title"].lower()
        body_lower = (issue.get("body") or "").lower()
        
        if any(keyword in title_lower or keyword in body_lower for keyword in optimization_keywords):
            optimization_issues.append(issue)
    
    if optimization_issues:
        print(f"🎯 Found {len(optimization_issues)} optimization-related issues:\n")
        for issue in optimization_issues:
            state_icon = "✅" if issue["state"] == "closed" else "🔄"
            labels = ", ".join([l["name"] for l in issue.get("labels", [])])
            print(f"{state_icon} #{issue['number']}: {issue['title']}")
            print(f"   State: {issue['state']}")
            print(f"   Labels: {labels}")
            print(f"   URL: {issue['html_url']}\n")
    else:
        print("❌ No optimization-related issues found.\n")
        print("📝 Open Issues:")
        for issue in open_issues[:10]:
            labels = ", ".join([l["name"] for l in issue.get("labels", [])])
            print(f"  #{issue['number']}: {issue['title']}")
            print(f"    Labels: {labels}")
            print(f"    URL: {issue['html_url']}\n")

if __name__ == "__main__":
    main()

