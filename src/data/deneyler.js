/**
 * Evde yapilabilecek guvenli fen deneyleri. Kahraman kartlari gibi tek tek
 * gezilir. Her deney: malzemeler, adimlar ve "neden oluyor" aciklamasi.
 *
 * Guvenlik: hepsi mutfak/oda malzemesiyle, ates/kesici/kimyasal yok. Yine de
 * "bir buyukle birlikte yap" notu her deneyde var (aciklamada degil, UI'da
 * ortak not olarak).
 */

export const DENEYLER = [
  {
    id: 'volkan', emoji: '🌋',
    tr: {
      ad: 'Kabartma Tozu Volkanı',
      malzemeler: ['Küçük bardak', 'Karbonat (kabartma tozu)', 'Sirke', 'Bulaşık deterjanı', 'Biraz gıda boyası'],
      adimlar: [
        'Bardağa 2 kaşık karbonat koy.',
        'Üzerine biraz bulaşık deterjanı ve gıda boyası ekle.',
        'Sonra hızlıca biraz sirke dök.',
        'Köpüğün bardaktan taşmasını izle.'
      ],
      neden: 'Karbonat ile sirke birbirine değince karbondioksit gazı oluşur. Gaz kabarcıkları deterjanla köpük yapar ve volkan gibi taşar.'
    },
    en: {
      ad: 'Baking Soda Volcano',
      malzemeler: ['A small cup', 'Baking soda', 'Vinegar', 'Dish soap', 'A little food coloring'],
      adimlar: [
        'Put 2 spoons of baking soda in the cup.',
        'Add a little dish soap and food coloring.',
        'Then quickly pour in some vinegar.',
        'Watch the foam overflow like a volcano.'
      ],
      neden: 'When baking soda meets vinegar, carbon dioxide gas forms. The gas bubbles mix with the soap to make foam that overflows like a volcano.'
    }
  },
  {
    id: 'batar-yuzer', emoji: '🍎',
    tr: {
      ad: 'Batar mı, Yüzer mi?',
      malzemeler: ['Büyük bir kase su', 'Elma', 'Taş', 'Plastik kapak', 'Kaşık'],
      adimlar: [
        'Kaseyi suyla doldur.',
        'Her nesneyi tek tek suya koy.',
        'Batar mı yüzer mi önce tahmin et, sonra dene.',
        'Hangileri yüzdü, hangileri battı listele.'
      ],
      neden: 'Suya göre hafif olan nesneler yüzer, ağır olanlar batar. Elma içi hava dolu olduğu için yüzer, taş yoğun olduğu için batar.'
    },
    en: {
      ad: 'Sink or Float?',
      malzemeler: ['A big bowl of water', 'An apple', 'A stone', 'A plastic lid', 'A spoon'],
      adimlar: [
        'Fill the bowl with water.',
        'Put each object in the water one by one.',
        'Guess sink or float first, then try it.',
        'List which ones floated and which sank.'
      ],
      neden: 'Objects lighter than water float, heavier ones sink. An apple has air inside so it floats, a stone is dense so it sinks.'
    }
  },
  {
    id: 'golge', emoji: '🔦',
    tr: {
      ad: 'Gölge Nasıl Büyür?',
      malzemeler: ['El feneri (ya da telefon ışığı)', 'Küçük oyuncak', 'Beyaz duvar ya da kağıt'],
      adimlar: [
        'Odayı biraz karart.',
        'Oyuncağı duvarın önüne koy.',
        'Işığı oyuncağa tut, duvardaki gölgeye bak.',
        'Işığı yaklaştır ve uzaklaştır; gölge nasıl değişiyor gör.'
      ],
      neden: 'Işık düz gider. Oyuncak ışığı engelleyince arkasında gölge oluşur. Işık yaklaşınca gölge büyür, uzaklaşınca küçülür.'
    },
    en: {
      ad: 'How Does a Shadow Grow?',
      malzemeler: ['A flashlight (or phone light)', 'A small toy', 'A white wall or paper'],
      adimlar: [
        'Dim the room a little.',
        'Put the toy in front of the wall.',
        'Shine the light on the toy and look at the shadow.',
        'Move the light closer and farther; watch the shadow change.'
      ],
      neden: 'Light travels straight. When the toy blocks the light, a shadow forms behind it. The shadow grows when the light is close and shrinks when it is far.'
    }
  },
  {
    id: 'gokkusagi', emoji: '🌈',
    tr: {
      ad: 'Kağıt Havlu Gökkuşağı',
      malzemeler: ['Kağıt havlu', 'İki bardak', 'Su', 'Farklı renk keçeli kalemler'],
      adimlar: [
        'Kağıt havlunun iki ucuna farklı renklerle noktalar çiz.',
        'İki bardağı yan yana koy, birine biraz su doldur.',
        'Havlunun bir ucunu sulu bardağa, diğerini boş bardağa koy.',
        'Renklerin su ile havluda yürümesini izle.'
      ],
      neden: 'Su, kağıt havludaki küçük boşluklardan yukarı ve boyaların içinden yürür. Buna kılcallık denir; renkler suyla birlikte taşınır.'
    },
    en: {
      ad: 'Paper Towel Rainbow',
      malzemeler: ['Paper towel', 'Two cups', 'Water', 'Different color markers'],
      adimlar: [
        'Draw dots of different colors on both ends of the paper towel.',
        'Place the two cups side by side, fill one with water.',
        'Put one end of the towel in the water cup, the other in the empty cup.',
        'Watch the colors travel along the towel with the water.'
      ],
      neden: 'Water climbs up through the tiny gaps in the paper towel and carries the colors. This is called capillary action.'
    }
  },
  {
    id: 'balon', emoji: '🎈',
    tr: {
      ad: 'Sihirli Balon (Statik Elektrik)',
      malzemeler: ['Bir balon', 'Yün kazak ya da saç', 'Küçük kağıt parçaları'],
      adimlar: [
        'Balonu şişir ve ağzını bağla.',
        'Balonu saçına ya da yün kazağa 10 saniye sürt.',
        'Balonu küçük kağıt parçalarına yaklaştır.',
        'Kağıtların balona zıpladığını izle.'
      ],
      neden: 'Sürtünce balon statik elektrik yüklenir. Bu yük küçük kağıtları kendine çeker, tıpkı görünmez bir mıknatıs gibi.'
    },
    en: {
      ad: 'Magic Balloon (Static Electricity)',
      malzemeler: ['A balloon', 'A wool sweater or hair', 'Small pieces of paper'],
      adimlar: [
        'Blow up the balloon and tie it.',
        'Rub the balloon on your hair or a wool sweater for 10 seconds.',
        'Bring the balloon close to the small paper pieces.',
        'Watch the papers jump up to the balloon.'
      ],
      neden: 'Rubbing gives the balloon static electricity. This charge pulls the small papers toward it, like an invisible magnet.'
    }
  }
];

export function deneySayisi() {
  return DENEYLER.length;
}
