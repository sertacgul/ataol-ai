/**
 * Ingilizce kelime quiz/sinav soru ureticisi. Saf: DOM yok, saat yok,
 * rastgele yok - rng disaridan gelir (bkz. tests/yardim/soru-sozlesmesi.js
 * icindeki tohumluRng).
 *
 * Uc soru tipi: en-tr, tr-en ve ornek cumleden turetilen bosluk
 * doldurma. Celdiriciler DAIMA ayni haftanin kelimelerinden secilir;
 * baska haftanin kelimesi celdirici olsaydi soru kolaylasirdi ve cocuk
 * kelimeyi bilmeden dogru sikki bulurdu.
 */

const TIPLER = ['en-tr', 'tr-en', 'bosluk'];

/** Diziden rastgele bir oge. rng disaridan gelir. */
const sec = (dizi, rng) => dizi[Math.floor(rng() * dizi.length)];

/** Fisher-Yates. Kaynagi degistirmez. */
function karistir(dizi, rng) {
  const out = [...dizi];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function regexKacir(metin) {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Kelimeyi ornek cumleden kelime siniri ile cikarir.
 *
 * Faz 1 her ornegin kelimenin ilk tokenini icerdigini garanti eder ama
 * cumledeki YUZEY BICIMINI degil (coğul, iyelik, buyuk harf gibi).
 * Kelime siniri (\b) eslesmezse (orn. "club" tekil, cumlede "clubs"
 * coğulu geciyor) null donulur ve cagiran baska soru tipine duser.
 * Boylece cevap yanlislikla cumlede gorunur kalmaz.
 */
function boslukCumlesi(ornekEn, en) {
  const desen = new RegExp(`\\b${regexKacir(en)}\\b`, 'i');
  if (!desen.test(ornekEn)) return null;
  return ornekEn.replace(desen, '___');
}

/** Havuzdan dogru cevaptan farkli, benzersiz `adet` celdirici secer. */
function celdiricileriSec(havuz, dogruCevap, rng, adet = 3) {
  const benzersiz = [];
  for (const deger of havuz) {
    if (deger !== dogruCevap && !benzersiz.includes(deger)) benzersiz.push(deger);
  }
  return karistir(benzersiz, rng).slice(0, adet);
}

/** Secmeli soru govdesini kurar: secenekleri karistirir, dogru indeksi bulur. */
function secmeliSoruKur({ tip, kelimeId, soru, dogruCevap, celdiriciHavuzu, cozum }, rng) {
  const celdiriciler = celdiricileriSec(celdiriciHavuzu, dogruCevap, rng);
  const secenekler = karistir([dogruCevap, ...celdiriciler], rng);
  return {
    tip,
    kelimeId,
    soru,
    secenekler,
    dogru: secenekler.indexOf(dogruCevap),
    cozum
  };
}

/**
 * Belirli bir hedef kelime icin soru uretir. Celdiriciler `kelimeler`
 * (hafta kelime id listesi) icindeki DIGER kelimelerden gelir.
 */
function hedefliSoruUret(hedefId, kelimeler, sozluk, rng) {
  const haftaKelimeleri = kelimeler.map((id) => sozluk.find((k) => k.id === id)).filter(Boolean);
  const hedef = haftaKelimeleri.find((k) => k.id === hedefId);
  const digerleri = haftaKelimeleri.filter((k) => k.id !== hedefId);

  let tip = sec(TIPLER, rng);
  if (tip === 'bosluk' && boslukCumlesi(hedef.ornek.en, hedef.en) === null) {
    tip = sec(['en-tr', 'tr-en'], rng);
  }

  if (tip === 'en-tr') {
    return secmeliSoruKur({
      tip,
      kelimeId: hedef.id,
      soru: `"${hedef.en}" ne demek?`,
      dogruCevap: hedef.tr,
      celdiriciHavuzu: digerleri.map((k) => k.tr),
      cozum: `"${hedef.en}" kelimesi Türkçede "${hedef.tr}" demektir.`
    }, rng);
  }

  if (tip === 'tr-en') {
    return secmeliSoruKur({
      tip,
      kelimeId: hedef.id,
      soru: `"${hedef.tr}" İngilizcede ne?`,
      dogruCevap: hedef.en,
      celdiriciHavuzu: digerleri.map((k) => k.en),
      cozum: `"${hedef.tr}" kelimesinin İngilizcesi "${hedef.en}".`
    }, rng);
  }

  return secmeliSoruKur({
    tip,
    kelimeId: hedef.id,
    soru: boslukCumlesi(hedef.ornek.en, hedef.en),
    dogruCevap: hedef.en,
    celdiriciHavuzu: digerleri.map((k) => k.en),
    cozum: `Boşluğa "${hedef.en}" gelir: "${hedef.ornek.en}"`
  }, rng);
}

/**
 * Hafta kelimelerinden rastgele bir hedef secip o hedef icin soru uretir.
 */
export function soruUret(kelimeler, sozluk, rng) {
  const haftaKelimeleri = kelimeler.map((id) => sozluk.find((k) => k.id === id)).filter(Boolean);
  const hedef = sec(haftaKelimeleri, rng);
  return hedefliSoruUret(hedef.id, kelimeler, sozluk, rng);
}

/**
 * Bir hafta icin `adet` kadar soru uretir. Her soru FARKLI bir kelimeyi
 * hedefler (tekrar yok); istenen sayi hafta kelime sayisini asarsa
 * hafta kelime sayisi kadar soru doner.
 */
export function haftaQuizi(hafta, sozluk, rng, adet) {
  const siraliIdler = karistir(hafta.kelimeler, rng);
  const sayi = Math.min(adet, siraliIdler.length);
  const secilenIdler = siraliIdler.slice(0, sayi);
  return secilenIdler.map((id) => hedefliSoruUret(id, hafta.kelimeler, sozluk, rng));
}

/**
 * Tema sinavi: temanin her haftasindan esit pay (artan sorular ilk
 * haftalara), sonra karisik sira. Her soru kendi haftasinin quizi gibi
 * uretilir, yani celdiriciler SORUNUN KENDI haftasindan gelir.
 *
 * Haftalar blok halinde sorulmaz; art arda ayni hafta gelirse cocuk
 * sinavi "bitti mi" diye degil "hala mi" diye yasar (engines/sinav.js ile
 * ayni gerekce).
 */
export function temaSinavi(haftalar, sozluk, rng, adet) {
  const taban = Math.floor(adet / haftalar.length);
  const artan = adet % haftalar.length;
  const sorular = haftalar.flatMap((h, i) =>
    haftaQuizi(h, sozluk, rng, taban + (i < artan ? 1 : 0)));
  return karistir(sorular, rng);
}

/**
 * Uretilen sorulari matematigin sinav nesnesine cevirir. Boylece
 * engines/sinav.js'teki cevapla/puanla ve ui/ders-dom.js'teki soru,
 * sinav ve sonuc ekranlari AYNEN kullanilir.
 *
 * Ekranlar soru metnini soru.soru.tr'den, cozumu adim dizisi olarak
 * okur; Ingilizce soruda ikisi de tek metin oldugu icin sarilir.
 */
export function sinavNesnesi(sorular, { gecmeNotu, aninda }) {
  return {
    sorular: sorular.map((q) => ({ ...q, soru: { tr: q.soru, en: q.soru }, cozum: [q.cozum] })),
    soruKaynagi: sorular.map((q) => q.kelimeId),
    cevaplar: sorular.map(() => null),
    gecmeNotu,
    aninda,
    bitti: false
  };
}
