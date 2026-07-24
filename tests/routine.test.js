import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayKey,
  availableBlocks,
  cardStates,
  completeCard,
  approveCard,
  emptyDayProgress
} from '../src/engines/routine.js';

const schedule = {
  morning: { from: '06:30' },
  afternoon: { from: '15:00' },
  evening: { from: '19:00' }
};

test('dayKey sifirlama saatinden once onceki gunu verir', () => {
  assert.equal(dayKey(new Date('2026-07-24T02:30:00'), 4), '2026-07-23');
});

test('dayKey sifirlama saatinden sonra ayni gunu verir', () => {
  assert.equal(dayKey(new Date('2026-07-24T05:00:00'), 4), '2026-07-24');
});

test('availableBlocks saati gelmemis bloklari vermez', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-24T07:00:00'), schedule), ['morning']);
});

test('availableBlocks gecmis bloklari acik birakir', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-24T20:00:00'), schedule),
    ['morning', 'afternoon', 'evening']
  );
});

test('blok icinde sadece ilk kart available, sonrakiler locked', () => {
  const profile = {
    schedule,
    cards: [
      { id: 'c1', block: 'morning', type: 'inapp', stars: 5, minutes: 5 },
      { id: 'c2', block: 'morning', type: 'inapp', stars: 5, minutes: 5 }
    ],
    routine: { morning: ['c1', 'c2'], afternoon: [], evening: [] }
  };
  const states = cardStates(profile, emptyDayProgress(), new Date('2026-07-24T07:00:00'));
  assert.equal(states.find((s) => s.cardId === 'c1').state, 'available');
  assert.equal(states.find((s) => s.cardId === 'c2').state, 'locked');
});

test('onay gerektiren kart tamamlaninca awaiting_approval olur', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.cards.c1.state, 'awaiting_approval');
});

test('onay bekleyen kart puan vermez', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('onaylandiktan sonra puan verilir ve onaylayan kaydedilir', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  let dp = completeCard(emptyDayProgress(), card);
  dp = approveCard(dp, card, 'guardian-7', '2026-07-24T08:00:00Z');
  assert.equal(dp.cards.c1.state, 'done');
  assert.equal(dp.stars, 10);
  assert.equal(dp.minutes, 10);
  assert.equal(dp.approvals[0].guardianId, 'guardian-7');
});

test('olcum karti onaysiz dogrudan puan verir', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.cards.m1.state, 'done');
  assert.equal(dp.stars, 8);
});

test('ayni kart iki kez puan vermez', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  let dp = completeCard(emptyDayProgress(), card);
  dp = completeCard(dp, card);
  assert.equal(dp.stars, 8);
});

test('tamamlanan karttan sonraki kart acilir', () => {
  const profile = {
    schedule,
    cards: [
      { id: 'c1', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
      { id: 'c2', block: 'morning', type: 'inapp', stars: 5, minutes: 5 }
    ],
    routine: { morning: ['c1', 'c2'], afternoon: [], evening: [] }
  };
  const dp = completeCard(emptyDayProgress(), profile.cards[0]);
  const states = cardStates(profile, dp, new Date('2026-07-24T07:00:00'));
  assert.equal(states.find((s) => s.cardId === 'c2').state, 'available');
});

test('gece yarisi ile sifirlama saati arasinda bloklar acik kalir', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-25T00:30:00'), schedule, 4),
    ['morning', 'afternoon', 'evening']
  );
});

test('sifirlama saatinden sonra yeni gunun bloklari henuz acilmaz', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-25T05:00:00'), schedule, 4), []);
});

test('eksik from alani patlamak yerine blogu kapali sayar', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-24T10:00:00'), { afternoon: {} }, 4), []);
});

test('bozuk saat metni patlamak yerine blogu kapali sayar', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-24T10:00:00'), { morning: { from: 'abc' } }, 4),
    []
  );
});
