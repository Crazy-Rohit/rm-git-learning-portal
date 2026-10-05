import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keysFile = path.join(root, 'site', 'public', 'keys.json');
const secretDir = path.join(process.env.LOCALAPPDATA || path.join(root, 'secrets'), 'rm-git-learning-portal-secrets');

if (existsSync(keysFile)) {
  const current = JSON.parse(readFileSync(keysFile, 'utf8'));
  if (Array.isArray(current) && current.length > 0) {
    console.log('Public key already exists. Leaving it in place.');
    process.exit(0);
  }
}

mkdirSync(secretDir, { recursive: true });
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const jwk = publicKey.export({ format: 'jwk' });
const privatePath = path.join(secretDir, 'private.pem');
const challengePath = path.join(secretDir, 'challenge-secret.txt');

writeFileSync(privatePath, privatePem, { flag: 'wx' });
writeFileSync(challengePath, `${randomBytes(32).toString('hex')}\n`, { flag: 'wx' });
writeFileSync(keysFile, `${JSON.stringify([{ kid: '2026-1', x: jwk.x, validFrom: '2026-10-05' }], null, 2)}\n`);

console.log('Public key written to site/public/keys.json');
console.log(`Private key saved outside the repo: ${privatePath}`);
console.log(`Challenge secret saved outside the repo: ${challengePath}`);
console.log('Copy both into a password manager, then set the GitHub Actions secrets:');
console.log(`  gh secret set SIGNING_KEY_PEM < "${privatePath}"`);
console.log(`  gh secret set CHALLENGE_SECRET < "${challengePath}"`);
console.log('Do not commit these files. Delete the copies from this computer after the secrets are stored.');
