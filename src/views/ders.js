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
import { haftaBul, aktifHafta, haftaGezin } from '../engines/mufredat.js';

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

// Tatilden once biten son hafta. takvim tarih sirasina gore dizili,
// bu yuzden eslesenlerin sonuncusu en yakinidir.
function haftaOncesi(takvim, tarih) {
  const adaylar = takvim.filter((h) => h.bit < tarih);
  return adaylar.length > 0 ? adaylar[adaylar.length - 1] : null;
}

// Tatilden sonra baslayan ilk hafta.
function haftaSonrasi(takvim, tarih) {
  return takvim.find((h) => h.bas > tarih) ?? null;
}

/**
 * Ekranin hangi halde acilacagi. Tatilde ders gosterilmez ama ebeveynin
 * sabitledigi hafta varsa tatil kurali gecersizdir: cocuk tatilde de
 * calisabilmeli.
 *
 * Tatil halinde oncekiHafta/sonrakiHafta da donuyor: gezinme dugmelerinin
 * tatilde nereye gidecegini bulmasi icin. Sabit bir "son hafta" (37)
 * kullanilirsa yilin ilk tatilinde (16-20 Kasim) "sonraki hafta" dugmesi
 * olmayan bir haftaya (37) gitmeye calisir ve sessizce hicbir sey yapmaz.
 */
export function ekranDurumu(takvim, tatiller, tarih, sabitHafta) {
  const sabit = aktifHafta(takvim, tatiller, tarih, sabitHafta);
  if (sabit && Number.isInteger(sabitHafta)) return { tip: 'ders', hafta: sabit };

  const sonuc = haftaBul(takvim, tatiller, tarih);
  if (sonuc.tip === 'tatil') {
    const oncekiHafta = haftaOncesi(takvim, sonuc.bas);
    const sonrakiHafta = haftaSonrasi(takvim, sonuc.bit);
    return {
      tip: 'tatil',
      ad: sonuc.ad,
      bas: sonuc.bas,
      bit: sonuc.bit,
      oncekiHafta: oncekiHafta ? oncekiHafta.hafta : null,
      sonrakiHafta: sonrakiHafta ? sonrakiHafta.hafta : null
    };
  }
  if (sonuc.tip === 'disinda') return { tip: sonuc.once ? 'once' : 'sonra' };
  if (sonuc.hafta.dersler.length === 0) return { tip: 'sonra' };
  return { tip: 'ders', hafta: sonuc.hafta };
}

// 'sonra' halinde gezinilecek "geri" hedefi: ders iceren son hafta.
// Hafta 37 sosyal etkinlik haftasi oldugu icin (dersler: []) bu her
// zaman 36'ya denk gelir, ama sabit yazilmiyor: takvim degisirse burasi
// da kendiliginden dogru kalsin diye.
function sonDersHaftasi(takvim) {
  const dersli = takvim.filter((h) => h.dersler.length > 0);
  return dersli.length > 0 ? dersli[dersli.length - 1].hafta : null;
}

/**
 * Gezinme dugmelerinin her ekran halinde gidecegi hafta numaralari.
 *
 * Hedefi olmayan yon null doner (orn. 1. haftada "onceki", son ders
 * haftasinda "sonraki"); ui bu durumda o dugmeyi hic cizmez, cunku
 * hicbir seye gitmeyen bir dugme cocuk icin bos bir tiklamadir.
 */
export function gezinmeHedefleri(takvim, durum) {
  if (durum.tip === 'ders') {
    return {
      geri: haftaGezin(takvim, durum.hafta.hafta, -1)?.hafta ?? null,
      ileri: haftaGezin(takvim, durum.hafta.hafta, 1)?.hafta ?? null
    };
  }
  if (durum.tip === 'tatil') {
    return { geri: durum.oncekiHafta, ileri: durum.sonrakiHafta };
  }
  if (durum.tip === 'sonra') {
    return { geri: sonDersHaftasi(takvim), ileri: null };
  }
  // tip === 'once': yil henuz baslamadi, gidilecek bir hafta yok.
  return { geri: null, ileri: null };
}

/**
 * Anlatim ekraninin modeli.
 *
 * Bir hafta iki konuya baglanabildigi icin adimlar duzlestirilerek tek
 * bir sira haline getirilir. Cocuk icin bu tek bir anlatimdir; iki
 * konudan geldigini bilmesine gerek yok, ama her adim kendi konu adini
 * tasir ki basliktan nerede oldugunu anlasin.
 */
export function anlatimModeli(hafta, konular, ilerleme, index) {
  const adimlar = hafta.dersler.flatMap((d) => {
    const konu = konular[d.konu] ?? null;
    const sev = seviyeBul(konu, d.seviye);
    if (!sev) return [];
    return sev.anlatim.map((a) => ({
      kimlik: adimKimligi(d.konu, d.seviye, a.id),
      metin: a.metin,
      gorsel: a.gorsel ?? null,
      konuId: d.konu,
      konuAd: konu.ad.tr,
      seviye: d.seviye
    }));
  });

  const toplam = adimlar.length;
  const guvenli = toplam === 0 ? 0 : Math.max(0, Math.min(index, toplam - 1));
  const kayit = haftaKaydi(ilerleme, hafta.hafta);

  return {
    adimlar,
    index: guvenli,
    aktif: toplam === 0 ? null : adimlar[guvenli],
    toplam,
    sonMu: toplam > 0 && guvenli === toplam - 1,
    tamamlanan: kayit.anlatim
  };
}
