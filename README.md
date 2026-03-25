# Issue Vault
Archive GitHub issues into a self-contained, searchable static website — works completely offline.

[Live Demo](https://csr4422.github.io/Issue-Vault/) • [MIT License](LICENSE)

---

## What it does
Fetches issues from GitHub → stores in SQLite → generates a single portable HTML file you can browse offline, search instantly, and share without any dependencies.

## Quick Start

```bash
git clone https://github.com/csr4422/issue-vault.git && cd issue-vault
python -m venv issueENV && source issueENV/bin/activate
pip install -r requirements.txt
cp config.example.toml config.toml  # add your GitHub token and repos
```

```bash
python sync.py    # fetch issues from GitHub
python render.py  # generate docs/index.html
```

Open `docs/index.html` in your browser — done.

## Config

```toml
[github]
token = "ghp_your_token_here"

[repos]
repositories = ["owner/repo", "owner/repo2"]
```

Get a token at [GitHub Settings → Tokens](https://github.com/settings/tokens) with `public_repo` scope.

## Deploy to GitHub Pages

```bash
git add docs/index.html && git commit -m "Update archive" && git push
# Settings → Pages → Source: main → /docs
```

## Stack
Python · SQLite · Vanilla JS · Marked.js · Hash-based SPA routing


> Not affiliated with GitHub, Inc. UI inspired by GitHub for educational purposes.
