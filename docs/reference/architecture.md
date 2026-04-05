---
ordering: 4
---
# Architecture

Overview of Doku's technical architecture and project structure.

## Project Layout

```
Doku/
├── server/                  # Express.js backend
│   ├── index.js             # Server entry point
│   ├── api.js               # REST API routes
│   ├── search.js            # Full-text search
│   ├── config.js            # Config file loader
│   └── frontmatter.js       # YAML frontmatter parser
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app with routing
│   │   ├── api.js           # API client functions
│   │   ├── frontmatter.js   # Client-side frontmatter parser
│   │   └── components/
│   │       ├── Sidebar.jsx  # Tree navigation + search
│   │       ├── Editor.jsx   # BlockNote WYSIWYG editor
│   │       ├── FolderView.jsx # Folder index + children
│   │       └── SearchBar.jsx  # Search input + results
│   └── index.html
├── docs/                    # Documentation content (Markdown)
├── config.json              # App configuration
├── start.bat                # Build + launch script
├── vite.config.js           # Vite configuration
└── package.json
```

## Tech Stack

- **Backend:** Node.js with Express 5
- **Frontend:** React 19 with Vite 8
- **Editor:** BlockNote (Notion-style block editor with Markdown I/O)
- **UI library:** Mantine (used by BlockNote)
- **Routing:** React Router v7
- **Storage:** Plain `.md` files on the filesystem

## Data Flow

1. The **backend** reads `.md` files from the configured docs folder and serves them via REST API
2. The **frontend** fetches the document tree on load, displays it in the sidebar
3. When a document is selected, the frontend fetches its content, strips frontmatter, and loads it into the BlockNote editor
4. On edit, the editor auto-saves after 1 second: it converts blocks back to Markdown, re-attaches the frontmatter, and PUTs it to the API
5. The API writes the file to disk

## No Database

Doku has no database. The filesystem is the single source of truth. The document tree is rebuilt from disk on every `/api/tree` request. Search scans files on every query. This keeps the architecture simple and the data fully portable.
