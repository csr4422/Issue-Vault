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
