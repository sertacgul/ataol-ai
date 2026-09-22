import assert from 'node:assert/strict';

/**
 * Tohumlu, belirlenimci rastgele sayi uretici.
 *
 * Math.random yerine bunu kullaniyoruz ki basarisiz bir test tekrar
 * calistirildiginda AYNI soruyu uretsin. Rastgele basarisiz olan bir
 * test hic olmayan testten daha kotudur.
 *
 * mulberry32: kucuk, hizli ve testler icin yeterince dagilimli.
 */
export function tohumluRng(tohum) {
  let a = tohum >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BICIMLER = ['secmeli', 'sayi'];

/**
 * Ortak soru sozlesmesi. Her uretici testi her tohumda bunu cagirir.
 * Cevabin DOGRULUGU burada denetlenmez; onu her ureticinin kendi testi
 * parametrelerden bagimsiz olarak yeniden hesaplayarak dogrular.
 */
export function sozlesmeyiDogrula(soru, baglam) {
  const b = (m) => `${baglam}: ${m}`;

  assert.ok(soru && typeof soru === 'object', b('soru nesnesi degil'));
  assert.ok(typeof soru.tip === 'string' && soru.tip.length > 0, b('tip bos'));
  assert.ok(BICIMLER.includes(soru.bicim), b(`gecersiz bicim "${soru.bicim}"`));

  assert.ok(soru.soru && typeof soru.soru.tr === 'string', b('soru.tr yok'));
  assert.ok(soru.soru.tr.trim().length >= 10, b('soru metni fazla kisa'));

  assert.ok(Array.isArray(soru.cozum), b('cozum dizi degil'));
  assert.ok(soru.cozum.length >= 1, b('cozum adimi yok'));
  for (const adim of soru.cozum) {
    assert.ok(typeof adim === 'string' && adim.trim().length > 0, b('bos cozum adimi'));
  }

  if (soru.bicim === 'secmeli') {
    assert.ok(Array.isArray(soru.secenekler), b('secenekler dizi degil'));
    assert.ok(soru.secenekler.length >= 3 && soru.secenekler.length <= 5,
      b(`secenek sayisi ${soru.secenekler.length}`));

    for (const s of soru.secenekler) {
      assert.ok(typeof s === 'string' && s.trim().length > 0, b('bos secenek'));
    }

    const benzersiz = new Set(soru.secenekler);
    assert.equal(benzersiz.size, soru.secenekler.length,
      b(`tekrar eden secenek: ${soru.secenekler.join(', ')}`));

    assert.ok(Number.isInteger(soru.dogru), b('dogru indeks degil'));
    assert.ok(soru.dogru >= 0 && soru.dogru < soru.secenekler.length,
      b(`dogru indeks disarida: ${soru.dogru}`));
  }

  if (soru.bicim === 'sayi') {
    assert.ok(typeof soru.cevap === 'string' && soru.cevap.length > 0,
      b('sayi biciminde cevap metni yok'));
  }
}

/**
 * Bir ureticiyi N tohumla calistirip sozlesmeyi ve cagiranin verdigi
 * ek dogrulamayi uygular.
 *
 * ekDogrula(soru, rngTohumu): ureticiye ozel kontrol. Burasi cevabin
 * parametrelerden bagimsiz olarak yeniden hesaplandigi yerdir.
 */
export function ureticiyiSina(uret, seviye, ekDogrula, tur = 200) {
  for (let tohum = 1; tohum <= tur; tohum++) {
    const soru = uret(seviye, tohumluRng(tohum));
    sozlesmeyiDogrula(soru, `seviye ${seviye}, tohum ${tohum}`);
    if (ekDogrula) ekDogrula(soru, tohum);
  }
}
