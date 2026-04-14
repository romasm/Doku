const fs = require('fs');
const path = require('path');

const targetArg = process.argv[3];

if (!targetArg) {
  console.error('Usage: dokudocs init <path>');
  console.error('Example: dokudocs init ./my-docs');
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), targetArg);
const dirName = path.basename(targetDir);
const projectName = dirName
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());

// Create directory
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create assets directory
const assetsDir = path.join(targetDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create config.json
const configPath = path.join(targetDir, 'config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({
    projectName,
    port: 4782,
  }, null, 2) + '\n');
}

// Create sample getting-started.md
const sampleDoc = path.join(targetDir, 'getting-started.md');
if (!fs.existsSync(sampleDoc)) {
  fs.writeFileSync(sampleDoc, `---
ordering: 1
---
# Getting Started

Welcome to **${projectName}**.

This is your first document. You can edit it using the web UI or any text editor.

## Next Steps

- Edit this document to add your own content
- Click the **+** button in the sidebar to create new documents
- Organize documents into folders by clicking **+** on any existing document
- Use the search bar to find content across all documents
- Toggle dark mode with the button at the bottom of the sidebar
`);
}

// Read config back to show actual values (handles pre-existing config.json)
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(`
  Doku initialized in ${targetDir}

  Project name: ${config.projectName}
  Port: ${config.port || 4782}

  To start:
    npx dokudocs ${targetArg}

  Then open http://localhost:${config.port || 4782} in your browser.

  AI agents: run "dokudocs agents" for file format and editing guidelines.
`);
