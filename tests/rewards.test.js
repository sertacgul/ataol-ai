import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cappedMinutes,
  rewardProgress,
  totalStars,
  validateRewardLadder
} from '../src/engines/rewards.js';

test('tavan altindaki dakika oldugu gibi kalir', () => {
  assert.equal(cappedMinutes(35, 60), 35);
});

test('tavani asan dakika kirpilir', () => {
  assert.equal(cappedMinutes(95, 60), 60);
});

test('negatif dakika sifira cekilir', () => {
  assert.equal(cappedMinutes(-10, 60), 0);
});

test('totalStars gunleri toplar', () => {
  const days = {
    '2026-07-23': { stars: 20 },
    '2026-07-24': { stars: 15 }
  };
  assert.equal(totalStars(days), 35);
});

test('rewardProgress ilerleme yuzdesi ve kilit durumu verir', () => {
  const rewards = [
    { id: 'r1', name: 'Dondurma', target: 30 },
    { id: 'r2', name: 'Bisiklet', target: 400 }
  ];
  const p = rewardProgress(60, rewards);
  assert.equal(p[0].unlocked, true);
  assert.equal(p[0].progress, 1);
  assert.equal(p[1].unlocked, false);
  assert.equal(p[1].progress, 0.15);
});

test('rewardProgress ilerlemeyi 1 ile sinirlar', () => {
  const p = rewardProgress(1000, [{ id: 'r1', name: 'X', target: 30 }]);
  assert.equal(p[0].progress, 1);
});

test('validateRewardLadder 2 kati asan sicramayi uyarir', () => {
  const r = validateRewardLadder([
    { target: 30 },
    { target: 100 },
    { target: 400 },
    { target: 1500 }
  ]);
  assert.equal(r.valid, false);
  assert.ok(r.warnings.some((w) => w.includes('400') && w.includes('1500')));
});

test('validateRewardLadder duzgun merdiveni onaylar', () => {
  const r = validateRewardLadder([
    { target: 30 }, { target: 60 }, { target: 120 }, { target: 240 }
  ]);
  assert.equal(r.valid, true);
});

test('negatif yildizda ilerleme sifirin altina inmez', () => {
  const p = rewardProgress(-500, [{ id: 'r1', name: 'X', target: 100 }]);
  assert.equal(p[0].progress, 0);
  assert.equal(p[0].unlocked, false);
});

test('negatif tavan negatif sonuc uretmez', () => {
  assert.equal(cappedMinutes(30, -5), 0);
});

test('sifir tavan sifir dondurur', () => {
  assert.equal(cappedMinutes(30, 0), 0);
});
