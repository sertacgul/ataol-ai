import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test runner and WebCrypto are available', async () => {
  assert.equal(typeof crypto.subtle.deriveBits, 'function');
});
