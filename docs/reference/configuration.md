---
ordering: 2
---
# Configuration

Doku is configured through `config.json` in the project root.

## config.json

```json
{
  "docsPath": "./docs"
}
```

### docsPath

- **Type:** string
- **Default:** `"./docs"`
- **Description:** Relative or absolute path to the folder where Markdown files are stored. Resolved relative to the project root.

**Examples:**

- `"./docs"` — default, docs folder inside the project
- `"../my-knowledge-base"` — a folder one level up
- `"C:/Users/me/Documents/notes"` — an absolute path

## Ports

- **Backend (Express):** port 3001 by default. Override with the `PORT` environment variable.
- **Dev frontend (Vite):** port 5173. The Vite dev server proxies `/api` requests to the backend.

## Production vs Development

**Development** (two processes):

```
node server/index.js     # Backend on port 3001
npx vite                 # Frontend on port 5173 (proxies API)
```

Open `http://localhost:5173` for hot-reloading during development.

**Production** (single process):

```
npx vite build           # Build frontend to dist/
node server/index.js     # Serves API + frontend on port 3001
```

Open `http://localhost:3001`. The `start.bat` script automates this.
