/**
 * Muhendislik/teknik resim ders sorulari. Bu bir VERI dosyasidir; ekran
 * metinleri burada bulunabilir (defaults.js gibi).
 *
 * Her soru iki dilli. dogru: SECENEKLER dizisindeki dogru cevabin indeksi
 * (karistirmadan onceki). Ekran secenekleri karistirir ama karsilastirma
 * deger uzerinden yapilir, o yuzden indeks karismadan onceki siraya gore.
 *
 * Kategoriler: parca (is makinesi parcalari), gorunus (izdusum/gorunusler),
 * kavram (temel muhendislik kavramlari).
 */

export const SORULAR = [
  {
    id: 'kova', kategori: 'parca', dogru: 0,
    tr: { soru: 'İş makinesinde toprağı kazıp taşıyan parça hangisi?', secenekler: ['Kova', 'Kabin', 'Tekerlek', 'Anten'] },
    en: { soru: 'Which part digs and scoops soil on a machine?', secenekler: ['Bucket', 'Cabin', 'Wheel', 'Antenna'] }
  },
  {
    id: 'bom', kategori: 'parca', dogru: 0,
    tr: { soru: 'Vincin yükü yükseğe kaldıran uzun koluna ne denir?', secenekler: ['Bom', 'Kova', 'Palet', 'Cam'] },
    en: { soru: 'What is the long arm that lifts loads high on a crane called?', secenekler: ['Boom', 'Bucket', 'Track', 'Window'] }
  },
  {
    id: 'palet', kategori: 'parca', dogru: 0,
    tr: { soru: 'Ekskavatörün tekerlek yerine kullandığı, çamurda kaymayan parça?', secenekler: ['Palet', 'Bom', 'Kabin', 'Far'] },
    en: { soru: 'What does an excavator use instead of wheels so it does not slip in mud?', secenekler: ['Track', 'Boom', 'Cabin', 'Headlight'] }
  },
  {
    id: 'kabin', kategori: 'parca', dogru: 0,
    tr: { soru: 'Makineyi kullanan kişinin (operatörün) oturduğu yer neresidir?', secenekler: ['Kabin', 'Kova', 'Palet', 'Bom'] },
    en: { soru: 'Where does the operator who runs the machine sit?', secenekler: ['Cabin', 'Bucket', 'Track', 'Boom'] }
  },
  {
    id: 'kup-on', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir küpe tam önden bakınca ne görürsün?', secenekler: ['Kare', 'Daire', 'Üçgen', 'Yıldız'] },
    en: { soru: 'What do you see looking straight at a cube from the front?', secenekler: ['Square', 'Circle', 'Triangle', 'Star'] }
  },
  {
    id: 'silindir-ust', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir konserve kutusuna (silindir) tam üstten bakınca ne görürsün?', secenekler: ['Daire', 'Kare', 'Üçgen', 'Kalp'] },
    en: { soru: 'What do you see looking straight down at a can (cylinder) from the top?', secenekler: ['Circle', 'Square', 'Triangle', 'Heart'] }
  },
  {
    id: 'top-her', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir topa (küre) hangi yönden bakarsan bak ne görürsün?', secenekler: ['Daire', 'Kare', 'Üçgen', 'Ok'] },
    en: { soru: 'No matter which side you look at a ball (sphere) from, what do you see?', secenekler: ['Circle', 'Square', 'Triangle', 'Arrow'] }
  },
  {
    id: 'kac-yon', kategori: 'gorunus', dogru: 1,
    tr: { soru: 'Mühendisler bir makineyi çizerken kaç ana yönden çizer (önden, yandan, üstten)?', secenekler: ['1', '3', '10', '100'] },
    en: { soru: 'From how many main sides do engineers draw a machine (front, side, top)?', secenekler: ['1', '3', '10', '100'] }
  },
  {
    id: 'simetri', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Sağ yarısı sol yarısının aynası gibi olan şekle ne denir?', secenekler: ['Simetrik', 'Yamuk', 'Eğri', 'Dağınık'] },
    en: { soru: 'What is a shape whose right half mirrors its left half called?', secenekler: ['Symmetric', 'Crooked', 'Curvy', 'Messy'] }
  },
  {
    id: 'teker-yuvarlak', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Tekerlek neden yuvarlaktır?', secenekler: ['Kolay yuvarlansın diye', 'Güzel görünsün diye', 'Renkli olsun diye', 'Ağır olsun diye'] },
    en: { soru: 'Why are wheels round?', secenekler: ['So they roll easily', 'To look pretty', 'To be colorful', 'To be heavy'] }
  },
  {
    id: 'olcek', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Kocaman bir makineyi küçük kâğıda oranları bozulmadan çizmeye ne denir?', secenekler: ['Ölçekli çizmek', 'Karalama', 'Silmek', 'Boyamak'] },
    en: { soru: 'What is drawing a huge machine on small paper with the right proportions called?', secenekler: ['Drawing to scale', 'Scribbling', 'Erasing', 'Coloring'] }
  },

  {
    id: 'far', kategori: 'parca', dogru: 0,
    tr: { soru: 'Karanlıkta aracın önünü aydınlatan parça hangisi?', secenekler: ['Far', 'Kova', 'Palet', 'Bom'] },
    en: { soru: 'Which part lights up the front of a vehicle in the dark?', secenekler: ['Headlight', 'Bucket', 'Track', 'Boom'] }
  },
  {
    id: 'direksiyon', kategori: 'parca', dogru: 0,
    tr: { soru: 'Aracı sağa ve sola çeviren parça hangisi?', secenekler: ['Direksiyon', 'Kasa', 'Baca', 'Cam'] },
    en: { soru: 'Which part turns a vehicle left and right?', secenekler: ['Steering wheel', 'Cargo bed', 'Funnel', 'Window'] }
  },
  {
    id: 'motor', kategori: 'parca', dogru: 0,
    tr: { soru: 'Aracı çalıştıran, ona güç veren parça hangisi?', secenekler: ['Motor', 'Koltuk', 'Cam', 'Ayna'] },
    en: { soru: 'Which part runs a vehicle and gives it power?', secenekler: ['Engine', 'Seat', 'Window', 'Mirror'] }
  },
  {
    id: 'merdiven', kategori: 'parca', dogru: 0,
    tr: { soru: 'İtfaiye aracının yükseğe ulaşmak için uzattığı parça?', secenekler: ['Merdiven', 'Kova', 'Palet', 'Far'] },
    en: { soru: 'What does a fire truck extend to reach high up?', secenekler: ['Ladder', 'Bucket', 'Track', 'Headlight'] }
  },
  {
    id: 'catal', kategori: 'parca', dogru: 0,
    tr: { soru: 'Forkliftin paletleri kaldıran parçası hangisi?', secenekler: ['Çatal', 'Kanca', 'Cam', 'Pervane'] },
    en: { soru: 'Which part of a forklift lifts the pallets?', secenekler: ['Fork', 'Hook', 'Window', 'Propeller'] }
  },
  {
    id: 'pervane', kategori: 'parca', dogru: 0,
    tr: { soru: 'Helikopteri havada tutan dönen parça hangisi?', secenekler: ['Pervane', 'Tekerlek', 'Kova', 'Palet'] },
    en: { soru: 'Which spinning part keeps a helicopter in the air?', secenekler: ['Rotor', 'Wheel', 'Bucket', 'Track'] }
  },
  {
    id: 'kanat', kategori: 'parca', dogru: 0,
    tr: { soru: 'Uçağın havada süzülmesini sağlayan parça hangisi?', secenekler: ['Kanat', 'Palet', 'Kova', 'Baca'] },
    en: { soru: 'Which part lets a plane glide through the air?', secenekler: ['Wing', 'Track', 'Bucket', 'Funnel'] }
  },

  {
    id: 'koni-ust', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir külaha (koni) tam üstten bakınca ne görürsün?', secenekler: ['Daire', 'Üçgen', 'Kare', 'Yıldız'] },
    en: { soru: 'What do you see looking straight down at a cone from the top?', secenekler: ['Circle', 'Triangle', 'Square', 'Star'] }
  },
  {
    id: 'koni-on', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir külaha (koni) tam önden bakınca ne görürsün?', secenekler: ['Üçgen', 'Daire', 'Kare', 'Kalp'] },
    en: { soru: 'What do you see looking straight at a cone from the front?', secenekler: ['Triangle', 'Circle', 'Square', 'Heart'] }
  },
  {
    id: 'araba-yan', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir arabaya yandan bakınca tekerlekler nasıl görünür?', secenekler: ['Daire', 'Kare', 'Üçgen', 'Çizgi'] },
    en: { soru: 'Looking at a car from the side, how do the wheels look?', secenekler: ['Circles', 'Squares', 'Triangles', 'Lines'] }
  },
  {
    id: 'piramit-on', kategori: 'gorunus', dogru: 0,
    tr: { soru: 'Bir piramide tam önden bakınca ne görürsün?', secenekler: ['Üçgen', 'Kare', 'Daire', 'Ok'] },
    en: { soru: 'What do you see looking straight at a pyramid from the front?', secenekler: ['Triangle', 'Square', 'Circle', 'Arrow'] }
  },

  {
    id: 'ucgen-saglam', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir köprüyü ya da kuleyi hangi şekil daha sağlam yapar?', secenekler: ['Üçgen', 'Daire', 'Yıldız', 'Kalp'] },
    en: { soru: 'Which shape makes a bridge or tower stronger?', secenekler: ['Triangle', 'Circle', 'Star', 'Heart'] }
  },
  {
    id: 'metre', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir şeyin uzunluğunu neyle ölçeriz?', secenekler: ['Metre', 'Kilo', 'Litre', 'Derece'] },
    en: { soru: 'What do we measure length with?', secenekler: ['Meter', 'Kilo', 'Liter', 'Degree'] }
  },
  {
    id: 'pergel', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Kusursuz bir daire çizmek için hangi aleti kullanırız?', secenekler: ['Pergel', 'Cetvel', 'Silgi', 'Makas'] },
    en: { soru: 'Which tool do we use to draw a perfect circle?', secenekler: ['Compass', 'Ruler', 'Eraser', 'Scissors'] }
  },
  {
    id: 'plan', kategori: 'kavram', dogru: 0,
    tr: { soru: 'Bir bina yapılmadan önce çizilen çizime ne denir?', secenekler: ['Plan', 'Karalama', 'Boyama', 'Fotoğraf'] },
    en: { soru: 'What is the drawing made before a building is built called?', secenekler: ['Plan', 'Scribble', 'Coloring', 'Photo'] }
  },

  {
    id: 'kaldirac', kategori: 'makine', dogru: 0,
    tr: { soru: 'Ağır bir taşı az güçle kaldırmaya yarayan basit makine?', secenekler: ['Kaldıraç', 'Balon', 'Yastık', 'Bardak'] },
    en: { soru: 'Which simple machine helps lift a heavy stone with little force?', secenekler: ['Lever', 'Balloon', 'Pillow', 'Cup'] }
  },
  {
    id: 'makara', kategori: 'makine', dogru: 0,
    tr: { soru: 'İpi ve tekerleği olan, yükü yukarı çeken basit makine?', secenekler: ['Makara', 'Çekiç', 'Fırça', 'Kaşık'] },
    en: { soru: 'Which simple machine with a rope and wheel pulls a load up?', secenekler: ['Pulley', 'Hammer', 'Brush', 'Spoon'] }
  },
  {
    id: 'disli', kategori: 'makine', dogru: 0,
    tr: { soru: 'Birbirini çeviren dişli tekerleklere ne denir?', secenekler: ['Çark (dişli)', 'Yay', 'Halka', 'Düğme'] },
    en: { soru: 'What are toothed wheels that turn each other called?', secenekler: ['Gears', 'Spring', 'Ring', 'Button'] }
  },
  {
    id: 'egik-duzlem', kategori: 'makine', dogru: 0,
    tr: { soru: 'Yükü yukarı çıkarmayı kolaylaştıran eğimli yüzey (rampa)?', secenekler: ['Eğik düzlem', 'Kuyu', 'Duvar', 'Çukur'] },
    en: { soru: 'Which slanted surface (ramp) makes moving a load up easier?', secenekler: ['Inclined plane', 'Well', 'Wall', 'Pit'] }
  },
  {
    id: 'vida', kategori: 'makine', dogru: 0,
    tr: { soru: 'Döndükçe içeri ilerleyip parçaları birbirine tutturan?', secenekler: ['Vida', 'Balon', 'İp', 'Sünger'] },
    en: { soru: 'What moves inward as it turns and holds parts together?', secenekler: ['Screw', 'Balloon', 'Rope', 'Sponge'] }
  }
];

export function soruMetni(soru, dil) {
  return dil === 'en' ? soru.en : soru.tr;
}
