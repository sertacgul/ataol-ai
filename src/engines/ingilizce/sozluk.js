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
//
// Karakter sinifi icinde -, ], ^ ve \ ozel anlam tasir; tabloya boyle bir
// harf eklenirse desen bozulmasin diye kacirilir.
const kacir = (harf) => harf.replace(/[-\]\\^]/g, '\\$&');
const DUZ_DESEN = new RegExp(`[${Object.keys(DUZ).map(kacir).join('')}]`, 'g');

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

const SKOR = { tam: 4, bastan: 3, sinir: 2, icinde: 1 };

/**
 * Bir alanin sorguyla ne kadar iyi eslestigini puanlar. 0 = eslesmiyor.
 *
 * "Kelime siniri" ile "icinde gecen" AYRI puanlanir: 'school' sorgusu
 * icin 'school bag' (kelime basi) 'preschool'dan (ortasinda) daha
 * alakalidir ve once gelmelidir.
 */
function puanla(alan, sorgu) {
  const a = normalize(alan);
  if (!a) return 0;
  if (a === sorgu) return SKOR.tam;
  if (a.startsWith(sorgu)) return SKOR.bastan;
  if (a.includes(` ${sorgu}`)) return SKOR.sinir;
  if (a.includes(sorgu)) return SKOR.icinde;
  return 0;
}

/**
 * Sozlukte iki yonlu arama.
 *
 * Her kelime EN FAZLA BIR KEZ doner: iki taraf da eslesirse yuksek
 * puanli yon secilir. Ayni kelimeyi iki satirda gostermek cocuga iki
 * ayri kelime var gibi gelir.
 */
export function ara(sozluk, sorgu, { limit = 20 } = {}) {
  const s = normalize(sorgu);
  if (!s || !Array.isArray(sozluk)) return [];

  const sonuc = [];
  for (const kelime of sozluk) {
    const enSkor = puanla(kelime.en, s);
    const trSkor = puanla(kelime.tr, s);
    if (enSkor === 0 && trSkor === 0) continue;

    sonuc.push(enSkor >= trSkor
      ? { kelime, yon: 'en-tr', skor: enSkor }
      : { kelime, yon: 'tr-en', skor: trSkor });
  }

  // Esit puanda alfabetik: sonuc siralamasi girdi sirasina gore
  // degismesin, yoksa veri dosyasinda satir tasimak sonucu degistirir.
  sonuc.sort((a, b) => b.skor - a.skor || a.kelime.id.localeCompare(b.kelime.id));
  return sonuc.slice(0, limit);
}
