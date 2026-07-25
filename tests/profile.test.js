import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION,
  createProfile,
  addGuardian,
  validateProfile,
  DEFAULT_SCHEDULE
} from '../src/core/profile.js';

test('createProfile sema surumu ve bos bakim veren listesi verir', () => {
  const p = createProfile({ childName: 'Test', birthYear: 2016 });
  assert.equal(p.schemaVersion, SCHEMA_VERSION);
  assert.equal(p.child.name, 'Test');
  assert.deepEqual(p.guardians, []);
});

test('varsayilan ayarlar spec degerleriyle gelir', () => {
  const p = createProfile({ childName: 'X', birthYear: 2016 });
  assert.equal(p.settings.dayResetHour, 4);
  assert.equal(p.settings.dailyMinuteCap, 60);
  assert.equal(p.settings.mathSpeedThresholdMs, 6000);
});

test('addGuardian yeni profil dondurur, orjinali bozmaz', () => {
  const p = createProfile({ childName: 'X', birthYear: 2016 });
  const p2 = addGuardian(p, { name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' });
  assert.equal(p.guardians.length, 0);
  assert.equal(p2.guardians.length, 1);
  assert.ok(p2.guardians[0].id);
});

test('validateProfile eksik cocuk adini yakalar', () => {
  const p = createProfile({ childName: '', birthYear: 2016 });
  const r = validateProfile(p);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('child.name')));
});

test('validateProfile gecerli profili onaylar', () => {
  let p = createProfile({ childName: 'X', birthYear: 2016 });
  p = addGuardian(p, { name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' });
  assert.equal(validateProfile(p).valid, true);
});

test('profiller schedule nesnesini paylasmaz', () => {
  const p1 = createProfile({ childName: 'A', birthYear: 2016 });
  const p2 = createProfile({ childName: 'B', birthYear: 2017 });
  p1.schedule.morning.from = '09:00';
  assert.equal(p2.schedule.morning.from, '06:30');
});

test('profil degisikligi modul sabitini bozmaz', () => {
  const p = createProfile({ childName: 'A', birthYear: 2016 });
  p.schedule.evening.from = '23:00';
  assert.equal(DEFAULT_SCHEDULE.evening.from, '19:00');
});
