import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedProfile, DEFAULT_CARDS, DEFAULT_REWARDS } from '../src/data/defaults.js';
import { validateProfile } from '../src/core/profile.js';
import { validateRewardLadder } from '../src/engines/rewards.js';
import { BLOCKS } from '../src/engines/routine.js';

const tohum = (guardians = []) =>
  seedProfile({ childName: 'X', birthYear: 2016, guardians });

test('tohum profil dogrulamadan gecer', () => {
  const p = tohum([{ name: 'A', label: 'Baba', pinHash: 'h1', pinSalt: 's1' }]);
  assert.equal(validateProfile(p).valid, true);
});

test('odul merdiveni uyari uretmez', () => {
  const r = validateRewardLadder(DEFAULT_REWARDS);
  assert.equal(r.valid, true, r.warnings.join(' | '));
});

test('her rutin id karsiligi olan bir karta isaret eder', () => {
  const p = tohum();
  const ids = new Set(p.cards.map((c) => c.id));
  for (const block of BLOCKS) {
    for (const id of p.routine[block]) {
      assert.ok(ids.has(id), `${id} icin kart yok`);
    }
  }
});

test('her kartin blogu rutin listesindeki blokla ayni', () => {
  const p = tohum();
  const byId = new Map(p.cards.map((c) => [c.id, c]));
  for (const block of BLOCKS) {
    for (const id of p.routine[block]) {
      assert.equal(byId.get(id).block, block, `${id} yanlis blokta`);
    }
  }
});

test('her kart tam olarak bir rutin listesinde gecer', () => {
  const p = tohum();
  const hepsi = BLOCKS.flatMap((b) => p.routine[b]);
  assert.equal(hepsi.length, new Set(hepsi).size, 'tekrarli id var');
  assert.equal(hepsi.length, p.cards.length, 'listelenmeyen kart var');
});

test('kart tipleri gecerli', () => {
  const gecerli = new Set(['measured', 'approved', 'inapp', 'silent']);
  for (const c of DEFAULT_CARDS) {
    assert.ok(gecerli.has(c.type), `${c.id} gecersiz tip: ${c.type}`);
  }
});

test('yildiz ve dakika negatif olamaz', () => {
  for (const c of DEFAULT_CARDS) {
    assert.ok(c.stars >= 0, `${c.id} negatif yildiz`);
    assert.ok(c.minutes >= 0, `${c.id} negatif dakika`);
  }
});

test('mukemmel gun dakika tavanina ulasir, yani tavan anlamli', () => {
  const p = tohum();
  const toplam = p.cards.reduce((s, c) => s + c.minutes, 0);
  assert.ok(toplam >= p.settings.dailyMinuteCap, 'tavan hicbir zaman devreye girmiyor');
});

test('anneye yardim karti en yuksek puanli onayli kartlardan', () => {
  const yardim = DEFAULT_CARDS.find((c) => c.id === 'aksam-sofra');
  const onayli = DEFAULT_CARDS.filter((c) => c.type === 'approved');
  assert.equal(yardim.stars, Math.max(...onayli.map((c) => c.stars)));
});

test('seedProfile cagrilari birbirini etkilemez', () => {
  const a = tohum();
  const b = tohum();
  a.cards[0].stars = 999;
  a.rewards[0].target = 1;
  assert.equal(b.cards[0].stars, DEFAULT_CARDS[0].stars);
  assert.equal(b.rewards[0].target, DEFAULT_REWARDS[0].target);
});

test('1B de hicbir kart dogrulamasiz odeme yapmaz', () => {
  // measured ve inapp kartlar tamamlaninca dogrudan puan verir.
  // Bu tiplerin gercek akislari 1C'de gelecek; o zamana kadar tohum
  // veride kullanilmazlar, yoksa cocuk tek dokunusla puan alir.
  for (const c of DEFAULT_CARDS) {
    assert.equal(c.type, 'approved', `${c.id} onaya bagli olmali (1C'ye kadar)`);
  }
});
