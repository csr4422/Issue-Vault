import sqlite3
import json
from pathlib import Path
from config import load_config, get_db_path

def get_all_data(db_path):
    conn=sqlite3.connect(db_path)
    conn.row_factory=sqlite3.Row 
    cursor=conn.cursor()

    #getting all repos
    cursor.execute("SELECT * FROM repos")
    repos=[dict(row)for row in cursor.fetchall()]

    cursor.execute(
        '''
        SELECT 
            issues.*,
            repos.owner as repo_owner,
            repos.name as repo_name
        FROM issues
        JOIN repos ON issues.repo_id = repos.id
        ORDER BY issues.updated_at DESC

    ''' )
    issues =[dict(row) for row in cursor.fetchall()]

    #Get all labels grouped by issue
    cursor.execute('''
        SELECT 
            issue_id,
            name,
            color
        FROM labels
        ORDER BY issue_id
    ''')
    labels_rows=cursor.fetchall()

    #Grouping lables by issue_id
    labels_by_issue={}
    for row in labels_rows:
        issue_id= row['issue_id']
        if issue_id not in labels_by_issue:
            labels_by_issue[issue_id] = []
        labels_by_issue[issue_id].append({
                'name':row['name'],
                'color':row['color']
            })
    #attach labels to isssues
    for issue in issues:
        issue['labels']=labels_by_issue.get(issue['id'],[])

    conn.close()

    return{
        'repos':repos,
        'issues':issues,
        'total_issues':len(issues),
        'total_repos':len(repos)
    }

