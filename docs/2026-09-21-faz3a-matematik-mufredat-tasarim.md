# Faz 3A: 5. Sinif Matematik Mufredat Modulu (Tasarim)

Tarih: 2026-09-21
Durum: Tasarim onaylandi, uygulama plani bekliyor

## 1. Amac

2026-2027 egitim yilinin 5. sinif matematik mufredatini (Turkiye Yuzyili
Maarif Modeli, TTK 07.08.2026 tarih 70 sayili karar eki) hafta hafta takip
eden, sesli anlatimli, etkilesimli bir ders modulu eklemek.

Kaynak: `MATEMATIK 5. Sinif CERCEVE YILLIK PLAN.xlsx`, 37 hafta, 7 unite,
24 ogrenme ciktisi (MAT.5.x.y kazanim kodlari).

Modul cocugun okulda o hafta gordugu konuyu evde tekrar etmesini,
anlamadigi yeri sesli anlatimla ve etkilesimli araclarla kavramasini,
sonra quiz ve sinavla olcmesini saglar.

## 2. Kapsam disi

- Ingilizce ders icerigi. Mufredat MEB mufredatidir, icerik yalnizca
  Turkce yazilir. Arayuz anahtarlari iki dilli kalir, EN secildiginde ders
  sekmesi Turkce icerik gosterir ve ustte kisa bir not cikar.
- Diger dersler (fen, Turkce, sosyal). Bu modul yalnizca matematik.
- Ogretmen / sinif ozellikleri. Tek cocuk, tek cihaz.
- Sunucu tarafi. Uygulama sunucusuz kalir, tum ilerleme localStorage'da.

## 3. Mimari kisitlar (mevcut ve korunacak)

`tests/architecture.test.js` su kurallari zorluyor ve modul bunlara uyacak:

1. Bagimlilik yonu tek tarafli: `views` -> `engines` -> `core`
2. `engines/` saf: `Date.now()`, argumansiz `new Date()`, `Math.random()`
   yok. Zaman ve rastgelelik disaridan enjekte edilir.
3. `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`,
   `eval`, `new Function`, `srcdoc` hicbir dosyada gecmez
4. `core/` ve `engines/` icinde kisi adi sabit yazili degil
5. Bagimlilik yok: `node_modules` yok, build adimi yok

### 3.1 Degisecek tek kural

Mevcut test su an DOM kullanan dosyalarin tam listesini zorluyor:

```js
assert.deepEqual(domlu, ['main.js', 'ui/dom.js']);
```

Etkilesimli widget'lar canvas ve pointer olaylari kullanacagi icin bu kural
su sekilde gevsetilecek:

```js
// DOM sadece main.js ve ui/ altinda kullanilir
for (const { yol, src } of TUM) {
  if (!src.includes('document')) continue;
  assert.ok(yol === 'main.js' || yol.startsWith('ui/'), `${yol} DOM kullanamaz`);
}
```

Kuralin amaci korunuyor: DOM belirli bir katmanda kaliyor, `engines`,
`core` ve `views` temiz kaliyor. Asil guvenlik guardrail'i olan HTML
enjeksiyon sinki yasagi hic dokunulmadan duruyor.

Alternatifi tum widget kodunu `main.js` icine yazmakti. `main.js` su an
99 KB ve ~2900 satir; bu modul onu 150 KB'a cikarirdi. Reddedildi.

## 4. Veri modeli

### 4.1 Konu merkezli yaklasim

37 hafta 15 konuya indirgenir. Bir konu birden cok hafta surer ve her hafta
o konunun bir seviyesini acar. Toplam 42 seviye yazilir, 37 hafta degil, ve
tekrar eden icerik tek yerde durur.

Kazanim kodu (MAT.5.x.y) her seviyeye etiket olarak gomulur. Boylece ebeveyn
panelinde kazanim bazli rapor cikar ama cocuk arayuzunde kod gorunmez.

### 4.2 `src/data/mufredat.js`

Yalnizca esleme tasir, icerik tasimaz.

```js
export const TAKVIM = [
  { hafta: 1, bas: '2026-09-14', bit: '2026-09-18', dersSaati: 5,
    unite: 'geometrik-sekiller',
    dersler: [{ konu: 'temel-cizimler', seviye: 1 }] },
  ...
];

export const TATILLER = [
  { ad: '1. Donem Ara Tatili', bas: '2026-11-16', bit: '2026-11-20' },
  { ad: 'Yariyil Tatili',      bas: '2027-01-25', bit: '2027-02-05' },
  { ad: 'Ara Tatil - Ramazan Bayrami', bas: '2027-03-08', bit: '2027-03-12' },
  { ad: 'Kurban Bayrami ve 19 Mayis', bas: '2027-05-15', bit: '2027-05-19' }
];

export const UNITELER = [
  { id: 'geometrik-sekiller', ad: 'Geometrik Sekiller', haftalar: [1, 8] },
  { id: 'sayilar-1',          ad: 'Sayilar ve Nicelikler 1', haftalar: [9, 14] },
  { id: 'geometrik-nicelikler', ad: 'Geometrik Nicelikler', haftalar: [14, 18] },
  { id: 'sayilar-2',          ad: 'Sayilar ve Nicelikler 2', haftalar: [19, 25] },
  { id: 'istatistik',         ad: 'Istatistiksel Arastirma Sureci', haftalar: [26, 30] },
  { id: 'cebir',              ad: 'Islemlerle Cebirsel Dusunme', haftalar: [30, 35] },
  { id: 'olasilik',           ad: 'Veriden Olasiliga', haftalar: [35, 36] }
];
```

### 4.3 Tam hafta esleme tablosu

Excel'den birebir cikarildi. `(2)*` isaretli saatler okul temelli planlama
suresidir, ders saatine dahil edilmez.

| Hafta | Tarih | Saat | Unite | Konu | Seviye | Kazanim |
|---|---|---|---|---|---|---|
| 1  | 14-18 Eyl | 5 | geometrik-sekiller | temel-cizimler | 1 | MAT.5.3.1 |
| 2  | 21-25 Eyl | 5 | geometrik-sekiller | temel-cizimler | 2 | MAT.5.3.2 |
| 3  | 28 Eyl-2 Eki | 5 | geometrik-sekiller | aci-olcme | 1 | MAT.5.3.3 |
| 4  | 5-9 Eki | 5 | geometrik-sekiller | aci-olcme | 2 | MAT.5.3.4 |
| 5  | 12-16 Eki | 5 | geometrik-sekiller | cokgenler-cember | 1 | MAT.5.3.5 |
| 6  | 19-23 Eki | 5 | geometrik-sekiller | cokgenler-cember | 2 | MAT.5.3.6 |
| 7  | 26-30 Eki | 3 | geometrik-sekiller | cokgenler-cember | 3 | MAT.5.3.7 |
| 8  | 2-6 Kas | 5 | geometrik-sekiller | cokgenler-cember | 4 | MAT.5.3.7 |
| 9  | 9-13 Kas | 5 | sayilar-1 | cok-basamakli-sayilar | 1 | MAT.5.1.1 |
| 10 | 23-27 Kas | 5 | sayilar-1 | cok-basamakli-sayilar | 2 | MAT.5.1.1 |
| 11 | 30 Kas-4 Ara | 5 | sayilar-1 | dort-islem-problem | 1 | MAT.5.1.2 |
| 12 | 7-11 Ara | 5 | sayilar-1 | dort-islem-problem | 2 | MAT.5.1.2 |
| 13 | 14-18 Ara | 5 | sayilar-1 | dort-islem-problem | 3 | MAT.5.1.2 |
| 14 | 21-25 Ara | 3+2 | sayilar-1 + geometrik-nicelikler | dort-islem-problem / dikdortgen | 4 / 1 | MAT.5.1.2, MAT.5.4.1 |
| 15 | 28-31 Ara | 1+2 | geometrik-nicelikler | dikdortgen | 2 | MAT.5.4.1, MAT.5.4.2 |
| 16 | 4-8 Oca | 2+3 | geometrik-nicelikler | dikdortgen | 3 | MAT.5.4.2, MAT.5.4.3 |
| 17 | 11-15 Oca | 5 | geometrik-nicelikler | dikdortgen | 4 | MAT.5.4.4 |
| 18 | 18-22 Oca | 5 | geometrik-nicelikler | dikdortgen | 5 | MAT.5.4.4 |
| 19 | 8-12 Sub | 5 | sayilar-2 | kesir-gosterim | 1 | MAT.5.1.3 |
| 20 | 15-19 Sub | 5 | sayilar-2 | kesir-gosterim | 2 | MAT.5.1.3 |
| 21 | 22-26 Sub | 5 | sayilar-2 | kesir-gosterim | 3 | MAT.5.1.3 |
| 22 | 1-5 Mar | 2+3 | sayilar-2 | kesir-gosterim / kesir-karsilastirma | 4 / 1 | MAT.5.1.3, MAT.5.1.4 |
| 23 | 15-19 Mar | 5 | sayilar-2 | kesir-karsilastirma | 2 | MAT.5.1.4 |
| 24 | 22-26 Mar | 5 | sayilar-2 | kesir-karsilastirma | 3 | MAT.5.1.4 |
| 25 | 29 Mar-2 Nis | 3 | sayilar-2 | kesir-karsilastirma | 4 | MAT.5.1.4 |
| 26 | 5-9 Nis | 5 | istatistik | kategorik-veri | 1 | MAT.5.5.1 |
| 27 | 12-16 Nis | 5 | istatistik | kategorik-veri | 2 | MAT.5.5.1 |
| 28 | 19-23 Nis | 5 | istatistik | kategorik-veri | 3 | MAT.5.5.1 |
| 29 | 26-30 Nis | 3+2 | istatistik | kategorik-veri / veri-yorumlama | 4 / 1 | MAT.5.5.1, MAT.5.5.2 |
| 30 | 3-7 May | 4+1 | istatistik + cebir | veri-yorumlama / esitlik-islem-ozellikleri | 2 / 1 | MAT.5.5.2, MAT.5.2.1 |
| 31 | 10-14 May | 5 | cebir | esitlik-islem-ozellikleri | 2 | MAT.5.2.1 |
| 32 | 20-21 May | 5 | cebir | islem-onceligi / oruntuler | 1 / 1 | MAT.5.2.2, MAT.5.2.3 |
| 33 | 24-28 May | 4+1 | cebir | oruntuler | 2 | MAT.5.2.3 |
| 34 | 31 May-4 Haz | 3 | cebir | algoritma | 1 | MAT.5.2.4 |
| 35 | 7-11 Haz | 1+4 | cebir + olasilik | algoritma / olasilik | 2 / 1 | MAT.5.2.4, MAT.5.6.1 |
| 36 | 14-18 Haz | 5 | olasilik | olasilik | 2 | MAT.5.6.2 |
| 37 | 21-25 Haz | 5 | - | sosyal etkinlik, ders yok | - | - |

Alti hafta (14, 22, 29, 30, 32, 35) iki konuya birden dusuyor. Bu uydurma
degil, planin kendisi o haftalarda ders saatini boluyor. Veri modeli bir
haftanin bir veya iki konu-seviye ciftine baglanmasini desteklemek zorunda.

### 4.4 `src/data/konular/<konu>.js`

15 dosya, asil icerik burada.

```js
export default {
  id: 'dikdortgen',
  ad: { tr: 'Dikdortgenin Cevresi ve Alani' },
  kazanimlar: [
    { kod: 'MAT.5.4.2', metin: 'Birim karelerden yola cikarak dikdortgenin alanini degerlendirebilme' }
  ],
  seviyeler: [
    {
      seviye: 1,
      baslik: 'Cevre nedir?',
      anlatim: [
        { id: 'a1', metin: 'Bir dikdortgenin etrafini bir kez dolasirsan...', ses: 'dikdortgen-1-a1', gorsel: 'cevre-tur' },
        { id: 'a2', metin: '...', ses: 'dikdortgen-1-a2' }
      ],
      ornekler: [
        { soru: 'Kisa kenari 5, uzun kenari 7 olan dikdortgenin cevresi kactir?',
          adimlar: ['Karsilikli kenarlar esit', '5 + 7 = 12', '12 x 2 = 24'],
          cevap: '24' }
      ],
      etkilesim: { widget: 'birim-kare', gorev: 'Cevresi 24 olan farkli dikdortgenler kur' },
      uretici: 'dikdortgen',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    }
  ]
};
```

`ses` alani dosya adi tasir, uzanti tasimaz. `sesler/dikdortgen-1-a1.m4a`
varsa calinir, yoksa `metin` cihaz TTS'ine verilir. Bu yuzden ses uretimi
kod yazimini bekletmez, sonradan damlayarak gelebilir.

### 4.5 Kalici durum

`core/state.js` icine `loadDersIlerleme` / `saveDersIlerleme` eklenir.
Depolama anahtari `ataol:ders`.

```js
{
  haftalar: {
    '3': {
      anlatim: ['a1', 'a2'],                 // bitirilen adim id'leri
      etkilesimBitti: true,
      alistirma: { 'aci-okuma': { box: 3, seen: 12, correct: 9, ... } },
      quiz: { enIyi: 90, denemeler: 3, yildizAlindi: true }
    }
  },
  sinavlar: {
    'unite-geometrik-sekiller': { puan: 84, gecti: true, tarih: '2026-11-08', yildizAlindi: true },
    'donem-1': { ... }
  },
  ayar: { sesAcik: true, otomatikOynat: true, sabitHafta: null, sesliCevap: false }
}
```

`sabitHafta: null` tarihten otomatik bulma demek. Ebeveyn panelinden bir
hafta numarasi girilirse takvim yerine o kullanilir. Cocuk okuldan geri
kaldiginda veya ileri gitmek istediginde gerekir.

## 5. Motorlar

Hepsi saf, `rng` ve tarih disaridan enjekte edilir.

### 5.1 `src/engines/mufredat.js`

```js
haftaBul(takvim, tatiller, tarih)  // { tip: 'ders', hafta } | { tip: 'tatil', ad, bas, bit }
haftaGezin(takvim, haftaNo, yon)   // onceki / sonraki ders haftasi
uniteHaftalari(uniteId)
kazanimDurumu(takvim, ilerleme)    // MAT kodu bazli { kod, hafta, durum } listesi
```

### 5.2 `src/engines/ders.js`

Ders akisinin durum makinesi. Ekranlar arasi gecisin kurallari burada,
DOM'da degil.

```js
dersDurumu(konu, seviye, ilerleme)
// { asama: 'anlatim' | 'etkilesim' | 'ornek' | 'alistirma' | 'quiz' | 'bitti',
//   adimIndex, tamamlanan: { anlatim, etkilesim, alistirma, quiz } }

adimIlerlet(durum)
asamaTamamla(durum, asama)
```

### 5.3 `src/engines/sinav.js`

```js
sinavKur(havuz, { soruSayisi, agirliklar }, rng)
cevapla(sinav, index, cevap)
puanla(sinav)  // { dogru, toplam, yuzde, gecti, konuBazli: { 'kesir-karsilastirma': { dogru: 3, toplam: 6 } } }
```

`agirliklar` unitedeki konu-seviye sayisina gore orantili dagitim yapar:
5 seviyeli bir konu, 2 seviyeli bir konudan daha cok soru alir.

### 5.4 `src/engines/uretici/`

15 uretici dosyasi ve bir kayit defteri (`index.js`). Her uretici:

```js
export function uret(seviye, rng) { ... }
```

Ortak cikti sekli:

```js
{
  tip: 'dikdortgen-cevre',       // Leitner kutu anahtari, ornek degil TIP
  bicim: 'secmeli' | 'sayi' | 'siralama' | 'esleme' | 'widget',
  soru: { tr: '...' },
  secenekler: ['24', '18', '12', '36'],   // bicim === 'secmeli'
  dogru: 0,
  cevap: 24,                              // bicim === 'sayi'
  cozum: ['Karsilikli kenarlar esit', '5 + 7 = 12', '12 x 2 = 24'],
  gorsel: { widget: 'birim-kare', en: 5, boy: 7 }   // istege bagli
}
```

Iki kural:

**Cevap insa yoluyla dogru.** Uretici once parametreleri secer (kisa kenar
5, uzun kenar 7), sonra cevabi o parametrelerden hesaplar. Hicbir yerde
"cevap muhtemelen su" yoktur. Matematik hatasi yapisal olarak imkansizdir.

**Celdiriciler gercek hatalardan uretilir.** Dikdortgen cevresinde
celdiriciler rastgele sayi degildir: alani hesaplamis hali (35), ikiyle
carpmayi unutmus hali (12), tek kenari iki katlamis hali (19). Yanlis
secildiginde `cozum` adimlari hangi hatanin yapildigini gosterir. Rastgele
celdirici ogretmez, hata celdiricisi ogretir.

Alistirma sinirsizdir ve mevcut `engines/leitner.js` kutularini `tip`
anahtariyla kullanir. Yanlis yapilan tip 1. kutuya duser ve daha sik gelir.

### 5.5 `src/engines/widgets/`

Matematigi onemli olan widget'larin saf hesabi. Yalnizca dort tane:
`birimkare.js`, `kesir.js`, `aci.js`, `terazi.js`. Sadece cizim yapan
widget'lar icin ayri motor acilmaz, gereksiz katman olur.

## 6. Etkilesimli widget'lar

15 konu icin 15 ayri widget gereksiz. Paylastirilinca 6 canvas ve 5 basit
DOM widget'i kaliyor.

| Widget | Tip | Konular | Islev |
|---|---|---|---|
| `geometri-tuval` | canvas | temel-cizimler, cokgenler-cember | Nokta, dogru, dogru parcasi, isin, aci, cember, dikme cizer. Ardisik kesisen dogrularla cokgen olusturur, kenar ve kose sayar. Kesisen iki cemberden ucgen insa eder, turunu soyler |
| `aciolcer` | canvas | aci-olcme | Yarim daire aciolceri surukleyip hizalama, derece okuma. Iki ve uc dogru kesisiminde komsu ve ters acilari renklendirme |
| `birim-kare` | canvas | dikdortgen | Kenarlari surukle, birim kareler dolsun, alan ve cevre canli guncellensin. "Cevresi 24 olan kac farkli dikdortgen var" kesfi |
| `kesir-modeli` | canvas | kesir-gosterim, kesir-karsilastirma | Kesir cubugu, yuzluk kart ve sayi dogrusu senkron. Birini degistir, bilesik, tam sayili, ondalik ve yuzde hepsi guncellensin |
| `grafik-tuval` | canvas | kategorik-veri, veri-yorumlama | Veri gir, siklik tablosu, sutun, daire ve nokta grafigi arasinda gec. Yaniltici grafik avi (kirpilmis eksen) |
| `terazi` | canvas | esitlik-islem-ozellikleri | Iki kefe, ayni seyi ekle cikar, denge bozulmasin. Dagilma ozelligi icin blok dizilimi |
| `basamak-tablosu` | DOM | cok-basamakli-sayilar | Bolukler renkli, sayiyi yaz okunusu ciksin ve duyulsun, ters yonde de calissin |
| `parantez` | DOM | islem-onceligi | Ayni sayi dizisine parantez koy, sonuc degissin |
| `oruntu` | DOM | oruntuler | Sayi ve sekil oruntusu, sonraki terimi bul, kurali sec |
| `olasilik-spektrumu` | DOM | olasilik | 0 ile 1 arasi cizgi, olay kartini dogru yere surukle |
| `cozum-seridi` | DOM | dort-islem-problem, algoritma | Problemi verilen ve istenen diye ayirma, bar model, akis semasi tablosu |

Her widget `ui/widget/<ad>.js` altinda ve su arayuzu saglar:

```js
create(kok, { gorev, veri, ses }) -> { ciz(), temizle(), dogrula() -> bool, yokEt() }
```

## 7. Ses katmani

### 7.1 Calisma ani: `src/ui/ses.js`

```js
createSes({ speechSynthesis, AudioContext, Audio, sesAcik })
  .oku(anlatimAdimi)   // ses dosyasi varsa cal, yoksa TTS ile oku
  .dur()
  .efekt('dogru' | 'yanlis' | 'kutlama' | 'tik')
```

- `efekt` sesleri Web Audio ile kod icinde sentezlenir, hicbir dosya inmez
- `oku` once `sesler/<id>.m4a` dener, bulamazsa cihaz TTS'ine duser
- iOS'ta ses calmak icin kullanici dokunusu sarttir; "Derse basla" butonu
  o dokunus olur ve AudioContext orada resume edilir
- Bu dosya `document` gecmez (speechSynthesis ve AudioContext gerektirmez),
  yani mimari testin DOM kuralina takilmaz

### 7.2 Uretim: `tools/ses-uret.js`

Uygulamanin parcasi degildir, elle calistirilir. `tools/make-icons.js`
zaten ayni sekilde calisiyor, emsal var, "build adimi yok" kurali bozulmaz.

- Konu dosyalarini okur, `anlatim[].metin` alanlarini toplar
- Google Cloud Text-to-Speech Chirp 3 HD'ye gonderir (tr-TR)
- `sesler/<id>.m4a` uretir, 32 kbps mono AAC
- API anahtari ortam degiskeninden okunur, repoya girmez

Hacim tahmini: ~30 ders haftasi, hafta basina 5-6 dakika anlatim, Turkce
konusma dakikada ~900 karakter. Toplam ~150.000 karakter, ~165 dakika ses,
~38 MB, hafta basina ~1.3 MB.

Maliyet: Chirp 3 HD milyon karakter basi 30 USD, aylik ilk 1M karakter
ucretsiz. 150k karakterlik ihtiyac ucretsiz kotaya siginir.

Gelecege acik kapi: ses kaynagini degistirmek yalnizca bu scripti
degistirmeyi gerektirir. Uygulama kodu `sesler/*.m4a` dosyasina bakar,
kimin urettigini bilmez. Ileride ElevenLabs ses klonu ya da Gemini cift
sesli diyalog kullanilmak istenirse uygulama kodu aynen kalir.

### 7.3 Dinamik metin

Uretilen sorular her seferinde farkli sayi tasidigi icin onceden
seslendirilemez. Faz 1'de sorular cihaz TTS'i ile okunur. Faz 6'da Turkce
sayi sozcuklerinden olusan kucuk bir parca bankasi (bir, iki, ... yirmi,
otuz, yuz, bin, yaklasik 40 parca) ayni sesle uretilir ve soru kaliplariyla
birlestirilir. Turkcede sayilar boslukla ayri yazildigi icin birlestirme
temiz duyulur.

### 7.4 Sesli cevap (deneysel)

Ebeveyn panelinden acilan anahtar, varsayilan kapali. `webkitSpeechRecognition`
ile yalnizca sayi bicimli cevaplarda calisir ve mutlaka bir onay adimi
gosterir ("64 dedin, dogru mu?"). Tanima hatasi cocugun dogru cevabini
yanlis saymamalidir. Faz 6.

## 8. AI aciklama katmani

"Anlamadim, baska turlu anlat" butonu mevcut `engines/ai.js` uzerinden
Gemini'ye gider. Isteme su baglam gomulur: konu adi, kazanim metni, hangi
anlatim adiminda takildigi, cocugun yasi.

Iki siki kural isteme yazilir:

1. Yeni soru uretme
2. Quiz veya sinav cevabi verme

Gerekce: ders icerigi ve sorular offline ve dogrulanmis kalmali. AI yalnizca
anlatir. Internet yoksa buton gorunmez ve dersin tamami offline calisir.

## 9. Odul ekonomisi

Mevcut ekonomi: gunluk rutin toplami 30 yildiz, odul merdiveni 60'tan
1200'e, gunluk ekran suresi tavani 60 dakika.

| Ne | Yildiz |
|---|---|
| Haftanin anlatimini bitirme | 4 |
| Kendin dene gorevini tamamlama | 3 |
| Hafta quizinden gecme (70+) | 6 |
| Hafta quizinde tam puan | 10 (6 yerine) |
| Unite sinavindan gecme | 15 |
| Donem sinavindan gecme | 25 |
| Alistirma | 0 |

Normal hafta 13, mukemmel hafta 17 yildiz. Yil toplami yaklasik 490,
gunluk rutin 30 verdigine gore yaklasik 16 gunluk rutine denk.

Alistirma bilincli olarak sifir: sinirsiz uretiliyor, yildiz verilirse cocuk
ogrenmek yerine yildiz basmaya oynar.

**Dakika (ekran suresi) verilmez, yalnizca yildiz.** `defaults.js` icindeki
tavan mantigi buna izin vermiyor: "mukemmel gun tam 60'a denk gelir, yani
tavan mukemmel gunde devreye girer ve her sey bitti, sinirsiz ekran durumu
olusmaz". Ders dakikasi eklenirse o tavan asilir.

**Yildiz rutin karti uzerinden degil, dogrudan `dayProgress.stars`'a
yazilir.** Gerekce: rutin kartlari blok sirasina gore kilitleniyor
(`cardStates` icindeki `previousClosed` mantigi). Ders sekmesi serbest
erisimli oldugu icin ikisi baglanirsa "sabah dersi yaptim ama ogle blogu
acilmadi, yildizim gelmedi" hatasi cikar. Ebeveyn raporunda ders ayri satir
olarak gorunur.

### 9.1 Rozetler

`engines/rozetler.js` icine uc yeni rozet, `istatistik` nesnesine uc yeni
sayac (`dersHaftalari`, `gecilenSinavlar`, `tamPuanQuiz`).

| Rozet | Emoji | Hedef |
|---|---|---|
| Ogrenci | kitap | 10 hafta tamamlama |
| Sinavci | mezuniyet | 3 unite sinavi gecme |
| Tam Puan | 100 | 5 tam puanli quiz |

## 10. Quiz ve sinav sistemi

| | Hafta quizi | Unite sinavi | Donem sinavi |
|---|---|---|---|
| Soru | 10 | 20 | 30 |
| Kapsam | O haftanin konu-seviyesi | Unitenin tum haftalari | Donemin tum uniteleri |
| Geri bildirim | Her soruda aninda | Sonda, toplu | Sonda, toplu |
| Gecme notu | 70 | 60 | 60 |
| Sure siniri | Yok | Yok | Yok |

Quiz aninda geri bildirim verir cunku ogretme aracidir. Sinav sonda verir
cunku olcme aracidir. Ikisi farkli islerdir.

**Sure siniri bilincli olarak yok.** 10 yasinda bir cocuk kronometreyle
paniklerse olculen sey matematik degil kaygi olur.

Sinav takvimi: 7 unite sinavi (8, 14, 18, 25, 30, 35, 36. haftalar sonunda)
ve 2 donem sinavi (18. hafta sonu 1-18 kapsar, 36. hafta sonu 19-36 kapsar).
Unite bitmeden sinavi acilmaz.

Sonuc ekrani konu bazli kirilim gosterir ve zayif konunun yaninda "tekrar
calisalim" butonu bulunur, dogrudan o konunun alistirmasina atlar. Not
vermek tek basina ise yaramaz, nereye gidilecegini soylemesi gerekir.

## 11. Ekranlar

Alt menu 5 sekme olur, `Ders` ikinci siraya girer (ikon `school`):
**Rutin, Ders, Ebeveyn, Oyun, Sohbet**.

Sekme icinde tek bir `view-ders` vardir, ekranlar onun icinde degisir.

1. **Hafta ekrani (giris).** Bu haftanin karti: unite, konu, tarih araligi.
   Dort asamali ilerleme cubugu (anlatim / kendin dene / alistirma / quiz).
   Sag sol oklarla hafta gezinme, "tum haftalar" listesi. Tatil haftasindaysa
   tatil karti ve gecmis haftalari tekrar etme onerisi.
2. **Anlatim.** Adim adim, ses otomatik calar, "tekrar dinle" ve "Anlamadim"
   butonlari.
3. **Kendin dene.** Widget tam ekran, gorev metni ustte.
4. **Ornek cozum.** Adimlar tek tek acilir, hepsi birden degil.
5. **Alistirma.** Soru, aninda geri bildirim, yanlista cozum adimlari,
   sinirsiz devam.
6. **Quiz.** 10 soru, ilerleme gostergesi, sonuc ve yildiz kutlamasi.
7. **Sinav.** Sorular arasinda ileri geri gezinme, isaretleyip sonra donme,
   "sinavi bitir" onayi, sonucta konu bazli kirilim.
8. **Ebeveyn paneline ek bolum.** Kazanim durumu tablosu, sinav notlari,
   sabit hafta ayari, ses ayari, sesli cevap deneysel anahtari.

## 12. Dosya yapisi

```
src/data/mufredat.js                takvim + tatiller + uniteler
src/data/konular/*.js               15 dosya, ders icerigi
src/engines/mufredat.js             hafta bulma, gezinme, kazanim durumu
src/engines/ders.js                 ders akisi durum makinesi
src/engines/sinav.js                sinav kurma ve puanlama
src/engines/uretici/index.js        kayit defteri
src/engines/uretici/*.js            15 dosya, soru ureticileri
src/engines/widgets/*.js            4 dosya, widget hesaplari
src/views/ders.js                   ekran modeli, DOM yok
src/ui/ses.js                       TTS + efekt + dosya calma
src/ui/ders-dom.js                  ders ekranlarinin DOM'u
src/ui/widget/*.js                  11 dosya
tools/ses-uret.js                   Chirp 3 HD ile m4a uretimi
sesler/*.m4a                        uretilmis anlatim sesleri
tests/*.test.js                     ~20 yeni test dosyasi
```

Yaklasik 70 yeni dosya. Her biri kucuk ve tek isli, mevcut kodun kalibi
budur. `main.js`'e eklenen yalnizca sekme yonlendirmesi ve `ders-dom.js`
cagrisidir, yaklasik 50 satir.

`v2.html` icine tek bir `<main id="view-ders" class="v2-view"></main>` ve
nav'a bir buton eklenir. Ders ekranlari `ders-dom.js` tarafindan uretilir,
HTML'de stub tutulmaz.

`sw.js` guncellenir: yeni `src/` dosyalari precache listesine girer,
`CACHE_NAME` v37'den v38'e cikar. **`sesler/` precache listesine girmez**,
runtime cache'e birakilir. 38 MB kurulumda indirilmeye calisilirsa iOS'ta
PWA kurulumu coker.

## 13. Test stratejisi

### 13.1 Uretici testleri (en kritik)

Her uretici 200 farkli tohumla calistirilir, her turda dort sey dogrulanir:

1. Cevap, ureticinin sectigi parametrelerden bagimsiz olarak yeniden
   hesaplanip karsilastirilir
2. Dogru cevap secenekler icinde tam olarak bir kez gecer
3. Celdiriciler hem birbirinden hem dogrudan farklidir
4. `cozum` adimlari bos degildir

Bu, yanlis matematik ogretme riskine karsi asil savunmadir.

### 13.2 Diger testler

- `mufredat.test.js`: 37 haftanin hepsi bir konuya eslenmis mi, tatil
  tarihleri haftalarla cakisiyor mu, her konunun her seviyesi en az bir
  haftada kullaniliyor mu, kazanim kodlari Excel'deki ile birebir mi
- `sinav.test.js`: soru dagilimi konulara orantili mi, puanlama ve gecme
  esikleri dogru mu
- `ders.test.js`: akis durum makinesi
- `ses.test.js`: sahte `speechSynthesis` ve `AudioContext` enjekte edilip
  "dosya var" ve "dosya yok" dallari
- `widgets-*.test.js`: birim kare alani, kesir denklikleri, aci hesabi,
  terazi dengesi
- `architecture.test.js` guncellemesi: `ui/` alti DOM kullanabilir

## 14. Fazlama

| Faz | Kapsam | Sonuc |
|---|---|---|
| 0 | Iskelet: mufredat verisi, hafta motoru, state, Ders sekmesi, hafta ekrani, ses katmani, uretim scripti | Bos hafta kartlari gorunur |
| 1 | Geometrik Sekiller (h1-8): 3 konu, 8 seviye, `geometri-tuval` + `aciolcer`, 3 uretici, quiz, unite sinavi | Cocuk kullanmaya baslar |
| 2 | Sayilar 1 + Geometrik Nicelikler (h9-18): 3 konu, `basamak-tablosu` + `cozum-seridi` + `birim-kare`, 1. donem sinavi | |
| 3 | Kesirler (h19-25): 2 konu, `kesir-modeli` | |
| 4 | Istatistik (h26-30): 2 konu, `grafik-tuval` | |
| 5 | Cebir + Olasilik (h30-36): 5 konu, `terazi`, `parantez`, `oruntu`, `olasilik-spektrumu`, 2. donem sinavi | Mufredat tamam |
| 6 | Tum haftalarin Chirp 3 HD ile seslendirilmesi, sayi parca bankasi, sesli cevap deneysel anahtari | |

**Takvim baskisi.** Bugun 21 Eylul 2026, okul 14 Eylul'de basladi, cocuk su
an 2. haftada ve konu "Temel Geometrik Cizimler". Faz 1 aciledir, okulun
gerisinde kalmamak icin once o bitmelidir. Faz 5'in Mayis'a kadar zamani
vardir. Fazlar takvimle hizalanir, hepsi birden yazilmaya calisilmaz.

## 15. Riskler

| Risk | Etki | Onlem |
|---|---|---|
| Yanlis matematik ogretmek | Cok yuksek | Cevap insa yoluyla uretilir, 200 tohumlu property test |
| Icerik yazimi takvimin gerisinde kalir | Yuksek | Fazlama takvimle hizali, Faz 1 once |
| `sesler/` PWA kurulumunu sisirir | Orta | Precache disi, runtime cache, hafta basina ~1.3 MB |
| iOS'ta ses calmaz | Orta | Kullanici dokunusuyla AudioContext resume, TTS'e dusme |
| AI aciklamasi quiz cevabini sizdirir | Orta | Isteme iki siki yasak, offline varsayilan |
| Cihaz TTS'i Turkce okurken matematik ifadelerini bozar | Dusuk | Anlatim metinleri sayi yerine sozcuk kullanacak sekilde yazilir |
| `main.js` daha da siser | Dusuk | Yeni DOM `ui/ders-dom.js` altinda, main.js'e ~50 satir |

## 16. Kararlar ve gerekceleri (ozet)

| Karar | Gerekce |
|---|---|
| Hibrit icerik + AI aciklama katmani | Ders ve sorular offline ve dogrulanmis kalir, AI yalnizca anlatir |
| Konu merkezli, haftalar konuya eslenir | Tekrar eden icerik tek yerde durur, gelecek yil takvim degisirse yalnizca tablo guncellenir |
| Kazanim kodu etiket olarak | Ebeveyn raporu MEB'e uyar, cocuk kodu gormez |
| Google Cloud Chirp 3 HD | Aylik 1M karakter ucretsiz kotasi ihtiyaci karsiliyor, kalite yeterli |
| Onceden uretilmis ses dosyalari | Calisma ani maliyeti sifir, offline calisir, gecikme yok, cocugun telefonunda API anahtari gerekmez |
| Ses dosyasi yoksa TTS'e dus | Ses uretimi kod yazimini bekletmez, sonradan damlayabilir |
| Yeni alt sekme | Her gun girilecek bir sey bir dokunus uzakta olmali, oyunlardan ayri durmali |
| Yildiz evet, dakika hayir | Ekran suresi tavani bilincli konmus, ders dakikasi onu asar |
| Yildiz dogrudan `dayProgress.stars`'a | Rutin kartlari blok sirasina kilitli, ders sekmesi serbest erisimli |
| Sinavda sure siniri yok | Kronometre 10 yasinda kaygiyi olcer, matematigi degil |
| Yalnizca Turkce ders icerigi | MEB mufredati, Ingilizceye cevirmek hem is hem anlamsiz |
| `ui/` alti DOM kullanabilir | Alternatifi 99 KB'lik `main.js`'i 150 KB'a cikarmakti |

## 17. Uygulama planinin kapsami

Bu tasarim yedi fazi birden tarif eder ama tek bir uygulama plani yedi fazi
birden tasimaz. Ilk uygulama plani **Faz 0 ve Faz 1**'i kapsar: iskelet,
Ders sekmesi, ses katmani, Geometrik Sekiller unitesinin sekiz haftasi,
iki widget, uc uretici, hafta quizi ve unite sinavi. Faz 1 bittiginde cocuk
modulu gercekten kullanmaya baslar.

Faz 2'den itibaren her faz kendi uygulama planini alir. Gerekce: Faz 1
calistiktan sonra gercek kullanimdan gelen geri bildirim sonraki fazlarin
icerigini degistirir, hepsini simdiden planlamak o geri bildirimi israf eder.

## 18. Acik sorular

Yok.
