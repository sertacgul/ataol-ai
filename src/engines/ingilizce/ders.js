/**
 * Ingilizce ders ilerlemesi. Saf: DOM yok, saat yok, rastgele yok.
 *
 * Matematikten AYRI bir dosya cunku asama listesi ve kayit sekli farkli
 * (matematikte dort asama, burada bes). Ama kayit `quiz` ve `yildizAlinan`
 * alanlarini AYNI sekilde tasiyor, boylece quizBitir, yildizVer ve
 * tamPuanIsaretle aynen tekrar kullanilabiliyor.
 */

import { yildizVer } from '../ders.js';

export const ING_ASAMALAR = ['kelime', 'dinle', 'soyle', 'cumle', 'quiz'];

/**
 * Hafta basina toplam 13: 4 + 3 + 0 + 0 + 6. Matematikle AYNI.
 *
 * Yildiz iki ders arasinda ortak para birimi. Biri fazla odeseydi cocuk
 * dersi degil odulu secerdi. Sinirsiz tekrar edilebilen asamalar
 * (soyle-dinle, cumle kur) yildiz VERMEZ - matematikte alistirma da boyle.
 */
export const ING_YILDIZ = {
  kelime: 4, dinle: 3, soyle: 0, cumle: 0,
  quizGecme: 6, quizTamPuan: 10, temaSinavi: 15
};

export const DINLE_GECME = 70;

const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const dizi = (x) => (Array.isArray(x) ? x : []);
const sayi = (x) => (Number.isFinite(x) ? x : 0);

export function bosIngHafta() {
  return {
    kelimeler: [],
    dinleBitti: false,
    soyleBitti: false,
    cumleBitti: false,
    quiz: { enIyi: 0, denemeler: 0 },
    yildizAlinan: []
  };
}

export function ingHaftaKaydi(ilerleme, haftaNo) {
  const ham = nesne(nesne(ilerleme?.haftalar)[String(haftaNo)]);
  const quiz = nesne(ham.quiz);
  return {
    kelimeler: dizi(ham.kelimeler),
    dinleBitti: ham.dinleBitti === true,
    soyleBitti: ham.soyleBitti === true,
    cumleBitti: ham.cumleBitti === true,
    quiz: { enIyi: sayi(quiz.enIyi), denemeler: sayi(quiz.denemeler) },
    yildizAlinan: dizi(ham.yildizAlinan)
  };
}

export function ingHaftaDurumu(kelimeIdleri, kayit) {
  const toplam = kelimeIdleri.length;
  const goruldu = kelimeIdleri.filter((id) => kayit.kelimeler.includes(id)).length;

  const asamalar = {
    // Bos kelime listesi icerigin yazilmadigini anlatir; tamam: false
    // tutmak bilincli, yoksa bos hafta bedava yildiz oderdi.
    kelime: { tamam: toplam > 0 && goruldu === toplam, n: goruldu, toplam },
    dinle: { tamam: kayit.dinleBitti },
    soyle: { tamam: kayit.soyleBitti },
    cumle: { tamam: kayit.cumleBitti },
    quiz: { tamam: kayit.quiz.enIyi >= 70, enIyi: kayit.quiz.enIyi }
  };

  const biten = ING_ASAMALAR.filter((a) => asamalar[a].tamam).length;
  return {
    asamalar,
    yuzde: Math.round((biten / ING_ASAMALAR.length) * 100),
    bitti: biten === ING_ASAMALAR.length
  };
}

/**
 * Bir kelime karti goruldu.
 *
 * Yildiz kart basina DEGIL, son kart gorulunce BIR KEZ odenir; bu yuzden
 * fonksiyon haftanin tum kelime idlerini de alir. yildizVer 'kelime'
 * isaretini yildizAlinan'a koydugu icin tekrar odeme olmaz.
 */
export function kartGoruldu(kayit, kelimeId, kelimeIdleri = []) {
  if (kayit.kelimeler.includes(kelimeId)) return { kayit, kazanilanYildiz: 0 };

  const yeni = { ...kayit, kelimeler: [...kayit.kelimeler, kelimeId] };
  const tamam = kelimeIdleri.length > 0
    && kelimeIdleri.every((id) => yeni.kelimeler.includes(id));

  return tamam
    ? yildizVer(yeni, 'kelime', ING_YILDIZ.kelime)
    : { kayit: yeni, kazanilanYildiz: 0 };
}

/**
 * Dinle-sec asamasi biter. dogruSayisi/toplam yuzdeye cevrilir; toplam
 * sifirsa yuzde sifir sayilir, bolme hatasi (NaN) olusmaz.
 *
 * quizBitir'deki gecti/yildiz deseniyle ayni: esigi gecince dinleBitti
 * isaretlenir ve yildizVer 'dinle' isaretini yildizAlinan'a koyar, boylece
 * tekrar gecmek ikinci kez odemez.
 */
export function dinleBitir(kayit, dogruSayisi, toplam) {
  const yuzde = toplam > 0 ? (dogruSayisi / toplam) * 100 : 0;
  const gecti = yuzde >= DINLE_GECME;
  if (!gecti) return { kayit, kazanilanYildiz: 0, gecti: false };

  const sonuc = yildizVer({ ...kayit, dinleBitti: true }, 'dinle', ING_YILDIZ.dinle);
  return { ...sonuc, gecti: true };
}
