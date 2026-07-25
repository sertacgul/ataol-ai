import test from 'node:test';
import assert from 'node:assert';
import { soruUret, DERSLER } from '../src/engines/chesspuzzle.js';
import { hedefKareler } from '../src/engines/chess.js';

const sabitRng = (deger) => () => deger;

test('serbest derste tahta bostur ve cevap motorla ayni', () => {
  const s = soruUret('K', 'serbest', sabitRng(0.5));
  assert.deepStrictEqual(s.tahta, {});
  assert.deepStrictEqual(s.dogruKareler.sort(), hedefKareler('K', s.kare, {}).sort());
});

test('engelli derste gercekten engel vardir ve yol kisalir', () => {
  let engelliBulundu = false;
  for (let i = 0; i < 200; i++) {
    const rng = () => (i * 7919 % 1000) / 1000;
    const s = soruUret('K', 'engelli', rng);
    if (Object.keys(s.tahta).length === 0) continue;
    engelliBulundu = true;
    assert.ok(s.dogruKareler.length < hedefKareler('K', s.kare, {}).length,
      'engel varsa gidilebilir kare sayisi azalmali');
  }
  assert.ok(engelliBulundu, 'test bosa dondu: hic engelli soru uretilmedi');
});

test('alma dersinde tek dogru vardir ve o karede tas vardir', () => {
  for (let i = 1; i <= 50; i++) {
    const s = soruUret('A', 'alma', () => (i * 37 % 100) / 100);
    assert.strictEqual(s.dogruKareler.length, 1, 'alma dersinde tek cevap olmali');
    assert.ok(s.tahta[s.dogruKareler[0]], 'dogru karede alinacak tas olmali');
  }
});

test('hicbir soru cevapsiz kalmaz', () => {
  for (const p of ['K', 'F', 'V', 'S', 'A', 'P']) {
    for (const d of DERSLER) {
      for (let i = 1; i <= 60; i++) {
        const s = soruUret(p, d, () => (i * 31 % 100) / 100);
        assert.ok(s.dogruKareler.length > 0, `${p}/${d} cevapsiz soru uretti`);
      }
    }
  }
});

test('taslar ust uste binmez', () => {
  for (let i = 1; i <= 100; i++) {
    const s = soruUret('V', 'engelli', () => (i * 53 % 100) / 100);
    assert.ok(!s.tahta[s.kare], 'tasin kendi karesinde baska tas olamaz');
  }
});

// Buradan asagisi plana ek: uretecin OGRETTIGI seyi kilitler.
// Her testte sayac var; dal hic calismazsa test kirmizi olur.

test('engelli derste her zaman engel vardir', () => {
  let sayac = 0;
  for (const p of ['K', 'F', 'V', 'S', 'A', 'P']) {
    for (let i = 1; i <= 40; i++) {
      const s = soruUret(p, 'engelli', () => (i * 41 % 100) / 100);
      assert.ok(Object.keys(s.tahta).length > 0, `${p} engelli dersi engelsiz uretti`);
      sayac++;
    }
  }
  assert.strictEqual(sayac, 240, 'test bosa dondu');
});

test('at engelli derste de bos tahtadaki kadar kareye gider', () => {
  let sayac = 0;
  for (let i = 1; i <= 60; i++) {
    const s = soruUret('A', 'engelli', () => (i * 29 % 100) / 100);
    assert.ok(Object.keys(s.tahta).length >= 3, 'atin etrafinda engel olmali');
    assert.strictEqual(s.dogruKareler.length, hedefKareler('A', s.kare, {}).length,
      'at engelden etkilenmemeli, atin asil dersi budur');
    sayac++;
  }
  assert.strictEqual(sayac, 60, 'test bosa dondu');
});

test('piyon engelli derste onu kapalidir, cevap capraz gelir', () => {
  let sayac = 0;
  for (let i = 1; i <= 60; i++) {
    const s = soruUret('P', 'engelli', () => (i * 23 % 100) / 100);
    const sutun = s.kare[0];
    const on = `${sutun}${Number(s.kare[1]) + 1}`;
    assert.ok(s.tahta[on], 'piyonun onu kapali olmali');
    assert.ok(!s.dogruKareler.includes(on), 'piyon onundeki tasi alamaz');
    assert.ok(s.dogruKareler.length > 0 && s.dogruKareler.every((k) => k[0] !== sutun),
      'cevap yalniz caprazdan gelmeli');
    sayac++;
  }
  assert.strictEqual(sayac, 60, 'test bosa dondu');
});

test('kayan taslarda engel yolu her zaman kisaltir', () => {
  let sayac = 0;
  for (const p of ['K', 'F', 'V']) {
    for (let i = 1; i <= 60; i++) {
      const s = soruUret(p, 'engelli', () => (i * 17 % 100) / 100);
      assert.ok(s.dogruKareler.length < hedefKareler(p, s.kare, {}).length,
        `${p} icin engel yolu kisaltmadi`);
      sayac++;
    }
  }
  assert.strictEqual(sayac, 180, 'test bosa dondu');
});

// Deneme siniri asilinca donulen guvenli kurulum d4'tur. Ayni kurulum
// buradan da uretilir: 27/64 tam olarak d4'u secer.
test('guvenli kare d4 her tas ve her ders icin cevap uretir', () => {
  let sayac = 0;
  for (const p of ['K', 'F', 'V', 'S', 'A', 'P']) {
    for (const d of DERSLER) {
      const s = soruUret(p, d, () => 27 / 64);
      assert.strictEqual(s.kare, 'd4', 'guvenli kare secilmedi, test bir sey dogrulamiyor');
      assert.ok(s.dogruKareler.length > 0, `${p}/${d} d4'te cevapsiz`);
      sayac++;
    }
  }
  assert.strictEqual(sayac, 18, 'test bosa dondu');
});
