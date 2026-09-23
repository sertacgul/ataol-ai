/**
 * Anlatim gorselleri icin ortak cizim araclari.
 *
 * Her gorsel ayni sozlesmeyi saglar:
 *   create(canvas, { ses }) -> { ciz, dokun, yokEt, ipucu }
 *
 * ciz()   her karede cagrilabilir; durumu okur, tuvali bastan cizer.
 * dokun() cocuk tuvale dokundugunda cagrilir, durumu ilerletir.
 * ipucu   tuvalin altinda yazan "ne yapmali" cumlesi; TEK kelimeyle
 *         "Dokun" demek yerine ne olacagini soyler, cunku cocuk neyi
 *         neden yaptigini bilmeden dokunursa hicbir sey ogrenmez.
 *
 * Koordinatlar 0..1 arasinda normalize verilir ve tuval boyutuna
 * cevrilir; boylece her gorsel her ekran boyutunda ayni durur.
 */

export const RENK = {
  cizgi: '#2d3436',
  vurgu: '#6C5CE7',
  ikinci: '#00b894',
  ucuncu: '#e17055',
  sari: '#fdcb6e',
  silik: 'rgba(45, 52, 54, 0.22)',
  zemin: '#ffffff'
};

/** Tuval boyutundan bagimsiz olcek birimi. */
export function birim(canvas) {
  return Math.min(canvas.width, canvas.height) / 20;
}

export function nokta(ctx, canvas, p, renk = RENK.vurgu, r = 5) {
  const { x, y } = coz(canvas, p);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = renk;
  ctx.fill();
}

/**
 * Cizgi ciz. uzat:
 *   null  - dogru parcasi, iki ucu da durur
 *   'tek' - isin, b yonunde tuval disina tasar
 *   'iki' - dogru, iki yonde de tasar
 */
export function cizgi(ctx, canvas, a, b, renk = RENK.cizgi, uzat = null, kalinlik = 2.5) {
  const p = coz(canvas, a);
  const q = coz(canvas, b);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const n = Math.hypot(dx, dy) || 1;
  const k = (canvas.width + canvas.height) / n;

  ctx.beginPath();
  if (uzat === 'iki') {
    ctx.moveTo(p.x - dx * k, p.y - dy * k);
    ctx.lineTo(p.x + dx * k, p.y + dy * k);
  } else if (uzat === 'tek') {
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + dx * k, p.y + dy * k);
  } else {
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
  }
  ctx.strokeStyle = renk;
  ctx.lineWidth = kalinlik;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function cember(ctx, canvas, merkez, yaricap, renk = RENK.vurgu, kalinlik = 2.5) {
  const m = coz(canvas, merkez);
  ctx.beginPath();
  ctx.arc(m.x, m.y, yaricap * birim(canvas), 0, Math.PI * 2);
  ctx.strokeStyle = renk;
  ctx.lineWidth = kalinlik;
  ctx.stroke();
}

/** Aci yayi. Aci dereceleri matematik yonunde (saat tersi) verilir. */
export function yay(ctx, canvas, merkez, yaricap, bas, bit, renk = RENK.vurgu, doldur = true) {
  const m = coz(canvas, merkez);
  const r = yaricap * birim(canvas);
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.arc(m.x, m.y, r, -bit * RAD, -bas * RAD);
  ctx.closePath();
  if (doldur) {
    ctx.fillStyle = renk;
    ctx.fill();
  } else {
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/** Dik aci isareti: kucuk kare. Yay yerine bunu ciz, cocuk 90'i boyle taniyor. */
export function dikIsaret(ctx, canvas, kose, yon1, yon2, renk = RENK.ikinci) {
  const k = coz(canvas, kose);
  const b = birim(canvas) * 0.6;
  const n = (v) => {
    const u = Math.hypot(v.x, v.y) || 1;
    return { x: (v.x / u) * b, y: (v.y / u) * b };
  };
  const a = n(yon1);
  const c = n(yon2);
  ctx.beginPath();
  ctx.moveTo(k.x + a.x, k.y + a.y);
  ctx.lineTo(k.x + a.x + c.x, k.y + a.y + c.y);
  ctx.lineTo(k.x + c.x, k.y + c.y);
  ctx.strokeStyle = renk;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function etiket(ctx, canvas, p, metin, renk = RENK.cizgi, boyut = 14) {
  const { x, y } = coz(canvas, p);
  ctx.fillStyle = renk;
  ctx.font = `bold ${boyut}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(metin, x, y);
}

/** Ekranin ortasina, altta duran aciklama satiri. */
export function altYazi(ctx, canvas, metin, renk = RENK.cizgi) {
  ctx.fillStyle = renk;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(metin, canvas.width / 2, canvas.height - 10);
}

export function ok(ctx, canvas, a, b, renk = RENK.ucuncu) {
  const p = coz(canvas, a);
  const q = coz(canvas, b);
  cizgi(ctx, canvas, a, b, renk);
  const aci = Math.atan2(q.y - p.y, q.x - p.x);
  const u = birim(canvas) * 0.5;
  ctx.beginPath();
  ctx.moveTo(q.x, q.y);
  ctx.lineTo(q.x - u * Math.cos(aci - 0.4), q.y - u * Math.sin(aci - 0.4));
  ctx.lineTo(q.x - u * Math.cos(aci + 0.4), q.y - u * Math.sin(aci + 0.4));
  ctx.closePath();
  ctx.fillStyle = renk;
  ctx.fill();
}

export function temizle(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Dokunulan yeri 0..1 koordinatina cevirir. Tuvalin CSS boyutu ile
 * piksel tamponu farkli oldugu icin oran uzerinden hesaplanir.
 */
export function dokunmaNoktasi(canvas, olay) {
  const kutu = canvas.getBoundingClientRect();
  return {
    x: (olay.clientX - kutu.left) / kutu.width,
    y: (olay.clientY - kutu.top) / kutu.height
  };
}

export function uzaklik(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export const RAD = Math.PI / 180;

function coz(canvas, p) {
  return { x: p.x * canvas.width, y: p.y * canvas.height };
}
