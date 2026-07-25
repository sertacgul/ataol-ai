/**
 * Satranc ders sorusu ureticisi.
 *
 * Uc ders tipi vardir ve her tas icin ucu de sorulur:
 *   serbest  bos tahtada tas nereye gidebilir
 *   engelli  yolda baska taslar var; kale durur, at atlar
 *   alma     tek hamlede alinabilecek tasi bul
 *
 * Rastgelelik disaridan gelir (rng). Cagiran sabit bir rng verirse
 * ayni soruyu alir; testler bunu kullanir.
 *
 * Deneme dongusu sabit rng ile de calisabilmeli. Bu yuzden secim
 * yapan yardimci `kayma` alir: rng ayni degeri dondurse bile her
 * denemede farkli kare secilir. Aksi halde "cevapsiz soru uretme"
 * korumasi sabit rng'de sonsuza kadar ayni cevapsiz soruyu uretirdi.
 *
 * Donen deger JSON guvenlidir: string, sayi, dizi, duz nesne.
 */

import { hedefKareler, kareCoz, kareId, PIECES, TAHTA_BOYU, TUM_KARELER } from './chess.js';

export const DERSLER = ['serbest', 'engelli', 'alma'];

// Engel taslari her zaman piyondur: cocuk "yolumu kesen sey" ile
// "ogrendigim tas" arasinda karisiklik yasamasin.
const ENGEL_TASI = 'P';

// Alinacak hedef tas cesitlenir ama sah olmaz; satrancta sah alinmaz.
const HEDEF_TASLARI = ['P', 'K', 'F', 'A'];

// At ve sah icin engel komsu karelere konur: at bunlarin ustunden
// atlar (asil ders), sah bunlari alabilir.
const SICRAYANLAR = ['A', 'S'];

const DENEME_SINIRI = 40;
const GUVENLI_KARE = 'd4';

function icerde(x, y) {
  return x >= 0 && x < TAHTA_BOYU && y >= 0 && y < TAHTA_BOYU;
}

function sec(liste, rng, kayma = 0) {
  const n = liste.length;
  if (n === 0) return null;
  return liste[((Math.floor(rng() * n) + kayma) % n + n) % n];
}

function komsular(kare) {
  const { x, y } = kareCoz(kare);
  const out = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      if (icerde(x + dx, y + dy)) out.push(kareId(x + dx, y + dy));
    }
  }
  return out;
}

// Kayan tas icin "arkasi olan" hedef kareler. Sadece bunlara konan
// engel yolu gercekten kisaltir; ismin sonundaki kareye konan engel
// hicbir seyi degistirmez.
function kesenKareler(tasKod, kare) {
  const hepsi = hedefKareler(tasKod, kare, {});
  const { x, y } = kareCoz(kare);
  return hepsi.filter((k) => {
    const h = kareCoz(k);
    const adim = Math.max(Math.abs(h.x - x), Math.abs(h.y - y));
    const dx = (h.x - x) / adim;
    const dy = (h.y - y) / adim;
    return icerde(h.x + dx, h.y + dy);
  });
}

// Tahtada, uzerine tas konsa alinabilecek kareler. Kaba kuvvetle
// motora sorulur; piyonun capraz istisnasi da boylece kendiliginden
// dogru cikar.
function alinabilirKareler(tasKod, kare, taban) {
  return TUM_KARELER.filter((k) => {
    if (k === kare || taban[k]) return false;
    return hedefKareler(tasKod, kare, { ...taban, [k]: ENGEL_TASI }).includes(k);
  });
}

function yakalananlar(tasKod, kare, tahta) {
  return hedefKareler(tasKod, kare, tahta).filter((k) => tahta[k]);
}

function piyonEngeli(kare, rng, kayma) {
  const { x, y } = kareCoz(kare);
  const tahta = {};
  // Onu kapatilir: piyonun ogretilecek istisnasi tam olarak budur,
  // ilerideki tasi alamaz. Cevap capraz taslardan gelir.
  if (icerde(x, y + 1)) tahta[kareId(x, y + 1)] = ENGEL_TASI;

  const caprazlar = [-1, 1]
    .filter((dx) => icerde(x + dx, y + 1))
    .map((dx) => kareId(x + dx, y + 1));
  const capraz = sec(caprazlar, rng, kayma);
  if (capraz) tahta[capraz] = ENGEL_TASI;

  return tahta;
}

function engelKur(tasKod, kare, rng, kayma) {
  if (tasKod === 'P') return piyonEngeli(kare, rng, kayma);

  if (SICRAYANLAR.includes(tasKod)) {
    const tahta = {};
    for (const k of komsular(kare)) tahta[k] = ENGEL_TASI;
    return tahta;
  }

  const adaylar = kesenKareler(tasKod, kare);
  const kac = 1 + ((kayma + Math.floor(rng() * 3)) % 3);
  const tahta = {};
  for (let i = 0; i < kac; i++) {
    const k = sec(adaylar, rng, kayma + i);
    if (!k || tahta[k]) continue;
    const oncekiSayi = hedefKareler(tasKod, kare, tahta).length;
    tahta[k] = ENGEL_TASI;
    // Onceki bir engel bu karenin onunu zaten kesmis olabilir; o zaman
    // bu tas hicbir sey ogretmez, geri alinir.
    if (hedefKareler(tasKod, kare, tahta).length >= oncekiSayi) delete tahta[k];
  }
  return tahta;
}

function almaKur(tasKod, kare, rng, kayma) {
  const adaylar = alinabilirKareler(tasKod, kare, {});
  const hedef = sec(adaylar, rng, kayma);
  if (!hedef) return {};

  const tahta = { [hedef]: sec(HEDEF_TASLARI, rng, kayma) };

  // Yem taslar soruyu gercek bir soru yapar: tahtada birden fazla tas
  // vardir ama tek hamlede yalniz biri alinir. Yem, hedefin yolunu
  // kesmemeli; her yerlestirme sonrasi kontrol edilir.
  for (let i = 0; i < 2; i++) {
    const bos = TUM_KARELER.filter((k) => k !== kare && !tahta[k]);
    const yem = sec(bos, rng, kayma + i * 7 + 1);
    if (!yem) continue;
    const deneme = { ...tahta, [yem]: ENGEL_TASI };
    const cevap = yakalananlar(tasKod, kare, deneme);
    if (cevap.length === 1 && cevap[0] === hedef) tahta[yem] = ENGEL_TASI;
  }

  return tahta;
}

function kur(tasKod, dersTipi, rng, kayma, kare) {
  const tahta = dersTipi === 'serbest' ? {}
    : dersTipi === 'engelli' ? engelKur(tasKod, kare, rng, kayma)
      : almaKur(tasKod, kare, rng, kayma);

  const dogruKareler = dersTipi === 'alma'
    ? yakalananlar(tasKod, kare, tahta)
    : hedefKareler(tasKod, kare, tahta);

  return {
    tas: tasKod,
    kare,
    tahta,
    dogruKareler,
    tip: dersTipi,
    anlat: (PIECES.find((p) => p.kod === tasKod) || {}).anlat || ''
  };
}

function gecerli(soru) {
  if (soru.dogruKareler.length === 0) return false;
  // Engelli derste engel yoksa ders yoktur.
  if (soru.tip === 'engelli' && Object.keys(soru.tahta).length === 0) return false;
  return true;
}

export function soruUret(tasKod, dersTipi, rng) {
  for (let deneme = 0; deneme < DENEME_SINIRI; deneme++) {
    const kare = sec(TUM_KARELER, rng, deneme);
    const soru = kur(tasKod, dersTipi, rng, deneme, kare);
    if (gecerli(soru)) return soru;
  }
  // Bilinen guvenli kurulum: d4 her tas icin her derste cevap uretir.
  return kur(tasKod, dersTipi, rng, 0, GUVENLI_KARE);
}
