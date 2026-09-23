/**
 * Cokgenler ve cember soru ureticisi.
 * Kazanimlar: MAT.5.3.5 (cokgen olusumu), MAT.5.3.6 (kenar ve aci
 * ozellikleri), MAT.5.3.7 (kesisen cember ciftinden insa edilen
 * ucgenler).
 *
 * Seviye 3 ve 4 gercek bir insa problemidir. Once iki yaricap ve
 * merkezler arasi uzaklik secilir; olusan ucgenin kenarlari tam olarak
 * bunlardir (iki yaricap + merkezler arasi uzaklik). Tur kenarlardan
 * HESAPLANIR.
 *
 * Kritik kosul: cemberler gercekten IKI noktada kesismeli. Kesismezse
 * ortada ucgen yoktur ve soru anlamsiz olur. kesisirMi bunu zorlar ve
 * uretici gecerli bir uclu bulana kadar dener.
 */

import { secmeliKur, karistir, sec } from './ortak.js';

export const COKGENLER = [
  { kenar: 3, ad: 'Üçgen' },
  { kenar: 4, ad: 'Dörtgen' },
  { kenar: 5, ad: 'Beşgen' },
  { kenar: 6, ad: 'Altıgen' },
  { kenar: 7, ad: 'Yedigen' },
  { kenar: 8, ad: 'Sekizgen' }
];

export const UCGEN_TURU_ADI = {
  eskenar: 'Eşkenar üçgen',
  ikizkenar: 'İkizkenar üçgen',
  cesitkenar: 'Çeşitkenar üçgen'
};

export function ucgenTuru(a, b, c) {
  if (a === b && b === c) return 'eskenar';
  if (a === b || b === c || a === c) return 'ikizkenar';
  return 'cesitkenar';
}

/**
 * Iki cember IKI noktada kesisir mi?
 *
 * Kosul: |r1 - r2| < d < r1 + r2
 * Esitlik halleri (teget cemberler) tek noktada kesisir; ucgen
 * olusmaz, bu yuzden disaridadir.
 */
export function kesisirMi(r1, r2, d) {
  return Math.abs(r1 - r2) < d && d < r1 + r2;
}

function olusumSorusu(rng) {
  const c = sec(COKGENLER, rng);
  const celdiriciler = COKGENLER.filter((x) => x.kenar !== c.kenar).map((x) => x.ad);

  return secmeliKur({
    tip: 'cokgen-olusum',
    soru: `Düzlemde ${c.kenar} doğru, sonuncusu ilkiyle kesişecek biçimde ardışık kesişiyor. Oluşan kapalı şekil hangisidir?`,
    dogruCevap: c.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Ardışık kesişen doğrular kapalı bir şekil oluşturur.',
      `${c.kenar} doğru kesiştiğinde ${c.kenar} kenar oluşur.`,
      `${c.kenar} kenarlı çokgenin adı ${c.ad.toLocaleLowerCase('tr')}dir.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

function adSorusu(rng) {
  const c = sec(COKGENLER, rng);
  const celdiriciler = COKGENLER.filter((x) => x.kenar !== c.kenar).map((x) => String(x.kenar));

  return secmeliKur({
    tip: 'cokgen-ad',
    soru: `${c.ad} kaç kenarlıdır?`,
    dogruCevap: String(c.kenar),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${c.ad}, adından anlaşılacağı gibi ${c.kenar} kenarlıdır.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

function kenarKoseSorusu(rng) {
  const c = sec(COKGENLER, rng);
  // Celdiriciler: "kose sayisi kenardan bir eksik/fazladir" yanilgisi.
  const celdiriciler = [c.kenar - 1, c.kenar + 1, c.kenar * 2]
    .filter((x) => x > 0 && x !== c.kenar)
    .map(String);

  return secmeliKur({
    tip: 'cokgen-kenar-kose',
    soru: `Bir ${c.ad.toLocaleLowerCase('tr')}in ${c.kenar} kenarı var. Kaç köşesi vardır?`,
    dogruCevap: String(c.kenar),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Her çokgende iki komşu kenar bir köşede birleşir.',
      'Bu yüzden köşe sayısı kenar sayısına eşittir.',
      `${c.ad} için ${c.kenar} kenar, ${c.kenar} köşe.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

/**
 * Kesisen iki cember secer.
 *
 * Istenen ucgen turunu hedefleyerek secer ki uc tur de yeterince siksin;
 * tamamen rastgele secseydik eskenar neredeyse hic cikmazdi.
 * Secilen uclu yine de kesisirMi ile dogrulanir.
 */
function cemberCifti(rng) {
  const hedef = sec(['eskenar', 'ikizkenar', 'cesitkenar'], rng);

  for (let deneme = 0; deneme < 50; deneme++) {
    let r1, r2, d;

    if (hedef === 'eskenar') {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1;
      d = r1;
    } else if (hedef === 'ikizkenar') {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1;
      d = 2 + Math.floor(rng() * (2 * r1 - 3));
      if (d === r1) d += 1;
    } else {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1 + 1 + Math.floor(rng() * 4);
      d = Math.abs(r1 - r2) + 1 + Math.floor(rng() * (2 * Math.min(r1, r2) - 1));
      if (d === r1 || d === r2) d += 1;
    }

    if (kesisirMi(r1, r2, d) && ucgenTuru(r1, r2, d) === hedef) {
      return { r1, r2, d };
    }
  }

  // Her zaman gecerli olan geri dusus: eskenar ucgen.
  return { r1: 5, r2: 5, d: 5 };
}

function ucgenTurSorusu(rng) {
  const { r1, r2, d } = cemberCifti(rng);
  const tur = ucgenTuru(r1, r2, d);
  const celdiriciler = Object.keys(UCGEN_TURU_ADI)
    .filter((k) => k !== tur)
    .map((k) => UCGEN_TURU_ADI[k]);

  return secmeliKur({
    tip: 'cember-ucgen-tur',
    soru: `Yarıçapları ${r1} cm ve ${r2} cm olan iki çemberin merkezleri arası ${d} cm. Çemberler iki noktada kesişiyor. Merkezleri ve kesişim noktalarından biriyle kurulan üçgen hangi türdendir?`,
    dogruCevap: UCGEN_TURU_ADI[tur],
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Üçgenin kenarları: birinci yarıçap, ikinci yarıçap ve merkezler arası uzaklık.',
      `Yani kenarlar ${r1} cm, ${r2} cm ve ${d} cm.`,
      tur === 'eskenar'
        ? 'Üç kenar da eşit, bu yüzden eşkenar üçgendir.'
        : tur === 'ikizkenar'
          ? 'İki kenar eşit, üçüncüsü farklı, bu yüzden ikizkenar üçgendir.'
          : 'Üç kenar da farklı, bu yüzden çeşitkenar üçgendir.'
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cember-ucgen', r1, r2, d }
  }, rng);
}

function yaricapSorusu(rng) {
  const { r1, r2, d } = cemberCifti(rng);
  const celdiriciler = [d, r1 + r2, Math.abs(r1 - r2)]
    .filter((x) => x > 0 && x !== r1)
    .map(String);

  return secmeliKur({
    tip: 'cember-yaricap',
    soru: `Bir çemberin merkezi M, üzerindeki bir noktası K. Yarıçapı ${r1} cm ise [MK] uzunluğu kaç cm'dir?`,
    dogruCevap: String(r1),
    celdiriciler: karistir(celdiriciler.length >= 2 ? celdiriciler : [String(r1 + 1), String(r1 + 2), String(r1 * 2)], rng),
    cozum: [
      'Çemberin merkezi ile üzerindeki her noktanın arası eşittir.',
      'Bu uzunluğa yarıçap denir.',
      `Yarıçap ${r1} cm olduğuna göre [MK] de ${r1} cm.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cember', r: r1 }
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    return rng() < 0.5 ? olusumSorusu(rng) : adSorusu(rng);
  }
  if (seviye === 2) {
    return rng() < 0.5 ? kenarKoseSorusu(rng) : adSorusu(rng);
  }
  if (seviye === 3) {
    return rng() < 0.5 ? yaricapSorusu(rng) : ucgenTurSorusu(rng);
  }
  return ucgenTurSorusu(rng);
}
