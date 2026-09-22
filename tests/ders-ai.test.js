import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dersIstemi } from '../src/engines/ai.js';

const ORNEK = {
  konuAd: 'Açı Ölçme',
  kazanim: 'Açıları ölçmek için matematiksel araç ve teknolojiden yararlanabilme',
  adimMetni: 'Açıölçerin merkezini açının köşesine koy.',
  yas: 10
};

test('istem konuyu, kazanimi ve takilinan adimi icerir', () => {
  const i = dersIstemi(ORNEK);
  assert.ok(i.includes('Açı Ölçme'));
  assert.ok(i.includes(ORNEK.kazanim));
  assert.ok(i.includes(ORNEK.adimMetni));
  assert.ok(i.includes('10'));
});

test('istem yeni soru uretmeyi yasaklar', () => {
  const i = dersIstemi(ORNEK).toLocaleLowerCase('tr');
  assert.ok(i.includes('soru sorma') || i.includes('yeni soru'), 'soru uretme yasagi yok');
});

test('istem quiz ve sinav cevabi vermeyi yasaklar', () => {
  const i = dersIstemi(ORNEK).toLocaleLowerCase('tr');
  assert.ok(i.includes('cevap'), 'cevap verme yasagi yok');
});

test('istem cocuk adi icermez', () => {
  const i = dersIstemi(ORNEK);
  for (const ad of ['Deha', 'Feride', 'Sertac']) {
    assert.ok(!i.includes(ad), `istemde "${ad}" gecmemeli`);
  }
});

test('eksik alanlarla cagrilinca cokmez', () => {
  assert.equal(typeof dersIstemi({}), 'string');
  assert.ok(dersIstemi({}).length > 50);
});
