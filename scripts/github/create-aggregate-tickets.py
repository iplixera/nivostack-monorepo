#!/usr/bin/env python3
"""
Create GitHub Issues from CSV for Aggregate Tickets

This script reads the CSV file and creates GitHub issues one-by-one,
then adds them to the GitHub project board.
"""

import csv
import json
import sys
import os
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

# Configuration
# Default CSV file, can be overridden via command line argument
CSV_FILE = "docs/ui-ux/NivoStack_Consolidated_Tickets_UIUX_Aggregation_v1.csv"
REPO_OWNER = "iplixera"
REPO_NAME = "nivostack-monorepo"
PROJECT_NUMBER = 3  # GitHub project number
GITHUB_API_BASE = "https://api.github.com"

def get_github_token():
    """Get GitHub token from environment variable or config file."""
    # Check environment variable first
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    
    # Check ~/.devbridge_tokens file
    tokens_file = Path.home() / ".devbridge_tokens"
    if tokens_file.exists():
        try:
            with open(tokens_file, 'r') as f:
                for line in f:
                    if line.startswith("GITHUB_TOKEN="):
                        token = line.split("=", 1)[1].strip()
                        token = token.strip('"\'')
                        if token and token != "ghp_your_token_here":
                            return token
        except Exception as e:
            print(f"⚠️  Could not read token file: {e}")
    
    return None

def make_api_request(url, token, method="GET", data=None):
    """Make a GitHub API request."""
    req = Request(url)
    req.add_header("Authorization", f"token {token}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    
    if method == "POST" or method == "PATCH":
        req.add_header("Content-Type", "application/json")
        if data:
            req.data = json.dumps(data).encode('utf-8')
        req.method = method
    
    try:
        with urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode()), response.status
    except HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        return {"error": error_body}, e.code
    except Exception as e:
        return {"error": str(e)}, 0

def get_project_info(token, project_number):
    """Get project info using GraphQL API."""
    graphql_url = "https://api.github.com/graphql"
    
    # Query to get user and their projects
    query = """
    query {
      viewer {
        login
        projectsV2(first: 20) {
          nodes {
            number
            id
            title
          }
        }
      }
    }
    """
    
    data = {
        "query": query
    }
    
    req = Request(graphql_url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(data).encode('utf-8')
    req.method = "POST"
    
    try:
        with urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            if "errors" in result:
                print(f"⚠️  GraphQL errors: {result['errors']}")
                return None, None
            
            viewer = result.get("data", {}).get("viewer", {})
            projects = viewer.get("projectsV2", {}).get("nodes", [])
            
            for project in projects:
                if project.get("number") == project_number:
                    return project.get("id"), viewer.get("login")
            
            print(f"❌ Project #{project_number} not found")
            return None, None
    except Exception as e:
        print(f"⚠️  Failed to get project info: {e}")
        return None, None

def add_issue_to_project(token, project_id, issue_node_id):
    """Add an issue to a project board using GraphQL."""
    graphql_url = "https://api.github.com/graphql"
    
    # GraphQL mutation to add issue to project
    query = """
    mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item {
          id
        }
      }
    }
    """
    
    variables = {
        "projectId": project_id,
        "contentId": issue_node_id
    }
    
    data = {
        "query": query,
        "variables": variables
    }
    
    req = Request(graphql_url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(data).encode('utf-8')
    req.method = "POST"
    
    try:
        with urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            if "errors" in result:
                print(f"   ⚠️  GraphQL errors: {result['errors']}")
                return False
            return True
    except Exception as e:
        print(f"   ⚠️  Failed to add to project: {e}")
        return False

def get_issue_node_id(token, issue_number):
    """Get GraphQL node ID for an issue."""
    graphql_url = "https://api.github.com/graphql"
    
    query = """
    query GetIssueNodeId($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          id
        }
      }
    }
    """
    
    variables = {
        "owner": REPO_OWNER,
        "repo": REPO_NAME,
        "number": issue_number
    }
    
    data = {
        "query": query,
        "variables": variables
    }
    
    req = Request(graphql_url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(data).encode('utf-8')
    req.method = "POST"
    
    try:
        with urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            if "errors" in result:
                return None
            
            repository = result.get("data", {}).get("repository", {})
            issue = repository.get("issue", {})
            return issue.get("id")
    except Exception:
        return None

def create_issue(token, title, body, labels):
    """Create a GitHub issue and return the issue number and node ID."""
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    
    # Parse labels (comma-separated string)
    label_list = [l.strip() for l in labels.split(",") if l.strip()]
    
    data = {
        "title": title,
        "body": body,
        "labels": label_list
    }
    
    response, status = make_api_request(url, token, method="POST", data=data)
    
    if status == 201:
        issue_number = response.get("number")
        issue_url = response.get("html_url")
        print(f"✅ Created issue #{issue_number}: {title}")
        print(f"   URL: {issue_url}")
        
        # Get GraphQL node ID for the issue
        issue_node_id = get_issue_node_id(token, issue_number)
        return issue_number, issue_node_id
    else:
        print(f"❌ Failed to create issue: {status}")
        if "error" in response:
            print(f"   Error: {response.get('error', 'Unknown error')}")
        return None, None

def parse_csv(csv_file):
    """Parse the CSV file and return list of tickets."""
    csv_path = Path(csv_file)
    if not csv_path.exists():
        print(f"❌ CSV file not found: {CSV_FILE}")
        return []
    
    tickets = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            tickets.append({
                'title': row.get('Title', '').strip(),
                'body': row.get('Body', '').strip(),
                'labels': row.get('Labels', '').strip()
            })
    
    return tickets

def main():
    """Main function."""
    # Allow CSV file to be specified via command line
    csv_file = sys.argv[1] if len(sys.argv) > 1 else CSV_FILE
    
    print("🚀 Creating GitHub Issues from CSV")
    print("=" * 50)
    print(f"CSV File: {csv_file}")
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Project: #{PROJECT_NUMBER}")
    print()
    
    # Get token
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found")
        print("\nPlease set GITHUB_TOKEN environment variable or add to ~/.devbridge_tokens")
        sys.exit(1)
    
    # Parse CSV
    tickets = parse_csv(csv_file)
    if not tickets:
        print("❌ No tickets found in CSV")
        sys.exit(1)
    
    print(f"📋 Found {len(tickets)} tickets to create")
    print()
    
    # Get project ID
    print("🔍 Getting project ID...")
    project_id, user_login = get_project_info(token, PROJECT_NUMBER)
    if not project_id:
        print("⚠️  Could not get project ID. Issues will be created but not added to project.")
        print("   You can manually add them to the project board later.")
        project_id = None
    else:
        print(f"✅ Project ID: {project_id}")
        print(f"✅ User: {user_login}")
    print()
    
    # Create issues one by one
    created_issues = []
    failed_issues = []
    
    for i, ticket in enumerate(tickets, 1):
        title = ticket['title']
        body = ticket['body']
        labels = ticket['labels']
        
        if not title:
            print(f"⚠️  Skipping ticket {i}: No title")
            continue
        
        print(f"[{i}/{len(tickets)}] Creating: {title}")
        
        # Create issue
        issue_number, issue_node_id = create_issue(token, title, body, labels)
        
        if issue_number:
            created_issues.append({
                'number': issue_number,
                'node_id': issue_node_id,
                'title': title
            })
            
            # Add to project if we have project ID and node ID
            if project_id and issue_node_id:
                print(f"   Adding to project board...")
                if add_issue_to_project(token, project_id, issue_node_id):
                    print(f"   ✅ Added to project board")
                else:
                    print(f"   ⚠️  Could not add to project board (you can add manually)")
            
            # Rate limiting: wait 1 second between requests
            time.sleep(1)
        else:
            failed_issues.append(title)
        
        print()
    
    # Summary
    print("=" * 50)
    print("📊 Summary")
    print(f"✅ Created: {len(created_issues)} issues")
    print(f"❌ Failed: {len(failed_issues)} issues")
    print()
    
    if created_issues:
        print("Created Issues:")
        for issue in created_issues:
            print(f"  #{issue['number']}: {issue['title']}")
            print(f"    https://github.com/{REPO_OWNER}/{REPO_NAME}/issues/{issue['number']}")
    
    if failed_issues:
        print("\nFailed Issues:")
        for title in failed_issues:
            print(f"  - {title}")

if __name__ == "__main__":
    main()

