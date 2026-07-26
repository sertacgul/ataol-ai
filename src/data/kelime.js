/**
 * Turkce ve kelime oyunlari. muhendislik.js / geometri.js ile ayni yapida
 * (iki dilli, dogru = karistirmadan onceki indeks), ayni quiz motoruyla
 * gosterilir. TR sorulari Turkce kelime bilgisi; EN sorulari Ingilizce
 * karsilik degil, o dile uygun kendi kelime oyunudur.
 *
 * Kategoriler: zit (zit anlam), esanlam (es anlam), okuma (kisa metin +
 * soru), bilgi (kelime/dil bilgisi).
 */

export const KELIME_SORULAR = [
  // --- Zit anlam ---
  {
    id: 'zit-buyuk', kategori: 'zit', dogru: 0,
    tr: { soru: '"Büyük" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Küçük', 'Kocaman', 'Uzun', 'Geniş'] },
    en: { soru: 'What is the opposite of "big"?', secenekler: ['Small', 'Huge', 'Tall', 'Wide'] }
  },
  {
    id: 'zit-sicak', kategori: 'zit', dogru: 1,
    tr: { soru: '"Sıcak" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Ilık', 'Soğuk', 'Yumuşak', 'Parlak'] },
    en: { soru: 'What is the opposite of "hot"?', secenekler: ['Warm', 'Cold', 'Soft', 'Bright'] }
  },
  {
    id: 'zit-hizli', kategori: 'zit', dogru: 2,
    tr: { soru: '"Hızlı" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Çevik', 'Atik', 'Yavaş', 'Erken'] },
    en: { soru: 'What is the opposite of "fast"?', secenekler: ['Quick', 'Nimble', 'Slow', 'Early'] }
  },
  {
    id: 'zit-acik', kategori: 'zit', dogru: 0,
    tr: { soru: '"Açık" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Kapalı', 'Geniş', 'Temiz', 'Boş'] },
    en: { soru: 'What is the opposite of "open"?', secenekler: ['Closed', 'Wide', 'Clean', 'Empty'] }
  },
  {
    id: 'zit-mutlu', kategori: 'zit', dogru: 3,
    tr: { soru: '"Mutlu" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Neşeli', 'Keyifli', 'Güleç', 'Üzgün'] },
    en: { soru: 'What is the opposite of "happy"?', secenekler: ['Cheerful', 'Joyful', 'Merry', 'Sad'] }
  },
  {
    id: 'zit-gece', kategori: 'zit', dogru: 1,
    tr: { soru: '"Gece" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Akşam', 'Gündüz', 'Sabah', 'Öğle'] },
    en: { soru: 'What is the opposite of "night"?', secenekler: ['Evening', 'Day', 'Morning', 'Noon'] }
  },
  {
    id: 'zit-dolu', kategori: 'zit', dogru: 2,
    tr: { soru: '"Dolu" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Ağır', 'Taşkın', 'Boş', 'Sıkı'] },
    en: { soru: 'What is the opposite of "full"?', secenekler: ['Heavy', 'Packed', 'Empty', 'Tight'] }
  },

  // --- Es anlam ---
  {
    id: 'es-ev', kategori: 'esanlam', dogru: 0,
    tr: { soru: '"Ev" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Konut', 'Bahçe', 'Sokak', 'Oda'] },
    en: { soru: 'Which word means the same as "home"?', secenekler: ['House', 'Garden', 'Street', 'Room'] }
  },
  {
    id: 'es-akilli', kategori: 'esanlam', dogru: 1,
    tr: { soru: '"Akıllı" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Hızlı', 'Zeki', 'Güçlü', 'Uzun'] },
    en: { soru: 'Which word means the same as "smart"?', secenekler: ['Fast', 'Clever', 'Strong', 'Tall'] }
  },
  {
    id: 'es-cocuk', kategori: 'esanlam', dogru: 2,
    tr: { soru: '"Çocuk" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Yetişkin', 'Dede', 'Çağ', 'Bebek'] },
    en: { soru: 'Which word means about the same as "kid"?', secenekler: ['Adult', 'Grandpa', 'Age', 'Child'] }
  },
  {
    id: 'es-yol', kategori: 'esanlam', dogru: 0,
    tr: { soru: '"Yol" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Cadde', 'Dağ', 'Deniz', 'Köprü'] },
    en: { soru: 'Which word means the same as "road"?', secenekler: ['Street', 'Mountain', 'Sea', 'Bridge'] }
  },
  {
    id: 'es-guzel', kategori: 'esanlam', dogru: 3,
    tr: { soru: '"Güzel" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Büyük', 'Hızlı', 'Sıcak', 'Hoş'] },
    en: { soru: 'Which word means the same as "beautiful"?', secenekler: ['Big', 'Fast', 'Hot', 'Lovely'] }
  },
  {
    id: 'es-hediye', kategori: 'esanlam', dogru: 1,
    tr: { soru: '"Hediye" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Kutu', 'Armağan', 'Para', 'Kart'] },
    en: { soru: 'Which word means the same as "gift"?', secenekler: ['Box', 'Present', 'Money', 'Card'] }
  },

  // --- Okuma-anlama ---
  {
    id: 'oku-top', kategori: 'okuma', dogru: 0,
    tr: { soru: 'Ali topu Ayşe\'ye attı. Topu kim attı?', secenekler: ['Ali', 'Ayşe', 'Top', 'Öğretmen'] },
    en: { soru: 'Ali threw the ball to Ayse. Who threw the ball?', secenekler: ['Ali', 'Ayse', 'The ball', 'The teacher'] }
  },
  {
    id: 'oku-kedi', kategori: 'okuma', dogru: 1,
    tr: { soru: 'Kedi ağaca tırmandı ve bir kuş gördü. Kedi neye tırmandı?', secenekler: ['Çatıya', 'Ağaca', 'Duvara', 'Merdivene'] },
    en: { soru: 'The cat climbed the tree and saw a bird. What did the cat climb?', secenekler: ['The roof', 'The tree', 'The wall', 'The ladder'] }
  },
  {
    id: 'oku-yagmur', kategori: 'okuma', dogru: 2,
    tr: { soru: 'Yağmur yağınca Deniz şemsiyesini açtı. Deniz neden şemsiye açtı?', secenekler: ['Güneş açtı', 'Kar yağdı', 'Yağmur yağdı', 'Rüzgar esti'] },
    en: { soru: 'When it rained, Deniz opened an umbrella. Why did Deniz open it?', secenekler: ['It was sunny', 'It snowed', 'It rained', 'It was windy'] }
  },
  {
    id: 'oku-market', kategori: 'okuma', dogru: 3,
    tr: { soru: 'Anne markete gitti ve ekmek ile süt aldı. Anne kaç şey aldı?', secenekler: ['Sıfır', 'Bir', 'Üç', 'İki'] },
    en: { soru: 'Mother went to the store and bought bread and milk. How many things did she buy?', secenekler: ['Zero', 'One', 'Three', 'Two'] }
  },
  {
    id: 'oku-bahce', kategori: 'okuma', dogru: 0,
    tr: { soru: 'Can bahçede kırmızı bir çiçek dikti. Çiçek ne renk?', secenekler: ['Kırmızı', 'Mavi', 'Sarı', 'Yeşil'] },
    en: { soru: 'Can planted a red flower in the garden. What color is the flower?', secenekler: ['Red', 'Blue', 'Yellow', 'Green'] }
  },
  {
    id: 'oku-okul', kategori: 'okuma', dogru: 1,
    tr: { soru: 'Zeynep sabah erken kalktı çünkü okula gidecekti. Zeynep nereye gidecekti?', secenekler: ['Parka', 'Okula', 'Eve', 'Markete'] },
    en: { soru: 'Zeynep woke up early because she was going to school. Where was she going?', secenekler: ['The park', 'School', 'Home', 'The store'] }
  },

  // --- Kelime / dil bilgisi ---
  {
    id: 'bilgi-cogul', kategori: 'bilgi', dogru: 0,
    tr: { soru: '"Kitaplar" kelimesi kaç kitabı anlatır?', secenekler: ['Birden çok', 'Sadece bir', 'Hiç', 'Yarım'] },
    en: { soru: 'How many books does the word "books" describe?', secenekler: ['More than one', 'Only one', 'None', 'Half'] }
  },
  {
    id: 'bilgi-sifat', kategori: 'bilgi', dogru: 2,
    tr: { soru: '"Kırmızı elma" sözünde elmayı anlatan (niteleyen) kelime hangisi?', secenekler: ['Elma', 'Ve', 'Kırmızı', 'Bir'] },
    en: { soru: 'In "red apple", which word describes the apple?', secenekler: ['Apple', 'And', 'Red', 'A'] }
  },
  {
    id: 'bilgi-fiil', kategori: 'bilgi', dogru: 1,
    tr: { soru: 'Hangisi bir hareket (fiil) bildirir?', secenekler: ['Masa', 'Koşmak', 'Sarı', 'Taş'] },
    en: { soru: 'Which one shows an action (a verb)?', secenekler: ['Table', 'Run', 'Yellow', 'Stone'] }
  },
  {
    id: 'bilgi-buyukharf', kategori: 'bilgi', dogru: 3,
    tr: { soru: 'Cümle her zaman hangisiyle başlar?', secenekler: ['Küçük harf', 'Rakam', 'Boşluk', 'Büyük harf'] },
    en: { soru: 'A sentence always starts with what?', secenekler: ['Lowercase', 'A number', 'A space', 'A capital letter'] }
  },
  {
    id: 'bilgi-heceli', kategori: 'bilgi', dogru: 0,
    tr: { soru: '"Elma" kelimesi kaç hecelidir?', secenekler: ['İki', 'Bir', 'Üç', 'Dört'] },
    en: { soru: 'How many syllables are in "apple" (ap-ple)?', secenekler: ['Two', 'One', 'Three', 'Four'] }
  }
];
