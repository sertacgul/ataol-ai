import { createProfile, addGuardian } from '../core/profile.js';

/**
 * Tohum veri. Bu bir VERI dosyasidir, motor kodu degil.
 * Isimlerin burada bulunmasi dogrudur; motorlarda bulunmasi yanlistir.
 *
 * Yildiz: kucuk is 2, orta 3, buyuk 5. Gunluk toplam 30.
 * Dakika: mukemmel gun tam 60'a denk gelir, yani tavan mukemmel gunde
 * devreye girer ve "her sey bitti, sinirsiz ekran" durumu olusmaz.
 *
 * measured (uygulama olcer) ve inapp (uygulama icinde tamamlanir)
 * tipleri sadece uygulamanin gercekten dogruladigi kartlarda kullanilir
 * (1C'den itibaren: sabah-takvim). Digerleri 'approved' kalir, cunku
 * tek dokunusla dogrulanacak bir aktivite yok.
 */

export const DEFAULT_CARDS = [
  { id: 'sabah-takvim', block: 'morning', type: 'measured', title: 'Bugün ne günü?', titleKey: 'card.calendar', icon: 'calendar_month', stars: 2, minutes: 4 },
  { id: 'sabah-giyin', block: 'morning', type: 'approved', title: 'Giyin ve yatağını topla', titleKey: 'card.getDressed', icon: 'bed', stars: 2, minutes: 4 },
  { id: 'sabah-kahvalti', block: 'morning', type: 'approved', title: 'Kahvaltı', titleKey: 'card.breakfast', icon: 'restaurant', stars: 2, minutes: 4 },
  { id: 'sabah-canta', block: 'morning', type: 'approved', title: 'Çantanı kontrol et', titleKey: 'card.checkBag', icon: 'backpack', stars: 2, minutes: 4 },

  { id: 'ogle-ust', block: 'afternoon', type: 'approved', title: 'Üstünü değiştir, ellerini yıka', titleKey: 'card.changeWash', icon: 'wash', stars: 2, minutes: 4 },
  { id: 'ogle-odev', block: 'afternoon', type: 'approved', title: 'Ödev', titleKey: 'card.homework', icon: 'edit_note', stars: 5, minutes: 10 },
  { id: 'ogle-matematik', block: 'afternoon', type: 'measured', title: 'Matematik seti', titleKey: 'card.mathSet', icon: 'functions', stars: 5, minutes: 10 },

  { id: 'aksam-sofra', block: 'evening', type: 'approved', title: 'Sofraya yardım et', titleKey: 'card.helpTable', icon: 'volunteer_activism', stars: 5, minutes: 10 },
  { id: 'aksam-dus', block: 'evening', type: 'approved', title: 'Duş', titleKey: 'card.shower', icon: 'shower', stars: 2, minutes: 4 },
  { id: 'aksam-kitap', block: 'evening', type: 'approved', title: '15 dakika kitap', titleKey: 'card.read15', icon: 'menu_book', stars: 3, minutes: 6 },
  { id: 'aksam-canta', block: 'evening', type: 'approved', title: 'Yarının çantası', titleKey: 'card.packTomorrow', icon: 'checklist', stars: 2, minutes: 4 }
];

export const DEFAULT_ROUTINE = {
  morning: ['sabah-takvim', 'sabah-giyin', 'sabah-kahvalti', 'sabah-canta'],
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

// Okul oncesi: odev ve matematik seti YOK (yasa uygun degil). Gun ogrenme
// (sabah-takvim, measured quiz) kalir; oz bakim, oyun, resim, masal.
const OKULONCESI_CARDS = [
  { id: 'sabah-takvim', block: 'morning', type: 'measured', title: 'Bugün ne günü?', titleKey: 'card.calendar', icon: 'calendar_month', stars: 2, minutes: 6 },
  { id: 'sabah-giyin', block: 'morning', type: 'approved', title: 'Kendin giyin', titleKey: 'card.dressSelf', icon: 'checkroom', stars: 2, minutes: 6 },
  { id: 'sabah-kahvalti', block: 'morning', type: 'approved', title: 'Kahvaltını yap', titleKey: 'card.eatBreakfast', icon: 'restaurant', stars: 2, minutes: 6 },

  { id: 'ogle-oyun', block: 'afternoon', type: 'approved', title: 'Biraz oyun oyna', titleKey: 'card.play', icon: 'toys', stars: 2, minutes: 6 },
  { id: 'ogle-topla', block: 'afternoon', type: 'approved', title: 'Oyuncaklarını topla', titleKey: 'card.tidyToys', icon: 'cleaning_services', stars: 3, minutes: 6 },
  { id: 'ogle-resim', block: 'afternoon', type: 'approved', title: 'Resim yap ya da boya', titleKey: 'card.draw', icon: 'palette', stars: 3, minutes: 6 },

  { id: 'aksam-yemek', block: 'evening', type: 'approved', title: 'Akşam yemeğini ye', titleKey: 'card.dinner', icon: 'restaurant', stars: 2, minutes: 7 },
  { id: 'aksam-banyo', block: 'evening', type: 'approved', title: 'Banyo yap', titleKey: 'card.bath', icon: 'shower', stars: 3, minutes: 7 },
  { id: 'aksam-masal', block: 'evening', type: 'approved', title: 'Masal dinle', titleKey: 'card.story', icon: 'auto_stories', stars: 3, minutes: 7 },
  { id: 'aksam-dis', block: 'evening', type: 'approved', title: 'Dişini fırçala', titleKey: 'card.brushTeeth', icon: 'bedtime', stars: 2, minutes: 7 }
];

const OKULONCESI_ROUTINE = {
  morning: ['sabah-takvim', 'sabah-giyin', 'sabah-kahvalti'],
  afternoon: ['ogle-oyun', 'ogle-topla', 'ogle-resim'],
  evening: ['aksam-yemek', 'aksam-banyo', 'aksam-masal', 'aksam-dis']
};

// Ortaokul: daha cok calisma ve sorumluluk. Matematik seti (drill) kalir;
// takvim quiz'i cikarilir (bu yasta basit kalir).
const ORTAOKUL_CARDS = [
  { id: 'sabah-giyin', block: 'morning', type: 'approved', title: 'Giyin ve hazırlan', titleKey: 'card.dressReady', icon: 'checkroom', stars: 2, minutes: 5 },
  { id: 'sabah-kahvalti', block: 'morning', type: 'approved', title: 'Kahvaltı', titleKey: 'card.breakfast', icon: 'restaurant', stars: 2, minutes: 5 },
  { id: 'sabah-canta', block: 'morning', type: 'approved', title: 'Çantanı ve ödevlerini kontrol et', titleKey: 'card.checkBagHw', icon: 'backpack', stars: 2, minutes: 5 },

  { id: 'ogle-odev', block: 'afternoon', type: 'approved', title: 'Ödev ve çalışma', titleKey: 'card.homeworkStudy', icon: 'edit_note', stars: 5, minutes: 12 },
  { id: 'ogle-matematik', block: 'afternoon', type: 'measured', title: 'Matematik seti', titleKey: 'card.mathSet', icon: 'functions', stars: 5, minutes: 12 },
  { id: 'ogle-tekrar', block: 'afternoon', type: 'approved', title: 'Ders tekrarı ve okuma', titleKey: 'card.reviseRead', icon: 'menu_book', stars: 3, minutes: 8 },

  { id: 'aksam-sofra', block: 'evening', type: 'approved', title: 'Sofraya yardım et', titleKey: 'card.helpTable', icon: 'volunteer_activism', stars: 5, minutes: 8 },
  { id: 'aksam-dus', block: 'evening', type: 'approved', title: 'Duş', titleKey: 'card.shower', icon: 'shower', stars: 2, minutes: 5 },
  { id: 'aksam-kitap', block: 'evening', type: 'approved', title: '30 dakika kitap', titleKey: 'card.read30', icon: 'auto_stories', stars: 3, minutes: 8 },
  { id: 'aksam-plan', block: 'evening', type: 'approved', title: 'Yarını planla, çantanı hazırla', titleKey: 'card.planTomorrow', icon: 'checklist', stars: 2, minutes: 5 }
];

const ORTAOKUL_ROUTINE = {
  morning: ['sabah-giyin', 'sabah-kahvalti', 'sabah-canta'],
  afternoon: ['ogle-odev', 'ogle-matematik', 'ogle-tekrar'],
  evening: ['aksam-sofra', 'aksam-dus', 'aksam-kitap', 'aksam-plan']
};

// Rutin sablonlari. Onboarding'de ebeveyn birini secer. ilkokul mevcut
// DEFAULT_* verisini kullanir; geriye uyum ve defaults.test.js icin.
export const ROUTINE_TEMPLATES = [
  {
    id: 'okuloncesi',
    title: 'Okul Öncesi',
    aciklama: 'Küçük çocuklar için: öz bakım, oyun, resim ve masal. Ödev yok.',
    cards: OKULONCESI_CARDS,
    routine: OKULONCESI_ROUTINE
  },
  {
    id: 'ilkokul',
    title: 'İlkokul',
    aciklama: 'Ödev, matematik seti, kitap ve ev işleri.',
    cards: DEFAULT_CARDS,
    routine: DEFAULT_ROUTINE
  },
  {
    id: 'ortaokul',
    title: 'Ortaokul',
    aciklama: 'Daha çok çalışma ve sorumluluk: ders tekrarı ve planlama.',
    cards: ORTAOKUL_CARDS,
    routine: ORTAOKUL_ROUTINE
  }
];

export function seedProfile({ childName, birthYear, guardians = [], sablon = 'ilkokul' }) {
  const secili = ROUTINE_TEMPLATES.find((t) => t.id === sablon)
    ?? ROUTINE_TEMPLATES.find((t) => t.id === 'ilkokul');

  let profile = createProfile({ childName, birthYear });

  profile = {
    ...profile,
    cards: structuredClone(secili.cards),
    routine: structuredClone(secili.routine),
    rewards: structuredClone(DEFAULT_REWARDS)
  };

  for (const g of guardians) {
    profile = addGuardian(profile, g);
  }

  return profile;
}
