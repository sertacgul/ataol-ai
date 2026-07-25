import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPin, verifyPin, randomId } from '../src/core/crypto.js';

test('hashPin hash ve salt dondurur', async () => {
  const { hash, salt } = await hashPin('1234');
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.match(salt, /^[0-9a-f]{32}$/);
});

test('ayni PIN farkli salt ile farkli hash uretir', async () => {
  const a = await hashPin('1234');
  const b = await hashPin('1234');
  assert.notEqual(a.hash, b.hash);
});

test('dogru PIN dogrulanir', async () => {
  const { hash, salt } = await hashPin('4821');
  assert.equal(await verifyPin('4821', hash, salt), true);
});

test('yanlis PIN reddedilir', async () => {
  const { hash, salt } = await hashPin('4821');
  assert.equal(await verifyPin('4822', hash, salt), false);
});

test('randomId benzersiz degerler uretir', () => {
  const ids = new Set(Array.from({ length: 200 }, () => randomId()));
  assert.equal(ids.size, 200);
});
