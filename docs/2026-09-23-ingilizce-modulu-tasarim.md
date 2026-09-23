# 5. Sinif Ingilizce Modulu - Tasarim

**Tarih:** 2026-09-23
**Durum:** Onaylandi, uygulamaya hazir
**Kaynak:** `INGILIZCE (5.SINIF) TASLAK YILLIK CERCEVE PLAN.xlsx` (MEB 2026-2027)

---

## 1. Amac

Deha'nin 5. sinif Ingilizce mufredatini uygulamadan calisabilmesi. Matematik
modulunun yaninda, ayni Ders sekmesi altinda, ders secici ile.

Uc parca:
1. **Ders seti** - 8 temaya bagli, hafta hafta ilerleyen dil ogretimi
2. **Sozluk** - ~700 kelime, iki yonlu arama, gorsel ve ses ile
3. **Ses** - Ingilizce telaffuz (en-US Chirp 3 HD), Turkce anlatim (mevcut tr-TR)

## 2. Mufredat (Excel'den dogrulandi, uydurulmadi)

37 hafta, 8 tema. Hafta 1-3 oryantasyon ve tekrar, tema yok.

| Hafta | Tema |
|---|---|
| 1 | ORIENTATION |
| 2-3 | REVISION |
| 4-7 | THEME 1: SCHOOL LIFE |
| 8-12 | THEME 2: CLASSROOM LIFE |
| 13-16 | THEME 3: PERSONAL LIFE |
| 17-20 | THEME 4: FAMILY LIFE |
| 21-24 | THEME 5: LIFE IN THE NEIGHBOURHOOD AND CITY |
| 25-28 | THEME 6: LIFE IN THE WORLD |
| 29-32 | THEME 7: LIFE IN NATURE |
| 33-37 | THEME 8: LIFE IN THE UNIVERSE AND FUTURE |

Alt temalar (Excel'deki "Sub-Themes" sutunu):

1. Okuldaki kisiler, yerler ve kurallar; okul kulupleri; ulkeler; milli gunler
2. Sinif kurallari ve dili; dersler; ders programi; sinif esyalari; gunler
3. Temel vucut bolumleri ve fiziksel ozellikler; kiyafetler; gunluk rutinler
4. Aile bireylerinin rutinleri; aile bireylerinin hobileri ve etkinlikleri
5. Mahalle ve sehirdeki dinlenme yerleri ve gezilecek yerler; ev tipleri
6. Temel yiyecek turleri; restoranda siparis; yemek etkinlikleri
7. Doğadaki hayvan turleri; vahsi hayvanlar; yasam alanlari
8. Dunya gezegeni; tatiller; okul tatilleri, yerler, etkinlikler ve planlar

Kazanimlar tema basina dort tane ve hepsi dinleme/izleme-anlama odakli
(`ENG.5.<tema>.L1..L4`). Bu mufredatin kendi vurgusu; modul de dinlemeyi
merkeze aliyor.

**Karar D1: Takvim PAYLASILIR, kopyalanmaz.** Ingilizce takvimi matematikle
birebir ayni cikti (10 ornek noktada dogrulandi: hafta 1, 2, 3, 4, 8, 9, 10,
19, 23, 37). `src/data/mufredat.js` icindeki `TAKVIM` tek kaynak olarak
kullanilir. Iki kopya tutulsaydi biri duzeltilip digeri unutuldugunda cocuk
iki derste farkli hafta gorurdu.

## 3. Veri modeli

### 3.1 Kelime kaydi

```js
{
  id: 'school-bag',
  en: 'school bag',
  tr: 'okul çantası',
  tema: 1,
  tur: 'isim',                              // isim | fiil | sifat | edat | ifade
  gorsel: { tip: 'emoji', deger: '🎒' },     // veya { tip: 'cizim', ad: 'timetable' }
  ornek: { en: 'My school bag is red.', tr: 'Okul çantam kırmızı.' }
}
```

**Karar D2: Ses dosyasi adi TURETILIR, alan olarak tutulmaz.** `id` alanindan
`sesler/en/<id>.mp3` ve `sesler/en/<id>-ornek.mp3` uretilir. Matematik
modulunde `adimKimligi` ile ogrenilen ders: uretim tarafi ile okuma tarafi
kendi kopyalarini tasirsa bir gun sessizce ayrisir ve hicbir sey patlamaz,
yalnizca ses gelmez.

**Karar D3: `id` kelimeden turetilir ama SABITLENIR.** `'school bag'` ->
`'school-bag'`. Kural kodda tek bir fonksiyonda (`kelimeKimligi`) durur, ama
uretilen deger veri dosyasina YAZILIR. Boylece bir kelimenin yazimi duzelirse
(`'colour'` -> `'color'`) ses dosyasi adi degismez ve cocugun ilerlemesi
kopmaz.

### 3.2 Ders icerigi

Her tema bir dosya: `src/data/ingilizce/temalar/<tema>.js`

```js
{
  no: 1,
  ad: { en: 'School Life', tr: 'Okul Hayatı' },
  kazanimlar: [{ kod: 'ENG.5.1.L1', metin: '...' }, ...],
  haftalar: [
    {
      hafta: 4,
      baslik: { en: 'People at school', tr: 'Okuldaki kişiler' },
      kelimeler: ['teacher', 'student', 'principal', ...],   // sozluk id'leri
      anlatim: [
        {
          id: 'a1',
          tr: 'Okuldaki kişileri İngilizce söylerken...',    // Turkce, seslendirilir
          en: 'This is my teacher.',                          // Ingilizce ornek
          gorsel: 'okul-kisiler'
        }
      ],
      cumleler: [                                             // "cumle kur" asamasi
        { parcalar: ['This', 'is', 'my', 'teacher'], tr: 'Bu benim öğretmenim.' }
      ]
    }
  ]
}
```

## 4. Sozluk motoru

`src/engines/ingilizce/sozluk.js` - saf katman, DOM yok, rastgele yok.

```js
export function ara(sozluk, sorgu, { limit = 20 } = {}) -> Array<{ kelime, yon, skor }>
export function normalize(metin) -> string
```

**Karar D4: Turkce diakritikleri aramada YOK SAYILIR.** On yasindaki bir cocuk
telefonda "canta" yazar, "çanta" degil. `normalize` sunlari esler:
`ç/c`, `ğ/g`, `ı/i`, `i/İ`, `ö/o`, `ş/s`, `ü/u`, ve buyuk/kucuk harf.
Turkce'ye ozgu tuzak: `toLowerCase()` `'I'` harfini `'i'` yapar ama Turkce'de
`'I'`nin kucugu `'ı'`dir. `toLocaleLowerCase('tr')` kullanilir ve testi yazilir.

**Karar D5: Arama IKI YONLU ve yon SONUCTA belirtilir.** `'bag'` sorgusu hem
Ingilizce eslesmeyi (`bag -> çanta`) hem Turkce eslesmeyi (varsa) dondurur.
Her sonuc hangi yonden eslestigini tasir ki ekran dogru tarafi vurgulayabilsin.

Siralama (skor, buyukten kucuge):
1. Tam eslesme
2. Bastan eslesme (`'sch'` -> `'school'`)
3. Kelime sinirinda eslesme (`'bag'` -> `'school bag'`)
4. Icinde gecen

## 5. Ders akisi

Alti asama. Matematikteki dort asamadan farkli: dil ogreniminde tekrar ve
dinleme merkezde.

| # | Asama | Ne yapar | Yildiz |
|---|---|---|---|
| 1 | Kelime kartlari | Gorsel + Ingilizce ses + ornek cumle; ileri/geri | 4 |
| 2 | Dinle, sec | Kelimeyi duyar, dort gorselden dogrusunu secer | 3 |
| 3 | Soyle, dinle | Model sesi dinler, kendi sesini kaydeder, ikisini karsilastirir | 0 |
| 4 | Cumle kur | Kelimeleri surukleyip dogru siraya dizer | 0 |
| 5 | Hafta quizi | 10 soru, %70 gecme | 6 / 10 (tam puan) |
| 6 | Tema sinavi | 20 soru, %60 gecme, temanin tum haftalari gectikten sonra | 15 |

Yildiz matematikle ayni kuralla odenir: **bir kez ever**, tekrar gecmek odul
vermez.

**Karar D12: Hafta basina yildiz matematikle AYNI olmali: 13.** Ilk taslakta
alti asamanin besi yildiz verince hafta basi 19 cikiyordu; matematikte 13
(`4 + 3 + 0 + 6`). Yildiz iki ders arasinda ORTAK para birimi: Ingilizce %46
fazla oderse Deha rasyonel olarak matematigi biraakip Ingilizce yapar ve
odul sistemi dersi degil kendini optimize etmis olur.

Kural her iki derste ayni: **sinirsiz tekrar edilebilen asama yildiz VERMEZ.**
Matematikte alistirma boyle (istedigin kadar soru cozersin). Ingilizcede
soyle-dinle ve cumle kur boyle: ikisi de bitmez, cocuk istedigi kadar
tekrarlar. Yildiz olcen degil, biten asamalara odenir.

Dogrulama: `4 + 3 + 0 + 0 + 6 = 13`. Tema sinavi 15, matematikteki unite
sinavi da 15.

**Karar D6: 3. asama KONUSMA TANIMA DEGIL, kayit-ve-dinlet.** Web Speech API'nin
`SpeechRecognition` parcasi iOS Safari'de yok; hedef cihaz iPhone. Onun yerine
`MediaRecorder` ile kayit alinir ve model sesiyle arka arkaya calinir; cocuk
kendi karsilastirir. Pedagojik olarak da savunulabilir: kendi sesini duymak
telaffuz duzeltmenin bilinen yoludur. **Uygulama sirasinda gercek iPhone'da
dogrulanacak;** calismazsa asama "dinle ve tekrarla" (kayit yok) seklinde
sadelesir ve bu kullaniciya SOYLENIR, sessizce kirik birakilmaz.

**Karar D7: Mikrofon izni ISTENMEDEN once aciklanir.** Cocuga "konusmani
kaydedeyim mi" diye sorulur; reddederse asama atlanabilir ve yildizi
alistirma uzerinden kazanilabilir. Izin kutusu aniden cikmaz.

## 6. Gorseller

**Karar D8: Emoji + elle cizim karisik.** Somut isimler emoji ile
(`🎒 school bag`, `🍎 apple`, `🐘 elephant`), emoji karsiligi olmayanlar
(`in/on/under`, `timetable`, `borrow`) tuvale cizilir.

Emoji bedava, aninda, cevrimdisi calisir ve depoyu buyutmez. Kapsam tahminim
~450/700 ama **bu bir tahmin**; kelime listesi cikinca gercek sayi olculup
raporlanacak, kalanlar cizilecek.

Cizimler matematik modulunun `src/ui/gorsel/` altyapisini kullanir; sozlesme
ayni (`create(canvas, { ses }) -> { ciz, dokun, ipucu }`). Yeni dosya:
`src/ui/gorsel/ingilizce.js`.

## 7. Ses

Iki ayri ses ailesi, ayni Chirp 3 HD servisinden:

| Ne | Dil | Ses | Dosya |
|---|---|---|---|
| Anlatim (aciklama) | tr-TR | mevcut `tr-TR-Chirp3-HD-Aoede` | `sesler/tr-ing/<id>.mp3` |
| Kelime | en-US | `en-US-Chirp3-HD-*` | `sesler/en/<id>.mp3` |
| Ornek cumle | en-US | ayni | `sesler/en/<id>-ornek.mp3` |

**Karar D9: `tools/ses-uret.js` GENISLETILIR, kopyalanmaz.** Mevcut script
konu/seviye/adim uzerinden calisiyor; dil ve ses adi parametre haline
getirilir. Iki ayri script iki ayri dosya adlandirma kurali demektir ve
biri degisince digeri unutulur.

Tahmini hacim: ~700 kelime + ~700 ornek + ~50 anlatim = ~1450 dosya,
**25-35 MB**. Ucretsiz kotanin (aylik 1M karakter) cok altinda.
`sesler/` `sw.js` ASSETS listesine GIRMEZ (iOS'ta PWA kurulumunu kirar),
calisma aninda onbellege alinir.

## 8. Yerlesim ve durum

**Karar D10: Ders sekmesine ders secici.** Alt menu 5 sekmede kalir; iPhone
12'de 6 sekme her birini ~65px'e dusurur ve yazilar kirpilir.

```
[Matematik] [İngilizce]      <- secici, Ders sekmesinin ustunde
-----------------------------
  4. hafta - 5-9 Ekim
  THEME 1: SCHOOL LIFE
  [Kelimeler] [Dinle] [Söyle] [Cümle] [Quiz]
```

**Karar D11: Ilerleme AYRI depoda, ayarlar ORTAK.**
- `ataol2:ingilizce` -> `{ haftalar, sinavlar }` (yalniz ilerleme)
- `ataol2:ders` -> `{ haftalar, sinavlar, ayar }` (matematik ilerlemesi + ORTAK ayarlar)

Alan adlari matematikle BIREBIR AYNI (`haftalar`, `sinavlar`).

Hangi saf fonksiyon tekrar kullanilir, hangisi kullanilamaz - plan yazarken
olculdu, tahmin edilmedi:

| Fonksiyon | Durum | Neden |
|---|---|---|
| `quizBitir` | AYNEN kullanilir | yalniz `kayit.quiz` ve `yildizAlinan`a dokunuyor |
| `sinavBitir` | AYNEN kullanilir | sinav nesnesi uzerinde calisiyor, hafta kaydini hic gormuyor |
| `tamPuanIsaretle` | AYNEN kullanilir | yalniz `yildizAlinan`a bakiyor |
| `yildizVer` | AYNEN kullanilir | ayni |
| `haftaKaydi` / `bosHafta` | KULLANILAMAZ | matematige ozgu alanlar tutuyor (`anlatim`, `etkilesimBitti`, `alistirmaDogru`) |
| `haftaDurumu` / `ASAMALAR` | KULLANILAMAZ | matematikte dort asama, Ingilizcede bes |

Bu yuzden Ingilizce kaydi su iki alani MUTLAKA tasir: `quiz` ve
`yildizAlinan`. Geri kalani kendi alanlari:

```js
{
  kelimeler: [],        // gorulen kelime kartlari
  dinleBitti: false,
  soyleBitti: false,
  cumleBitti: false,
  quiz: { enIyi: 0, denemeler: 0 },   // quizBitir bunu bekliyor
  yildizAlinan: []                    // yildizVer bunu bekliyor
}
```

Sebep: matematik deposu su an canlida ve Deha'nin gercek yildizlarini tutuyor.
Sekilini degistirmek o ilerlemeyi riske atar. Ayri depo eklemek katkisaldir ve
var olani bozamaz. Ayarlar (`sesAcik`, `otomatikOynat`, `sabitHafta`,
`sesliCevap`) ortak kalir: ebeveyn sesi iki kez kapatmak zorunda olmamali ve
sabit hafta tek takvim icin tek olmali.

**Not:** `sesliCevap` ayari Faz 1'de eklenmis ama hicbir sey yapmiyordu
(bilincli bir ileri-hazirlik). 3. asama (soyle-dinle) onun ilk tuketicisi olur.

## 9. Dosya yapisi

```
src/data/ingilizce/
  temalar/<1..8>.js        tema icerigi ve haftalar
  temalar/index.js
  sozluk/<1..8>.js         tema basina kelimeler
  sozluk/index.js          birlestirilmis SOZLUK dizisi
src/engines/ingilizce/
  sozluk.js                ara, normalize, kelimeKimligi
  ders.js                  asama/yildiz/ilerleme mantigi (saf)
  uretici.js               quiz ve sinav sorusu ureticileri
src/views/ingilizce.js     saf sunum modelleri
src/ui/ingilizce-dom.js    ekranlar
src/ui/gorsel/ingilizce.js emoji olmayan kelimelerin cizimleri
src/ui/sozluk-dom.js       sozluk arama ekrani
```

## 10. Test stratejisi

Matematik modulunde ogrenilen kurallar aynen gecerli:

- **Her test isirmali.** Korudugu sey mutasyona ugratilir, KIRMIZI gorulur,
  geri alinir, YESIL gorulur. Bu dalda her Kritik hata suite YESILKEN bulundu.
- **Mimari testi** zaten var ve yeni dosyalari kapsiyor: bagimlilik yonu,
  motor safligi, DOM sinirlari, HTML enjeksiyon yasagi, tuval metinlerinde
  diakritiksiz Turkce yakalama.
- **Sozluk kapsami testi**: veride gecen her kelime id'si sozlukte olmali,
  sozlukteki her kelime en az bir haftaya bagli olmali (olu kelime yok).
- **Gorsel kapsami testi**: matematikteki `gorsel-kayit.test.js` kalibi.
  Emoji olmayan her kelimenin cizimi olmali ya da eksik listesinde gorunmeli.
- **Ses adi testi**: uretim tarafinin yazacagi ad ile okuma tarafinin
  arayacagi ad AYNI fonksiyondan gelmeli.

## 11. Riskler

| Risk | Etki | Onlem |
|---|---|---|
| 700 kelimenin Turkce karsiligi ve ornek cumlesi elle yazilacak; en buyuk is bu | Zaman | Tema tema uretilir, her tema ayri incelemeden gecer |
| Emoji kapsami tahminden dusuk cikabilir | Cizim yuku artar | Liste cikinca OLCULUP raporlanir, tahmin olarak birakilmaz |
| iOS'ta MediaRecorder calismayabilir | 3. asama duser | Gercek cihazda dogrulanir; calismazsa asama sadelesir ve SOYLENIR |
| ~1450 ses dosyasi depoyu buyutur | Depo boyutu | 25-35 MB; GitHub icin sorun degil, ama olculup raporlanir |
| Ingilizce metinlerde Turkce diakritik testi yanlis alarm verebilir | Test gurultusu | Test yalniz `ui/` altini ve Turkce olmasi beklenen alanlari tarar |

## 12. Fazlama

| Faz | Kapsam |
|---|---|
| 0 | Iskelet: ders secici, ayri depo, bos ekranlar, mimari testleri |
| 1 | Sozluk motoru + sozluk ekrani + 1. tema kelimeleri (arama calisir) |
| 2 | 1. tema tam: 4 hafta, 6 asama, quiz, tema sinavi, sesler |
| 3 | 2-4. temalar |
| 4 | 5-8. temalar |
| 5 | Tum kelimelerin sesi ve gorseli tamamlanir, kapsam 100% raporlanir |

Kullanici 8 temayi tek seferde istedi; fazlama isin **teslim sirasi**, kapsam
daraltmasi degil. Her faz sonunda calisan bir sey var.

## 13. Kararlarin ozeti

| No | Karar | Yanlissa bedeli |
|---|---|---|
| D1 | Takvim paylasilir | Iki derste farkli hafta gorunur |
| D2 | Ses adi turetilir | Uretim ve okuma sessizce ayrisir |
| D3 | id turetilir ama veriye yazilir | Yazim duzeltmesi ilerlemeyi koparir |
| D4 | Turkce diakritikler aramada yok sayilir | Cocuk kendi dilinde arayamaz |
| D5 | Arama iki yonlu, yon sonucta | Ekran yanlis tarafi vurgular |
| D6 | Kayit-dinlet, konusma tanima degil | iPhone'da asama hic calismaz |
| D7 | Mikrofon izni once aciklanir | Cocuk ani izin kutusuyla urkutulur |
| D8 | Emoji + cizim karisik | Soyut kelimeler gorselsiz kalir |
| D9 | Ses scripti genisletilir | Iki adlandirma kurali ayrisir |
| D10 | Ders secici, 6. sekme degil | iPhone'da alt menu kirpilir |
| D11 | Ilerleme ayri, ayarlar ortak | Canlidaki yildizlar riske girer |
| D12 | Hafta basina yildiz iki derste de 13 | Cocuk cok odeyen dersi secer, odul sistemi kendini optimize eder |
