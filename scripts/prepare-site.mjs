import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, ['build.js'], { cwd: root, stdio: 'inherit' });

const dest = path.join(root, 'site', 'public', 'handbook');
mkdirSync(dest, { recursive: true });
cpSync(path.join(root, 'dist', 'index.html'), path.join(dest, 'index.html'));
cpSync(path.join(root, 'site', 'public', 'rm-logo.png'), path.join(dest, 'rm-logo.png'));
console.log('Handbook copied to site/public/handbook/');
