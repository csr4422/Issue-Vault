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

    print("Database initialized successfully.")


