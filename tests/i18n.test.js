import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, anahtarlar, DILLER } from '../src/core/i18n.js';

test('t dogru dile gore ceviri dondurur', () => {
  assert.equal(t('tr', 'nav.routine'), 'Rutin');
  assert.equal(t('en', 'nav.routine'), 'Routine');
});

test('t parametreleri doldurur', () => {
  assert.equal(t('tr', 'routine.greeting', { ad: 'Deha' }), 'Merhaba Deha');
  assert.equal(t('en', 'routine.greeting', { ad: 'Deha' }), 'Hi Deha');
  assert.equal(t('tr', 'migrate.text', { n: 42 }), 'Eski uygulamadaki 42 yıldızın burada. Hepsi duruyor.');
});

test('bilinmeyen dil TR ye duser', () => {
  assert.equal(t('de', 'nav.routine'), 'Rutin');
});

test('bilinmeyen anahtar anahtarin kendini dondurur (cokmez)', () => {
  assert.equal(t('tr', 'yok.boyle.anahtar'), 'yok.boyle.anahtar');
});

test('eksik parametre yer tutucuyu bozmadan birakir', () => {
  assert.equal(t('tr', 'routine.greeting'), 'Merhaba {ad}');
});

test('iki dilin anahtar kumesi BIREBIR ayni', () => {
  const tr = new Set(anahtarlar('tr'));
  const en = new Set(anahtarlar('en'));
  const trFazla = [...tr].filter((k) => !en.has(k));
  const enFazla = [...en].filter((k) => !tr.has(k));
  assert.deepEqual(trFazla, [], `EN de eksik: ${trFazla.join(', ')}`);
  assert.deepEqual(enFazla, [], `TR de eksik: ${enFazla.join(', ')}`);
});

test('desteklenen diller', () => {
  assert.deepEqual(DILLER, ['tr', 'en']);
});
