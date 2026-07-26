/**
 * Basarim rozetleri. Oyunlarin arasini baglayan tanima katmani: yildiz
 * (para) degil, "sen sunu basardin" demek. v1'deki rozet fikrinin, v2'nin
 * oyunlarina yayilmis hali.
 *
 * Saf kalir: sayaclari disaridan alir, tarih/rastgele kullanmaz. Gunun
 * "aktif" olup olmadigini cagiran taraf (main.js) hesaplar; buraya yalniz
 * hazir boolean dizisi ve sayilar gelir.
 */

export const ROZETLER = [
  { id: 'kasif', emoji: '🔭', hedef: 10 },
  { id: 'matematikci', emoji: '🧮', hedef: 50 },
  { id: 'muhendis', emoji: '🛠️', hedef: 9 },
  { id: 'satrancci', emoji: '♟️', hedef: 3 },
  { id: 'sanatci', emoji: '🎨', hedef: 5 },
  { id: 'seri', emoji: '🔥', hedef: 7 }
];

/**
 * Her rozetin ham ilerleme sayisi. istatistik nesnesi + gunluk seri +
 * cizim galerisi boyutu birlestirilir.
 */
export function rozetSayaclari(ist, seri, cizimSayisi) {
  const g = ist ?? {};
  return {
    kasif: Array.isArray(g.okunanKahramanlar) ? g.okunanKahramanlar.length : 0,
    matematikci: Number.isFinite(g.matematikDogru) ? g.matematikDogru : 0,
    muhendis: Array.isArray(g.kurulanMakineler) ? g.kurulanMakineler.length : 0,
    satrancci: Number.isFinite(g.satrancGalibiyet) ? g.satrancGalibiyet : 0,
    sanatci: Number.isFinite(cizimSayisi) ? cizimSayisi : 0,
    seri: Number.isFinite(seri) ? seri : 0
  };
}

/**
 * Her rozet icin { id, emoji, hedef, n, kazanildi }. n hedefte kirpilir ki
 * ilerleme cubugu tasmasin.
 */
export function rozetDurumu(ist, seri, cizimSayisi) {
  const s = rozetSayaclari(ist, seri, cizimSayisi);
  return ROZETLER.map((r) => {
    const ham = s[r.id] ?? 0;
    return {
      id: r.id,
      emoji: r.emoji,
      hedef: r.hedef,
      n: Math.min(ham, r.hedef),
      kazanildi: ham >= r.hedef
    };
  });
}

export function kazanilanSayisi(ist, seri, cizimSayisi) {
  return rozetDurumu(ist, seri, cizimSayisi).filter((r) => r.kazanildi).length;
}

/**
 * Gunluk seri. aktifGunler: bugunden geriye siralanmis boolean dizisi
 * ([bugun, dun, onceki gun, ...]). Bugun (index 0) henuz yapilmamis
 * olabilir; o yuzden ilk gun bos ise seri kirilmaz, dunden sayilir.
 */
export function seriHesapla(aktifGunler) {
  const dizi = Array.isArray(aktifGunler) ? aktifGunler : [];
  let seri = 0;
  for (let i = 0; i < dizi.length; i++) {
    if (dizi[i]) seri++;
    else if (i === 0) continue;
    else break;
  }
  return seri;
}
