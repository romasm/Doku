# Doku

A single-user documentation app that stores docs as `.md` files on disk and provides a web UI with hierarchical navigation, WYSIWYG editing (BlockNote), and full-text search.

## Tech Stack

- **Backend:** Node.js, Express 5
- **Frontend:** React 19, Vite 8, React Router v7, BlockNote editor, Mantine
- **Icons:** Animated icons from `pqoqubbw/icons` submodule (via `icons/`)
- **Storage:** Plain `.md` files on the filesystem, path passed as CLI argument (defaults to `./docs`)
- **No auth** — designed for personal/local use

## Project Structure

- `bin/` — CLI entry point (`dokudocs init`, `dokudocs serve`)
- `server/` — Express API (file CRUD, tree, search, image upload)
  - `index.js` — server entry point
  - `api.js` — REST API routes
  - `config.js` — config loader (CLI args + docs/config.json)
  - `frontmatter.js` — YAML frontmatter parser
  - `search.js` — full-text search
  - `watcher.js` — file watcher + SSE for live reload
- `client/` — React frontend (Vite)
  - `src/App.jsx` — main app with routing
  - `src/components/` — Sidebar, Editor, FolderView, SearchBar, Breadcrumb, TableOfContents
  - `src/frontmatter.js` — client-side frontmatter parser
  - `src/imageMarkdown.js` — markdown extensions (image properties, horizontal rules, emoji shortcodes, highlight, underline, HTML symbols, comments, block/inline colors and alignment)
  - `src/useDocEditor.js` — shared editor hook (BlockNote init, auto-save, content loading)
  - `src/useTheme.js` — dark/light mode hook
- `icons/` — animated icons submodule (pqoqubbw/icons)
- `docs/` — default documentation content folder
  - `config.json` — project config (projectName, port)
  - `assets/` — uploaded images
- `test/` — integration tests (API roundtrip)
  - `roundtrip.test.js` — write → read → write → read stability test for all markdown features
- `open_docs.bat` / `open_docs.sh` — builds frontend + launches server
- `tests.bat` — runs all tests with verbose output

## Configuration

- **Docs path:** CLI argument — `node server/index.js ./my-docs` (default: `./docs`)
- **config.json:** lives inside the docs folder, contains `{ "projectName": "My Project", "port": 4782 }`
- **Port:** 4782 by default, configurable via `port` in config.json or `PORT` env var

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
- Deleting a folder-index doc also deletes the sibling folder and all its children.
- Moving/renaming a folder-index doc also moves the sibling folder.

## Markdown Extensions

Beyond standard Markdown (headings, bold, italic, strikethrough, lists, code, blockquotes, tables, task lists, images, links), the editor supports:

- **Horizontal rules** — `---`, `***`, or `___` render as a visual separator and roundtrip back to `---`
- **Emoji shortcodes** — `:rocket:`, `:heart:`, etc. render as unicode emoji in the editor and save back as shortcodes
- **Highlight** — `==text==` renders with a yellow background and roundtrips back to `==text==`
- **Underline** — `<ins>text</ins>` renders as underlined text and roundtrips back to `<ins>`
- **HTML symbols** — `&copy;`, `&rarr;`, `&#169;`, `&#x2764;` etc. are converted to unicode on load
- **Comments** — `[comment text]: #` lines are hidden in the editor and preserved on save
- **Block colors & alignment** — block-level `textColor`, `backgroundColor`, and `textAlignment` are stored as `<!--blockProps:{...}-->` HTML comments above the block and restored on load
- **Inline text color** — inline `textColor` is stored as `<!--tc:color-->text<!--/tc-->` and restored on load

## Testing

- **Framework:** Vitest (compatible with the Vite setup)
- **Run:** `npm test` or `tests.bat`
- **Unit tests:** `client/src/imageMarkdown.test.js` (preprocessing, postprocessing, code block protection, inline markers), `client/src/frontmatter.test.js` (parse, serialize, roundtrip)
- **Integration tests:** `test/roundtrip.test.js` (starts a server, writes a comprehensive .md via API, reads it back, verifies all formatting features survive the roundtrip)
