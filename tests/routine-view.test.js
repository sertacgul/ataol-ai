import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routineViewModel } from '../src/views/routine.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({ childName: 'Test', birthYear: 2016, guardians: [] });
const sabah = new Date('2026-07-24T07:00:00');

test('uc blok sirayla gelir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  assert.deepEqual(vm.blocks.map((b) => b.id), ['morning', 'afternoon', 'evening']);
});

test('bloklarin baslik ve saati tasinir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const m = vm.blocks[0];
  assert.equal(m.title, 'Sabah');
  assert.equal(m.from, '06:30');
});

test('sabah 07:00de sadece ilk kart acik', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const m = vm.blocks.find((b) => b.id === 'morning');
  assert.equal(m.cards[0].state, 'available');
  assert.equal(m.cards[1].state, 'locked');
});

test('kart alanlari gorunum modeline tasinir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const kart = vm.blocks[0].cards[0];
  assert.equal(kart.id, 'sabah-giyin');
  assert.equal(kart.title, 'Giyin ve yatağını topla');
  assert.equal(kart.stars, 2);
  assert.equal(kart.minutes, 4);
  assert.equal(typeof kart.icon, 'string');
});

test('onay bekleyen kart puan gostermez ama sayilir', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  const vm = routineViewModel(profile, dp, sabah);
  assert.equal(vm.stars, 0);
  assert.equal(vm.awaitingApproval, 1);
});

test('birden fazla onay bekleyen kart sayilir', () => {
  const ogleden = new Date('2026-07-24T16:00:00');
  let dp = completeCard(profile, emptyDayProgress(), 'ogle-ust', ogleden);
  dp = completeCard(profile, dp, 'ogle-odev', ogleden);
  const vm = routineViewModel(profile, dp, ogleden);
  assert.equal(vm.awaitingApproval, 2);
  assert.equal(vm.stars, 0);
});

test('dakika tavani uygulanir', () => {
  const dp = { cards: {}, approvals: [], stars: 500, minutes: 500 };
  const vm = routineViewModel(profile, dp, sabah);
  assert.equal(vm.minutes, profile.settings.dailyMinuteCap);
});

test('cocuk adi gorunum modelinde', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  assert.equal(vm.childName, 'Test');
});

test('gorunum modeli duz veridir, HTML uretmez', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  assert.ok(!JSON.stringify(vm).includes('<'), 'gorunum modelinde HTML var');
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/routine.js', import.meta.url), 'utf8');
  for (const yasak of ['document', 'innerHTML', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(yasak), `routine.js icinde "${yasak}" olmamali`);
  }
});
