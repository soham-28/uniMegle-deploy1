// Railway deployment entry point
// This file redirects to the actual server

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the actual server
const serverPath = join(__dirname, 'server', 'src', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: join(__dirname, 'server')
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
