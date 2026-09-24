/**
 * "Soyle" asamasinin ses kaydi (spec D6: konusma tanima DEGIL,
 * kayit-ve-dinlet).
 *
 * Kayit YALNIZ hafizada durur: sunucuya gitmez, depoya yazilmaz.
 * Ekran kapaninca birak() mikrofonu kapatir ve kaydi siler.
 *
 * Tarayici API'leri disaridan verilir (createSes ile ayni kalip);
 * boylece izin reddi ve mikrofonun birakilmasi node'da test edilir.
 */

export function createKayit({ navigator, MediaRecorder, Blob, URL, Audio, zamanla = setTimeout } = {}) {
  let akis = null;
  let adres = null;
  let calan = null;

  function destekli() {
    return Boolean(MediaRecorder && navigator?.mediaDevices?.getUserMedia);
  }

  function adresiBirak() {
    if (adres) URL.revokeObjectURL(adres);
    adres = null;
  }

  /**
   * `ms` milisaniye kaydeder, calinabilir bir adres doner. Izin ilk
   * kayitta bir kez istenir; reddedilirse hata atar ve cagiran asamayi
   * "dinle ve tekrarla"ya dusurur.
   */
  async function kaydet(ms) {
    if (!akis) akis = await navigator.mediaDevices.getUserMedia({ audio: true });
    adresiBirak();
    return new Promise((coz, at) => {
      const parcalar = [];
      const kaydedici = new MediaRecorder(akis);
      kaydedici.ondataavailable = (e) => { if (e.data) parcalar.push(e.data); };
      kaydedici.onerror = () => at(new Error('kayit basarisiz'));
      kaydedici.onstop = () => {
        adres = URL.createObjectURL(new Blob(parcalar, { type: kaydedici.mimeType || 'audio/mp4' }));
        coz(adres);
      };
      kaydedici.start();
      zamanla(() => kaydedici.stop(), ms);
    });
  }

  /** Son kaydi calar; bitince doner. */
  function cal() {
    if (!adres || !Audio) return Promise.resolve();
    return new Promise((coz) => {
      calan = new Audio(adres);
      calan.addEventListener('ended', () => coz());
      calan.addEventListener('error', () => coz());
      const p = calan.play();
      if (p && typeof p.catch === 'function') p.catch(() => coz());
    });
  }

  /**
   * Calan kaydi durdurur ama mikrofonu BIRAKMAZ. Kelimeler arasinda
   * gezinirken kullanilir; birak() cagrilsaydi izin her kelimede yeniden
   * istenirdi.
   */
  function sustur() {
    if (calan && typeof calan.pause === 'function') calan.pause();
    calan = null;
  }

  function birak() {
    sustur();
    if (akis) for (const iz of akis.getTracks()) iz.stop();
    akis = null;
    adresiBirak();
  }

  return { destekli, kaydet, cal, sustur, birak };
}
