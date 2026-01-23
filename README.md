# Issue Vault

A Python tool that archives GitHub issues into a self-contained static website for offline viewing.

## Overview

Issue Vault fetches issues from GitHub repositories via API, stores them in a local SQLite database, and generates a single-page application with search and filtering capabilities. The generated archive works completely offline.

## Features

- Archive issues from multiple GitHub repositories
- Local SQLite database storage
- Generate static HTML with embedded data
- Client-side search and filtering
- Responsive GitHub-inspired UI
- Automated sync with cron jobs
- Deploy to GitHub Pages

## Installation

### Prerequisites

- Python 3.9 or higher
- Git
- GitHub Personal Access Token

### Setup

Clone the repository:
```bash
git clone https://github.com/csr4422/issue-vault.git
cd issue-vault
```

Create and activate virtual environment:
```bash
python -m venv issueENV
source issueENV/bin/activate  # Linux/Mac
issueENV\Scripts\activate     # Windows
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Configure the application:
```bash
cp config.example.toml config.toml
```

Edit `config.toml` with your GitHub token and repositories:
```toml
[github]
token = "your_github_token_here"

[database]
path = "data/issues.db"

[repos]
repositories = [
    "owner/repository-name",
]
```

## Usage

### Manual Sync

Fetch issues from GitHub:
```bash
python sync.py
```

Generate static archive:
```bash
python render.py
```

### Auto Sync

Single command for sync and render:
```bash
python main.py auto
```

Or use the shell script:
```bash
./auto_sync.sh
```

### Automated Scheduling

Setup cron job for automatic updates:
```bash
crontab -e
```

Add the following line (runs every 6 hours):
```cron
0 */6 * * * /full/path/to/issue-vault/auto_sync.sh >> /full/path/to/issue-vault/cron.log 2>&1
```

## Project Structure
```
issue-vault/
├── config.py           # Configuration management
├── db.py              # Database operations
├── sync.py            # GitHub API integration
├── render.py          # Static site generation
├── main.py            # CLI interface
├── auto_sync.sh       # Automated sync script
├── templates/         # HTML/CSS/JS templates
├── data/             # SQLite database
├── docs/             # Generated output
└── config.toml       # Configuration file
```

## Configuration

### GitHub Token

Create a Personal Access Token:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scope: `repo` for private repositories or `public_repo` for public only
4. Copy token to `config.toml`

### Adding Repositories

Add repositories to track in `config.toml`:
```toml
[repos]
repositories = [
    "facebook/react",
    "microsoft/vscode",
    "your-username/your-repo",
]
```

## Deployment

### GitHub Pages

Generate the archive:
```bash
python render.py
```

Commit and push:
```bash
git add docs/index.html
git commit -m "Update archive"
git push
```

Enable GitHub Pages in repository settings:
- Source: main branch
- Folder: /docs

## Commands
```bash
python sync.py              # Sync issues from GitHub
python render.py            # Generate static HTML
python main.py sync         # Sync via CLI
python main.py render       # Render via CLI
python main.py auto         # Sync and render
./auto_sync.sh             # Shell script for automation
```

## Technical Details

### Database Schema

- `repos` - Repository metadata
- `issues` - Issue data with full content
- `labels` - Issue labels with colors

### Generated Output

Single HTML file with:
- Embedded JSON data
- Inline CSS styles
- Inline JavaScript code
- No external dependencies

### Navigation

- Home: Repository list with statistics
- Repository view: Filtered issues list
- Issue detail: Full issue description and metadata

## Technologies

- Python 3.9+
- SQLite3
- GitHub REST API
- HTML5, CSS3, JavaScript
- Hash-based routing

## License

MIT License

## Disclaimer

This project is independently developed and not affiliated with GitHub, Inc. UI design is inspired by GitHub's interface for educational purposes.

## Contributing

Contributions are welcome. Please submit pull requests or open issues for bugs and feature requests.