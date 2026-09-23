import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haftaninTemasi, sozlukModeli } from '../src/views/ingilizce.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';

const SOZLUK = [
  { id: 'bag', en: 'bag', tr: 'çanta', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '👜' }, ornek: { en: 'A bag.', tr: 'Bir çanta.' } }
];

test('tema haftasi dogru temayi verir', () => {
  assert.equal(haftaninTemasi(TEMALAR, 4).no, 1);
  assert.equal(haftaninTemasi(TEMALAR, 12).no, 2);
  assert.equal(haftaninTemasi(TEMALAR, 37).no, 8);
});

test('temasiz haftalar null verir', () => {
  for (const h of [1, 2, 3]) {
    assert.equal(haftaninTemasi(TEMALAR, h), null, `hafta ${h} temasiz olmali`);
  }
});

test('gecersiz hafta numarasi null verir, atmaz', () => {
  assert.equal(haftaninTemasi(TEMALAR, 0), null);
  assert.equal(haftaninTemasi(TEMALAR, 99), null);
  assert.equal(haftaninTemasi(TEMALAR, null), null);
});

test('bos sorguda model bos ve ipucu mesaji tasir', () => {
  const m = sozlukModeli(SOZLUK, '');
  assert.equal(m.bos, true);
  assert.deepEqual(m.sonuclar, []);
  assert.equal(m.mesajAnahtari, 'sozluk.ipucu');
});

test('sonucsuz sorguda bulunamadi mesaji', () => {
  const m = sozlukModeli(SOZLUK, 'zzzz');
  assert.equal(m.bos, true);
  assert.equal(m.mesajAnahtari, 'sozluk.bulunamadi');
});

test('sonuclu sorguda mesaj YOK', () => {
  const m = sozlukModeli(SOZLUK, 'bag');
  assert.equal(m.bos, false);
  assert.equal(m.mesajAnahtari, null);
  assert.equal(m.sonuclar.length, 1);
});

test('sonuclar ekranin ihtiyaci olan her alani tasir', () => {
  const s = sozlukModeli(SOZLUK, 'bag').sonuclar[0];
  for (const alan of ['id', 'en', 'tr', 'tur', 'gorsel', 'ornek', 'yon']) {
    assert.ok(alan in s, `sonucta ${alan} yok`);
  }
});
