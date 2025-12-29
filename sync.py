import requests
from config import load_config, get_repos, get_github_token
from db import get_connection, insert_repo, insert_issue, insert_labels 
def fetch_issues(owner, repo, token):

    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    params = {
        "state": "all",  
        "per_page": 100  
    }
    
    all_issues = []
    page = 1
    
    while True:
        params["page"] = page
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"Error fetching issues: {response.status_code}")
            print(f"Message: {response.json().get('message', 'Unknown error')}")
            break
        
        issues = response.json()
        
        if not issues:
            break
        
        all_issues.extend(issues)
        page += 1
        
        print(f"   Fetched page {page-1} ({len(issues)} issues)")
    
    return all_issues

def sync_repo(config, owner, repo_name, token):

    print(f"\nSyncing {owner}/{repo_name}...")
    
    # Fetch issues from GitHub
    issues = fetch_issues(owner, repo_name, token)
    
    if not issues:
        print("   No issues found")
        return
    
    print(f"Found {len(issues)} issues")
    
    # Connect to database
    conn = get_connection(config)
    repo_id = insert_repo(conn, owner, repo_name)
    
    # Insert each issue
    for issue in issues:
        if 'pull_request' in issue:
            continue
        
        issue_data = {
            'number': issue['number'],
            'title': issue['title'],
            'body': issue.get('body', ''),  
            'state': issue['state'],
            'created_at': issue['created_at'],
            'updated_at': issue['updated_at'],
            'url': issue['html_url'],
            'author': issue['user']['login']
        }
        
        # Insert issue
        issue_id = insert_issue(conn, repo_id, issue_data)
        
        # Insert labels
        labels = [
            {'name': label['name'], 'color': label['color']}
            for label in issue.get('labels', [])
        ]
        
        if labels:
            insert_labels(conn, issue_id, labels)
    
    conn.close()
    print(f"Saved {len(issues)} issues to database")

