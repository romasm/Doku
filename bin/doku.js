#!/usr/bin/env node

const path = require('path');
const command = process.argv[2];

if (command === 'init') {
  require('./init');
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
Doku — personal documentation system

Usage:
  dokumd init <path>    Initialize a new docs folder
  dokumd [path]         Start the server (default: ./docs)
  dokumd help           Show this help message

Examples:
  dokumd init ./my-docs
  dokumd ./my-docs
  dokumd
`);
} else {
  // Treat argument as docs path, start the server
  const docsPath = command || './docs';

  // Set the docs path as argv[2] for the server config loader
  process.argv[2] = docsPath;

  // Resolve paths relative to CWD
  const serverPath = path.join(__dirname, '..', 'server', 'index.js');
  require(serverPath);
}
