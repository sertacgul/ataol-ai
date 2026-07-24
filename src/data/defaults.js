import { createProfile, addGuardian } from '../core/profile.js';

/**
 * Tohum veri. Bu bir VERI dosyasidir, motor kodu degil.
 * Isimlerin burada bulunmasi dogrudur; motorlarda bulunmasi yanlistir.
 *
 * Yildiz: kucuk is 2, orta 3, buyuk 5. Gunluk toplam 30.
 * Dakika: mukemmel gun tam 60'a denk gelir, yani tavan mukemmel gunde
 * devreye girer ve "her sey bitti, sinirsiz ekran" durumu olusmaz.
 */

export const DEFAULT_CARDS = [
  { id: 'sabah-giyin', block: 'morning', type: 'approved', title: 'Giyin ve yatağını topla', icon: 'bed', stars: 2, minutes: 4 },
  { id: 'sabah-kahvalti', block: 'morning', type: 'approved', title: 'Kahvaltı', icon: 'restaurant', stars: 2, minutes: 4 },
  { id: 'sabah-canta', block: 'morning', type: 'approved', title: 'Çantanı kontrol et', icon: 'backpack', stars: 2, minutes: 4 },

  { id: 'ogle-ust', block: 'afternoon', type: 'approved', title: 'Üstünü değiştir, ellerini yıka', icon: 'wash', stars: 2, minutes: 4 },
  { id: 'ogle-odev', block: 'afternoon', type: 'approved', title: 'Ödev', icon: 'edit_note', stars: 5, minutes: 10 },
  { id: 'ogle-matematik', block: 'afternoon', type: 'measured', title: 'Matematik seti', icon: 'functions', stars: 5, minutes: 10 },

  { id: 'aksam-sofra', block: 'evening', type: 'approved', title: 'Sofraya yardım et', icon: 'volunteer_activism', stars: 5, minutes: 10 },
  { id: 'aksam-dus', block: 'evening', type: 'approved', title: 'Duş', icon: 'shower', stars: 2, minutes: 4 },
  { id: 'aksam-kitap', block: 'evening', type: 'inapp', title: '15 dakika kitap', icon: 'menu_book', stars: 3, minutes: 6 },
  { id: 'aksam-canta', block: 'evening', type: 'approved', title: 'Yarının çantası', icon: 'checklist', stars: 2, minutes: 4 }
];

export const DEFAULT_ROUTINE = {
  morning: ['sabah-giyin', 'sabah-kahvalti', 'sabah-canta'],
  afternoon: ['ogle-ust', 'ogle-odev', 'ogle-matematik'],
  evening: ['aksam-sofra', 'aksam-dus', 'aksam-kitap', 'aksam-canta']
};

export const DEFAULT_REWARDS = [
  { id: 'dondurma', name: 'Dondurma', emoji: '🍦', target: 60 },
  { id: 'sinema', name: 'Sinema', emoji: '🎬', target: 120 },
  { id: 'kunefe', name: 'Künefe', emoji: '🥮', target: 240 },
  { id: 'kore', name: 'Kore Restoranı', emoji: '🍜', target: 400 },
  { id: 'bisiklet', name: 'Bisiklet', emoji: '🚲', target: 700 },
  { id: 'playstation', name: 'PlayStation', emoji: '🎮', target: 1200 }
];

export const DEFAULT_MATH_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function seedProfile({ childName, birthYear, guardians = [] }) {
  let profile = createProfile({ childName, birthYear });

  profile = {
    ...profile,
    cards: structuredClone(DEFAULT_CARDS),
    routine: structuredClone(DEFAULT_ROUTINE),
    rewards: structuredClone(DEFAULT_REWARDS)
  };

  for (const g of guardians) {
    profile = addGuardian(profile, g);
  }

  return profile;
}
