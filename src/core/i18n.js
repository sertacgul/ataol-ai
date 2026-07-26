/**
 * Cok dillilik. Saf: dil ve anahtar girer, metin cikar. Depoya, DOM'a,
 * saate dokunmaz.
 *
 * Kapsam: uygulama kabugu (gezinme, ekranlar, onboarding, modallar, kart
 * basliklari). Sohbet AI istemi ve ogrenme icerikleri (matematik/saat/
 * satranc) BU DILIN DISINDA, ayri bir asamada cevrilecek.
 *
 * Anahtarlar iki dilde de AYNI olmali; tests/i18n.test.js bunu zorlar,
 * yoksa bir dilde eksik anahtar sessizce anahtarin kendisini basardi.
 *
 * Parametre: {ad} gibi suslu parantezli yer tutucular ikinci argumandan
 * doldurulur. t('tr', 'routine.greeting', { ad: 'Ali' }).
 */

export const DILLER = ['tr', 'en'];

const STRINGS = {
  tr: {
    'nav.routine': 'Rutin',
    'nav.parent': 'Ebeveyn',
    'nav.games': 'Oyun',
    'nav.chat': 'Sohbet',

    'routine.greeting': 'Merhaba {ad}',
    'routine.total': 'Toplam {n}★',

    'block.morning': 'Sabah',
    'block.afternoon': 'Öğle',
    'block.evening': 'Akşam',

    'parent.guardians': 'Bakım verenler',
    'parent.guardiansEmpty': 'Henüz bakım veren yok. Onay verebilmek için önce kendinizi ekleyin.',
    'parent.addGuardian': 'Bakım veren ekle',
    'parent.queueEmpty': 'Onay bekleyen görev yok.',
    'parent.approve': 'Onayla',
    'parent.tasks': 'Görevler',
    'parent.addTask': 'Görev ekle',
    'parent.rewards': 'Ödüller',
    'parent.addReward': 'Ödül ekle',
    'parent.delete': 'Sil',
    'parent.chatSettings': 'Sohbet ayarları',
    'parent.apiKey': 'ATAOL API Anahtarı',
    'parent.apiKeySaved': 'Anahtar kayıtlı — değiştirmek için yeni anahtar yaz',
    'parent.apiKeyEmpty': 'Anahtarı buraya yapıştır',
    'parent.partnerName': 'Sohbette eş / bakım veren adı',
    'parent.partnerNote': 'Bu kişi çocuğun annesi ya da babası olarak değil, yalnızca adıyla anılır. Boş bırakırsanız aile bağı hiç konuşulmaz.',
    'parent.language': 'Dil',
    'parent.save': 'Kaydet',

    'games.amiral': 'Amiral Battı',
    'games.satrancLearn': 'Satranç Taşları',
    'games.satranc': 'Satranç',

    'onboarding.title': "ATAOL'a hoş geldin",
    'onboarding.subtitle': 'Başlamak için birkaç bilgi. Bunu bir yetişkin doldursun.',
    'onboarding.childName': 'Çocuğun adı',
    'onboarding.childNamePh': 'Örn. Ali',
    'onboarding.age': 'Yaşı',
    'onboarding.agePh': 'Örn. 8',
    'onboarding.firstGuardian': 'İlk bakım veren (sen)',
    'onboarding.guardianNamePh': 'Adın',
    'onboarding.guardianLabelPh': 'Nasıl görünsün (örn. Baba)',
    'onboarding.pinPh': 'PIN (4-8 rakam)',
    'onboarding.pin2Ph': 'PIN tekrar',
    'onboarding.template': 'Rutin şablonu',
    'onboarding.start': 'Başla',
    'onboarding.errName': 'Çocuğun adını yaz.',
    'onboarding.errAge': 'Yaş 3 ile 16 arasında olmalı.',
    'onboarding.errTemplate': 'Bir rutin şablonu seç.',

    'template.okuloncesi.title': 'Okul Öncesi',
    'template.okuloncesi.desc': 'Küçük çocuklar için: öz bakım, oyun, resim ve masal. Ödev yok.',
    'template.ilkokul.title': 'İlkokul',
    'template.ilkokul.desc': 'Ödev, matematik seti, kitap ve ev işleri.',
    'template.ortaokul.title': 'Ortaokul',
    'template.ortaokul.desc': 'Daha çok çalışma ve sorumluluk: ders tekrarı ve planlama.',

    'taskModal.title': 'Görev ekle',
    'taskModal.namePh': 'Görev adı (örn. Piyano çalış)',
    'taskModal.block': 'Zaman dilimi',
    'taskModal.starsPh': 'Yıldız (örn. 3)',
    'taskModal.minutesPh': 'Dakika (örn. 6)',
    'taskModal.icon': 'Simge',
    'rewardModal.title': 'Ödül ekle',
    'rewardModal.namePh': 'Ödül adı (örn. Lego)',
    'rewardModal.emoji': 'Emoji',
    'rewardModal.targetPh': 'Hedef dakika (örn. 300)',
    'common.cancel': 'Vazgeç',
    'common.add': 'Ekle',

    'guardianModal.title': 'Bakım veren ekle',
    'guardianModal.namePh': 'İsim',
    'guardianModal.labelPh': 'Nasıl görünsün (örn. Anneanne)',
    'guardianModal.pinPh': 'PIN',
    'guardianModal.pin2Ph': 'PIN tekrar',
    'guardianModal.gateNote': 'Yeni bakım veren eklemek için mevcut bir PIN gerekiyor.',
    'guardianModal.gatePinPh': 'Mevcut PIN',

    'pin.title': 'Ebeveyn Onayı',
    'pin.inputPh': 'PIN',
    'pin.error': 'PIN yanlış, tekrar dene.',
    'pin.submit': 'Onayla',

    'migrate.text': 'Eski uygulamadaki {n} yıldızın burada. Hepsi duruyor.',
    'migrate.start': 'Başlayalım',

    'recovery.text': 'Uygulama açılamadı.',
    'recovery.reset': 'Sıfırla ve yeniden başla',

    'chat.welcome': 'Selam {ad}! Ben senin arkadaşınım, hep buradayım. Bana dilediğin her şeyi yazabilirsin.',
    'chat.inputPh': 'Bana bir şey yaz...',
    'chat.noKey': 'Şu an seninle konuşamıyorum ama birazdan buradayım. Sen yine de yazmaya devam et.',
    'chat.error': 'Şu an konuşmakta zorlanıyorum. Birazdan tekrar dener misin?',
    'chat.empty': 'Şimdi biraz düşünmem gerek. Birazdan tekrar yazar mısın?',
    'chat.s1': 'Bana bir soru sor',
    'chat.s2': 'Bugün ne öğrensem?',
    'chat.s3': 'Bana bir bilmece sor',
    'chat.s4': 'Bugün çok iyiydim',

    'card.calendar': 'Bugün ne günü?',
    'card.getDressed': 'Giyin ve yatağını topla',
    'card.breakfast': 'Kahvaltı',
    'card.checkBag': 'Çantanı kontrol et',
    'card.changeWash': 'Üstünü değiştir, ellerini yıka',
    'card.homework': 'Ödev',
    'card.mathSet': 'Matematik seti',
    'card.helpTable': 'Sofraya yardım et',
    'card.shower': 'Duş',
    'card.read15': '15 dakika kitap',
    'card.packTomorrow': 'Yarının çantası',
    'card.dressSelf': 'Kendin giyin',
    'card.eatBreakfast': 'Kahvaltını yap',
    'card.play': 'Biraz oyun oyna',
    'card.tidyToys': 'Oyuncaklarını topla',
    'card.draw': 'Resim yap ya da boya',
    'card.dinner': 'Akşam yemeğini ye',
    'card.bath': 'Banyo yap',
    'card.story': 'Masal dinle',
    'card.brushTeeth': 'Dişini fırçala',
    'card.dressReady': 'Giyin ve hazırlan',
    'card.checkBagHw': 'Çantanı ve ödevlerini kontrol et',
    'card.homeworkStudy': 'Ödev ve çalışma',
    'card.reviseRead': 'Ders tekrarı ve okuma',
    'card.read30': '30 dakika kitap',
    'card.planTomorrow': 'Yarını planla, çantanı hazırla'
  },
  en: {
    'nav.routine': 'Routine',
    'nav.parent': 'Parent',
    'nav.games': 'Games',
    'nav.chat': 'Chat',

    'routine.greeting': 'Hi {ad}',
    'routine.total': 'Total {n}★',

    'block.morning': 'Morning',
    'block.afternoon': 'Afternoon',
    'block.evening': 'Evening',

    'parent.guardians': 'Caregivers',
    'parent.guardiansEmpty': 'No caregivers yet. Add yourself first so you can approve tasks.',
    'parent.addGuardian': 'Add caregiver',
    'parent.queueEmpty': 'No tasks waiting for approval.',
    'parent.approve': 'Approve',
    'parent.tasks': 'Tasks',
    'parent.addTask': 'Add task',
    'parent.rewards': 'Rewards',
    'parent.addReward': 'Add reward',
    'parent.delete': 'Delete',
    'parent.chatSettings': 'Chat settings',
    'parent.apiKey': 'ATAOL API Key',
    'parent.apiKeySaved': 'Key saved — type a new key to change it',
    'parent.apiKeyEmpty': 'Paste the key here',
    'parent.partnerName': "Partner / caregiver name in chat",
    'parent.partnerNote': 'This person is referred to only by name, not as the child’s mother or father. Leave blank to never mention family ties.',
    'parent.language': 'Language',
    'parent.save': 'Save',

    'games.amiral': 'Battleship',
    'games.satrancLearn': 'Chess Pieces',
    'games.satranc': 'Chess',

    'onboarding.title': 'Welcome to ATAOL',
    'onboarding.subtitle': 'A few details to get started. An adult should fill this in.',
    'onboarding.childName': "Child’s name",
    'onboarding.childNamePh': 'e.g. Ali',
    'onboarding.age': 'Age',
    'onboarding.agePh': 'e.g. 8',
    'onboarding.firstGuardian': 'First caregiver (you)',
    'onboarding.guardianNamePh': 'Your name',
    'onboarding.guardianLabelPh': 'How it appears (e.g. Dad)',
    'onboarding.pinPh': 'PIN (4-8 digits)',
    'onboarding.pin2Ph': 'PIN again',
    'onboarding.template': 'Routine template',
    'onboarding.start': 'Start',
    'onboarding.errName': "Enter the child’s name.",
    'onboarding.errAge': 'Age must be between 3 and 16.',
    'onboarding.errTemplate': 'Choose a routine template.',

    'template.okuloncesi.title': 'Preschool',
    'template.okuloncesi.desc': 'For little ones: self-care, play, drawing and stories. No homework.',
    'template.ilkokul.title': 'Primary school',
    'template.ilkokul.desc': 'Homework, math set, reading and chores.',
    'template.ortaokul.title': 'Middle school',
    'template.ortaokul.desc': 'More study and responsibility: revision and planning.',

    'taskModal.title': 'Add task',
    'taskModal.namePh': 'Task name (e.g. Practice piano)',
    'taskModal.block': 'Time of day',
    'taskModal.starsPh': 'Stars (e.g. 3)',
    'taskModal.minutesPh': 'Minutes (e.g. 6)',
    'taskModal.icon': 'Icon',
    'rewardModal.title': 'Add reward',
    'rewardModal.namePh': 'Reward name (e.g. Lego)',
    'rewardModal.emoji': 'Emoji',
    'rewardModal.targetPh': 'Target minutes (e.g. 300)',
    'common.cancel': 'Cancel',
    'common.add': 'Add',

    'guardianModal.title': 'Add caregiver',
    'guardianModal.namePh': 'Name',
    'guardianModal.labelPh': 'How it appears (e.g. Grandma)',
    'guardianModal.pinPh': 'PIN',
    'guardianModal.pin2Ph': 'PIN again',
    'guardianModal.gateNote': 'An existing PIN is required to add a new caregiver.',
    'guardianModal.gatePinPh': 'Existing PIN',

    'pin.title': 'Parent approval',
    'pin.inputPh': 'PIN',
    'pin.error': 'Wrong PIN, try again.',
    'pin.submit': 'Approve',

    'migrate.text': 'Your {n} stars from the old app are here. All of them.',
    'migrate.start': "Let’s go",

    'recovery.text': "The app couldn’t open.",
    'recovery.reset': 'Reset and start over',

    'chat.welcome': 'Hi {ad}! I’m your friend, always here. You can write me anything.',
    'chat.inputPh': 'Write me something...',
    'chat.noKey': "I can’t talk right now, but I’ll be here soon. Keep writing anyway.",
    'chat.error': "I’m having trouble talking right now. Try again in a bit?",
    'chat.empty': 'I need to think for a moment. Write me again shortly?',
    'chat.s1': 'Ask me a question',
    'chat.s2': 'What should I learn today?',
    'chat.s3': 'Tell me a riddle',
    'chat.s4': 'I was really good today',

    'card.calendar': 'What day is it?',
    'card.getDressed': 'Get dressed and make your bed',
    'card.breakfast': 'Breakfast',
    'card.checkBag': 'Check your bag',
    'card.changeWash': 'Change clothes, wash your hands',
    'card.homework': 'Homework',
    'card.mathSet': 'Math set',
    'card.helpTable': 'Help set the table',
    'card.shower': 'Shower',
    'card.read15': '15 minutes of reading',
    'card.packTomorrow': "Pack tomorrow’s bag",
    'card.dressSelf': 'Get dressed by yourself',
    'card.eatBreakfast': 'Eat your breakfast',
    'card.play': 'Play for a while',
    'card.tidyToys': 'Tidy your toys',
    'card.draw': 'Draw or color',
    'card.dinner': 'Eat your dinner',
    'card.bath': 'Take a bath',
    'card.story': 'Listen to a story',
    'card.brushTeeth': 'Brush your teeth',
    'card.dressReady': 'Get dressed and ready',
    'card.checkBagHw': 'Check your bag and homework',
    'card.homeworkStudy': 'Homework and study',
    'card.reviseRead': 'Revision and reading',
    'card.read30': '30 minutes of reading',
    'card.planTomorrow': 'Plan tomorrow, pack your bag'
  }
};

export function t(dil, anahtar, params = {}) {
  const sozluk = STRINGS[dil] ?? STRINGS.tr;
  const ham = sozluk[anahtar] ?? STRINGS.tr[anahtar] ?? anahtar;
  return ham.replace(/\{(\w+)\}/g, (_, ad) => (ad in params ? String(params[ad]) : `{${ad}}`));
}

// Test icin: iki dilin anahtar kumesi.
export function anahtarlar(dil) {
  return Object.keys(STRINGS[dil] ?? {});
}
