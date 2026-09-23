/**
 * aci-olcme konusunun anlatim gorselleri (3-4. hafta, seviye 1-2).
 *
 * Her gorsel etkilesimli: cocuk bir kolu surukler, bir sayi ya da bir
 * siniflandirma CANLI degisir. Aci hesabinin kurali src/engines/widgets
 * /aci.js icinde tek yerde yasiyor; burada sadece o kurali okuyup
 * ekrana yaziyoruz - ekran ile quiz'in ayni sayiyi soylemesi boyle
 * garanti edilir.
 */

import {
  RENK, nokta, cizgi, yay, dikIsaret, etiket, altYazi, ok, temizle, birim
} from './cizim.js';
import {
  aciTuru, ACI_TURU_ADI, butunler, tumler, tersAci, komsuAci, dogrultularArasiAci
} from '../../engines/widgets/aci.js';

const RAD = Math.PI / 180;

/** Dereceyi cocuga okunacak bicimde yazar. Sembol yok, TTS "derece" der. */
function deriyaz(v) {
  return `${Math.round(v)} derece`;
}

function sinirla(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** 0..360 araligina katlar (negatif acilari da dogru sektore koyar). */
function tam360(theta) {
  return ((theta % 360) + 360) % 360;
}

/**
 * Koseden r birim uzakta, theta derecede (matematik yonu, saat tersi)
 * duran noktayi FRAKSIYON koordininda verir. Piksel uzayinda hesaplanir;
 * yoksa tuval genis-kisa oldugu icin aci gorsel olarak carpitilir.
 */
function kolUcu(canvas, kose, theta, r) {
  const b = birim(canvas);
  const px = kose.x * canvas.width + r * b * Math.cos(theta * RAD);
  const py = kose.y * canvas.height - r * b * Math.sin(theta * RAD);
  return { x: px / canvas.width, y: py / canvas.height };
}

/** Dokunulan noktanin koseye gore acisini derece olarak verir (-180..180). */
function dokunAcisi(canvas, kose, p) {
  const dx = (p.x - kose.x) * canvas.width;
  const dy = (kose.y - p.y) * canvas.height;
  return Math.atan2(dy, dx) / RAD;
}

// ------------------------------------------------------------------
// Seviye 1: aci nedir, nasil olculur
// ------------------------------------------------------------------

/**
 * aci-kose-kol: saat ornegi. Akrep sabit, yelkovan surukleniyor. Kose
 * (ortak nokta) hicbir zaman yerinden oynamiyor - cocugun gormesi
 * gereken sey tam olarak bu: kollar acilip kapanirken kose sabit kalir.
 */
export function gorselAciKoseKol(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.68 };
  const akrepAcisi = 20;
  let yelkovanAcisi = 100;

  function ciz() {
    temizle(ctx, canvas);
    const akrepUc = kolUcu(canvas, kose, akrepAcisi, 4.5);
    const yelkovanUc = kolUcu(canvas, kose, yelkovanAcisi, 7.5);

    cizgi(ctx, canvas, kose, akrepUc, RENK.cizgi);
    ok(ctx, canvas, kose, yelkovanUc, RENK.vurgu);
    nokta(ctx, canvas, kose, RENK.ikinci, 6);

    etiket(ctx, canvas, { x: kose.x - 0.07, y: kose.y + 0.05 }, 'köşe', RENK.ikinci);
    etiket(ctx, canvas, {
      x: (kose.x + akrepUc.x) / 2, y: (kose.y + akrepUc.y) / 2 - 0.05
    }, 'kol', RENK.cizgi);
    etiket(ctx, canvas, {
      x: (kose.x + yelkovanUc.x) / 2 + 0.06, y: (kose.y + yelkovanUc.y) / 2
    }, 'kol', RENK.vurgu);

    altYazi(ctx, canvas, 'Uzun kolu sürükle, köşenin yerinde durduğunu gör');
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    yelkovanAcisi = sinirla(theta, 5, 175);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kolu sürükle, köşenin nasıl sabit kaldığını gör' };
}

/**
 * aci-buyuklugu: ayni iki dogrultu, degisen kol uzunlugu. Aci sayisi
 * dogrultularArasiAci'dan gelir - o fonksiyon uzunluktan bagimsiz oldugu
 * icin kollar ne kadar uzasa da kisalsa da sayi asla degismiyor.
 */
export function gorselAciBuyuklugu(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.68 };
  const acisi1 = 15;
  const acisi2 = 75;
  const uzunluklar = [4, 8.5, 6];
  let i = 0;

  function ciz() {
    temizle(ctx, canvas);
    const r = uzunluklar[i];
    const uc1 = kolUcu(canvas, kose, acisi1, r);
    const uc2 = kolUcu(canvas, kose, acisi2, r);
    const derece = dogrultularArasiAci(
      Math.cos(acisi1 * RAD), Math.sin(acisi1 * RAD),
      Math.cos(acisi2 * RAD), Math.sin(acisi2 * RAD)
    );

    yay(ctx, canvas, kose, Math.min(r, 3), acisi1, acisi2, RENK.silik);
    cizgi(ctx, canvas, kose, uc1, RENK.vurgu);
    cizgi(ctx, canvas, kose, uc2, RENK.vurgu);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);
    etiket(ctx, canvas, kolUcu(canvas, kose, (acisi1 + acisi2) / 2, 2), deriyaz(derece), RENK.ucuncu);

    altYazi(ctx, canvas, `Kollar ${r < 6 ? 'kısa' : 'uzun'} ama açı yine ${deriyaz(derece)}`);
  }

  function dokun(p) {
    i = (i + 1) % uzunluklar.length;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kollara dokun, uzunluklarını değiştir' };
}

/**
 * aciolcer: aracin parcalarini tanitir. Dokunuldukca sirayla merkez,
 * sifir cizgisi, sonra iki sayi sirasi vurgulanir - lesson metni de
 * ayni sirayla anlatiyor.
 */
export function gorselAciolcer(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.8 };
  let secim = -1;
  const ADLAR = ['merkez', 'sifir', 'sira'];

  function ciz() {
    temizle(ctx, canvas);
    yay(ctx, canvas, merkez, 7.5, 0, 180, RENK.cizgi, false);

    if (secim === 0) {
      nokta(ctx, canvas, merkez, RENK.ucuncu, 7);
      etiket(ctx, canvas, { x: merkez.x, y: merkez.y + 0.09 }, 'merkez', RENK.ucuncu);
    } else {
      nokta(ctx, canvas, merkez, RENK.cizgi, 4);
    }

    if (secim === 1) {
      const uc = kolUcu(canvas, merkez, 0, 7.5);
      cizgi(ctx, canvas, merkez, uc, RENK.ucuncu, null, 4);
      etiket(ctx, canvas, kolUcu(canvas, merkez, 0, 8.6), 'sıfır çizgisi', RENK.ucuncu);
    }

    if (secim === 2) {
      etiket(ctx, canvas, kolUcu(canvas, merkez, 40, 6.3), '40', RENK.vurgu);
      etiket(ctx, canvas, kolUcu(canvas, merkez, 40, 8.6), String(Math.round(butunler(40))), RENK.ikinci);
      etiket(ctx, canvas, { x: 0.5, y: merkez.y - 0.34 }, 'iki sıra', RENK.cizgi);
    }

    altYazi(ctx, canvas, secim === -1
      ? 'Dokun, açıölçerin parçalarını sırayla tanı'
      : `Şimdi ${ADLAR[secim] === 'sifir' ? 'sıfır çizgisini' : ADLAR[secim] === 'merkez' ? 'merkezi' : 'iki sayı sırasını'} görüyorsun`);
  }

  function dokun(p) {
    secim = (secim + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Açıölçerin parçalarını görmek için dokun' };
}

/**
 * aciolcer-olcme: tek sira, tek okuma. Kose sabit, aciolcerin merkezi
 * zaten orada, sifir cizgisi zaten sabit kolun uzerinde - cocuk sadece
 * diger kolu surukleyip hangi sayinin uzerinden gectigini goruyor.
 */
export function gorselAciolcerOlcme(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.8 };
  let hareketli = 50;

  function ciz() {
    temizle(ctx, canvas);
    yay(ctx, canvas, kose, 7.5, 0, 180, RENK.silik, false);
    for (let d = 0; d <= 180; d += 30) {
      etiket(ctx, canvas, kolUcu(canvas, kose, d, 8.4), String(d), RENK.silik);
    }

    const sabitUc = kolUcu(canvas, kose, 0, 7);
    const hareketliUc = kolUcu(canvas, kose, hareketli, 7);
    cizgi(ctx, canvas, kose, sabitUc, RENK.cizgi);
    ok(ctx, canvas, kose, hareketliUc, RENK.vurgu);
    nokta(ctx, canvas, kose, RENK.ikinci, 5);
    etiket(ctx, canvas, kolUcu(canvas, kose, hareketli, 8.4), String(Math.round(hareketli)), RENK.vurgu);

    altYazi(ctx, canvas, `Kol açıölçerin üstünde ${deriyaz(hareketli)} üzerinden geçiyor`);
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    hareketli = sinirla(theta, 5, 175);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kolu sürükle, açıölçerden dereceyi oku' };
}

/**
 * aciolcer-skala: iki sira. Sabit kolun durdugu tarafta sifir hangi
 * sirada basliyorsa okunacak sira odur - ama bu cumleyi ekrana yazip
 * cocuga soylemiyoruz, o sirayi kendi bulmali. Iki aday sayi da esit
 * agirlikta gosteriliyor.
 */
export function gorselAciolcerSkala(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.8 };
  let hareketli = 60;

  function ciz() {
    temizle(ctx, canvas);
    yay(ctx, canvas, kose, 7.5, 0, 180, RENK.silik, false);

    for (let d = 0; d <= 180; d += 30) {
      etiket(ctx, canvas, kolUcu(canvas, kose, d, 8.5), String(d), RENK.vurgu, 11);
      etiket(ctx, canvas, kolUcu(canvas, kose, d, 6.6), String(Math.round(butunler(d))), RENK.ikinci, 11);
    }

    const sabitUc = kolUcu(canvas, kose, 0, 7);
    const hareketliUc = kolUcu(canvas, kose, hareketli, 7);
    cizgi(ctx, canvas, kose, sabitUc, RENK.cizgi);
    ok(ctx, canvas, kose, hareketliUc, RENK.ucuncu);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    const disOku = Math.round(hareketli);
    const icOku = Math.round(butunler(hareketli));
    etiket(ctx, canvas, kolUcu(canvas, kose, hareketli + 4, 9.3), String(disOku), RENK.vurgu);
    etiket(ctx, canvas, kolUcu(canvas, kose, hareketli - 4, 9.3), String(icOku), RENK.ikinci);

    altYazi(ctx, canvas, 'Kolun üstündeki iki sayıdan hangisini okuman gerektiğini bul');
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    hareketli = sinirla(theta, 5, 175);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Açıölçeri sürükle ve açıyı oku' };
}

/**
 * aci-turleri: kolu surukledikce siniflandirma canli degisiyor.
 * aciTuru + ACI_TURU_ADI motor katmanindan geliyor, isim burada
 * yeniden yazilmiyor.
 */
export function gorselAciTurleri(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.8 };
  let hareketli = 45;

  function ciz() {
    temizle(ctx, canvas);
    const derece = Math.round(hareketli);
    const tur = aciTuru(derece);
    const renkler = { dar: RENK.ikinci, dik: RENK.vurgu, genis: RENK.ucuncu, dogru: RENK.sari, tam: RENK.sari };

    const sabitUc = kolUcu(canvas, kose, 0, 7);
    const hareketliUc = kolUcu(canvas, kose, hareketli, 7);
    yay(ctx, canvas, kose, 3, 0, hareketli, renkler[tur] || RENK.silik);
    cizgi(ctx, canvas, kose, sabitUc, RENK.cizgi);
    ok(ctx, canvas, kose, hareketliUc, renkler[tur] || RENK.vurgu);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    if (tur === 'dik') {
      dikIsaret(ctx, canvas, kose, { x: 1, y: 0 }, { x: 0, y: 1 });
    }

    altYazi(ctx, canvas, `${deriyaz(derece)}: ${ACI_TURU_ADI[tur]}`);
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    hareketli = sinirla(theta, 1, 180);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kolu sürükle, açının türünü gör' };
}

// ------------------------------------------------------------------
// Seviye 2: kesisen dogrularin acilari
// ------------------------------------------------------------------

/**
 * butunler: duz bir dogru uzerinde bir kol surukleniyor. Iki parca
 * her zaman 180 dereceye tamamlaniyor; ikinci sayi butunler()'den
 * geliyor, elle 180-a yazilmiyor.
 */
export function gorselButunler(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.55 };
  let a = 70;

  function ciz() {
    temizle(ctx, canvas);
    const b = butunler(a);
    const solUc = kolUcu(canvas, kose, 180, 8);
    const sagUc = kolUcu(canvas, kose, 0, 8);
    const kolUc = kolUcu(canvas, kose, a, 6.5);

    cizgi(ctx, canvas, solUc, sagUc, RENK.cizgi);
    yay(ctx, canvas, kose, 3, 0, a, RENK.vurgu);
    yay(ctx, canvas, kose, 3, a, 180, RENK.ikinci);
    ok(ctx, canvas, kose, kolUc, RENK.ucuncu);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    etiket(ctx, canvas, kolUcu(canvas, kose, a / 2, 1.6), deriyaz(a), RENK.vurgu, 12);
    etiket(ctx, canvas, kolUcu(canvas, kose, (a + 180) / 2, 1.6), deriyaz(b), RENK.ikinci, 12);

    altYazi(ctx, canvas, `${deriyaz(a)} + ${deriyaz(b)} = 180 derece`);
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    a = sinirla(theta, 3, 177);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kolu sürükle, iki açının toplamını gör' };
}

/**
 * butunler-hesap: ayni kural, sokak ornegiyle ve cikarma islemi acikca
 * yazilarak. butunler-a farkli bir gorunum olsun diye yol/sokak
 * metaforu kullaniliyor, hesap yine butunler()'den geliyor.
 */
export function gorselButunlerHesap(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.35, y: 0.55 };
  let a = 100;

  function ciz() {
    temizle(ctx, canvas);
    const b = butunler(a);
    const solUc = kolUcu(canvas, kose, 180, 9);
    const sagUc = kolUcu(canvas, kose, 0, 9);
    const sokakUc = kolUcu(canvas, kose, a, 6);

    cizgi(ctx, canvas, solUc, sagUc, RENK.cizgi, null, 5);
    cizgi(ctx, canvas, kose, sokakUc, RENK.ucuncu, null, 3.5);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    etiket(ctx, canvas, kolUcu(canvas, kose, a / 2, 2.2), deriyaz(a), RENK.ucuncu, 12);
    etiket(ctx, canvas, kolUcu(canvas, kose, (a + 180) / 2, 2.2), deriyaz(b), RENK.ikinci, 12);
    etiket(ctx, canvas, { x: 0.5, y: kose.y - 0.28 }, `180 - ${Math.round(a)} = ${Math.round(b)}`, RENK.cizgi, 13);

    altYazi(ctx, canvas, 'Yolu sürükle, sokağın açısını değiştir');
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    a = sinirla(theta, 3, 177);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Sokağı sürükle, çıkarma işlemini gör' };
}

/**
 * tumler: 180 degil 90'a tamamlaniyor - cocuklarin en sik karistirdigi
 * yer burasi oldugu icin disaridaki iki kol arasina dikIsaret koyuyoruz,
 * toplamin 90 oldugunu gozle de gosteriyoruz.
 */
export function gorselTumler(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.75 };
  let a = 35;

  function ciz() {
    temizle(ctx, canvas);
    const b = tumler(a);
    const altUc = kolUcu(canvas, kose, 0, 8);
    const ustUc = kolUcu(canvas, kose, 90, 8);
    const kolUc = kolUcu(canvas, kose, a, 6.5);

    cizgi(ctx, canvas, kose, altUc, RENK.cizgi);
    cizgi(ctx, canvas, kose, ustUc, RENK.cizgi);
    yay(ctx, canvas, kose, 3, 0, a, RENK.vurgu);
    yay(ctx, canvas, kose, 3, a, 90, RENK.ikinci);
    ok(ctx, canvas, kose, kolUc, RENK.ucuncu);
    dikIsaret(ctx, canvas, kose, { x: 1, y: 0 }, { x: 0, y: 1 });
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    etiket(ctx, canvas, kolUcu(canvas, kose, a / 2, 1.6), deriyaz(a), RENK.vurgu, 12);
    etiket(ctx, canvas, kolUcu(canvas, kose, (a + 90) / 2, 1.6), deriyaz(b), RENK.ikinci, 12);

    altYazi(ctx, canvas, `${deriyaz(a)} + ${deriyaz(b)} = 90 derece`);
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    a = sinirla(theta, 3, 87);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Kolu sürükle, tümler açıları gör' };
}

/**
 * Kesisen iki dogrunun etrafinda kalan 4 sektorden hangisine
 * dokunuldugunu bulur. taban derecesi 0..180 arasinda sabit kabul edilir.
 */
function sektorSec(theta, taban) {
  const t = tam360(theta);
  if (t < taban) return 0;
  if (t < 180) return 1;
  if (t < 180 + taban) return 2;
  return 3;
}

/**
 * kesisim-dort-aci: iki dogru kesisince olusan 4 aciyi tek tek tanit.
 * "Bu aci" ve "komsu" icin sayi gosteriliyor (komsuAci); "ters" icin
 * henuz sayi gosterilmiyor - esitligi ispatlamak bir sonraki gorselin
 * (ters-acilar) isi.
 */
export function gorselKesisimDortAci(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.5 };
  const taban = 55;
  let secili = null;

  function ciz() {
    temizle(ctx, canvas);
    const uc1 = kolUcu(canvas, kose, 0, 8.5);
    const uc2 = kolUcu(canvas, kose, 180, 8.5);
    const uc3 = kolUcu(canvas, kose, taban, 8.5);
    const uc4 = kolUcu(canvas, kose, taban + 180, 8.5);
    cizgi(ctx, canvas, uc1, uc2, RENK.cizgi);
    cizgi(ctx, canvas, uc3, uc4, RENK.cizgi);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    const sinirlar = [[0, taban], [taban, 180], [180, 180 + taban], [180 + taban, 360]];
    const komsu = komsuAci(taban);

    if (secili !== null) {
      const [bas, bit] = sinirlar[secili];
      yay(ctx, canvas, kose, 3, bas, bit, RENK.vurgu);
      const orta = (bas + bit) / 2;
      if (secili === 0) {
        etiket(ctx, canvas, kolUcu(canvas, kose, orta, 1.7), `Bu açı: ${deriyaz(taban)}`, RENK.vurgu, 12);
      } else if (secili === 2) {
        etiket(ctx, canvas, kolUcu(canvas, kose, orta, 1.7), 'Ters açı', RENK.vurgu, 12);
      } else {
        etiket(ctx, canvas, kolUcu(canvas, kose, orta, 1.7), `Komşu: ${deriyaz(komsu)}`, RENK.vurgu, 12);
      }
    }

    altYazi(ctx, canvas, secili === null
      ? 'Dokun, dört açıdan birini seç'
      : 'Yan yana duranlar komşu, karşılıklı duranlar ters açı');
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    secili = sektorSec(theta, taban);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, her açıyı sırayla incele' };
}

/**
 * ters-acilar: bir dogru sabit, digeri sürükleniyor. Karsidaki aci
 * tersAci() ile hesaplaniyor - surukledikce sayi degisiyor ama iki
 * taraf HER ZAMAN esit kaliyor, ispat bu tekrarla goruluyor.
 */
export function gorselTersAcilar(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const kose = { x: 0.5, y: 0.5 };
  let a = 48;

  function ciz() {
    temizle(ctx, canvas);
    const ters = tersAci(a);
    const uc1 = kolUcu(canvas, kose, 0, 8.5);
    const uc2 = kolUcu(canvas, kose, 180, 8.5);
    const uc3 = kolUcu(canvas, kose, a, 8.5);
    const uc4 = kolUcu(canvas, kose, a + 180, 8.5);
    cizgi(ctx, canvas, uc1, uc2, RENK.cizgi);
    cizgi(ctx, canvas, uc3, uc4, RENK.ucuncu);
    nokta(ctx, canvas, kose, RENK.cizgi, 5);

    yay(ctx, canvas, kose, 3, 0, a, RENK.vurgu);
    yay(ctx, canvas, kose, 3, 180, 180 + a, RENK.vurgu);

    etiket(ctx, canvas, kolUcu(canvas, kose, a / 2, 1.7), deriyaz(a), RENK.vurgu, 12);
    etiket(ctx, canvas, kolUcu(canvas, kose, 180 + a / 2, 1.7), deriyaz(ters), RENK.vurgu, 12);

    altYazi(ctx, canvas, `Açıyı değiştirdin, karşısındaki hep aynı kaldı: ${deriyaz(ters)}`);
  }

  function dokun(p) {
    const theta = dokunAcisi(canvas, kose, p);
    a = sinirla(tam360(theta) > 180 ? tam360(theta) - 180 : tam360(theta), 3, 177);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Bir doğruyu sürükle, ters açıların hep eşit kaldığını gör' };
}

/**
 * uc-dogru: uc ayri kesisme noktasi, her birinde ayni kural. Dokunulan
 * yere en yakin kose secilir, oradaki komsu/ters aciler gosterilir.
 */
export function gorselUcDogru(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const koseler = [
    { x: 0.3, y: 0.35, taban: 50 },
    { x: 0.72, y: 0.35, taban: 65 },
    { x: 0.5, y: 0.82, taban: 42 }
  ];
  let seciliKose = null;
  let seciliSektor = null;

  function ciz() {
    temizle(ctx, canvas);
    for (const k of koseler) {
      const uc1 = kolUcu(canvas, k, 0, 5.5);
      const uc2 = kolUcu(canvas, k, 180, 5.5);
      const uc3 = kolUcu(canvas, k, k.taban, 5.5);
      const uc4 = kolUcu(canvas, k, k.taban + 180, 5.5);
      cizgi(ctx, canvas, uc1, uc2, RENK.cizgi);
      cizgi(ctx, canvas, uc3, uc4, RENK.cizgi);
      nokta(ctx, canvas, k, RENK.cizgi, 4);
    }

    if (seciliKose !== null) {
      const k = koseler[seciliKose];
      const sinirlar = [[0, k.taban], [k.taban, 180], [180, 180 + k.taban], [180 + k.taban, 360]];
      const [bas, bit] = sinirlar[seciliSektor];
      yay(ctx, canvas, k, 2.2, bas, bit, RENK.vurgu);
      const komsu = komsuAci(k.taban);
      const metin = seciliSektor === 2 ? 'Ters açı' : (seciliSektor === 0 ? deriyaz(k.taban) : `Komşu: ${deriyaz(komsu)}`);
      etiket(ctx, canvas, kolUcu(canvas, k, (bas + bit) / 2, 1.2), metin, RENK.vurgu, 11);
    }

    altYazi(ctx, canvas, seciliKose === null
      ? 'Dokun, her köşedeki açıları incele'
      : 'Bu köşede de komşu açılar bütünler, ters açılar eşit');
  }

  function dokun(p) {
    let enYakin = 0;
    let enKisa = Infinity;
    for (let i = 0; i < koseler.length; i++) {
      const d = Math.hypot(p.x - koseler[i].x, p.y - koseler[i].y);
      if (d < enKisa) { enKisa = d; enYakin = i; }
    }
    seciliKose = enYakin;
    const k = koseler[enYakin];
    const theta = dokunAcisi(canvas, k, p);
    seciliSektor = sektorSec(theta, k.taban);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, her köşedeki açıları incele' };
}
