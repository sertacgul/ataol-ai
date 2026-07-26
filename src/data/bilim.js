/**
 * Bilim sorulari. muhendislik.js / geometri.js / kelime.js ile ayni yapida,
 * ayni quiz motoruyla gosterilir. Iki dilli, dogru = karistirmadan onceki
 * indeks.
 *
 * Kategoriler: canli (canlilar), madde (madde ve halleri), kuvvet (kuvvet
 * ve hareket), uzay (gezegenler ve gokyuzu).
 */

export const BILIM_SORULAR = [
  // --- Canlilar ---
  {
    id: 'canli-nefes', kategori: 'canli', dogru: 0,
    tr: { soru: 'Balıklar su altında ne ile nefes alır?', secenekler: ['Solungaç', 'Akciğer', 'Burun', 'Deri'] },
    en: { soru: 'What do fish use to breathe underwater?', secenekler: ['Gills', 'Lungs', 'Nose', 'Skin'] }
  },
  {
    id: 'canli-bitki', kategori: 'canli', dogru: 1,
    tr: { soru: 'Bitkiler büyümek için en çok neye ihtiyaç duyar?', secenekler: ['Karanlık', 'Güneş ışığı', 'Şeker', 'Gürültü'] },
    en: { soru: 'What do plants need most to grow?', secenekler: ['Darkness', 'Sunlight', 'Sugar', 'Noise'] }
  },
  {
    id: 'canli-kelebek', kategori: 'canli', dogru: 2,
    tr: { soru: 'Tırtıl büyüyünce neye dönüşür?', secenekler: ['Arı', 'Kuş', 'Kelebek', 'Karınca'] },
    en: { soru: 'What does a caterpillar turn into?', secenekler: ['A bee', 'A bird', 'A butterfly', 'An ant'] }
  },
  {
    id: 'canli-memeli', kategori: 'canli', dogru: 3,
    tr: { soru: 'Hangisi yavrusunu sütle besler?', secenekler: ['Balık', 'Kurbağa', 'Yılan', 'Kedi'] },
    en: { soru: 'Which one feeds its baby with milk?', secenekler: ['Fish', 'Frog', 'Snake', 'Cat'] }
  },

  // --- Madde ---
  {
    id: 'madde-buz', kategori: 'madde', dogru: 0,
    tr: { soru: 'Su donunca ne olur?', secenekler: ['Buz', 'Buhar', 'Tuz', 'Kar suyu'] },
    en: { soru: 'What does water become when it freezes?', secenekler: ['Ice', 'Steam', 'Salt', 'Rain'] }
  },
  {
    id: 'madde-buhar', kategori: 'madde', dogru: 1,
    tr: { soru: 'Su çok ısınıp kaynayınca neye dönüşür?', secenekler: ['Buz', 'Su buharı', 'Taş', 'Kum'] },
    en: { soru: 'What does water turn into when it boils?', secenekler: ['Ice', 'Water vapor', 'Stone', 'Sand'] }
  },
  {
    id: 'madde-hal', kategori: 'madde', dogru: 2,
    tr: { soru: 'Hangisi bir sıvıdır?', secenekler: ['Taş', 'Buz', 'Süt', 'Tahta'] },
    en: { soru: 'Which one is a liquid?', secenekler: ['Stone', 'Ice', 'Milk', 'Wood'] }
  },
  {
    id: 'madde-miknatis', kategori: 'madde', dogru: 3,
    tr: { soru: 'Mıknatıs hangisini kendine çeker?', secenekler: ['Kağıt', 'Tahta', 'Cam', 'Demir'] },
    en: { soru: 'What does a magnet attract?', secenekler: ['Paper', 'Wood', 'Glass', 'Iron'] }
  },

  // --- Kuvvet ve hareket ---
  {
    id: 'kuvvet-yercekimi', kategori: 'kuvvet', dogru: 0,
    tr: { soru: 'Elimizden bıraktığımız top neden yere düşer?', secenekler: ['Yer çekimi', 'Rüzgar', 'Işık', 'Ses'] },
    en: { soru: 'Why does a ball fall to the ground when we drop it?', secenekler: ['Gravity', 'Wind', 'Light', 'Sound'] }
  },
  {
    id: 'kuvvet-surtunme', kategori: 'kuvvet', dogru: 1,
    tr: { soru: 'Buzda yürümek neden kaygandır?', secenekler: ['Çok sürtünme var', 'Az sürtünme var', 'Buz sıcaktır', 'Buz ağırdır'] },
    en: { soru: 'Why is walking on ice slippery?', secenekler: ['Lots of friction', 'Little friction', 'Ice is hot', 'Ice is heavy'] }
  },
  {
    id: 'kuvvet-itmek', kategori: 'kuvvet', dogru: 2,
    tr: { soru: 'Duran bir arabayı hareket ettirmek için ne yaparız?', secenekler: ['Bakarız', 'Sayarız', 'İteriz', 'Bekleriz'] },
    en: { soru: 'What do we do to move a still cart?', secenekler: ['Look at it', 'Count it', 'Push it', 'Wait'] }
  },
  {
    id: 'kuvvet-tekerlek', kategori: 'kuvvet', dogru: 3,
    tr: { soru: 'Ağır bir kutuyu taşımayı ne kolaylaştırır?', secenekler: ['Köşeler', 'Ağırlık', 'Karanlık', 'Tekerlekler'] },
    en: { soru: 'What makes moving a heavy box easier?', secenekler: ['Corners', 'Weight', 'Darkness', 'Wheels'] }
  },

  // --- Uzay ---
  {
    id: 'uzay-gunes', kategori: 'uzay', dogru: 0,
    tr: { soru: 'Gündüz gökyüzünü aydınlatan nedir?', secenekler: ['Güneş', 'Ay', 'Yıldızlar', 'Bulut'] },
    en: { soru: 'What lights up the sky during the day?', secenekler: ['The Sun', 'The Moon', 'Stars', 'Clouds'] }
  },
  {
    id: 'uzay-dunya', kategori: 'uzay', dogru: 1,
    tr: { soru: 'Üzerinde yaşadığımız gezegenin adı nedir?', secenekler: ['Mars', 'Dünya', 'Ay', 'Güneş'] },
    en: { soru: 'What is the name of the planet we live on?', secenekler: ['Mars', 'Earth', 'The Moon', 'The Sun'] }
  },
  {
    id: 'uzay-ay', kategori: 'uzay', dogru: 2,
    tr: { soru: 'Geceleri gökyüzünde en çok hangisini görürüz?', secenekler: ['Güneş', 'Gökkuşağı', 'Ay ve yıldızlar', 'Bulut'] },
    en: { soru: 'What do we mostly see in the sky at night?', secenekler: ['The Sun', 'A rainbow', 'The Moon and stars', 'Clouds'] }
  },
  {
    id: 'uzay-mevsim', kategori: 'uzay', dogru: 3,
    tr: { soru: 'Bir yılda kaç mevsim vardır?', secenekler: ['İki', 'Üç', 'Altı', 'Dört'] },
    en: { soru: 'How many seasons are there in a year?', secenekler: ['Two', 'Three', 'Six', 'Four'] }
  }
];
