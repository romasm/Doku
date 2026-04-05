---
ordering: 1
icon: 🔗
---
# API Reference

Doku exposes a REST API on the Express backend. All endpoints are prefixed with `/api`.

## Configuration

### GET /api/config

Returns public configuration for the frontend.

**Response:** `{ "projectName": "My Project" }`

## Document Endpoints

### GET /api/doc/:path

Read a document by its path (without `.md` extension).

**Response:**

* `content` — full file content including frontmatter

* `path` — document path

* `updatedAt` — last modification timestamp

* `isFolder` — `true` if a matching subfolder exists

### PUT /api/doc/:path

Create or update a document.

**Request body:** `{ "content": "full markdown string including frontmatter" }`

Creates parent directories automatically if they don't exist.

### DELETE /api/doc/:path

Delete a document. If the document is a folder index (has a sibling folder), the folder and all its children are also deleted. If this was the last file in a parent folder, the empty parent folder is automatically removed.

## Folder Endpoints

### GET /api/folder/:path

Get a folder's index content and children list.

**Response:**

* `content` — content of the sibling index `.md` file (e.g. `guides.md` for `guides/`)

* `path` — folder path

* `children` — array of child items (same format as tree items)

### POST /api/folder

Create a folder. If no sibling index `.md` file exists, one is created automatically.

**Request body:** `{ "path": "folder/path" }`

## Image Upload

### POST /api/upload

Upload an image file. Images are saved to `docs/assets/` with a unique hex filename.

**Request:** multipart form data with an `image` field containing the file.

**Response:** `{ "url": "/api/assets/abc123.png", "filename": "abc123.png" }`

Supported formats: png, jpg, jpeg, gif, webp, bmp. Max size: 10MB.

### GET /api/assets/:filename

Serves uploaded images as static files from the assets directory.

## Tree and Search

### GET /api/tree

Returns the full document tree as nested JSON. Each item includes:

* `name` — filename slug

* `title` — display name (from `# heading` or formatted filename)

* `path` — relative path

* `type` — `"file"` or `"folder"`

* `ordering` — numeric ordering value (if set in frontmatter)

* `children` — nested items (folders only)

### GET /api/search?q=query

Full-text search across all documents. Searches body content (frontmatter excluded) and filenames.

**Response:** Array of up to 20 results, each with `path`, `title`, and `snippet`.

### POST /api/move

Move or rename a document. If the document has a sibling folder (i.e. it is a folder index), the folder is moved along with it.

**Request body:** `{ "from": "old/path", "to": "new/path" }`
