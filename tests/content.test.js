import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCard, removeCard, addReward, removeReward, validateProfile } from '../src/core/profile.js';
import { validateCardInput, validateRewardInput, ICON_OPTIONS, EMOJI_OPTIONS } from '../src/views/content.js';
import { seedProfile } from '../src/data/defaults.js';
import { BLOCKS } from '../src/engines/routine.js';

const tohum = () => seedProfile({
  childName: 'X',
  birthYear: 2016,
  guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
});

// Rutin ve kartlar tutarli mi: her routine id bir karta isaret eder ve her
// kart tam bir listede gecer.
function tutarli(p) {
  const ids = new Set(p.cards.map((c) => c.id));
  const hepsi = BLOCKS.flatMap((b) => p.routine[b]);
  for (const id of hepsi) if (!ids.has(id)) return false;
  if (hepsi.length !== new Set(hepsi).size) return false;
  return hepsi.length === p.cards.length;
}

test('addCard: karti cards ve dogru routine blokuna ekler, approved yapar', () => {
  const p = tohum();
  const oncekiKart = p.cards.length;
  const y = addCard(p, { title: 'Piyano çalış', block: 'evening', stars: 3, minutes: 8, icon: 'music_note' });

  assert.equal(y.cards.length, oncekiKart + 1);
  const yeni = y.cards[y.cards.length - 1];
  assert.equal(yeni.title, 'Piyano çalış');
  assert.equal(yeni.type, 'approved');
  assert.equal(yeni.block, 'evening');
  assert.ok(y.routine.evening.includes(yeni.id), 'routine akşam blokuna eklenmeli');
  assert.ok(tutarli(y), 'kart ve rutin tutarli kalmali');
});

test('addCard immutable: kaynak profili bozmaz', () => {
  const p = tohum();
  const oncekiKart = p.cards.length;
  addCard(p, { title: 'Yeni', block: 'morning', stars: 2, minutes: 4, icon: 'star' });
  assert.equal(p.cards.length, oncekiKart, 'kaynak degismemeli');
});

test('removeCard: cards ve TUM routine bloklarindan cikarir, tutarli kalir', () => {
  let p = tohum();
  const id = p.cards[0].id;
  p = removeCard(p, id);
  assert.ok(!p.cards.some((c) => c.id === id), 'karttan silinmeli');
  for (const b of BLOCKS) assert.ok(!p.routine[b].includes(id), `${b} routine'inde kalmamali`);
  assert.ok(tutarli(p), 'silme sonrasi tutarli kalmali');
});

test('eklenmis kart silinince profil hala gecerli ve tutarli', () => {
  let p = tohum();
  p = addCard(p, { title: 'Geçici', block: 'afternoon', stars: 1, minutes: 3, icon: 'toys' });
  const id = p.cards[p.cards.length - 1].id;
  p = removeCard(p, id);
  assert.equal(validateProfile(p).valid, true);
  assert.ok(tutarli(p));
});

test('addReward / removeReward', () => {
  let p = tohum();
  const oncekiOdul = p.rewards.length;
  p = addReward(p, { name: 'Lego', emoji: '🧩', target: 300 });
  assert.equal(p.rewards.length, oncekiOdul + 1);
  const yeni = p.rewards[p.rewards.length - 1];
  assert.equal(yeni.name, 'Lego');
  assert.equal(yeni.target, 300);

  p = removeReward(p, yeni.id);
  assert.equal(p.rewards.length, oncekiOdul);
});

test('validateCardInput: gecerli girdi gecer', () => {
  const r = validateCardInput({ title: 'Oku', block: 'evening', stars: 3, minutes: 6, icon: ICON_OPTIONS[0] });
  assert.equal(r.valid, true, r.errors.join(' | '));
});

test('validateCardInput: bos ad, kotu blok, negatif deger, gecersiz simge reddedilir', () => {
  assert.equal(validateCardInput({ title: '', block: 'evening', stars: 3, minutes: 6, icon: ICON_OPTIONS[0] }).valid, false);
  assert.equal(validateCardInput({ title: 'x', block: 'gece', stars: 3, minutes: 6, icon: ICON_OPTIONS[0] }).valid, false);
  assert.equal(validateCardInput({ title: 'x', block: 'evening', stars: -1, minutes: 6, icon: ICON_OPTIONS[0] }).valid, false);
  assert.equal(validateCardInput({ title: 'x', block: 'evening', stars: 3, minutes: 6, icon: 'olmayan_simge' }).valid, false);
});

test('validateRewardInput: gecerli ve gecersiz', () => {
  assert.equal(validateRewardInput({ name: 'Dondurma', emoji: EMOJI_OPTIONS[0], target: 60 }).valid, true);
  assert.equal(validateRewardInput({ name: '', emoji: EMOJI_OPTIONS[0], target: 60 }).valid, false);
  assert.equal(validateRewardInput({ name: 'x', emoji: '🚀', target: 60 }).valid, false);
  assert.equal(validateRewardInput({ name: 'x', emoji: EMOJI_OPTIONS[0], target: 0 }).valid, false);
});
