/**
 * Quiz ve sinav motoru. Saf: rng disaridan gelir.
 *
 * Quiz ve sinav ayni motoru kullanir. Tek fark 'aninda' bayragidir:
 * quiz her soruda geri bildirim veriyor cunku OGRETME aracidir, sinav
 * sonda veriyor cunku OLCME aracidir. Ikisini ayni ekranin iki modu
 * yapmak, iki ayri sistem yazmaktan hem az kod hem az hata demek.
 *
 * Sure siniri BILEREK yoktur. 10 yasinda bir cocuk kronometreyle
 * paniklerse olculen sey matematik degil kaygi olur.
 */

import { soruUret } from './uretici/index.js';

/**
 * Sorulari kaynaklara agirlikla dagitir.
 *
 * Once her kaynaga agirligi oraninda tam sayi pay verilir, sonra
 * yuvarlamadan artan sorular en buyuk agirliktan baslayarak dagitilir.
 * Her kaynak en az 1 soru alir: bir konu sinavda hic cikmazsa o konuyu
 * olcmemis oluruz.
 */
function dagit(kaynaklar, soruSayisi) {
  const toplamAgirlik = kaynaklar.reduce((n, k) => n + k.agirlik, 0);
  const paylar = kaynaklar.map((k) => ({
    kaynak: k,
    pay: Math.max(1, Math.floor((k.agirlik / toplamAgirlik) * soruSayisi))
  }));

  let dagitilan = paylar.reduce((n, p) => n + p.pay, 0);

  // Fazla dagittiysak en cok payi olandan geri al (1'in altina inmeden).
  while (dagitilan > soruSayisi) {
    const enBuyuk = paylar.filter((p) => p.pay > 1).sort((a, b) => b.pay - a.pay)[0];
    if (!enBuyuk) break;
    enBuyuk.pay -= 1;
    dagitilan -= 1;
  }

  // Eksik kaldiysa agirligi en buyuk olana ver.
  let i = 0;
  const sirali = [...paylar].sort((a, b) => b.kaynak.agirlik - a.kaynak.agirlik);
  while (dagitilan < soruSayisi) {
    sirali[i % sirali.length].pay += 1;
    dagitilan += 1;
    i += 1;
  }

  return paylar;
}

export function sinavKur({ kaynaklar, soruSayisi, gecmeNotu, aninda = false }, rng) {
  const paylar = dagit(kaynaklar, soruSayisi);

  const sorular = [];
  const soruKaynagi = [];
  for (const { kaynak, pay } of paylar) {
    for (let n = 0; n < pay; n++) {
      sorular.push(soruUret(kaynak.ureticiId, kaynak.seviye, rng));
      soruKaynagi.push(kaynak.ureticiId);
    }
  }

  // Konular bloklar halinde degil karisik gelsin; art arda ayni konu
  // gelirse cocuk sinavi "bitti mi" diye degil "hala mi" diye yasar.
  const sira = sorular.map((_, i) => i);
  for (let i = sira.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [sira[i], sira[j]] = [sira[j], sira[i]];
  }

  return {
    sorular: sira.map((i) => sorular[i]),
    soruKaynagi: sira.map((i) => soruKaynagi[i]),
    cevaplar: sira.map(() => null),
    gecmeNotu,
    aninda,
    bitti: false
  };
}

export function cevapla(sinav, index, secilen) {
  if (!Number.isInteger(index) || index < 0 || index >= sinav.sorular.length) return sinav;
  const cevaplar = [...sinav.cevaplar];
  cevaplar[index] = secilen;
  return { ...sinav, cevaplar };
}

export function puanla(sinav) {
  const konuBazli = {};
  let dogru = 0;

  sinav.sorular.forEach((soru, i) => {
    const kaynak = sinav.soruKaynagi[i];
    if (!konuBazli[kaynak]) konuBazli[kaynak] = { dogru: 0, toplam: 0 };
    konuBazli[kaynak].toplam += 1;

    if (sinav.cevaplar[i] === soru.dogru) {
      dogru += 1;
      konuBazli[kaynak].dogru += 1;
    }
  });

  const toplam = sinav.sorular.length;
  const yuzde = toplam === 0 ? 0 : Math.round((dogru / toplam) * 100);

  return { dogru, toplam, yuzde, gecti: yuzde >= sinav.gecmeNotu, konuBazli };
}

/**
 * Bir unitenin kaynak listesi: o unitedeki her konu-seviye cifti bir
 * kaynaktir ve agirligi 1'dir. Boylece 5 seviyeli bir konu, 2 seviyeli
 * bir konudan iki buçuk kat fazla soru alir; unitede ne kadar zaman
 * gecirdiyse sinavda o kadar yer kaplar.
 */
export function agirlikHesapla(takvim, uniteId) {
  const kaynaklar = [];
  for (const hafta of takvim) {
    if (hafta.unite !== uniteId) continue;
    for (const ders of hafta.dersler) {
      kaynaklar.push({ ureticiId: ders.konu, seviye: ders.seviye, agirlik: 1 });
    }
  }
  return kaynaklar;
}
