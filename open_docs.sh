#!/bin/bash
cd "$(dirname "$0")"

DOCS_PATH="${1:-./docs}"

echo "Cleaning previous build..."
rm -rf dist 2>/dev/null

echo "Building frontend..."
npx vite build
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Kill any existing process on port 4782
lsof -ti:4782 2>/dev/null | xargs kill -9 2>/dev/null

echo ""
echo "Doku will be available at http://localhost:4782"
echo "Press Ctrl+C to stop the server."
echo ""

# Open browser (works on macOS and Linux)
if command -v open &>/dev/null; then
    open "http://localhost:4782"
elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:4782"
fi

node server/index.js "$DOCS_PATH"
