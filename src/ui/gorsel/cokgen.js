/**
 * cokgenler-cember konusunun anlatim gorselleri (5-8. hafta), 21 tanesi.
 *
 * Her gorsel etkilesimli: cocuk dokunur, bir sey OLUR ve o sey adimin
 * anlattigi fikri gosterir. temel.js ile ayni sozlesme:
 *   create(canvas, { ses }) -> { ciz, dokun, ipucu }
 *
 * 21 gorsel dort aileye ayrilir, aile icinde ortak bir yerel yardimci
 * fonksiyon parametrelenerek kullanilir:
 *   - duzlem cokgenleri (olusum, kenar, adlari, degil, gunluk, kenar-kose,
 *     ic-acilar, duzgun-cokgen, kare-dortgen)
 *   - fayans dosemesi (tek gorsel ama kendi ic aci hesabini tasir)
 *   - tek cember (cember, yaricap, cap, pergel) - AYNI cemberi uc farkli
 *     acidan gosterir
 *   - kesisen cember cifti (iki-cember, cember-ucgen, ucgen-kenarlari,
 *     ucgen-neden, esit-yaricap, kesisim-kosulu, ucgen-turleri) - ortak
 *     geometri yardimcilariyla (birimNokta, kesisimNoktalari) kurulur
 *
 * Ucgen turu ve kesisme kosulu HER ZAMAN motordan (cokgenler-cember.js)
 * gelir, burada yeniden hesaplanmaz: ekran ile quiz ayni cevabi vermeli.
 */

import {
  RENK, nokta, cizgi, cember, yay, etiket, altYazi, temizle, uzaklik, birim, RAD
} from './cizim.js';
import {
  ucgenTuru, UCGEN_TURU_ADI, kesisirMi, COKGENLER
} from '../../engines/uretici/cokgenler-cember.js';

// --- Ortak geometri yardimcilari ---------------------------------------
//
// Cizim.js'deki cember() ve nokta() piksel uzayinda calisir (birim ile
// olceklenir), boylece tuval oran ne olursa olsun gercek daire cikar.
// Asagidaki yardimcilar da ayni yaklasimi kullanir: normalize noktayi
// piksele cevirir, hesabi piksel uzayinda yapar, sonra normalize geri
// dondurur. Boylece cember tabanli her gorsel tuval boyutundan bagimsiz
// dogru gorunur.

/** Merkezden aciDerece yonunde, rBirim uzakliktaki normalize nokta. */
function birimNokta(canvas, merkez, rBirim, aciDerece) {
  const b = birim(canvas);
  const mx = merkez.x * canvas.width;
  const my = merkez.y * canvas.height;
  const rad = aciDerece * RAD;
  const px = mx + rBirim * b * Math.cos(rad);
  const py = my + rBirim * b * Math.sin(rad);
  return { x: px / canvas.width, y: py / canvas.height };
}

/** Merkezden p noktasina bakan aci, derece cinsinden. */
function aciDerece(canvas, merkez, p) {
  const mx = merkez.x * canvas.width;
  const my = merkez.y * canvas.height;
  const px = p.x * canvas.width;
  const py = p.y * canvas.height;
  return Math.atan2(py - my, px - mx) / RAD;
}

/** Merkezden d birim uzaklikta, yonDerece yonunde ikinci bir merkez. */
function ikinciMerkez(canvas, merkez1, d, yonDerece = 0) {
  return birimNokta(canvas, merkez1, d, yonDerece);
}

/** p noktasini merkez etrafinda cembere yapistirir (aciyi korur). */
function cemberNoktasi(canvas, merkez, r, p) {
  return birimNokta(canvas, merkez, r, aciDerece(canvas, merkez, p));
}

/** iki nokta arasi uzaklik, birim cinsinden (piksel duzeltmeli). */
function uzaklikBirim(canvas, a, b) {
  const dx = (b.x - a.x) * canvas.width;
  const dy = (b.y - a.y) * canvas.height;
  return Math.hypot(dx, dy) / birim(canvas);
}

/**
 * Iki cemberin kesisim noktalari (varsa), normalize koordinatta.
 * Kesismiyorsa null doner. Cagiran taraf once kesisirMi ile (motordan)
 * kontrol etmeli; burasi sadece koordinati hesaplar.
 */
function kesisimNoktalari(canvas, merkez1, r1, merkez2, r2) {
  const b = birim(canvas);
  const p1 = { x: merkez1.x * canvas.width, y: merkez1.y * canvas.height };
  const p2 = { x: merkez2.x * canvas.width, y: merkez2.y * canvas.height };
  const R1 = r1 * b;
  const R2 = r2 * b;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (R1 * R1 - R2 * R2 + d * d) / (2 * d);
  const h2 = R1 * R1 - a * a;
  if (h2 < 0) return null;
  const h = Math.sqrt(h2);
  const mx = p1.x + (a * dx) / d;
  const my = p1.y + (a * dy) / d;
  const ox = -dy / d;
  const oy = dx / d;
  return [
    { x: (mx + h * ox) / canvas.width, y: (my + h * oy) / canvas.height },
    { x: (mx - h * ox) / canvas.width, y: (my - h * oy) / canvas.height }
  ];
}

/** Iki nokta ortasi, kucuk bir yukari kaydirmayla (etiket icin). */
function orta(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 0.03 };
}

/** merkez etrafinda, r birim yaricapli, n kenarli DUZGUN cokgen noktalari. */
function cokgenNoktalari(canvas, merkez, r, n, baslangicDerece = -90) {
  const noktalar = [];
  for (let i = 0; i < n; i++) {
    noktalar.push(birimNokta(canvas, merkez, r, baslangicDerece + (360 / n) * i));
  }
  return noktalar;
}

/** Uc kenar uzunlugundan (ab, bc, ca), merkez etrafina ortalanmis ucgen. */
function ucgenNoktalari(canvas, merkez, ab, bc, ca) {
  const b = birim(canvas);
  const ABpx = ab * b;
  const BCpx = bc * b;
  const CApx = ca * b;
  const Ax = 0;
  const Ay = 0;
  const Bx = ABpx;
  const By = 0;
  const Cx = (CApx * CApx - BCpx * BCpx + ABpx * ABpx) / (2 * ABpx);
  const Cy = -Math.sqrt(Math.max(0, CApx * CApx - Cx * Cx));
  const cxo = (Ax + Bx + Cx) / 3;
  const cyo = (Ay + By + Cy) / 3;
  return [
    { x: Ax - cxo, y: Ay - cyo },
    { x: Bx - cxo, y: By - cyo },
    { x: Cx - cxo, y: Cy - cyo }
  ].map((p) => ({
    x: merkez.x + p.x / canvas.width,
    y: merkez.y + p.y / canvas.height
  }));
}

/** noktalar dizisinde p'ye en yakin ogenin indeksi, esik icindeyse. */
function enYakinIndex(noktalar, p, esik) {
  let index = -1;
  let enKisa = Infinity;
  noktalar.forEach((n, i) => {
    const d = uzaklik(n, p);
    if (d < enKisa) { enKisa = d; index = i; }
  });
  return enKisa <= esik ? index : -1;
}

/** Kose i'deki ic aciyi kucuk bir yay olarak boyar. */
function icAciYayi(ctx, canvas, noktalar, i, renk) {
  const n = noktalar.length;
  const v = noktalar[i];
  const p = noktalar[(i - 1 + n) % n];
  const q = noktalar[(i + 1) % n];
  let a1 = Math.atan2(p.y - v.y, p.x - v.x) / RAD;
  let a2 = Math.atan2(q.y - v.y, q.x - v.x) / RAD;
  if (a1 < 0) a1 += 360;
  if (a2 < 0) a2 += 360;
  let bas = Math.min(a1, a2);
  let bit = Math.max(a1, a2);
  if (bit - bas > 180) { const t = bas; bas = bit; bit = t + 360; }
  yay(ctx, canvas, v, 1.1, bas, bit, renk, true);
}

/** iki nokta arasindaki kenara sayi kadar esitlik cizgisi (tik) koyar. */
function kenarIsareti(ctx, canvas, a, b, sayi, renk = RENK.ikinci) {
  const pa = { x: a.x * canvas.width, y: a.y * canvas.height };
  const pb = { x: b.x * canvas.width, y: b.y * canvas.height };
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const mx = (pa.x + pb.x) / 2;
  const my = (pa.y + pb.y) / 2;
  const boy = 5;
  const aralik = 4;
  for (let i = 0; i < sayi; i++) {
    const kaydir = (i - (sayi - 1) / 2) * aralik;
    const cx = mx + ux * kaydir;
    const cy = my + uy * kaydir;
    ctx.beginPath();
    ctx.moveTo(cx - nx * boy, cy - ny * boy);
    ctx.lineTo(cx + nx * boy, cy + ny * boy);
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/** iki nokta arasina, ortasi disa bombeli EGRI kenar (cokgen-degil icin). */
function egriKenarCiz(ctx, canvas, a, b, renk) {
  const pa = { x: a.x * canvas.width, y: a.y * canvas.height };
  const pb = { x: b.x * canvas.width, y: b.y * canvas.height };
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bombe = birim(canvas) * 1.2;
  const cx = (pa.x + pb.x) / 2 + nx * bombe;
  const cy = (pa.y + pb.y) / 2 + ny * bombe;
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.quadraticCurveTo(cx, cy, pb.x, pb.y);
  ctx.strokeStyle = renk;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/** n kenarli duzgun cokgenin ic aci olcusu, derece. Sadece fayans kullanir. */
function icAciDerece(n) {
  return ((n - 2) * 180) / n;
}

// --- Seviye 1: cokgen nasil olusur -------------------------------------

/**
 * cokgen-olusum: cocuk sirayla nokta koyar, ardisik noktalar birlesir.
 * Ilk noktaya dokununca sekil kapanir - "sonuncusu ilkiyle kesisirse
 * kapali sekil olusur" cumlesi boyle goruluyor, once acik/dagilik durur.
 */
export function gorselCokgenOlusum(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];
  let kapali = false;
  const ESIK = 0.08;

  function ciz() {
    temizle(ctx, canvas);
    if (kapali) {
      for (let i = 0; i < noktalar.length; i++) {
        cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % noktalar.length], RENK.vurgu);
      }
    } else {
      for (let i = 0; i < noktalar.length - 1; i++) {
        cizgi(ctx, canvas, noktalar[i], noktalar[i + 1], RENK.cizgi);
      }
    }
    noktalar.forEach((n, i) => {
      nokta(ctx, canvas, n, i === 0 && !kapali ? RENK.ikinci : RENK.cizgi, 5);
    });
    if (kapali) {
      altYazi(ctx, canvas, `Kapandı: ${noktalar.length} kenarlı bir çokgen oldu`);
    } else if (noktalar.length < 3) {
      altYazi(ctx, canvas, 'Sırayla nokta koy, doğrular birbirini kessin');
    } else {
      altYazi(ctx, canvas, 'İlk noktaya dokunursan şekil kapanır');
    }
  }

  function dokun(p) {
    if (kapali) {
      noktalar.length = 0;
      kapali = false;
    } else if (noktalar.length >= 3 && uzaklik(p, noktalar[0]) < ESIK) {
      kapali = true;
    } else if (noktalar.length < 6) {
      noktalar.push(p);
    }
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Sırayla nokta koy, ilk noktaya dokununca şekli kapat' };
}

/**
 * cokgen-kenar: besgenin her kenari once ucu tuval disina tasan bir
 * DOGRU olarak gorunur. Dokununca o kenar kisalip yalniz iki kose
 * arasindaki parca kalir - kenarin dogrunun tamami olmadigini boyle
 * gosteriyoruz.
 */
export function gorselCokgenKenar(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.46 };
  const KENAR = 5;
  const kesilenler = new Set();

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    for (let i = 0; i < KENAR; i++) {
      const a = noktalar[i];
      const b = noktalar[(i + 1) % KENAR];
      if (kesilenler.has(i)) {
        cizgi(ctx, canvas, a, b, RENK.ikinci);
      } else {
        cizgi(ctx, canvas, a, b, RENK.silik, 'iki');
      }
    }
    noktalar.forEach((n) => nokta(ctx, canvas, n, RENK.cizgi, 4));
    altYazi(ctx, canvas, kesilenler.size < KENAR
      ? `Kenarlara dokun: ${kesilenler.size} / ${KENAR}`
      : `${KENAR} kenar buldun: doğrunun tamamı değil, sadece bu parça`);
  }

  function dokun(p) {
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    const ortalar = noktalar.map((n, i) => ({
      x: (n.x + noktalar[(i + 1) % KENAR].x) / 2,
      y: (n.y + noktalar[(i + 1) % KENAR].y) / 2
    }));
    const i = enYakinIndex(ortalar, p, 0.12);
    if (i >= 0) {
      kesilenler.add(i);
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Her kenara dokun, doğrunun kenar olan parçasını gör' };
}

/**
 * cokgen-adlari: dokundukca kenar sayisi 3'ten 8'e degisir, isim de
 * degisir. Isimler motorun COKGENLER listesinden gelir; burada ikinci
 * bir liste yazip quiz ile celismesin diye.
 */
export function gorselCokgenAdlari(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.45 };
  let idx = 0;

  function ciz() {
    temizle(ctx, canvas);
    const c = COKGENLER[idx];
    const noktalar = cokgenNoktalari(canvas, merkez, 4, c.kenar);
    for (let i = 0; i < c.kenar; i++) {
      cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % c.kenar], RENK.vurgu);
    }
    altYazi(ctx, canvas, `${c.kenar} kenar: ${c.ad}`);
  }

  function dokun(p) {
    idx = (idx + 1) % COKGENLER.length;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, kenar sayısı değiştikçe çokgenin adını gör' };
}

/**
 * cokgen-degil: uc durum arasinda gezinir - acik kalmis (kapanmamis),
 * kenarlardan biri egri, ve gercek kapali cokgen. Ayni besgen tabanindan
 * yola cikip hangisinin neden cokgen olmadigini goz onune serer.
 */
export function gorselCokgenDegil(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.45 };
  let durum = 0;

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = cokgenNoktalari(canvas, merkez, 4, 5);
    const n = noktalar.length;

    if (durum === 0) {
      for (let i = 0; i < n - 1; i++) {
        cizgi(ctx, canvas, noktalar[i], noktalar[i + 1], RENK.cizgi);
      }
      altYazi(ctx, canvas, 'Son doğru ilkiyle kesişmiyor: kapanmadı, çokgen değil');
    } else if (durum === 1) {
      egriKenarCiz(ctx, canvas, noktalar[0], noktalar[1], RENK.ucuncu);
      for (let i = 1; i < n; i++) {
        cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % n], RENK.cizgi);
      }
      altYazi(ctx, canvas, 'Bu kenar eğri: kenarlar doğru parçası olmalı, çokgen değil');
    } else {
      for (let i = 0; i < n; i++) {
        cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % n], RENK.ikinci);
      }
      altYazi(ctx, canvas, 'Şimdi kapalı ve kenarları doğru parçası: bu bir çokgen');
    }
  }

  function dokun(p) {
    durum = (durum + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, çokgen olmayan şekilleri sırayla gör' };
}

/**
 * cokgen-gunluk: dur levhasi (sekizgen), yon levhasi (dortgen), petek
 * (altigen) arasinda gezinir - gunluk hayattan cokgen ornekleri.
 */
export function gorselCokgenGunluk(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let durum = 0;

  function cokgenCiz(merkez, r, n, renk) {
    const noktalar = cokgenNoktalari(canvas, merkez, r, n);
    for (let i = 0; i < n; i++) {
      cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % n], renk);
    }
  }

  function ciz() {
    temizle(ctx, canvas);
    if (durum === 0) {
      cokgenCiz({ x: 0.5, y: 0.45 }, 4, 8, RENK.ucuncu);
      altYazi(ctx, canvas, 'Dur levhası sekizgendir: sekiz kenarı var');
    } else if (durum === 1) {
      cokgenCiz({ x: 0.5, y: 0.45 }, 4, 4, RENK.vurgu);
      altYazi(ctx, canvas, 'Yön levhaları çoğunlukla dörtgendir');
    } else {
      cokgenCiz({ x: 0.30, y: 0.45 }, 2.2, 6, RENK.ikinci);
      cokgenCiz({ x: 0.50, y: 0.45 }, 2.2, 6, RENK.ikinci);
      cokgenCiz({ x: 0.70, y: 0.45 }, 2.2, 6, RENK.ikinci);
      altYazi(ctx, canvas, 'Arı peteği altıgen: yan yana boşluksuz dizilir');
    }
  }

  function dokun(p) {
    durum = (durum + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, günlük hayattan çokgen örnekleri gör' };
}

// --- Seviye 2: kenar, kose ve aci ---------------------------------------

/**
 * kenar-kose: cocuk besgenin koselerine tek tek dokunup sayar. Sayac
 * kenar sayisina (5) ulasinca esitligi kendisi kesfeder.
 */
export function gorselKenarKose(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.46 };
  const KENAR = 5;
  const isaretli = new Set();

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    for (let i = 0; i < KENAR; i++) {
      cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % KENAR], RENK.cizgi);
    }
    noktalar.forEach((n, i) => {
      nokta(ctx, canvas, n, isaretli.has(i) ? RENK.ikinci : RENK.silik, isaretli.has(i) ? 7 : 5);
    });
    altYazi(ctx, canvas, isaretli.size < KENAR
      ? `Köşeleri say: ${isaretli.size} / ${KENAR}`
      : `${KENAR} köşe de var: kenar sayısına eşit çıktı`);
  }

  function dokun(p) {
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    const i = enYakinIndex(noktalar, p, 0.12);
    if (i >= 0) {
      isaretli.add(i);
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Köşelere dokun, sayıyı kenar sayısıyla karşılaştır' };
}

/**
 * ic-acilar: kenar-kose ile ayni sayma hareketi, ama bu kez kosede
 * beliren sey bir SAYAC noktasi degil, iki kenarin arasindaki aci
 * yayidir. Alti kosede alti aci - sayi yine kose sayisiyla esitleniyor.
 */
export function gorselIcAcilar(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.46 };
  const KENAR = 6;
  const acilanlar = new Set();

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    for (let i = 0; i < KENAR; i++) {
      cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % KENAR], RENK.cizgi);
    }
    acilanlar.forEach((i) => icAciYayi(ctx, canvas, noktalar, i, RENK.sari));
    altYazi(ctx, canvas, acilanlar.size < KENAR
      ? `Köşelere dokun, açıları gör: ${acilanlar.size} / ${KENAR}`
      : `${KENAR} iç açı da var: köşe sayısına eşit`);
  }

  function dokun(p) {
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    const i = enYakinIndex(noktalar, p, 0.12);
    if (i >= 0) {
      acilanlar.add(i);
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Köşelere dokun, oluşan iç açıları gör' };
}

/**
 * duzgun-cokgen: dokunca duzgun besgen ile bir kosesi disari cekilmis
 * (artik iki kenari farkli) besgen arasinda gecis yapar. Esitlik
 * cizgileri (tik) sadece hala esit olan kenarlarda kalir.
 */
export function gorselDuzgunCokgen(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.46 };
  const KENAR = 5;
  let duzgunMu = true;

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = cokgenNoktalari(canvas, merkez, 4, KENAR);
    if (!duzgunMu) {
      const v = noktalar[0];
      noktalar[0] = {
        x: merkez.x + (v.x - merkez.x) * 1.6,
        y: merkez.y + (v.y - merkez.y) * 1.6
      };
    }
    for (let i = 0; i < KENAR; i++) {
      cizgi(ctx, canvas, noktalar[i], noktalar[(i + 1) % KENAR], RENK.cizgi);
    }
    if (duzgunMu) {
      for (let i = 0; i < KENAR; i++) {
        kenarIsareti(ctx, canvas, noktalar[i], noktalar[(i + 1) % KENAR], 1);
      }
      altYazi(ctx, canvas, 'Bütün kenarlar ve açılar eşit: düzgün çokgen');
    } else {
      kenarIsareti(ctx, canvas, noktalar[1], noktalar[2], 1);
      kenarIsareti(ctx, canvas, noktalar[2], noktalar[3], 1);
      kenarIsareti(ctx, canvas, noktalar[3], noktalar[4], 1);
      altYazi(ctx, canvas, 'Bir köşe öne çıktı: iki kenar artık farklı, düzgün değil');
    }
  }

  function dokun(p) {
    duzgunMu = !duzgunMu;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, düzgün çokgeni bozulmuş olanla karşılaştır' };
}

/**
 * kare-dortgen: dokunca kare ile kenarlari esit olmayan (ama yine
 * dortgen olan) bir sekil arasinda gecis yapar. Her kenarin uzunlugu
 * yazar, boylece "dortgen ama kare degil" gozle goruluyor.
 */
export function gorselKareDortgen(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let kareMi = true;

  const KARE = [
    { x: 0.40, y: 0.35 }, { x: 0.60, y: 0.35 },
    { x: 0.60, y: 0.55 }, { x: 0.40, y: 0.55 }
  ];
  const DORTGEN = [
    { x: 0.50, y: 0.25 }, { x: 0.62, y: 0.45 },
    { x: 0.50, y: 0.58 }, { x: 0.38, y: 0.45 }
  ];

  function ciz() {
    temizle(ctx, canvas);
    const noktalar = kareMi ? KARE : DORTGEN;
    const renk = kareMi ? RENK.vurgu : RENK.ucuncu;
    for (let i = 0; i < 4; i++) {
      const a = noktalar[i];
      const b = noktalar[(i + 1) % 4];
      cizgi(ctx, canvas, a, b, renk);
      const cm = Math.round(uzaklik(a, b) * 20);
      etiket(ctx, canvas, {
        x: (a.x + b.x) / 2 + (b.y - a.y) * 0.12,
        y: (a.y + b.y) / 2 - (b.x - a.x) * 0.12
      }, `${cm} cm`, renk, 11);
    }
    altYazi(ctx, canvas, kareMi
      ? 'Kare: dört kenarı da eşit, hem dörtgen hem kare'
      : 'Bu da dörtgen ama kenarları eşit değil: kare değil');
  }

  function dokun(p) {
    kareMi = !kareMi;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, kare ile kare olmayan dörtgeni karşılaştır' };
}

/**
 * fayans: sirayla Kare, Altigen, Besgen fayanslarini ortak bir noktanin
 * etrafina dizer (her fayansin o noktadaki ic acisi kadar bir dilim).
 * Kare ve altigen tam bir tur tamamlayip bosluk birakmaz; besgende ise
 * ucuncu fayanstan sonra gercek bir bosluk kalir ve gorunur.
 */
export function gorselFayans(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez = { x: 0.5, y: 0.55 };
  const TURLER = [
    { kenar: 4, ad: 'Kare' },
    { kenar: 6, ad: 'Altıgen' },
    { kenar: 5, ad: 'Beşgen' }
  ];
  const RENKLER = [RENK.vurgu, RENK.ikinci, RENK.ucuncu, RENK.sari];
  let turIdx = 0;
  let adim = 0;
  let tamamlandi = false;

  function ciz() {
    temizle(ctx, canvas);
    const tur = TURLER[turIdx];
    const ic = icAciDerece(tur.kenar);
    const maksTam = Math.floor(360 / ic + 1e-9);
    const kalan = 360 - maksTam * ic;

    nokta(ctx, canvas, merkez, RENK.cizgi, 4);
    for (let k = 0; k < adim; k++) {
      yay(ctx, canvas, merkez, 3, k * ic, (k + 1) * ic, RENKLER[k % RENKLER.length], true);
    }
    if (tamamlandi && kalan > 1) {
      yay(ctx, canvas, merkez, 3, adim * ic, 360, RENK.silik, true);
      altYazi(ctx, canvas, `${tur.ad} döşenince boşluk kalıyor`);
    } else if (tamamlandi) {
      altYazi(ctx, canvas, `${tur.ad} döşenince boşluk kalmıyor`);
    } else {
      altYazi(ctx, canvas, `Dokun, ${tur.ad} fayansları birleştir`);
    }
  }

  function dokun(p) {
    const tur = TURLER[turIdx];
    const ic = icAciDerece(tur.kenar);
    const maksTam = Math.floor(360 / ic + 1e-9);

    if (!tamamlandi) {
      if (adim < maksTam) adim += 1;
      else tamamlandi = true;
    } else {
      turIdx = (turIdx + 1) % TURLER.length;
      adim = 0;
      tamamlandi = false;
    }
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, fayansları birleştir, boşluk kalıp kalmadığını gör' };
}

// --- Seviye 3: cember ve yaricap -----------------------------------------
//
// Uc gorsel (cember, yaricap, cap) AYNI merkez ve yaricapi kullanir:
// cocuk ayni cemberi uc farkli soruyla tekrar ziyaret ediyor.

const CEMBER_MERKEZ = { x: 0.5, y: 0.48 };
const CEMBER_R = 5;

/**
 * cember: dokundukca cember uzerine, merkeze hep ayni uzaklikta
 * noktalar eklenir. Dort noktadan sonra bu noktalarin aslinda cemberin
 * kendisi oldugu vurgulanir.
 */
export function gorselCember(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    cember(ctx, canvas, CEMBER_MERKEZ, CEMBER_R, RENK.vurgu);
    nokta(ctx, canvas, CEMBER_MERKEZ, RENK.cizgi, 4);
    etiket(ctx, canvas, { x: CEMBER_MERKEZ.x, y: CEMBER_MERKEZ.y - 0.06 }, 'M', RENK.cizgi);
    noktalar.forEach((n) => nokta(ctx, canvas, n, RENK.ikinci, 5));
    altYazi(ctx, canvas, noktalar.length < 4
      ? 'Merkeze aynı uzaklıkta noktalar koy'
      : 'Bütün bu noktalar merkeze eşit uzaklıkta: çember budur');
  }

  function dokun(p) {
    if (noktalar.length >= 10) {
      noktalar.length = 0;
    } else {
      noktalar.push(cemberNoktasi(canvas, CEMBER_MERKEZ, CEMBER_R, p));
      if (ses) ses.efekt('tik');
    }
    ciz();
  }

  return { ciz, dokun, ipucu: 'Çember üzerine noktalar koy, merkeze uzaklıklarını karşılaştır' };
}

/**
 * yaricap: dokunulan yer cembere yapisir (K noktasi), merkezden [MK]
 * cizilir ve etiketlenir. Son 3 secim ayni anda tutulur, boylece
 * hangi K secilirse secilsin uzunlugun ayni kaldigi yan yana gorunur.
 */
export function gorselYaricap(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const noktalar = [];

  function ciz() {
    temizle(ctx, canvas);
    cember(ctx, canvas, CEMBER_MERKEZ, CEMBER_R, RENK.silik);
    nokta(ctx, canvas, CEMBER_MERKEZ, RENK.cizgi, 4);
    etiket(ctx, canvas, { x: CEMBER_MERKEZ.x, y: CEMBER_MERKEZ.y - 0.06 }, 'M', RENK.cizgi);
    noktalar.forEach((k) => {
      cizgi(ctx, canvas, CEMBER_MERKEZ, k, RENK.ucuncu);
      nokta(ctx, canvas, k, RENK.ucuncu, 5);
      etiket(ctx, canvas, orta(CEMBER_MERKEZ, k), '[MK]', RENK.ucuncu, 12);
    });
    altYazi(ctx, canvas, noktalar.length < 2
      ? 'Çember üzerinde bir nokta seç, yarıçapı gör'
      : 'Hangi noktayı seçersen seç [MK] hep aynı uzunlukta');
  }

  function dokun(p) {
    noktalar.push(cemberNoktasi(canvas, CEMBER_MERKEZ, CEMBER_R, p));
    if (noktalar.length > 3) noktalar.shift();
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Çember üzerinde farklı noktalar seç, yarıçapları karşılaştır' };
}

/**
 * cap: dokunulan yon merkezden gecen bir cap cizer (iki ucu da
 * cember uzerinde, birbirinin tam karsisinda). Yon her dokunusta
 * degisir ama cap her zaman merkezden gecer - degismeyen bu.
 */
export function gorselCap(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let aci = null;

  function ciz() {
    temizle(ctx, canvas);
    cember(ctx, canvas, CEMBER_MERKEZ, CEMBER_R, RENK.silik);
    nokta(ctx, canvas, CEMBER_MERKEZ, RENK.cizgi, 4);
    etiket(ctx, canvas, { x: CEMBER_MERKEZ.x, y: CEMBER_MERKEZ.y - 0.06 }, 'M', RENK.cizgi);
    if (aci !== null) {
      const uc1 = birimNokta(canvas, CEMBER_MERKEZ, CEMBER_R, aci);
      const uc2 = birimNokta(canvas, CEMBER_MERKEZ, CEMBER_R, aci + 180);
      cizgi(ctx, canvas, uc1, uc2, RENK.ucuncu);
      nokta(ctx, canvas, uc1, RENK.ucuncu, 5);
      nokta(ctx, canvas, uc2, RENK.ucuncu, 5);
    }
    altYazi(ctx, canvas, aci === null
      ? 'Çember üzerinde bir nokta seç, çapı gör'
      : 'Çap merkezden geçer: uç uca eklenmiş iki yarıçaptır');
  }

  function dokun(p) {
    aci = aciDerece(canvas, CEMBER_MERKEZ, p);
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Çember üzerinde nokta seç, merkezden geçen çapı gör' };
}

/**
 * pergel: uc adimli pergel benzetmesi. Once merkez (sivri uc) secilir,
 * sonra acikligi belirleyen nokta (kalem ucu), sonra tur tamamlanir ve
 * gercek cember cikar. Aci sabit kaldigi surece cikan sey hep cemberdir.
 */
export function gorselPergel(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  let merkez = null;
  let kalem = null;
  let tamamMi = false;

  function ciz() {
    temizle(ctx, canvas);
    if (!merkez) {
      altYazi(ctx, canvas, 'Pergelin sivri ucunu bastır: merkezi seç');
      return;
    }
    nokta(ctx, canvas, merkez, RENK.cizgi, 5);
    etiket(ctx, canvas, { x: merkez.x, y: merkez.y - 0.06 }, 'M', RENK.cizgi);
    if (!kalem) {
      altYazi(ctx, canvas, 'Şimdi açıklığı belirleyecek noktayı seç');
      return;
    }
    const rBirim = uzaklikBirim(canvas, merkez, kalem);
    cizgi(ctx, canvas, merkez, kalem, RENK.ucuncu);
    nokta(ctx, canvas, kalem, RENK.ucuncu, 5);
    if (!tamamMi) {
      const bas = aciDerece(canvas, merkez, kalem);
      yay(ctx, canvas, merkez, rBirim, bas, bas + 300, RENK.vurgu, false);
      altYazi(ctx, canvas, 'Kalemli ucu bir tur döndür');
    } else {
      cember(ctx, canvas, merkez, rBirim, RENK.vurgu);
      altYazi(ctx, canvas, 'Pergel açıklığı sabit kaldı: tam bir çember çıktı');
    }
  }

  function dokun(p) {
    if (!merkez) {
      merkez = p;
    } else if (!kalem) {
      kalem = p;
    } else if (!tamamMi) {
      tamamMi = true;
    } else {
      merkez = null;
      kalem = null;
      tamamMi = false;
    }
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Önce merkezi seç, sonra açıklığı ayarla, sonra tamamla' };
}

// --- Kesisen cember cifti ailesi ------------------------------------------
//
// Ortak baslangic: merkez1 sabit, ikinci merkez d birim uzakta kurulur.
// kesisirMi HER ZAMAN motordan cagrilir; burasi kendi kesisme kuralini
// yeniden yazmaz.

const CIFT_MERKEZ1 = { x: 0.35, y: 0.48 };

/**
 * iki-cember: iki sabit cemberi asama asama birlestirir - once yalniz
 * cemberler, sonra merkezler birlesir, sonra kesisim noktasi eklenip
 * ucgen tamamlanir. "Bunu birlikte kullanacaksin" cumlesinin onizlemesi.
 */
export function gorselIkiCember(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const r1 = 5;
  const r2 = 5;
  const d = 6;
  const kesisiyor = kesisirMi(r1, r2, d);
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const merkez2 = ikinciMerkez(canvas, CIFT_MERKEZ1, d);
    cember(ctx, canvas, CIFT_MERKEZ1, r1, RENK.vurgu);
    cember(ctx, canvas, merkez2, r2, RENK.ikinci);
    if (asama === 0) {
      altYazi(ctx, canvas, 'İki çemberi üst üste bindirdik: iki noktada kesişiyorlar');
      return;
    }
    nokta(ctx, canvas, CIFT_MERKEZ1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);
    etiket(ctx, canvas, { x: CIFT_MERKEZ1.x, y: CIFT_MERKEZ1.y - 0.06 }, 'M1', RENK.cizgi);
    etiket(ctx, canvas, { x: merkez2.x, y: merkez2.y - 0.06 }, 'M2', RENK.cizgi);
    if (asama === 1) {
      cizgi(ctx, canvas, CIFT_MERKEZ1, merkez2, RENK.ucuncu);
      altYazi(ctx, canvas, 'Merkezleri birleştirdik');
      return;
    }
    if (!kesisiyor) {
      altYazi(ctx, canvas, 'Bu çemberler kesişmiyor');
      return;
    }
    const k = kesisimNoktalari(canvas, CIFT_MERKEZ1, r1, merkez2, r2)[0];
    cizgi(ctx, canvas, CIFT_MERKEZ1, merkez2, RENK.silik);
    cizgi(ctx, canvas, CIFT_MERKEZ1, k, RENK.ucuncu);
    cizgi(ctx, canvas, merkez2, k, RENK.ucuncu);
    nokta(ctx, canvas, k, RENK.ucuncu, 5);
    etiket(ctx, canvas, { x: k.x, y: k.y - 0.06 }, 'K', RENK.ucuncu);
    altYazi(ctx, canvas, 'Kesişim noktasını da birleştirince üçgen ortaya çıktı');
  }

  function dokun(p) {
    asama = (asama + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, çemberlerden üçgenin nasıl çıktığını gör' };
}

/**
 * cember-ucgen: "iki tabak" benzetmesi. Once tabaklar (cemberler),
 * sonra cakistiklari IKI nokta birden, sonra merkezler ve tek bir
 * kesisim noktasiyla kurulan ucgen. iki-cember'den farki: burada once
 * cakisma bolgesi ve HER IKI kesisim noktasi vurgulanir.
 */
export function gorselCemberUcgen(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const r1 = 5;
  const r2 = 5;
  const d = 6;
  const kesisiyor = kesisirMi(r1, r2, d);
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const merkez2 = ikinciMerkez(canvas, CIFT_MERKEZ1, d);
    if (asama === 0) {
      cember(ctx, canvas, CIFT_MERKEZ1, r1, RENK.vurgu);
      cember(ctx, canvas, merkez2, r2, RENK.ikinci);
      altYazi(ctx, canvas, 'İki tabağı üst üste bindirince kenarları iki yerde çakışıyor');
      return;
    }
    cember(ctx, canvas, CIFT_MERKEZ1, r1, RENK.silik);
    cember(ctx, canvas, merkez2, r2, RENK.silik);
    if (!kesisiyor) {
      altYazi(ctx, canvas, 'Bu tabaklar çakışmıyor');
      return;
    }
    const [k1, k2] = kesisimNoktalari(canvas, CIFT_MERKEZ1, r1, merkez2, r2);
    if (asama === 1) {
      nokta(ctx, canvas, k1, RENK.ucuncu, 5);
      nokta(ctx, canvas, k2, RENK.ucuncu, 5);
      etiket(ctx, canvas, { x: k1.x, y: k1.y - 0.06 }, 'K1', RENK.ucuncu);
      etiket(ctx, canvas, { x: k2.x, y: k2.y + 0.07 }, 'K2', RENK.ucuncu);
      altYazi(ctx, canvas, 'İşte iki kesişim noktası');
      return;
    }
    nokta(ctx, canvas, CIFT_MERKEZ1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);
    cizgi(ctx, canvas, CIFT_MERKEZ1, merkez2, RENK.ucuncu);
    cizgi(ctx, canvas, CIFT_MERKEZ1, k1, RENK.ucuncu);
    cizgi(ctx, canvas, merkez2, k1, RENK.ucuncu);
    nokta(ctx, canvas, k1, RENK.ucuncu, 5);
    altYazi(ctx, canvas, 'Merkezler ve bir kesişim noktasıyla üçgen kuruluyor');
  }

  function dokun(p) {
    asama = (asama + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, tabakların çakıştığı yerden üçgenin çıkışını izle' };
}

/**
 * ucgen-kenarlari: kurulu ucgenin uc kenarina sirayla etiket eklenir -
 * yaricap, yaricap, merkezler arasi. Sayi yazmiyoruz (o quizin isi),
 * sadece HANGI uzunluk oldugunu.
 */
export function gorselUcgenKenarlari(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const r1 = 4;
  const r2 = 6;
  const d = 7;
  const kesisiyor = kesisirMi(r1, r2, d);
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const merkez2 = ikinciMerkez(canvas, CIFT_MERKEZ1, d);
    cember(ctx, canvas, CIFT_MERKEZ1, r1, RENK.silik);
    cember(ctx, canvas, merkez2, r2, RENK.silik);
    if (!kesisiyor) {
      altYazi(ctx, canvas, 'Bu çemberler kesişmiyor');
      return;
    }
    const k = kesisimNoktalari(canvas, CIFT_MERKEZ1, r1, merkez2, r2)[0];
    nokta(ctx, canvas, CIFT_MERKEZ1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);
    nokta(ctx, canvas, k, RENK.cizgi, 4);
    cizgi(ctx, canvas, CIFT_MERKEZ1, k, RENK.vurgu);
    cizgi(ctx, canvas, merkez2, k, RENK.ikinci);
    cizgi(ctx, canvas, CIFT_MERKEZ1, merkez2, RENK.ucuncu);
    if (asama >= 1) etiket(ctx, canvas, orta(CIFT_MERKEZ1, k), 'yarıçap', RENK.vurgu, 11);
    if (asama >= 2) etiket(ctx, canvas, orta(merkez2, k), 'yarıçap', RENK.ikinci, 11);
    if (asama >= 3) etiket(ctx, canvas, orta(CIFT_MERKEZ1, merkez2), 'merkezler arası', RENK.ucuncu, 11);
    altYazi(ctx, canvas, asama < 3
      ? 'Dokun, kenarların hangi uzunluk olduğunu gör'
      : 'Üçgenin üç kenarı: iki yarıçap ve merkezler arası uzaklık');
  }

  function dokun(p) {
    asama = asama >= 3 ? 0 : asama + 1;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, üçgenin kenarlarını sırayla etiketle' };
}

/**
 * ucgen-neden: kesisim noktasinin NEDEN o iki uzunlukta oldugunu
 * gosterir. Once birinci cemberin (K onun uzerinde), sonra ikincinin
 * vurgulanmasiyla, her kenarin bir cembere ait yaricap oldugu netlesir.
 */
export function gorselUcgenNeden(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const r1 = 4;
  const r2 = 6;
  const d = 7;
  const kesisiyor = kesisirMi(r1, r2, d);
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const merkez2 = ikinciMerkez(canvas, CIFT_MERKEZ1, d);
    if (!kesisiyor) {
      altYazi(ctx, canvas, 'Bu çemberler kesişmiyor');
      return;
    }
    const k = kesisimNoktalari(canvas, CIFT_MERKEZ1, r1, merkez2, r2)[0];

    cember(ctx, canvas, CIFT_MERKEZ1, r1, asama === 1 ? RENK.vurgu : RENK.silik);
    cember(ctx, canvas, merkez2, r2, asama === 2 ? RENK.ikinci : RENK.silik);
    nokta(ctx, canvas, CIFT_MERKEZ1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);
    nokta(ctx, canvas, k, RENK.cizgi, 5);
    etiket(ctx, canvas, { x: k.x, y: k.y - 0.06 }, 'K', RENK.cizgi);

    if (asama === 0) {
      altYazi(ctx, canvas, 'K noktası her iki çemberin de üzerinde');
    } else if (asama === 1) {
      cizgi(ctx, canvas, CIFT_MERKEZ1, k, RENK.vurgu);
      altYazi(ctx, canvas, 'K, birinci çemberin üzerinde: M1K birinci yarıçap kadar');
    } else {
      cizgi(ctx, canvas, CIFT_MERKEZ1, k, RENK.silik);
      cizgi(ctx, canvas, merkez2, k, RENK.ikinci);
      altYazi(ctx, canvas, 'K, ikinci çemberin de üzerinde: M2K ikinci yarıçap kadar');
    }
  }

  function dokun(p) {
    asama = (asama + 1) % 3;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, kenarların neden bu uzunlukta olduğunu gör' };
}

/**
 * esit-yaricap: cocuk yariçaplari, sonra merkezler arasi uzakligi
 * esitler. Ucgen turu HER ZAMAN motordaki ucgenTuru ile hesaplanir,
 * boylece ekranin soyledigi ile quizin soyledigi hic ayrilmaz.
 */
export function gorselEsitYaricap(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const DURUMLAR = [
    { r1: 4, r2: 7, d: 8 },
    { r1: 4, r2: 4, d: 6 },
    { r1: 4, r2: 4, d: 4 }
  ];
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const { r1, r2, d } = DURUMLAR[asama];
    if (!kesisirMi(r1, r2, d)) {
      altYazi(ctx, canvas, 'Bu çemberler kesişmiyor');
      return;
    }
    const merkez2 = ikinciMerkez(canvas, CIFT_MERKEZ1, d);
    cember(ctx, canvas, CIFT_MERKEZ1, r1, RENK.vurgu);
    cember(ctx, canvas, merkez2, r2, RENK.ikinci);
    const k = kesisimNoktalari(canvas, CIFT_MERKEZ1, r1, merkez2, r2)[0];
    nokta(ctx, canvas, CIFT_MERKEZ1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);
    cizgi(ctx, canvas, CIFT_MERKEZ1, merkez2, RENK.ucuncu);
    cizgi(ctx, canvas, CIFT_MERKEZ1, k, RENK.ucuncu);
    cizgi(ctx, canvas, merkez2, k, RENK.ucuncu);
    nokta(ctx, canvas, k, RENK.ucuncu, 5);

    const tur = ucgenTuru(r1, r2, d);
    altYazi(ctx, canvas, `Şu anki üçgen: ${UCGEN_TURU_ADI[tur]}`);
  }

  function dokun(p) {
    asama = (asama + 1) % DURUMLAR.length;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, yarıçapları ve merkez uzaklığını eşitleyerek üçgeni değiştir' };
}

/**
 * kesisim-kosulu: merkezler arasi uzaklik uc durumda gezinir - cok
 * uzak (deymiyorlar), uygun (iki noktada kesisiyorlar), cok yakin
 * (kucuk cember buyugun icinde). Her durumda kesisirMi motordan sorulur.
 */
export function gorselKesisimKosulu(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const merkez1 = { x: 0.30, y: 0.48 };
  const r1 = 5;
  const r2 = 3;
  const DURUMLAR = [12, 5, 1];
  let asama = 0;

  function ciz() {
    temizle(ctx, canvas);
    const d = DURUMLAR[asama];
    const merkez2 = ikinciMerkez(canvas, merkez1, d);
    cember(ctx, canvas, merkez1, r1, RENK.vurgu);
    cember(ctx, canvas, merkez2, r2, RENK.ikinci);
    nokta(ctx, canvas, merkez1, RENK.cizgi, 4);
    nokta(ctx, canvas, merkez2, RENK.cizgi, 4);

    if (kesisirMi(r1, r2, d)) {
      const noktalar = kesisimNoktalari(canvas, merkez1, r1, merkez2, r2);
      if (noktalar) noktalar.forEach((k) => nokta(ctx, canvas, k, RENK.ucuncu, 5));
      altYazi(ctx, canvas, 'Merkezler arası uzaklık uygun: iki noktada kesişiyorlar');
    } else if (d >= r1 + r2) {
      altYazi(ctx, canvas, 'Merkezler çok uzak: çemberler değmiyor');
    } else {
      altYazi(ctx, canvas, 'Küçük çember büyüğün içinde kaldı: yine kesişmiyor');
    }
  }

  function dokun(p) {
    asama = (asama + 1) % DURUMLAR.length;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, merkezler arası uzaklığı değiştir, kesişme durumunu gör' };
}

/**
 * ucgen-turleri: seviye 3 (a6) ve seviye 4 (a5) TAM AYNI gorseli
 * kullanir, ders verisinde ikisinin de gorsel adi 'ucgen-turleri'.
 * Dokunca uc hazir ucgen arasinda gezinir; tur HER ZAMAN motordaki
 * ucgenTuru ile hesaplanir, esit kenarlar tik isaretiyle vurgulanir.
 */
export function gorselUcgenTurleri(canvas, { ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const OZELLIKLER = [
    { ab: 5, bc: 5, ca: 5 },
    { ab: 5, bc: 5, ca: 7 },
    { ab: 4, bc: 6, ca: 7 }
  ];
  let idx = 0;

  function ciz() {
    temizle(ctx, canvas);
    const { ab, bc, ca } = OZELLIKLER[idx];
    const [A, B, C] = ucgenNoktalari(canvas, { x: 0.5, y: 0.48 }, ab, bc, ca);
    cizgi(ctx, canvas, A, B, RENK.cizgi);
    cizgi(ctx, canvas, B, C, RENK.cizgi);
    cizgi(ctx, canvas, C, A, RENK.cizgi);

    if (ab === bc) { kenarIsareti(ctx, canvas, A, B, 1); kenarIsareti(ctx, canvas, B, C, 1); }
    if (bc === ca) { kenarIsareti(ctx, canvas, B, C, 1); kenarIsareti(ctx, canvas, C, A, 1); }
    if (ca === ab) { kenarIsareti(ctx, canvas, C, A, 1); kenarIsareti(ctx, canvas, A, B, 1); }

    const tur = ucgenTuru(ab, bc, ca);
    altYazi(ctx, canvas, UCGEN_TURU_ADI[tur]);
  }

  function dokun(p) {
    idx = (idx + 1) % OZELLIKLER.length;
    if (ses) ses.efekt('tik');
    ciz();
  }

  return { ciz, dokun, ipucu: 'Dokun, farklı üçgen türlerini kenarlarıyla karşılaştır' };
}
