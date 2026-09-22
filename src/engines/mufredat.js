/**
 * Mufredat takvimi motoru. Saf: tarih disaridan 'YYYY-MM-DD' metni
 * olarak gelir, Date nesnesi ve sistem saati hic okunmaz.
 *
 * Tarihin metin olmasi bilerek: ISO tarih metinleri sozluk siralamasiyla
 * kronolojik siralanir, yani '<' ve '>' dogrudan calisir ve saat dilimi
 * kaymasi olmaz. Date kullansaydik Turkiye'de gece 01:00'de bir onceki
 * gunu gosterebilirdi.
 */

function tatilBul(tatiller, tarih) {
  return tatiller.find((t) => t.bas <= tarih && tarih <= t.bit) ?? null;
}

/**
 * Tarihin hangi haftaya dustugunu bulur.
 *
 * Hafta araliklari pazartesi-cuma; hafta sonlari bosta kalir. Bos gun
 * BIR SONRAKI haftaya sayilir, cunku cumartesi gunu uygulamayi acan
 * cocuk gecen haftayi degil onundeki haftayi gormeli.
 */
export function haftaBul(takvim, tatiller, tarih) {
  const tatil = tatilBul(tatiller, tarih);
  if (tatil) return { tip: 'tatil', ad: tatil.ad, bas: tatil.bas, bit: tatil.bit };

  const ilk = takvim[0];
  const son = takvim[takvim.length - 1];
  if (tarih < ilk.bas) return { tip: 'disinda', once: true };
  if (tarih > son.bit) return { tip: 'disinda', once: false };

  const tam = takvim.find((h) => h.bas <= tarih && tarih <= h.bit);
  if (tam) return { tip: 'ders', hafta: tam };

  // Iki hafta arasindaki bosluk (hafta sonu). Sonraki haftaya sayilir.
  const sonraki = takvim.find((h) => h.bas > tarih);
  return sonraki ? { tip: 'ders', hafta: sonraki } : { tip: 'disinda', once: false };
}

export function haftaNo(takvim, no) {
  return takvim.find((h) => h.hafta === no) ?? null;
}

/**
 * Bir onceki veya sonraki DERS haftasi. Dersi olmayan hafta (37. hafta,
 * sosyal etkinlik) atlanir; o haftada gosterilecek ders yoktur. Atlanan
 * haftadan sonra aday kalmazsa null doner.
 */
export function haftaGezin(takvim, no, yon) {
  const aday = takvim.find((h) => h.hafta === no + yon);
  if (!aday) return null;
  if (aday.dersler.length === 0) return haftaGezin(takvim, aday.hafta, yon);
  return aday;
}

export function uniteninHaftalari(takvim, uniteId) {
  return takvim.filter((h) => h.unite === uniteId);
}

/**
 * Ekranda gosterilecek hafta.
 *
 * sabitHafta ebeveynin panelden secebildigi degerdir ve takvime ustun
 * gelir: cocuk okuldan geri kaldiysa ya da ileri gitmek istiyorsa
 * takvimin dedigi hafta yanlis olur. Gecersiz bir sabitHafta sessizce
 * yok sayilir, yoksa ekran bos kalirdi.
 */
export function aktifHafta(takvim, tatiller, tarih, sabitHafta) {
  if (Number.isInteger(sabitHafta)) {
    const sabit = haftaNo(takvim, sabitHafta);
    if (sabit && sabit.dersler.length > 0) return sabit;
  }
  const sonuc = haftaBul(takvim, tatiller, tarih);
  if (sonuc.tip !== 'ders') return null;
  return sonuc.hafta.dersler.length > 0 ? sonuc.hafta : null;
}
