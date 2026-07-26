# Faz 2B: İçerik kişiselleştirme (görev + ödül ekle/sil)

**Amaç:** Ebeveyn kendi görevini ve ödülünü ekleyebilsin, istemediğini silebilsin. Faz 2'nin ikinci dilimi.

**Kapsam kararı:** EKLE + SİL (spec "kendi görevini/ödülünü ekleme" diyor). Düzenleme şimdilik yok; sil + tekrar ekle onu karşılar. Gerekirse sonra eklenir.

**Mimari:** Profil mutasyonları SAF (`core/profile.js`, mevcut `addGuardian` deseni, immutable). Girdi doğrulama `views/content.js` (saf). UI `main.js` + `v2.html` + CSS. Motor değişmez.

**Kritik değişmezler:**
- Kart eklenince `profile.cards`'a VE `profile.routine[block]`'a girer; silinince İKİSİNDEN de çıkar. `renderRoutine` tutarlılığa güvenir (defaults.test.js kuralları).
- Yeni kartlar DAİMA `type: 'approved'`. `measured` yalnız `sabah-takvim`/`ogle-matematik`'e özel (main.js quiz/drill'e onları bağlar); ebeveyn measured üretemez, yoksa dokununca hiçbir şey olmaz.

---

## Görev 1: Saf mutasyonlar + doğrulama + test

**Dosyalar:** Değiştir `core/profile.js`, Oluştur `views/content.js`, Test `tests/content.test.js`

`profile.js`:
- `addCard(profile, { title, block, stars, minutes, icon })` → yeni approved kart, cards + routine[block]
- `removeCard(profile, id)` → cards ve TÜM routine bloklarından çıkar
- `addReward(profile, { name, emoji, target })`
- `removeReward(profile, id)`

`views/content.js`:
- `BLOCK_LABELS`, `ICON_OPTIONS`, `EMOJI_OPTIONS`
- `validateCardInput({ title, block, stars, minutes, icon })`, `validateRewardInput({ name, emoji, target })`

**Testler:** addCard routine tutarlılığını korur (kart + tek blokta id, type approved); removeCard ikisinden de temizler; addProfile hâlâ `validateProfile` geçer; rewards ekle/sil; doğrulama boş ad/negatif değer/eksik simge reddeder; mutasyonlar immutable (kaynak profili bozmaz).

- [ ] Testleri yaz → kırmızı → yaz → yeşil → commit

---

## Görev 2: UI (ebeveyn sekmesi)

**Dosyalar:** Değiştir `main.js`, `v2.html`, `styles-v2.css`

Ebeveyn sekmesine iki bölüm:
- **Görevler:** bloklara göre listelenir; her kartın yanında sil (×). "Görev ekle" → kart modalı (ad, zaman dilimi radio, yıldız, dakika, simge ızgarası). Kaydet → `addCard` → kaydet → `renderParent`.
- **Ödüller:** liste + sil; "Ödül ekle" → ödül modalı (ad, emoji ızgarası, hedef dakika).

Silme geri alınamaz; kısa `confirm` yerine doğrudan sil (çocuk erişimi PIN'li değil ama bu ebeveyn sekmesi; basit tutulur). Silinen kartın o günkü ilerlemesi (yıldız) durur; ileriye dönük görünmez.

**Renk uyarısı:** `--card-bg`/`--card-border` beyaz zeminde görünmez; modal içinde marka moru kullan.

- [ ] Görev ekle/sil tarayıcıda doğrula (rutinde görünür/kaybolur)
- [ ] Ödül ekle/sil doğrula
- [ ] Eklenen görev doğru blokta ve approved
- [ ] Commit
