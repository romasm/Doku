---
ordering: 1
---
# Getting Started

Welcome to **Doku** — a personal documentation system that stores your docs as plain Markdown files and provides a web UI for browsing, editing, and searching.

## Quick Start

1. Open a terminal in the Doku project folder
2. Run `start.bat` (or `node server/index.js` + `npx vite` for development)
3. Open `http://localhost:3001` in your browser
4. Start creating and organizing your documentation

## Key Features

- **Markdown storage** — all documents are plain `.md` files on disk, editable with any text editor
- **WYSIWYG editor** — rich block editor (BlockNote) so you never write raw Markdown in the UI
- **Hierarchical structure** — organize docs in nested folders with a sidebar tree
- **Full-text search** — instantly search across all your documents
- **Auto-save** — changes are saved automatically as you type (1-second debounce)
- **Frontmatter** — each file supports YAML frontmatter for metadata like ordering (hidden in the UI)

## How It Works

Doku reads and writes `.md` files from a configurable folder (default: `docs/`). The folder structure on disk maps directly to the sidebar tree in the UI.

Any document can become a folder: click the **+** button next to it to create a child document. This creates a subfolder with the same name, and the original `.md` file becomes the folder's index page.

When the last child is removed from a folder, it automatically reverts to a plain document.
