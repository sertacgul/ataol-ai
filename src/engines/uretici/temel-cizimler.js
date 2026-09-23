/**
 * Temel geometrik cizimler soru ureticisi.
 * Kazanimlar: MAT.5.3.1 (arac ve teknoloji), MAT.5.3.2 (cikarim).
 *
 * Bu konu parametrik degil kavramsaldir; sorular asagidaki varlik
 * tablosundan uretilir. Cevap her zaman tablodan OKUNUR. Celdiriciler
 * de tablodan gelir, yani hepsi makul ama yanlis secenekler olur;
 * rastgele uydurulmus bir sik cocuga hicbir sey ogretmez.
 */

import { secmeliKur, karistir, sec } from './ortak.js';

export const ARACLAR = [
  { id: 'cetvel', ad: 'Cetvel' },
  { id: 'pergel', ad: 'Pergel' },
  { id: 'aciolcer', ad: 'Açıölçer' },
  { id: 'gonye', ad: 'Gönye' }
];

export const VARLIKLAR = [
  {
    id: 'nokta', ad: 'Nokta', arac: 'cetvel', uc: 0, gosterim: 'A',
    tanim: 'Yeri belli olan, boyu ve eni olmayan şekil', sembolik: false
  },
  {
    id: 'dogru', ad: 'Doğru', arac: 'cetvel', uc: 0, gosterim: 'AB doğrusu',
    tanim: 'İki yönde de sonsuza giden, başı ve sonu olmayan şekil', sembolik: false,
    // Dikme de bir dogrudur (bkz. data/konular/temel-cizimler.js seviye 2
    // a4: "Dikme de bir dogru oldugu icin onun da ucu yoktur"), yani bu
    // tanima dikme de tipatip uyar. Celdirici havuzunda kalirsa tanim
    // sorusunun iki dogru cevabi olur; bu yuzden tanimSorusu bu listeyi
    // ekleyip distraktor olarak elemeli.
    tanimaUyanDigerleri: ['dikme']
  },
  {
    id: 'dogru-parcasi', ad: 'Doğru parçası', arac: 'cetvel', uc: 2, gosterim: '[AB]',
    tanim: 'İki ucu belli olan, uzunluğu ölçülebilen şekil', sembolik: true
  },
  {
    id: 'isin', ad: 'Işın', arac: 'cetvel', uc: 1, gosterim: '[AB',
    tanim: 'Bir ucu belli olan, diğer yönde sonsuza giden şekil', sembolik: true
  },
  {
    id: 'aci', ad: 'Açı', arac: 'aciolcer', uc: null, gosterim: 'ABC açısı',
    tanim: 'Başlangıç noktaları aynı olan iki ışının oluşturduğu şekil', sembolik: false
  },
  {
    id: 'cember', ad: 'Çember', arac: 'pergel', uc: null, gosterim: null,
    tanim: 'Bir noktaya eşit uzaklıktaki noktaların oluşturduğu kapalı eğri', sembolik: false
  },
  {
    id: 'dikme', ad: 'Dikme', arac: 'gonye', uc: 0, gosterim: null,
    tanim: 'Bir doğruya 90 derecelik açıyla çizilen doğru', sembolik: false
  }
];

export function aracSorusu(varlik, rng) {
  const dogru = ARACLAR.find((a) => a.id === varlik.arac);
  const celdiriciler = ARACLAR.filter((a) => a.id !== varlik.arac).map((a) => a.ad);

  return secmeliKur({
    tip: 'temel-cizimler-arac',
    soru: `${varlik.ad} çizmek için hangi aracı kullanırsın?`,
    dogruCevap: dogru.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${varlik.ad}: ${varlik.tanim.toLocaleLowerCase('tr')}.`,
      `Bunu çizmek için ${dogru.ad.toLocaleLowerCase('tr')} gerekir.`
    ]
  }, rng);
}

export function tanimSorusu(varlik, rng) {
  // varlik.id kendisi zaten cikar. tanimaUyanDigerleri varsa (alt tur
  // iliskisi yuzunden ayni tanima uyan baska varliklar), onlar da
  // celdirici havuzundan cikarilir; yoksa soru iki dogru cevapli olur.
  const haric = new Set([varlik.id, ...(varlik.tanimaUyanDigerleri || [])]);
  const celdiriciler = VARLIKLAR.filter((v) => !haric.has(v.id)).map((v) => v.ad);

  return secmeliKur({
    tip: 'temel-cizimler-tanim',
    soru: `${varlik.tanim} hangisidir?`,
    dogruCevap: varlik.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `Tanım "${varlik.tanim.toLocaleLowerCase('tr')}" diyor.`,
      `Bu tanıma uyan şekil ${varlik.ad.toLocaleLowerCase('tr')}.`
    ]
  }, rng);
}

export function ucSorusu(varlik, rng) {
  // Celdiriciler tablodaki diger uc degerleri: "isin ile dogru
  // parcasini karistirma" hatasini dogrudan hedefler.
  const UC_DEGERLERI = [...new Set(VARLIKLAR.map((v) => v.uc).filter(Number.isInteger))].sort();
  const celdiriciler = UC_DEGERLERI
    .filter((n) => n !== varlik.uc)
    .map(String);

  return secmeliKur({
    tip: 'temel-cizimler-uc',
    soru: `Bir ${varlik.ad.toLocaleLowerCase('tr')} şeklinin kaç ucu vardır?`,
    dogruCevap: String(varlik.uc),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${varlik.ad}: ${varlik.tanim.toLocaleLowerCase('tr')}.`,
      `Buna göre uç sayısı ${varlik.uc}.`
    ]
  }, rng);
}

export function gosterimSorusu(varlik, rng) {
  const celdiriciler = VARLIKLAR
    .filter((v) => v.id !== varlik.id)
    .map((v) => v.ad);

  return secmeliKur({
    tip: 'temel-cizimler-gosterim',
    soru: `Matematikte ${varlik.gosterim} biçiminde yazılan şekil hangisidir?`,
    dogruCevap: varlik.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `Matematikte ${varlik.gosterim} biçiminde yazılan şekil ${varlik.ad.toLocaleLowerCase('tr')} demektir.`,
      `${varlik.tanim}.`
    ]
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    const varlik = sec(VARLIKLAR, rng);
    return rng() < 0.5 ? aracSorusu(varlik, rng) : tanimSorusu(varlik, rng);
  }

  // Seviye 2: ozellik cikarimi. uc sorusu yalniz uc sayisi tanimli,
  // gosterim sorusu yalniz sembolik gosterimi olan varliklar icin kurulabilir.
  const ucluler = VARLIKLAR.filter((v) => Number.isInteger(v.uc));
  const sembolikler = VARLIKLAR.filter((v) => v.sembolik);

  return rng() < 0.5
    ? ucSorusu(sec(ucluler, rng), rng)
    : gosterimSorusu(sec(sembolikler, rng), rng);
}
