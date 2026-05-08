/**
 * Simple wrapper script to run the migration
 * This avoids PowerShell JSON escaping issues
 */

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'migrate-database-to-jbrtechno.ts');
const oldDbName = process.argv[2];

const args = [
  '--project',
  path.join(__dirname, '..', 'tsconfig.scripts.json'),
  scriptPath,
  ...(oldDbName ? [oldDbName] : [])
];

console.log('Running database migration script...');
console.log('');

const proc = spawn('npx', ['ts-node', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

proc.on('exit', (code) => {
  process.exit(code || 0);
});

