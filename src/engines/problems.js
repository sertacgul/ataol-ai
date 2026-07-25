/**
 * Sozel problem uretimi.
 *
 * Problemler kendi sayi havuzunu kurmaz; mevcut seviyenin olgularini
 * giydirir. Cocuk 10'a kadar toplamadaysa problem de 3+4 olur. Aksi
 * halde problem hem okuma hem de seviyesinin ustunde aritmetik yukler.
 *
 * Sure olculmez: aritmetik ayni ama sureye okuma da dahildir.
 *
 * Saf modul: rastgelelik disaridan gelir.
 */

// toUpperCase() Turkce'de yanlis sonuc verir: "itfaiye" -> "Itfaiye"
// olur, dogrusu "İtfaiye"dir.
const buyukHarf = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

export const TEMPLATES = [
  {
    id: 'indirme',
    op: '-',
    yuk: true,
    yaz: ({ bulunma, birim, a, b }) =>
      `Bir ${bulunma} ${a} ${birim} vardı. ${b} ${birim} indirildi. Kaç ${birim} kaldı?`
  },
  {
    id: 'inme',
    op: '-',
    yuk: false,
    yaz: ({ bulunma, birim, a, b }) =>
      `${buyukHarf(bulunma)} ${a} ${birim} vardı. Durakta ${b} ${birim} indi. Kaç ${birim} kaldı?`
  },
  {
    id: 'yukleme',
    op: '+',
    yuk: true,
    yaz: ({ bulunma, birim, a, b }) =>
      `Bir ${bulunma} ${a} ${birim} vardı. ${b} ${birim} daha yüklendi. Toplam kaç ${birim} oldu?`
  },
  {
    id: 'binme',
    op: '+',
    yuk: false,
    yaz: ({ bulunma, birim, a, b }) =>
      `${buyukHarf(bulunma)} ${a} ${birim} vardı. Durakta ${b} ${birim} daha bindi. Toplam kaç ${birim} oldu?`
  },
  {
    // Yolcu araci secilmez: "Her taksi 10 yolcu tasiyor" cocugun bildigi
    // bir gercekle celisir ve dikkatini aritmetikten koparir. Yolcu
    // araclari toplama ve cikarmada bolca gorunur.
    id: 'filo',
    op: 'x',
    yuk: true,
    yaz: ({ ad, birim, a, b }) =>
      `${a} ${ad} sıraya dizildi. Her ${ad} ${b} ${birim} taşıyor. Toplam kaç ${birim} taşınıyor?`
  },
  {
    id: 'paylastirma',
    op: '/',
    yuk: true,
    yaz: ({ ad, yonelme, birim, a, b }) =>
      `${a} ${birim} ${b} ${yonelme} eşit olarak paylaştırıldı. Her ${ad} kaç ${birim} taşıyor?`
  }
];

export function templatesFor(op) {
  return TEMPLATES.filter((t) => t.op === op);
}

function sec(liste, rng) {
  return liste[Math.min(liste.length - 1, Math.floor(rng() * liste.length))];
}

export function buildProblem(fact, theme, rng = Math.random) {
  const sablonlar = templatesFor(fact.op);
  if (sablonlar.length === 0) return null;

  const sablon = sec(sablonlar, rng);

  // Sablon yuk mu yolcu mu istiyorsa ona uygun arac secilir.
  // "Takside 8 palet vardi" ya da "Tirda 8 yolcu indi" olmasin diye.
  const uygun = sablon.yuk === null
    ? theme.nesneler
    : theme.nesneler.filter((n) => (sablon.yuk ? !n.birimler.includes('yolcu') : n.birimler.includes('yolcu')));

  const taban = uygun.length > 0 ? uygun : theme.nesneler;

  // Kapasite: cumlede gecen en buyuk sayi araca sigmali. Cikarmada bu
  // sayi ilk terim, toplamada sonuctur, o yuzden ucu de bakilir.
  const enBuyuk = Math.max(fact.a, fact.b, fact.answer);
  const kapasiteUygun = taban.filter((n) => n.enCok === undefined || n.enCok >= enBuyuk);

  // Hicbiri yetmiyorsa en genis araca dusulur, tum temaya degil:
  // cok buyuk bir yolcu sayisinda taksi degil otobus secilsin.
  let havuz = kapasiteUygun;
  if (havuz.length === 0) {
    const enGenis = Math.max(...taban.map((n) => n.enCok));
    havuz = taban.filter((n) => n.enCok === enGenis);
  }

  const nesne = sec(havuz, rng);
  const birim = sec(nesne.birimler, rng);

  return {
    key: fact.key ?? null,
    op: fact.op,
    answer: fact.answer,
    text: sablon.yaz({ ad: nesne.ad, bulunma: nesne.bulunma, yonelme: nesne.yonelme, birim, a: fact.a, b: fact.b })
  };
}
