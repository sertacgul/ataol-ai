/**
 * Oyun listesi.
 *
 * Oyunlar serbesttir, rutine bagli degildir. Once kilitliydi: o an
 * acik olan blogun kartlari bitmeden oyun sekmesi acilmiyordu.
 *
 * Kilit babanin karariyla kaldirildi ve karar savunulabilir.
 * Sinirlamak istedigimiz sey YouTube Shorts'tur; satranc ve Amiral
 * Batti degil. Ikisi de sira bekleyen, kural ogreten, biten oyunlar.
 * Onlari goreve baglamak, cocugun gozunde onlari da goreve cevirme
 * riski tasiyordu.
 *
 * Rutinin odulu tumden kalkmiyor: yildiz ve sure ekonomisi duruyor.
 * Yalnizca bu iki oyun o ekonominin disinda.
 *
 * Oyun oynamak yildiz veya sure KAZANDIRMAZ. Oyun zaten kendi
 * odulu; puanlamak onu ikinci bir goreve cevirirdi.
 */

export const GAMES = [
  { id: 'rozetler', title: 'Rozetlerim', icon: 'emoji_events' },
  { id: 'kodlama', title: 'Kodlama', icon: 'smart_toy' },
  { id: 'matematik', title: 'Matematik', icon: 'calculate' },
  { id: 'amiral', title: 'Amiral Battı', icon: 'sailing' },
  { id: 'satranc', title: 'Satranç Taşları', icon: 'grid_on' },
  { id: 'satranc-oyun', title: 'Satranç', icon: 'castle' },
  { id: 'atolye', title: 'Çizim Atölyesi', icon: 'draw' },
  { id: 'muhendislik', title: 'Mühendislik', icon: 'engineering' },
  { id: 'geometri', title: 'Geometri', icon: 'category' },
  { id: 'kelime', title: 'Türkçe & Kelime', icon: 'spellcheck' },
  { id: 'kahramanlar', title: 'Kahramanlar', icon: 'auto_stories' },
  { id: 'kurucu', title: 'Makine Kur', icon: 'construction' }
];
