import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';
import { seedProfile } from '../src/data/defaults.js';

function kur() {
  const storage = createStorage(memoryBackend(), 'ataol2');
  const state = createAppState(storage);
  const profile = seedProfile({
    childName: 'X',
    birthYear: 2016,
    guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
  });
  state.saveProfile(profile);
  return { storage, state, profile };
}

test('profil kaydedilip geri okunur', () => {
  const { state, profile } = kur();
  assert.equal(state.loadProfile().child.name, profile.child.name);
});

test('profil yoksa null doner', () => {
  const state = createAppState(createStorage(memoryBackend(), 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('gun ilerlemesi gune gore ayri tutulur', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.loadDayProgress('2026-07-24').stars, 5);
  assert.equal(state.loadDayProgress('2026-07-25').stars, 9);
});

test('kaydedilmemis gun bos ilerleme dondurur', () => {
  const { state } = kur();
  const dp = state.loadDayProgress('2026-01-01');
  assert.equal(dp.stars, 0);
  assert.deepEqual(dp.cards, {});
});

test('gun kaydetmek diger gunleri silmez', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(Object.keys(state.allDays()).length, 2);
});

test('toplam yildiz tum gunleri toplar', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.totalStars(), 14);
});

test('alistirma ilk seviyeyle baslar', () => {
  const { state } = kur();
  const d = state.loadDrill();
  assert.equal(d.level, 'topla-10');
  assert.ok(Object.keys(d.byLevel['topla-10']).length > 0);
});

test('alistirma kaydedilip geri okunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  const k = Object.keys(d.byLevel[d.level])[0];
  d.byLevel[d.level][k] = { ...d.byLevel[d.level][k], box: 4 };
  state.saveDrill(d);
  assert.equal(state.loadDrill().byLevel['topla-10'][k].box, 4);
});

test('seviye atlaninca onceki seviyenin kutulari korunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  d.level = 'cikar-10';
  state.saveDrill(d);
  const yeni = state.loadDrill();
  assert.ok(yeni.byLevel['topla-10'], 'eski seviye silinmis');
  assert.ok(yeni.byLevel['cikar-10'], 'yeni seviye acilmamis');
});

test('gunluk kaydedilip geri okunur, varsayilani bostur', () => {
  const { state } = kur();
  assert.deepEqual(state.loadDiary(), {});
  state.saveDiary({ '2026-07-24': [{ tag: 'uyku', note: '', time: null }] });
  assert.equal(state.loadDiary()['2026-07-24'].length, 1);
});

test('depolama sadece bilinen anahtarlari kullanir', () => {
  const { storage, state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 1, minutes: 1 });
  state.saveDrill(state.loadDrill());
  state.saveDiary({});
  state.saveTimeFacts({});
  state.saveGame('amiral', { x: 1 });
  const bilinen = ['profile', 'days', 'drill', 'diary', 'timefacts'];
  for (const k of storage.keys()) {
    assert.ok(bilinen.includes(k) || k.startsWith('game:'), `beklenmeyen anahtar: ${k}`);
  }
});

test('oyun durumu kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(state.loadGame('amiral'), null);
  state.saveGame('amiral', { tur: 3 });
  assert.equal(state.loadGame('amiral').tur, 3);
});

test('takvim olgulari kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(Object.keys(state.loadTimeFacts()).length, 4);
  state.saveTimeFacts({ ay: { kind: 'ay', box: 3, seen: 1, correct: 1, wrong: 0, avgMs: 0, lastSeen: null } });
  assert.equal(state.loadTimeFacts().ay.box, 3);
});

test('bozuk profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', '{}');
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('yanlis sema surumlu profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', JSON.stringify({ schemaVersion: 99, child: { name: 'X', birthYear: 2016 } }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('bozuk gun kaydi normalize edilerek okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:days', JSON.stringify({ '2026-07-24': {} }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  const dp = state.loadDayProgress('2026-07-24');
  assert.deepEqual(dp.cards, {});
  assert.equal(dp.stars, 0);
});

test('bakim vereni olmayan tohum profil gecerli sayilir', () => {
  const backend = memoryBackend();
  const s = createAppState(createStorage(backend, 'ataol2'));
  s.saveProfile(seedProfile({ childName: 'X', birthYear: 2016, guardians: [] }));
  assert.ok(s.loadProfile(), 'bakim veren yoklugu profili gecersiz yapmamali');
});
