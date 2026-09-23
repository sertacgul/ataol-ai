/**
 * Ingilizce ekranlarinin saf model katmani. DOM yok.
 *
 * Mesajlar ANAHTAR olarak doner, metin olarak degil: ceviri ui/
 * katmaninda yapilir, boylece bu dosya dilden bagimsiz kalir ve
 * test edilebilir.
 */

import { ara } from '../engines/ingilizce/sozluk.js';

export function haftaninTemasi(temalar, haftaNo) {
  if (!Number.isInteger(haftaNo)) return null;
  return temalar.find((t) => t.haftalar.includes(haftaNo)) ?? null;
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
