# ATAOL v2 Faz 1A.1: İnceleme Düzeltmeleri

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Faz 1A incelemesinde bulunan üç blocker ile iki önemli kusuru gidermek.

**Architecture:** Değişiklikler üç dosyada. En önemli mimari kayma `completeCard`'ta: kural motorun dışında tavsiye olmaktan çıkıp motorun içinde zorlanır hale geliyor. Bu, imza değişikliği gerektiriyor ve mevcut testleri günceller.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

**Referans:** `docs/superpowers/plans/2026-07-24-faz1a-cekirdek-motorlar.md`, Faz 1A son incelemesi.

---

## Neden bu beş şey

| # | Kusur | Neden şimdi |
|---|---|---|
| 1 | `DEFAULT_SCHEDULE` profiller arasında referansla paylaşılıyor | Çok profilli vizyonun temeli. 1B'de saat düzenleyici gelince veri bozulur |
| 2 | Gece yarısı ile 04:00 arası tüm bloklar kilitli | Spec'in başlık kararını kodun kendisi ihlal ediyor |
| 3 | Eksik `schedule` girdisi `TypeError` fırlatıyor | 1B'de yarım kaydedilmiş blok tüm ekranı düşürür |
| 4 | `completeCard` kilitli karta puan veriyor | Sıralı açılma kuralı motorda zorlanmıyor, sadece arayüze güveniliyor |
| 5 | `cappedMinutes(30, -5)` negatif dönüyor | Daha önce düzeltilen hatanın ikinci kopyası, aynı sınıf |

---

## Task 1: Profil varsayılanlarının derin kopyalanması

**Files:**
- Modify: `src/core/profile.js`
- Test: `tests/profile.test.js`

- [ ] **Step 1: Regresyon testini ekle**

`tests/profile.test.js` sonuna ekle. `DEFAULT_SCHEDULE` import listesine eklenmeli.

```js
test('profiller schedule nesnesini paylasmaz', () => {
  const p1 = createProfile({ childName: 'A', birthYear: 2016 });
  const p2 = createProfile({ childName: 'B', birthYear: 2017 });
  p1.schedule.morning.from = '09:00';
  assert.equal(p2.schedule.morning.from, '06:30');
});

test('profil degisikligi modul sabitini bozmaz', () => {
  const p = createProfile({ childName: 'A', birthYear: 2016 });
  p.schedule.evening.from = '23:00';
  assert.equal(DEFAULT_SCHEDULE.evening.from, '19:00');
});
```

Import satırını şuna güncelle:

```js
import {
  SCHEMA_VERSION,
  createProfile,
  addGuardian,
  validateProfile,
  DEFAULT_SCHEDULE
} from '../src/core/profile.js';
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/profile.test.js`
Expected: FAIL, 2 test kırılır. İlkinde `'09:00' !== '06:30'`.

- [ ] **Step 3: Düzelt**

`src/core/profile.js` içinde `createProfile` gövdesindeki iki satırı değiştir:

```js
    schedule: structuredClone(DEFAULT_SCHEDULE),
```
ve
```js
    settings: structuredClone(DEFAULT_SETTINGS)
```

`structuredClone` Node 17+ ve tüm modern tarayıcılarda yerleşiktir, bağımlılık gerektirmez. `settings` bugün düz bir nesne ama ileride iç içe bir ayar eklendiğinde aynı hatayı yapmamak için o da derin kopyalanır.

Başka hiçbir şeyi değiştirme.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/profile.test.js`
Expected: `# pass 8`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/core/profile.js tests/profile.test.js
git commit -m "fix(core): profil varsayilanlari derin kopyalansin"
```

---

## Task 2: Gece yarısı ölü bölgesi ve eksik schedule koruması

Bu iki kusur aynı fonksiyonda ve aynı satırları etkiliyor, birlikte düzeltilir.

**Files:**
- Modify: `src/engines/routine.js`
- Test: `tests/routine.test.js`

- [ ] **Step 1: Regresyon testlerini ekle**

`tests/routine.test.js` sonuna ekle:

```js
test('gece yarisi ile sifirlama saati arasinda bloklar acik kalir', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-25T00:30:00'), schedule, 4),
    ['morning', 'afternoon', 'evening']
  );
});

test('sifirlama saatinden sonra yeni gunun bloklari henuz acilmaz', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-25T05:00:00'), schedule, 4), []);
});

test('eksik from alani patlamak yerine blogu kapali sayar', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-24T10:00:00'), { afternoon: {} }, 4), []);
});

test('bozuk saat metni patlamak yerine blogu kapali sayar', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-24T10:00:00'), { morning: { from: 'abc' } }, 4),
    []
  );
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/routine.test.js`
Expected: FAIL. İlk test boş dizi döner, üçüncüsü `TypeError` fırlatır.

- [ ] **Step 3: Düzelt**

`src/engines/routine.js` içinde `availableBlocks` fonksiyonunu tamamen şununla değiştir:

```js
export function availableBlocks(date, schedule, resetHour = 4) {
  let now = minutesOfDay(date);
  if (date.getHours() < resetHour) now += 24 * 60;

  return BLOCKS.filter((b) => {
    const from = schedule[b]?.from;
    if (typeof from !== 'string') return false;
    const start = parseTime(from);
    return Number.isFinite(start) && now >= start;
  });
}
```

Mantık: sıfırlama saatinden önceki bir an, hâlâ önceki güne aittir. O yüzden gün içi dakikasına 1440 eklenir ve bloklar açık kalmaya devam eder. `dayKey` ile aynı gün modelini kullanır.

Aynı dosyada `cardStates` içindeki ilk satırı da güncelle ki sıfırlama saati profilden gelsin:

```js
export function cardStates(profile, dayProgress, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const open = new Set(availableBlocks(date, profile.schedule, resetHour));
```

Fonksiyonun geri kalanı aynı kalır.

Dosya başındaki yorum bloğuna da bu kararı ekle, mevcut metnin altına:

```
 * Gun modeli dayKey ile ayni: sifirlama saatinden onceki bir an hala
 * onceki gune aittir, bu yuzden bloklar o saatlerde de acik kalir.
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/routine.test.js`
Expected: `# pass 15`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/routine.js tests/routine.test.js
git commit -m "fix(engines): gece yarisi olu bolgesi ve eksik schedule korumasi"
```

---

## Task 3: completeCard kilitli karta puan vermesin

Bu görev bir imza değişikliği içerir. Kural motorun içine taşınır.

**Files:**
- Modify: `src/engines/routine.js`
- Test: `tests/routine.test.js`

- [ ] **Step 1: Regresyon testini ekle**

`tests/routine.test.js` sonuna ekle:

```js
const gatingProfile = {
  schedule,
  settings: { dayResetHour: 4 },
  cards: [
    { id: 'm1', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
    { id: 'm2', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
    { id: 'e1', block: 'evening', type: 'measured', stars: 7, minutes: 7 }
  ],
  routine: { morning: ['m1', 'm2'], afternoon: [], evening: ['e1'] }
};

test('saati gelmemis blogun karti puan vermez', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'e1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
  assert.equal(dp.cards.e1, undefined);
});

test('sirasi gelmemis kart puan vermez', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'm2', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
});

test('sirasi gelen kart puan verir', () => {
  const dp = completeCard(gatingProfile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 5);
});

test('onceki tamamlaninca sonraki kart puan verebilir', () => {
  let dp = completeCard(gatingProfile, emptyDayProgress(), 'm1', new Date('2026-07-24T07:00:00'));
  dp = completeCard(gatingProfile, dp, 'm2', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 10);
});

test('routine icinde karsiligi olmayan id puan vermez', () => {
  const hayalet = {
    ...gatingProfile,
    routine: { morning: ['yok'], afternoon: [], evening: [] }
  };
  const dp = completeCard(hayalet, emptyDayProgress(), 'yok', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.stars, 0);
});
```

Ayrıca mevcut beş test `completeCard`'ı eski imzayla çağırıyor. Bunları yeni imzaya güncelle. Eski çağrı `completeCard(emptyDayProgress(), card)` biçimindeydi; yenisi `completeCard(profile, dayProgress, cardId, date)`. Güncellenecek testler:

- `onay gerektiren kart tamamlaninca awaiting_approval olur`
- `onay bekleyen kart puan vermez`
- `onaylandiktan sonra puan verilir ve onaylayan kaydedilir`
- `olcum karti onaysiz dogrudan puan verir`
- `ayni kart iki kez puan vermez`
- `tamamlanan karttan sonraki kart acilir`

Her biri için kartı içeren minimal bir profil kur. Örnek dönüşüm:

```js
test('onay gerektiren kart tamamlaninca awaiting_approval olur', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const profile = {
    schedule,
    settings: { dayResetHour: 4 },
    cards: [card],
    routine: { morning: ['c1'], afternoon: [], evening: [] }
  };
  const dp = completeCard(profile, emptyDayProgress(), 'c1', new Date('2026-07-24T07:00:00'));
  assert.equal(dp.cards.c1.state, 'awaiting_approval');
});
```

`approveCard` imzası değişmiyor, onu çağıran testler aynı kalır.

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/routine.test.js`
Expected: FAIL. Özellikle `saati gelmemis blogun karti puan vermez` testi eski kodda 7 yıldız verir.

- [ ] **Step 3: Düzelt**

`src/engines/routine.js` içinde `completeCard` fonksiyonunu tamamen şununla değiştir:

```js
export function completeCard(profile, dayProgress, cardId, date) {
  const entry = cardStates(profile, dayProgress, date).find((s) => s.cardId === cardId);
  if (!entry || entry.state !== 'available' || !entry.card) return dayProgress;

  const card = entry.card;
  const needsApproval = card.type === 'approved';
  const state = needsApproval ? 'awaiting_approval' : 'done';

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [cardId]: { state } },
    stars: dayProgress.stars + (needsApproval ? 0 : card.stars),
    minutes: dayProgress.minutes + (needsApproval ? 0 : card.minutes)
  };
}
```

Zaten tamamlanmış bir kart `cardStates` içinde `available` olmayacağı için ayrı bir çifte tamamlama kontrolüne gerek kalmaz; kural tek yerde toplanır. Karşılığı olmayan bir id `entry.card === null` verir ve sessizce reddedilir.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/routine.test.js`
Expected: `# pass 20`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/routine.js tests/routine.test.js
git commit -m "fix(engines): completeCard sirali acilma kuralini zorlasin"
```

---

## Task 4: cappedMinutes negatif tavan

**Files:**
- Modify: `src/engines/rewards.js`
- Test: `tests/rewards.test.js`

- [ ] **Step 1: Regresyon testini ekle**

`tests/rewards.test.js` sonuna ekle:

```js
test('negatif tavan negatif sonuc uretmez', () => {
  assert.equal(cappedMinutes(30, -5), 0);
});

test('sifir tavan sifir dondurur', () => {
  assert.equal(cappedMinutes(30, 0), 0);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/rewards.test.js`
Expected: FAIL, `-5 !== 0`

- [ ] **Step 3: Düzelt**

`src/engines/rewards.js` içinde `cappedMinutes` fonksiyonunu şununla değiştir:

```js
export function cappedMinutes(minutes, cap) {
  return Math.max(0, Math.min(minutes, Math.max(0, cap)));
}
```

Girdiyi değil **sonucu** kırpar. Daha önce `rewardProgress` için verilen düzeltmenin aynı deseni: modül başlığındaki garanti çıktıda tutulur, tek tek argümanlarda değil.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/rewards.test.js`
Expected: `# pass 11`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/rewards.js tests/rewards.test.js
git commit -m "fix(engines): cappedMinutes negatif tavanda sifir dondursun"
```

---

## Task 5: Tüm paket doğrulaması

**Files:** yok, sadece doğrulama.

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`
Expected: `# pass 70`, `# fail 0`

Dağılım: smoke 1, storage 5, crypto 5, profile 8, routine 20, math 12, rewards 11, diary 8.

- [ ] **Step 2: Rapor et**

Sayı tutmuyorsa BLOCKED bildir, düzeltmeye çalışma.

---

## Kapsam dışı (bilinçli, 1B'ye bırakıldı)

| Bulgu | Neden erteleniyor |
|---|---|
| `routine` içinde karşılığı olmayan id bloğun kalanını kilitliyor | `completeCard` artık bunu reddediyor. Asıl çözüm `validateProfile`'a referans bütünlüğü eklemek, o da kart şemasıyla birlikte 1B'de gelir |
| Leitner'da zaman aralığı yok, üç saniyede ustalaşılabilir | `now` enjeksiyonu ve `lastSeen` kullanımı gerektirir, matematik arayüzüyle birlikte tasarlanmalı |
| `approveCard` ödemeyi çağrıldığı andaki karttan okuyor | Kart kaydına bekleyen tutarın yazılması gerekir, kart şeması işi |
| `validateProfile` kart/schedule/ödül doğrulamıyor | Kart şeması 1B'de tanımlanacak |
| `storage.set` kota hatası yakalamıyor | Gerçek `localStorage` ile birlikte 1B'de |
| `approveCard` durumu `done` yazıyor, spec `approved` diyor | Arayüz ayrımı gerektirdiğinde 1B'de |
| DST'de gün 03:00 veya 05:00'te dönüyor | Türkiye'de DST yok, App Store sürümü öncesi |
