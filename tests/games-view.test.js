import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gamesViewModel } from '../src/views/games.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });
const sabah = new Date('2026-07-25T07:00:00');
const aksam = new Date('2026-07-25T20:00:00');

function sabahiBitir(dp, t) {
  for (const id of profile.routine.morning) dp = completeCard(profile, dp, id, t);
  return dp;
}

test('acik blogun kartlari bitmeden kilitli', () => {
  const vm = gamesViewModel(profile, emptyDayProgress(), sabah);
  assert.equal(vm.unlocked, false);
  assert.ok(vm.remaining > 0);
});

test('acik blogun kartlari bitince acilir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  const vm = gamesViewModel(profile, dp, sabah);
  assert.equal(vm.unlocked, true);
  assert.equal(vm.remaining, 0);
});

test('onay bekleyen kart tamamlanmis sayilir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  const onayBekleyen = Object.values(dp.cards).filter((c) => c.state === 'awaiting_approval');
  assert.ok(onayBekleyen.length > 0, 'test anlamsiz, hic onay bekleyen yok');
  assert.equal(gamesViewModel(profile, dp, sabah).unlocked, true);
});

test('yeni blok acilinca tekrar kilitlenir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  assert.equal(gamesViewModel(profile, dp, sabah).unlocked, true);
  assert.equal(gamesViewModel(profile, dp, aksam).unlocked, false);
});

test('kalan gorev sayisi dogru', () => {
  let dp = emptyDayProgress();
  const toplam = profile.routine.morning.length;
  assert.equal(gamesViewModel(profile, dp, sabah).remaining, toplam);
  dp = completeCard(profile, dp, profile.routine.morning[0], sabah);
  assert.equal(gamesViewModel(profile, dp, sabah).remaining, toplam - 1);
});

test('hic blok acik degilse kilitli kalir', () => {
  const gece = new Date('2026-07-25T05:00:00');
  assert.equal(gamesViewModel(profile, emptyDayProgress(), gece).unlocked, false);
});

test('oyun listesi tasinir', () => {
  const vm = gamesViewModel(profile, emptyDayProgress(), sabah);
  assert.ok(Array.isArray(vm.games));
  assert.ok(vm.games.some((g) => g.id === 'amiral'));
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/games.js', import.meta.url), 'utf8');
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(y), `games.js icinde "${y}" olmamali`);
  }
});
