/**
 * Ingilizce ekranlarinin saf model katmani. DOM yok.
 *
 * Mesajlar ANAHTAR olarak doner, metin olarak degil: ceviri ui/
 * katmaninda yapilir, boylece bu dosya dilden bagimsiz kalir ve
 * test edilebilir.
 */

import { ara } from '../engines/ingilizce/sozluk.js';
import { ingHaftaKaydi, ingHaftaDurumu } from '../engines/ingilizce/ders.js';

export function haftaninTemasi(temalar, haftaNo) {
  if (!Number.isInteger(haftaNo)) return null;
  return temalar.find((t) => t.haftalar.includes(haftaNo)) ?? null;
}

/** Fisher-Yates. Kaynagi degistirmez; rng disaridan gelir (saf kalir). */
function karistir(dizi, rng) {
  const out = [...dizi];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** hafta.kelimeler idlerini sozlukten cozer, bulunamayanlari atar. */
function haftaKelimeleri(hafta, sozluk) {
  return hafta.kelimeler.map((id) => sozluk.find((k) => k.id === id)).filter(Boolean);
}

/**
 * Hafta kartinin sunum modeli. ingHaftaDurumu ve ingHaftaKaydi motoru
 * dogrudan kullanir; bu fonksiyon yalnizca ekranin ihtiyaci olan sekle
 * cevirir.
 */
export function ingHaftaKarti(hafta, sozluk, ilerleme) {
  const kelimeler = haftaKelimeleri(hafta, sozluk);
  const kayit = ingHaftaKaydi(ilerleme, hafta.hafta);
  return {
    no: hafta.hafta,
    baslik: hafta.baslik,
    kelimeSayisi: kelimeler.length,
    durum: ingHaftaDurumu(kelimeler.map((k) => k.id), kayit)
  };
}

/**
 * Bir kelime kartinin sunum modeli. index sinirlarin disina tasarsa
 * en yakin gecerli karta kirpilir - cagiran (main.js) haftalar arasi
 * gezinirken negatif ya da asiri buyuk bir index gonderebilir.
 */
export function kartModeli(hafta, sozluk, index) {
  const kelimeler = haftaKelimeleri(hafta, sozluk);
  const toplam = kelimeler.length;
  const i = Math.max(0, Math.min(index, toplam - 1));
  return {
    kelime: kelimeler[i],
    index: i,
    toplam,
    sonMu: i === toplam - 1
  };
}

/**
 * Dinle-sec sorusunun sunum modeli.
 *
 * bicim kelimenin turune gore degisir: isimler dort GORSEL, fiil ve
 * ifadeler dort TURKCE METIN secenegi alir (bkz. brief - 46 kelimenin
 * 40'i isim, 6'si fiil/ifade; fiil icin dort resim zayif bir soru
 * olurdu). Celdiriciler DAIMA ayni haftanin diger kelimelerinden gelir,
 * uretici.js'teki kuralla ayni sebeple: baska haftanin kelimesi soruyu
 * kolaylastirirdi.
 */
export function dinleSecModeli(hafta, sozluk, rng, kelimeId) {
  const kelimeler = haftaKelimeleri(hafta, sozluk);
  const hedef = kelimeler.find((k) => k.id === kelimeId);
  const digerleri = kelimeler.filter((k) => k.id !== kelimeId);
  const celdiriciler = karistir(digerleri, rng).slice(0, 3);
  const secilenler = karistir([hedef, ...celdiriciler], rng);
  const bicim = hedef.tur === 'isim' ? 'gorsel' : 'metin';

  return {
    bicim,
    secenekler: secilenler.map((k) => (
      bicim === 'gorsel' ? { id: k.id, gorsel: k.gorsel } : { id: k.id, metin: k.tr }
    )),
    dogru: secilenler.findIndex((k) => k.id === kelimeId)
  };
}

export function sozlukModeli(sozluk, sorgu) {
  const sonuclar = ara(sozluk, sorgu).map((s) => ({ ...s.kelime, yon: s.yon }));
  const yazilmis = String(sorgu ?? '').trim().length > 0;

  return {
    sorgu: String(sorgu ?? ''),
    sonuclar,
    bos: sonuclar.length === 0,
    mesajAnahtari: sonuclar.length > 0
      ? null
      : (yazilmis ? 'sozluk.bulunamadi' : 'sozluk.ipucu')
  };
}
