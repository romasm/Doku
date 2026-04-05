const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const search = require('./search');
const config = require('./config');
const { parseFrontmatter, extractTitle, formatName } = require('./frontmatter');

const router = express.Router();
const DOCS_DIR = config.docsPath;

// Entries to exclude from tree and search
const EXCLUDED_NAMES = new Set(['.', '_meta.json', 'config.json', 'assets']);

// Validate that a resolved path is inside DOCS_DIR (prevents path traversal)
function safePath(...segments) {
  const resolved = path.resolve(DOCS_DIR, ...segments);
  if (!resolved.startsWith(path.resolve(DOCS_DIR))) return null;
  return resolved;
}

// GET /api/config — public config for frontend
router.get('/config', (req, res) => {
  res.json({ projectName: config.projectName });
});

// Assets directory for uploaded images
const ASSETS_DIR = path.join(DOCS_DIR, 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Serve assets statically
router.use('/assets', express.static(ASSETS_DIR));

// Image upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, ASSETS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const id = crypto.randomBytes(8).toString('hex');
      cb(null, `${id}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No valid image file' });
  }
  const url = `/api/assets/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Express 5 returns wildcard params as arrays — join them back into a path string
function getDocPath(params) {
  const p = params.docPath;
  return Array.isArray(p) ? p.join('/') : p;
}

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Read frontmatter + title from a .md file
function getFileMeta(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const title = extractTitle(body);
    return { ordering: frontmatter.ordering, title };
  } catch {
    return { ordering: undefined, title: null };
  }
}

function isExcluded(name) {
  return name.startsWith('.') || EXCLUDED_NAMES.has(name);
}

// Build the file tree. Convention: if name.md and name/ both exist as siblings,
// name.md is the folder's index file and shown as a folder (not a separate file).
function buildTree(dirPath, basePath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];

  const childFolderNames = new Set(
    entries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name)
  );

  for (const entry of entries) {
    if (isExcluded(entry.name)) continue;

    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = buildTree(path.join(dirPath, entry.name), relativePath);

      // Read metadata from the sibling index .md file
      const indexFile = path.join(dirPath, entry.name + '.md');
      const meta = fs.existsSync(indexFile) ? getFileMeta(indexFile) : {};

      items.push({
        name: entry.name,
        title: meta.title || formatName(entry.name),
        path: relativePath,
        type: 'folder',
        ordering: meta.ordering,
        children,
      });
    } else if (entry.name.endsWith('.md')) {
      const nameWithoutExt = entry.name.replace(/\.md$/, '');
      // If a sibling folder with the same name exists, this .md is the folder index — skip it
      if (childFolderNames.has(nameWithoutExt)) continue;

      const meta = getFileMeta(path.join(dirPath, entry.name));

      items.push({
        name: nameWithoutExt,
        title: meta.title || formatName(nameWithoutExt),
        path: relativePath.replace(/\.md$/, ''),
        type: 'file',
        ordering: meta.ordering,
      });
    }
  }

  // Sort by ordering (type doesn't matter — folders and files intermix).
  // Items with ordering come first (by value), then items without (alphabetically).
  items.sort((a, b) => {
    const aHasOrder = a.ordering !== undefined && a.ordering !== null;
    const bHasOrder = b.ordering !== undefined && b.ordering !== null;

    if (aHasOrder && bHasOrder) return a.ordering - b.ordering;
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

// Remove empty folder and clean up (used after delete)
function cleanupEmptyFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return;
  if (!fs.statSync(folderPath).isDirectory()) return;

  const entries = fs.readdirSync(folderPath);
  if (entries.length === 0) {
    fs.rmdirSync(folderPath);
  }
}

// GET /api/tree — file tree
router.get('/tree', (req, res) => {
  try {
    const tree = buildTree(DOCS_DIR);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doc/* — read a doc
router.get('/doc/{*docPath}', (req, res) => {
  const docPath = getDocPath(req.params);
  const filePath = safePath(docPath + '.md');

  if (!filePath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Check if this doc has a matching folder (i.e. it's a folder index)
  const folderPath = safePath(docPath);
  const isFolder = folderPath && fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();

  const content = fs.readFileSync(filePath, 'utf-8');
  const stat = fs.statSync(filePath);
  res.json({ content, path: docPath, updatedAt: stat.mtime, isFolder });
});

// PUT /api/doc/* — create or update a doc
router.put('/doc/{*docPath}', (req, res) => {
  const docPath = getDocPath(req.params);
  const filePath = safePath(docPath + '.md');

  if (!filePath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, req.body.content || '', 'utf-8');
  res.json({ success: true, path: docPath });
});

// DELETE /api/doc/* — delete a doc (and its sibling folder if present)
router.delete('/doc/{*docPath}', (req, res) => {
  const docPath = getDocPath(req.params);
  const filePath = safePath(docPath + '.md');

  if (!filePath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Not found' });
  }

  // If this doc is a folder index (has a sibling folder), remove the folder and its contents too
  const siblingFolder = safePath(docPath);
  if (siblingFolder && fs.existsSync(siblingFolder) && fs.statSync(siblingFolder).isDirectory()) {
    fs.rmSync(siblingFolder, { recursive: true, force: true });
  }

  fs.unlinkSync(filePath);

  // Auto-cleanup: if the parent folder is now empty, remove it
  // so the sibling .md reverts to a plain doc
  const parentDir = path.dirname(filePath);
  if (parentDir !== path.resolve(DOCS_DIR)) {
    cleanupEmptyFolder(parentDir);
  }

  res.json({ success: true });
});

// POST /api/folder — create a folder (also used to convert a doc into a folder)
router.post('/folder', (req, res) => {
  const { path: folderPath } = req.body;
  const fullPath = safePath(folderPath);

  if (!fullPath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  // If no sibling index .md exists yet, create one
  const indexFile = fullPath + '.md';
  if (!fs.existsSync(indexFile)) {
    const folderName = path.basename(folderPath);
    const title = formatName(folderName);
    fs.writeFileSync(indexFile, `# ${title}\n\n`, 'utf-8');
  }

  res.json({ success: true, path: folderPath });
});

// POST /api/move — move/rename a doc or folder (handles folder-doc pairs)
router.post('/move', (req, res) => {
  const { from, to } = req.body;

  const fromPath = safePath(from.endsWith('.md') ? from : from + '.md');
  const toPath = safePath(to.endsWith('.md') ? to : to + '.md');

  if (!fromPath || !toPath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(fromPath)) {
    return res.status(404).json({ error: 'Source not found' });
  }

  const toDir = path.dirname(toPath);
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }

  // Move the .md file
  fs.renameSync(fromPath, toPath);

  // If there's a sibling folder, move it too
  const fromFolder = fromPath.replace(/\.md$/, '');
  const toFolder = toPath.replace(/\.md$/, '');
  if (fs.existsSync(fromFolder) && fs.statSync(fromFolder).isDirectory()) {
    fs.renameSync(fromFolder, toFolder);
  }

  res.json({ success: true });
});

// GET /api/folder/* — get folder index content (from sibling .md) + children
router.get('/folder/{*docPath}', (req, res) => {
  const folderPath = getDocPath(req.params);
  const fullPath = safePath(folderPath);

  if (!fullPath) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Read the sibling index file (e.g. guides.md for guides/)
  const indexFile = fullPath + '.md';
  let content = '';
  if (fs.existsSync(indexFile)) {
    content = fs.readFileSync(indexFile, 'utf-8');
  }

  // Get direct children (files and folders)
  const children = buildTree(fullPath, folderPath);

  res.json({ content, path: folderPath, children });
});

// GET /api/search?q=... — full-text search
router.get('/search', (req, res) => {
  const query = req.query.q;
  if (!query || query.trim().length === 0) {
    return res.json([]);
  }

  try {
    const results = search(DOCS_DIR, query.trim());
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
