// tests/ingilizce-anlatim.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingAnlatimModeli, ingAnlatimSesi } from '../src/views/ingilizce.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';

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
