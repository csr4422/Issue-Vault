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
        JOIN repos ON issues.repo_id = repo.id
        ORDER BY issues.updated_at DESC

    ''' )
    issues =[dict(row) for row in cursor.fetchall()]

    conn.close()
    return
