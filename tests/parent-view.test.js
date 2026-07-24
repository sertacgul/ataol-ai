import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { approvalQueue, approvalSummary } from '../src/views/parent.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({
  childName: 'Test',
  birthYear: 2016,
  guardians: [
    { name: 'Baba', label: 'Baba', pinHash: 'h1', pinSalt: 's1' },
    { name: 'Anne', label: 'Anne', pinHash: 'h2', pinSalt: 's2' }
  ]
});
const sabah = new Date('2026-07-24T07:00:00');

test('onay bekleyen kart kuyruga girer', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  const q = approvalQueue(profile, dp);
  assert.equal(q.length, 1);
  assert.equal(q[0].id, 'sabah-giyin');
  assert.equal(q[0].stars, 2);
  assert.equal(q[0].title, 'Giyin ve yatağını topla');
});

test('tamamlanmamis kart kuyruga girmez', () => {
  assert.equal(approvalQueue(profile, emptyDayProgress()).length, 0);
});

test('tamamlanmis olcum karti kuyruga girmez', () => {
  const dp = { cards: { 'ogle-matematik': { state: 'done' } }, approvals: [], stars: 5, minutes: 10 };
  assert.equal(approvalQueue(profile, dp).length, 0);
});

test('karsiligi olmayan id kuyrugu bozmaz', () => {
  const dp = { cards: { hayalet: { state: 'awaiting_approval' } }, approvals: [], stars: 0, minutes: 0 };
  assert.deepEqual(approvalQueue(profile, dp), []);
});

test('haftalik ozet onaylari bakim verene gore sayar', () => {
  const days = {
    '2026-07-20': { cards: {}, approvals: [{ guardianId: 'g1' }, { guardianId: 'g2' }], stars: 0, minutes: 0 },
    '2026-07-21': { cards: {}, approvals: [{ guardianId: 'g2' }], stars: 0, minutes: 0 }
  };
  const guardians = [
    { id: 'g1', name: 'Baba', label: 'Baba' },
    { id: 'g2', name: 'Anne', label: 'Anne' }
  ];
  const ozet = approvalSummary(days, guardians, '2026-07-20', '2026-07-26');
  assert.equal(ozet.find((o) => o.id === 'g1').count, 1);
  assert.equal(ozet.find((o) => o.id === 'g2').count, 2);
});

test('haftalik ozet aralik disini saymaz', () => {
  const days = {
    '2026-06-01': { cards: {}, approvals: [{ guardianId: 'g1' }], stars: 0, minutes: 0 },
    '2026-07-21': { cards: {}, approvals: [{ guardianId: 'g1' }], stars: 0, minutes: 0 }
  };
  const ozet = approvalSummary(days, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet[0].count, 1);
});

test('hic onay vermemis bakim veren sifirla listelenir', () => {
  const ozet = approvalSummary({}, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet[0].count, 0);
});

test('taninmayan guardianId ozeti bozmaz', () => {
  const days = { '2026-07-21': { cards: {}, approvals: [{ guardianId: 'yok' }], stars: 0, minutes: 0 } };
  const ozet = approvalSummary(days, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet.length, 1);
  assert.equal(ozet[0].count, 0);
});

test('gorunum modeli duz veridir, HTML uretmez', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  assert.ok(!JSON.stringify(approvalQueue(profile, dp)).includes('<'));
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/parent.js', import.meta.url), 'utf8');
  for (const yasak of ['document', 'innerHTML', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(yasak), `parent.js icinde "${yasak}" olmamali`);
  }
});
