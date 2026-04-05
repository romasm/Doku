const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const ROOT_DIR = path.join(__dirname, '..');

let config = { docsPath: './docs' };

if (fs.existsSync(CONFIG_PATH)) {
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  Object.assign(config, raw);
}

// Resolve docsPath relative to project root
config.docsPath = path.resolve(ROOT_DIR, config.docsPath);

module.exports = config;
