// THEME 1: SCHOOL LIFE kelimeleri.
//
// Alt temalar (MEB plani): okuldaki kisiler, yerler ve kurallar; okul
// esyalari; okul kulupleri; ulkeler; milli gunler ve kutlamalar.
//
// id alani en alanindan kelimeKimligi() ile turetilir ama BURAYA YAZILIR:
// boylece bir yazim duzeltilse bile ses dosyasi adi ve cocugun ilerlemesi
// kopmaz. Testi bu tutarliligi kontrol ediyor.
//
// gorsel.tip 'emoji' ise deger dogrudan basilir; 'cizim' ise ad
// src/ui/gorsel/ingilizce.js icindeki kayit defterine bakar (sonraki fazda
// eklenecek). Kotu/muglak bir emoji zorlamak yerine cizim tercih edildi:
// principal, caretaker, classroom, corridor, eraser, rule, be on time,
// raise your hand, club, ceremony, flag (kirmizi bayrak = uyari emojisi
// ile karisir), gym (agirlik kaldirma emojisi orneği "oyun oynariz" ile
// celisir), friend (coklu-kisi ZWJ dizisi eski cihazlarda guvenilir
// gorunmuyor).

export default [
  // --- Okuldaki kisiler ---
  {
    id: 'teacher', en: 'teacher', tr: 'öğretmen', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '👩‍🏫' },
    ornek: { en: 'My teacher is very kind.', tr: 'Öğretmenim çok nazik.' }
  },
  {
    id: 'student', en: 'student', tr: 'öğrenci', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🧑‍🎓' },
    ornek: { en: 'The student is reading a book.', tr: 'Öğrenci bir kitap okuyor.' }
  },
  {
    id: 'principal', en: 'principal', tr: 'müdür', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'okul-muduru' },
    ornek: { en: 'The principal is in the office.', tr: 'Müdür ofiste.' }
  },
  {
    id: 'classmate', en: 'classmate', tr: 'sınıf arkadaşı', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '👥' },
    ornek: { en: 'She is my classmate.', tr: 'O benim sınıf arkadaşım.' }
  },
  {
    id: 'friend', en: 'friend', tr: 'arkadaş', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'arkadas' },
    ornek: { en: 'He is my best friend.', tr: 'O benim en iyi arkadaşım.' }
  },
  {
    id: 'caretaker', en: 'caretaker', tr: 'hizmetli', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'okul-hizmetlisi' },
    ornek: { en: 'The caretaker cleans the school.', tr: 'Hizmetli okulu temizler.' }
  },

  // --- Okuldaki yerler ---
  {
    id: 'school', en: 'school', tr: 'okul', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🏫' },
    ornek: { en: 'I go to school every day.', tr: 'Her gün okula giderim.' }
  },
  {
    id: 'classroom', en: 'classroom', tr: 'sınıf', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'sinif' },
    ornek: { en: 'Our classroom is big and bright.', tr: 'Sınıfımız büyük ve aydınlık.' }
  },
  {
    id: 'library', en: 'library', tr: 'kütüphane', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '📚' },
    ornek: { en: 'We read books in the library.', tr: 'Kütüphanede kitap okuruz.' }
  },
  {
    id: 'canteen', en: 'canteen', tr: 'kantin', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🍽️' },
    ornek: { en: 'We eat lunch in the canteen.', tr: 'Kantinde öğle yemeği yeriz.' }
  },
  {
    id: 'playground', en: 'playground', tr: 'oyun alanı', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🛝' },
    ornek: { en: 'The children are playing in the playground.', tr: 'Çocuklar oyun alanında oynuyor.' }
  },
  {
    id: 'gym', en: 'gym', tr: 'spor salonu', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'spor-salonu' },
    ornek: { en: 'We play games in the gym.', tr: 'Spor salonunda oyunlar oynarız.' }
  },
  {
    id: 'laboratory', en: 'laboratory', tr: 'laboratuvar', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🧪' },
    ornek: { en: 'We do experiments in the laboratory.', tr: 'Laboratuvarda deneyler yaparız.' }
  },
  {
    id: 'corridor', en: 'corridor', tr: 'koridor', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'koridor' },
    ornek: { en: "Please don't run in the corridor.", tr: 'Lütfen koridorda koşma.' }
  },

  // --- Okul esyalari ---
  {
    id: 'school-bag', en: 'school bag', tr: 'okul çantası', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎒' },
    ornek: { en: 'My school bag is red.', tr: 'Okul çantam kırmızı.' }
  },
  {
    id: 'book', en: 'book', tr: 'kitap', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '📖' },
    ornek: { en: 'I am reading a book.', tr: 'Bir kitap okuyorum.' }
  },
  {
    id: 'notebook', en: 'notebook', tr: 'defter', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '📓' },
    ornek: { en: 'I write in my notebook.', tr: 'Defterime yazarım.' }
  },
  {
    id: 'pencil', en: 'pencil', tr: 'kurşun kalem', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '✏️' },
    ornek: { en: 'My pencil is short.', tr: 'Kurşun kalemim kısa.' }
  },
  {
    id: 'pen', en: 'pen', tr: 'tükenmez kalem', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🖊️' },
    ornek: { en: 'I write with a pen.', tr: 'Tükenmez kalemle yazarım.' }
  },
  {
    id: 'eraser', en: 'eraser', tr: 'silgi', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'silgi' },
    ornek: { en: 'Can I borrow your eraser?', tr: 'Silgini ödünç alabilir miyim?' }
  },
  {
    id: 'ruler', en: 'ruler', tr: 'cetvel', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '📏' },
    ornek: { en: 'I measure the line with a ruler.', tr: 'Çizgiyi bir cetvelle ölçerim.' }
  },

  // --- Kurallar ---
  {
    id: 'rule', en: 'rule', tr: 'kural', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'kural' },
    ornek: { en: 'This is an important school rule.', tr: 'Bu önemli bir okul kuralı.' }
  },
  {
    id: 'listen', en: 'listen', tr: 'dinle', tema: 1, tur: 'fiil',
    gorsel: { tip: 'emoji', deger: '👂' },
    ornek: { en: 'Listen to your teacher, please.', tr: 'Lütfen öğretmenini dinle.' }
  },
  {
    id: 'speak', en: 'speak', tr: 'konuş', tema: 1, tur: 'fiil',
    gorsel: { tip: 'emoji', deger: '🗣️' },
    ornek: { en: 'Please speak slowly.', tr: 'Lütfen yavaş konuş.' }
  },
  {
    id: 'run', en: 'run', tr: 'koş', tema: 1, tur: 'fiil',
    gorsel: { tip: 'emoji', deger: '🏃' },
    ornek: { en: "Don't run in the classroom.", tr: 'Sınıfta koşma.' }
  },
  {
    id: 'be-quiet', en: 'be quiet', tr: 'sessiz ol', tema: 1, tur: 'ifade',
    gorsel: { tip: 'emoji', deger: '🤫' },
    ornek: { en: 'Be quiet in the library.', tr: 'Kütüphanede sessiz ol.' }
  },
  {
    id: 'be-on-time', en: 'be on time', tr: 'zamanında gel', tema: 1, tur: 'ifade',
    gorsel: { tip: 'cizim', ad: 'zamaninda-ol' },
    ornek: { en: 'Be on time for school.', tr: 'Okula zamanında gel.' }
  },
  {
    id: 'raise-your-hand', en: 'raise your hand', tr: 'elini kaldır', tema: 1, tur: 'ifade',
    gorsel: { tip: 'cizim', ad: 'el-kaldir' },
    ornek: { en: 'Raise your hand before you speak.', tr: 'Konuşmadan önce elini kaldır.' }
  },

  // --- Kulupler ---
  {
    id: 'club', en: 'club', tr: 'kulüp', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'kulup' },
    ornek: { en: 'Our school has many clubs.', tr: 'Okulumuzun birçok kulübü var.' }
  },
  {
    id: 'music-club', en: 'music club', tr: 'müzik kulübü', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎵' },
    ornek: { en: 'I am in the music club.', tr: 'Müzik kulübündeyim.' }
  },
  {
    id: 'chess-club', en: 'chess club', tr: 'satranç kulübü', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '♟️' },
    ornek: { en: 'We play chess in the chess club.', tr: 'Satranç kulübünde satranç oynarız.' }
  },
  {
    id: 'drama-club', en: 'drama club', tr: 'drama kulübü', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎭' },
    ornek: { en: 'She acts in the drama club.', tr: 'O drama kulübünde oyunculuk yapar.' }
  },
  {
    id: 'sports-club', en: 'sports club', tr: 'spor kulübü', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '⚽' },
    ornek: { en: 'He plays football in the sports club.', tr: 'O spor kulübünde futbol oynar.' }
  },
  {
    id: 'art-club', en: 'art club', tr: 'resim kulübü', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎨' },
    ornek: { en: 'We paint pictures in the art club.', tr: 'Resim kulübünde resim yaparız.' }
  },

  // --- Ulkeler ---
  {
    id: 'country', en: 'country', tr: 'ülke', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🗺️' },
    ornek: { en: 'Türkiye is a beautiful country.', tr: 'Türkiye güzel bir ülke.' }
  },
  {
    id: 'turkiye', en: 'Türkiye', tr: 'Türkiye', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇹🇷' },
    ornek: { en: 'I live in Türkiye.', tr: "Türkiye'de yaşıyorum." }
  },
  {
    id: 'england', en: 'England', tr: 'İngiltere', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇬🇧' },
    ornek: { en: 'London is in England.', tr: "Londra İngiltere'dedir." }
  },
  {
    id: 'germany', en: 'Germany', tr: 'Almanya', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇩🇪' },
    ornek: { en: 'Berlin is in Germany.', tr: "Berlin Almanya'dadır." }
  },
  {
    id: 'france', en: 'France', tr: 'Fransa', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇫🇷' },
    ornek: { en: 'Paris is in France.', tr: "Paris Fransa'dadır." }
  },
  {
    id: 'italy', en: 'Italy', tr: 'İtalya', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇮🇹' },
    ornek: { en: 'Rome is in Italy.', tr: "Roma İtalya'dadır." }
  },
  {
    id: 'spain', en: 'Spain', tr: 'İspanya', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🇪🇸' },
    ornek: { en: 'Madrid is in Spain.', tr: "Madrid İspanya'dadır." }
  },

  // --- Milli gunler ---
  {
    id: 'national-day', en: 'national day', tr: 'milli bayram', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎉' },
    ornek: { en: 'We celebrate our national day in April.', tr: "Milli bayramımızı Nisan'da kutlarız." }
  },
  {
    id: 'flag', en: 'flag', tr: 'bayrak', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'bayrak' },
    ornek: { en: 'The flag is red and white.', tr: 'Bayrak kırmızı ve beyaz.' }
  },
  {
    id: 'celebration', en: 'celebration', tr: 'kutlama', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🥳' },
    ornek: { en: 'There is a big celebration at school today.', tr: 'Bugün okulda büyük bir kutlama var.' }
  },
  {
    id: 'ceremony', en: 'ceremony', tr: 'tören', tema: 1, tur: 'isim',
    gorsel: { tip: 'cizim', ad: 'toren' },
    ornek: { en: 'We stand still during the ceremony.', tr: 'Tören sırasında hareketsiz dururuz.' }
  },
  {
    id: 'holiday', en: 'holiday', tr: 'tatil', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🏖️' },
    ornek: { en: 'Summer holiday starts in June.', tr: "Yaz tatili Haziran'da başlar." }
  }
];
