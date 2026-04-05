# Doku

A single-user documentation app that stores docs as `.md` files on disk and provides a web UI with hierarchical navigation, WYSIWYG editing (BlockNote), and full-text search.

## Tech Stack

- **Backend:** Node.js, Express 5
- **Frontend:** React 19, Vite 8, React Router v7, BlockNote editor, Mantine
- **Icons:** Animated icons from `pqoqubbw/icons` submodule (via `icons/`)
- **Storage:** Plain `.md` files on the filesystem, path passed as CLI argument (defaults to `./docs`)
- **No auth** — designed for personal/local use

## Project Structure

- `server/` — Express API (file CRUD, tree, search, image upload)
  - `index.js` — server entry point
  - `api.js` — REST API routes
  - `config.js` — config loader (CLI args + docs/config.json)
  - `frontmatter.js` — YAML frontmatter parser
  - `search.js` — full-text search
- `client/` — React frontend (Vite)
  - `src/App.jsx` — main app with routing
  - `src/components/` — Sidebar, Editor, FolderView, SearchBar, Breadcrumb
  - `src/frontmatter.js` — client-side frontmatter parser
  - `src/useTheme.js` — dark/light mode hook
- `icons/` — animated icons submodule (pqoqubbw/icons)
- `docs/` — default documentation content folder
  - `config.json` — project config (projectName)
  - `assets/` — uploaded images
- `start.bat` — builds frontend + launches server

## Configuration

- **Docs path:** CLI argument — `node server/index.js ./my-docs` (default: `./docs`)
- **config.json:** lives inside the docs folder, contains `{ "projectName": "My Project" }`
- **Port:** 4782 by default, override with `PORT` env var

## Docs Rules

- Every folder **must** have a sibling `folder_name.md` file **outside** the folder (e.g. `guides/` must have `guides.md` next to it). This `.md` file is the folder's index/overview page.
- When a user selects a folder in the sidebar, display the content of its sibling `.md` index file followed by a list of inner files and subfolders.
- Any document can be converted into a folder by clicking the **+** button — this creates a subfolder with the doc's name, and the original `.md` file becomes the folder's index.
- The tree hides `.md` files that have a matching sibling folder (they are shown as the folder instead).
- Each `.md` file can have YAML frontmatter with an `ordering` field (hidden in the UI). Items with ordering come first (ascending), then items without (alphabetical). Files and folders intermix freely.
- Display names come from the first `# heading` in the file. Fallback: title-cased filename.
- When the last child is deleted from a folder, the empty folder is automatically removed (reverting to a plain doc).
- Images are stored in `docs/assets/` and embedded via drag-and-drop or BlockNote's image block.
- `config.json` and `assets/` are excluded from the sidebar tree.
