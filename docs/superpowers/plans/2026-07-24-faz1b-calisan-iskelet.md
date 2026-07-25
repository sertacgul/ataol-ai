# ATAOL v2 Faz 1B: Çalışan İskelet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Deha'nın kullanmaya başlayabileceği çalışan bir uygulama: günlük rutin ekranı, sıralı kart akışı, ebeveyn PIN onayı, kalıcı depolama.

**Architecture:** Faz 1A'nın saf motorları üstüne iki katman. `core/state.js` motorları depolamaya bağlayan tek yer. **Görünüm modülleri HTML üretmez**, yalnızca görünüm modeli (düz nesne) üretir. DOM'u `main.js` kurar, metinleri `textContent` ile yazar. Bu ayrım hem görünüm mantığını jsdom olmadan test edilebilir tutar hem de XSS'i yapısal olarak imkânsız kılar.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık, build adımı yok.

**Referans:** `docs/superpowers/specs/2026-07-24-ataol-v2-design.md`, Faz 1A ve 1A.1 planları.

---

## Neden HTML dizesi değil de görünüm modeli

İlk taslakta görünümler HTML dizesi döndürüyor, `main.js` bunu `innerHTML` ile basıyordu. Her enterpolasyon bir `escapeHtml` çağrısından geçiyordu, yani bugün doğru çalışırdı.

Sorun şu: bu **disipline bağlı güvenlik**. Gelecekteki tek bir unutulmuş kaçış XSS açar. Ve veri kaynağı büyüyor: Faz 2'de kart başlıkları kullanıcı tarafından girilecek, Faz 1D'de sohbet modülü LLM çıktısı basacak, Faz 4'te sunucudan veri gelecek. Çocuk uygulaması olarak App Store Kids Category incelemesine girecek bir üründe bu kabul edilemez bir kalıp.

`textContent` script çalıştıramaz. Görünümler düz veri döndürüp DOM'u `createElement` ve `textContent` ile kurunca, enjeksiyon **yapısal olarak** mümkün olmaz. Kaçış fonksiyonu gerekmez, unutulacak bir adım kalmaz.

Test edilebilirlik de kaybolmuyor: asıl mantık zaten görünüm modelinde ve o saf kalıyor. `main.js` ince ve mekanik kalır, tarayıcıda doğrulanır.

---

## Kritik karar: v1 bozulmuyor

Deha şu an `index.html`'i kullanıyor. Bu dosyaya dokunulmuyor. v2 kabuğu **`v2.html`** olarak yanına kurulur ve `https://sertacgul.github.io/ataol-ai/v2.html` adresinden test edilir. Canlıya geçiş ve v1 verisinin göçü Faz 1D'nin işi. Yarım kalmış bir v2 hiçbir zaman Deha'nın çalışan uygulamasını düşürmemeli.

---

## Dosya Yapısı

| Dosya | Sorumluluk | Test |
|---|---|---|
| `src/data/defaults.js` | Deha'nın tohum profili: kartlar, rutin sırası, ödül merdiveni | Birim |
| `src/core/state.js` | Motorlar ile depolama arasındaki tek köprü | Birim |
| `src/views/routine.js` | `routineViewModel()` — saf, düz nesne döndürür | Birim |
| `src/views/parent.js` | `approvalQueue()`, `approvalSummary()` — saf | Birim |
| `src/ui/dom.js` | `el()` yardımcısı. `createElement` + `textContent`. İnce ve mekanik | Tarayıcı |
| `src/main.js` | Tek DOM'a dokunan dosya. Mount, olay delegasyonu, PIN akışı | Tarayıcı |
| `v2.html`, `styles-v2.css` | v2 kabuğu ve stilleri | Tarayıcı |

Bağımlılık yönü: `main.js` → `ui` + `views` → `engines` → `core`. **`src/views/`, `src/engines/`, `src/core/` altında `document` geçmez.**

---

## Task 1: data/defaults.js

Deha'nın tohum profili. Spec Bölüm 3.1'in kuralı geçerli: bu bir **veri** dosyasıdır. İsimlerin burada bulunması doğrudur, motorlarda bulunması yanlıştır.

**Files:**
- Create: `src/data/defaults.js`
- Test: `tests/defaults.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/defaults.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedProfile, DEFAULT_CARDS, DEFAULT_REWARDS } from '../src/data/defaults.js';
import { validateProfile } from '../src/core/profile.js';
import { validateRewardLadder } from '../src/engines/rewards.js';
import { BLOCKS } from '../src/engines/routine.js';

const tohum = (guardians = []) =>
  seedProfile({ childName: 'X', birthYear: 2016, guardians });

test('tohum profil dogrulamadan gecer', () => {
  const p = tohum([{ name: 'A', label: 'Baba', pinHash: 'h1', pinSalt: 's1' }]);
  assert.equal(validateProfile(p).valid, true);
});

test('odul merdiveni uyari uretmez', () => {
  const r = validateRewardLadder(DEFAULT_REWARDS);
  assert.equal(r.valid, true, r.warnings.join(' | '));
});

test('her rutin id karsiligi olan bir karta isaret eder', () => {
  const p = tohum();
  const ids = new Set(p.cards.map((c) => c.id));
  for (const block of BLOCKS) {
    for (const id of p.routine[block]) {
      assert.ok(ids.has(id), `${id} icin kart yok`);
    }
  }
});

test('her kartin blogu rutin listesindeki blokla ayni', () => {
  const p = tohum();
  const byId = new Map(p.cards.map((c) => [c.id, c]));
  for (const block of BLOCKS) {
    for (const id of p.routine[block]) {
      assert.equal(byId.get(id).block, block, `${id} yanlis blokta`);
    }
  }
});

test('her kart tam olarak bir rutin listesinde gecer', () => {
  const p = tohum();
  const hepsi = BLOCKS.flatMap((b) => p.routine[b]);
  assert.equal(hepsi.length, new Set(hepsi).size, 'tekrarli id var');
  assert.equal(hepsi.length, p.cards.length, 'listelenmeyen kart var');
});

test('kart tipleri gecerli', () => {
  const gecerli = new Set(['measured', 'approved', 'inapp', 'silent']);
  for (const c of DEFAULT_CARDS) {
    assert.ok(gecerli.has(c.type), `${c.id} gecersiz tip: ${c.type}`);
  }
});

test('yildiz ve dakika negatif olamaz', () => {
  for (const c of DEFAULT_CARDS) {
    assert.ok(c.stars >= 0, `${c.id} negatif yildiz`);
    assert.ok(c.minutes >= 0, `${c.id} negatif dakika`);
  }
});

test('mukemmel gun dakika tavanina ulasir, yani tavan anlamli', () => {
  const p = tohum();
  const toplam = p.cards.reduce((s, c) => s + c.minutes, 0);
  assert.ok(toplam >= p.settings.dailyMinuteCap, 'tavan hicbir zaman devreye girmiyor');
});

test('anneye yardim karti en yuksek puanli onayli kartlardan', () => {
  const yardim = DEFAULT_CARDS.find((c) => c.id === 'aksam-sofra');
  const onayli = DEFAULT_CARDS.filter((c) => c.type === 'approved');
  assert.equal(yardim.stars, Math.max(...onayli.map((c) => c.stars)));
});

test('seedProfile cagrilari birbirini etkilemez', () => {
  const a = tohum();
  const b = tohum();
  a.cards[0].stars = 999;
  a.rewards[0].target = 1;
  assert.equal(b.cards[0].stars, DEFAULT_CARDS[0].stars);
  assert.equal(b.rewards[0].target, DEFAULT_REWARDS[0].target);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/defaults.test.js`
Expected: FAIL, `Cannot find module '../src/data/defaults.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/data/defaults.js`:

```js
import { createProfile, addGuardian } from '../core/profile.js';

/**
 * Tohum veri. Bu bir VERI dosyasidir, motor kodu degil.
 * Isimlerin burada bulunmasi dogrudur; motorlarda bulunmasi yanlistir.
 *
 * Yildiz: kucuk is 2, orta 3, buyuk 5. Gunluk toplam 30.
 * Dakika: mukemmel gun tam 60'a denk gelir, yani tavan mukemmel gunde
 * devreye girer ve "her sey bitti, sinirsiz ekran" durumu olusmaz.
 */

export const DEFAULT_CARDS = [
  { id: 'sabah-giyin', block: 'morning', type: 'approved', title: 'Giyin ve yatağını topla', icon: 'bed', stars: 2, minutes: 4 },
  { id: 'sabah-kahvalti', block: 'morning', type: 'approved', title: 'Kahvaltı', icon: 'restaurant', stars: 2, minutes: 4 },
  { id: 'sabah-canta', block: 'morning', type: 'approved', title: 'Çantanı kontrol et', icon: 'backpack', stars: 2, minutes: 4 },

  { id: 'ogle-ust', block: 'afternoon', type: 'approved', title: 'Üstünü değiştir, ellerini yıka', icon: 'wash', stars: 2, minutes: 4 },
  { id: 'ogle-odev', block: 'afternoon', type: 'approved', title: 'Ödev', icon: 'edit_note', stars: 5, minutes: 10 },
  { id: 'ogle-matematik', block: 'afternoon', type: 'measured', title: 'Matematik seti', icon: 'functions', stars: 5, minutes: 10 },

  { id: 'aksam-sofra', block: 'evening', type: 'approved', title: 'Sofraya yardım et', icon: 'volunteer_activism', stars: 5, minutes: 10 },
  { id: 'aksam-dus', block: 'evening', type: 'approved', title: 'Duş', icon: 'shower', stars: 2, minutes: 4 },
  { id: 'aksam-kitap', block: 'evening', type: 'inapp', title: '15 dakika kitap', icon: 'menu_book', stars: 3, minutes: 6 },
  { id: 'aksam-canta', block: 'evening', type: 'approved', title: 'Yarının çantası', icon: 'checklist', stars: 2, minutes: 4 }
];

export const DEFAULT_ROUTINE = {
  morning: ['sabah-giyin', 'sabah-kahvalti', 'sabah-canta'],
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

export const DEFAULT_MATH_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function seedProfile({ childName, birthYear, guardians = [] }) {
  let profile = createProfile({ childName, birthYear });

  profile = {
    ...profile,
    cards: structuredClone(DEFAULT_CARDS),
    routine: structuredClone(DEFAULT_ROUTINE),
    rewards: structuredClone(DEFAULT_REWARDS)
  };

  for (const g of guardians) {
    profile = addGuardian(profile, g);
  }

  return profile;
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/defaults.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/data/defaults.js tests/defaults.test.js
git commit -m "feat(data): tohum profil, rutin kartlari ve odul merdiveni"
```

---

## Task 2: core/state.js

**Files:**
- Create: `src/core/state.js`
- Test: `tests/state.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/state.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';
import { seedProfile } from '../src/data/defaults.js';

function kur() {
  const storage = createStorage(memoryBackend(), 'ataol2');
  const state = createAppState(storage);
  const profile = seedProfile({
    childName: 'X',
    birthYear: 2016,
    guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
  });
  state.saveProfile(profile);
  return { storage, state, profile };
}

test('profil kaydedilip geri okunur', () => {
  const { state, profile } = kur();
  assert.equal(state.loadProfile().child.name, profile.child.name);
});

test('profil yoksa null doner', () => {
  const state = createAppState(createStorage(memoryBackend(), 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('gun ilerlemesi gune gore ayri tutulur', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.loadDayProgress('2026-07-24').stars, 5);
  assert.equal(state.loadDayProgress('2026-07-25').stars, 9);
});

test('kaydedilmemis gun bos ilerleme dondurur', () => {
  const { state } = kur();
  const dp = state.loadDayProgress('2026-01-01');
  assert.equal(dp.stars, 0);
  assert.deepEqual(dp.cards, {});
});

test('gun kaydetmek diger gunleri silmez', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(Object.keys(state.allDays()).length, 2);
});

test('toplam yildiz tum gunleri toplar', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.totalStars(), 14);
});

test('matematik olgulari kaydedilip geri okunur', () => {
  const { state } = kur();
  state.saveFacts({ '2x3': { table: 2, box: 3, seen: 1, correct: 1, wrong: 0, avgMs: 900, lastSeen: null } });
  assert.equal(state.loadFacts()['2x3'].box, 3);
});

test('olgu yoksa varsayilan tablolarla uretilir', () => {
  const { state } = kur();
  const facts = state.loadFacts();
  assert.equal(Object.keys(facts).length, 90);
  assert.equal(facts['7x8'].box, 1);
});

test('gunluk kaydedilip geri okunur, varsayilani bostur', () => {
  const { state } = kur();
  assert.deepEqual(state.loadDiary(), {});
  state.saveDiary({ '2026-07-24': [{ tag: 'uyku', note: '', time: null }] });
  assert.equal(state.loadDiary()['2026-07-24'].length, 1);
});

test('depolama sadece bilinen anahtarlari kullanir', () => {
  const { storage, state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 1, minutes: 1 });
  state.saveFacts({});
  state.saveDiary({});
  for (const k of storage.keys()) {
    assert.ok(['profile', 'days', 'facts', 'diary'].includes(k), `beklenmeyen anahtar: ${k}`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/state.test.js`
Expected: FAIL, `Cannot find module '../src/core/state.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/core/state.js`:

```js
import { createFactSet } from '../engines/math.js';
import { emptyDayProgress } from '../engines/routine.js';
import { emptyDiary } from '../engines/diary.js';
import { DEFAULT_MATH_TABLES } from '../data/defaults.js';

/**
 * Motorlar ile depolama arasindaki tek kopru.
 *
 * Motorlar saf kalir; bu modul onlarin urettigi nesneleri kaydeder ve
 * geri yukler. Uygulamanin baska hicbir yeri storage'i dogrudan cagirmaz.
 */

export function createAppState(storage) {
  return {
    loadProfile() {
      return storage.get('profile', null);
    },

    saveProfile(profile) {
      storage.set('profile', profile);
    },

    loadDayProgress(dayKey) {
      return storage.get('days', {})[dayKey] ?? emptyDayProgress();
    },

    saveDayProgress(dayKey, dayProgress) {
      storage.set('days', { ...storage.get('days', {}), [dayKey]: dayProgress });
    },

    allDays() {
      return storage.get('days', {});
    },

    totalStars() {
      return Object.values(storage.get('days', {}))
        .reduce((sum, d) => sum + (d.stars ?? 0), 0);
    },

    loadFacts() {
      return storage.get('facts', null) ?? createFactSet(DEFAULT_MATH_TABLES);
    },

    saveFacts(facts) {
      storage.set('facts', facts);
    },

    loadDiary() {
      return storage.get('diary', null) ?? emptyDiary();
    },

    saveDiary(diary) {
      storage.set('diary', diary);
    }
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/state.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/core/state.js tests/state.test.js
git commit -m "feat(core): motorlari depolamaya baglayan state katmani"
```

---

## Task 3: views/routine.js

Yalnızca görünüm modeli. HTML yok, DOM yok, dize şablonu yok.

**Files:**
- Create: `src/views/routine.js`
- Test: `tests/routine-view.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/routine-view.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routineViewModel } from '../src/views/routine.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({ childName: 'Test', birthYear: 2016, guardians: [] });
const sabah = new Date('2026-07-24T07:00:00');

test('uc blok sirayla gelir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  assert.deepEqual(vm.blocks.map((b) => b.id), ['morning', 'afternoon', 'evening']);
});

test('bloklarin baslik ve saati tasinir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const m = vm.blocks[0];
  assert.equal(m.title, 'Sabah');
  assert.equal(m.from, '06:30');
});

test('sabah 07:00de sadece ilk kart acik', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const m = vm.blocks.find((b) => b.id === 'morning');
  assert.equal(m.cards[0].state, 'available');
  assert.equal(m.cards[1].state, 'locked');
});

test('kart alanlari gorunum modeline tasinir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const kart = vm.blocks[0].cards[0];
  assert.equal(kart.id, 'sabah-giyin');
  assert.equal(kart.title, 'Giyin ve yatağını topla');
  assert.equal(kart.stars, 2);
  assert.equal(kart.minutes, 4);
  assert.equal(typeof kart.icon, 'string');
});

test('gunun toplamlari tasinir', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  const vm = routineViewModel(profile, dp, sabah);
  assert.equal(vm.stars, 0);
  assert.equal(vm.awaitingApproval, 1);
});

test('olcum karti tamamlaninca puan gorunur', () => {
  const ogleden = new Date('2026-07-24T16:00:00');
  let dp = completeCard(profile, emptyDayProgress(), 'ogle-ust', ogleden);
  dp = completeCard(profile, dp, 'ogle-odev', ogleden);
  const vm = routineViewModel(profile, dp, ogleden);
  assert.equal(vm.awaitingApproval, 2);
  assert.equal(vm.stars, 0);
});

test('dakika tavani uygulanir', () => {
  const dp = { cards: {}, approvals: [], stars: 500, minutes: 500 };
  const vm = routineViewModel(profile, dp, sabah);
  assert.equal(vm.minutes, profile.settings.dailyMinuteCap);
});

test('cocuk adi gorunum modelinde', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  assert.equal(vm.childName, 'Test');
});

test('gorunum modeli duz veridir, HTML uretmez', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), sabah);
  const dump = JSON.stringify(vm);
  assert.ok(!dump.includes('<'), 'gorunum modelinde HTML var');
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/routine.js', import.meta.url), 'utf8');
  for (const yasak of ['document', 'innerHTML', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(yasak), `routine.js icinde "${yasak}" olmamali`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/routine-view.test.js`
Expected: FAIL, `Cannot find module '../src/views/routine.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/views/routine.js`:

```js
import { BLOCKS, cardStates } from '../engines/routine.js';
import { cappedMinutes } from '../engines/rewards.js';

/**
 * Rutin gorunum modeli.
 *
 * Bu modul HTML uretmez ve DOM'a dokunmaz. Duz veri dondurur; DOM'u
 * main.js createElement ve textContent ile kurar. Boylece enjeksiyon
 * yapisal olarak imkansiz olur, kacis disiplinine bagli kalmaz.
 */

const BLOCK_TITLES = {
  morning: 'Sabah',
  afternoon: 'Okul Sonrası',
  evening: 'Akşam'
};

export function routineViewModel(profile, dayProgress, date) {
  const states = cardStates(profile, dayProgress, date);

  const blocks = BLOCKS.map((id) => ({
    id,
    title: BLOCK_TITLES[id],
    from: profile.schedule?.[id]?.from ?? '',
    cards: states
      .filter((s) => s.block === id)
      .map((s) => ({
        id: s.cardId,
        state: s.state,
        title: s.card?.title ?? '',
        icon: s.card?.icon ?? 'help',
        stars: s.card?.stars ?? 0,
        minutes: s.card?.minutes ?? 0
      }))
  }));

  return {
    childName: profile.child.name,
    blocks,
    stars: dayProgress.stars,
    minutes: cappedMinutes(dayProgress.minutes, profile.settings.dailyMinuteCap),
    minuteCap: profile.settings.dailyMinuteCap,
    awaitingApproval: states.filter((s) => s.state === 'awaiting_approval').length
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/routine-view.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/views/routine.js tests/routine-view.test.js
git commit -m "feat(views): rutin gorunum modeli"
```

---

## Task 4: views/parent.js

**Files:**
- Create: `src/views/parent.js`
- Test: `tests/parent-view.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/parent-view.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { approvalQueue, approvalSummary } from '../src/views/parent.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({
  childName: 'Test',
  birthYear: 2016,
  guardians: [
    { name: 'Baba', label: 'Baba', pinHash: 'h1', pinSalt: 's1' },
    { name: 'Anne', label: 'Anne', pinHash: 'h2', pinSalt: 's2' }
  ]
});
const sabah = new Date('2026-07-24T07:00:00');

test('onay bekleyen kart kuyruga girer', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  const q = approvalQueue(profile, dp);
  assert.equal(q.length, 1);
  assert.equal(q[0].id, 'sabah-giyin');
  assert.equal(q[0].stars, 2);
  assert.equal(q[0].title, 'Giyin ve yatağını topla');
});

test('tamamlanmamis kart kuyruga girmez', () => {
  assert.equal(approvalQueue(profile, emptyDayProgress()).length, 0);
});

test('tamamlanmis olcum karti kuyruga girmez', () => {
  const dp = { cards: { 'ogle-matematik': { state: 'done' } }, approvals: [], stars: 5, minutes: 10 };
  assert.equal(approvalQueue(profile, dp).length, 0);
});

test('karsiligi olmayan id kuyrugu bozmaz', () => {
  const dp = { cards: { hayalet: { state: 'awaiting_approval' } }, approvals: [], stars: 0, minutes: 0 };
  assert.deepEqual(approvalQueue(profile, dp), []);
});

test('haftalik ozet onaylari bakim verene gore sayar', () => {
  const days = {
    '2026-07-20': { cards: {}, approvals: [{ guardianId: 'g1' }, { guardianId: 'g2' }], stars: 0, minutes: 0 },
    '2026-07-21': { cards: {}, approvals: [{ guardianId: 'g2' }], stars: 0, minutes: 0 }
  };
  const guardians = [
    { id: 'g1', name: 'Baba', label: 'Baba' },
    { id: 'g2', name: 'Anne', label: 'Anne' }
  ];
  const ozet = approvalSummary(days, guardians, '2026-07-20', '2026-07-26');
  assert.equal(ozet.find((o) => o.id === 'g1').count, 1);
  assert.equal(ozet.find((o) => o.id === 'g2').count, 2);
});

test('haftalik ozet aralik disini saymaz', () => {
  const days = {
    '2026-06-01': { cards: {}, approvals: [{ guardianId: 'g1' }], stars: 0, minutes: 0 },
    '2026-07-21': { cards: {}, approvals: [{ guardianId: 'g1' }], stars: 0, minutes: 0 }
  };
  const ozet = approvalSummary(days, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet[0].count, 1);
});

test('hic onay vermemis bakim veren sifirla listelenir', () => {
  const ozet = approvalSummary({}, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet[0].count, 0);
});

test('taninmayan guardianId ozeti bozmaz', () => {
  const days = { '2026-07-21': { cards: {}, approvals: [{ guardianId: 'yok' }], stars: 0, minutes: 0 } };
  const ozet = approvalSummary(days, [{ id: 'g1', name: 'Baba', label: 'Baba' }], '2026-07-20', '2026-07-26');
  assert.equal(ozet.length, 1);
  assert.equal(ozet[0].count, 0);
});

test('gorunum modeli duz veridir, HTML uretmez', () => {
  const dp = completeCard(profile, emptyDayProgress(), 'sabah-giyin', sabah);
  assert.ok(!JSON.stringify(approvalQueue(profile, dp)).includes('<'));
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/parent.js', import.meta.url), 'utf8');
  for (const yasak of ['document', 'innerHTML', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(yasak), `parent.js icinde "${yasak}" olmamali`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/parent-view.test.js`
Expected: FAIL, `Cannot find module '../src/views/parent.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/views/parent.js`:

```js
/**
 * Ebeveyn gorunum modelleri.
 *
 * approvalSummary spec 3.3'un amacini tasir: cocuk haftalik ozette
 * kimin kac kez onay verdigini gorur. Annenin kisitlayan taraftan
 * cikip iyi seylerin kaynagi olmasi bu ekrana bagli.
 *
 * Bu modul de HTML uretmez, duz veri dondurur.
 */

export function approvalQueue(profile, dayProgress) {
  const byId = new Map(profile.cards.map((c) => [c.id, c]));

  return Object.entries(dayProgress.cards)
    .filter(([, v]) => v.state === 'awaiting_approval')
    .map(([id]) => byId.get(id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, title: c.title, icon: c.icon, stars: c.stars, minutes: c.minutes }));
}

export function approvalSummary(days, guardians, fromKey, toKey) {
  const counts = new Map(guardians.map((g) => [g.id, 0]));

  for (const [day, dp] of Object.entries(days)) {
    if (day < fromKey || day > toKey) continue;
    for (const a of dp.approvals ?? []) {
      if (counts.has(a.guardianId)) counts.set(a.guardianId, counts.get(a.guardianId) + 1);
    }
  }

  return guardians.map((g) => ({ id: g.id, name: g.name, label: g.label, count: counts.get(g.id) }));
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/parent-view.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/views/parent.js tests/parent-view.test.js
git commit -m "feat(views): onay kuyrugu ve haftalik onay ozeti modelleri"
```

---

## Task 5: Tarayıcı katmanı

Bu görev birim testiyle doğrulanmaz, tarayıcıda doğrulanır. `src/ui/dom.js` ve `src/main.js` DOM'a dokunan tek dosyalardır.

**Files:**
- Create: `src/ui/dom.js`, `src/main.js`, `v2.html`, `styles-v2.css`
- Modify: hiçbiri. `index.html`, `app.js`, `styles.css` dokunulmaz.

- [ ] **Step 1: src/ui/dom.js oluştur**

```js
/**
 * Kucuk DOM kurucu. Metin daima textContent ile yazilir, hicbir yerde
 * innerHTML kullanilmaz. Enjeksiyon bu sayede yapisal olarak imkansiz.
 */

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, text, dataset, attrs } = options;

  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);

  for (const [k, v] of Object.entries(dataset ?? {})) node.dataset[k] = v;
  for (const [k, v] of Object.entries(attrs ?? {})) node.setAttribute(k, v);

  for (const child of children) {
    if (child) node.appendChild(child);
  }

  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(node, children) {
  clear(node);
  for (const child of children) {
    if (child) node.appendChild(child);
  }
}
```

- [ ] **Step 2: v2.html oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>ATAOL</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="styles-v2.css">
</head>
<body>
  <div id="app">
    <main id="view-routine" class="v2-view active"></main>
    <main id="view-parent" class="v2-view"></main>
    <nav class="v2-nav">
      <button type="button" data-nav="routine" class="active">Bugün</button>
      <button type="button" data-nav="parent">Ebeveyn</button>
    </nav>
  </div>

  <div id="pin-modal" class="v2-modal" hidden>
    <div class="v2-modal__box">
      <p>Onay için PIN gir</p>
      <div id="pin-guardians"></div>
      <input type="password" id="pin-input" inputmode="numeric" autocomplete="off" maxlength="8">
      <p id="pin-error" class="v2-modal__error" hidden>PIN yanlış</p>
      <button type="button" id="pin-submit">Onayla</button>
      <button type="button" id="pin-cancel">Vazgeç</button>
    </div>
  </div>

  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: styles-v2.css oluştur**

Mevcut `styles.css` korunur; bu dosya yalnızca yeni bileşenleri tanımlar. Tanımlanacak sınıflar: `.v2-view`, `.v2-view.active`, `.v2-nav`, `.routine-header`, `.routine-block`, `.routine-block__title`, `.routine-card`, `.card--locked`, `.card--available`, `.card--awaiting_approval`, `.card--done`, `.parent-queue`, `.parent-queue__item`, `.parent-queue__approve`, `.parent-empty`, `.v2-modal`, `.v2-modal__box`, `.v2-modal__error`.

Görsel yön: mevcut `styles.css`'in renk paleti, yazı tipi ölçeği ve köşe yuvarlaklığıyla uyumlu kal, yeni bir tasarım dili icat etme. Durum ayrımı net olsun: `card--locked` soluk ve etkileşimsiz, `card--available` belirgin ve dokunulabilir, `card--awaiting_approval` beklemede olduğu anlaşılır, `card--done` tamamlanmış. Yalnızca `.v2-view.active` görünür, diğerleri gizli.

- [ ] **Step 4: src/main.js oluştur**

```js
import { createStorage } from './core/storage.js';
import { createAppState } from './core/state.js';
import { verifyPin } from './core/crypto.js';
import { seedProfile } from './data/defaults.js';
import { dayKey, completeCard, approveCard } from './engines/routine.js';
import { routineViewModel } from './views/routine.js';
import { approvalQueue } from './views/parent.js';
import { el, mount } from './ui/dom.js';

const state = createAppState(createStorage(window.localStorage, 'ataol2'));

let profile = state.loadProfile();
if (!profile) {
  profile = seedProfile({ childName: 'Deha', birthYear: 2016, guardians: [] });
  state.saveProfile(profile);
}

const now = () => new Date();
const today = () => dayKey(now(), profile.settings.dayResetHour);

let pendingCardId = null;

function cardNode(card) {
  return el('li', {
    className: `routine-card card--${card.state}`,
    dataset: { cardId: card.id }
  }, [
    el('span', { className: 'material-symbols-rounded routine-card__icon', text: card.icon }),
    el('span', { className: 'routine-card__title', text: card.title }),
    el('span', { className: 'routine-card__reward', text: `${card.stars}★ · ${card.minutes}dk` })
  ]);
}

function blockNode(block) {
  return el('section', { className: 'routine-block', dataset: { block: block.id } }, [
    el('h2', { className: 'routine-block__title' }, [
      el('span', { text: block.title }),
      el('span', { className: 'routine-block__time', text: block.from })
    ]),
    el('ul', { className: 'routine-block__cards' }, block.cards.map(cardNode))
  ]);
}

function renderRoutine() {
  const vm = routineViewModel(profile, state.loadDayProgress(today()), now());
  mount(document.getElementById('view-routine'), [
    el('header', { className: 'routine-header' }, [
      el('p', { className: 'routine-header__greeting', text: `Merhaba ${vm.childName}` }),
      el('p', { className: 'routine-header__totals', text: `${vm.stars}★ · ${vm.minutes}/${vm.minuteCap} dk` })
    ]),
    ...vm.blocks.map(blockNode)
  ]);
}

function renderParent() {
  const queue = approvalQueue(profile, state.loadDayProgress(today()));
  const target = document.getElementById('view-parent');

  if (queue.length === 0) {
    mount(target, [el('p', { className: 'parent-empty', text: 'Onay bekleyen görev yok.' })]);
    return;
  }

  mount(target, [
    el('ul', { className: 'parent-queue' }, queue.map((c) =>
      el('li', { className: 'parent-queue__item' }, [
        el('span', { className: 'material-symbols-rounded', text: c.icon }),
        el('span', { className: 'parent-queue__title', text: c.title }),
        el('span', { className: 'parent-queue__reward', text: `${c.stars}★` }),
        el('button', {
          className: 'parent-queue__approve',
          text: 'Onayla',
          attrs: { type: 'button' },
          dataset: { approveCard: c.id }
        })
      ])
    ))
  ]);
}

function render() {
  renderRoutine();
  renderParent();
}

function openPinModal(cardId) {
  pendingCardId = cardId;

  mount(document.getElementById('pin-guardians'), profile.guardians.map((g, i) =>
    el('label', {}, [
      el('input', { attrs: { type: 'radio', name: 'guardian', value: g.id, ...(i === 0 ? { checked: 'checked' } : {}) } }),
      el('span', { text: g.label })
    ])
  ));

  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').hidden = true;
  document.getElementById('pin-modal').hidden = false;
}

function closePinModal() {
  document.getElementById('pin-modal').hidden = true;
  document.getElementById('pin-input').value = '';
  pendingCardId = null;
}

async function submitPin() {
  const selected = document.querySelector('input[name="guardian"]:checked');
  const guardian = profile.guardians.find((g) => g.id === selected?.value);
  const pin = document.getElementById('pin-input').value;

  if (!guardian || !(await verifyPin(pin, guardian.pinHash, guardian.pinSalt))) {
    document.getElementById('pin-error').hidden = false;
    return;
  }

  const card = profile.cards.find((c) => c.id === pendingCardId);
  const dp = state.loadDayProgress(today());
  state.saveDayProgress(today(), approveCard(dp, card, guardian.id, now().toISOString()));

  closePinModal();
  render();
}

document.getElementById('app').addEventListener('click', (e) => {
  const card = e.target.closest('[data-card-id]');
  if (card?.classList.contains('card--available')) {
    const dp = state.loadDayProgress(today());
    const next = completeCard(profile, dp, card.dataset.cardId, now());
    if (next !== dp) {
      state.saveDayProgress(today(), next);
      render();
    }
    return;
  }

  const approve = e.target.closest('[data-approve-card]');
  if (approve) {
    openPinModal(approve.dataset.approveCard);
    return;
  }

  const nav = e.target.closest('[data-nav]');
  if (nav) {
    for (const v of document.querySelectorAll('.v2-view')) v.classList.remove('active');
    for (const b of document.querySelectorAll('[data-nav]')) b.classList.remove('active');
    document.getElementById(`view-${nav.dataset.nav}`).classList.add('active');
    nav.classList.add('active');
  }
});

document.getElementById('pin-submit').addEventListener('click', submitPin);
document.getElementById('pin-cancel').addEventListener('click', closePinModal);

render();
```

- [ ] **Step 5: Tarayıcıda doğrula**

Yerel sunucu başlat:

```bash
cd ~/ataol-ai && python -m http.server 8080
```

`http://localhost:8080/v2.html` aç. Şunları elle doğrula, her biri için ekran görüntüsü al:

1. Sabah bloğunda yalnızca ilk kart belirgin, diğerleri soluk
2. İlk karta dokununca onay bekleme durumuna geçiyor ve ikinci kart açılıyor
3. Üstteki yıldız sayacı **değişmiyor** (onay bekleyen puan vermez)
4. Ebeveyn sekmesinde kart onay kuyruğunda görünüyor
5. `http://localhost:8080/index.html` hâlâ eskisi gibi çalışıyor

**PIN akışı için** tohum profilde bakım veren yok. Bu bilinçli: bakım veren ekleme Faz 2'nin onboarding işi. Şimdilik tarayıcı konsolundan ekleyerek doğrula:

```js
const { hashPin } = await import('./src/core/crypto.js');
const { addGuardian } = await import('./src/core/profile.js');
const p = JSON.parse(localStorage.getItem('ataol2:profile'));
const baba = await hashPin('1234');
const anne = await hashPin('5678');
let yeni = addGuardian(p, { name: 'Baba', label: 'Baba', pinHash: baba.hash, pinSalt: baba.salt });
yeni = addGuardian(yeni, { name: 'Feride', label: 'Feride mama', pinHash: anne.hash, pinSalt: anne.salt });
localStorage.setItem('ataol2:profile', JSON.stringify(yeni));
location.reload();
```

Sonra doğrula: yanlış PIN hata gösterir ve puan vermez; doğru PIN puanı verir, kart tamamlanır, kuyruktan çıkar.

- [ ] **Step 6: Commit**

```bash
git add v2.html styles-v2.css src/ui/dom.js src/main.js
git commit -m "feat(app): v2 kabugu, rutin ekrani ve PIN onay akisi"
```

---

## Task 6: Tüm paket ve mimari doğrulaması

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`
Expected: `# pass 110`, `# fail 0`

Dağılım: mevcut 70 + defaults 10 + state 10 + routine-view 10 + parent-view 10 = 110.

Sayı tutmuyorsa BLOCKED bildir, düzeltmeye çalışma.

- [ ] **Step 2: Mimari kuralı doğrula**

```bash
grep -rnE "document\.|window\.|innerHTML|addEventListener" src/views/ src/core/ src/engines/ && echo "IHLAL VAR" || echo "TEMIZ"
```

Expected: `TEMIZ`. Yalnızca `src/main.js` ve `src/ui/dom.js` DOM'a dokunabilir.

- [ ] **Step 3: innerHTML hiçbir yerde kullanılmıyor**

```bash
grep -rn "innerHTML" src/ && echo "IHLAL VAR" || echo "TEMIZ"
```

Expected: `TEMIZ`.

- [ ] **Step 4: README'ye kuralı ekle**

`README.md` içindeki "Mimari kuralları" listesine beşinci madde olarak ekle:

```
5. **`innerHTML` kullanılmaz.** Görünüm modülleri düz veri döndürür, DOM `createElement` ve `textContent` ile kurulur. Enjeksiyon böylece kaçış disiplinine değil yapıya bağlı olarak engellenir.
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: innerHTML yasagi mimari kurallara eklendi"
```

---

## Kapsam dışı (1C, 1D ve Faz 2'ye bırakıldı)

| İş | Faz |
|---|---|
| Matematik quiz görünümü | 1C |
| Ebeveyn paneli 10x10 ısı haritası | 1C |
| Günlük giriş ekranı ve PDF dışa aktarımı | 1C |
| Ödül ekranı ve ilerleme çubukları | 1C |
| Haftalık onay özetinin ekrana bağlanması (`approvalSummary` hazır, görünümü yok) | 1C |
| Kahramanlar, fıkralar, bilmeceler, bilgi kartları taşınması | 1D |
| Sohbet modülü (`engines/ai.js`) | 1D |
| `app.js` emekliye ayrılması, `index.html` devri | 1D |
| v1 `localStorage` verisinin göçü | 1D |
| Bakım veren ekleme ve onboarding ekranı | Faz 2 |
| `storage.set` kota hatası yönetimi | 1C |
