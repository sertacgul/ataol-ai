/**
 * Ders ekraninin saf model katmani. DOM yok; yalnizca ekranda
 * gosterilecek veriyi hazirlar.
 *
 * Adim kimligi konu ve seviyeyle nitelenir ('temel-cizimler-1-a1')
 * cunku bir hafta iki konuya birden baglanabiliyor ve iki konuda da
 * 'a1' adinda adim var. Ayni kimlik hem ilerleme kaydinda hem ses
 * dosyasi adinda kullanilir; boylece tek kaynak olur.
 */

import { haftaKaydi, haftaDurumu } from '../engines/ders.js';
import { haftaBul, aktifHafta } from '../engines/mufredat.js';

export const adimKimligi = (konuId, seviye, adimId) => `${konuId}-${seviye}-${adimId}`;

function seviyeBul(konu, no) {
  return konu?.seviyeler?.find((s) => s.seviye === no) ?? null;
}

/**
 * Hafta kartinin modeli.
 *
 * hazir: o haftanin TUM dersleri icin icerik yazilmis mi. Faz 1'de
 * yalnizca 1-8. haftalar hazirdir; digerleri kartta "icerik
 * hazirlaniyor" gosterir. Yari hazir hafta hazir sayilmaz, yoksa cocuk
 * ikinci derse tiklayip bos ekrana duser.
 */
export function haftaKarti(hafta, konular, uniteAd, ilerleme) {
  const dersler = hafta.dersler.map((d) => {
    const konu = konular[d.konu] ?? null;
    const sev = seviyeBul(konu, d.seviye);
    return {
      konuId: d.konu,
      konuAd: konu?.ad?.tr ?? d.konu,
      seviye: d.seviye,
      baslik: sev?.baslik ?? '',
      hazir: Boolean(sev)
    };
  });

  const adimIdleri = hafta.dersler.flatMap((d) => {
    const sev = seviyeBul(konular[d.konu], d.seviye);
    if (!sev) return [];
    return sev.anlatim.map((a) => adimKimligi(d.konu, d.seviye, a.id));
  });

  const kayit = haftaKaydi(ilerleme, hafta.hafta);

  return {
    no: hafta.hafta,
    bas: hafta.bas,
    bit: hafta.bit,
    uniteAd,
    dersler,
    adimIdleri,
    durum: haftaDurumu(adimIdleri, kayit),
    hazir: dersler.length > 0 && dersler.every((d) => d.hazir)
  };
}

/**
 * Ekranin hangi halde acilacagi. Tatilde ders gosterilmez ama ebeveynin
 * sabitledigi hafta varsa tatil kurali gecersizdir: cocuk tatilde de
 * calisabilmeli.
 */
export function ekranDurumu(takvim, tatiller, tarih, sabitHafta) {
  const sabit = aktifHafta(takvim, tatiller, tarih, sabitHafta);
  if (sabit && Number.isInteger(sabitHafta)) return { tip: 'ders', hafta: sabit };

  const sonuc = haftaBul(takvim, tatiller, tarih);
  if (sonuc.tip === 'tatil') return { tip: 'tatil', ad: sonuc.ad, bas: sonuc.bas, bit: sonuc.bit };
  if (sonuc.tip === 'disinda') return { tip: sonuc.once ? 'once' : 'sonra' };
  if (sonuc.hafta.dersler.length === 0) return { tip: 'sonra' };
  return { tip: 'ders', hafta: sonuc.hafta };
}
