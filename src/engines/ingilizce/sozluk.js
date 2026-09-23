/**
 * Sozluk motoru. Saf: DOM yok, saat yok, rastgele yok.
 */

// Turkce harfleri ve yaygın aksentli Latin harflerini duz karsiliklarina cevirme.
// Ingilizce sozlükte (örn. café, naïve, résumé) karsilasilan aksentli harflerin
// de harita yapilmasi, sessiz veri kaybi yerine açik biçim tercihidir.
const DUZ = {
  // Turkish
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  // Common Latin accents
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u',
  'ñ': 'n', 'ý': 'y', 'ÿ': 'y'
};

// Ses harita tablosunun anahtarlarinden regex olustur. Tablo ile regex
// asla ayrilmamali: tabloya harf eklemek yeterli olsun.
const DUZ_DESEN = new RegExp(`[${Object.keys(DUZ).join('')}]`, 'g');

/**
 * Aramada karsilastirilacak bicime indirger.
 *
 * On yasindaki bir cocuk telefonda "canta" yazar, "çanta" degil. Bu
 * yuzden diakritikler yok sayilir.
 *
 * toLocaleLowerCase('tr') savunma mekanizması: duz toLowerCase() 'I' harfini
 * 'i' yapar ama Turkce'de 'I'nin kucugu 'ı'dir. Ancak DUZ tablosu her iki formu
 * da 'i'ye cevirdigi icin ayni sonuc verilir. Tablo degisirse, Turkish locale
 * uygulamasi dogru davranisa yardimci olacak.
 */
export function normalize(metin) {
  if (metin === null || metin === undefined) return '';
  return String(metin)
    .toLocaleLowerCase('tr')
    .replace(DUZ_DESEN, (h) => DUZ[h] ?? h)
    // Noktalama ve apostroflar atilir: cocuk "what's" yazinca "whats" bulsun
    // ve kelimeKimligi temiz dosya adi uretsin (sesler/en/id.mp3).
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
