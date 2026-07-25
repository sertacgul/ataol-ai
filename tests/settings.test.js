import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardianSummary, validateGuardianInput, requiresExistingPin } from '../src/views/settings.js';
import { seedProfile } from '../src/data/defaults.js';

const bos = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });
const dolu = seedProfile({
  childName: 'X',
  birthYear: 2016,
  guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
});

test('bakim veren yokken kapi acik', () => {
  assert.equal(requiresExistingPin(bos), false);
});

test('bakim veren varken kapi PIN ister', () => {
  assert.equal(requiresExistingPin(dolu), true);
});

test('ozet ad ve etiketi verir, PIN alanlarini vermez', () => {
  const ozet = guardianSummary(dolu);
  assert.equal(ozet.length, 1);
  assert.equal(ozet[0].label, 'Baba');
  assert.equal(ozet[0].pinHash, undefined);
  assert.equal(ozet[0].pinSalt, undefined);
});

test('bos profilde ozet bos dizi', () => {
  assert.deepEqual(guardianSummary(bos), []);
});

test('gecerli girdi kabul edilir', () => {
  const r = validateGuardianInput({ name: 'Feride', label: 'Feride mama', pin: '4821', pinConfirm: '4821' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, []);
});

test('bos ad reddedilir', () => {
  const r = validateGuardianInput({ name: '  ', label: 'Baba', pin: '1234', pinConfirm: '1234' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('İsim')));
});

test('bos etiket reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: '', pin: '1234', pinConfirm: '1234' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('Etiket')));
});

test('kisa PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '123', pinConfirm: '123' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('4')));
});

test('uzun PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '123456789', pinConfirm: '123456789' });
  assert.equal(r.valid, false);
});

test('rakam disi PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '12a4', pinConfirm: '12a4' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('rakam')));
});

test('eslesmeyen PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '1234', pinConfirm: '1235' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('aynı')));
});

test('birden fazla hata birlikte bildirilir', () => {
  const r = validateGuardianInput({ name: '', label: '', pin: 'x', pinConfirm: 'y' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.length >= 3);
});

test('eksik alanlar patlamak yerine hata verir', () => {
  const r = validateGuardianInput({});
  assert.equal(r.valid, false);
  assert.ok(r.errors.length > 0);
});
