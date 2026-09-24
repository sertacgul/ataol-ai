/**
 * "Cumle kur" asamasi. Saf: DOM yok, saat yok, rastgele yok - rng
 * disaridan gelir.
 *
 * Cumleler YENI YAZILMAZ: haftanin kelimelerinin sozlukteki ornek
 * cumleleri kullanilir. Onlar Faz 1'de elle yazilip incelendi, Turkce
 * karsiliklari ve sesleri (en/<id>-ornek) zaten var. Ikinci bir cumle
 * listesi hem inceleme yukunu ikiye katlar hem de sesi olmayan cumle
 * uretirdi.
 */

/** Fisher-Yates. Kaynagi degistirmez. */
function karistir(dizi, rng) {
  const out = [...dizi];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Cumleyi kelimelere boler. Sondaki noktalama AYRI doner: son kelimeye
 * yapisik kalsaydi hangi parcanin sona gidecegi belli olurdu.
 */
export function parcala(cumle) {
  const temiz = String(cumle).trim();
  const eslesme = temiz.match(/[.?!]+$/);
  const son = eslesme ? eslesme[0] : '';
  const govde = son ? temiz.slice(0, -son.length) : temiz;
  return { parcalar: govde.split(/\s+/).filter(Boolean), son };
}

/**
 * Bir kelimenin ornek cumlesinden dizilecek kart.
 *
 * Her parca kendi id'sini tasir: "chess ... chess" gibi tekrar eden
 * kelimelerde ekran hangi dugmeye basildigini ayirt edebilmeli.
 * Karisik sira dogru siraya esit cikarsa yeniden karistirilir; bir
 * kelimeden uzun her cumlede en az iki farkli sira vardir, tekrar
 * eden kelimeler de metin karsilastirmasiyla ayiklanir.
 */
export function cumleKarti(kelime, rng) {
  const { parcalar, son } = parcala(kelime.ornek.en);
  const etiketli = parcalar.map((metin, i) => ({ id: `p${i}`, metin }));
  const hepsiAyni = parcalar.every((p) => p === parcalar[0]);

  let karisik = karistir(etiketli, rng);
  while (!hepsiAyni && karisik.every((p, i) => p.metin === parcalar[i])) {
    karisik = karistir(etiketli, rng);
  }

  return {
    kelimeId: kelime.id,
    parcalar,
    son,
    karisik,
    tr: kelime.ornek.tr,
    tam: kelime.ornek.en,
    ses: `en/${kelime.id}-ornek`
  };
}

/** Dizilen metinler dogru cumleyi veriyor mu. Parca kimligine bakmaz. */
export function dogruMu(dizilen, parcalar) {
  return dizilen.length === parcalar.length
    && dizilen.every((m, i) => m === parcalar[i]);
}

/**
 * Ekranin ihtiyaci: dizilen parcalar (sirasiyla), kalan parcalar (karisik
 * sirada), hepsi dizildi mi ve dogru mu. diziliIdler bilinmeyen ya da
 * tekrarlanan id tasirsa o id yok sayilir; eski bir ekrandan gelen
 * tiklama parcayi cogaltamaz.
 */
export function cumleDurumu(kart, diziliIdler) {
  const dizili = [];
  for (const id of diziliIdler) {
    const p = kart.karisik.find((x) => x.id === id);
    if (p && !dizili.includes(p)) dizili.push(p);
  }
  const kalan = kart.karisik.filter((p) => !dizili.includes(p));
  const tamam = kalan.length === 0;
  return {
    dizili,
    kalan,
    tamam,
    dogru: tamam && dogruMu(dizili.map((p) => p.metin), kart.parcalar)
  };
}

/**
 * Bir oturumluk kart: haftanin kelimelerinden `adet` tanesi, tekrarsiz.
 * Tek kelimelik ornek cumle alinmaz, dizilecek bir sey yok.
 */
export function cumleOturumu(hafta, sozluk, rng, adet) {
  const uygun = hafta.kelimeler
    .map((id) => sozluk.find((k) => k.id === id))
    .filter((k) => k && parcala(k.ornek.en).parcalar.length > 1);
  return karistir(uygun, rng).slice(0, adet).map((k) => cumleKarti(k, rng));
}
