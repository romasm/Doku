---
ordering: 2
---
# Configuration

Doku is configured through two mechanisms: a CLI argument for the docs path, and a `config.json` inside the docs folder.

## Docs Path (CLI Argument)

The docs folder path is passed as a command-line argument when starting the server:

```text
node server/index.js ./docs
node server/index.js C:/Users/me/my-knowledge-base
open_docs.bat ./docs
open_docs.bat ../other-docs
```

If omitted, it defaults to `./docs` relative to the current working directory.

## config.json

Place a `config.json` file inside your docs folder to configure project-level settings:

```json
{
  "projectName": "My Knowledge Base",
  "port": 4782
}
```

### projectName

- **Type:** string
- **Default:** `"Doku"`
- **Description:** The name displayed at the top of the sidebar. Use this to label different documentation projects.

### port

- **Type:** number
- **Default:** `4782`
- **Description:** The port the backend server listens on. Can also be overridden with the `PORT` environment variable (env var takes highest priority).

## Ports

- **Backend (Express):** port 4782 by default. Set via `port` in config.json or the `PORT` environment variable.
- **Dev frontend (Vite):** port 5173. The Vite dev server proxies `/api` requests to the backend.

## Production vs Development

**Development** (two processes):

```text
node server/index.js ./docs     # Backend on port 4782
npx vite                        # Frontend on port 5173 (proxies API)
```

**Production** (single process):

```text
npx vite build                  # Build frontend to dist/
node server/index.js ./docs     # Serves API + frontend on port 4782
```

Or use `open_docs.bat [docs-path]` which automates the build and launch.
