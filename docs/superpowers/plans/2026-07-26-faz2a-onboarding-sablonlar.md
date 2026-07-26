# Faz 2A: Onboarding + rutin şablonları

**Amaç:** Uygulamayı Deha'dan çıkarıp herhangi bir çocuğa açmak. İlk açılışta (profil yoksa) bir kurulum akışı gösterilir: çocuk adı/yaşı, ilk bakım veren + PIN, rutin şablonu seçimi.

**Aciliyet / risk:** Deha'nın profili ZATEN VAR (localStorage). Onboarding yalnız profil yokken çıkar; Deha doğrudan uygulamaya girer, hiç etkilenmez. En büyük risk mevcut kullanıcıyı bozmak; bu yüzden `loadProfile()` bir profil döndürüyorsa onboarding'e HİÇ girilmez.

**Mimari:** Şablonlar VERİ (`data/defaults.js`). Onboarding EKRAN (`main.js` + `v2.html` + CSS). Doğrulama saf parçalar mevcut (`validateGuardianInput`) yeniden kullanılır. Motor değişmez.

---

## Korunacaklar

- `seedProfile({ childName, birthYear, guardians })` imzası GERİYE UYUMLU kalır: yeni `sablon` alanı opsiyonel, varsayılan `'ilkokul'`. Mevcut testler (`clock`, `parent-view`, `defaults`) değişmeden geçer.
- `DEFAULT_CARDS` / `DEFAULT_ROUTINE` / `DEFAULT_REWARDS` export'ları durur; `ilkokul` şablonu bunları kullanır (`defaults.test.js` bunlara bakıyor).
- Kart kuralları (defaults.test.js): rutin id'leri karta işaret eder, kart bloğu = rutin bloğu, her kart tam bir listede, tip geçerli, yıldız/dakika ≥ 0, **mükemmel gün dakikası ≥ 60 (dailyMinuteCap)**, **measured yalnız `sabah-takvim` ve `ogle-matematik`** (main.js sadece bu ikisini quiz/drill'e bağlar).

---

## Görev 1: Rutin şablonları (veri + test)

**Dosyalar:** Değiştir `src/data/defaults.js`, Test `tests/templates.test.js`

Üç şablon: `okuloncesi`, `ilkokul`, `ortaokul`. Her biri `{ id, title, aciklama, cards, routine }`.

- **okuloncesi (Okul Öncesi):** ödev/matematik yok; öz bakım, oyun, resim, masal. `sabah-takvim` (gün öğrenme) var (measured quiz uygun). Matematik drill YOK.
- **ilkokul (İlkokul):** mevcut `DEFAULT_CARDS`/`DEFAULT_ROUTINE`. Hem takvim hem matematik seti.
- **ortaokul (Ortaokul):** ödev/çalışma, ders tekrarı, planlama; `ogle-matematik` (drill) var, `sabah-takvim` YOK (ortaokul için basit kalır).

`seedProfile`'a `sablon = 'ilkokul'` eklenir; seçili şablonun `cards`/`routine`'i klonlanır. Bilinmeyen id → ilkokul'a düşer.

**Testler (`templates.test.js`):** her şablon için `seedProfile({..., sablon})` çağrılıp defaults.test kurallarının hepsi genelleştirilerek doğrulanır (rutin/kart tutarlılığı, measured yalnız izinli id'ler, dakika ≥ 60, `validateProfile` geçer). Ayrıca üç id'nin de listede olduğu ve `title`/`aciklama` dolu olduğu.

- [ ] Testleri yaz → kırmızı → şablonları ekle → yeşil → commit

---

## Görev 2: Onboarding ekranı

**Dosyalar:** Değiştir `src/main.js`, `v2.html`, `styles-v2.css`

Tek ekran form (ebeveyn bir kez doldurur; sihirbaz değil):
1. Çocuğun adı + yaşı (yaştan `birthYear = buYil - yas` main.js'te hesaplanır; motor tarih okumaz)
2. İlk bakım veren: ad, etiket (nasıl görünsün), PIN, PIN tekrar
3. Rutin şablonu: üç radio (title + aciklama)
4. "Başla" → doğrula → PIN hash'le (`hashPin`) → `seedProfile({..., guardians:[ilkVeren], sablon})` → kaydet → uygulamayı çiz

**Akış (main.js açılış):**
- `loadProfile()` profil döndürürse: bugünkü gibi devam (Deha buraya düşer).
- Profil yoksa: `seedProfile('Deha')` yerine onboarding overlay'i göster; render'ı ve karşılamayı onboarding bitene ERTELE.

**Doğrulama:** ad boş olamaz; yaş makul aralık (3-16); bakım veren için mevcut `validateGuardianInput`. Hata mesajı formda gösterilir.

**Renk uyarısı:** `--card-bg`/`--card-border` beyaz zeminde görünmez; `[hidden]` için açık `display:none`.

- [ ] Ekranı yaz, tarayıcıda doğrula (temiz oda: profil yok → onboarding çıkar; doldur → uygulama açılır)
- [ ] Mevcut profil varken onboarding ÇIKMADIĞINI doğrula (Deha bozulmasın)
- [ ] Seçilen şablonun kartlarının rutine yansıdığını doğrula
- [ ] Commit
