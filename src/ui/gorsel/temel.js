/**
 * temel-cizimler konusunun anlatim gorselleri (1-2. hafta).
 *
 * Her gorsel etkilesimli: cocuk dokunur, bir sey OLUR ve o sey adimin
 * anlattigi fikri gosterir. Dokunma sus degil - dokunmadan once ve
 * sonra ekranda farkli bir sey durur, fark da dersin konusudur.
 */

import { RENK, nokta, cizgi, cember, yay, dikIsaret, etiket, altYazi, temizle, uzaklik } from './cizim.js';

const HARF = ['A', 'B', 'C', 'D', 'E'];

/**
 * nokta: cocuk tuvale dokundukca nokta koyar, her biri buyuk harfle
 * adlandirilir. "Noktalara isim vermek icin buyuk harf kullaniriz"
 * cumlesini okumak yerine yaptirir.
 */
export function gorselNokta(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.vurgu, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.vurgu);
    }
    altYazi(ctx, canvas, noktalar.length === 0
      ? 'Tuvale dokun, bir nokta koy'
      : `${noktalar.length} nokta koydun. Her birinin adı var.`);
  }

  function dokun(p) {
    if (noktalar.length >= HARF.length) {
      noktalar.length = 0;
    } else {
      noktalar.push(p);
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Tuvale dokun, noktalara isim ver' };
}

/**
 * dogru: iki nokta koyar, ikincisinden sonra aralarindaki cizgi IKI
 * YONDE de tuval disina tasar. "Basi da sonu da yoktur" fikri burada
 * gozle goruluyor.
 */
export function gorselDogru(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    if (noktalar.length === 2) {
      cizgi(ctx, canvas, noktalar[0], noktalar[1], RENK.vurgu, 'iki');
    }
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.cizgi, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.cizgi);
    }
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'İki nokta koy'
      : 'Çizgi iki yönde de tuvalin dışına taşıyor: ucu yok');
  }

  function dokun(p) {
    if (noktalar.length >= 2) noktalar.length = 0;
    else if (ses) ses.efekt('tik');
    if (noktalar.length < 2) noktalar.push(p);
    ciz();
  }

  return { ciz, dokun, ipucu: 'İki nokta koy, aralarından geçen doğruyu gör' };
}

/**
 * isin: ayni iki nokta, ama cizgi yalniz ikinci yonde tasar. Dogru
 * gorseliyle YAN YANA ayni hareket, farkli sonuc - fark tam olarak
 * dersin ogrettigi sey.
 */
export function gorselIsin(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    if (noktalar.length === 2) {
      cizgi(ctx, canvas, noktalar[0], noktalar[1], RENK.ikinci, 'tek');
    }
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.cizgi, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.cizgi);
    }
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'Önce başlangıç noktasını koy'
      : 'A tarafında duruyor, B tarafında sonsuza gidiyor');
  }

  function dokun(p) {
    if (noktalar.length >= 2) noktalar.length = 0;
    else if (ses) ses.efekt('tik');
    if (noktalar.length < 2) noktalar.push(p);
    ciz();
  }

  return { ciz, dokun, ipucu: 'Başlangıcı ve yönü seç, ışını gör' };
}

/**
 * dogru-parcasi: iki nokta, arasi kapali ve UZUNLUGU yaziyor. Olcu
 * yalniz burada cikar, cunku olculebilir olmasi dogru parcasini digerlerinden
 * ayiran sey.
 */
export function gorselDogruParcasi(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    if (noktalar.length === 2) {
      cizgi(ctx, canvas, noktalar[0], noktalar[1], RENK.ucuncu);
      const cm = Math.round(uzaklik(noktalar[0], noktalar[1]) * 20);
      etiket(ctx, canvas, {
        x: (noktalar[0].x + noktalar[1].x) / 2,
        y: (noktalar[0].y + noktalar[1].y) / 2 - 0.07
      }, `${cm} cm`, RENK.ucuncu);
    }
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.cizgi, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.cizgi);
    }
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'İki uç nokta koy'
      : 'İki ucu da belli, bu yüzden uzunluğu ölçülebiliyor');
  }

  function dokun(p) {
    if (noktalar.length >= 2) noktalar.length = 0;
    else if (ses) ses.efekt('tik');
    if (noktalar.length < 2) noktalar.push(p);
    ciz();
  }

  return { ciz, dokun, ipucu: 'İki uç koy, uzunluğunu gör' };
}

/**
 * araclar: cocuk dort aract adindan birine dokunur, tuval o aracin
 * ciziverdigi sekli gosterir. Once bos bir arac sirasi durur, dokunuldukca
 * farkli bir sekil cikar - hangi aletin ne cizdigi boyle ogreniliyor.
 */
const ARACLAR = [
  { ad: 'Cetvel', aciklama: 'Cetvel: doğru, ışın ve doğru parçası için bu yeter' },
  { ad: 'Pergel', aciklama: 'Pergel: merkeze olan uzaklığı sabit tutar, çemberi böyle çizersin' },
  { ad: 'Açıölçer', aciklama: 'Açıölçer: açının kaç derece olduğunu böyle ölçersin' },
  { ad: 'Gönye', aciklama: 'Gönye: köşesi tam 90 derece olduğu için dikme böyle çizilir' }
];

export function gorselAraclar(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let secili = null;

  function ciz() {
    temizle(ctx, canvas);
    for (let i = 0; i < ARACLAR.length; i++) {
      const x = 0.2 + i * 0.2;
      etiket(ctx, canvas, { x, y: 0.15 }, ARACLAR[i].ad, i === secili ? RENK.vurgu : RENK.cizgi, 13);
    }

    if (secili === 0) {
      cizgi(ctx, canvas, { x: 0.25, y: 0.6 }, { x: 0.75, y: 0.6 }, RENK.ucuncu);
    } else if (secili === 1) {
      cember(ctx, canvas, { x: 0.5, y: 0.6 }, 2, RENK.vurgu);
      nokta(ctx, canvas, { x: 0.5, y: 0.6 }, RENK.vurgu, 4);
    } else if (secili === 2) {
      const v = { x: 0.35, y: 0.6 };
      yay(ctx, canvas, v, 2, 0, 55, RENK.sari);
      cizgi(ctx, canvas, v, { x: 0.63, y: 0.6 }, RENK.cizgi, 'tek');
      cizgi(ctx, canvas, v, { x: 0.511, y: 0.371 }, RENK.cizgi, 'tek');
    } else if (secili === 3) {
      const v = { x: 0.35, y: 0.6 };
      cizgi(ctx, canvas, v, { x: 0.65, y: 0.6 }, RENK.cizgi);
      cizgi(ctx, canvas, v, { x: 0.35, y: 0.34 }, RENK.cizgi);
      dikIsaret(ctx, canvas, v, { x: 1, y: 0 }, { x: 0, y: -1 }, RENK.ikinci);
    }

    altYazi(ctx, canvas, secili === null ? 'Bir araç seç, ne çizdiğini gör' : ARACLAR[secili].aciklama);
  }

  function dokun(p) {
    const i = Math.round((p.x - 0.2) / 0.2);
    secili = Math.min(Math.max(i, 0), ARACLAR.length - 1);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Bir araç seç, ne çizdiğini gör' };
}

/**
 * cember-aci-dikme: onizleme dersi, henuz insa etmiyoruz - sadece
 * tanimayi ogretiyoruz. Her dokunus siradaki sekle geciyor, dorduncu
 * dokunus basa donuyor. Uc farkli sekil, uc farkli tanim.
 */
export function gorselCemberAciDikme(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let adim = 0;

  function ciz() {
    temizle(ctx, canvas);
    if (adim === 1) {
      const m = { x: 0.5, y: 0.5 };
      cember(ctx, canvas, m, 3, RENK.vurgu);
      nokta(ctx, canvas, m, RENK.cizgi, 5);
      etiket(ctx, canvas, { x: m.x, y: m.y - 0.1 }, 'merkez', RENK.cizgi, 12);
    } else if (adim === 2) {
      const v = { x: 0.35, y: 0.6 };
      yay(ctx, canvas, v, 2, 0, 70, RENK.sari);
      cizgi(ctx, canvas, v, { x: 0.63, y: 0.6 }, RENK.cizgi, 'tek');
      cizgi(ctx, canvas, v, { x: 0.446, y: 0.337 }, RENK.cizgi, 'tek');
    } else if (adim === 3) {
      cizgi(ctx, canvas, { x: 0.3, y: 0.6 }, { x: 0.7, y: 0.6 }, RENK.cizgi, 'iki');
      cizgi(ctx, canvas, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.6 }, RENK.ikinci, 'iki');
      dikIsaret(ctx, canvas, { x: 0.5, y: 0.6 }, { x: 1, y: 0 }, { x: 0, y: -1 }, RENK.ikinci);
    }

    altYazi(ctx, canvas, [
      'Dokun, sırayla üç yeni şekli gör',
      'Çember: merkeze her zaman aynı uzaklıkta duran noktalardan oluşur',
      'Açı: başlangıç noktaları aynı olan iki ışından oluşur',
      'Dikme: bir doğruya 90 derece açıyla çizilen doğrudur'
    ][adim]);
  }

  function dokun(p) {
    adim = (adim + 1) % 4;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, sırayla üç şekli tanı' };
}

/**
 * gosterim-dogru-parcasi: iki uc konunca [AB] gosterimi CIKAR, tek
 * ucta hicbir parantez yok. Parantezin iki tarafta da olmasi iki ucun
 * da belli olmasindan geliyor - dokunma bunu gozle gosteriyor.
 */
export function gorselGosterimDogruParcasi(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    if (noktalar.length === 2) {
      cizgi(ctx, canvas, noktalar[0], noktalar[1], RENK.ucuncu);
      etiket(ctx, canvas, { x: 0.5, y: 0.15 }, '[AB]', RENK.ucuncu, 16);
    }
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.cizgi, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.cizgi);
    }
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'İki uç noktayı koy'
      : '[AB]: iki ucu da belli, bu yüzden parantez iki tarafta da var');
  }

  function dokun(p) {
    if (noktalar.length >= 2) noktalar.length = 0;
    else if (ses) ses.efekt('tik');
    if (noktalar.length < 2) noktalar.push(p);
    ciz();
  }

  return { ciz, dokun, ipucu: 'İki ucu koy, [AB] gösterimini gör' };
}

/**
 * gosterim-isin: ayni iki nokta, ama uc noktali dokunus ISIN ile DOGRU
 * gosterimi arasinda gidip geliyor. Isin tek parantezli [AB, dogru hic
 * parantezsiz - B tarafinin acik mi kapali mi oldugu boyle gorulur.
 */
export function gorselGosterimIsin(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];
  let dogruMu = false;

  function ciz() {
    temizle(ctx, canvas);
    if (noktalar.length === 2) {
      const renk = dogruMu ? RENK.vurgu : RENK.ikinci;
      cizgi(ctx, canvas, noktalar[0], noktalar[1], renk, dogruMu ? 'iki' : 'tek');
      etiket(ctx, canvas, { x: 0.5, y: 0.12 }, dogruMu ? 'AB doğrusu' : '[AB', renk, 16);
    }
    for (let i = 0; i < noktalar.length; i++) {
      nokta(ctx, canvas, noktalar[i], RENK.cizgi, 6);
      etiket(ctx, canvas, { x: noktalar[i].x, y: noktalar[i].y - 0.08 }, HARF[i], RENK.cizgi);
    }
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'İki nokta koy'
      : dogruMu
        ? 'Doğru: hiç parantez yok, çünkü iki yönde de hiç bitmiyor'
        : 'Işın: parantez yalnız başlangıçta var, B tarafı sonsuza gidiyor');
  }

  function dokun(p) {
    if (noktalar.length < 2) {
      noktalar.push(p);
      if (ses) ses.efekt('tik');
    } else {
      dogruMu = !dogruMu;
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'İki nokta koy, sonra dokunup ışın ile doğruyu karşılaştır' };
}

/**
 * uc-sayilari: cocuk uc sayisini SOYLENMEDEN, dokunarak kendi bulur.
 * Her sekil icin gercek uc noktalarinda hedefler durur; bulunani renk
 * degistirir. Uc sayisi sifir olan sekillerde hic hedef yoktur - arayip
 * hicbir sey bulamamak da dersin bir parcasi.
 */
const UC_SEKILLER = [
  {
    ad: 'nokta', ucSayisi: 0, uclar: [],
    arama: 'Bu nokta: onun da ucu var mı? Dokun ve ara',
    sifir: 'Nokta tek başına bir yerdir, onun da ucu yoktur'
  },
  { ad: 'isin', ucSayisi: 1, uclar: [{ x: 0.25, y: 0.5 }] },
  { ad: 'dogru-parcasi', ucSayisi: 2, uclar: [{ x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 }] },
  {
    ad: 'dogru', ucSayisi: 0, uclar: [],
    arama: 'Bu doğru: ucu var mı? Dokun ve ara',
    sifir: 'Doğru iki yönde de sonsuza gittiği için ucu yoktur'
  }
];

export function gorselUcSayilari(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let sekilIndex = 0;
  const bulunan = new Set();
  let aranmaTamam = false;

  function altYaziMetni(s) {
    if (s.ucSayisi === 0) return aranmaTamam ? s.sifir : s.arama;
    if (bulunan.size === 0) return 'Bu şekilde kaç uç var? Dokunarak bul';
    if (bulunan.size < s.ucSayisi) return `${bulunan.size} uç buldun, devam et`;
    return `${bulunan.size} uç buldun. Sıradaki şekle geçmek için dokun`;
  }

  function ciz() {
    temizle(ctx, canvas);
    const s = UC_SEKILLER[sekilIndex];
    const a = { x: 0.25, y: 0.5 };
    const b = { x: 0.75, y: 0.5 };
    if (s.ad === 'nokta') {
      nokta(ctx, canvas, { x: 0.5, y: 0.5 }, RENK.cizgi, 6);
    } else if (s.ad === 'isin') {
      cizgi(ctx, canvas, a, b, RENK.ikinci, 'tek');
    } else if (s.ad === 'dogru-parcasi') {
      cizgi(ctx, canvas, a, b, RENK.ucuncu);
    } else {
      cizgi(ctx, canvas, a, b, RENK.vurgu, 'iki');
    }
    for (let i = 0; i < s.uclar.length; i++) {
      const buldu = bulunan.has(i);
      nokta(ctx, canvas, s.uclar[i], buldu ? RENK.ikinci : RENK.silik, buldu ? 7 : 5);
    }
    altYazi(ctx, canvas, altYaziMetni(s));
  }

  function ilerle() {
    sekilIndex = (sekilIndex + 1) % UC_SEKILLER.length;
    bulunan.clear();
    aranmaTamam = false;
  }

  function dokun(p) {
    const s = UC_SEKILLER[sekilIndex];
    if (s.ucSayisi === 0) {
      if (aranmaTamam) ilerle();
      else {
        aranmaTamam = true;
        if (ses) ses.efekt('tik');
      }
    } else if (bulunan.size < s.ucSayisi) {
      let buldu = false;
      for (let i = 0; i < s.uclar.length; i++) {
        if (!bulunan.has(i) && uzaklik(p, s.uclar[i]) < 0.12) {
          bulunan.add(i);
          buldu = true;
          break;
        }
      }
      if (buldu && ses) ses.efekt('tik');
    } else {
      ilerle();
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Şekillerin kaç ucu olduğunu dokunarak bul' };
}

/**
 * dikme: sabit bir dogru ve uzerinde P noktasi durur. Cocuk dokunarak
 * P'den gecen baska bir dogrunun yonunu secer; yalniz 90 dereceye
 * yakin secimlerde dik isareti cikar. Herhangi bir dogru ile TAM dik
 * olan arasindaki fark boyle deneyerek bulunuyor.
 */
export function gorselDikme(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const p0 = { x: 0.5, y: 0.5 };
  let ikinci = null;

  function aciDereceden(q) {
    const dx = (q.x - p0.x) * canvas.width;
    const dy = (q.y - p0.y) * canvas.height;
    return Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
  }

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, RENK.cizgi, 'iki');
    nokta(ctx, canvas, p0, RENK.cizgi, 6);
    etiket(ctx, canvas, { x: p0.x, y: p0.y + 0.09 }, 'P', RENK.cizgi);

    let dikMi = false;
    if (ikinci) {
      dikMi = Math.abs(aciDereceden(ikinci) - 90) < 8;
      const renk = dikMi ? RENK.ikinci : RENK.ucuncu;
      cizgi(ctx, canvas, p0, ikinci, renk, 'iki');
      if (dikMi) {
        dikIsaret(ctx, canvas, p0, { x: 1, y: 0 }, { x: ikinci.x - p0.x, y: ikinci.y - p0.y }, renk);
      }
    }

    altYazi(ctx, canvas, !ikinci
      ? "Dokunarak P'den geçen bir doğru çiz"
      : dikMi
        ? 'Şimdi 90 derece: buna dikme denir'
        : "Bu doğru P'den geçiyor ama dik değil, tekrar dene");
  }

  function dokun(p) {
    ikinci = p;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: "P'den geçen doğruyu döndür, dik olanı bul" };
}

/**
 * dik-kesisim: iki dogru M noktasinda kesisiyor, dort kose olusuyor.
 * Cocuk her koseye dokundukca oraya gonyeyi yaslamis gibi dik isareti
 * cikar. Dorduncu koseden sonra hepsinin ayni oldugunu gorur.
 */
export function gorselDikKesisim(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const m = { x: 0.5, y: 0.5 };
  const KOSELER = {
    'sag-ust': { yon1: { x: 1, y: 0 }, yon2: { x: 0, y: -1 } },
    'sol-ust': { yon1: { x: -1, y: 0 }, yon2: { x: 0, y: -1 } },
    'sol-alt': { yon1: { x: -1, y: 0 }, yon2: { x: 0, y: 1 } },
    'sag-alt': { yon1: { x: 1, y: 0 }, yon2: { x: 0, y: 1 } }
  };
  const bulunan = new Set();

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, RENK.cizgi, 'iki');
    cizgi(ctx, canvas, { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.55 }, RENK.cizgi, 'iki');
    for (const kose of bulunan) {
      const { yon1, yon2 } = KOSELER[kose];
      dikIsaret(ctx, canvas, m, yon1, yon2, RENK.ikinci);
    }
    altYazi(ctx, canvas, bulunan.size === 0
      ? 'Gönyeyi köşelere yasla, dört köşeye de dokun'
      : bulunan.size < 4
        ? `${bulunan.size} köşeye baktın, hepsi dik. Devamı var`
        : 'Dört köşenin dördü de dik: hepsi 90 derece');
  }

  function dokun(p) {
    const sag = p.x >= m.x;
    const alt = p.y >= m.y;
    const kose = (sag ? 'sag' : 'sol') + '-' + (alt ? 'alt' : 'ust');
    if (bulunan.has(kose) && bulunan.size === 4) bulunan.clear();
    else {
      bulunan.add(kose);
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Gönyeyi dört köşeye de yasla' };
}

/**
 * kapi-cercevesi: kapi cercevesinin gercek dik koseleri iki tanedir.
 * Cocuk cerceve uzerinde istedigi yere dokunur; yalniz gercek koseye
 * denk gelirse dik isareti cikar, baska yere denk gelirse "bosluk
 * kaliyor" mesaji cikar - defter kosesini yaslama yontemi boyle isliyor.
 */
export function gorselKapiCercevesi(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const sol = { x: 0.3, y: 0.85 };
  const sag = { x: 0.7, y: 0.85 };
  const testEdilen = new Set();
  let sonYanlis = null;

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.3, y: 0.2 }, sol, RENK.cizgi);
    cizgi(ctx, canvas, { x: 0.7, y: 0.2 }, sag, RENK.cizgi);
    cizgi(ctx, canvas, sol, sag, RENK.cizgi);

    if (testEdilen.has('sol')) dikIsaret(ctx, canvas, sol, { x: 1, y: 0 }, { x: 0, y: -1 }, RENK.ikinci);
    if (testEdilen.has('sag')) dikIsaret(ctx, canvas, sag, { x: -1, y: 0 }, { x: 0, y: -1 }, RENK.ikinci);
    if (sonYanlis) nokta(ctx, canvas, sonYanlis, RENK.silik, 5);

    altYazi(ctx, canvas, sonYanlis
      ? 'Burada köşe yok, boşluk kalıyor. Çerçevenin köşesini dene'
      : testEdilen.size === 0
        ? 'Defterinin köşesini kapı çerçevesinin köşesine yasla'
        : testEdilen.size === 1
          ? 'Boşluk kalmadı, bu köşe dik. Öbür köşeyi de dene'
          : 'İki köşe de dik: ikisinde de boşluk kalmadı');
  }

  function dokun(p) {
    let bulundu = null;
    if (uzaklik(p, sol) < 0.1) bulundu = 'sol';
    else if (uzaklik(p, sag) < 0.1) bulundu = 'sag';

    if (bulundu) {
      testEdilen.add(bulundu);
      sonYanlis = null;
      if (ses) ses.efekt('tik');
    } else {
      sonYanlis = p;
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Defterinin köşesini çerçevenin köşesine yasla' };
}
