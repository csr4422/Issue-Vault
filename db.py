import sqlite3
from pathlib import Path
from config import get_db_path, load_config


def get_connection(config):
    db_path = get_db_path(config)

    # Create folder if needed
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    return sqlite3.connect(db_path)


def init_db(config):
    conn = get_connection(config)
    cursor = conn.cursor()

    # Repos table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS repos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            name TEXT NOT NULL,
            UNIQUE (owner, name)
        )
    ''')

    # Issues table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_id INTEGER NOT NULL,
            number INTEGER NOT NULL,
            title TEXT,
            body TEXT,
            state TEXT,
            created_at TEXT,
            updated_at TEXT,
            url TEXT,
            author TEXT,
            FOREIGN KEY (repo_id) REFERENCES repos(id),
            UNIQUE (repo_id, number)
        )
    ''')

    # Labels table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS labels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            color TEXT,
            FOREIGN KEY (issue_id) REFERENCES issues(id)
        )
    ''')

    conn.commit()
    conn.close()

def insert_repo(conn,owner,name):
    cursor=conn.cursor()

    # Insert repo 
    cursor.execute('''
        INSERT OR IGNORE INTO repos (owner,name)
        VAlUES (?,?)
    ''',(owner,name))
    # Get the repo ID
    cursor.execute('''
        SELECT id FROM repos WHERE owner = ? AND name = ?
    ''',(owner,name))

    repo_id= cursor.fetchone()[0]
    conn.commit()
    return repo_id

def insert_issue(conn, repo_id, issue_data):
    cursor = conn.cursor()
   
    cursor.execute('''
        INSERT OR REPLACE INTO issues
        (repo_id, number, title, body, state, created_at, updated_at, url, author)
        VALUES (?,?,?,?,?,?,?,?,?)
    ''', (
        repo_id,
        issue_data['number'],
        issue_data['title'],
        issue_data['body'],
        issue_data['state'],
        issue_data['created_at'],
        issue_data['updated_at'],
        issue_data['url'],
        issue_data['author']
    ))
      
    issue_id = cursor.lastrowid  
    conn.commit()                
    return issue_id              
def insert_labels(conn,issue_id,labels):
    cursor=conn.cursor()\
    # Delete old lables 
    cursor.execute('DELETE FROM labels WHERE issue_id = ?',(issue_id,))
    # Insert new labels
    for label in labels:
        cursor.execute(
            '''
        INSERT INTO labels (issue_id, name, color)
        VALUES (?,?,?)
        ''',(issue_id, label['name'],label.get('color','')))

    conn.commit()