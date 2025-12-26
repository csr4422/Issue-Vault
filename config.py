import tomli
from pathlib import Path


def load_config(config_path="config.toml"):

    config_file = Path(config_path)
    
    if not config_file.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    # Read and parse TOML
    with open(config_file, 'rb') as f:
        config = tomli.load(f)
    
    # Validate required fields
    _validate_config(config)
    
    return config


def _validate_config(config):
 
    # Check GitHub token
    if 'github' not in config:
        raise ValueError("Missing [github] section in config")
    
    if 'token' not in config['github'] or not config['github']['token']:
        raise ValueError("GitHub token is required in [github] section")
    
    if config['github']['token'] == "ghp_your_token_here":
        raise ValueError("Please add your actual GitHub token in config.toml")
    
    # Check database path
    if 'database' not in config:
        raise ValueError("Missing [database] section in config")
    
    if 'path' not in config['database']:
        raise ValueError("Database path is required in [database] section")
    
    # Check repositories
    if 'repos' not in config:
        raise ValueError("Missing [repos] section in config")
    
    if 'repositories' not in config['repos']:
        raise ValueError("Missing 'repositories' array in [repos] section")
    
    if not config['repos']['repositories']:
        raise ValueError("No repositories specified. Add at least one repo.")
    
    # Validate repo format
    for repo in config['repos']['repositories']:
        if '/' not in repo:
            raise ValueError(f"Invalid repo format: {repo}. Expected 'owner/name'")


def get_repos(config):
   
    repos = []
    for repo_str in config['repos']['repositories']:
        owner, name = repo_str.split('/', 1)
        repos.append((owner.strip(), name.strip()))
    return repos


def get_github_token(config):

    return config['github']['token']


def get_db_path(config):
  
    return config['database']['path']


# Example usage
# if __name__ == "__main__":
#     try:
#         config = load_config()
#         print("Config loaded successfully!")
#         print(f"Database: {get_db_path(config)}")
#         print(f"Repositories: {get_repos(config)}")
#     except Exception as e:
#         print(f"Error: {e}")