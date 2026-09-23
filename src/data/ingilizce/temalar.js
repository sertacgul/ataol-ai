/**
 * 5. sinif Ingilizce mufredatinin sekiz temasi.
 *
 * Kaynak: MEB 2026-2027 "INGILIZCE (5.SINIF) TASLAK YILLIK CERCEVE PLAN".
 * Hafta numaralari ve tarihler matematik modulundeki TAKVIM ile BIREBIR
 * ayni cikti; bu yuzden burada tarih TUTULMUYOR, yalnizca hafta numarasi.
 * Iki takvim kopyasi olsaydi biri duzeltilip digeri unutuldugunda cocuk
 * iki derste farkli hafta gorurdu.
 *
 * Hafta 1 oryantasyon, 2-3 tekrar: hicbir temaya bagli degil.
 */

export const TEMALAR = [
  {
    no: 1,
    ad: { en: 'School Life', tr: 'Okul Hayatı' },
    haftalar: [4, 5, 6, 7],
    kazanimlar: ['ENG.5.1.L1', 'ENG.5.1.L2', 'ENG.5.1.L3', 'ENG.5.1.L4']
  },
  {
    no: 2,
    ad: { en: 'Classroom Life', tr: 'Sınıf Hayatı' },
    haftalar: [8, 9, 10, 11, 12],
    kazanimlar: ['ENG.5.2.L1', 'ENG.5.2.L2', 'ENG.5.2.L3', 'ENG.5.2.L4']
  },
  {
    no: 3,
    ad: { en: 'Personal Life', tr: 'Kişisel Hayat' },
    haftalar: [13, 14, 15, 16],
    kazanimlar: ['ENG.5.3.L1', 'ENG.5.3.L2', 'ENG.5.3.L3', 'ENG.5.3.L4']
  },
  {
    no: 4,
    ad: { en: 'Family Life', tr: 'Aile Hayatı' },
    haftalar: [17, 18, 19, 20],
    kazanimlar: ['ENG.5.4.L1', 'ENG.5.4.L2', 'ENG.5.4.L3', 'ENG.5.4.L4']
  },
  {
    no: 5,
    ad: { en: 'Life in the Neighbourhood and City', tr: 'Mahalle ve Şehir Hayatı' },
    haftalar: [21, 22, 23, 24],
    kazanimlar: ['ENG.5.5.L1', 'ENG.5.5.L2', 'ENG.5.5.L3', 'ENG.5.5.L4']
  },
  {
    no: 6,
    ad: { en: 'Life in the World', tr: 'Dünyada Hayat' },
    haftalar: [25, 26, 27, 28],
    kazanimlar: ['ENG.5.6.L1', 'ENG.5.6.L2', 'ENG.5.6.L3', 'ENG.5.6.L4']
  },
  {
    no: 7,
    ad: { en: 'Life in Nature', tr: 'Doğada Hayat' },
    haftalar: [29, 30, 31, 32],
    kazanimlar: ['ENG.5.7.L1', 'ENG.5.7.L2', 'ENG.5.7.L3', 'ENG.5.7.L4']
  },
  {
    no: 8,
    ad: { en: 'Life in the Universe and Future', tr: 'Evrende Hayat ve Gelecek' },
    haftalar: [33, 34, 35, 36, 37],
    kazanimlar: ['ENG.5.8.L1', 'ENG.5.8.L2', 'ENG.5.8.L3', 'ENG.5.8.L4']
  }
];

export const TEMA_IDLERI = TEMALAR.map((t) => t.no);
