/**
 * Temel geometri ders sorulari. muhendislik.js ile ayni yapida (iki dilli,
 * dogru = karistirmadan onceki indeks). Ayni quiz motoru ikisini de gosterir.
 *
 * Kategoriler: sekil (sekil adlari), kenar (kenar/kose sayilari), kavram
 * (cevre, aci, simetri gibi temel kavramlar).
 */

export const GEOMETRI_SORULAR = [
  {
    id: 'ucgen', kategori: 'sekil', dogru: 0,
    tr: { soru: '3 kenarı ve 3 köşesi olan şekil hangisi?', secenekler: ['Üçgen', 'Kare', 'Daire', 'Yıldız'] },
    en: { soru: 'Which shape has 3 sides and 3 corners?', secenekler: ['Triangle', 'Square', 'Circle', 'Star'] }
  },
  {
    id: 'kare', kategori: 'sekil', dogru: 0,
    tr: { soru: '4 kenarı da eşit uzunlukta olan şekil hangisi?', secenekler: ['Kare', 'Üçgen', 'Daire', 'Kalp'] },
    en: { soru: 'Which shape has 4 sides all the same length?', secenekler: ['Square', 'Triangle', 'Circle', 'Heart'] }
  },
  {
    id: 'daire', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Yuvarlak, hiç köşesi olmayan şekil hangisi?', secenekler: ['Daire', 'Kare', 'Üçgen', 'Beşgen'] },
    en: { soru: 'Which round shape has no corners at all?', secenekler: ['Circle', 'Square', 'Triangle', 'Pentagon'] }
  },
  {
    id: 'altigen', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Arı peteği gibi 6 kenarı olan şekle ne denir?', secenekler: ['Altıgen', 'Beşgen', 'Üçgen', 'Kare'] },
    en: { soru: 'What is a 6-sided shape, like a honeycomb, called?', secenekler: ['Hexagon', 'Pentagon', 'Triangle', 'Square'] }
  },
  {
    id: 'kup', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Zar gibi 6 yüzü olan cisim hangisi?', secenekler: ['Küp', 'Küre', 'Silindir', 'Koni'] },
    en: { soru: 'Which solid has 6 faces, like a dice?', secenekler: ['Cube', 'Sphere', 'Cylinder', 'Cone'] }
  },
  {
    id: 'kure', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Top ya da portakal gibi her yanı yuvarlak cisim?', secenekler: ['Küre', 'Küp', 'Piramit', 'Kutu'] },
    en: { soru: 'Which solid is round all over, like a ball or orange?', secenekler: ['Sphere', 'Cube', 'Pyramid', 'Box'] }
  },

  {
    id: 'ucgen-kose', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir üçgenin kaç köşesi vardır?', secenekler: ['3', '4', '5', '6'] },
    en: { soru: 'How many corners does a triangle have?', secenekler: ['3', '4', '5', '6'] }
  },
  {
    id: 'kare-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir karenin kaç kenarı vardır?', secenekler: ['4', '3', '5', '8'] },
    en: { soru: 'How many sides does a square have?', secenekler: ['4', '3', '5', '8'] }
  },
  {
    id: 'daire-kose', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir dairenin kaç köşesi vardır?', secenekler: ['Hiç (0)', '1', '2', '4'] },
    en: { soru: 'How many corners does a circle have?', secenekler: ['None (0)', '1', '2', '4'] }
  },
  {
    id: 'besgen-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir beşgenin kaç kenarı vardır?', secenekler: ['5', '4', '6', '3'] },
    en: { soru: 'How many sides does a pentagon have?', secenekler: ['5', '4', '6', '3'] }
  },
  {
    id: 'dikdortgen-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Dikdörtgenin karşılıklı kenarları nasıldır?', secenekler: ['Eşit uzunlukta', 'Hep farklı', 'Yuvarlak', 'Eğri'] },
    en: { soru: 'What are the opposite sides of a rectangle like?', secenekler: ['Equal in length', 'All different', 'Round', 'Curvy'] }
  },

  {
    id: 'cevre', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir şeklin çevresini bulmak için ne yaparız?', secenekler: ['Kenarları toplarız', 'İçini boyarız', 'Sileriz', 'Katlarız'] },
    en: { soru: 'How do we find the perimeter of a shape?', secenekler: ['Add up the sides', 'Color it in', 'Erase it', 'Fold it'] }
  },
  {
    id: 'aci', kategori: 'kavram', dogru: 0,
    tr: { soru: 'İki çizginin bir köşede yaptığı açıklığa ne denir?', secenekler: ['Açı', 'Kenar', 'Nokta', 'Daire'] },
    en: { soru: 'What is the opening two lines make at a corner called?', secenekler: ['Angle', 'Side', 'Point', 'Circle'] }
  },
  {
    id: 'dik-aci', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Tam köşe (dik açı) kaç derecedir?', secenekler: ['90', '45', '100', '10'] },
    en: { soru: 'How many degrees is a square corner (right angle)?', secenekler: ['90', '45', '100', '10'] }
  },
  {
    id: 'dogru', kategori: 'kavram', dogru: 0,
    tr: { soru: 'İki nokta arasındaki en kısa yol hangisidir?', secenekler: ['Düz çizgi', 'Eğri çizgi', 'Zikzak', 'Daire'] },
    en: { soru: 'What is the shortest path between two points?', secenekler: ['A straight line', 'A curvy line', 'A zigzag', 'A circle'] }
  },
  {
    id: 'simetri-kare', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir kareyi tam ortadan katlarsak iki yarısı nasıl olur?', secenekler: ['Birbirinin aynısı', 'Bambaşka', 'Yuvarlak', 'Kaybolur'] },
    en: { soru: 'If we fold a square right down the middle, how are the two halves?', secenekler: ['Exactly the same', 'Totally different', 'Round', 'Gone'] }
  }
];
