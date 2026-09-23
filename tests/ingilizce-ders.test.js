import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ING_ASAMALAR, ING_YILDIZ, bosIngHafta, ingHaftaKaydi, ingHaftaDurumu,
  kartGoruldu, dinleBitir
} from '../src/engines/ingilizce/ders.js';
import { YILDIZ } from '../src/engines/ders.js';

const KELIMELER = ['teacher', 'student', 'school', 'book'];

test('bes asama var ve sirasi sabit', () => {
  assert.deepEqual(ING_ASAMALAR, ['kelime', 'dinle', 'soyle', 'cumle', 'quiz']);
});

test('hafta basina yildiz matematikle AYNI: 13', () => {
  const hafta = ING_YILDIZ.kelime + ING_YILDIZ.dinle + ING_YILDIZ.soyle
    + ING_YILDIZ.cumle + ING_YILDIZ.quizGecme;
  assert.equal(hafta, 13);
  const matematik = YILDIZ.anlatim + YILDIZ.etkilesim + 0 + YILDIZ.quizGecme;
  assert.equal(hafta, matematik,
    'yildiz iki ders arasinda ortak para birimi; biri fazla oderse cocuk dersi degil odulu secer');
});

test('tema sinavi matematikteki unite sinaviyla ayni oder', () => {
  assert.equal(ING_YILDIZ.temaSinavi, YILDIZ.uniteSinavi);
});

test('sinirsiz tekrar edilen asamalar yildiz VERMEZ', () => {
  assert.equal(ING_YILDIZ.soyle, 0);
  assert.equal(ING_YILDIZ.cumle, 0);
});

test('bos kayit quiz ve yildizAlinan alanlarini tasir', () => {
  const k = bosIngHafta();
  assert.deepEqual(k.quiz, { enIyi: 0, denemeler: 0 },
    'quizBitir bu sekli bekliyor');
  assert.deepEqual(k.yildizAlinan, [], 'yildizVer bu alani bekliyor');
  assert.deepEqual(k.kelimeler, []);
  assert.equal(k.dinleBitti, false);
});

test('ingHaftaKaydi bozuk kayitta cokmez', () => {
  for (const bozuk of [null, undefined, 'metin', 42, [], true]) {
    const k = ingHaftaKaydi({ haftalar: { '4': bozuk } }, 4);
    assert.deepEqual(k, bosIngHafta(), `${JSON.stringify(bozuk)} varsayilana dusmedi`);
  }
  assert.deepEqual(ingHaftaKaydi(null, 4), bosIngHafta());
});

test('ingHaftaKaydi dogru tipteki alanlari KORUR', () => {
  const kayit = { kelimeler: ['teacher'], dinleBitti: true,
    quiz: { enIyi: 80, denemeler: 2 }, yildizAlinan: ['kelime'] };
  const k = ingHaftaKaydi({ haftalar: { '4': kayit } }, 4);
  assert.deepEqual(k.kelimeler, ['teacher']);
  assert.equal(k.dinleBitti, true);
  assert.equal(k.quiz.enIyi, 80);
  assert.deepEqual(k.yildizAlinan, ['kelime']);
});

test('kelime asamasi TUM kartlar gorulunce tamam olur', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER.slice(0, 3)) k = kartGoruldu(k, id, KELIMELER).kayit;
  assert.equal(ingHaftaDurumu(KELIMELER, k).asamalar.kelime.tamam, false,
    '3/4 kart tamam sayilmamali');
  k = kartGoruldu(k, KELIMELER[3], KELIMELER).kayit;
  assert.equal(ingHaftaDurumu(KELIMELER, k).asamalar.kelime.tamam, true);
});

test('bos kelime listesi TAMAM sayilmaz', () => {
  // Icerigi yazilmamis hafta ilerleme sayilmamali, yoksa bedava yildiz.
  assert.equal(ingHaftaDurumu([], bosIngHafta()).asamalar.kelime.tamam, false);
});

test('ayni kart iki kez gorulunce sayac artmaz', () => {
  let k = kartGoruldu(bosIngHafta(), 'teacher', KELIMELER).kayit;
  k = kartGoruldu(k, 'teacher', KELIMELER).kayit;
  assert.deepEqual(k.kelimeler, ['teacher']);
});

test('kelime yildizi BIR KEZ odenir', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER) k = kartGoruldu(k, id, KELIMELER).kayit;
  const ilk = kartGoruldu(k, KELIMELER[0], KELIMELER);
  assert.equal(ilk.kazanilanYildiz, 0, 'tum kartlar zaten goruldu');

  let t = bosIngHafta();
  let toplam = 0;
  for (const id of KELIMELER) {
    const s = kartGoruldu(t, id, KELIMELER); t = s.kayit; toplam += s.kazanilanYildiz;
  }
  assert.equal(toplam, ING_YILDIZ.kelime, 'yildiz son kartta bir kez odenmeli');
});

test('dinle-sec gecme esigi ve yildizi', () => {
  const dusuk = dinleBitir(bosIngHafta(), 5, 10);
  assert.equal(dusuk.gecti, false);
  assert.equal(dusuk.kazanilanYildiz, 0);
  assert.equal(dusuk.kayit.dinleBitti, false);

  const yuksek = dinleBitir(bosIngHafta(), 8, 10);
  assert.equal(yuksek.gecti, true);
  assert.equal(yuksek.kazanilanYildiz, ING_YILDIZ.dinle);
  assert.equal(yuksek.kayit.dinleBitti, true);
});

test('dinle-sec tekrar gecmek yildiz ODEMEZ', () => {
  const ilk = dinleBitir(bosIngHafta(), 10, 10);
  const tekrar = dinleBitir(ilk.kayit, 10, 10);
  assert.equal(tekrar.kazanilanYildiz, 0);
  assert.equal(tekrar.gecti, true, 'gectigi yine dogru raporlanmali');
});

test('sifir soruda dinle-sec gecmez, bolme hatasi vermez', () => {
  const s = dinleBitir(bosIngHafta(), 0, 0);
  assert.equal(s.gecti, false);
  assert.ok(Number.isFinite(s.kazanilanYildiz));
});

test('bitti yalniz BES asama da tamamken true', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER) k = kartGoruldu(k, id, KELIMELER).kayit;
  k = dinleBitir(k, 10, 10).kayit;
  k = { ...k, soyleBitti: true, cumleBitti: true };
  assert.equal(ingHaftaDurumu(KELIMELER, k).bitti, false, 'quiz eksikken bitmis sayilmamali');
  k = { ...k, quiz: { enIyi: 80, denemeler: 1 } };
  assert.equal(ingHaftaDurumu(KELIMELER, k).bitti, true);
});
