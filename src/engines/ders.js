/**
 * Ders akisinin durum makinesi ve yildiz kurallari.
 *
 * Saf kalir: saat, rastgelelik ve DOM yok. Yildiz hesabinin burada
 * olmasi bilincli bir karar: para dagitan kural test edilebilir tek bir
 * yerde durmali, ekran kodunun icine dagilmamali.
 *
 * Yildiz BIR KEZ verilir. yildizAlinan listesi hangi asamalarin odulunun
 * alindigini tutar. Aksi halde cocuk ayni quize tekrar tekrar girip
 * yildiz basardi; o da ogrenmeyi degil tekrari odullendirirdi.
 *
 * Alistirma bilincli olarak yildiz VERMEZ: sorular sinirsiz uretiliyor,
 * odul konsaydi cocuk ogrenmek yerine sayac doldurmaya oynardi.
 */

export const ASAMALAR = ['anlatim', 'etkilesim', 'alistirma', 'quiz'];

export const YILDIZ = {
  anlatim: 4,
  etkilesim: 3,
  quizGecme: 6,
  quizTamPuan: 10,
  uniteSinavi: 15,
  donemSinavi: 25
};

export const QUIZ_GECME = 70;
export const SINAV_GECME = 60;

// Alistirma asamasinin "tamam" sayilmasi icin gereken dogru cevap sayisi.
// Alistirma yine de sinirsiz devam edebilir; bu yalnizca ilerleme
// cubugunun dolma esigidir.
export const ALISTIRMA_HEDEF = 10;

export function bosHafta() {
  return {
    anlatim: [],
    etkilesimBitti: false,
    alistirma: {},
    alistirmaDogru: 0,
    quiz: { enIyi: 0, denemeler: 0 },
    yildizAlinan: []
  };
}

const dizi = (x) => (Array.isArray(x) ? x : []);
const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const sayi = (x) => (Number.isFinite(x) ? x : 0);

/**
 * Kayitli hafta verisini eksik alanlariyla tamamlar. Eski surumden gelen
 * ya da elle bozulmus kayit burada duzelir, cagiranlar hep tam sekil
 * gorur.
 */
export function haftaKaydi(ilerleme, no) {
  const ham = nesne(nesne(ilerleme?.haftalar)[String(no)]);
  const quiz = nesne(ham.quiz);
  return {
    anlatim: dizi(ham.anlatim),
    etkilesimBitti: ham.etkilesimBitti === true,
    alistirma: nesne(ham.alistirma),
    alistirmaDogru: sayi(ham.alistirmaDogru),
    quiz: { enIyi: sayi(quiz.enIyi), denemeler: sayi(quiz.denemeler) },
    yildizAlinan: dizi(ham.yildizAlinan)
  };
}

function yildizVer(kayit, asama, miktar) {
  if (kayit.yildizAlinan.includes(asama)) {
    return { kayit, kazanilanYildiz: 0 };
  }
  return {
    kayit: { ...kayit, yildizAlinan: [...kayit.yildizAlinan, asama] },
    kazanilanYildiz: miktar
  };
}

/**
 * Bir anlatim adimini bitmis isaretler. Tum adimlar bitince anlatim
 * yildizi verilir.
 *
 * tumAdimlar verilmezse yildiz kontrolu yapilmaz; cagiran yalnizca
 * isaretlemek istiyordur.
 */
export function adimTamamla(kayit, adimId, tumAdimlar = null) {
  const anlatim = kayit.anlatim.includes(adimId)
    ? kayit.anlatim
    : [...kayit.anlatim, adimId];
  const yeni = { ...kayit, anlatim };

  if (!Array.isArray(tumAdimlar) || tumAdimlar.length === 0) {
    return { kayit: yeni, kazanilanYildiz: 0 };
  }
  const hepsiBitti = tumAdimlar.every((a) => anlatim.includes(a));
  if (!hepsiBitti) return { kayit: yeni, kazanilanYildiz: 0 };

  return yildizVer(yeni, 'anlatim', YILDIZ.anlatim);
}

export function etkilesimTamamla(kayit) {
  return yildizVer({ ...kayit, etkilesimBitti: true }, 'etkilesim', YILDIZ.etkilesim);
}

/**
 * Bir alistirma cevabini kaydeder. Leitner kutusu disaridan gelir;
 * bu motor kutu mantigini bilmez, yalnizca saklar.
 */
export function alistirmaCevap(kayit, tip, kutu, dogruMu) {
  return {
    kayit: {
      ...kayit,
      alistirma: { ...kayit.alistirma, [tip]: kutu },
      alistirmaDogru: kayit.alistirmaDogru + (dogruMu ? 1 : 0)
    },
    kazanilanYildiz: 0
  };
}

export function quizBitir(kayit, yuzde) {
  const gecti = yuzde >= QUIZ_GECME;
  const temel = {
    ...kayit,
    quiz: {
      enIyi: Math.max(kayit.quiz.enIyi, yuzde),
      denemeler: kayit.quiz.denemeler + 1
    }
  };

  if (!gecti) return { kayit: temel, kazanilanYildiz: 0, gecti: false };

  const miktar = yuzde >= 100 ? YILDIZ.quizTamPuan : YILDIZ.quizGecme;
  const sonuc = yildizVer(temel, 'quiz', miktar);
  return { ...sonuc, gecti: true };
}

/**
 * Haftanin dort asamasinin durumu ve yuzdesi.
 *
 * adimIdleri: o haftanin anlatim adimlarinin id listesi. Hafta iki derse
 * bagliysa cagiran iki dersin adimlarini birlestirip verir.
 */
export function haftaDurumu(adimIdleri, kayit) {
  const toplamAdim = adimIdleri.length;
  const bitenAdim = adimIdleri.filter((a) => kayit.anlatim.includes(a)).length;

  const asamalar = {
    anlatim: { tamam: toplamAdim > 0 && bitenAdim === toplamAdim, n: bitenAdim, toplam: toplamAdim },
    etkilesim: { tamam: kayit.etkilesimBitti },
    alistirma: {
      tamam: kayit.alistirmaDogru >= ALISTIRMA_HEDEF,
      n: Math.min(kayit.alistirmaDogru, ALISTIRMA_HEDEF),
      toplam: ALISTIRMA_HEDEF
    },
    quiz: { tamam: kayit.quiz.enIyi >= QUIZ_GECME, enIyi: kayit.quiz.enIyi }
  };

  const biten = ASAMALAR.filter((a) => asamalar[a].tamam).length;
  return {
    asamalar,
    yuzde: Math.round((biten / ASAMALAR.length) * 100),
    bitti: biten === ASAMALAR.length
  };
}

/**
 * Unite ya da donem sinavi sonucu. sinavlar nesnesi hafta kayitlarindan
 * ayridir cunku sinav bir haftaya degil bir uniteye aittir.
 */
export function sinavBitir(sinavlar, sinavId, { puan, tarih, tip }) {
  const onceki = nesne(nesne(sinavlar)[sinavId]);
  const gecti = puan >= SINAV_GECME;
  const dahaOnceAlindi = onceki.yildizAlindi === true;
  const miktar = tip === 'donem' ? YILDIZ.donemSinavi : YILDIZ.uniteSinavi;
  const kazanilanYildiz = gecti && !dahaOnceAlindi ? miktar : 0;

  return {
    sinavlar: {
      ...nesne(sinavlar),
      [sinavId]: {
        puan,
        gecti,
        tarih,
        tip,
        yildizAlindi: dahaOnceAlindi || kazanilanYildiz > 0
      }
    },
    kazanilanYildiz,
    gecti
  };
}
