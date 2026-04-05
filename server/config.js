const fs = require('fs');
const path = require('path');

// Docs path from CLI argument or default to ./docs (relative to CWD)
const docsArg = process.argv[2] || './docs';
const docsPath = path.resolve(process.cwd(), docsArg);

// Config lives inside the docs folder
const configPath = path.join(docsPath, 'config.json');

let config = {
  docsPath,
  projectName: 'Doku',
  port: 4782,
};

if (fs.existsSync(configPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (raw.projectName) config.projectName = raw.projectName;
    if (raw.port) config.port = raw.port;
  } catch {
    // ignore invalid config
  }
}

// PORT env var takes highest priority
if (process.env.PORT) {
  config.port = Number(process.env.PORT);
}

module.exports = config;
