import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS, createDrill, factKey, selectDrillFact, recordDrillAnswer,
  isLevelMastered, nextLevel, levelById, formatQuestion
} from '../src/engines/drill.js';
import { MASTERY_BOX } from '../src/engines/leitner.js';
import { SESSION_LENGTH } from '../src/views/drill.js';

test('seviyeler sirali ve benzersiz', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(LEVELS.length >= 8);
  assert.equal(LEVELS[0].id, 'topla-10');
});

test('ilk seviye 10a kadar toplama uretir', () => {
  const f = createDrill('topla-10');
  const keys = Object.keys(f);
  assert.ok(keys.length > 0);
  for (const k of keys) {
    const { op, a, b, answer } = f[k];
    assert.equal(op, '+');
    assert.equal(answer, a + b);
    assert.ok(answer <= 10, `${k} 10u asiyor`);
    assert.ok(a >= 1 && b >= 1);
  }
});

test('cikarma seviyesinde sonuc negatif olmaz', () => {
  const f = createDrill('cikar-20');
  for (const k of Object.keys(f)) {
    assert.equal(f[k].op, '-');
    assert.ok(f[k].answer >= 0, `${k} negatif`);
    assert.equal(f[k].answer, f[k].a - f[k].b);
  }
});

test('bolme her zaman kalansiz', () => {
  const f = createDrill('bol');
  for (const k of Object.keys(f)) {
    assert.equal(f[k].op, '/');
    assert.equal(f[k].a % f[k].b, 0, `${k} kalanli`);
    assert.equal(f[k].answer, f[k].a / f[k].b);
  }
});

test('carpma seviyesi dogru tablolari icerir', () => {
  const f = createDrill('carp-2-5');
  const tablolar = new Set(Object.values(f).map((x) => x.a));
  assert.deepEqual([...tablolar].sort((x, y) => x - y), [2, 3, 4, 5]);
});

test('karisik seviye birden fazla islem icerir', () => {
  const f = createDrill('karisik');
  const islemler = new Set(Object.values(f).map((x) => x.op));
  assert.ok(islemler.size >= 3, `sadece ${[...islemler]} var`);
});

test('bilinmeyen seviye bos kume dondurur', () => {
  assert.deepEqual(createDrill('yok'), {});
});

test('factKey islem ve sayilari birlestirir', () => {
  assert.equal(factKey('x', 7, 8), '7x8');
  assert.equal(factKey('+', 3, 4), '3+4');
});

test('formatQuestion okunabilir isaret kullanir', () => {
  assert.equal(formatQuestion({ op: 'x', a: 7, b: 8 }), '7 × 8');
  assert.equal(formatQuestion({ op: '/', a: 24, b: 6 }), '24 ÷ 6');
  assert.equal(formatQuestion({ op: '-', a: 9, b: 4 }), '9 − 4');
  assert.equal(formatQuestion({ op: '+', a: 2, b: 5 }), '2 + 5');
});

test('dogru ve hizli cevap kutuyu yukseltir', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 1200, thresholdMs: 6000 });
  assert.equal(f[k].box, 2);
});

test('dogru ama yavas cevap kutuyu yukseltmez', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 9000, thresholdMs: 6000 });
  assert.equal(f[k].box, 1);
  assert.equal(f[k].correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  for (let i = 0; i < 3; i++) f = recordDrillAnswer(f, k, { correct: true, ms: 900, thresholdMs: 6000 });
  assert.equal(f[k].box, 4);
  f = recordDrillAnswer(f, k, { correct: false, ms: 2000, thresholdMs: 6000 });
  assert.equal(f[k].box, 1);
});

test('recordDrillAnswer ortalama sureyi gunceller', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 2000, thresholdMs: 6000 });
  f = recordDrillAnswer(f, k, { correct: false, ms: 4000, thresholdMs: 6000 });
  assert.equal(f[k].seen, 2);
  assert.equal(f[k].avgMs, 3000);
});

test('bilinmeyen anahtar yok sayilir', () => {
  const f = createDrill('topla-10');
  assert.deepEqual(recordDrillAnswer(f, 'yok', { correct: true, ms: 1, thresholdMs: 6000 }), f);
});

test('selectDrillFact zayif olani daha sik secer', () => {
  let f = createDrill('carp-2-5');
  const keys = Object.keys(f);
  const zayif = keys[0];
  for (const k of keys) if (k !== zayif) f[k] = { ...f[k], box: 5 };
  let hit = 0;
  for (let i = 0; i < 500; i++) {
    if (selectDrillFact(f, () => (i + 0.5) / 500) === zayif) hit++;
  }
  assert.ok(hit > 150, `zayif soru 500 secimde ${hit} kez cikti`);
});

test('tum kutular esige ulasinca seviye gecilir', () => {
  let f = createDrill('topla-10');
  for (const k of Object.keys(f)) f[k] = { ...f[k], box: MASTERY_BOX };
  assert.equal(isLevelMastered(f), true);
});

test('tek zayif kutu varken seviye gecilmez', () => {
  let f = createDrill('topla-10');
  const keys = Object.keys(f);
  for (const k of keys) f[k] = { ...f[k], box: MASTERY_BOX };
  f[keys[0]] = { ...f[keys[0]], box: 2 };
  assert.equal(isLevelMastered(f), false);
});

test('nextLevel siradaki seviyeyi verir', () => {
  assert.equal(nextLevel('topla-10'), LEVELS[1].id);
  assert.equal(nextLevel(LEVELS[LEVELS.length - 1].id), null);
  assert.equal(nextLevel('yok'), null);
});

test('levelById baslik dondurur', () => {
  assert.ok(levelById('topla-10').title.length > 0);
  assert.equal(levelById('yok'), null);
});

test('20 seviyeleri 10 seviyesinin sorularini tekrarlamaz', () => {
  const t10 = new Set(Object.keys(createDrill('topla-10')));
  for (const k of Object.keys(createDrill('topla-20'))) {
    assert.ok(!t10.has(k), `${k} topla-10 icinde de var`);
  }
  const c10 = new Set(Object.keys(createDrill('cikar-10')));
  for (const k of Object.keys(createDrill('cikar-20'))) {
    assert.ok(!c10.has(k), `${k} cikar-10 icinde de var`);
  }
});

test('topla-20 sadece 11-20 arasi toplamlari icerir', () => {
  for (const f of Object.values(createDrill('topla-20'))) {
    assert.ok(f.answer >= 11 && f.answer <= 20, `${f.a}+${f.b} aralik disi`);
    assert.ok(f.a <= 10 && f.b <= 10, `${f.a}+${f.b} tek basamakli degil`);
  }
});

test('cikar-20 sadece 11-20 arasi eksilenleri icerir', () => {
  for (const f of Object.values(createDrill('cikar-20'))) {
    assert.ok(f.a >= 11 && f.a <= 20, `${f.a}-${f.b} aralik disi`);
    assert.ok(f.answer >= 1 && f.answer <= 10, `${f.a}-${f.b} sonuc aralik disi`);
  }
});

test('gecis seviyeleri makul surede bitirilebilir', () => {
  // Gunde 10 soru, kutu 1'den 4'e 3 dogru-hizli cevap.
  // Son seviye 'karisik' bir kapi degil, bakim seviyesi; o haric.
  const TERFI = 3, TAVAN_GUN = 40;
  for (const l of LEVELS.filter((x) => x.id !== 'karisik')) {
    const n = Object.keys(createDrill(l.id)).length;
    const gun = Math.ceil((n * TERFI) / SESSION_LENGTH);
    assert.ok(gun <= TAVAN_GUN, `${l.id}: ${n} soru, ${gun} gun surer, cok uzun`);
  }
});
