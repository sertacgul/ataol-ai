import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASAMALAR, YILDIZ, QUIZ_GECME, SINAV_GECME, ALISTIRMA_HEDEF,
  bosHafta, haftaKaydi, haftaDurumu,
  adimTamamla, etkilesimTamamla, alistirmaCevap, quizBitir, sinavBitir, tamPuanIsaretle } from '../src/engines/ders.js';

const ADIMLAR = ['a1', 'a2', 'a3'];

test('bos hafta kaydi sifirdan baslar', () => {
  const k = bosHafta();
  assert.deepEqual(k.anlatim, []);
  assert.equal(k.etkilesimBitti, false);
  assert.equal(k.alistirmaDogru, 0);
  assert.equal(k.quiz.enIyi, 0);
  assert.deepEqual(k.yildizAlinan, []);
});

test('haftaKaydi olmayan haftada bos kayit dondurur', () => {
  assert.deepEqual(haftaKaydi({ haftalar: {} }, 3), bosHafta());
});

test('haftaKaydi var olan kaydi eksik alanlariyla tamamlar', () => {
  const k = haftaKaydi({ haftalar: { 3: { anlatim: ['a1'] } } }, 3);
  assert.deepEqual(k.anlatim, ['a1']);
  assert.equal(k.alistirmaDogru, 0);
  assert.deepEqual(k.yildizAlinan, []);
});

test('adimTamamla adimi ekler ama tekrarlamaz', () => {
  let k = bosHafta();
  k = adimTamamla(k, 'a1').kayit;
  k = adimTamamla(k, 'a1').kayit;
  assert.deepEqual(k.anlatim, ['a1']);
});

test('son anlatim adimi bitince anlatim yildizi verilir', () => {
  let k = bosHafta();
  assert.equal(adimTamamla(k, 'a1', ADIMLAR).kazanilanYildiz, 0);
  k = adimTamamla(k, 'a1', ADIMLAR).kayit;
  k = adimTamamla(k, 'a2', ADIMLAR).kayit;
  const son = adimTamamla(k, 'a3', ADIMLAR);
  assert.equal(son.kazanilanYildiz, YILDIZ.anlatim);
  assert.ok(son.kayit.yildizAlinan.includes('anlatim'));
});

test('anlatim yildizi ikinci kez verilmez', () => {
  let k = bosHafta();
  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  // Ayni adimlari tekrar isaretlemek yildiz uretmemeli
  assert.equal(adimTamamla(k, 'a3', ADIMLAR).kazanilanYildiz, 0);
});

test('etkilesimTamamla bir kez yildiz verir', () => {
  const ilk = etkilesimTamamla(bosHafta());
  assert.equal(ilk.kazanilanYildiz, YILDIZ.etkilesim);
  assert.equal(ilk.kayit.etkilesimBitti, true);
  assert.equal(etkilesimTamamla(ilk.kayit).kazanilanYildiz, 0);
});

test('alistirma dogru cevabi sayar ve kutuyu saklar', () => {
  const s = alistirmaCevap(bosHafta(), 'aci-turu', { box: 2, seen: 1, correct: 1 }, true);
  assert.equal(s.kayit.alistirmaDogru, 1);
  assert.equal(s.kayit.alistirma['aci-turu'].box, 2);
});

test('alistirma yanlis cevabi sayaci artirmaz', () => {
  const s = alistirmaCevap(bosHafta(), 'aci-turu', { box: 1 }, false);
  assert.equal(s.kayit.alistirmaDogru, 0);
});

test('alistirma yildiz vermez', () => {
  let k = bosHafta();
  for (let i = 0; i < ALISTIRMA_HEDEF + 5; i++) {
    const s = alistirmaCevap(k, 'aci-turu', { box: 3 }, true);
    assert.equal(s.kazanilanYildiz, 0, 'alistirma asla yildiz vermemeli');
    k = s.kayit;
  }
});

test('quiz gecme notunu asinca yildiz verir', () => {
  const s = quizBitir(bosHafta(), 80);
  assert.equal(s.gecti, true);
  assert.equal(s.kazanilanYildiz, YILDIZ.quizGecme);
  assert.equal(s.kayit.quiz.enIyi, 80);
  assert.equal(s.kayit.quiz.denemeler, 1);
});

test('quiz tam puanda daha cok yildiz verir', () => {
  assert.equal(quizBitir(bosHafta(), 100).kazanilanYildiz, YILDIZ.quizTamPuan);
});

test('quiz gecme notunun altinda yildiz vermez ama denemeyi sayar', () => {
  const s = quizBitir(bosHafta(), QUIZ_GECME - 1);
  assert.equal(s.gecti, false);
  assert.equal(s.kazanilanYildiz, 0);
  assert.equal(s.kayit.quiz.denemeler, 1);
});

test('quiz yildizi bir kez verilir, tekrar girmek yildiz uretmez', () => {
  const ilk = quizBitir(bosHafta(), 80);
  const ikinci = quizBitir(ilk.kayit, 100);
  assert.equal(ikinci.kazanilanYildiz, 0);
  assert.equal(ikinci.kayit.quiz.enIyi, 100, 'en iyi puan yine de guncellenmeli');
  assert.equal(ikinci.kayit.quiz.denemeler, 2);
});

test('quiz en iyi puani dusurmez', () => {
  const ilk = quizBitir(bosHafta(), 90);
  const ikinci = quizBitir(ilk.kayit, 40);
  assert.equal(ikinci.kayit.quiz.enIyi, 90);
});

test('haftaDurumu asamalari ve yuzdeyi hesaplar', () => {
  let k = bosHafta();
  let d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.asamalar.anlatim.tamam, false);
  assert.equal(d.asamalar.anlatim.toplam, 3);
  assert.equal(d.yuzde, 0);
  assert.equal(d.bitti, false);

  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  k = etkilesimTamamla(k).kayit;
  d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.asamalar.anlatim.tamam, true);
  assert.equal(d.asamalar.etkilesim.tamam, true);
  assert.equal(d.yuzde, 50, '4 asamanin 2si bitti');
});

test('haftaDurumu dort asama bitince bitti der', () => {
  let k = bosHafta();
  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  k = etkilesimTamamla(k).kayit;
  for (let i = 0; i < ALISTIRMA_HEDEF; i++) {
    k = alistirmaCevap(k, 't' + i, { box: 2 }, true).kayit;
  }
  k = quizBitir(k, 90).kayit;
  const d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.yuzde, 100);
  assert.equal(d.bitti, true);
});

test('sinavBitir unite sinavinda gecince yildiz verir', () => {
  const s = sinavBitir({}, 'unite-geometrik-sekiller', { puan: 84, tarih: '2026-11-08', tip: 'unite' });
  assert.equal(s.gecti, true);
  assert.equal(s.kazanilanYildiz, YILDIZ.uniteSinavi);
  assert.equal(s.sinavlar['unite-geometrik-sekiller'].puan, 84);
});

test('sinavBitir donem sinavinda daha cok yildiz verir', () => {
  const s = sinavBitir({}, 'donem-1', { puan: 70, tarih: '2027-01-22', tip: 'donem' });
  assert.equal(s.kazanilanYildiz, YILDIZ.donemSinavi);
});

test('sinavBitir gecme notunun altinda yildiz vermez', () => {
  const s = sinavBitir({}, 'unite-geometrik-sekiller', { puan: SINAV_GECME - 1, tarih: '2026-11-08', tip: 'unite' });
  assert.equal(s.gecti, false);
  assert.equal(s.kazanilanYildiz, 0);
});

test('sinav yildizi bir kez verilir', () => {
  const ilk = sinavBitir({}, 'unite-geometrik-sekiller', { puan: 70, tarih: '2026-11-08', tip: 'unite' });
  const ikinci = sinavBitir(ilk.sinavlar, 'unite-geometrik-sekiller', { puan: 95, tarih: '2026-11-09', tip: 'unite' });
  assert.equal(ikinci.kazanilanYildiz, 0);
  assert.equal(ikinci.sinavlar['unite-geometrik-sekiller'].puan, 95);
});

test('asamalar dizisi beklenen sirada', () => {
  assert.deepEqual(ASAMALAR, ['anlatim', 'etkilesim', 'alistirma', 'quiz']);
});

test('adim listesi bos olan hafta tamamlanmis sayilmaz', () => {
  let k = bosHafta();
  k = etkilesimTamamla(k).kayit;
  for (let i = 0; i < ALISTIRMA_HEDEF; i++) {
    k = alistirmaCevap(k, 't' + i, { box: 2 }, true).kayit;
  }
  k = quizBitir(k, 90).kayit;
  // Uc asama bitmis ama anlatim adimlari listesi bos
  const d = haftaDurumu([], k);
  assert.equal(d.asamalar.anlatim.tamam, false);
  assert.equal(d.bitti, false, 'bos hafta tamamlanmis olamaz');
});

test('girdiler degistirilmez (saf kalir)', () => {
  const k = bosHafta();
  const kopya = JSON.parse(JSON.stringify(k));
  adimTamamla(k, 'a1', ADIMLAR);
  quizBitir(k, 90);
  assert.deepEqual(k, kopya);
});

test('tum motor fonksiyonlari saf kalir', () => {
  // haftaKaydi - ilerleme objesini kontrol et
  const ilerleme = { haftalar: { 3: { anlatim: ['a1'] } } };
  const ilerlemeKopya = JSON.parse(JSON.stringify(ilerleme));
  haftaKaydi(ilerleme, 3);
  assert.deepEqual(ilerleme, ilerlemeKopya);

  // etkilesimTamamla, alistirmaCevap, haftaDurumu - kayit objesini kontrol et
  const k = bosHafta();
  const kKopya = JSON.parse(JSON.stringify(k));
  etkilesimTamamla(k);
  alistirmaCevap(k, 'aci', { box: 1 }, true);
  haftaDurumu(ADIMLAR, k);
  assert.deepEqual(k, kKopya);

  // sinavBitir - sinavlar objesini kontrol et
  const sinavlar = {};
  const sinavlarKopya = JSON.parse(JSON.stringify(sinavlar));
  sinavBitir(sinavlar, 'unite-test', { puan: 80, tarih: '2026-11-08', tip: 'unite' });
  assert.deepEqual(sinavlar, sinavlarKopya);
});

// --- Tam puan rozet sayaci ------------------------------------------
// Sayac hafta basina BIR KEZ artmali: ayni haftanin quizini bes kez
// tekrarlayip "tamPuan" rozetini hak etmeden acmak mumkun olmamali.

test('tam puan ilk kez alininca sayac artar ve isaret konur', () => {
  const k = { ...bosHafta(), yildizAlinan: ['quiz'] };
  const s = tamPuanIsaretle(k, 100);
  assert.equal(s.sayacArtti, true);
  assert.ok(s.kayit.yildizAlinan.includes('tamPuan'));
});

test('ayni hafta ikinci kez tam puan alinca sayac ARTMAZ', () => {
  const k = { ...bosHafta(), yildizAlinan: ['quiz', 'tamPuan'] };
  const s = tamPuanIsaretle(k, 100);
  assert.equal(s.sayacArtti, false, 'tekrar tam puan rozeti bir daha kazandirmamali');
  assert.equal(s.kayit.yildizAlinan.filter((a) => a === 'tamPuan').length, 1,
    'isaret cogaltilmamali');
});

test('tam puanin altinda sayac artmaz', () => {
  for (const yuzde of [0, 70, 90, 99]) {
    assert.equal(tamPuanIsaretle(bosHafta(), yuzde).sayacArtti, false, `${yuzde} artirmamali`);
  }
});

test('tamPuan isareti YILDIZ VERMEZ', () => {
  const k = tamPuanIsaretle({ ...bosHafta(), yildizAlinan: [] }, 100).kayit;
  // Isaret konduktan sonra quiz yildizi hala odenebilmeli: 'tamPuan'
  // asama listesinde olmadigi icin hicbir odemeyi engellememeli.
  const sonuc = quizBitir(k, 100);
  assert.ok(sonuc.kazanilanYildiz > 0, 'tamPuan isareti quiz yildizini yutmamali');
});

test('gecilen sinav sayacinin dayandigi sinyal tekrar gecmede sifirdir', () => {
  const ilk = sinavBitir({}, 'u1', { puan: 90, tarih: '2026-10-01', tip: 'unite' });
  assert.ok(ilk.kazanilanYildiz > 0, 'ilk gecis sayilmali');
  const tekrar = sinavBitir(ilk.sinavlar, 'u1', { puan: 95, tarih: '2026-10-02', tip: 'unite' });
  assert.equal(tekrar.kazanilanYildiz, 0,
    'ayni sinavi tekrar gecmek sayaci bir daha artirmamali; main.js bu sinyale bakiyor');
  assert.equal(tekrar.gecti, true, 'ama gectigi yine de dogru raporlanmali');
});
