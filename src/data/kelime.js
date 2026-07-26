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
  },

  // --- Zit anlam (devam) ---
  {
    id: 'zit-guzel', kategori: 'zit', dogru: 0,
    tr: { soru: '"Güzel" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Çirkin', 'Hoş', 'Şirin', 'Temiz'] },
    en: { soru: 'What is the opposite of "beautiful"?', secenekler: ['Ugly', 'Lovely', 'Cute', 'Clean'] }
  },
  {
    id: 'zit-uzun', kategori: 'zit', dogru: 1,
    tr: { soru: '"Uzun" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Geniş', 'Kısa', 'İnce', 'Derin'] },
    en: { soru: 'What is the opposite of "long"?', secenekler: ['Wide', 'Short', 'Thin', 'Deep'] }
  },
  {
    id: 'zit-yeni', kategori: 'zit', dogru: 2,
    tr: { soru: '"Yeni" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Taze', 'Parlak', 'Eski', 'Temiz'] },
    en: { soru: 'What is the opposite of "new"?', secenekler: ['Fresh', 'Shiny', 'Old', 'Clean'] }
  },
  {
    id: 'zit-agir', kategori: 'zit', dogru: 3,
    tr: { soru: '"Ağır" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Kalın', 'Sert', 'Büyük', 'Hafif'] },
    en: { soru: 'What is the opposite of "heavy"?', secenekler: ['Thick', 'Hard', 'Big', 'Light'] }
  },
  {
    id: 'zit-temiz', kategori: 'zit', dogru: 0,
    tr: { soru: '"Temiz" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Kirli', 'Parlak', 'Islak', 'Yeni'] },
    en: { soru: 'What is the opposite of "clean"?', secenekler: ['Dirty', 'Shiny', 'Wet', 'New'] }
  },
  {
    id: 'zit-yukari', kategori: 'zit', dogru: 1,
    tr: { soru: '"Yukarı" kelimesinin zıt anlamlısı hangisi?', secenekler: ['İleri', 'Aşağı', 'Sağ', 'Yan'] },
    en: { soru: 'What is the opposite of "up"?', secenekler: ['Forward', 'Down', 'Right', 'Beside'] }
  },
  {
    id: 'zit-ileri', kategori: 'zit', dogru: 2,
    tr: { soru: '"İleri" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Yukarı', 'Sağ', 'Geri', 'Uzak'] },
    en: { soru: 'What is the opposite of "forward"?', secenekler: ['Up', 'Right', 'Back', 'Far'] }
  },
  {
    id: 'zit-zengin', kategori: 'zit', dogru: 3,
    tr: { soru: '"Zengin" kelimesinin zıt anlamlısı hangisi?', secenekler: ['Cömert', 'Mutlu', 'Güçlü', 'Fakir'] },
    en: { soru: 'What is the opposite of "rich"?', secenekler: ['Generous', 'Happy', 'Strong', 'Poor'] }
  },

  // --- Es anlam (devam) ---
  {
    id: 'es-kocaman', kategori: 'esanlam', dogru: 0,
    tr: { soru: '"Kocaman" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Büyük', 'Küçük', 'İnce', 'Kısa'] },
    en: { soru: 'Which word means the same as "huge"?', secenekler: ['Big', 'Small', 'Thin', 'Short'] }
  },
  {
    id: 'es-cabuk', kategori: 'esanlam', dogru: 1,
    tr: { soru: '"Çabuk" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Yavaş', 'Hızlı', 'Ağır', 'Sakin'] },
    en: { soru: 'Which word means the same as "quick"?', secenekler: ['Slow', 'Fast', 'Heavy', 'Calm'] }
  },
  {
    id: 'es-ihtiyar', kategori: 'esanlam', dogru: 2,
    tr: { soru: '"İhtiyar" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Genç', 'Bebek', 'Yaşlı', 'Küçük'] },
    en: { soru: 'Which word means the same as "elderly"?', secenekler: ['Young', 'Baby', 'Old', 'Little'] }
  },
  {
    id: 'es-hekim', kategori: 'esanlam', dogru: 0,
    tr: { soru: '"Hekim" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Doktor', 'Hemşire', 'Öğretmen', 'Şoför'] },
    en: { soru: 'Which word means the same as "physician"?', secenekler: ['Doctor', 'Nurse', 'Teacher', 'Driver'] }
  },
  {
    id: 'es-konuk', kategori: 'esanlam', dogru: 1,
    tr: { soru: '"Konuk" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Komşu', 'Misafir', 'Yabancı', 'Arkadaş'] },
    en: { soru: 'Which word means the same as "guest"?', secenekler: ['Neighbor', 'Visitor', 'Stranger', 'Friend'] }
  },
  {
    id: 'es-yanit', kategori: 'esanlam', dogru: 2,
    tr: { soru: '"Yanıt" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Soru', 'Sözcük', 'Cevap', 'Selam'] },
    en: { soru: 'Which word means the same as "answer"?', secenekler: ['Question', 'Word', 'Reply', 'Hello'] }
  },
  {
    id: 'es-nese', kategori: 'esanlam', dogru: 3,
    tr: { soru: '"Neşe" kelimesiyle aynı anlama gelen hangisi?', secenekler: ['Üzüntü', 'Korku', 'Öfke', 'Sevinç'] },
    en: { soru: 'Which word means the same as "joy"?', secenekler: ['Sorrow', 'Fear', 'Anger', 'Cheer'] }
  },

  // --- Okuma-anlama (devam) ---
  {
    id: 'oku-kus', kategori: 'okuma', dogru: 0,
    tr: { soru: 'Küçük kuş yuvasına döndü ve yavrularını besledi. Kuş kimi besledi?', secenekler: ['Yavrularını', 'Anneyi', 'Kediyi', 'Ağacı'] },
    en: { soru: 'The little bird returned to its nest and fed its chicks. Whom did the bird feed?', secenekler: ['Its chicks', 'The mother', 'The cat', 'The tree'] }
  },
  {
    id: 'oku-karne', kategori: 'okuma', dogru: 1,
    tr: { soru: 'Elif çok çalıştı ve sınavdan yüksek not aldı. Elif neden yüksek not aldı?', secenekler: ['Şans eseri', 'Çok çalıştığı için', 'Uyuduğu için', 'Oynadığı için'] },
    en: { soru: 'Elif studied hard and got a high grade. Why did she get a high grade?', secenekler: ['By luck', 'Because she studied hard', 'Because she slept', 'Because she played'] }
  },
  {
    id: 'oku-kar', kategori: 'okuma', dogru: 2,
    tr: { soru: 'Kış geldi, her yer bembeyaz oldu. Her yeri ne beyaza boyadı?', secenekler: ['Boya', 'Bulut', 'Kar', 'Un'] },
    en: { soru: 'Winter came and everywhere turned white. What made everything white?', secenekler: ['Paint', 'A cloud', 'Snow', 'Flour'] }
  },
  {
    id: 'oku-bisiklet', kategori: 'okuma', dogru: 3,
    tr: { soru: 'Mert yeni bisikletiyle parka gitti ve arkadaşlarıyla oynadı. Mert nereye gitti?', secenekler: ['Okula', 'Eve', 'Markete', 'Parka'] },
    en: { soru: 'Mert rode his new bike to the park and played with friends. Where did Mert go?', secenekler: ['School', 'Home', 'The store', 'The park'] }
  },
  {
    id: 'oku-tohum', kategori: 'okuma', dogru: 0,
    tr: { soru: 'Ayşe toprağa bir tohum ekti, her gün suladı ve tohum büyüdü. Tohum neden büyüdü?', secenekler: ['Sulandığı için', 'Konuştuğu için', 'Karanlıkta durduğu için', 'Kırıldığı için'] },
    en: { soru: 'Ayse planted a seed, watered it every day, and it grew. Why did the seed grow?', secenekler: ['Because it was watered', 'Because it talked', 'Because it stayed dark', 'Because it broke'] }
  },

  // --- Kelime bilgisi (devam) ---
  {
    id: 'bilgi-sesli', kategori: 'bilgi', dogru: 0,
    tr: { soru: 'Hangisi bir sesli (ünlü) harftir?', secenekler: ['A', 'B', 'K', 'T'] },
    en: { soru: 'Which one is a vowel?', secenekler: ['A', 'B', 'K', 'T'] }
  },
  {
    id: 'bilgi-sessiz', kategori: 'bilgi', dogru: 1,
    tr: { soru: 'Hangisi bir sessiz (ünsüz) harftir?', secenekler: ['E', 'M', 'O', 'U'] },
    en: { soru: 'Which one is a consonant?', secenekler: ['E', 'M', 'O', 'U'] }
  },
  {
    id: 'bilgi-soru', kategori: 'bilgi', dogru: 2,
    tr: { soru: 'Bir soru cümlesinin sonuna hangi işaret konur?', secenekler: ['Nokta (.)', 'Virgül (,)', 'Soru işareti (?)', 'Ünlem (!)'] },
    en: { soru: 'Which mark goes at the end of a question?', secenekler: ['Period (.)', 'Comma (,)', 'Question mark (?)', 'Exclamation (!)'] }
  },
  {
    id: 'bilgi-nokta', kategori: 'bilgi', dogru: 3,
    tr: { soru: 'Düz bir cümlenin (haber cümlesi) sonuna ne konur?', secenekler: ['Soru işareti', 'İki nokta', 'Ünlem', 'Nokta'] },
    en: { soru: 'What goes at the end of a plain telling sentence?', secenekler: ['Question mark', 'Colon', 'Exclamation', 'Period'] }
  },
  {
    id: 'bilgi-alfabe', kategori: 'bilgi', dogru: 0,
    tr: { soru: 'Alfabetik sırada hangi kelime önce gelir?', secenekler: ['Armut', 'Elma', 'Karpuz', 'Üzüm'] },
    en: { soru: 'In alphabetical order, which word comes first?', secenekler: ['Apple', 'Cherry', 'Melon', 'Pear'] }
  },
  {
    id: 'bilgi-tekil', kategori: 'bilgi', dogru: 1,
    tr: { soru: 'Hangisi tek bir varlığı anlatır (tekildir)?', secenekler: ['Çocuklar', 'Kalem', 'Evler', 'Kuşlar'] },
    en: { soru: 'Which word describes just one thing (singular)?', secenekler: ['Children', 'Pencil', 'Houses', 'Birds'] }
  },
  {
    id: 'bilgi-hece-iki', kategori: 'bilgi', dogru: 2,
    tr: { soru: '"Kalem" kelimesi kaç hecelidir? (ka-lem)', secenekler: ['Bir', 'Üç', 'İki', 'Dört'] },
    en: { soru: 'How many syllables are in "pencil" (pen-cil)?', secenekler: ['One', 'Three', 'Two', 'Four'] }
  }
];
