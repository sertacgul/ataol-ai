/**
 * Aci hesaplari. Saf, DOM yok, rastgele yok.
 *
 * Hem soru ureticisi hem aciolcer widget'i buradan okur; boylece
 * ekranda gosterilen ile soruda sorulan ayni kuraldan gelir.
 */

export const ACI_TURU_ADI = {
  dar: 'Dar açı',
  dik: 'Dik açı',
  genis: 'Geniş açı',
  dogru: 'Doğru açı',
  tam: 'Tam açı'
};

export function aciTuru(derece) {
  if (derece === 360) return 'tam';
  if (derece === 180) return 'dogru';
  if (derece === 90) return 'dik';
  return derece < 90 ? 'dar' : 'genis';
}

/** Butunler acilar toplami 180'dir. */
export function butunler(a) {
  return 180 - a;
}

/** Tumler acilar toplami 90'dir. */
export function tumler(a) {
  return 90 - a;
}

/**
 * Iki dogru kesistiginde karsilikli (ters) acilar esittir. Fonksiyon
 * ayni degeri donduruyor gibi gorunuyor ama kurali adlandirmak onemli:
 * ureticideki cozum adimi bu kurali gosteriyor ve testi de var.
 */
export function tersAci(a) {
  return a;
}

/** Kesisen iki dogruda komsu acilar butunlerdir. */
export function komsuAci(a) {
  return butunler(a);
}

/**
 * Iki dogrultu arasindaki dar aciyi derece olarak verir. Yon onemsiz:
 * yukari cizilen dikme ile asagi cizilen dikme ayni sayiyi verir.
 *
 * Tuval koordinatlari icin yazildi (y asagi buyur) ama sonuc yonden
 * bagimsiz oldugu icin bu fark etmez.
 */
export function dogrultularArasiAci(ax, ay, bx, by) {
  const n1 = Math.hypot(ax, ay);
  const n2 = Math.hypot(bx, by);
  if (n1 === 0 || n2 === 0) return null;

  const kosinus = (ax * bx + ay * by) / (n1 * n2);
  // Kayan nokta hatasi kosinusu -1..1 disina tasirabilir; acos NaN verir.
  const kirpik = Math.min(1, Math.max(-1, kosinus));
  const derece = (Math.acos(kirpik) * 180) / Math.PI;
  return derece > 90 ? 180 - derece : derece;
}

/**
 * Cocugun cizdigi cizgi verilen dogrultuya dik mi. Tolerans parmakla
 * cizim icin: 90 dereceyi tam tutturmasi beklenmez, yaklasmasi yeter.
 */
export function dikMi(ax, ay, bx, by, tolerans = 8) {
  const aci = dogrultularArasiAci(ax, ay, bx, by);
  return aci === null ? false : Math.abs(90 - aci) <= tolerans;
}
