import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';
import { TEMA_IDLERI } from '../src/data/ingilizce/temalar.js';

test('1. temada en az 40 kelime var', () => {
  const t1 = SOZLUK.filter((k) => k.tema === 1);
  assert.ok(t1.length >= 40, `1. temada ${t1.length} kelime var, en az 40 olmali`);
});

test('kelime idleri benzersiz', () => {
  const ids = SOZLUK.map((k) => k.id);
  const tekrar = ids.filter((x, i) => ids.indexOf(x) !== i);
  assert.deepEqual(tekrar, [], `tekrar eden id: ${tekrar.join(', ')}`);
});

test('her id kendi Ingilizcesinden turetilmis', () => {
  for (const k of SOZLUK) {
    assert.equal(k.id, kelimeKimligi(k.en),
      `${k.en} icin id "${k.id}" olmali ama "${kelimeKimligi(k.en)}" bekleniyordu`);
  }
});

test('her kelimenin tr, tema, tur, gorsel ve ornegi var', () => {
  const TURLER = ['isim', 'fiil', 'sifat', 'edat', 'ifade'];
  for (const k of SOZLUK) {
    assert.ok(k.tr.trim().length > 0, `${k.id} tr bos`);
    assert.ok(TEMA_IDLERI.includes(k.tema), `${k.id} gecersiz tema: ${k.tema}`);
    assert.ok(TURLER.includes(k.tur), `${k.id} gecersiz tur: ${k.tur}`);
    assert.ok(k.gorsel && ['emoji', 'cizim'].includes(k.gorsel.tip),
      `${k.id} gorsel tipi gecersiz`);
    // Alan tipe bagli: 'emoji' deger tasir, 'cizim' ad tasir. { tip:
    // 'cizim', deger: '...' } gibi yanlis eslesmis bir kayit eskiden bu
    // testi gecerdi (deger || ad ikisinden birini kontrol ediyordu) ve
    // sessizce yer tutucu gorsel render ederdi.
    if (k.gorsel.tip === 'emoji') {
      assert.ok(k.gorsel.deger, `${k.id}: tip 'emoji' ama deger bos`);
      assert.ok(!k.gorsel.ad, `${k.id}: tip 'emoji' ama ad da dolu`);
    } else {
      assert.ok(k.gorsel.ad, `${k.id}: tip 'cizim' ama ad bos`);
      assert.ok(!k.gorsel.deger, `${k.id}: tip 'cizim' ama deger de dolu`);
    }
    assert.ok(k.ornek.en.trim().length > 0, `${k.id} ornek.en bos`);
    assert.ok(k.ornek.tr.trim().length > 0, `${k.id} ornek.tr bos`);
  }
});

test('ornek cumle kelimeyi GERCEKTEN iceriyor', () => {
  // Tek kelimeyi degil, en alanindaki HER anlamli tokeni kontrol eder.
  // Eski surum sadece ilk tokeni bakiyordu: "be quiet" ve "be on time"
  // icin bu "be" oluyordu, ki neredeyse her cumlede gecer (before,
  // because, between...) ve testi anlamsizlastiriyordu. 2 karakter ve
  // altindaki fonksiyon kelimeleri (be, on, to, my...) bilgi tasimadigi
  // icin atlanir; cekim/cogul icin substring eslesmesi yeterli sayilir
  // ("bag" -> "bags").
  for (const k of SOZLUK) {
    const c = k.ornek.en.toLowerCase();
    const tokenler = k.en.toLowerCase().split(' ').filter((t) => t.length > 2);
    for (const kok of tokenler) {
      assert.ok(c.includes(kok),
        `${k.id}: ornek cumle "${k.ornek.en}" "${kok}" kelimesini icermiyor`);
    }
  }
});

test('Turkce alanlar altin degerlerle birebir eslesiyor', () => {
  // Eskiden bu test bir "supheli duz yazim" deny-list'i ile calisiyordu:
  // yalnizca listedeki duz yazimlardan birini yakalayabiliyordu. Ilk tema
  // dosyasinda deny-list'in kacirdigi 20 diakritikli deger vardi (ornegin
  // 'Türkiye', 'İtalya', 'oyun alanı', "İngiltere'dedir" gibi ornek
  // cumleler) - bunlardan biri duzlestirilse test yesil kalirdi.
  //
  // Bunun yerine her kaydin tr ve ornek.tr degeri, asagidaki altin tabloda
  // yazili TAM degerle karsilastirilir (degisiklik algilayici). Icerik
  // degistiginde tablo da elle guncellenmeli; bu kasitlidir, cunku
  // degisikligin gozden gecirilmesini zorunlu kilar.
  const ALTIN = {
    teacher: { tr: 'öğretmen', ornekTr: 'Öğretmenim çok nazik.' },
    student: { tr: 'öğrenci', ornekTr: 'Öğrenci bir kitap okuyor.' },
    principal: { tr: 'okul müdürü', ornekTr: 'Müdür ofiste.' },
    classmate: { tr: 'sınıf arkadaşı', ornekTr: 'O benim sınıf arkadaşım.' },
    friend: { tr: 'arkadaş', ornekTr: 'O benim en iyi arkadaşım.' },
    caretaker: { tr: 'okul hizmetlisi', ornekTr: 'Hizmetli okulu temizler.' },
    school: { tr: 'okul', ornekTr: 'Her gün okula giderim.' },
    classroom: { tr: 'sınıf', ornekTr: 'Sınıfımız büyük ve aydınlık.' },
    library: { tr: 'kütüphane', ornekTr: 'Kütüphanede kitap okuruz.' },
    canteen: { tr: 'kantin', ornekTr: 'Kantinde öğle yemeği yeriz.' },
    playground: { tr: 'oyun alanı', ornekTr: 'Çocuklar oyun alanında oynuyor.' },
    gym: { tr: 'spor salonu', ornekTr: 'Spor salonunda oyunlar oynarız.' },
    laboratory: { tr: 'laboratuvar', ornekTr: 'Laboratuvarda deneyler yaparız.' },
    corridor: { tr: 'koridor', ornekTr: 'Lütfen koridorda koşma.' },
    'school-bag': { tr: 'okul çantası', ornekTr: 'Okul çantam kırmızı.' },
    book: { tr: 'kitap', ornekTr: 'Bir kitap okuyorum.' },
    notebook: { tr: 'defter', ornekTr: 'Defterime yazarım.' },
    pencil: { tr: 'kurşun kalem', ornekTr: 'Kurşun kalemim kısa.' },
    pen: { tr: 'tükenmez kalem', ornekTr: 'Tükenmez kalemle yazarım.' },
    eraser: { tr: 'silgi', ornekTr: 'Silgini ödünç alabilir miyim?' },
    ruler: { tr: 'cetvel', ornekTr: 'Çizgiyi bir cetvelle ölçerim.' },
    rule: { tr: 'kural', ornekTr: 'Bu önemli bir okul kuralı.' },
    listen: { tr: 'dinlemek', ornekTr: 'Lütfen öğretmenini dinle.' },
    speak: { tr: 'konuşmak', ornekTr: 'Lütfen yavaş konuş.' },
    run: { tr: 'koşmak', ornekTr: 'Sınıfta koşma.' },
    'be-quiet': { tr: 'sessiz ol', ornekTr: 'Kütüphanede sessiz ol.' },
    'be-on-time': { tr: 'zamanında gel', ornekTr: 'Okula zamanında gel.' },
    'raise-your-hand': { tr: 'elini kaldır', ornekTr: 'Konuşmadan önce elini kaldır.' },
    club: { tr: 'kulüp', ornekTr: 'Okulumuzun birçok kulübü var.' },
    'music-club': { tr: 'müzik kulübü', ornekTr: 'Müzik kulübündeyim.' },
    'chess-club': { tr: 'satranç kulübü', ornekTr: 'Satranç kulübünde satranç oynarız.' },
    'drama-club': { tr: 'drama kulübü', ornekTr: 'O drama kulübünde oyunculuk yapar.' },
    'sports-club': { tr: 'spor kulübü', ornekTr: 'O spor kulübünde futbol oynar.' },
    'art-club': { tr: 'resim kulübü', ornekTr: 'Resim kulübünde resim yaparız.' },
    country: { tr: 'ülke', ornekTr: 'Türkiye güzel bir ülke.' },
    turkiye: { tr: 'Türkiye', ornekTr: "Türkiye'de yaşıyorum." },
    england: { tr: 'İngiltere', ornekTr: "Londra İngiltere'dedir." },
    germany: { tr: 'Almanya', ornekTr: "Berlin Almanya'dadır." },
    france: { tr: 'Fransa', ornekTr: "Paris Fransa'dadır." },
    italy: { tr: 'İtalya', ornekTr: "Roma İtalya'dadır." },
    spain: { tr: 'İspanya', ornekTr: "Madrid İspanya'dadır." },
    'national-day': { tr: 'milli bayram', ornekTr: "Milli bayramımızı Nisan'da kutlarız." },
    flag: { tr: 'bayrak', ornekTr: 'Bayrak kırmızı ve beyaz.' },
    celebration: { tr: 'kutlama', ornekTr: 'Bugün okulda büyük bir kutlama var.' },
    ceremony: { tr: 'tören', ornekTr: 'Tören sırasında hiç kıpırdamadan dururuz.' },
    holiday: { tr: 'tatil', ornekTr: "Yaz tatili Haziran'da başlar." }
  };

  assert.equal(SOZLUK.length, Object.keys(ALTIN).length,
    `altin tablo ${Object.keys(ALTIN).length} kayit iceriyor ama SOZLUK'te ${SOZLUK.length} kelime var`);
  for (const k of SOZLUK) {
    const beklenen = ALTIN[k.id];
    assert.ok(beklenen, `${k.id} icin altin tabloda kayit yok`);
    assert.equal(k.tr, beklenen.tr, `${k.id}: tr "${k.tr}" bekleniyordu "${beklenen.tr}"`);
    assert.equal(k.ornek.tr, beklenen.ornekTr,
      `${k.id}: ornek.tr "${k.ornek.tr}" bekleniyordu "${beklenen.ornekTr}"`);
  }
});

test('emoji gorseller gercekten tek bir emoji', () => {
  for (const k of SOZLUK) {
    if (k.gorsel.tip !== 'emoji') continue;
    assert.ok(k.gorsel.deger.length > 0 && k.gorsel.deger.length <= 8,
      `${k.id}: emoji "${k.gorsel.deger}" fazla uzun, metin olabilir`);
    assert.ok(!/^[a-zA-Z0-9]+$/.test(k.gorsel.deger),
      `${k.id}: emoji alani duz metin iceriyor: "${k.gorsel.deger}"`);
  }
});

test('TTS\'in okuyamayacagi sembol yok', () => {
  for (const k of SOZLUK) {
    for (const [ad, metin] of [['en', k.en], ['ornek.en', k.ornek.en], ['ornek.tr', k.ornek.tr]]) {
      assert.ok(!/[°×÷≠≤≥→←]/.test(metin), `${k.id} ${ad}: TTS okuyamaz -> ${metin}`);
    }
  }
});
