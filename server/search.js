const fs = require('fs');
const path = require('path');
const { parseFrontmatter, extractTitle, formatName } = require('./frontmatter');

function getAllMdFiles(dir, basePath = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      results.push(...getAllMdFiles(fullPath, relativePath));
    } else if (entry.name.endsWith('.md')) {
      results.push({ fullPath, relativePath });
    }
  }

  return results;
}

function search(docsDir, query) {
  const files = getAllMdFiles(docsDir);
  const queryLower = query.toLowerCase();
  const results = [];

  for (const file of files) {
    const rawContent = fs.readFileSync(file.fullPath, 'utf-8');
    const { body } = parseFrontmatter(rawContent);
    const bodyLower = body.toLowerCase();
    const idx = bodyLower.indexOf(queryLower);

    if (idx === -1) {
      const nameLower = file.relativePath.toLowerCase();
      if (!nameLower.includes(queryLower)) continue;
    }

    // Extract snippet around first match
    let snippet = '';
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(body.length, idx + query.length + 60);
      snippet = (start > 0 ? '...' : '') +
        body.slice(start, end).replace(/\n/g, ' ') +
        (end < body.length ? '...' : '');
    }

    const title = extractTitle(body) ||
      formatName(file.relativePath.replace(/\.md$/, '').split('/').pop());

    results.push({
      path: file.relativePath.replace(/\.md$/, ''),
      title,
      snippet,
    });
  }

  return results.slice(0, 20);
}

module.exports = search;
