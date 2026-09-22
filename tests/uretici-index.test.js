import { test } from 'node:test';
import assert from 'node:assert/strict';
import { soruUret, karistir, secmeliKur } from '../src/engines/uretici/index.js';
import { tohumluRng, sozlesmeyiDogrula } from './yardim/soru-sozlesmesi.js';

test('bilinmeyen uretici null dondurur, atmaz', () => {
  assert.equal(soruUret('boyle-bir-konu-yok', 1, tohumluRng(1)), null);
});

test('karistir tum ogeleri korur', () => {
  const kaynak = ['a', 'b', 'c', 'd', 'e'];
  for (let t = 1; t <= 50; t++) {
    const sonuc = karistir(kaynak, tohumluRng(t));
    assert.equal(sonuc.length, kaynak.length);
    assert.deepEqual([...sonuc].sort(), [...kaynak].sort());
  }
});

test('karistir kaynagi degistirmez', () => {
  const kaynak = ['a', 'b', 'c'];
  karistir(kaynak, tohumluRng(1));
  assert.deepEqual(kaynak, ['a', 'b', 'c']);
});

test('karistir gercekten karistirir', () => {
  const kaynak = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let farkli = 0;
  for (let t = 1; t <= 50; t++) {
    if (karistir(kaynak, tohumluRng(t)).join('') !== kaynak.join('')) farkli++;
  }
  assert.ok(farkli > 40, `50 denemede yalniz ${farkli} kez karisti`);
});

test('secmeliKur dogru indeksi karistirmadan sonra dogru gosterir', () => {
  for (let t = 1; t <= 100; t++) {
    const soru = secmeliKur({
      tip: 'deneme',
      soru: 'Bu bir deneme sorusudur, cevabi nedir?',
      dogruCevap: '42',
      celdiriciler: ['41', '43', '24'],
      cozum: ['Cunku oyle']
    }, tohumluRng(t));

    sozlesmeyiDogrula(soru, `secmeliKur tohum ${t}`);
    assert.equal(soru.secenekler[soru.dogru], '42');
  }
});

test('secmeliKur tekrar eden celdiriciyi eler', () => {
  const soru = secmeliKur({
    tip: 'deneme',
    soru: 'Bu bir deneme sorusudur, cevabi nedir?',
    dogruCevap: '42',
    celdiriciler: ['41', '41', '42', '43'],
    cozum: ['Cunku oyle']
  }, tohumluRng(7));

  assert.equal(new Set(soru.secenekler).size, soru.secenekler.length);
  assert.ok(soru.secenekler.includes('42'));
});
