import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aciTuru, ACI_TURU_ADI, butunler, tumler, tersAci, komsuAci, dogrultularArasiAci, dikMi } from '../src/engines/widgets/aci.js';

test('aci turleri sinirlariyla birlikte dogru siniflanir', () => {
  assert.equal(aciTuru(1), 'dar');
  assert.equal(aciTuru(89), 'dar');
  assert.equal(aciTuru(90), 'dik');
  assert.equal(aciTuru(91), 'genis');
  assert.equal(aciTuru(179), 'genis');
  assert.equal(aciTuru(180), 'dogru');
  assert.equal(aciTuru(360), 'tam');
});

test('her aci turunun Turkce adi vardir', () => {
  for (const tur of ['dar', 'dik', 'genis', 'dogru', 'tam']) {
    assert.ok(ACI_TURU_ADI[tur], `${tur} icin ad yok`);
  }
});

test('butunler acilari 180 yapar', () => {
  for (let a = 1; a <= 179; a++) {
    assert.equal(a + butunler(a), 180);
  }
});

test('tumler acilari 90 yapar', () => {
  for (let a = 1; a <= 89; a++) {
    assert.equal(a + tumler(a), 90);
  }
});

test('ters aci kendisine esittir', () => {
  for (let a = 1; a <= 179; a++) assert.equal(tersAci(a), a);
});

test('komsu aci butunleridir', () => {
  for (let a = 1; a <= 179; a++) assert.equal(komsuAci(a), butunler(a));
});

test('dogrultularArasiAci yonden bagimsizdir', () => {
  // Yukari cizilen dikme ile asagi cizilen dikme ayni sayiyi vermeli.
  assert.equal(dogrultularArasiAci(1, 0, 0, 1), 90);
  assert.equal(dogrultularArasiAci(1, 0, 0, -1), 90);
  assert.equal(dogrultularArasiAci(1, 0, 1, 0), 0);
});

test('dogrultularArasiAci sifir uzunlukta null doner, NaN degil', () => {
  assert.equal(dogrultularArasiAci(0, 0, 1, 1), null);
  assert.equal(dogrultularArasiAci(1, 1, 0, 0), null);
});

test('dikMi toleransi parmakla cizime izin verir ama sinirsiz degil', () => {
  const yon = (derece) => [Math.sin((derece * Math.PI) / 180), Math.cos((derece * Math.PI) / 180)];
  assert.equal(dikMi(1, 0, ...yon(0)), true, 'tam dik kabul edilmeli');
  assert.equal(dikMi(1, 0, ...yon(8)), true, 'tolerans sinirinda kabul edilmeli');
  assert.equal(dikMi(1, 0, ...yon(12)), false, '12 derece sapma dik sayilmamali');
  assert.equal(dikMi(1, 0, 1, 0), false, 'paralel cizgi dik degildir');
});
