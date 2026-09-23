/**
 * Sozluk motoru. Saf: DOM yok, saat yok, rastgele yok.
 */

// Turkce'ye ozgu harfler ve duz karsiliklari.
const DUZ = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u'
};

/**
 * Aramada karsilastirilacak bicime indirger.
 *
 * On yasindaki bir cocuk telefonda "canta" yazar, "çanta" degil. Bu
 * yuzden diakritikler yok sayilir.
 *
 * toLocaleLowerCase('tr') SART: duz toLowerCase() 'I' harfini 'i' yapar
 * ama Turkce'de 'I'nin kucugu 'ı'dir. Bu fark yuzunden 'IŞIK' ile 'ışık'
 * farkli normalize edilir ve cocuk kendi yazdigini bulamaz.
 */
export function normalize(metin) {
  if (metin === null || metin === undefined) return '';
  return String(metin)
    .toLocaleLowerCase('tr')
    .replace(/[çğıiöşüâîû]/g, (h) => DUZ[h] ?? h)
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Kelimenin kalici kimligi. Ses dosyasi adi da bundan turetilir
 * (sesler/en/<id>.mp3), yani dosya adi olarak GUVENLI olmali.
 */
export function kelimeKimligi(en) {
  return normalize(en)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
