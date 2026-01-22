#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

source issueENV/bin/activate

echo "$(date): Starting sync..."
python sync.py

echo "$(date): Generating archive..."
python render.py

echo "$(date): Complete!"