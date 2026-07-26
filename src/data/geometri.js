/**
 * Temel geometri ders sorulari. muhendislik.js ile ayni yapida (iki dilli,
 * dogru = karistirmadan onceki indeks). Ayni quiz motoru ikisini de gosterir.
 *
 * Kategoriler: sekil (sekil ve cisim adlari), kenar (kenar/kose/yuz sayilari),
 * aci (aci turleri ve dereceler), kavram (cevre, alan, simetri, oruntu gibi).
 */

export const GEOMETRI_SORULAR = [
  // --- Sekiller ve cisimler ---
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
    id: 'dikdortgen', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Kapı gibi, karşılıklı kenarları eşit ve 4 köşesi dik olan şekil?', secenekler: ['Dikdörtgen', 'Üçgen', 'Daire', 'Altıgen'] },
    en: { soru: 'Like a door, which shape has equal opposite sides and 4 square corners?', secenekler: ['Rectangle', 'Triangle', 'Circle', 'Hexagon'] }
  },
  {
    id: 'besgen', kategori: 'sekil', dogru: 0,
    tr: { soru: '5 kenarı olan şekle ne denir?', secenekler: ['Beşgen', 'Altıgen', 'Üçgen', 'Kare'] },
    en: { soru: 'What is a shape with 5 sides called?', secenekler: ['Pentagon', 'Hexagon', 'Triangle', 'Square'] }
  },
  {
    id: 'dortgen', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Kare ve dikdörtgen gibi 4 kenarlı şekillere genel olarak ne denir?', secenekler: ['Dörtgen', 'Üçgen', 'Beşgen', 'Daire'] },
    en: { soru: 'What is the general name for 4-sided shapes like squares and rectangles?', secenekler: ['Quadrilateral', 'Triangle', 'Pentagon', 'Circle'] }
  },
  {
    id: 'oval', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Yumurta gibi uzunca yuvarlak şekle ne denir?', secenekler: ['Oval', 'Kare', 'Üçgen', 'Küp'] },
    en: { soru: 'What is a long round shape, like an egg, called?', secenekler: ['Oval', 'Square', 'Triangle', 'Cube'] }
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
    id: 'silindir', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Konserve kutusu gibi, iki ucu daire olan cisim hangisi?', secenekler: ['Silindir', 'Küp', 'Koni', 'Piramit'] },
    en: { soru: 'Which solid has two circle ends, like a soup can?', secenekler: ['Cylinder', 'Cube', 'Cone', 'Pyramid'] }
  },
  {
    id: 'koni', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Dondurma külahı gibi, tepesi sivri cisim hangisi?', secenekler: ['Koni', 'Küre', 'Küp', 'Silindir'] },
    en: { soru: 'Which solid has a pointy top, like an ice-cream cone?', secenekler: ['Cone', 'Sphere', 'Cube', 'Cylinder'] }
  },
  {
    id: 'piramit', kategori: 'sekil', dogru: 0,
    tr: { soru: 'Mısır piramitleri gibi, tabanı geniş tepesi sivri cisim?', secenekler: ['Piramit', 'Silindir', 'Küre', 'Daire'] },
    en: { soru: 'Which solid has a wide base and a pointy top, like the pyramids?', secenekler: ['Pyramid', 'Cylinder', 'Sphere', 'Circle'] }
  },

  // --- Kenar, kose, yuz sayilari ---
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
    id: 'altigen-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir altıgenin kaç kenarı vardır?', secenekler: ['6', '5', '4', '8'] },
    en: { soru: 'How many sides does a hexagon have?', secenekler: ['6', '5', '4', '8'] }
  },
  {
    id: 'dikdortgen-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Dikdörtgenin karşılıklı kenarları nasıldır?', secenekler: ['Eşit uzunlukta', 'Hep farklı', 'Yuvarlak', 'Eğri'] },
    en: { soru: 'What are the opposite sides of a rectangle like?', secenekler: ['Equal in length', 'All different', 'Round', 'Curvy'] }
  },
  {
    id: 'kup-yuz', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir küpün kaç yüzü vardır?', secenekler: ['6', '4', '8', '2'] },
    en: { soru: 'How many faces does a cube have?', secenekler: ['6', '4', '8', '2'] }
  },
  {
    id: 'kenar-kose-esit', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Bir çokgende kenar sayısı ile köşe sayısı nasıldır?', secenekler: ['Eşittir', 'Kenar daha çoktur', 'Köşe daha çoktur', 'Hiç köşe yoktur'] },
    en: { soru: 'In a polygon, how do the number of sides and corners compare?', secenekler: ['They are equal', 'More sides', 'More corners', 'No corners'] }
  },
  {
    id: 'cok-kenar', kategori: 'kenar', dogru: 0,
    tr: { soru: 'Hangisinin daha çok kenarı vardır?', secenekler: ['Altıgen', 'Üçgen', 'Kare', 'Beşgen'] },
    en: { soru: 'Which one has the most sides?', secenekler: ['Hexagon', 'Triangle', 'Square', 'Pentagon'] }
  },

  // --- Acilar ---
  {
    id: 'aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'İki çizginin bir köşede yaptığı açıklığa ne denir?', secenekler: ['Açı', 'Kenar', 'Nokta', 'Daire'] },
    en: { soru: 'What is the opening two lines make at a corner called?', secenekler: ['Angle', 'Side', 'Point', 'Circle'] }
  },
  {
    id: 'dik-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Tam köşe (dik açı) kaç derecedir?', secenekler: ['90', '45', '100', '10'] },
    en: { soru: 'How many degrees is a square corner (right angle)?', secenekler: ['90', '45', '100', '10'] }
  },
  {
    id: 'dar-aci', kategori: 'aci', dogru: 0,
    tr: { soru: '90 dereceden küçük, sivri açıya ne denir?', secenekler: ['Dar açı', 'Geniş açı', 'Dik açı', 'Doğru açı'] },
    en: { soru: 'What is a sharp angle smaller than 90 degrees called?', secenekler: ['Acute angle', 'Obtuse angle', 'Right angle', 'Straight angle'] }
  },
  {
    id: 'genis-aci', kategori: 'aci', dogru: 0,
    tr: { soru: '90 dereceden büyük, açık açıya ne denir?', secenekler: ['Geniş açı', 'Dar açı', 'Dik açı', 'Sıfır açı'] },
    en: { soru: 'What is a wide angle bigger than 90 degrees called?', secenekler: ['Obtuse angle', 'Acute angle', 'Right angle', 'Zero angle'] }
  },
  {
    id: 'dogru-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Dümdüz bir çizgi kaç derecelik açıdır?', secenekler: ['180', '90', '360', '45'] },
    en: { soru: 'A perfectly straight line makes an angle of how many degrees?', secenekler: ['180', '90', '360', '45'] }
  },
  {
    id: 'tam-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Tam bir dönüş (bir tur) kaç derecedir?', secenekler: ['360', '180', '90', '100'] },
    en: { soru: 'How many degrees is one full turn?', secenekler: ['360', '180', '90', '100'] }
  },
  {
    id: 'aciolcer', kategori: 'aci', dogru: 0,
    tr: { soru: 'Açıları ölçmek için hangi araç kullanılır?', secenekler: ['Açıölçer', 'Cetvel', 'Pergel', 'Silgi'] },
    en: { soru: 'Which tool is used to measure angles?', secenekler: ['Protractor', 'Ruler', 'Compass', 'Eraser'] }
  },
  {
    id: 'kare-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Bir karenin her köşesindeki açı kaç derecedir?', secenekler: ['90', '60', '45', '120'] },
    en: { soru: 'How many degrees is each corner angle of a square?', secenekler: ['90', '60', '45', '120'] }
  },
  {
    id: 'saat-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Saat tam 3\'ü gösterirken akrep ile yelkovan arasındaki açı nasıldır?', secenekler: ['Dik açı', 'Dar açı', 'Geniş açı', 'Doğru açı'] },
    en: { soru: 'At exactly 3 o\'clock, what kind of angle do the clock hands make?', secenekler: ['Right angle', 'Acute angle', 'Obtuse angle', 'Straight angle'] }
  },
  {
    id: 'ucgen-ic-aci', kategori: 'aci', dogru: 0,
    tr: { soru: 'Bir üçgenin iç açılarının toplamı kaç derecedir?', secenekler: ['180', '90', '360', '100'] },
    en: { soru: 'What do the inside angles of a triangle add up to?', secenekler: ['180', '90', '360', '100'] }
  },
  {
    id: 'aci-karsilastir', kategori: 'aci', dogru: 0,
    tr: { soru: 'Hangisi daha geniş bir açıdır?', secenekler: ['Geniş açı', 'Dar açı', 'Sıfır açı', 'Nokta'] },
    en: { soru: 'Which one is a wider angle?', secenekler: ['Obtuse angle', 'Acute angle', 'Zero angle', 'A point'] }
  },

  // --- Kavramlar ---
  {
    id: 'cevre', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir şeklin çevresini bulmak için ne yaparız?', secenekler: ['Kenarları toplarız', 'İçini boyarız', 'Sileriz', 'Katlarız'] },
    en: { soru: 'How do we find the perimeter of a shape?', secenekler: ['Add up the sides', 'Color it in', 'Erase it', 'Fold it'] }
  },
  {
    id: 'alan', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir şeklin içini kaplayan büyüklüğe ne denir?', secenekler: ['Alan', 'Çevre', 'Köşe', 'Açı'] },
    en: { soru: 'What do we call the amount of surface a shape covers inside?', secenekler: ['Area', 'Perimeter', 'Corner', 'Angle'] }
  },
  {
    id: 'cevre-hesap', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Her kenarı 2 cm olan bir karenin çevresi kaç cm\'dir?', secenekler: ['8', '4', '6', '2'] },
    en: { soru: 'A square with each side 2 cm has what perimeter?', secenekler: ['8', '4', '6', '2'] }
  },
  {
    id: 'alan-kare', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Her kenarı 3 birim olan karenin alanı kaçtır? (3 × 3)', secenekler: ['9', '6', '12', '3'] },
    en: { soru: 'What is the area of a square with each side 3 units? (3 × 3)', secenekler: ['9', '6', '12', '3'] }
  },
  {
    id: 'simetri-kare', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir kareyi tam ortadan katlarsak iki yarısı nasıl olur?', secenekler: ['Birbirinin aynısı', 'Bambaşka', 'Yuvarlak', 'Kaybolur'] },
    en: { soru: 'If we fold a square right down the middle, how are the two halves?', secenekler: ['Exactly the same', 'Totally different', 'Round', 'Gone'] }
  },
  {
    id: 'simetrik', kategori: 'kavram', dogru: 0,
    tr: { soru: 'İki yarısı katlanınca tam üst üste gelen şekle ne denir?', secenekler: ['Simetrik', 'Yamuk', 'Eğri', 'Dağınık'] },
    en: { soru: 'What do we call a shape whose two halves match when folded?', secenekler: ['Symmetric', 'Crooked', 'Curvy', 'Messy'] }
  },
  {
    id: 'oruntu', kategori: 'kavram', dogru: 0,
    tr: { soru: '△ ○ △ ○ △ ... dizisinde sıradaki şekil hangisi?', secenekler: ['○ (Daire)', '△ (Üçgen)', '□ (Kare)', '★ (Yıldız)'] },
    en: { soru: 'In the pattern △ ○ △ ○ △ ... what comes next?', secenekler: ['○ (Circle)', '△ (Triangle)', '□ (Square)', '★ (Star)'] }
  },
  {
    id: 'dogru', kategori: 'kavram', dogru: 0,
    tr: { soru: 'İki nokta arasındaki en kısa yol hangisidir?', secenekler: ['Düz çizgi', 'Eğri çizgi', 'Zikzak', 'Daire'] },
    en: { soru: 'What is the shortest path between two points?', secenekler: ['A straight line', 'A curvy line', 'A zigzag', 'A circle'] }
  },
  {
    id: 'paralel', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Tren rayları gibi hiç kesişmeyen, hep aynı uzaklıkta iki çizgi nasıldır?', secenekler: ['Paralel', 'Dik', 'Eğri', 'Kesişen'] },
    en: { soru: 'Two lines that never cross and stay the same distance apart, like train rails, are what?', secenekler: ['Parallel', 'Perpendicular', 'Curved', 'Crossing'] }
  },
  {
    id: 'dikey', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Yukarıdan aşağıya, ayakta duran çizgiye ne denir?', secenekler: ['Dikey', 'Yatay', 'Eğri', 'Nokta'] },
    en: { soru: 'What is a line that stands up and down called?', secenekler: ['Vertical', 'Horizontal', 'Curved', 'A point'] }
  },
  {
    id: 'yaricap', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Dairenin tam ortasından kenarına olan uzaklığa ne denir?', secenekler: ['Yarıçap', 'Köşe', 'Açı', 'Kenar'] },
    en: { soru: 'What is the distance from the center of a circle to its edge called?', secenekler: ['Radius', 'Corner', 'Angle', 'Side'] }
  }
];
