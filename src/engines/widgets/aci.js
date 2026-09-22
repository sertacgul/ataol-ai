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
