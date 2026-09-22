import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aciTuru, ACI_TURU_ADI, butunler, tumler, tersAci, komsuAci } from '../src/engines/widgets/aci.js';

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
