#!/usr/bin/env python3
"""
Update GitHub Project Board Status for Issues

This script moves issues to the "In Progress" column on GitHub Project #3.
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

def make_graphql_request(token, query):
    """Make a GitHub GraphQL API request."""
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    data = json.dumps({"query": query}).encode('utf-8')
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            status_code = response.getcode()
            if status_code == 401:
                raise Exception("❌ Authentication failed. Check your GitHub token.")
            if status_code >= 400:
                error_body = response.read().decode('utf-8')
                raise Exception(f"❌ API request failed: {status_code} - {error_body}")
            
            response_body = response.read().decode('utf-8')
            return json.loads(response_body)
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise Exception("❌ Authentication failed. Check your GitHub token.")
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def get_project_info(token, project_number=3):
    """Get project info and field IDs."""
    query = """
    query {
      viewer {
        login
        projectsV2(first: 20) {
          nodes {
            number
            id
            title
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                }
                ... on ProjectV2IterationField {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    
    result = make_graphql_request(token, query)
    
    if "errors" in result:
        raise Exception(f"❌ GraphQL errors: {result['errors']}")
    
    projects = result["data"]["viewer"]["projectsV2"]["nodes"]
    project = next((p for p in projects if p["number"] == project_number), None)
    
    if not project:
        raise Exception(f"❌ Project #{project_number} not found")
    
    return project

def get_project_columns(token, project_id):
    """Get project columns."""
    query = """
    query GetProjectColumns($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          id
          title
          field(name: "Status") {
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
    """
    
    variables = {"projectId": project_id}
    
    # Use proper GraphQL format
    full_query = json.dumps({"query": query, "variables": variables})
    
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    request = urllib.request.Request(url, data=full_query.encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            if "errors" in result:
                raise Exception(f"❌ GraphQL errors: {result['errors']}")
            return result["data"]["node"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def get_issue_node_id(token, issue_number):
    """Get the node ID for an issue."""
    query = """
    query GetIssueNodeId($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          id
          title
        }
      }
    }
    """
    
    variables = {
        "owner": "iplixera",
        "repo": "nivostack-monorepo",
        "number": issue_number
    }
    
    full_query = json.dumps({"query": query, "variables": variables})
    
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    request = urllib.request.Request(url, data=full_query.encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            if "errors" in result:
                raise Exception(f"❌ GraphQL errors: {result['errors']}")
            
            issue = result["data"]["repository"]["issue"]
            if not issue:
                raise Exception(f"❌ Issue #{issue_number} not found")
            
            return {"id": issue["id"], "title": issue.get("title", "")}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def add_issue_to_project(token, project_id, issue_node_id):
    """Add an issue to a project."""
    query = """
    mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {
        projectId: $projectId
        contentId: $contentId
      }) {
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
    
    full_query = json.dumps({"query": query, "variables": variables})
    
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    request = urllib.request.Request(url, data=full_query.encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            if "errors" in result:
                error_msg = str(result["errors"])
                if "already exists" in error_msg.lower() or "already added" in error_msg.lower():
                    return True
                raise Exception(f"❌ GraphQL errors: {result['errors']}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        # Check if issue is already in project
        if "already" in error_body.lower():
            return True
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def update_issue_status_in_project(token, project_id, item_id, status_field_id, status_option_id):
    """Update issue status in project."""
    query = """
    mutation UpdateProjectV2ItemFieldValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: {
          singleSelectOptionId: $valueId
        }
      }) {
        projectV2Item {
          id
        }
      }
    }
    """
    
    variables = {
        "projectId": project_id,
        "itemId": item_id,
        "fieldId": status_field_id,
        "valueId": status_option_id
    }
    
    full_query = json.dumps({"query": query, "variables": variables})
    
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    request = urllib.request.Request(url, data=full_query.encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            if "errors" in result:
                raise Exception(f"❌ GraphQL errors: {result['errors']}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def get_project_item_id(token, project_id, issue_node_id):
    """Get the project item ID for an issue."""
    query = """
    query GetProjectItems($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  id
                }
              }
            }
          }
        }
      }
    }
    """
    
    variables = {"projectId": project_id}
    
    full_query = json.dumps({"query": query, "variables": variables})
    
    url = "https://api.github.com/graphql"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "NivoStack-Project-Updater"
    }
    
    request = urllib.request.Request(url, data=full_query.encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            if "errors" in result:
                raise Exception(f"❌ GraphQL errors: {result['errors']}")
            
            items = result["data"]["node"]["items"]["nodes"]
            for item in items:
                if item["content"] and item["content"]["id"] == issue_node_id:
                    return item["id"]
            
            return None
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def main():
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found. Set GITHUB_TOKEN environment variable or add to ~/.devbridge_tokens")
        return
    
    print("🔍 Getting project information...\n")
    
    try:
        project = get_project_info(token, 3)
        project_id = project["id"]
        project_title = project["title"]
        print(f"✅ Found project: {project_title} (ID: {project_id})\n")
        
        # Get status field
        project_data = get_project_columns(token, project_id)
        status_field = project_data.get("field")
        
        if not status_field:
            print("⚠️  No 'Status' field found in project. Using default workflow.")
            print("   Issues will be added to project but status may need manual update.\n")
            status_field_id = None
            status_options = {}
        else:
            status_field_id = status_field["id"]
            status_options = {opt["name"]: opt["id"] for opt in status_field["options"]}
            print(f"✅ Found Status field with options: {list(status_options.keys())}\n")
        
    except Exception as e:
        print(f"❌ Error getting project info: {e}")
        return
    
    # Issues to update
    issues_to_update = [
        # Completed optimizations
        {"number": 65, "status": "Done", "title": "[UI/UX] Reusable DataTable"},
        {"number": 64, "status": "Done", "title": "[UI/UX] Theme Tokens + Theme Toggle"},
        
        # In progress optimizations
        {"number": 108, "status": "In Progress", "title": "[DATA] Performance: Monitor aggregation performance"},
        {"number": 107, "status": "In Progress", "title": "[DATA] Performance: Add indexes for raw table queries"},
        {"number": 85, "status": "In Progress", "title": "[DATA] Recent Raw optimized queries"},
        {"number": 80, "status": "In Progress", "title": "[UI/UX] SDK Settings: performance"},
        {"number": 72, "status": "In Progress", "title": "[UI/UX] Logs: raw list"},
        {"number": 71, "status": "In Progress", "title": "[UI/UX] API Traces"},
        {"number": 69, "status": "In Progress", "title": "[UI/UX] Devices: Professional Device Management"},
        {"number": 62, "status": "In Progress", "title": "[UI/UX] Global Design System"},
        {"number": 38, "status": "In Progress", "title": "[UI/UX] Global Design System"},
    ]
    
    print(f"📋 Updating {len(issues_to_update)} issues on project board...\n")
    
    for issue_info in issues_to_update:
        issue_number = issue_info["number"]
        target_status = issue_info["status"]
        
        try:
            print(f"🔄 Processing issue #{issue_number}: {issue_info['title']}")
            
            # Get issue node ID
            issue_data = get_issue_node_id(token, issue_number)
            issue_node_id = issue_data["id"]
            print(f"   Issue node ID: {issue_node_id}")
            
            # Add issue to project (if not already added)
            try:
                add_issue_to_project(token, project_id, issue_node_id)
                print(f"   ✅ Issue added to project")
            except Exception as e:
                if "already" in str(e).lower():
                    print(f"   ℹ️  Issue already in project")
                else:
                    raise
            
            # Update status if status field exists
            if status_field_id and target_status in status_options:
                status_option_id = status_options[target_status]
                
                # Get project item ID
                item_id = get_project_item_id(token, project_id, issue_node_id)
                
                if item_id:
                    update_issue_status_in_project(token, project_id, item_id, status_field_id, status_option_id)
                    print(f"   ✅ Status updated to '{target_status}'")
                else:
                    print(f"   ⚠️  Could not find project item ID (issue may need to be added manually)")
            else:
                print(f"   ℹ️  Status field not available or '{target_status}' option not found")
                print(f"      Please update status manually in project board")
            
            print()
            
        except Exception as e:
            print(f"   ❌ Error updating issue #{issue_number}: {e}\n")
    
    print("✅ Project board update complete!")
    print(f"\n📊 View project board: https://github.com/users/iplixera/projects/3")

if __name__ == "__main__":
    main()

