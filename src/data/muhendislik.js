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
  }
];

export function soruMetni(soru, dil) {
  return dil === 'en' ? soru.en : soru.tr;
}
