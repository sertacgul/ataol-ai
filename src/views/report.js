/**
 * Ebeveyn ilerleme raporunun saf mantigi.
 *
 * Cocugun son gunlerdeki emegini ozetler: gunluk yildiz, dakika ve
 * tamamlanan gorev sayisi. Hekime goturulebilecek surekli veri (basari
 * olcutu) buradan beslenir.
 *
 * Saf: allDays ve dayKey listesi girer, sayilar cikar. Tarih HESAPLAMAZ;
 * gun anahtarlarini cagiran (main.js) uretir.
 */

// Tamamlanmis kart: 'done' durumundaki kart. 'awaiting_approval' henuz
// onaylanmadigi icin sayilmaz; 'done' hem olculen hem onaylanan sondur.
function tamamlananSayisi(dayProgress) {
  return Object.values(dayProgress?.cards ?? {}).filter((c) => c && c.state === 'done').length;
}

/**
 * anahtarlar: eskiden yeniye siralanmis dayKey dizisi (son N gun).
 * Veri olmayan gun sifir sayilir (o gun uygulama acilmamis).
 */
export function ilerlemeSerisi(allDays, anahtarlar) {
  return anahtarlar.map((key) => {
    const dp = allDays[key];
    return {
      key,
      stars: dp?.stars ?? 0,
      dakika: dp?.minutes ?? 0,
      tamamlanan: tamamlananSayisi(dp)
    };
  });
}

export function ilerlemeOzeti(seri) {
  return {
    toplamYildiz: seri.reduce((s, g) => s + g.stars, 0),
    aktifGun: seri.filter((g) => g.stars > 0).length,
    enYuksek: seri.reduce((m, g) => Math.max(m, g.stars), 0),
    gunSayisi: seri.length
  };
}
