import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMALAR, TEMA_IDLERI } from '../src/data/ingilizce/temalar.js';
import { TAKVIM } from '../src/data/mufredat.js';

test('sekiz tema var ve numaralari 1..8', () => {
  assert.equal(TEMALAR.length, 8);
  assert.deepEqual(TEMALAR.map((t) => t.no), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(TEMA_IDLERI, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('temalarin haftalari MEB planiyla birebir', () => {
  const beklenen = {
    1: [4, 5, 6, 7],
    2: [8, 9, 10, 11, 12],
    3: [13, 14, 15, 16],
    4: [17, 18, 19, 20],
    5: [21, 22, 23, 24],
    6: [25, 26, 27, 28],
    7: [29, 30, 31, 32],
    8: [33, 34, 35, 36, 37]
  };
  for (const t of TEMALAR) {
    assert.deepEqual(t.haftalar, beklenen[t.no], `tema ${t.no} haftalari yanlis`);
  }
});

test('hafta 1-3 hicbir temaya ait degil (oryantasyon ve tekrar)', () => {
  const kapsanan = new Set(TEMALAR.flatMap((t) => t.haftalar));
  for (const h of [1, 2, 3]) {
    assert.ok(!kapsanan.has(h), `hafta ${h} temaya baglanmamali`);
  }
});

test('her hafta EN FAZLA bir temaya ait', () => {
  const sayac = new Map();
  for (const t of TEMALAR) {
    for (const h of t.haftalar) sayac.set(h, (sayac.get(h) ?? 0) + 1);
  }
  for (const [h, n] of sayac) {
    assert.equal(n, 1, `hafta ${h} ${n} temaya birden bagli`);
  }
});

test('her tema haftasi paylasilan TAKVIM icinde var', () => {
  const takvimHaftalari = new Set(TAKVIM.map((h) => h.hafta));
  for (const t of TEMALAR) {
    for (const h of t.haftalar) {
      assert.ok(takvimHaftalari.has(h), `hafta ${h} TAKVIM'de yok`);
    }
  }
});

test('4..37 arasi her hafta bir temaya ait, bosluk yok', () => {
  const kapsanan = new Set(TEMALAR.flatMap((t) => t.haftalar));
  for (let h = 4; h <= 37; h++) {
    assert.ok(kapsanan.has(h), `hafta ${h} hicbir temaya ait degil`);
  }
});

test('her temanin dort kazanim kodu var', () => {
  for (const t of TEMALAR) {
    assert.equal(t.kazanimlar.length, 4, `tema ${t.no}`);
    for (const k of t.kazanimlar) {
      assert.match(k, /^ENG\.5\.\d\.L[1-4]$/, `gecersiz kod: ${k}`);
    }
  }
});

test('tema adlari iki dilli ve bos degil', () => {
  for (const t of TEMALAR) {
    assert.ok(t.ad.en.trim().length > 0, `tema ${t.no} en adi bos`);
    assert.ok(t.ad.tr.trim().length > 0, `tema ${t.no} tr adi bos`);
  }
});
