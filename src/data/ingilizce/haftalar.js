/**
 * 1. temanin (SCHOOL LIFE) hafta hafta dagilimi.
 *
 * Kelime idleri sozlukten gelir ve BURADA TEKRARLANMAZ - yalnizca id
 * yazilir. Kelimenin kendisi, gorseli, ornegi ve sesi tek kaynaktadir
 * (src/data/ingilizce/sozluk/). Iki yerde tutulsaydi biri duzeltilip
 * digeri unutulurdu.
 *
 * Anlatim Turkce yazilir ve Turkce seslendirilir; ornek Ingilizcedir ve
 * Ingilizce seslendirilir. Spec karari: 5. sinif seviyesinde kuralin
 * anadilde anlatilmasi, ornegin hedef dilde olmasi dogru olan.
 */

export const ING_HAFTALAR = [
  {
    hafta: 4,
    tema: 1,
    baslik: { en: 'People at school', tr: 'Okuldaki kişiler' },
    kelimeler: ['teacher', 'student', 'principal', 'classmate', 'friend',
      'caretaker', 'school', 'classroom'],
    anlatim: [
      {
        id: 'a1',
        tr: 'Okuldaki kişileri tanıtırken "This is ..." kalıbını kullanırsın. Bu kalıp "Bu ..." demektir ve yanındaki kişiyi gösterirken söylenir.',
        en: 'This is my teacher.'
      },
      {
        id: 'a2',
        tr: 'Kendinden söz ederken "my" kelimesini kullanırsın. "My teacher" senin öğretmenin, "my friend" senin arkadaşın demektir.',
        en: 'My friend is in my classroom.'
      }
    ]
  },
  {
    hafta: 5,
    tema: 1,
    baslik: { en: 'Places and things at school', tr: 'Okuldaki yerler ve eşyalar' },
    kelimeler: ['library', 'canteen', 'playground', 'gym', 'laboratory',
      'corridor', 'school-bag', 'book', 'notebook', 'pencil', 'pen',
      'eraser', 'ruler'],
    anlatim: [
      {
        id: 'a1',
        tr: 'Bir yerde neyin bulunduğunu anlatırken "There is a ... in the ..." kalıbını kullanırsın. Bu kalıp bir şeyin nerede olduğunu gösterir.',
        en: 'There is a library in the school.'
      },
      {
        id: 'a2',
        tr: 'Okul eşyalarından söz ederken de "my" kelimesini kullanırsın. Eşyanın sana ait olduğunu gösterir.',
        en: 'My pencil and my eraser are in my school bag.'
      },
      {
        id: 'a3',
        tr: 'Bir şeyi nerede yaptığını anlatırken "in the ..." kalıbını kullanırsın. Yer adı bu kalıbın sonuna gelir.',
        en: 'We read a book in the library.'
      }
    ]
  },
  {
    hafta: 6,
    tema: 1,
    baslik: { en: 'Rules and clubs', tr: 'Kurallar ve kulüpler' },
    kelimeler: ['rule', 'listen', 'speak', 'run', 'be-quiet', 'be-on-time',
      'raise-your-hand', 'club', 'music-club', 'chess-club', 'drama-club',
      'sports-club', 'art-club'],
    anlatim: [
      {
        id: 'a1',
        tr: 'Bir kuralı söylerken fiili doğrudan cümlenin başına koyarsın. Bu, birine ne yapması gerektiğini söylemenin en kısa yoludur.',
        en: 'Raise your hand before you speak.'
      },
      {
        id: 'a2',
        tr: 'Yasak bir davranışı anlatırken "Don\'t ..." kalıbını kullanırsın. Bu, "yapma" anlamına gelen bir uyarıdır.',
        en: "Be quiet and don't run!"
      },
      {
        id: 'a3',
        tr: 'Bir kulübe üye olduğunu söylerken "I am in the ..." kalıbını kullanırsın. Kulübün adını bu kalıbın sonuna eklersin.',
        en: 'I am in the chess club.'
      }
    ]
  },
  {
    hafta: 7,
    tema: 1,
    baslik: { en: 'Countries and national days', tr: 'Ülkeler ve milli bayramlar' },
    kelimeler: ['country', 'turkiye', 'england', 'germany', 'france',
      'italy', 'spain', 'national-day', 'flag', 'celebration', 'ceremony',
      'holiday'],
    anlatim: [
      {
        id: 'a1',
        tr: 'Nerede yaşadığını anlatırken "I live in ..." kalıbını kullanırsın. Ülke adı bu kalıbın sonuna gelir.',
        en: 'I live in Türkiye.'
      },
      {
        id: 'a2',
        tr: 'Özel bir günü anlatırken "There is a ... today" kalıbını kullanırsın. Bu kalıp o gün yaşanan özel etkinliği gösterir.',
        en: 'There is a celebration today.'
      },
      {
        id: 'a3',
        tr: 'Bir nesnenin özelliğini anlatırken "The ... is ..." kalıbını kullanırsın. Nesnenin adını ve rengini bu kalıba yerleştirirsin.',
        en: 'The flag is red and white.'
      }
    ]
  }
];
