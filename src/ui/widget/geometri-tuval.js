/**
 * Geometrik cizim tuvali.
 *
 * Modlar:
 *   serbest      - nokta, dogru parcasi, isin secip cizer; ne cizdigini soyler
 *   dikme        - verilen dogruya dikme cizdirir
 *   cokgen       - ardisik kesisen dogrularla cokgen kurdurur
 *   cember       - pergel gibi cember cizdirir
 *   cember-ucgen - iki cember ve merkezleri ile ucgen gosterir
 *
 * Cizilen sekiller bir dizide tutulur ve her ciz() cagrisinda bastan
 * cizilir. Boylece geri alma ve yeniden boyutlandirma bedava gelir.
 */

const RENK = {
  cizgi: '#2d3436', vurgu: '#6C5CE7', ikinci: '#00b894',
  ucuncu: '#e17055', silik: 'rgba(45, 52, 54, 0.25)'
};

export function geometriTuval(canvas, { mod = 'serbest', veri = {}, ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const sekiller = [];
  let baslangic = null;
  let arac = mod === 'cember' ? 'cember' : 'dogru-parcasi';

  const olcek = () => Math.min(canvas.width, canvas.height) / 26;

  function noktaAl(olay) {
    const kutu = canvas.getBoundingClientRect();
    return {
      x: ((olay.clientX - kutu.left) / kutu.width) * canvas.width,
      y: ((olay.clientY - kutu.top) / kutu.height) * canvas.height
    };
  }

  function noktaCiz(p, renk) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = renk;
    ctx.fill();
  }

  function cizgiCiz(a, b, renk, uzat) {
    ctx.beginPath();
    if (uzat) {
      // Isin ve dogru icin tuval disina tasiracak kadar uzat.
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const n = Math.hypot(dx, dy) || 1;
      const k = (canvas.width + canvas.height) / n;
      ctx.moveTo(uzat === 'iki' ? a.x - dx * k : a.x, uzat === 'iki' ? a.y - dy * k : a.y);
      ctx.lineTo(a.x + dx * k, a.y + dy * k);
    } else {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function cemberCiz(merkez, r, renk) {
    ctx.beginPath();
    ctx.arc(merkez.x, merkez.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    noktaCiz(merkez, renk);
  }

  function yaziCiz(metin, y) {
    ctx.fillStyle = RENK.cizgi;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metin, canvas.width / 2, y);
  }

  function cemberUcgenCiz() {
    const b = olcek();
    const { r1 = 5, r2 = 5, d = 5 } = veri;
    const m1 = { x: canvas.width / 2 - (d * b) / 2, y: canvas.height * 0.6 };
    const m2 = { x: canvas.width / 2 + (d * b) / 2, y: canvas.height * 0.6 };

    cemberCiz(m1, r1 * b, RENK.silik);
    cemberCiz(m2, r2 * b, RENK.silik);

    // Kesisim noktasi: iki cemberin ust kesisimi. Merkezler yatay
    // oldugu icin x, kosinus teoreminden; y, Pisagor'dan bulunur.
    const a = (d * d - r2 * r2 + r1 * r1) / (2 * d);
    const h2 = r1 * r1 - a * a;
    const h = h2 > 0 ? Math.sqrt(h2) : 0;
    const k = { x: m1.x + a * b, y: m1.y - h * b };

    cizgiCiz(m1, m2, RENK.vurgu);
    cizgiCiz(m1, k, RENK.ikinci);
    cizgiCiz(m2, k, RENK.ucuncu);
    noktaCiz(k, RENK.cizgi);

    yaziCiz(`Kenarlar: ${r1} cm, ${r2} cm, ${d} cm`, 24);
  }

  function cerceveCiz() {
    // Tuvalin sinirini gosteren cerceve: 'serbest' ve 'cokgen' gibi
    // moddda hicbir sekil cizilmeden once ekran bomboş kalmasin diye
    // her ciz() cagrisinda basta cizilir.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.strokeStyle = RENK.silik;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function ciz() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cerceveCiz();

    if (mod === 'cember-ucgen') {
      cemberUcgenCiz();
      return;
    }

    if (mod === 'dikme') {
      const y = canvas.height * 0.6;
      cizgiCiz({ x: 0, y }, { x: canvas.width, y }, RENK.cizgi);
      noktaCiz({ x: canvas.width / 2, y }, RENK.vurgu);
    }

    for (const s of sekiller) {
      if (s.tip === 'nokta') noktaCiz(s.a, RENK.vurgu);
      else if (s.tip === 'cember') cemberCiz(s.a, s.r, RENK.vurgu);
      else cizgiCiz(s.a, s.b, RENK.vurgu, s.tip === 'isin' ? 'tek' : s.tip === 'dogru' ? 'iki' : null);
    }

    if (mod === 'cokgen' && sekiller.length > 0) {
      yaziCiz(`${sekiller.length} kenar, ${sekiller.length} köşe`, canvas.height - 12);
    }
  }

  function basla(olay) {
    baslangic = noktaAl(olay);
  }

  function bitir(olay) {
    if (!baslangic) return;
    const son = noktaAl(olay);
    const uzunluk = Math.hypot(son.x - baslangic.x, son.y - baslangic.y);

    if (arac === 'cember') {
      if (uzunluk > 8) sekiller.push({ tip: 'cember', a: baslangic, r: uzunluk });
    } else if (uzunluk < 6) {
      sekiller.push({ tip: 'nokta', a: baslangic });
    } else {
      sekiller.push({ tip: arac, a: baslangic, b: son });
    }

    baslangic = null;
    if (ses) ses.efekt('tik');
    ciz();
  }

  // pointercancel'i isimsiz ok fonksiyonuyla eklersek yokEt onu
  // removeEventListener ile kaldiramaz; adlandirilmis fonksiyon sart.
  function iptal() {
    baslangic = null;
  }

  canvas.addEventListener('pointerdown', basla);
  canvas.addEventListener('pointerup', bitir);
  canvas.addEventListener('pointercancel', iptal);

  function aracSec(yeni) {
    arac = yeni;
  }

  function temizle() {
    sekiller.length = 0;
    ciz();
  }

  function dogrula() {
    if (mod === 'cokgen') {
      // sekiller nokta ve cemberi de tutar; kenar sayisi yalniz
      // dogru cizen sekillerden (nokta ve cember disindakilerden) sayilir.
      const kenarlar = sekiller.filter((s) => s.tip !== 'nokta' && s.tip !== 'cember');
      return kenarlar.length >= 3
        ? { tamam: true, mesaj: `${kenarlar.length} kenarlı bir çokgen kurdun.` }
        : { tamam: false, mesaj: 'Çokgen için en az 3 doğru gerekir.' };
    }
    if (mod === 'serbest') {
      const tipler = new Set(sekiller.map((s) => s.tip));
      return tipler.size >= 2
        ? { tamam: true, mesaj: 'Farklı şekiller çizdin, güzel.' }
        : { tamam: false, mesaj: 'En az iki farklı şekil çiz: nokta, doğru parçası, ışın.' };
    }
    if (mod === 'cember') {
      return sekiller.some((s) => s.tip === 'cember')
        ? { tamam: true, mesaj: 'Çember çizdin.' }
        : { tamam: false, mesaj: 'Merkeze bas ve dışarı sürükleyerek bir çember çiz.' };
    }
    if (mod === 'dikme') {
      return sekiller.length > 0
        ? { tamam: true, mesaj: 'Dikmeyi çizdin.' }
        : { tamam: false, mesaj: 'Doğrunun üzerindeki noktadan yukarı doğru bir çizgi çek.' };
    }
    return { tamam: true, mesaj: 'İncelemeni tamamladın.' };
  }

  function yokEt() {
    canvas.removeEventListener('pointerdown', basla);
    canvas.removeEventListener('pointerup', bitir);
    canvas.removeEventListener('pointercancel', iptal);
  }

  return { ciz, dogrula, yokEt, aracSec, temizle };
}
