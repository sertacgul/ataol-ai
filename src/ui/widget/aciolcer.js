/**
 * Aciolcer widget'i.
 *
 * Uc mod:
 *   goster  - verilen aciyi cizer, cocuk turunu gorur
 *   olc     - aciyi cizer, cocuk aciolceri surukleyip okur
 *   kesisim - iki dogru kesistirir, komsu ve ters acilari renklendirir
 *
 * Aci matematigi engines/widgets/aci.js icindedir; burada yalniz cizim
 * ve dokunma var. Boylece ekranda gorunen ile soruda sorulan ayni
 * kuraldan gelir.
 */

import { aciTuru, ACI_TURU_ADI, butunler } from '../../engines/widgets/aci.js';

const RENK = {
  cizgi: '#2d3436', vurgu: '#6C5CE7', ikinci: '#00b894',
  yay: 'rgba(108, 92, 231, 0.25)', metin: '#2d3436'
};

const RAD = Math.PI / 180;

export function aciolcer(canvas, { mod = 'goster', veri = {}, ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const hedef = Number(veri.derece) || 60;

  // olc modunda cocugun aciolceri dondurerek buldugu deger.
  let okunan = null;
  let kesisimAcisi = Number(veri.derece) || 50;
  let suruyor = false;

  // kesisim modunda cocugun gercekten denedigi farkli acilar. Gorev
  // "degistir" dedigi icin bu kume onun kaniti.
  const gorulenAcilar = new Set();

  const merkez = () => ({ x: canvas.width / 2, y: canvas.height * 0.72 });
  const yaricap = () => Math.min(canvas.width, canvas.height) * 0.42;

  function kolCiz(derece, renk, uzunluk) {
    const m = merkez();
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x + Math.cos(-derece * RAD) * uzunluk, m.y + Math.sin(-derece * RAD) * uzunluk);
    ctx.strokeStyle = renk;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function yayCiz(derece) {
    const m = merkez();
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.arc(m.x, m.y, yaricap() * 0.3, 0, -derece * RAD, true);
    ctx.closePath();
    ctx.fillStyle = RENK.yay;
    ctx.fill();
  }

  function olcekCiz() {
    const m = merkez();
    const r = yaricap();
    ctx.beginPath();
    ctx.arc(m.x, m.y, r, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = RENK.cizgi;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let d = 0; d <= 180; d += 10) {
      const ic = d % 30 === 0 ? r - 14 : r - 8;
      ctx.beginPath();
      ctx.moveTo(m.x + Math.cos(-d * RAD) * ic, m.y + Math.sin(-d * RAD) * ic);
      ctx.lineTo(m.x + Math.cos(-d * RAD) * r, m.y + Math.sin(-d * RAD) * r);
      ctx.strokeStyle = RENK.cizgi;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (d % 30 === 0) {
        ctx.fillStyle = RENK.metin;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(d), m.x + Math.cos(-d * RAD) * (r - 26), m.y + Math.sin(-d * RAD) * (r - 26) + 4);
      }
    }
  }

  function yaziCiz(metin) {
    ctx.fillStyle = RENK.metin;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metin, canvas.width / 2, 24);
  }

  function ciz() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const r = yaricap();

    if (mod === 'kesisim') {
      const m = merkez();
      // Iki dogru: her biri iki yonde uzanan birer cizgi.
      for (const [derece, renk] of [[0, RENK.cizgi], [kesisimAcisi, RENK.vurgu]]) {
        ctx.beginPath();
        ctx.moveTo(m.x - Math.cos(-derece * RAD) * r, m.y - Math.sin(-derece * RAD) * r);
        ctx.lineTo(m.x + Math.cos(-derece * RAD) * r, m.y + Math.sin(-derece * RAD) * r);
        ctx.strokeStyle = renk;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      yayCiz(kesisimAcisi);
      yaziCiz(`${kesisimAcisi} derece, komşusu ${butunler(kesisimAcisi)} derece`);
      return;
    }

    olcekCiz();
    kolCiz(0, RENK.cizgi, r);
    kolCiz(hedef, RENK.ikinci, r);
    yayCiz(hedef);

    if (mod === 'goster') {
      yaziCiz(`${hedef} derece - ${ACI_TURU_ADI[aciTuru(hedef)]}`);
    } else {
      yaziCiz(okunan === null ? 'Açıölçeri sürükle ve açıyı oku' : `Okuduğun: ${okunan} derece`);
    }
  }

  function noktadanDerece(olay) {
    const kutu = canvas.getBoundingClientRect();
    const m = merkez();
    const x = ((olay.clientX - kutu.left) / kutu.width) * canvas.width - m.x;
    const y = ((olay.clientY - kutu.top) / kutu.height) * canvas.height - m.y;
    let d = Math.round((Math.atan2(-y, x) / RAD) / 5) * 5;
    if (d < 0) d = 0;
    if (d > 180) d = 180;
    return d;
  }

  function basla(olay) {
    suruyor = true;
    hareket(olay);
  }

  function hareket(olay) {
    if (!suruyor) return;
    const d = noktadanDerece(olay);
    if (mod === 'olc') {
      okunan = d;
      if (okunan === hedef && ses) ses.efekt('dogru');
    } else if (mod === 'kesisim') {
      kesisimAcisi = Math.max(10, Math.min(170, d));
      gorulenAcilar.add(kesisimAcisi);
    }
    ciz();
  }

  function bitir() {
    suruyor = false;
  }

  canvas.addEventListener('pointerdown', basla);
  canvas.addEventListener('pointermove', hareket);
  canvas.addEventListener('pointerup', bitir);
  canvas.addEventListener('pointercancel', bitir);

  function dogrula() {
    if (mod === 'olc') {
      if (okunan === null) return { tamam: false, mesaj: 'Önce açıölçeri sürükleyip açıyı oku.' };
      if (okunan !== hedef) return { tamam: false, mesaj: `${okunan} derece okudun. Sıfır çizgisinin başladığı skalayı takip et.` };
      return { tamam: true, mesaj: 'Doğru okudun!' };
    }
    if (mod === 'kesisim') {
      // Gorev "aciyi degistir ve komsusunun nasil degistigini gor" diyor.
      // Eskiden kosulsuz tamam donuyordu: tek tiklama 3 yildiz ediyordu.
      return gorulenAcilar.size >= 3
        ? { tamam: true, mesaj: 'Açıyı değiştirdin ve komşusunun toplamının hep 180 ettiğini gördün.' }
        : { tamam: false, mesaj: 'Doğruyu sürükleyip açıyı birkaç kez değiştir, komşusuna dikkat et.' };
    }
    // Bilinmeyen mod GECMEZ. Eskiden burasi kosulsuz tamam: true idi.
    return { tamam: false, mesaj: 'Bu etkinlik henüz hazır değil.' };
  }

  /**
   * Sozlesmenin temizle uyesi. Eskiden aciolcer bunu HIC vermiyordu ve
   * main.js `dersWidget?.temizle?.()` diye cagirdigi icin 3. ve 4.
   * haftada "Temizle" dugmesi sessizce olu kaliyordu.
   */
  function temizle() {
    okunan = null;
    kesisimAcisi = Number(veri.derece) || 50;
    gorulenAcilar.clear();
    ciz();
  }

  function yokEt() {
    canvas.removeEventListener('pointerdown', basla);
    canvas.removeEventListener('pointermove', hareket);
    canvas.removeEventListener('pointerup', bitir);
    canvas.removeEventListener('pointercancel', bitir);
  }

  return { ciz, dogrula, yokEt, temizle };
}
