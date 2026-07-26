/**
 * Kodlama oyunu: cocuk komut dizisi kurar (ileri, saga don, sola don),
 * robot izgarada hedefe ulasmaya calisir. Programlamanin ozu: adimlari
 * onceden sirala, sonra calistir, sonucu gor.
 *
 * Saf motor. Tarih/rastgele yok; canvas ve animasyon main.js'de. calistir
 * tum ara adimlari dondurur ki cagiran taraf tek tek canlandirabilsin.
 */

// Yon indeksi: 0 yukari, 1 sag, 2 asagi, 3 sol. Saga donmek +1, sola -1.
export const YON_DELTA = [
  [0, -1], // yukari
  [1, 0], // sag
  [0, 1], // asagi
  [-1, 0] // sol
];

export const KOMUTLAR = ['ileri', 'sag', 'sol'];

/**
 * Komut dizisini calistirir. Donen adimlar[0] baslangic; her komut bir adim
 * ekler. ileri izgara disina ya da engele denk gelirse "carpma" adimi eklenir
 * ve durur. basarili = carpma yok ve son kare hedef.
 */
export function calistir(seviye, komutlar) {
  let x = seviye.baslangic.x;
  let y = seviye.baslangic.y;
  let yon = seviye.baslangic.yon;
  const engelSet = new Set((seviye.engeller ?? []).map((e) => `${e.x},${e.y}`));
  const adimlar = [{ x, y, yon, tur: 'baslangic', carpma: false }];
  let carpma = false;

  for (const k of komutlar) {
    if (k === 'sag') {
      yon = (yon + 1) % 4;
      adimlar.push({ x, y, yon, tur: 'sag', carpma: false });
    } else if (k === 'sol') {
      yon = (yon + 3) % 4;
      adimlar.push({ x, y, yon, tur: 'sol', carpma: false });
    } else if (k === 'ileri') {
      const nx = x + YON_DELTA[yon][0];
      const ny = y + YON_DELTA[yon][1];
      const disari = nx < 0 || ny < 0 || nx >= seviye.en || ny >= seviye.boy;
      if (disari || engelSet.has(`${nx},${ny}`)) {
        carpma = true;
        adimlar.push({ x, y, yon, tur: 'carpma', carpma: true });
        break;
      }
      x = nx;
      y = ny;
      adimlar.push({ x, y, yon, tur: 'ileri', carpma: false });
    }
  }

  const basarili = !carpma && x === seviye.hedef.x && y === seviye.hedef.y;
  return { adimlar, basarili, carpma, son: { x, y, yon } };
}

/**
 * Seviyeler. Hepsi 5x5 izgara (cizim basit kalsin). Zorluk: once duz cizgi,
 * sonra donus, sonra engel etrafindan dolasma. Her seviye cozulebilir ve
 * hedef ne baslangicta ne de engelde.
 */
export const SEVIYELER = [
  {
    id: 's1', en: 5, boy: 5,
    baslangic: { x: 0, y: 2, yon: 1 }, hedef: { x: 4, y: 2 }, engeller: []
  },
  {
    id: 's2', en: 5, boy: 5,
    baslangic: { x: 0, y: 4, yon: 0 }, hedef: { x: 4, y: 0 }, engeller: []
  },
  {
    id: 's3', en: 5, boy: 5,
    baslangic: { x: 2, y: 4, yon: 0 }, hedef: { x: 2, y: 0 },
    engeller: [{ x: 2, y: 2 }]
  },
  {
    id: 's4', en: 5, boy: 5,
    baslangic: { x: 0, y: 0, yon: 2 }, hedef: { x: 4, y: 4 },
    engeller: [{ x: 2, y: 1 }, { x: 2, y: 3 }]
  },
  {
    id: 's5', en: 5, boy: 5,
    baslangic: { x: 4, y: 4, yon: 3 }, hedef: { x: 0, y: 0 },
    engeller: [{ x: 2, y: 2 }, { x: 1, y: 3 }]
  },
  {
    id: 's6', en: 5, boy: 5,
    baslangic: { x: 0, y: 2, yon: 1 }, hedef: { x: 4, y: 2 },
    engeller: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }]
  },
  {
    id: 's7', en: 5, boy: 5,
    baslangic: { x: 0, y: 0, yon: 1 }, hedef: { x: 4, y: 4 },
    engeller: [{ x: 1, y: 2 }, { x: 3, y: 2 }]
  },
  {
    id: 's8', en: 5, boy: 5,
    baslangic: { x: 4, y: 0, yon: 2 }, hedef: { x: 0, y: 4 },
    engeller: [{ x: 2, y: 2 }]
  },
  {
    id: 's9', en: 5, boy: 5,
    baslangic: { x: 2, y: 0, yon: 2 }, hedef: { x: 2, y: 4 },
    engeller: [{ x: 2, y: 2 }, { x: 1, y: 2 }]
  },
  {
    id: 's10', en: 5, boy: 5,
    baslangic: { x: 0, y: 4, yon: 0 }, hedef: { x: 4, y: 4 },
    engeller: [{ x: 2, y: 4 }, { x: 2, y: 3 }]
  },
  {
    id: 's11', en: 5, boy: 5,
    baslangic: { x: 0, y: 0, yon: 2 }, hedef: { x: 2, y: 2 },
    engeller: [{ x: 1, y: 1 }, { x: 3, y: 3 }]
  },
  {
    id: 's12', en: 5, boy: 5,
    baslangic: { x: 4, y: 4, yon: 0 }, hedef: { x: 0, y: 0 },
    engeller: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }]
  },
  {
    id: 's13', en: 5, boy: 5,
    baslangic: { x: 0, y: 2, yon: 1 }, hedef: { x: 4, y: 2 },
    engeller: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }]
  },
  {
    id: 's14', en: 5, boy: 5,
    baslangic: { x: 2, y: 2, yon: 0 }, hedef: { x: 0, y: 0 },
    engeller: [{ x: 1, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }, { x: 3, y: 1 }]
  },
  {
    id: 's15', en: 5, boy: 5,
    baslangic: { x: 0, y: 4, yon: 1 }, hedef: { x: 4, y: 0 },
    engeller: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]
  }
];
