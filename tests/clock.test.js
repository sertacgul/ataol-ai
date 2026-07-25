import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSignature } from '../src/views/clock.js';
import { seedProfile } from '../src/data/defaults.js';

const p = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });

test('ayni dakika icinde imza degismez', () => {
  const a = renderSignature(p, new Date('2026-07-24T07:00:00'));
  const b = renderSignature(p, new Date('2026-07-24T07:00:30'));
  assert.equal(a, b);
});

test('blok acilinca imza degisir', () => {
  const once = renderSignature(p, new Date('2026-07-24T14:59:00'));
  const sonra = renderSignature(p, new Date('2026-07-24T15:01:00'));
  assert.notEqual(once, sonra);
});

test('gun donunce imza degisir', () => {
  const once = renderSignature(p, new Date('2026-07-25T03:59:00'));
  const sonra = renderSignature(p, new Date('2026-07-25T04:01:00'));
  assert.notEqual(once, sonra);
});

test('ayni blok icinde saat ilerlese de imza degismez', () => {
  const a = renderSignature(p, new Date('2026-07-24T15:30:00'));
  const b = renderSignature(p, new Date('2026-07-24T18:00:00'));
  assert.equal(a, b);
});

test('imza gun anahtarini ve acik bloklari icerir', () => {
  const s = renderSignature(p, new Date('2026-07-24T20:00:00'));
  assert.ok(s.includes('2026-07-24'));
  assert.ok(s.includes('evening'));
});
