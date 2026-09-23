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

import { dikMi } from '../../engines/widgets/aci.js';
import { ucgenTuru, UCGEN_TURU_ADI, kesisirMi } from '../../engines/uretici/cokgenler-cember.js';

const RENK = {
  cizgi: '#2d3436', vurgu: '#6C5CE7', ikinci: '#00b894',
  ucuncu: '#e17055', silik: 'rgba(45, 52, 54, 0.25)'
};

/**
 * Cokgenin kenarini olusturan sekillerin sayisi. Nokta ve cember kenar
 * sayilmaz.
 *
 * Tuvale yazilan etiket ile dogrula() AYNI bu fonksiyondan okur. Daha
 * once ikisi ayri sayiyordu: tek kaza dokunusu tuvale "4 kenar, 4 kose"
 * yazdirip altindaki mesaja "3 kenarli" dedirtiyordu - hem de gorevin
 * tam olarak "kenar ile kose sayisinin her zaman esit oldugunu kendin
 * gor" dedigi haftada.
 */
function kenarSayisi(sekiller) {
  return sekiller.filter((s) => s.tip !== 'nokta' && s.tip !== 'cember').length;
}

export function geometriTuval(canvas, { mod = 'serbest', veri = {}, ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const sekiller = [];
  let baslangic = null;
  let arac = mod === 'cember' ? 'cember' : 'dogru-parcasi';

  // cember-ucgen modunun degistirilebilir olculeri ve cocugun simdiye
  // kadar gordugu ucgen turleri. Gorev "yariçaplari ve uzakligi degistir"
  // diyor; gorulenler kumesi bunu gercekten yaptiginin kanitidir.
  const ru = { r1: Number(veri.r1) || 5, r2: Number(veri.r2) || 5, d: Number(veri.d) || 5 };
  const gorulenTurler = new Set();
  let tutulan = null;

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

  // cember-ucgen: merkezlerin ve cember kenarlarinin tuvaldeki yeri.
  // Hem cizim hem dokunma ayni hesaptan okusun diye ayri fonksiyon.
  function cemberUcgenYerlesim() {
    const b = olcek();
    const y = canvas.height * 0.6;
    return {
      b,
      m1: { x: canvas.width / 2 - (ru.d * b) / 2, y },
      m2: { x: canvas.width / 2 + (ru.d * b) / 2, y }
    };
  }

  function cemberUcgenCiz() {
    const { b, m1, m2 } = cemberUcgenYerlesim();
    const { r1, r2, d } = ru;

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

    const tur = ucgenTuru(r1, r2, d);
    gorulenTurler.add(tur);

    yaziCiz(`Kenarlar: ${r1} cm, ${r2} cm, ${d} cm`, 24);
    yaziCiz(UCGEN_TURU_ADI[tur], 44);
    yaziCiz('Merkezleri veya çember kenarlarını sürükle', canvas.height - 12);
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
      const n = kenarSayisi(sekiller);
      yaziCiz(`${n} kenar, ${n} köşe`, canvas.height - 12);
    }
  }

  /**
   * cember-ucgen modunda dokunulan tutamagi bulur: merkezi surukleyince
   * merkezler arasi uzaklik, cember kenarini surukleyince o cemberin
   * yaricapi degisir. Pergel sezgisinin aynisi.
   */
  function tutamakBul(p) {
    const { b, m1, m2 } = cemberUcgenYerlesim();
    const yakin = b * 1.2;
    const u1 = Math.hypot(p.x - m1.x, p.y - m1.y);
    const u2 = Math.hypot(p.x - m2.x, p.y - m2.y);

    if (u1 < yakin) return 'm1';
    if (u2 < yakin) return 'm2';
    if (Math.abs(u1 - ru.r1 * b) < yakin) return 'r1';
    if (Math.abs(u2 - ru.r2 * b) < yakin) return 'r2';
    return null;
  }

  // Olculer 2-10 cm arasinda tutulur ve cemberlerin kesismesi sart
  // kosulur: kesismeyen iki cemberde ucgen zaten kurulamaz ve cocuk
  // bos ekrana bakar.
  function olcuAyarla(hangi, cm) {
    const kirpik = Math.min(10, Math.max(2, Math.round(cm)));
    const deneme = { ...ru, [hangi]: kirpik };
    if (!kesisirMi(deneme.r1, deneme.r2, deneme.d)) return;
    ru[hangi] = kirpik;
  }

  function surukle(olay) {
    if (mod !== 'cember-ucgen' || !tutulan) return;
    const p = noktaAl(olay);
    const { b, m1, m2 } = cemberUcgenYerlesim();

    if (tutulan === 'm1' || tutulan === 'm2') {
      olcuAyarla('d', (Math.abs(p.x - canvas.width / 2) * 2) / b);
    } else if (tutulan === 'r1') {
      olcuAyarla('r1', Math.hypot(p.x - m1.x, p.y - m1.y) / b);
    } else {
      olcuAyarla('r2', Math.hypot(p.x - m2.x, p.y - m2.y) / b);
    }
    ciz();
  }

  function basla(olay) {
    if (mod === 'cember-ucgen') {
      tutulan = tutamakBul(noktaAl(olay));
      return;
    }
    baslangic = noktaAl(olay);
  }

  function bitir(olay) {
    if (mod === 'cember-ucgen') {
      if (tutulan && ses) ses.efekt('tik');
      tutulan = null;
      return;
    }
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
    tutulan = null;
  }

  canvas.addEventListener('pointermove', surukle);
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
      const n = kenarSayisi(sekiller);
      return n >= 3
        ? { tamam: true, mesaj: `${n} kenarlı bir çokgen kurdun.` }
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
    if (mod === 'dikme') return dikmeDogrula();
    if (mod === 'cember-ucgen') {
      return gorulenTurler.size >= 2
        ? {
            tamam: true,
            mesaj: `Ölçüleri değiştirerek ${gorulenTurler.size} farklı üçgen türü gördün.`
          }
        : {
            tamam: false,
            mesaj: 'Merkezleri veya çember kenarlarını sürükleyip en az iki farklı üçgen türü çıkar.'
          };
    }
    // Bilinmeyen mod GECMEZ. Eskiden burada kosulsuz tamam: true vardi
    // ve kapsanmayan her mod sessizce yildiz odiyordu.
    return { tamam: false, mesaj: 'Bu etkinlik henüz hazır değil.' };
  }

  /**
   * Dikme gercekten dik mi. Referans dogru yatay (y = 0.6 * yukseklik)
   * ve isaretli nokta tam ortasinda; cocugun cizgisi hem ona yakin
   * gecmeli hem de 90 dereceye yaklasmali.
   *
   * Eskiden yalniz "en az bir sekil var mi" diye bakiliyor ve tek
   * dokunusa "Dikmeyi çizdin." deniyordu - cocugun kendi cizimi
   * hakkinda dogru olmayan bir cumle.
   */
  function dikmeDogrula() {
    const cizgiler = sekiller.filter((s) => s.tip !== 'nokta' && s.tip !== 'cember');
    if (cizgiler.length === 0) {
      return { tamam: false, mesaj: 'Doğrunun üzerindeki noktadan yukarı doğru bir çizgi çek.' };
    }

    const y = canvas.height * 0.6;
    const isaret = { x: canvas.width / 2, y };
    const yakin = Math.min(canvas.width, canvas.height) / 8;

    for (const c of cizgiler) {
      if (!dikMi(1, 0, c.b.x - c.a.x, c.b.y - c.a.y)) continue;
      const gecti = Math.min(
        Math.hypot(c.a.x - isaret.x, c.a.y - isaret.y),
        Math.hypot(c.b.x - isaret.x, c.b.y - isaret.y)
      );
      if (gecti <= yakin) {
        return { tamam: true, mesaj: 'Dikmeyi çizdin: çizgin doğruyla 90 derecelik açı yapıyor.' };
      }
      return { tamam: false, mesaj: 'Açın doğru ama çizgin işaretli noktadan geçmiyor. Oradan başla.' };
    }
    return { tamam: false, mesaj: 'Çizgin doğruya dik değil. Gönyeyle 90 dereceyi tutturmayı dene.' };
  }

  function yokEt() {
    canvas.removeEventListener('pointermove', surukle);
    canvas.removeEventListener('pointerdown', basla);
    canvas.removeEventListener('pointerup', bitir);
    canvas.removeEventListener('pointercancel', iptal);
  }

  return { ciz, dogrula, yokEt, aracSec, temizle };
}
