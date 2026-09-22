import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uret, COKGENLER, ucgenTuru, kesisirMi, UCGEN_TURU_ADI
} from '../src/engines/uretici/cokgenler-cember.js';
import { ureticiyiSina, tohumluRng } from './yardim/soru-sozlesmesi.js';

test('ucgenTuru kenarlardan turu dogru hesaplar', () => {
  assert.equal(ucgenTuru(5, 5, 5), 'eskenar');
  assert.equal(ucgenTuru(5, 5, 8), 'ikizkenar');
  assert.equal(ucgenTuru(5, 8, 5), 'ikizkenar');
  assert.equal(ucgenTuru(8, 5, 5), 'ikizkenar');
  assert.equal(ucgenTuru(3, 5, 7), 'cesitkenar');
});

test('her ucgen turunun Turkce adi vardir', () => {
  for (const t of ['eskenar', 'ikizkenar', 'cesitkenar']) {
    assert.ok(UCGEN_TURU_ADI[t], `${t} icin ad yok`);
  }
});

test('kesisirMi ucgen esitsizligini uygular', () => {
  assert.equal(kesisirMi(5, 5, 6), true);
  assert.equal(kesisirMi(5, 5, 10), false, 'teget durum iki noktada kesismez');
  assert.equal(kesisirMi(5, 5, 11), false, 'ayrik cemberler kesismez');
  assert.equal(kesisirMi(3, 9, 5), false, 'ic ice cemberler kesismez');
  assert.equal(kesisirMi(3, 9, 7), true);
});

test('cokgen tablosu 3 ile 8 kenar arasini kapsar', () => {
  const kenarlar = COKGENLER.map((c) => c.kenar).sort((a, b) => a - b);
  assert.deepEqual(kenarlar, [3, 4, 5, 6, 7, 8]);
});

for (const seviye of [1, 2, 3, 4]) {
  test(`seviye ${seviye} sozlesmeye 200 tohumda uyar`, () => {
    ureticiyiSina(uret, seviye, (soru) => {
      assert.ok(soru.tip.length > 0);
    });
  });
}

test('seviye 1 ve 2 cokgen sorusu, seviye 3 ve 4 cember sorusu uretir', () => {
  const cokgenTipleri = new Set();
  const cemberTipleri = new Set();
  for (let t = 1; t <= 200; t++) {
    cokgenTipleri.add(uret(1, tohumluRng(t)).tip);
    cokgenTipleri.add(uret(2, tohumluRng(t)).tip);
    cemberTipleri.add(uret(3, tohumluRng(t)).tip);
    cemberTipleri.add(uret(4, tohumluRng(t)).tip);
  }
  for (const tip of cokgenTipleri) assert.ok(tip.startsWith('cokgen-'), tip);
  for (const tip of cemberTipleri) assert.ok(tip.startsWith('cember-'), tip);
});

test('cokgen olusum sorusunda dogru cevap dogru sayisidir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(1, tohumluRng(t));
    if (soru.tip !== 'cokgen-olusum') continue;
    const kenar = soru.gorsel.kenar;
    const beklenen = COKGENLER.find((c) => c.kenar === kenar).ad;
    assert.equal(soru.secenekler[soru.dogru], beklenen);
  }
});

test('kenar-kose sorusunda kenar sayisi kose sayisina esittir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'cokgen-kenar-kose') continue;
    assert.equal(Number(soru.secenekler[soru.dogru]), soru.gorsel.kenar);
  }
});

test('cember ucgen sorusundaki ucgen gercekten var olur', () => {
  let sayac = 0;
  for (let t = 1; t <= 400; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      assert.ok(kesisirMi(r1, r2, d),
        `tohum ${t}: cemberler kesismiyor (${r1}, ${r2}, ${d}) ama ucgen soruluyor`);
      sayac++;
    }
  }
  assert.ok(sayac > 0, 'hic cember-ucgen sorusu uretilmemis');
});

test('cember ucgen sorusunun cevabi kenarlardan bagimsiz hesapla dogrulanir', () => {
  for (let t = 1; t <= 400; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      const beklenen = UCGEN_TURU_ADI[ucgenTuru(r1, r2, d)];
      assert.equal(soru.secenekler[soru.dogru], beklenen,
        `tohum ${t}: (${r1}, ${r2}, ${d}) icin yanlis tur`);
    }
  }
});

test('uc ucgen turu de zamanla uretilir', () => {
  const turler = new Set();
  for (let t = 1; t <= 600; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      turler.add(ucgenTuru(r1, r2, d));
    }
  }
  assert.deepEqual([...turler].sort(), ['cesitkenar', 'eskenar', 'ikizkenar']);
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(4, tohumluRng(21)), uret(4, tohumluRng(21)));
});
