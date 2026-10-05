import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { CERTIFICATE_COURSE, badgeFor } from './badges.mjs';
import { canonical } from './canonical.mjs';

const ID_RE = /^GGP-\d{4}-\d+(?:-S[1-7])?$/;

export function credentialId(githubId, stage, issuedAt) {
  const year = String(issuedAt).slice(0, 4);
  const id = stage == null ? `GGP-${year}-${githubId}` : `GGP-${year}-${githubId}-S${stage}`;
  if (!ID_RE.test(id)) throw new Error('Invalid credential id.');
  return id;
}

export function buildBadge({ stage, githubId, login, issuedAt, kid, repo, issue, issuerName, siteUrl }) {
  const badge = badgeFor(stage);
  if (!badge) throw new Error('Unknown stage.');
  return {
    id: credentialId(githubId, Number(stage), issuedAt),
    type: 'StageBadge',
    version: 1,
    stage: Number(stage),
    title: badge.title,
    recipient: { githubId: Number(githubId), githubLogin: login },
    issuedAt,
    issuer: { name: issuerName, url: siteUrl },
    kid,
    evidence: { repo: String(repo || ''), issue: Number(issue) },
  };
}

export function buildCertificate({ githubId, login, name, issuedAt, kid, issuerName, siteUrl }) {
  return {
    id: credentialId(githubId, null, issuedAt),
    type: 'GitGitHubPractitioner',
    version: 1,
    course: CERTIFICATE_COURSE,
    recipient: { githubId: Number(githubId), githubLogin: login, name },
    stages: [1, 2, 3, 4, 5, 6, 7],
    issuedAt,
    issuer: { name: issuerName, url: siteUrl },
    kid,
  };
}

export function signCredential(unsigned, pem) {
  const signature = sign(null, Buffer.from(canonical(unsigned)), createPrivateKey(pem)).toString('base64url');
  return { ...unsigned, signature };
}

export function verifyCredential(credential, publicKey) {
  if (!credential?.signature || !publicKey?.x) return false;
  const { signature, ...unsigned } = credential;
  try {
    const key = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: publicKey.x }, format: 'jwk' });
    return verify(null, Buffer.from(canonical(unsigned)), key, Buffer.from(signature, 'base64url'));
  } catch {
    return false;
  }
}

export function chooseKey(keys, issuedAt) {
  const day = String(issuedAt).slice(0, 10);
  const usable = (keys || []).filter((key) => key?.kid && key?.x && key.validFrom <= day);
  return usable.at(-1) || null;
}

export function writeCredential(dir, credential) {
  if (!ID_RE.test(credential.id)) throw new Error('Invalid credential id.');
  const file = path.join(dir, 'certificates', `${credential.id}.json`);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(credential, null, 2)}\n`);
  return file;
}
