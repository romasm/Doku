---
ordering: 4
---
# Architecture

Overview of Doku's technical architecture and project structure.

## Project Layout

```text
Doku/
├── server/                  # Express.js backend
│   ├── index.js             # Server entry point
│   ├── api.js               # REST API routes + image upload
│   ├── search.js            # Full-text search
│   ├── config.js            # Config loader (CLI args + docs/config.json)
│   └── frontmatter.js       # YAML frontmatter parser
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app with routing
│   │   ├── api.js           # API client functions
│   │   ├── frontmatter.js   # Client-side frontmatter parser
│   │   ├── imageMarkdown.js # Image width/alignment preservation
│   │   ├── useDocEditor.js  # Shared editor hook (BlockNote + auto-save)
│   │   ├── useTheme.js      # Dark/light mode hook
│   │   └── components/
│   │       ├── Sidebar.jsx      # Tree navigation + search + dark mode toggle
│   │       ├── Editor.jsx       # BlockNote WYSIWYG editor
│   │       ├── FolderView.jsx   # Folder index + children list
│   │       ├── SearchBar.jsx    # Search input + results dropdown
│   │       ├── Breadcrumb.jsx   # Clickable path navigation
│   │       └── icons.js         # Re-exports from icons submodule
│   └── index.html
├── icons/                   # Animated icons submodule (pqoqubbw/icons)
├── docs/                    # Documentation content (Markdown)
│   ├── config.json          # Project config (projectName)
│   └── assets/              # Uploaded images
├── open_docs.bat / open_docs.sh                # Build + launch script
├── vite.config.js           # Vite configuration
└── package.json
```

## Tech Stack

- **Backend:** Node.js with Express 5
- **Frontend:** React 19 with Vite 8
- **Editor:** BlockNote (Notion-style block editor with Markdown I/O)
- **UI library:** Mantine (used by BlockNote)
- **Icons:** Animated SVG icons from pqoqubbw/icons (git submodule)
- **Routing:** React Router v7
- **Storage:** Plain `.md` files on the filesystem

## Data Flow

1. The **backend** reads `.md` files from the docs folder (passed as CLI argument) and serves them via REST API
2. The **frontend** fetches the document tree and project config on load
3. When a document is selected, the frontend fetches its content, strips frontmatter, and loads it into the BlockNote editor
4. On edit, the editor auto-saves after 1 second: it converts blocks back to Markdown, re-attaches the frontmatter, and PUTs it to the API
5. The API writes the file to disk
6. Image drops are handled by BlockNote's upload callback, which POSTs to `/api/upload` and saves to `docs/assets/`

## No Database

Doku has no database. The filesystem is the single source of truth. The document tree is rebuilt from disk on every `/api/tree` request. Search scans files on every query. This keeps the architecture simple and the data fully portable.
