/**
 * temel-cizimler konusunun anlatim gorselleri (1-2. hafta).
 *
 * Her gorsel etkilesimli: cocuk dokunur, bir sey OLUR ve o sey adimin
 * anlattigi fikri gosterir. Dokunma sus degil - dokunmadan once ve
 * sonra ekranda farkli bir sey durur, fark da dersin konusudur.
 */

import { RENK, nokta, cizgi, etiket, altYazi, temizle, uzaklik } from './cizim.js';

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
