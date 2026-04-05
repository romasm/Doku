# Doku

A single-user documentation app that stores docs as `.md` files on disk and provides a web UI with hierarchical navigation, WYSIWYG editing (BlockNote), and full-text search.

## Tech Stack

- **Backend:** Node.js, Express 5
- **Frontend:** React 19, Vite, React Router v7, BlockNote editor
- **Storage:** Plain `.md` files in a configurable folder (`config.json` → `docsPath`)
- **No auth** — designed for personal/local use

## Project Structure

- `server/` — Express API (file CRUD, tree, search)
- `client/` — React frontend (Vite)
- `docs/` — default documentation content folder
- `config.json` — app configuration
- `start.bat` — builds and launches the app

## Docs Rules

- Every folder **must** have a sibling `folder_name.md` file **outside** the folder (e.g. `guides/` must have `guides.md` next to it). This `.md` file is the folder's index/overview page.
- When a user selects a folder in the sidebar, display the content of its sibling `.md` index file followed by a list of inner files and subfolders.
- Any document can be converted into a folder by clicking **+ New Document** — this creates a subfolder with the doc's name, and the original `.md` file becomes the folder's index.
- The tree hides `.md` files that have a matching sibling folder (they are shown as the folder instead).
