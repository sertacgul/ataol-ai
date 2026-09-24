// tests/ingilizce-anlatim.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingAnlatimModeli, ingAnlatimSesi, ingBaslangic } from '../src/views/ingilizce.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { TAKVIM } from '../src/data/mufredat.js';

test('icerik gelmeden once cocuga ne zaman baslayacagi soylenir', () => {
  // 2. hafta tekrar haftasi; Ingilizce 4. haftada basliyor.
  const b = ingBaslangic(2, ING_HAFTALAR, TAKVIM);
  assert.equal(b.hafta, 4);
  assert.equal(b.tarihMetni, '5 - 9 Ekim');
});

test('baslangic ONUMUZDEKI ilk icerikli haftadir', () => {
  assert.equal(ingBaslangic(3, ING_HAFTALAR, TAKVIM).hafta, 4);
});

test('icerigi yazilmis haftalar gecildiyse baslangic yok', () => {
  // 9. haftada "4. haftada basliyor" demek yanlis olurdu.
  const son = Math.max(...ING_HAFTALAR.map((h) => h.hafta));
  assert.equal(ingBaslangic(son + 2, ING_HAFTALAR, TAKVIM), null);
});

test('hafta bilinmiyorsa (tatil, yil disi) ilk icerikli hafta', () => {
  assert.equal(ingBaslangic(null, ING_HAFTALAR, TAKVIM).hafta, ING_HAFTALAR[0].hafta);
});

const H4 = ING_HAFTALAR[0];

test('anlatim modeli adimin iki dilini ve sayaci tasir', () => {
  const m = ingAnlatimModeli(H4, 0);
  assert.equal(m.adim.tr, H4.anlatim[0].tr);
  assert.equal(m.adim.en, H4.anlatim[0].en);
  assert.equal(m.index, 0);
  assert.equal(m.toplam, H4.anlatim.length);
  assert.equal(m.sonMu, false);
});

test('anlatim indexi sinirlarin disina tasmaz', () => {
  assert.equal(ingAnlatimModeli(H4, -3).index, 0);
  const son = ingAnlatimModeli(H4, 99);
  assert.equal(son.index, H4.anlatim.length - 1);
  assert.equal(son.sonMu, true);
});

test('anlatim modeli ses kimliklerini TURETIR', () => {
  // Uretim (tools/ses-uret.js) ve okuma ayni fonksiyondan gelir; iki
  // yerde elle yazilsaydi biri degisip digeri unutulurdu.
  const m = ingAnlatimModeli(H4, 1);
  assert.deepEqual(m.ses, ingAnlatimSesi(H4.hafta, H4.anlatim[1].id));
});

test('ses kimligi kaliba uyar: Turkce anlatim ve Ingilizce ornek ayri', () => {
  assert.deepEqual(ingAnlatimSesi(4, 'a1'), { tr: 'tr-ing/4-a1', en: 'en-ing/4-a1' });
});

test('her haftanin her adiminin ses kimligi benzersiz', () => {
  const hepsi = ING_HAFTALAR.flatMap((h) => h.anlatim.map((a) => {
    const s = ingAnlatimSesi(h.hafta, a.id);
    return [s.tr, s.en];
  })).flat();
  assert.equal(hepsi.length, new Set(hepsi).size);
});
