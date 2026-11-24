import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decryptSessionPayload,
  encryptSessionPayload,
  generateRandomHex,
} from './oauthCrypto';

test('encryptSessionPayload and decryptSessionPayload round-trip with AES-256-GCM', async () => {
  const secret = 'test-oauth-secret-key-with-entropy-32chars';
  const payload = {
    purpose: 'session',
    accessToken: 'pina_sample_token_value',
    user: { username: 'creator_demo' },
    exp: Date.now() + 60_000,
  };

  const token = await encryptSessionPayload(payload, secret);
  assert.equal(token.split('.').length, 2);

  const decrypted = await decryptSessionPayload<typeof payload>(token, secret);
  assert.deepEqual(decrypted, payload);

  // Wrong secret or tampered token must return null cleanly
  const wrongSecret = await decryptSessionPayload(token, 'completely-different-wrong-secret-key');
  assert.equal(wrongSecret, null);

  const tampered = await decryptSessionPayload(`${token}x`, secret);
  assert.equal(tampered, null);
});

test('generateRandomHex returns cryptographically random hex strings', () => {
  const a = generateRandomHex(16);
  const b = generateRandomHex(16);
  assert.equal(a.length, 32);
  assert.equal(b.length, 32);
  assert.notEqual(a, b);
  assert.match(a, /^[0-9a-f]{32}$/);
});
