import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';

test('set ve get JSON nesnesini korur', () => {
  const s = createStorage(memoryBackend());
  s.set('profile', { name: 'X', stars: 3 });
  assert.deepEqual(s.get('profile'), { name: 'X', stars: 3 });
});

test('olmayan anahtar icin fallback doner', () => {
  const s = createStorage(memoryBackend());
  assert.equal(s.get('yok', 'varsayilan'), 'varsayilan');
});

test('anahtarlar on ek ile yazilir', () => {
  const backend = memoryBackend();
  const s = createStorage(backend, 'ataol');
  s.set('stars', 5);
  assert.equal(backend.getItem('ataol:stars'), '5');
});

test('bozuk JSON fallback dondurur, patlamaz', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:x', '{bozuk');
  const s = createStorage(backend, 'ataol');
  assert.equal(s.get('x', null), null);
});

test('remove anahtarı siler', () => {
  const s = createStorage(memoryBackend());
  s.set('a', 1);
  s.remove('a');
  assert.equal(s.get('a', null), null);
});
