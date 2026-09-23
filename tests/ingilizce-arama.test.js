import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ara } from '../src/engines/ingilizce/sozluk.js';
import { SOZLUK as GERCEK_SOZLUK } from '../src/data/ingilizce/sozluk/index.js';

const SOZLUK = [
  { id: 'bag', en: 'bag', tr: 'çanta', tema: 1 },
  { id: 'school-bag', en: 'school bag', tr: 'okul çantası', tema: 1 },
  { id: 'school', en: 'school', tr: 'okul', tema: 1 },
  { id: 'teacher', en: 'teacher', tr: 'öğretmen', tema: 1 },
  { id: 'book', en: 'book', tr: 'kitap', tema: 2 },
  { id: 'handbag', en: 'handbag', tr: 'el çantası', tema: 3 }
];

test('Ingilizce sorgu Ingilizce tarafindan bulur', () => {
  const s = ara(SOZLUK, 'bag');
  assert.ok(s.length >= 2, 'bag ve school bag gelmeli');
  assert.equal(s[0].kelime.id, 'bag', 'tam eslesme once gelmeli');
  assert.equal(s[0].yon, 'en-tr');
});

test('Turkce sorgu Turkce tarafindan bulur', () => {
  const s = ara(SOZLUK, 'okul');
  assert.ok(s.some((x) => x.kelime.id === 'school'));
  assert.equal(s.find((x) => x.kelime.id === 'school').yon, 'tr-en');
});

test('Turkce sorgu DIAKRITIKSIZ yazilinca da bulur', () => {
  const diakritikli = ara(SOZLUK, 'çanta').map((x) => x.kelime.id);
  const duz = ara(SOZLUK, 'canta').map((x) => x.kelime.id);
  assert.deepEqual(duz, diakritikli, 'canta ile çanta ayni sonucu vermeli');
  assert.ok(duz.includes('bag'));
});

test('ogretmen diakritiksiz de bulunur', () => {
  assert.ok(ara(SOZLUK, 'ogretmen').some((x) => x.kelime.id === 'teacher'));
  assert.ok(ara(SOZLUK, 'öğretmen').some((x) => x.kelime.id === 'teacher'));
});

test('siralama: tam eslesme bastan eslesmeden once', () => {
  const s = ara(SOZLUK, 'school');
  assert.equal(s[0].kelime.id, 'school', 'tam eslesme "school" ilk olmali');
  const bag = s.findIndex((x) => x.kelime.id === 'school-bag');
  assert.ok(bag > 0, '"school bag" sonra gelmeli');
});

test('siralama: alfabetik sira tam eslesmeyi kurtaramaz', () => {
  // Yukaridaki fixture'in acigi: 'school' id'si alfabetik olarak zaten
  // 'school-bag'den once gelir, yani puanla() icindeki tam eslesme katmani
  // silinse bile beraberlik bozucu id sirasi testi yanlislikla yesile
  // tasir. Gercek SOZLUK'te 'sınıf' sorgusu ayni tuzagi TERSTEN kurar:
  // tam eslesen 'classroom' alfabetik olarak 'classmate'den SONRA gelir,
  // yani beraberlik bozucu onu kurtaramaz - tam eslesme katmani gercekten
  // calismiyorsa bu test kirmizi olur.
  const s = ara(GERCEK_SOZLUK, 'sınıf');
  assert.equal(s[0].kelime.id, 'classroom', '"sınıf" tam eslesmesi "classroom" ilk olmali');
  const classmate = s.findIndex((x) => x.kelime.id === 'classmate');
  assert.ok(classmate > 0, '"classmate" (bastan eslesme) sonra gelmeli');
});

test('kelime sinirinda eslesme icinde gecmeden once', () => {
  // 'bag' sorgusu: 'school bag' kelime SINIRINDA eslesir (2), 'handbag'
  // ise kelime ICINDE (1). Sorgu 'school' olsaydi 'school bag' zaten
  // startsWith ile 3 alirdi ve bu testin olcmek istedigi sinir dali hic
  // calismazdi - test adinin soyledigi seyi olcmezdi.
  const s = ara(SOZLUK, 'bag');
  const sinir = s.findIndex((x) => x.kelime.id === 'school-bag');
  const icinde = s.findIndex((x) => x.kelime.id === 'handbag');
  assert.ok(sinir >= 0 && icinde >= 0, 'iki kelime de sonuclarda olmali');
  assert.ok(sinir < icinde, '"school bag" (kelime siniri) "handbag"den (icinde) once gelmeli');
});

test('bos sorgu bos sonuc verir, tum sozlugu dokmez', () => {
  assert.deepEqual(ara(SOZLUK, ''), []);
  assert.deepEqual(ara(SOZLUK, '   '), []);
  assert.deepEqual(ara(SOZLUK, null), []);
});

test('eslesmeyen sorgu bos dizi verir, atmaz', () => {
  assert.deepEqual(ara(SOZLUK, 'zzzzz'), []);
});

test('limit uygulanir', () => {
  assert.equal(ara(SOZLUK, 'o', { limit: 2 }).length, 2);
});

test('ayni kelime iki yonden de eslesirse BIR KEZ doner', () => {
  const tek = [{ id: 'bus', en: 'bus', tr: 'bus durağı', tema: 5 }];
  const s = ara(tek, 'bus');
  assert.equal(s.length, 1, 'iki taraf da eslesse bile kelime bir kez listelenmeli');
});

test('sozluk bos ya da bozukken cokmez', () => {
  assert.deepEqual(ara([], 'bag'), []);
  assert.deepEqual(ara(null, 'bag'), []);
});
