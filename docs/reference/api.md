---
ordering: 1
---
# API Reference

Doku exposes a REST API on the Express backend. All endpoints are prefixed with `/api`.

## Document Endpoints

### GET /api/doc/:path

Read a document by its path (without `.md` extension).

**Response:**

- `content` — full file content including frontmatter
- `path` — document path
- `updatedAt` — last modification timestamp
- `isFolder` — `true` if a matching subfolder exists

### PUT /api/doc/:path

Create or update a document.

**Request body:** `{ "content": "full markdown string including frontmatter" }`

Creates parent directories automatically if they don't exist.

### DELETE /api/doc/:path

Delete a document. If this was the last file in a folder, the empty folder is automatically removed (reverting the parent entry to a plain document).

## Folder Endpoints

### GET /api/folder/:path

Get a folder's index content and children list.

**Response:**

- `content` — content of the sibling index `.md` file (e.g. `guides.md` for `guides/`)
- `path` — folder path
- `children` — array of child items (same format as tree items)

### POST /api/folder

Create a folder. If no sibling index `.md` file exists, one is created automatically.

**Request body:** `{ "path": "folder/path" }`

## Tree and Search

### GET /api/tree

Returns the full document tree as nested JSON. Each item includes:

- `name` — filename slug
- `title` — display name (from `# heading` or formatted filename)
- `path` — relative path
- `type` — `"file"` or `"folder"`
- `ordering` — numeric ordering value (if set in frontmatter)
- `children` — nested items (folders only)

### GET /api/search?q=query

Full-text search across all documents. Searches body content (frontmatter excluded) and filenames.

**Response:** Array of up to 20 results, each with `path`, `title`, and `snippet`.

### POST /api/move

Move or rename a document.

**Request body:** `{ "from": "old/path", "to": "new/path" }`
