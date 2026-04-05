const fs = require('fs');
const path = require('path');
const config = require('./config');

const DOCS_DIR = config.docsPath;
const DEBOUNCE_MS = 150;

// SSE clients
const clients = new Set();

// Track paths recently saved by our own API so we can skip those events
const recentSaves = new Map();
const SAVE_GRACE_MS = 2000;

function markSaved(docPath) {
  recentSaves.set(docPath, Date.now());
}

function wasRecentlySaved(docPath) {
  const ts = recentSaves.get(docPath);
  if (!ts) return false;
  if (Date.now() - ts < SAVE_GRACE_MS) return true;
  recentSaves.delete(docPath);
  return false;
}

// Broadcast a change event to all connected SSE clients
function broadcast(relativePath) {
  const data = JSON.stringify({ type: 'change', path: relativePath });
  for (const res of clients) {
    res.write(`data: ${data}\n\n`);
  }
}

// Debounce: coalesce rapid events on the same file
let pending = new Map();
let debounceTimer = null;

function flushPending() {
  for (const [relPath] of pending) {
    broadcast(relPath);
  }
  pending.clear();
  debounceTimer = null;
}

function onFileChange(eventType, filename) {
  if (!filename) return;

  // Normalize to forward slashes
  const relPath = filename.replace(/\\/g, '/');

  // Ignore non-md files, assets, config, and hidden files
  if (relPath.startsWith('assets/') || relPath.startsWith('.')) return;
  if (relPath === 'config.json') return;

  // Skip if this was our own auto-save
  const docPath = relPath.replace(/\.md$/, '');
  if (wasRecentlySaved(docPath)) return;

  pending.set(relPath, true);
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushPending, DEBOUNCE_MS);
}

// Start watching
let watcher = null;
function startWatcher() {
  try {
    watcher = fs.watch(DOCS_DIR, { recursive: true }, onFileChange);
    watcher.on('error', (err) => {
      console.error('File watcher error:', err.message);
    });
  } catch (err) {
    console.error('Could not start file watcher:', err.message);
  }
}

// SSE endpoint handler
function sseHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  clients.add(res);
  req.on('close', () => {
    clients.delete(res);
  });
}

module.exports = { startWatcher, sseHandler, markSaved };
