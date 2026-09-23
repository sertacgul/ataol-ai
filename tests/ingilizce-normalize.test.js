import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';

test('Turkce diakritikler duz harfe iner', () => {
  assert.equal(normalize('çanta'), 'canta');
  assert.equal(normalize('öğretmen'), 'ogretmen');
  assert.equal(normalize('şişe'), 'sise');
  assert.equal(normalize('ılık'), 'ilik');
  assert.equal(normalize('üzüm'), 'uzum');
  assert.equal(normalize('ğ'), 'g');
});

test('dort I formu ayni aranabilir anahtara iner', () => {
  // 'I', 'İ', 'ı', 'i' — dört farkli form, hepsi ayni aranabilir anahtar.
  // DUZ tablosu kritik: 'ı': 'i' haritasi olmayinca bu test KIRMIZI olur.
  // toLocaleLowerCase('tr') savunma: tablo degisirse tuzak ortaya cikacak.
  const hedef = normalize('i');  // lowercase i: 'i'
  assert.equal(normalize('I'), hedef);   // LATIN CAPITAL LETTER I
  assert.equal(normalize('İ'), hedef);   // LATIN CAPITAL LETTER I WITH DOT ABOVE
  assert.equal(normalize('ı'), hedef);   // LATIN SMALL LETTER DOTLESS I
  // Existing tests validate behaviour, but this pins the DUZ dependency.
  assert.equal(normalize('IŞIK'), normalize('ışık'));
  assert.equal(normalize('İSTANBUL'), normalize('istanbul'));
  assert.equal(normalize('Iyi'), normalize('ıyi'));
});

test('aksentli Latin harfleri harita yapilir', () => {
  // DUZ_DESEN tablodan otomatik olusturulur. Tabloya harf eklemek yeterli,
  // hardcoded regex ile sapmamali.
  assert.equal(normalize('cafe'), 'cafe');
  assert.equal(normalize('café'), 'cafe');
  assert.equal(normalize('role'), 'role');
  assert.equal(normalize('rôle'), 'role');
  assert.equal(normalize('pinata'), 'pinata');
  assert.equal(normalize('piñata'), 'pinata');
});

test('bastaki ve sondaki bosluk atilir, ic bosluk korunur', () => {
  assert.equal(normalize('  school bag  '), 'school bag');
});

test('normalize bos ve gecersiz girdide cokmez', () => {
  assert.equal(normalize(''), '');
  assert.equal(normalize(null), '');
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(42), '42');
});

test('kelimeKimligi bosluklari tire yapar ve kucultur', () => {
  assert.equal(kelimeKimligi('school bag'), 'school-bag');
  assert.equal(kelimeKimligi('Science'), 'science');
  assert.equal(kelimeKimligi('go to school'), 'go-to-school');
});

test('kelimeKimligi noktalama ve apostrofu atar', () => {
  assert.equal(kelimeKimligi("What's your name?"), 'whats-your-name');
  assert.equal(kelimeKimligi('P.E.'), 'pe');
});

test('kelimeKimligi dosya adi olarak guvenli', () => {
  for (const ham of ['school bag', "What's your name?", 'P.E.', 'Maths / Science']) {
    const id = kelimeKimligi(ham);
    assert.match(id, /^[a-z0-9-]+$/, `${ham} -> ${id} dosya adi olarak guvensiz`);
    assert.ok(!id.startsWith('-') && !id.endsWith('-'), `${id} tire ile baslayip bitmemeli`);
    assert.ok(!id.includes('--'), `${id} cift tire icermemeli`);
  }
});
