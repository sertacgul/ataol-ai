# ATAOL v2 Tasarım Dokümanı

Tarih: 2026-07-24
Durum: Onaylandı, uygulama planı bekliyor

---

## 1. Bağlam

ATAOL AI, 9,5 yaşındaki Deha Ataol GÜL için yazılmış, sunucusuz bir PWA. Mevcut sürüm sohbet tabanlı: Gemini ile konuşma, 9 haftalık sabit matematik planı, yıldız ödülleri, kahraman/fıkra/bilmece içerik havuzları.

v2 iki şeyi değiştiriyor:

1. **Çekirdek iş değişiyor.** Sohbet uygulaması olmaktan çıkıp **günlük rutin motoru** oluyor. Sohbet bir modüle iniyor.
2. **Hedef kitle değişiyor.** Tek çocuk için yazılmış bir araçtan, App Store'da yayınlanacak çok profilli bir ürüne dönüşüyor.

### Çözülmeye çalışılan asıl problem

Çocuğun geçmişi hayatında hiç yapılandırılmış rutin olmamasıyla tanımlı. Gözlenen davranışlar (laf dinlememe, başına buyrukluk, sorumluluk almama) karakter özelliği değil, **düzen eksikliğinin belirtileri**. Buna hafif otizm ve yakın zamanlı bir ev değişikliği ekleniyor.

Tasarımın dayandığı tek varsayım: **öngörülebilirlik direnci azaltır.** Çocuk ne olacağını biliyorsa çatışma düşer. Uygulamanın işi kural koymak değil, kuralı **tarafsız hale getirmek**. Kuralı söyleyen ebeveyn değil ekran olur, böylece çatışma ebeveyn ile çocuk arasından çıkıp çocuk ile program arasına kayar.

---

## 2. Kapsam dışı (bilinçli kararlar)

Bunlar unutulmuş değil, **kasıtlı olarak dışarıda**. Gerekçeleriyle birlikte kayıt altına alınıyor ki ileride yanlışlıkla eklenmesin.

| Dışarıda | Gerekçe |
|---|---|
| Ceza / puan silme mekaniği | Direnci yüksek çocuklarda sistemi düşman haline getirir ve terk edilmesine yol açar. Sadece pozitif kazanç olur. Kötü gün puan kaybettirmez, o günün kazancı olmaz. |
| Deri yolma (kaşıma) davranışının puanlanması | Bu davranış kaygıyla beslenir. Performans baskısı kaygıyı, kaygı davranışı artırır. Sadece **ebeveynin gördüğü nötr kayıt** olarak var olur. Çocuk bu kaydı hiçbir şekilde görmez. |
| Kilo / diyet takibi ve hedefi | Çocukta beden imajı kaygısı zaten mevcut. Uygulama sadece ne yendiğini nötr kaydeder, yorum yapmaz, hedef koymaz. |
| Küfür ve saygısızlığın izlenmesi/puanlanması | Aynı sebep. Ölçmek düzeltmez, sadece utandırır. |
| Meslek hedefi yönlendirmesi | "Taksici olacağım" bir sorun değil, somut düşünen bir çocuk için normal bir cevap. Karşı çıkmak yeni bir çatışma yaratır. İlgi alanı **genişletilir** (harita, şehir, ulaşım, havacılık temalı kahraman ve bilgi kartlarıyla), reddedilmez. |
| Tıbbi iddia veya teşhis | Uygulama "otizm/DEHB/deri yolma için" diye konumlandırılmaz. Hem Apple reddeder hem tıbbi cihaz mevzuatı riski doğar. Konumlandırma: **aile rutini ve alışkanlık uygulaması**. |

### Uygulamanın çözemeyeceği, uzmana ait olanlar

Doküman düzeyinde kayıt: deri yolma, hızlı kilo alımı ve beden imajı kaygısı klinik konulardır ve çocuk psikiyatristi, dermatolog ve çocuk doktoru değerlendirmesi gerektirir. Uygulamanın buradaki tek katkısı **veri toplayıp hekime taşımak** (bkz. Bölüm 3.6).

---

## 3. Faz 1 tasarımı

Faz 1 çıktısı: Deha'nın kullanmaya başlayabileceği, ama mimarisi baştan çok profilli olan PWA.

### 3.1 Temel ilke: kodda kişi adı geçmez

Mevcut kodda "Deha", "Feride", "Sertaç" on ayrı yerde sabit yazılı. Git geçmişi bunun maliyetini gösteriyor: tek bir isim değişikliği (Feris → Feride) dört ayrı commit gerektirmiş.

v2'de tüm kişiselleştirme **veri**ye taşınır:

```js
profile = {
  id, createdAt, schemaVersion,
  child:      { name, birthYear, avatar },
  guardians:  [ { id, name, label, color, pinHash, pinSalt } ],
  cards:      [ { id, type, block, title, icon, stars, minutes, approval } ],
  routine:    { morning: [cardId], afternoon: [cardId], evening: [cardId] },
  rewards:    [ { id, name, emoji, target, claimedAt } ],
  settings:   { dailyMinuteCap, dayResetHour, language, theme }
}
```

`guardians` bir dizi. İki ebeveyn, tek ebeveyn, anneanne, üç bakım veren, hepsi aynı yapıya oturur. `label` serbest metin ("Feride mama", "Anne", "Babaanne").

Deha profili, `data/defaults.js` içindeki şablondan üretilen **ilk profil** olur. Kodda ayrıcalıklı değildir.

### 3.2 Rutin motoru

Gün üç bloğa ayrılır: **Sabah / Okul sonrası / Akşam**. Her blok saat aralığıyla açılır. Blok içindeki kartlar **sırayla** açılır: bir kart kapanmadan sonraki görünmez.

Bu sıralılık kasıtlı. Aynı anda beş görev göstermek, yürütücü işlev zorluğu olan bir çocukta felç etkisi yaratır. Tek kart = tek karar.

Kart tipleri:

| Tip | Onay | Örnek |
|---|---|---|
| `measured` | Yok, uygulama ölçer | Matematik seti |
| `approved` | Ebeveyn PIN'i | Sofrayı kur, çantanı hazırla, duş al |
| `inapp` | Yok, uygulama içinde tamamlanır | Kahraman oku, bilmece çöz, kitap okuma sayacı |
| `silent` | Çocuk görmez | Ebeveyn günlüğü girdisi |

Kart durum makinesi:

```
locked -> available -> (done | awaiting_approval -> approved)
```

`awaiting_approval` durumundaki kart puan vermez. Onaysız görev asla puan üretmez, bu sistemin bel kemiği.

**Gün sıfırlama saati 04:00**, gece yarısı değil. Geç saatte uyanık bir çocuğun günü ortasında sıfırlanmaması için.

### 3.3 Onay ve PIN

Her bakım verenin **kendi PIN'i** olur. Onay ekranı hangi PIN'in girildiğini kaydeder:

```js
approval = { cardId, guardianId, timestamp }
```

Bu kayıt iki işe yarar:

1. Görev gerçekten yapıldı mı sorusunu beyandan çıkarır.
2. **Haftalık özet ekranında** çocuğa "bu hafta Feride Mama sana 8 kez onay verdi" denebilmesini sağlar. Onay veren kişi, kısıtlayan taraftan çıkıp iyi şeylerin kaynağına geçer. Davranış tarafında yapılabilecek en güçlü tek müdahale bu.

**Aile gerçeği, koda ve metinlere yansır.** Feride Mama, babanın eşidir ve **Deha'nın annesi değildir**. Uygulamanın hiçbir yerinde "annen" veya "annesi" denmez, yalnızca "Feride Mama" denir. Daha genel kural: kod akrabalık varsayımı yapmaz. Bakım verenler rol değil kişi olarak tutulur, ekranda yalnızca profildeki serbest etiket görünür. Bu hem bu aile için doğru olanı verir hem de App Store sürümünde her aile bileşimi (tek ebeveyn, üvey ebeveyn, babaanne, koruyucu aile) için sorunsuz çalışır.

PIN saklama: düz metin **kullanılmaz**. WebCrypto `SubtleCrypto` ile PBKDF2, bakım veren başına rastgele salt, 100.000 iterasyon. Bu, kararlı bir saldırganı durdurmaz ama devtools açmayı öğrenen bir çocuğu durdurur, hedeflenen tehdit modeli de budur.

### 3.4 Matematik motoru

Mevcut çarpım tablosu quiz'i hafızasız: her seferinde rastgele soru sorar, neyin zayıf olduğunu bilmez. 9 haftalık sabit plan da yeterlilikten bağımsız ilerler.

Yerine **Leitner kutulu aralıklı tekrar**:

```js
fact = { key: "7x8", box: 1..5, seen, correct, wrong, avgMs, lastSeen }
```

- Doğru ve hızlı (< hız eşiği) → kutu +1
- Doğru ama yavaş → kutu sabit kalır
- Yanlış → kutu 1'e döner
- Soru seçimi kutuya göre ağırlıklı: kutu 1 en sık, kutu 5 en seyrek

Hız eşiği `settings.mathSpeedThresholdMs` olarak profilde tutulur, varsayılan **6000 ms**. Sabit yazılmaz çünkü çocuktan çocuğa değişir; otizmli çocuklarda işlem hızı bilgiden bağımsız olarak yavaş olabilir, eşiği ebeveyn aşağı çekebilmeli.

Yavaş cevabın terfi ettirmemesi önemli. Çarpım tablosunda hedef doğruluk değil **otomatiklik**; parmak sayarak bulunan doğru cevap öğrenilmiş sayılmaz.

**Seviye kilidi:** bir tablo, tüm çarpımları kutu ≥ 4'e ulaşınca "geçildi" sayılır. Geçilmeden sonraki tabloya izin verilmez. Sabit 9 haftalık takvim kalkar, ilerleme gerçek yeterliliğe bağlanır.

Ebeveyn panelinde tek bir **ısı haritası**: 10x10 çarpım ızgarası, her hücre kutu seviyesine göre renklenir. Bir bakışta hangi işlemin zayıf olduğu görülür.

### 3.5 Para birimi

Çift para birimi:

**Dakika (kısa vade).** Kart tamamlandıkça ekran süresi kazanılır. Cihaz ebeveynde olduğu için uygulama bunu **defter** olarak tutar, teknik olarak zorlamaz. Günlük tavan vardır (varsayılan 60 dk); mükemmel gün bile sınırsız ekran vermez.

Bu, YouTube Shorts'u düşman ilan etmek yerine araç haline getirir. Yasaklanan şey cazip olur, kazanılan şey yönetilebilir.

**Yıldız (uzun vade).** Birikir, ödüllere dönüşür. Mevcut ödül listesi korunur ama **ara basamak eklenir**. Şu anki liste 400'den 1500'e sıçrıyor (bisiklet → PlayStation); 9 yaşındaki bir çocuk için 1500 ulaşılamaz görünür ve motivasyonu düşürür. Basamaklar arası oran 2 katını geçmemeli.

### 3.6 Ebeveyn günlüğü

Çocuğun erişemediği bölüm. Günde 30 saniyede işaretlenecek kadar basit: etiket seç, istersen not ekle.

Etiketler: uyku, kaşıma, öfke anı, yemek, ekran, olumlu an, tetikleyici.

Ay sonunda **tek sayfalık PDF** üretir. Bu, hekim randevusunda elde olacak en değerli şey. "Sürekli kaşıyor" cümlesi ile "son 30 günde 22 gün, çoğunlukla akşam ekran sonrası, uykusuz gecelerden sonra belirgin artış" cümlesi tamamen farklı teşhis süreçleri başlatır.

**Sert mimari kural: bu veri cihazı asla terk etmez.** Bulut yok, yedekleme yok, analytics yok, telemetri yok. Tek çıkış yolu kullanıcının kendi elleriyle ürettiği PDF. Gerekçe Bölüm 5'te.

### 3.7 Modül yapısı

87 KB'lık tek `app.js` bölünür. İçerik havuzları (kahramanlar, fıkralar, bilmeceler, bilgi kartları) **olduğu gibi korunur**, sadece veri dosyalarına taşınır.

```
src/
  main.js
  ui/        dom.js
  core/      state.js  storage.js  profile.js  crypto.js  i18n.js
  engines/   routine.js  leitner.js  drill.js  problems.js  timequiz.js
             calendar.js  battleship.js  chess.js  chesspuzzle.js
             rewards.js  diary.js
  views/     routine.js  drill.js  games.js  chess.js  parent.js
             heroes.js  fun.js  facts.js  chat.js
  data/      themes.js  heroes.js  jokes.js  riddles.js  facts.js  defaults.js
```

`leitner.js` ayrı durur çünkü aralıklı tekrar kutuları üç yerde kullanılır: çarpım tablosu, takvim bilgisi ve satranç taşları. Tek uygulama, üç tüketici.

`math.js` yerini `drill.js`e bıraktı; tasarım yalnız çarpımla başlamıştı, dört işleme genişledi.

Bağımlılık kuralı: `views` → `engines` → `core`. Ters yön yasak. `data` saf veri, mantık içermez.

Ek bağımlılık yok, build adımı yok, ES modülleri yeterli. Deploy aynı kalır: statik dosyalar, GitHub Pages.

### 3.8 Oyunlar

Oyunlar kazanılır, bedava açılmaz. O an açık olan blokların kartları bitince oyun sekmesi açılır; yeni blok açılınca yeniden kilitlenir. Onay bekleyen kart tamamlanmış sayılır, çünkü çocuk üstüne düşeni yapmıştır; bir yetişkinin gecikmesi onu cezalandırmamalıdır.

**Oyunlar için yıldız veya süre verilmez.** Oyun zaten rutinin ödülüdür. Puanlamak onu ikinci bir göreve çevirir ve rutinin değerini düşürür.

**Amiral Battı.** 8×8, dört gemi. Rakip kasten seyrek takip yapar (`HUNT_CHANCE`): tam takiple oynayan bir rakip, çocuğun oyunların %98'ini kaybetmesine yol açıyordu. Ayarlandıktan sonra rastgele oynayan çocuk %46, isabetin komşusunu denemeyi öğrenen çocuk %97 kazanıyor. Yani oyunun kendisi stratejiyi öğretir: fark, çocuğun davranışından gelir.

**Satranç: oyun değil, taş öğretme modu.** Satranç oynamak altı kuralı, rakibin planını ve kendi planını aynı anda tutmayı ister; bunları hiç bilmeyen bir çocuğa oyun oynatmak öğretmez, yıldırır. Bu modda ekranda tek taş vardır ve tek soru sorulur: bu taş nereye gidebilir.

Satranç bu çocuk için ayrıca bir fırsat: kuralları kesin, istisnasız ve sosyal belirsizlik içermez. Günlük hayatta ona zor gelen "duruma göre değişen" kuralların tam tersi. Kapalı kural sistemleri otizmli çocuklarda sık görülen bir güçlü yandır; burada satranç bir eksik değil, başarabileceği bir alan olarak konumlanır.

Taş sırası zorluğa göre değil sistem mantığına göredir: kale, fil, vezir, şah, at, piyon. Vezir üçüncüdür çünkü kale ile filin *birleşimidir*; çocuk yeni bir kural değil, bildiği iki kuralın toplandığını görür. Piyon sondadır çünkü tek istisnalı taştır (ilerler ama çapraz alır); istisna, kural oturduktan sonra öğrenilir.

Her taşın üç dersi vardır (serbest, engelli, alma) ve her `taş+ders` çifti ayrı bir Leitner kartıdır. Böylece "at serbest" öğrenilmişken "at engelli" tekrar edilmeye devam eder.

Süre ölçülmez: amaç kuralı anlamaktır, otomatikleşme değil. Yanlış kare cezalandırılmaz, doğru cevap gösterilir ve soru kaybedilmez; kural öğrenirken deneme hata değildir.

Geri bildirim cümlesi ders tipine göre değişir, çünkü yeşilin anlamı derse göre değişir: serbest ve engelli derste yeşil "gidebileceği kareler", alma dersinde yalnızca "alabileceği taş" demektir. Aynı cümleyi üçünde de kullanmak yanlış kural öğretir. **Kural öğreten bir ekranda yanlış cümle, eksik cümleden kötüdür.**

Şah tehdidi, mat, rok ve geçerken alma kapsam dışıdır: bunlar oyun kurallarıdır, taş kuralları değil.

### 3.9 Sohbet modülünün yeni yeri

Gemini sohbeti kalır ama artık ana ekran değil, bir modül. Faz 4'te ücretli katmanın çekirdeği olacağı için arayüzü şimdiden **sağlayıcıdan bağımsız** tanımlanır:

```js
// engines/ai.js
async function ask(prompt, context) -> { text, meta }
```

Faz 1'de arkasında kullanıcının kendi Gemini anahtarı vardır. Faz 4'te arkasına kendi proxy'miz geçer, çağıran kod değişmez.

---

## 4. Faz 2, 3, 4 (özet)

### Faz 2: Genelleştirme
- Onboarding akışı: çocuk adı, bakım verenler, PIN'ler, rutin şablonu seçimi
- Hazır rutin şablonları (okul öncesi / ilkokul / ortaokul)
- Dil desteği (TR, EN), i18n altyapısı
- İçerik havuzlarının kişiselleştirilebilmesi (kendi ödülünü, kendi görevini ekleme)

### Faz 3: App Store
- **Capacitor** kabuğu (mevcut `capacitor.config.json` deneyimi kullanılabilir)
- Apple Guideline 4.2 gerekçesi: uygulama native yetenek kullanmalı (yerel bildirim, haptic, offline depolama)
- Kids Category başvurusu, gizlilik politikası, ebeveyn kapısı
- Yerel bildirimler: blok başlangıç hatırlatmaları
- IAP altyapısı (henüz ürün yok, sadece iskelet)

### Faz 4: Ücretli AI katmanı
- Kendi backend proxy'miz (kullanıcıdan API anahtarı istenemez, Apple reddeder)
- Çocuk güvenliği filtre katmanı: giriş ve çıkış taraması
- Modele kişisel veri gitmemesi (isimler token'lanır)
- Apple IAP aboneliği (Stripe kullanılamaz, dijital içerik zorunlu IAP)
- Maliyet modeli ve kullanım tavanı

---

## 5. Hukuki ve uyumluluk kısıtları

Bunlar Faz 3 konusu gibi görünse de **Faz 1 mimarisini şimdiden bağlar**.

| Kısıt | Etki |
|---|---|
| Apple Kids Category | Üçüncü parti analytics yasak, reklam yasak. Faz 1'de hiç analytics eklenmeyecek. |
| COPPA / GDPR-K / KVKK | 13 yaş altı veri. Cihazda kalan veri en güvenli yol. |
| Özel nitelikli kişisel veri (KVKK m.6) | Ebeveyn günlüğündeki sağlık notları bu sınıfa girer. Sunucuya gitmesi ağır yükümlülük doğurur. **Bu yüzden yerel-only kuralı pazarlık konusu değil.** |
| Tıbbi cihaz mevzuatı | Teşhis/tedavi iddiası yapılmaz. Metinlerde "tedavi", "terapi", "iyileştirir" kelimeleri kullanılmaz. |
| Apple IAP zorunluluğu | Ücretli sürüm Stripe ile satılamaz. Komisyon %30, Small Business Program ile %15. |

---

## 6. Riskler

| Risk | Önlem |
|---|---|
| Çocuk uygulamayı ilk hafta reddeder | Ceza mekaniği yok, sadece kazanç. Rutin kartları başta **az ve kolay** olur; başarı hissi önce gelir, zorluk sonra. |
| Yıldız enflasyonu / ödül anlamını yitirir | Günlük dakika tavanı, ödül basamakları arası oran sınırı. |
| PIN'i öğrenir | PBKDF2 + salt, PIN'i istediğiniz zaman değiştirilebilir. Tam güvenlik hedeflenmiyor, caydırıcılık yeterli. |
| Uygulama ebeveyn için yük olur | Onay tek dokunuş + PIN. Günlük girişi 30 saniye. Bunun üstüne çıkarsa terk edilir. |
| Depo konumu riskli | Depo şu an `~/.gemini/antigravity/scratch/` altında. Scratch dizinleri temizlenebilir. **Faz 1 başlamadan `~/ataol-ai` altına taşınmalı.** |

---

## 7. Başarı ölçütü

Faz 1 şu olduğunda başarılı sayılır:

1. Deha üç hafta boyunca sabah bloğunu **kendisi** açıyor, hatırlatılmadan
2. Matematik ısı haritasında en az iki tablo kutu 4'e çıkıyor
3. Feride'nin verdiği onay sayısı, babanın verdiğinden az değil
4. Ebeveyn günlüğünde hekime götürülebilecek 30 günlük kesintisiz veri var
5. Kodda hiçbir yerde "Deha" veya "Feride" sabit yazılı geçmiyor
