/**
 * Anlatim seslerini uretir. UYGULAMANIN PARCASI DEGILDIR.
 *
 * Kullanim:
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js temel-cizimler
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js ingilizce
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js ingilizce-anlatim
 *
 * Google Cloud Text-to-Speech Chirp 3 HD, tr-TR ve en-US. Aylik ilk 1M
 * karakter ucretsiz; bu projenin tamami yaklasik 150k karakter, yani
 * ucretsiz kotaya siginir.
 *
 * Dosya adi konuId-seviye-adimId kalibindan TURETILIR; ui/ses.js ayni
 * fonksiyonu kullanir, boylece iki taraf kendiliginden eslesir.
 * Ingilizce sozluk kelimeleri icin dosya adi sesler/en/<id>.mp3 ve
 * sesler/en/<id>-ornek.mp3'tur; id SOZLUK'te kelimeKimligi() ile
 * uretilmis olarak durur, ui/ses.js okurken de ayni id'yi kullanir.
 * Ingilizce hafta anlatimi icin sesler/tr-ing/<hafta>-<adim>.mp3 (Turkce
 * aciklama) ve sesler/en-ing/<hafta>-<adim>.mp3 (Ingilizce ornek);
 * ikisi de views/ingilizce.js#ingAnlatimSesi ile turetilir.
 *
 * Var olan dosyanin ustune yazmaz. Yeniden uretmek icin once sil.
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KONULAR } from '../src/data/konular/index.js';
import { adimKimligi } from '../src/views/ders.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { ingAnlatimSesi } from '../src/views/ingilizce.js';

const KOK = fileURLToPath(new URL('..', import.meta.url));
const CIKTI = path.join(KOK, 'sesler');

const ANAHTAR = process.env.GOOGLE_TTS_KEY;
const SADECE = process.argv[2] ?? null;

const SESLER = {
  tr: { dil: 'tr-TR', ad: 'tr-TR-Chirp3-HD-Aoede' },
  en: { dil: 'en-US', ad: 'en-US-Chirp3-HD-Aoede' }
};
const UC_NOKTA = 'https://texttospeech.googleapis.com/v1/text:synthesize';

if (!ANAHTAR) {
  console.error('GOOGLE_TTS_KEY ortam degiskeni gerekli.');
  console.error('Ornek: GOOGLE_TTS_KEY=xxx node tools/ses-uret.js');
  process.exit(1);
}

function adimlariTopla() {
  const isler = [];
  for (const [konuId, konu] of Object.entries(KONULAR)) {
    if (SADECE && konuId !== SADECE) continue;
    for (const sev of konu.seviyeler) {
      for (const adim of sev.anlatim) {
        isler.push({
          kimlik: adimKimligi(konuId, sev.seviye, adim.id),
          metin: adim.metin,
          ses: SESLER.tr
        });
      }
    }
  }
  return isler;
}

function ingilizceIsleri() {
  const isler = [];
  for (const k of SOZLUK) {
    isler.push({ kimlik: `en/${k.id}`, metin: k.en, ses: SESLER.en });
    isler.push({ kimlik: `en/${k.id}-ornek`, metin: k.ornek.en, ses: SESLER.en });
  }
  return isler;
}

function ingilizceAnlatimIsleri() {
  const isler = [];
  for (const h of ING_HAFTALAR) {
    for (const a of h.anlatim) {
      const kimlik = ingAnlatimSesi(h.hafta, a.id);
      isler.push({ kimlik: kimlik.tr, metin: a.tr, ses: SESLER.tr });
      isler.push({ kimlik: kimlik.en, metin: a.en, ses: SESLER.en });
    }
  }
  return isler;
}

async function seslendir(metin, ses) {
  const yanit = await fetch(`${UC_NOKTA}?key=${ANAHTAR}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: metin },
      voice: { languageCode: ses.dil, name: ses.ad },
      // MP3 formatinda, 24 kHz, konusma hizi yavaslastilmis. Konusma
      // icin yeterli kalite, hafta basina yaklasik 1.8 MB.
      audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000, speakingRate: 0.95 }
    })
  });

  if (!yanit.ok) {
    throw new Error(`TTS ${yanit.status}: ${await yanit.text()}`);
  }
  const govde = await yanit.json();
  return Buffer.from(govde.audioContent, 'base64');
}

async function main() {
  if (!existsSync(CIKTI)) mkdirSync(CIKTI, { recursive: true });
  for (const alt of ['en', 'tr-ing', 'en-ing']) {
    mkdirSync(path.join(CIKTI, alt), { recursive: true });
  }

  let isler;
  if (SADECE === 'ingilizce') {
    isler = ingilizceIsleri();
  } else if (SADECE === 'ingilizce-anlatim') {
    isler = ingilizceAnlatimIsleri();
  } else {
    isler = adimlariTopla();
    if (!SADECE) isler = isler.concat(ingilizceIsleri(), ingilizceAnlatimIsleri());
  }
  console.log(`${isler.length} adim bulundu.`);

  let uretilen = 0;
  let atlanan = 0;
  let karakter = 0;

  for (const is of isler) {
    const hedef = path.join(CIKTI, `${is.kimlik}.mp3`);
    if (existsSync(hedef)) {
      atlanan++;
      continue;
    }

    try {
      const ses = await seslendir(is.metin, is.ses);
      writeFileSync(hedef, ses);
      uretilen++;
      karakter += is.metin.length;
      console.log(`  ${is.kimlik} (${is.metin.length} karakter)`);
    } catch (hata) {
      console.error(`  ${is.kimlik} BASARISIZ: ${hata.message}`);
    }
  }

  console.log(`\nUretilen: ${uretilen}, atlanan: ${atlanan}, karakter: ${karakter}`);
  console.log('Var olan dosyanin ustune yazilmaz; yeniden uretmek icin once sil.');
}

main().catch((hata) => {
  console.error(hata);
  process.exit(1);
});
