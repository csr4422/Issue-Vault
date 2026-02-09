# Issue Vault

> Archive GitHub issues into a self-contained, searchable static website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

[Live Demo](https://csr4422.github.io/issue-vault) • [Features](#features) • [Installation](#installation) • [Usage](#usage)

---

## Overview

Issue Vault is a Python tool that creates offline archives of GitHub issues. It fetches issues via GitHub API, stores them in SQLite, and generates a single-page application for browsing issues without internet access.

### Why Issue Vault?

**Problems it solves:**
- GitHub lacks native issue export functionality
- Issues become inaccessible when repositories are deleted
- Searching across multiple repositories is slow
- Offline access to issues is impossible

**Solution:**
- Portable HTML archive with all data embedded
- Instant client-side search across all repositories
- Works completely offline after generation
- Preserves issue history permanently

---

## Features

### Core Functionality
- **Multi-repository support** - Archive issues from unlimited repositories
- **Offline-first** - No internet required after initial generation
- **Fast search** - Instant client-side filtering across all issues
- **GitHub-inspired UI** - Familiar dark theme interface
- **Markdown rendering** - Full support for images, code blocks, and formatting
- **User avatars** - Display author profile pictures
- **Automated sync** - Schedule updates via cron jobs

### Technical Features
- Single HTML file output (portable and shareable)
- SQLite database for efficient local storage
- Hash-based routing for multi-page navigation
- Rate limit handling with exponential backoff
- Incremental sync (only fetch updated issues)

---

## Screenshots

**Repository List**
```
┌─────────────────────────────────────┐
│ facebook/react        245 issues    │
│ microsoft/vscode      189 issues    │
└─────────────────────────────────────┘
```

**Issue Detail**
```
┌─────────────────────────────────────┐
│ [Bug] App crashes on startup  #123  │
│ @user opened • Updated Jan 15       │
│                                     │
│ Full markdown description with      │
│ images and code blocks              │
└─────────────────────────────────────┘
```

---

## Installation

### Prerequisites

- Python 3.9 or higher
- Git
- GitHub Personal Access Token ([Create one here](https://github.com/settings/tokens))

### Quick Setup
```bash
# Clone repository
git clone https://github.com/csr4422/issue-vault.git
cd issue-vault

# Create virtual environment
python -m venv issueENV
source issueENV/bin/activate  # Linux/Mac
# issueENV\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure
cp config.example.toml config.toml
# Edit config.toml with your GitHub token
```

### Configuration

Edit `config.toml`:
```toml
[github]
token = "ghp_your_token_here"

[database]
path = "data/issues.db"

[repos]
repositories = [
    "facebook/react",
    "microsoft/vscode",
]
```

**Getting a GitHub Token:**
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scope: `repo` (for private repos) or `public_repo` (public only)
4. Copy token to `config.toml`

---

## Usage

### Basic Commands
```bash
# Sync issues from GitHub
python sync.py

# Generate static HTML
python render.py

# Both in one command
python main.py auto
```

### Automated Sync

**Using cron (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add line (syncs every 6 hours)
0 */6 * * * /path/to/issue-vault/auto_sync.sh >> /path/to/cron.log 2>&1
```

**Using Task Scheduler (Windows):**

Create `auto_sync.bat`:
```batch
@echo off
cd /d %~dp0
call issueENV\Scripts\activate
python main.py auto
```

Schedule via Task Scheduler GUI.

### Deployment to GitHub Pages
```bash
# Generate archive
python render.py

# Commit and push
git add docs/index.html
git commit -m "Update archive"
git push

# Enable GitHub Pages
# Settings → Pages → Source: main branch → Folder: /docs
```

---

## Project Structure
```
issue-vault/
├── config.py           # Configuration loader
├── db.py              # Database operations
├── sync.py            # GitHub API client
├── render.py          # Static site generator
├── main.py            # CLI interface
├── auto_sync.sh       # Automation script
├── templates/
│   ├── index.html     # HTML template
│   ├── style.css      # GitHub-inspired styling
│   └── script.js      # SPA routing and rendering
├── data/
│   └── issues.db      # SQLite database
├── docs/
│   └── index.html     # Generated output
├── config.toml        # User configuration
└── requirements.txt   # Python dependencies
```

---

## How It Works
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ GitHub API   │ ───> │ SQLite DB    │ ───> │ Static HTML  │
│ (Fetch)      │      │ (Store)      │      │ (Generate)   │
└──────────────┘      └──────────────┘      └──────────────┘
```

1. **Sync Phase**: Fetches issues from GitHub API and stores in SQLite
2. **Render Phase**: Reads database and generates single HTML file
3. **View Phase**: Open HTML in browser, all features work offline

### Database Schema
```sql
repos (id, owner, name)
issues (id, repo_id, number, title, body, state, author, author_avatar, ...)
labels (id, issue_id, name, color)
```

### Generated Output

- **Single HTML file** with embedded JSON data
- **Inline CSS** for styling
- **Inline JavaScript** for routing and rendering
- **No external dependencies** - works offline

---

## API Rate Limits

GitHub API allows:
- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

**Issue Vault handles this by:**
- Using incremental sync (only fetch updated issues)
- Monitoring rate limits before requests
- Implementing exponential backoff on errors
- Stopping sync if rate limit drops below threshold

---

## Troubleshooting

### Database errors after schema changes
```bash
# Delete and recreate database
rm data/issues.db
python sync.py
```

### CSS not loading in output

Check that `render.py` properly inlines templates:
```bash
grep "<style>" docs/index.html
```

### Cron job not running
```bash
# Check cron status
systemctl status cron

# View cron logs
grep CRON /var/log/syslog

# Ensure script has full paths
which python  # Use this path in cron
```

### Markdown images not displaying

Ensure marked.js is loaded. Check browser console for errors.

---

## Technologies

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.9+ |
| Database | SQLite3 |
| API | GitHub REST API |
| Frontend | Vanilla JavaScript |
| Styling | CSS3 (GitHub theme) |
| Routing | Hash-based (client-side) |
| Markdown | Marked.js |

---

## Security & Privacy

- **Token storage**: Stored locally in `config.toml` (gitignored)
- **Data privacy**: All data stored on your machine
- **No tracking**: No analytics or external requests after generation
- **Offline-first**: Works without internet after sync

**Important**: Never commit `config.toml` with your token to public repositories.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Install dev dependencies
pip install -r requirements.txt

# Run tests (if available)
python -m pytest

# Check code style
flake8 *.py
```

---

## TO-DO

- [ ] Comments support
- [ ] PR archiving
- [ ] Export to PDF
- [ ] Full-text search indexing
- [ ] Custom themes
- [ ] GitHub Actions workflow

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Disclaimer

This project is independently developed and not affiliated with GitHub, Inc. The UI design is inspired by GitHub's interface for educational purposes only.

---

## Acknowledgments

- UI design inspired by [GitHub](https://github.com)
- Architecture inspired by [tg-archive](https://github.com/knadh/tg-archive)
- Markdown rendering by [marked.js](https://marked.js.org)

---

## Author

**[Your Name](https://github.com/csr4422)**

---

## Support

- 📫 [Open an issue](https://github.com/csr4422/issue-vault/issues)
- 💬 [Discussions](https://github.com/csr4422/issue-vault/discussions)
- 📧 Email: chaitanyarautds@gmail.com

---

