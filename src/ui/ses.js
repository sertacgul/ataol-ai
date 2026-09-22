/**
 * Ses katmani. Tek giris noktasi.
 *
 * Iki kaynak vardir ve sirasi onemlidir:
 *   1. sesler/<id>.mp3  - onceden uretilmis gercek anlatim (Chirp 3 HD)
 *   2. cihaz TTS'i      - dosya yoksa geri dusulen cozum
 *
 * Bu sira sayesinde ses uretimi kod yazimini bekletmez: dosyalar
 * sonradan damlayarak gelir, uygulama kodu hic degismez.
 *
 * Geri bildirim efektleri Web Audio ile kod icinde sentezlenir; tek bir
 * ses dosyasi bile inmez ve uygulama sismez.
 *
 * Bu dosya ui/ altindadir ama DOM'a dokunmaz: speechSynthesis,
 * AudioContext ve Audio disaridan enjekte edilir. Boylece node testinde
 * gercek tarayici olmadan calisir.
 */

// Efekt tarifleri: [frekans Hz, sure sn] ciftleri. Kisa ve yumusak
// tutuldu; cocuk gun boyu duyacak.
const EFEKTLER = {
  dogru: [[660, 0.09], [880, 0.14]],
  yanlis: [[300, 0.16]],
  kutlama: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.22]],
  tik: [[1200, 0.03]]
};

export function createSes({ speechSynthesis, SpeechSynthesisUtterance, AudioContext, Audio, sesKok = 'sesler/' } = {}) {
  let sesAcik = true;
  let ctx = null;
  let calan = null;
  let sonEfekt = null;

  const ttsVar = () => Boolean(speechSynthesis && typeof speechSynthesis.speak === 'function' && typeof SpeechSynthesisUtterance === 'function');

  /**
   * iOS'ta ses ancak bir kullanici dokunusunun icinde baslatilabilir.
   * "Derse basla" butonu bu dokunustur ve burayi cagirir.
   */
  async function hazirla() {
    if (!AudioContext) return;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      await ctx.resume();
    }
  }

  function dosyaCal(id) {
    if (!Audio) return Promise.reject(new Error('Audio yok'));
    return new Promise((coz, at) => {
      const a = new Audio(`${sesKok}${id}.mp3`);
      calan = a;
      a.addEventListener('ended', () => coz('dosya'));
      a.addEventListener('error', () => at(new Error('dosya yok')));
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => at(new Error('calinamadi')));
    });
  }

  function ttsOku(metin) {
    return new Promise((coz) => {
      if (!ttsVar()) return coz('kapali');
      const u = new SpeechSynthesisUtterance(metin);
      u.lang = 'tr-TR';
      u.rate = 0.95;
      // Hem bitis hem hata 'tts' ile settle eder. Sessiz dusme kurali
      // geregi cocuga hata gosterilmez; onemli olan sozun asili
      // kalmamasi, yoksa ders ekrani donar.
      u.onend = () => coz('tts');
      u.onerror = () => coz('tts');
      speechSynthesis.speak(u);
    });
  }

  /**
   * Bir anlatim adimini seslendirir.
   *
   * adim.ses varsa once dosya denenir; dosya yoksa ya da calinamiyorsa
   * sessizce TTS'e dusulur. Dusme sessizdir cunku cocugun ekraninda
   * "ses dosyasi bulunamadi" yazmasinin hicbir faydasi yok.
   */
  async function oku(adim) {
    if (!sesAcik) return 'kapali';
    const metin = String(adim?.metin ?? '');
    if (adim?.ses) {
      try {
        return await dosyaCal(adim.ses);
      } catch {
        // dosya yok; TTS'e dusulur
      }
    }
    if (!metin) return 'kapali';
    return ttsOku(metin);
  }

  function dur() {
    if (calan && typeof calan.pause === 'function') calan.pause();
    calan = null;
    if (ttsVar() && typeof speechSynthesis.cancel === 'function') speechSynthesis.cancel();
  }

  function efekt(ad) {
    sonEfekt = null;
    if (!sesAcik || !ctx) return;
    if (!Object.hasOwn(EFEKTLER, ad)) return;
    const tarif = EFEKTLER[ad];

    let t = ctx.currentTime;
    for (const [hz, sure] of tarif) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(hz, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + sure);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + sure);
      t += sure;
    }
    sonEfekt = ad;
  }

  function ayarla({ sesAcik: acik } = {}) {
    if (typeof acik === 'boolean') sesAcik = acik;
    if (!sesAcik) dur();
  }

  return {
    hazirla,
    oku,
    dur,
    efekt,
    ayarla,
    // Test ve teshis icin; uygulama mantigi bunlara dayanmaz.
    ctxDurumu: () => ctx?.state ?? null,
    sonEfekt: () => sonEfekt
  };
}
