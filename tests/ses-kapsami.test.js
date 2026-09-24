// tests/ses-kapsami.test.js
//
// Uygulamanin okudugu HER metnin mp3'u diskte olmali. Cihaz sesi (TTS)
// her yerde calismiyor: Windows'ta cogu zaman Turkce ses yok, Android'de
// ses motoru ureticiye gore degisiyor, iOS okumayi yalniz dokunusun
// icinde baslatiyor. Her cihazda ayni calisan tek sey hazir dosya; TTS
// yalniz son care.
//
// Kelime ve ornek cumle sesleri ingilizce-butunluk.test.js'te korunuyor.
// Kimlikler uygulamanin ve tools/ses-uret.js'in kullandigi fonksiyonlarla
// TURETILIR; elle yazilan bir liste yeni icerikle birlikte buyumeyi unuturdu.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { KONULAR } from '../src/data/konular/index.js';
import { adimKimligi } from '../src/views/ders.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { ingAnlatimSesi } from '../src/views/ingilizce.js';

const var_ = (id) => existsSync(new URL(`../sesler/${id}.mp3`, import.meta.url));

test('matematik anlatiminin her adiminin sesi var', () => {
  const eksik = [];
  for (const [konuId, konu] of Object.entries(KONULAR)) {
    for (const s of konu.seviyeler) {
      for (const a of s.anlatim) {
        const id = adimKimligi(konuId, s.seviye, a.id);
        if (!var_(id)) eksik.push(id);
      }
    }
  }
  assert.deepEqual(eksik, [],
    `sesi uretilmemis adim: ${eksik.join(', ')} -> node tools/ses-uret.js`);
});

test('Ingilizce anlatimin her adiminin Turkce ve Ingilizce sesi var', () => {
  const eksik = [];
  for (const h of ING_HAFTALAR) {
    for (const a of h.anlatim) {
      const s = ingAnlatimSesi(h.hafta, a.id);
      if (!var_(s.tr)) eksik.push(s.tr);
      if (!var_(s.en)) eksik.push(s.en);
    }
  }
  assert.deepEqual(eksik, [],
    `sesi uretilmemis anlatim: ${eksik.join(', ')} -> node tools/ses-uret.js ingilizce-anlatim`);
});
