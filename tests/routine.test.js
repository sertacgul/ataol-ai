import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayKey,
  availableBlocks,
  cardStates,
  completeCard,
  approveCard,
  emptyDayProgress,
  normalizeDayProgress
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
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['c1'], afternoon: [], evening: [] }
  };
  const dp = completeCard(profile, emptyDayProgress(), 'c1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.cards.c1.state, 'awaiting_approval');
});

test('onay bekleyen kart puan vermez', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['c1'], afternoon: [], evening: [] }
  };
  const dp = completeCard(profile, emptyDayProgress(), 'c1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('onaylandiktan sonra puan verilir ve onaylayan kaydedilir', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['c1'], afternoon: [], evening: [] }
  };
  let dp = completeCard(profile, emptyDayProgress(), 'c1', new Date('2026-07-24T07:00:00'));
  dp = approveCard(dp, card, 'guardian-7', '2026-07-24T08:00:00Z');
  assert.equal(dp.cards.c1.state, 'done');
  assert.equal(dp.stars, 10);
  assert.equal(dp.minutes, 10);
  assert.equal(dp.approvals[0].guardianId, 'guardian-7');
});

test('olcum karti onaysiz dogrudan puan verir', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['m1'], afternoon: [], evening: [] }
  };
  const dp = completeCard(profile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.cards.m1.state, 'done');
  assert.equal(dp.stars, 8);
});

test('ayni kart iki kez puan vermez', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['m1'], afternoon: [], evening: [] }
  };
  let dp = completeCard(profile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  dp = completeCard(profile, dp, 'm1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 8);
});

test('tamamlanan karttan sonraki kart acilir', () => {
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [
      { id: 'c1', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
      { id: 'c2', block: 'morning', type: 'inapp', stars: 5, minutes: 5 }
    ],
    routine: { morning: ['c1', 'c2'], afternoon: [], evening: [] }
  };
  const dp = completeCard(profile, emptyDayProgress(), 'c1', new Date('2026-07-24T07:00:00'));
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

const gatingProfile = {
  schedule,
  settings: { dayResetHour: 4 },
  cards: [
    { id: 'm1', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
    { id: 'm2', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
    { id: 'e1', block: 'evening', type: 'measured', stars: 7, minutes: 7 }
  ],
  routine: { morning: ['m1', 'm2'], afternoon: [], evening: ['e1'] }
};

test('saati gelmemis blogun karti puan vermez', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'e1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
  assert.equal(dp.cards.e1, undefined);
});

test('sirasi gelmemis kart puan vermez', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'm2', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
});

test('sirasi gelen kart puan verir', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 5);
});

test('onceki tamamlaninca sonraki kart puan verebilir', () => {
  let dp = completeCard(gatingProfile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  dp = completeCard(gatingProfile, dp, 'm2', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 10);
});

test('routine icinde karsiligi olmayan id puan vermez', () => {
  const hayalet = {
    ...gatingProfile,
    routine: { morning: ['yok'], afternoon: [], evening: [] }
  };
  const dp = completeCard(hayalet, emptyDayProgress(), 'yok', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
});

test('eksik alanli gun ilerlemesi tamamlanir', () => {
  const dp = normalizeDayProgress({});
  assert.deepEqual(dp.cards, {});
  assert.deepEqual(dp.approvals, []);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('normalizeDayProgress gecerli veriyi korur', () => {
  const dp = normalizeDayProgress({ cards: { a: { state: 'done' } }, approvals: [{ guardianId: 'g' }], stars: 5, minutes: 3 });
  assert.equal(dp.stars, 5);
  assert.equal(dp.cards.a.state, 'done');
  assert.equal(dp.approvals.length, 1);
});

test('normalizeDayProgress yanlis tipleri varsayilana cevirir', () => {
  const dp = normalizeDayProgress({ cards: 'bozuk', approvals: 42, stars: 'x', minutes: null });
  assert.deepEqual(dp.cards, {});
  assert.deepEqual(dp.approvals, []);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('normalizeDayProgress null ve undefined kabul eder', () => {
  assert.deepEqual(normalizeDayProgress(null), emptyDayProgress());
  assert.deepEqual(normalizeDayProgress(undefined), emptyDayProgress());
});
