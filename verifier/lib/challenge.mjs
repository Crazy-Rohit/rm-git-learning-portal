import { createHmac } from 'node:crypto';

export function challengeCode(userId, stage, secret) {
  return createHmac('sha256', secret)
    .update(`${userId}:${stage}`)
    .digest('base64url')
    .slice(0, 12);
}
