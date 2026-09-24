// tests/ingilizce-sinav.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haftaQuizi, temaSinavi, sinavNesnesi } from '../src/engines/ingilizce/uretici.js';
import { temaSinaviDurumu } from '../src/engines/ingilizce/ders.js';
import { cevapla, puanla } from '../src/engines/sinav.js';
import { QUIZ_GECME, SINAV_GECME } from '../src/engines/ders.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

const TEMA1 = TEMALAR.find((t) => t.no === 1);
const hafta = (no) => ING_HAFTALAR.find((h) => h.hafta === no);

test('sinav nesnesi matematigin puanla motoruyla calisir', () => {
  // Ekranlar ve puanlama matematikten AYNEN kullaniliyor; soru sekli
  // uyusmazsa puanla sessizce sifir verir.
  const sorular = haftaQuizi(hafta(4), SOZLUK, tohumluRng(1), 10);
  let s = sinavNesnesi(sorular, { gecmeNotu: QUIZ_GECME, aninda: true });
  s.sorular.forEach((q, i) => { s = cevapla(s, i, q.dogru); });
  const p = puanla(s);
  assert.equal(p.yuzde, 100);
  assert.equal(p.gecti, true);
});

test('sinav nesnesi soruyu ekranin bekledigi sekle cevirir', () => {
  const sorular = haftaQuizi(hafta(4), SOZLUK, tohumluRng(2), 3);
  const s = sinavNesnesi(sorular, { gecmeNotu: QUIZ_GECME, aninda: true });
  for (const q of s.sorular) {
    assert.equal(typeof q.soru.tr, 'string', 'soruEkrani soru.soru.tr okuyor');
    assert.ok(Array.isArray(q.cozum), 'soruEkrani cozum dizisini map ediyor');
    assert.ok(q.cozum[0].length > 0);
  }
  assert.deepEqual(s.cevaplar, [null, null, null]);
  assert.equal(s.bitti, false);
});

test('tema sinavi temanin HER haftasindan soru sorar', () => {
  const haftalar = TEMA1.haftalar.map(hafta);
  const sorular = temaSinavi(haftalar, SOZLUK, tohumluRng(3), 20);
  assert.equal(sorular.length, 20);
  for (const h of haftalar) {
    const n = sorular.filter((q) => h.kelimeler.includes(q.kelimeId)).length;
    assert.equal(n, 5, `hafta ${h.hafta}: ${n} soru; dort hafta esit pay almali`);
  }
});

test('tema sinavinda celdiriciler SORUNUN KENDI haftasindan gelir', () => {
  const haftalar = TEMA1.haftalar.map(hafta);
  for (let s = 0; s < 30; s++) {
    for (const q of temaSinavi(haftalar, SOZLUK, tohumluRng(s), 20)) {
      const h = haftalar.find((x) => x.kelimeler.includes(q.kelimeId));
      const kume = new Set(h.kelimeler.flatMap((id) => {
        const k = SOZLUK.find((x) => x.id === id);
        return [k.en, k.tr];
      }));
      for (const sec of q.secenekler) {
        assert.ok(kume.has(sec), `tohum ${s}: "${sec}" hafta ${h.hafta}'ten degil`);
      }
    }
  }
});

test('tema sinavi haftalari blok halinde degil karisik sorar', () => {
  const haftalar = TEMA1.haftalar.map(hafta);
  const sorular = temaSinavi(haftalar, SOZLUK, tohumluRng(4), 20);
  const ilkBes = sorular.slice(0, 5).map((q) =>
    haftalar.find((h) => h.kelimeler.includes(q.kelimeId)).hafta);
  assert.ok(new Set(ilkBes).size > 1, `ilk bes soru tek haftadan: ${ilkBes}`);
});

test('tema sinavi ayni kelimeyi iki kez sormaz', () => {
  const haftalar = TEMA1.haftalar.map(hafta);
  const idler = temaSinavi(haftalar, SOZLUK, tohumluRng(5), 20).map((q) => q.kelimeId);
  assert.equal(idler.length, new Set(idler).size);
});

const gecmis = (enIyi) => ({ quiz: { enIyi, denemeler: 1 } });

test('tema sinavi dort quiz gecilmeden KILITLI', () => {
  const ilerleme = { haftalar: { 4: gecmis(80), 5: gecmis(90), 6: gecmis(70) }, sinavlar: {} };
  const d = temaSinaviDurumu(TEMA1, ilerleme);
  assert.equal(d.acik, false, '7. hafta quizi yokken acilmamali');
  assert.equal(d.sinavId, 'tema-1');
});

test('tema sinavi esigin ALTINDAKI quizle acilmaz', () => {
  const ilerleme = { haftalar: { 4: gecmis(80), 5: gecmis(90), 6: gecmis(70), 7: gecmis(QUIZ_GECME - 1) }, sinavlar: {} };
  assert.equal(temaSinaviDurumu(TEMA1, ilerleme).acik, false);
});

test('dort quiz gecilince tema sinavi acilir', () => {
  const ilerleme = { haftalar: { 4: gecmis(80), 5: gecmis(90), 6: gecmis(70), 7: gecmis(100) }, sinavlar: {} };
  const d = temaSinaviDurumu(TEMA1, ilerleme);
  assert.equal(d.acik, true);
  assert.equal(d.gecildi, false);
});

test('gecilmis tema sinavi gecildi olarak gorunur', () => {
  const ilerleme = {
    haftalar: { 4: gecmis(80), 5: gecmis(90), 6: gecmis(70), 7: gecmis(100) },
    sinavlar: { 'tema-1': { puan: SINAV_GECME, gecti: true, yildizAlindi: true } }
  };
  const d = temaSinaviDurumu(TEMA1, ilerleme);
  assert.equal(d.gecildi, true);
  assert.equal(d.sonPuan, SINAV_GECME);
});

test('gecip sonra kalan cocuk yine GECILDI gorur', () => {
  // sinavBitir son denemeyi yazar: gecti false olur ama yildizAlindi kalir.
  const ilerleme = {
    haftalar: {},
    sinavlar: { 'tema-1': { puan: 40, gecti: false, yildizAlindi: true } }
  };
  assert.equal(temaSinaviDurumu(TEMA1, ilerleme).gecildi, true);
});

test('bozuk ilerlemede tema sinavi durumu cokmez', () => {
  for (const bozuk of [null, undefined, {}, { haftalar: 'x', sinavlar: 42 }]) {
    const d = temaSinaviDurumu(TEMA1, bozuk);
    assert.equal(d.acik, false);
    assert.equal(d.gecildi, false);
  }
});
