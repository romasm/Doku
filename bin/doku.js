#!/usr/bin/env node

const path = require('path');
const command = process.argv[2];

if (command === 'init') {
  require('./init');
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
Doku — personal documentation system

Usage:
  doku init <path>    Initialize a new docs folder
  doku [path]         Start the server (default: ./docs)
  doku help           Show this help message

Examples:
  doku init ./my-docs
  doku ./my-docs
  doku
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
