import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER, UNITELER, KONU_IDLERI } from '../src/data/mufredat.js';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

test('37 hafta vardir ve numaralar 1den 37ye kesintisizdir', () => {
  assert.equal(TAKVIM.length, 37);
  TAKVIM.forEach((h, i) => assert.equal(h.hafta, i + 1));
});

test('tum tarihler ISO bicimindedir ve bas bitten sonra degildir', () => {
  for (const h of TAKVIM) {
    assert.match(h.bas, ISO, `hafta ${h.hafta} bas`);
    assert.match(h.bit, ISO, `hafta ${h.hafta} bit`);
    assert.ok(h.bas <= h.bit, `hafta ${h.hafta} tarih siralamasi bozuk`);
  }
});

test('haftalar zaman icinde ileri gider ve ust uste binmez', () => {
  for (let i = 1; i < TAKVIM.length; i++) {
    assert.ok(
      TAKVIM[i - 1].bit < TAKVIM[i].bas,
      `hafta ${TAKVIM[i].hafta} onceki haftayla cakisiyor`
    );
  }
});

test('hicbir hafta tatil araligiyla cakismaz', () => {
  for (const h of TAKVIM) {
    for (const t of TATILLER) {
      const cakisma = h.bas <= t.bit && t.bas <= h.bit;
      assert.ok(!cakisma, `hafta ${h.hafta} "${t.ad}" ile cakisiyor`);
    }
  }
});

test('37. hafta disinda her hafta en az bir derse baglidir', () => {
  for (const h of TAKVIM) {
    if (h.hafta === 37) {
      assert.equal(h.dersler.length, 0, 'sosyal etkinlik haftasinda ders olmaz');
      continue;
    }
    assert.ok(h.dersler.length >= 1 && h.dersler.length <= 2,
      `hafta ${h.hafta} ders sayisi ${h.dersler.length}`);
  }
});

test('toplam 42 konu-seviye cifti vardir', () => {
  const toplam = TAKVIM.reduce((n, h) => n + h.dersler.length, 0);
  assert.equal(toplam, 42);
});

test('her ders bilinen bir konuya isaret eder', () => {
  for (const h of TAKVIM) {
    for (const d of h.dersler) {
      assert.ok(KONU_IDLERI.includes(d.konu),
        `hafta ${h.hafta}: bilinmeyen konu "${d.konu}"`);
      assert.ok(Number.isInteger(d.seviye) && d.seviye >= 1,
        `hafta ${h.hafta}: gecersiz seviye`);
    }
  }
});

test('her konunun seviyeleri 1den baslar ve bosluksuz artar', () => {
  const gorulen = new Map();
  for (const h of TAKVIM) {
    for (const d of h.dersler) {
      if (!gorulen.has(d.konu)) gorulen.set(d.konu, []);
      gorulen.get(d.konu).push(d.seviye);
    }
  }
  assert.equal(gorulen.size, KONU_IDLERI.length, 'kullanilmayan konu var');
  for (const [konu, seviyeler] of gorulen) {
    const sirali = [...seviyeler].sort((a, b) => a - b);
    assert.deepEqual(sirali, seviyeler, `${konu} seviyeleri takvimde sirali degil`);
    sirali.forEach((s, i) => assert.equal(s, i + 1, `${konu} seviye bosluklu`));
  }
});

test('her hafta bilinen bir uniteye aittir', () => {
  const idler = UNITELER.map((u) => u.id);
  for (const h of TAKVIM) {
    if (h.hafta === 37) continue;
    assert.ok(idler.includes(h.unite), `hafta ${h.hafta}: bilinmeyen unite`);
  }
});

test('unite sinirlari takvimle tutarlidir', () => {
  for (const u of UNITELER) {
    const haftalar = TAKVIM.filter((h) => h.unite === u.id).map((h) => h.hafta);
    assert.ok(haftalar.length > 0, `${u.id} icin hafta yok`);
    assert.equal(Math.min(...haftalar), u.ilk, `${u.id} ilk hafta`);
    assert.equal(Math.max(...haftalar), u.son, `${u.id} son hafta`);
  }
});

test('dersSaati makul araliktadir', () => {
  for (const h of TAKVIM) {
    assert.ok(h.dersSaati >= 1 && h.dersSaati <= 5,
      `hafta ${h.hafta} ders saati ${h.dersSaati}`);
  }
});
