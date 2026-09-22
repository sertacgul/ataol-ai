/**
 * Soru ureticilerinin ortak yardimcilari.
 *
 * index.js'ten AYRI bir dosyadir cunku index.js ureticileri import
 * ediyor, ureticiler de bu yardimcilari kullaniyor. Tek dosya olsaydi
 * dongusel import olurdu; boyle akis tek yonlu kalir:
 *   index.js -> uretici/<konu>.js -> ortak.js
 *
 * TEMEL KURAL: cevap, ureticinin sectigi parametrelerden HESAPLANIR.
 * Hicbir yerde "cevap muhtemelen su" yoktur. Celdiriciler de rastgele
 * sayi degil, cocugun gercekten yaptigi hatalarin sonucudur; yanlis
 * secildiginde cozum adimlari hangi hatanin yapildigini gosterir.
 */

export const BICIMLER = ['secmeli', 'sayi'];

/** Diziden rastgele bir oge. rng disaridan gelir. */
export const sec = (dizi, rng) => dizi[Math.floor(rng() * dizi.length)];

/**
 * Fisher-Yates. Kaynagi degistirmez.
 */
export function karistir(dizi, rng) {
  const out = [...dizi];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Secmeli soru kurar.
 *
 * Celdiriciler once benzersizlestirilir ve dogru cevapla cakisanlar
 * elenir; yoksa ayni sik iki kez cikar ve cocuk hakli olarak sasirir.
 * En fazla 3 celdirici alinir, yani 4 sik olur.
 *
 * dogru indeksi karistirmadan SONRA bulunur, sabit tutulmaz. Sabit
 * kalsaydi cocuk bir sure sonra "cevap hep ikinci sik" diye ogrenirdi.
 */
export function secmeliKur({ tip, soru, dogruCevap, celdiriciler, cozum, gorsel = null }, rng) {
  const dogruMetin = String(dogruCevap);
  const temiz = [];
  for (const c of celdiriciler.map(String)) {
    if (c !== dogruMetin && !temiz.includes(c)) temiz.push(c);
    if (temiz.length === 3) break;
  }

  const secenekler = karistir([dogruMetin, ...temiz], rng);

  return {
    tip,
    bicim: 'secmeli',
    soru: { tr: soru },
    secenekler,
    dogru: secenekler.indexOf(dogruMetin),
    cozum,
    gorsel
  };
}
