/**
 * Ingilizce sozlugundeki, emoji ile anlatilamayan 13 kelimenin cizimleri
 * (1. tema: school life). temel.js ve cokgen.js ile ayni sozlesme:
 *   create(canvas, { ses }) -> { ciz, dokun?, ipucu? }
 *
 * Bunlar ders etkinligi degil, kelime kartinin resmi ve "dinle-sec"
 * sorusunun dort secenekten biri - bu yuzden coğu dokun ICERMEZ. Tek
 * gereksinim: her cizim kendi kelimesi icin, digerlerinden ayirt
 * edilebilir bir SILUET birakmali (dort secenekli soru boyle cozulur).
 *
 * Ortak bir insan figuru ve bir kutu (dikdortgen) yerel yardimcisi
 * birden cok cizimde kullanilir; cizim.js'e DOKUNULMADI, ikisi de
 * burada yerel fonksiyon.
 */

import { RENK, nokta, cizgi, cember, etiket, temizle } from './cizim.js';

/** Dikdortgen govde: sol-ust ve sag-alt kosesinden, dort kenar cizgisiyle. */
function kutu(ctx, canvas, solUst, sagAlt, renk = RENK.cizgi, kalinlik = 2.5) {
  cizgi(ctx, canvas, solUst, { x: sagAlt.x, y: solUst.y }, renk, null, kalinlik);
  cizgi(ctx, canvas, { x: sagAlt.x, y: solUst.y }, sagAlt, renk, null, kalinlik);
  cizgi(ctx, canvas, sagAlt, { x: solUst.x, y: sagAlt.y }, renk, null, kalinlik);
  cizgi(ctx, canvas, { x: solUst.x, y: sagAlt.y }, solUst, renk, null, kalinlik);
}

/**
 * Basit cubuk insan: ayak, ayagin bastigi orta nokta. kolYukselt true ise
 * sag kol dumduz yukari kalkar (el-kaldir icin), degilse iki kol da
 * yana sarkar.
 */
function figur(ctx, canvas, ayak, renk = RENK.cizgi, kolYukselt = false) {
  const kalca = { x: ayak.x, y: ayak.y - 0.08 };
  const omuz = { x: ayak.x, y: ayak.y - 0.20 };
  const bas = { x: ayak.x, y: ayak.y - 0.28 };
  cember(ctx, canvas, bas, 1.1, renk, 2.5);
  cizgi(ctx, canvas, omuz, kalca, renk, null, 2.5);
  cizgi(ctx, canvas, kalca, { x: ayak.x - 0.045, y: ayak.y }, renk, null, 2.5);
  cizgi(ctx, canvas, kalca, { x: ayak.x + 0.045, y: ayak.y }, renk, null, 2.5);
  if (kolYukselt) {
    cizgi(ctx, canvas, omuz, { x: ayak.x + 0.02, y: ayak.y - 0.34 }, renk, null, 2.5);
    cizgi(ctx, canvas, omuz, { x: ayak.x - 0.06, y: ayak.y - 0.06 }, renk, null, 2.5);
  } else {
    cizgi(ctx, canvas, omuz, { x: ayak.x - 0.06, y: ayak.y - 0.06 }, renk, null, 2.5);
    cizgi(ctx, canvas, omuz, { x: ayak.x + 0.06, y: ayak.y - 0.06 }, renk, null, 2.5);
  }
}

/** Direge tutunmus, sagdan dalgalanan bayrak bezi. */
function dalgaliBayrak(ctx, canvas, ucNokta, renk) {
  const x = ucNokta.x * canvas.width;
  const yUst = ucNokta.y * canvas.height;
  const g = 0.32 * canvas.width;
  const y = 0.16 * canvas.height;
  ctx.beginPath();
  ctx.moveTo(x, yUst);
  ctx.quadraticCurveTo(x + g * 0.6, yUst - y * 0.15, x + g, yUst + y * 0.1);
  ctx.lineTo(x + g, yUst + y);
  ctx.quadraticCurveTo(x + g * 0.6, yUst + y * 0.85, x, yUst + y * 0.7);
  ctx.closePath();
  ctx.fillStyle = renk;
  ctx.fill();
}

// --- Okuldaki kisiler ----------------------------------------------------

/** principal: kravatli tek yetiskin, yaninda "Mudur" tabelali bir masa. */
export function gorselOkulMuduru(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    const ayak = { x: 0.40, y: 0.78 };
    figur(ctx, canvas, ayak, RENK.cizgi, false);
    cizgi(ctx, canvas, { x: 0.40, y: 0.54 }, { x: 0.38, y: 0.60 }, RENK.ucuncu, null, 2.5);
    cizgi(ctx, canvas, { x: 0.40, y: 0.54 }, { x: 0.42, y: 0.60 }, RENK.ucuncu, null, 2.5);
    cizgi(ctx, canvas, { x: 0.38, y: 0.60 }, { x: 0.42, y: 0.60 }, RENK.ucuncu, null, 2.5);
    kutu(ctx, canvas, { x: 0.55, y: 0.70 }, { x: 0.90, y: 0.85 }, RENK.vurgu, 2.5);
    etiket(ctx, canvas, { x: 0.725, y: 0.775 }, 'Müdür', RENK.vurgu, 11);
  }

  return { ciz };
}

/** friend: ayni boyda iki cocuk, el ele. */
export function gorselArkadas(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    const sol = { x: 0.32, y: 0.80 };
    const sag = { x: 0.62, y: 0.80 };
    figur(ctx, canvas, sol, RENK.vurgu, false);
    figur(ctx, canvas, sag, RENK.ikinci, false);
    cizgi(ctx, canvas, { x: 0.38, y: 0.74 }, { x: 0.56, y: 0.74 }, RENK.sari, null, 2.5);
  }

  return { ciz };
}

/** caretaker: supurge ve kova tasiyan tek yetiskin. */
export function gorselOkulHizmetlisi(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    const ayak = { x: 0.42, y: 0.80 };
    figur(ctx, canvas, ayak, RENK.cizgi, false);
    const sapUst = { x: 0.52, y: 0.50 };
    const supurgeAlt = { x: 0.64, y: 0.85 };
    cizgi(ctx, canvas, sapUst, supurgeAlt, RENK.ucuncu, null, 2.5);
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      cizgi(ctx, canvas, supurgeAlt, { x: supurgeAlt.x + i * 0.025, y: supurgeAlt.y + 0.06 }, RENK.ucuncu, null, 1.5);
    }
    kutu(ctx, canvas, { x: 0.20, y: 0.74 }, { x: 0.32, y: 0.84 }, RENK.vurgu, 2.5);
  }

  return { ciz, ipucu: 'Süpürgesiyle okulu temizler' };
}

// --- Okuldaki yerler -------------------------------------------------------

/** classroom: on tarafta yazi tahtasi, arkada iki sira sinif sirasi. */
export function gorselSinif(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    kutu(ctx, canvas, { x: 0.30, y: 0.15 }, { x: 0.70, y: 0.30 }, RENK.cizgi, 2.5);
    cizgi(ctx, canvas, { x: 0.35, y: 0.22 }, { x: 0.65, y: 0.22 }, RENK.silik, null, 2);
    kutu(ctx, canvas, { x: 0.25, y: 0.55 }, { x: 0.40, y: 0.68 }, RENK.vurgu, 2.5);
    kutu(ctx, canvas, { x: 0.50, y: 0.55 }, { x: 0.65, y: 0.68 }, RENK.vurgu, 2.5);
    kutu(ctx, canvas, { x: 0.25, y: 0.75 }, { x: 0.40, y: 0.88 }, RENK.vurgu, 2.5);
    kutu(ctx, canvas, { x: 0.50, y: 0.75 }, { x: 0.65, y: 0.88 }, RENK.vurgu, 2.5);
  }

  return { ciz };
}

/** gym: pota (pano + cember) ve top. */
export function gorselSporSalonu(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    kutu(ctx, canvas, { x: 0.55, y: 0.15 }, { x: 0.85, y: 0.35 }, RENK.cizgi, 2.5);
    cember(ctx, canvas, { x: 0.70, y: 0.40 }, 1.3, RENK.ucuncu, 2.5);
    cizgi(ctx, canvas, { x: 0.65, y: 0.42 }, { x: 0.65, y: 0.47 }, RENK.ucuncu, null, 1.5);
    cizgi(ctx, canvas, { x: 0.70, y: 0.43 }, { x: 0.70, y: 0.49 }, RENK.ucuncu, null, 1.5);
    cizgi(ctx, canvas, { x: 0.75, y: 0.42 }, { x: 0.75, y: 0.47 }, RENK.ucuncu, null, 1.5);
    cember(ctx, canvas, { x: 0.28, y: 0.68 }, 2.2, RENK.vurgu, 2.5);
  }

  return { ciz };
}

/** corridor: iki duvarin uzaklasan noktaya birlestigi perspektif gecit. */
export function gorselKoridor(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    const uzak = { x: 0.5, y: 0.35 };
    cizgi(ctx, canvas, { x: 0.05, y: 0.90 }, uzak, RENK.cizgi, null, 2.5);
    cizgi(ctx, canvas, { x: 0.95, y: 0.90 }, uzak, RENK.cizgi, null, 2.5);
    kutu(ctx, canvas, { x: 0.15, y: 0.55 }, { x: 0.28, y: 0.85 }, RENK.vurgu, 2);
    kutu(ctx, canvas, { x: 0.72, y: 0.55 }, { x: 0.85, y: 0.85 }, RENK.vurgu, 2);
  }

  return { ciz, ipucu: 'Sınıfların arasındaki uzun geçit' };
}

// --- Okul esyalari ----------------------------------------------------------

/** eraser: iki renkli blok, yaninda yarim silinmis bir kalem izi. */
export function gorselSilgi(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.10, y: 0.85 }, { x: 0.42, y: 0.58 }, RENK.silik, null, 2);
    kutu(ctx, canvas, { x: 0.32, y: 0.40 }, { x: 0.70, y: 0.62 }, RENK.cizgi, 2.5);
    cizgi(ctx, canvas, { x: 0.32, y: 0.51 }, { x: 0.70, y: 0.51 }, RENK.cizgi, null, 2);
  }

  return { ciz };
}

// --- Kurallar ----------------------------------------------------------------

/** rule: direkte duran bir tabela, ustte onay, altta yasak isareti. */
export function gorselKural(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.5, y: 0.85 }, { x: 0.5, y: 0.55 }, RENK.cizgi, null, 3);
    kutu(ctx, canvas, { x: 0.25, y: 0.15 }, { x: 0.75, y: 0.55 }, RENK.vurgu, 2.5);
    cizgi(ctx, canvas, { x: 0.30, y: 0.30 }, { x: 0.36, y: 0.37 }, RENK.ikinci, null, 3);
    cizgi(ctx, canvas, { x: 0.36, y: 0.37 }, { x: 0.47, y: 0.20 }, RENK.ikinci, null, 3);
    cizgi(ctx, canvas, { x: 0.55, y: 0.20 }, { x: 0.68, y: 0.37 }, RENK.ucuncu, null, 3);
    cizgi(ctx, canvas, { x: 0.68, y: 0.20 }, { x: 0.55, y: 0.37 }, RENK.ucuncu, null, 3);
    cizgi(ctx, canvas, { x: 0.30, y: 0.45 }, { x: 0.70, y: 0.45 }, RENK.silik, null, 2);
  }

  return { ciz, ipucu: 'Yapılabilecek ve yapılamayacak şeyler' };
}

/** be on time: dogru saati gosteren saat, yaninda onay isareti. */
export function gorselZamaninda(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    const m = { x: 0.42, y: 0.52 };
    cember(ctx, canvas, m, 4.5, RENK.cizgi, 2.5);
    nokta(ctx, canvas, m, RENK.cizgi, 3);
    cizgi(ctx, canvas, m, { x: m.x - 0.08, y: m.y + 0.06 }, RENK.cizgi, null, 3);
    cizgi(ctx, canvas, m, { x: m.x, y: m.y - 0.16 }, RENK.vurgu, null, 2.5);
    cizgi(ctx, canvas, { x: 0.72, y: 0.30 }, { x: 0.76, y: 0.35 }, RENK.ikinci, null, 3);
    cizgi(ctx, canvas, { x: 0.76, y: 0.35 }, { x: 0.85, y: 0.20 }, RENK.ikinci, null, 3);
  }

  return { ciz, ipucu: 'Saatine bak, okula geç kalma' };
}

/** raise your hand: tek figur, kol dumduz havada. */
export function gorselElKaldir(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    figur(ctx, canvas, { x: 0.5, y: 0.80 }, RENK.cizgi, true);
  }

  return { ciz };
}

// --- Kulupler ----------------------------------------------------------------

/** club: yuvarlak bir masanin cevresinde, ustten gorunen uc kafa. */
export function gorselKulup(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    cember(ctx, canvas, { x: 0.5, y: 0.55 }, 3.5, RENK.silik, 2);
    cember(ctx, canvas, { x: 0.5, y: 0.20 }, 1.0, RENK.vurgu, 2.5);
    cember(ctx, canvas, { x: 0.25, y: 0.65 }, 1.0, RENK.ikinci, 2.5);
    cember(ctx, canvas, { x: 0.75, y: 0.65 }, 1.0, RENK.ucuncu, 2.5);
  }

  return { ciz, ipucu: 'Aynı ilgiyi paylaşan bir grup buluşur' };
}

// --- Milli gunler --------------------------------------------------------------

/** flag: direge tutunmus, dalgalanan tek bayrak. */
export function gorselBayrak(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.35, y: 0.85 }, { x: 0.35, y: 0.15 }, RENK.cizgi, null, 3);
    dalgaliBayrak(ctx, canvas, { x: 0.35, y: 0.15 }, RENK.ucuncu);
  }

  return { ciz };
}

/** ceremony: dort figur duz bir sirada, hareketsiz durur. */
export function gorselToren(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');

  function ciz() {
    temizle(ctx, canvas);
    cizgi(ctx, canvas, { x: 0.10, y: 0.85 }, { x: 0.90, y: 0.85 }, RENK.silik, null, 2);
    figur(ctx, canvas, { x: 0.20, y: 0.85 }, RENK.cizgi, false);
    figur(ctx, canvas, { x: 0.40, y: 0.85 }, RENK.cizgi, false);
    figur(ctx, canvas, { x: 0.60, y: 0.85 }, RENK.cizgi, false);
    figur(ctx, canvas, { x: 0.80, y: 0.85 }, RENK.cizgi, false);
  }

  return { ciz, ipucu: 'Tören sırasında herkes hareketsiz durur' };
}
