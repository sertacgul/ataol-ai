# ATAOL v2 Faz 1A: Çekirdek ve Motorlar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ATAOL v2'nin tüm iş mantığını (profil, rutin, matematik, ödül, günlük) saf ve test edilmiş modüller olarak kurmak. UI yok.

**Architecture:** Motorlar **saf fonksiyonlardır**: girdi olarak durum nesnesi alır, yeni durum nesnesi döndürür. `localStorage`, `Date.now()` ve `Math.random()` motorların içinde çağrılmaz, dışarıdan enjekte edilir. Bunun tek sebebi test edilebilirlik: jsdom olmadan, tarayıcı olmadan, zamana bağlı kırılganlık olmadan test yazabilmek. Tek yan etkili modül `core/storage.js`.

Bağımlılık yönü tek taraflıdır: `views` → `engines` → `core`. Ters import yasak.

**Tech Stack:** Vanilla ES modules, Node 22 yerleşik test runner (`node --test`), WebCrypto (`crypto.subtle`). **Sıfır npm bağımlılığı, `node_modules` yok, build adımı yok.**

**Referans spec:** `docs/superpowers/specs/2026-07-24-ataol-v2-design.md`

---

## Dosya Yapısı

| Dosya | Sorumluluk |
|---|---|
| `src/core/storage.js` | Tek yan etkili modül. `localStorage` sarmalayıcı, JSON serileştirme, ön ek yönetimi. Backend enjekte edilebilir. |
| `src/core/crypto.js` | PBKDF2 ile PIN hash ve doğrulama, rastgele kimlik üretimi. |
| `src/core/profile.js` | Profil şeması, varsayılan profil üretimi, doğrulama. Kişi adı burada da sabit yazılmaz. |
| `src/engines/routine.js` | Gün anahtarı, blok açılımı, kart durum makinesi, tamamlama ve onay. |
| `src/engines/math.js` | Leitner kutuları, soru seçimi, cevap kaydı, tablo yeterliliği. |
| `src/engines/rewards.js` | Günlük yıldız/dakika toplamı, günlük tavan, ödül ilerlemesi. |
| `src/engines/diary.js` | Ebeveyn günlüğü girdileri ve dönem özeti. Cihazdan çıkmaz. |
| `tests/*.test.js` | Her modül için birebir eşleşen test dosyası. |

---

## Task 0: Depo taşıma ve test iskeleti

**Files:**
- Move: `~/.gemini/antigravity/scratch/ataol-ai` → `~/ataol-ai`
- Create: `package.json`
- Create: `tests/smoke.test.js`

- [ ] **Step 1: Depoyu güvenli konuma taşı**

Scratch dizini temizlenebilir. Taşımadan önce çalışan bir yedek olsun diye push et, sonra taşı.

```bash
cd ~/.gemini/antigravity/scratch/ataol-ai
git push origin master
mv ~/.gemini/antigravity/scratch/ataol-ai ~/ataol-ai
cd ~/ataol-ai && git status
```

Expected: `On branch master`, `nothing to commit, working tree clean`

- [ ] **Step 2: package.json oluştur**

Bu dosya bağımlılık için değil, `"type": "module"` bildirimi ve test komutu için. `dependencies` bölümü kasıtlı olarak yok.

```json
{
  "name": "ataol-ai",
  "version": "2.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\""
  }
}
```

- [ ] **Step 3: Duman testi yaz**

Create `tests/smoke.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test runner and WebCrypto are available', async () => {
  assert.equal(typeof crypto.subtle.deriveBits, 'function');
});
```

- [ ] **Step 4: Testi çalıştır**

Run: `cd ~/ataol-ai && node --test "tests/**/*.test.js"`
Expected: `# pass 1`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
cd ~/ataol-ai
git add package.json tests/smoke.test.js
git commit -m "chore: node test runner iskeleti, sifir bagimlilik"
```

---

## Task 1: core/storage.js

Tek yan etkili modül. Backend enjekte edilebilir olduğu için testte gerçek `localStorage` gerekmez.

**Files:**
- Create: `src/core/storage.js`
- Test: `tests/storage.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/storage.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';

test('set ve get JSON nesnesini korur', () => {
  const s = createStorage(memoryBackend());
  s.set('profile', { name: 'X', stars: 3 });
  assert.deepEqual(s.get('profile'), { name: 'X', stars: 3 });
});

test('olmayan anahtar icin fallback doner', () => {
  const s = createStorage(memoryBackend());
  assert.equal(s.get('yok', 'varsayilan'), 'varsayilan');
});

test('anahtarlar on ek ile yazilir', () => {
  const backend = memoryBackend();
  const s = createStorage(backend, 'ataol');
  s.set('stars', 5);
  assert.equal(backend.getItem('ataol:stars'), '5');
});

test('bozuk JSON fallback dondurur, patlamaz', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:x', '{bozuk');
  const s = createStorage(backend, 'ataol');
  assert.equal(s.get('x', null), null);
});

test('remove anahtari siler', () => {
  const s = createStorage(memoryBackend());
  s.set('a', 1);
  s.remove('a');
  assert.equal(s.get('a', null), null);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/storage.test.js`
Expected: FAIL, `Cannot find module '../src/core/storage.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/core/storage.js`:

```js
/**
 * Tek yan etkili modul. Motorlar bu modulu import etmez.
 * Backend enjekte edilebilir: testte memoryBackend, tarayicida localStorage.
 */

export function memoryBackend() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; }
  };
}

export function createStorage(backend, prefix = 'ataol') {
  const full = (key) => `${prefix}:${key}`;

  return {
    get(key, fallback = null) {
      const raw = backend.getItem(full(key));
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      backend.setItem(full(key), JSON.stringify(value));
    },

    remove(key) {
      backend.removeItem(full(key));
    },

    keys() {
      const out = [];
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith(`${prefix}:`)) out.push(k.slice(prefix.length + 1));
      }
      return out;
    }
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/storage.test.js`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/core/storage.js tests/storage.test.js
git commit -m "feat(core): enjekte edilebilir backend ile storage sarmalayici"
```

---

## Task 2: core/crypto.js

PIN'ler düz metin saklanmaz. Hedeflenen tehdit modeli: devtools açmayı öğrenen bir çocuk. Kararlı bir saldırgan hedeflenmiyor.

**Files:**
- Create: `src/core/crypto.js`
- Test: `tests/crypto.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/crypto.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPin, verifyPin, randomId } from '../src/core/crypto.js';

test('hashPin hash ve salt dondurur', async () => {
  const { hash, salt } = await hashPin('1234');
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.match(salt, /^[0-9a-f]{32}$/);
});

test('ayni PIN farkli salt ile farkli hash uretir', async () => {
  const a = await hashPin('1234');
  const b = await hashPin('1234');
  assert.notEqual(a.hash, b.hash);
});

test('dogru PIN dogrulanir', async () => {
  const { hash, salt } = await hashPin('4821');
  assert.equal(await verifyPin('4821', hash, salt), true);
});

test('yanlis PIN reddedilir', async () => {
  const { hash, salt } = await hashPin('4821');
  assert.equal(await verifyPin('4822', hash, salt), false);
});

test('randomId benzersiz degerler uretir', () => {
  const ids = new Set(Array.from({ length: 200 }, () => randomId()));
  assert.equal(ids.size, 200);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/crypto.test.js`
Expected: FAIL, `Cannot find module '../src/core/crypto.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/core/crypto.js`:

```js
/**
 * PIN hash. Tehdit modeli: devtools acmayi ogrenen bir cocuk.
 * Kararli bir saldirgan hedeflenmiyor, caydiricilik yeterli.
 */

const ITERATIONS = 100000;

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(pin, saltBytes) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPin(pin, saltHex) {
  const saltBytes = saltHex
    ? fromHex(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, saltBytes);
  return { hash, salt: toHex(saltBytes) };
}

export async function verifyPin(pin, hash, salt) {
  const result = await derive(pin, fromHex(salt));
  return result === hash;
}

export function randomId() {
  return crypto.randomUUID();
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/crypto.test.js`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/core/crypto.js tests/crypto.test.js
git commit -m "feat(core): PBKDF2 tabanli PIN hash ve dogrulama"
```

---

## Task 3: core/profile.js

Spec'in en önemli kuralı burada uygulanır: **kodda kişi adı sabit yazılmaz.**

**Files:**
- Create: `src/core/profile.js`
- Test: `tests/profile.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/profile.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SCHEMA_VERSION,
  createProfile,
  addGuardian,
  validateProfile
} from '../src/core/profile.js';

test('createProfile sema surumu ve bos bakim veren listesi verir', () => {
  const p = createProfile({ childName: 'Test', birthYear: 2016 });
  assert.equal(p.schemaVersion, SCHEMA_VERSION);
  assert.equal(p.child.name, 'Test');
  assert.deepEqual(p.guardians, []);
});

test('varsayilan ayarlar spec degerleriyle gelir', () => {
  const p = createProfile({ childName: 'X', birthYear: 2016 });
  assert.equal(p.settings.dayResetHour, 4);
  assert.equal(p.settings.dailyMinuteCap, 60);
  assert.equal(p.settings.mathSpeedThresholdMs, 6000);
});

test('addGuardian yeni profil dondurur, orjinali bozmaz', () => {
  const p = createProfile({ childName: 'X', birthYear: 2016 });
  const p2 = addGuardian(p, { name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' });
  assert.equal(p.guardians.length, 0);
  assert.equal(p2.guardians.length, 1);
  assert.ok(p2.guardians[0].id);
});

test('validateProfile eksik cocuk adini yakalar', () => {
  const p = createProfile({ childName: '', birthYear: 2016 });
  const r = validateProfile(p);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('child.name')));
});

test('validateProfile gecerli profili onaylar', () => {
  let p = createProfile({ childName: 'X', birthYear: 2016 });
  p = addGuardian(p, { name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' });
  assert.equal(validateProfile(p).valid, true);
});

test('kodda kisi adi sabit yazili degil', () => {
  const src = readFileSync(new URL('../src/core/profile.js', import.meta.url), 'utf8');
  for (const name of ['Deha', 'Feride', 'Sertaç', 'Sertac']) {
    assert.ok(!src.includes(name), `profile.js icinde "${name}" gecmemeli`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/profile.test.js`
Expected: FAIL, `Cannot find module '../src/core/profile.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/core/profile.js`:

```js
import { randomId } from './crypto.js';

export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS = {
  dayResetHour: 4,
  dailyMinuteCap: 60,
  mathSpeedThresholdMs: 6000,
  language: 'tr',
  theme: 'default'
};

export const DEFAULT_SCHEDULE = {
  morning: { from: '06:30' },
  afternoon: { from: '15:00' },
  evening: { from: '19:00' }
};

export function createProfile({ childName, birthYear, avatar = null }) {
  return {
    id: randomId(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: null,
    child: { name: childName, birthYear, avatar },
    guardians: [],
    cards: [],
    routine: { morning: [], afternoon: [], evening: [] },
    schedule: { ...DEFAULT_SCHEDULE },
    rewards: [],
    settings: { ...DEFAULT_SETTINGS }
  };
}

export function addGuardian(profile, { name, label, color = null, pinHash, pinSalt }) {
  return {
    ...profile,
    guardians: [
      ...profile.guardians,
      { id: randomId(), name, label, color, pinHash, pinSalt }
    ]
  };
}

export function validateProfile(profile) {
  const errors = [];

  if (!profile.child?.name?.trim()) errors.push('child.name bos olamaz');
  if (!Number.isInteger(profile.child?.birthYear)) errors.push('child.birthYear tam sayi olmali');
  if (!Array.isArray(profile.guardians) || profile.guardians.length === 0) {
    errors.push('en az bir bakim veren gerekli');
  }
  if (profile.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion ${SCHEMA_VERSION} olmali`);
  }

  for (const g of profile.guardians ?? []) {
    if (!g.pinHash || !g.pinSalt) errors.push(`bakim veren ${g.name}: PIN eksik`);
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/profile.test.js`
Expected: `# pass 6`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/core/profile.js tests/profile.test.js
git commit -m "feat(core): profil semasi, dogrulama, kodda sabit isim yasagi testi"
```

---

## Task 4: engines/routine.js

Kart durum makinesi ve gün mantığı. Zaman dışarıdan verilir, `Date.now()` çağrılmaz.

**Files:**
- Create: `src/engines/routine.js`
- Test: `tests/routine.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/routine.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayKey,
  availableBlocks,
  cardStates,
  completeCard,
  approveCard,
  emptyDayProgress
} from '../src/engines/routine.js';

const schedule = {
  morning: { from: '06:30' },
  afternoon: { from: '15:00' },
  evening: { from: '19:00' }
};

test('dayKey sifirlama saatinden once onceki gunu verir', () => {
  assert.equal(dayKey(new Date('2026-07-24T02:30:00'), 4), '2026-07-23');
});

test('dayKey sifirlama saatinden sonra ayni gunu verir', () => {
  assert.equal(dayKey(new Date('2026-07-24T05:00:00'), 4), '2026-07-24');
});

test('availableBlocks saati gelmemis bloklari vermez', () => {
  assert.deepEqual(availableBlocks(new Date('2026-07-24T07:00:00'), schedule), ['morning']);
});

test('availableBlocks gecmis bloklari acik birakir', () => {
  assert.deepEqual(
    availableBlocks(new Date('2026-07-24T20:00:00'), schedule),
    ['morning', 'afternoon', 'evening']
  );
});

test('blok icinde sadece ilk kart available, sonrakiler locked', () => {
  const profile = {
    schedule,
    cards: [
      { id: 'c1', block: 'morning', type: 'inapp', stars: 5, minutes: 5 },
      { id: 'c2', block: 'morning', type: 'inapp', stars: 5, minutes: 5 }
    ],
    routine: { morning: ['c1', 'c2'], afternoon: [], evening: [] }
  };
  const states = cardStates(profile, emptyDayProgress(), new Date('2026-07-24T07:00:00'));
  assert.equal(states.find((s) => s.cardId === 'c1').state, 'available');
  assert.equal(states.find((s) => s.cardId === 'c2').state, 'locked');
});

test('onay gerektiren kart tamamlaninca awaiting_approval olur', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.cards.c1.state, 'awaiting_approval');
});

test('onay bekleyen kart puan vermez', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('onaylandiktan sonra puan verilir ve onaylayan kaydedilir', () => {
  const card = { id: 'c1', block: 'morning', type: 'approved', stars: 10, minutes: 10 };
  let dp = completeCard(emptyDayProgress(), card);
  dp = approveCard(dp, card, 'guardian-7', '2026-07-24T08:00:00Z');
  assert.equal(dp.cards.c1.state, 'done');
  assert.equal(dp.stars, 10);
  assert.equal(dp.minutes, 10);
  assert.equal(dp.approvals[0].guardianId, 'guardian-7');
});

test('olcum karti onaysiz dogrudan puan verir', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  const dp = completeCard(emptyDayProgress(), card);
  assert.equal(dp.cards.m1.state, 'done');
  assert.equal(dp.stars, 8);
});

test('ayni kart iki kez puan vermez', () => {
  const card = { id: 'm1', block: 'morning', type: 'measured', stars: 8, minutes: 4 };
  let dp = completeCard(emptyDayProgress(), card);
  dp = completeCard(dp, card);
  assert.equal(dp.stars, 8);
});

test('tamamlanan karttan sonraki kart acilir', () => {
  const profile = {
    schedule,
    cards: [
      { id: 'c1', block: 'morning', type: 'measured', stars: 5, minutes: 5 },
      { id: 'c2', block: 'morning', type: 'inapp', stars: 5, minutes: 5 }
    ],
    routine: { morning: ['c1', 'c2'], afternoon: [], evening: [] }
  };
  const dp = completeCard(emptyDayProgress(), profile.cards[0]);
  const states = cardStates(profile, dp, new Date('2026-07-24T07:00:00'));
  assert.equal(states.find((s) => s.cardId === 'c2').state, 'available');
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/routine.test.js`
Expected: FAIL, `Cannot find module '../src/engines/routine.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/engines/routine.js`:

```js
/**
 * Saf rutin motoru. Date.now() cagrilmaz, zaman disaridan gelir.
 *
 * Tasarim karari: bir blok, baslangic saati gectikten sonra gunun sonuna
 * kadar acik kalir. Kapanma yoktur. Sabah gorevini 10'da yapan bir cocuk
 * kilitlenmis hissetmemeli, bu direnc uretir.
 */

export const BLOCKS = ['morning', 'afternoon', 'evening'];

export function emptyDayProgress() {
  return { cards: {}, approvals: [], stars: 0, minutes: 0 };
}

export function dayKey(date, resetHour = 4) {
  const shifted = new Date(date.getTime() - resetHour * 3600 * 1000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const d = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function parseTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function availableBlocks(date, schedule) {
  const now = minutesOfDay(date);
  return BLOCKS.filter((b) => schedule[b] && now >= parseTime(schedule[b].from));
}

export function cardStates(profile, dayProgress, date) {
  const open = new Set(availableBlocks(date, profile.schedule));
  const byId = new Map(profile.cards.map((c) => [c.id, c]));
  const out = [];

  for (const block of BLOCKS) {
    const ids = profile.routine[block] ?? [];
    let previousClosed = true;

    for (const id of ids) {
      const stored = dayProgress.cards[id];
      let state;

      if (stored) {
        state = stored.state;
      } else if (!open.has(block) || !previousClosed) {
        state = 'locked';
      } else {
        state = 'available';
      }

      out.push({ cardId: id, block, state, card: byId.get(id) ?? null });
      previousClosed = state === 'done' || state === 'awaiting_approval';
    }
  }

  return out;
}

export function completeCard(dayProgress, card) {
  if (dayProgress.cards[card.id]) return dayProgress;

  const needsApproval = card.type === 'approved';
  const state = needsApproval ? 'awaiting_approval' : 'done';

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [card.id]: { state } },
    stars: dayProgress.stars + (needsApproval ? 0 : card.stars),
    minutes: dayProgress.minutes + (needsApproval ? 0 : card.minutes)
  };
}

export function approveCard(dayProgress, card, guardianId, timestamp) {
  const stored = dayProgress.cards[card.id];
  if (!stored || stored.state !== 'awaiting_approval') return dayProgress;

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [card.id]: { state: 'done' } },
    approvals: [...dayProgress.approvals, { cardId: card.id, guardianId, timestamp }],
    stars: dayProgress.stars + card.stars,
    minutes: dayProgress.minutes + card.minutes
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/routine.test.js`
Expected: `# pass 11`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/routine.js tests/routine.test.js
git commit -m "feat(engines): rutin motoru, kart durum makinesi ve onay akisi"
```

---

## Task 5: engines/math.js

Leitner kutulu aralıklı tekrar. Rastgelelik enjekte edilir, testler deterministik olur.

**Files:**
- Create: `src/engines/math.js`
- Test: `tests/math.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/math.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFactSet,
  recordAnswer,
  selectFact,
  isTableMastered,
  nextTable,
  MASTERY_BOX,
  MAX_BOX
} from '../src/engines/math.js';

test('createFactSet her tablo icin 10 carpim uretir', () => {
  const facts = createFactSet([2, 3]);
  assert.equal(Object.keys(facts).length, 20);
  assert.equal(facts['2x1'].box, 1);
});

test('dogru ve hizli cevap kutuyu yukseltir', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 1500, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 2);
});

test('dogru ama yavas cevap kutuyu yukseltmez', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 9000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 1);
  assert.equal(facts['2x3'].correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let facts = createFactSet([2]);
  for (let i = 0; i < 3; i++) {
    facts = recordAnswer(facts, '2x3', { correct: true, ms: 1000, thresholdMs: 6000 });
  }
  assert.equal(facts['2x3'].box, 4);
  facts = recordAnswer(facts, '2x3', { correct: false, ms: 3000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 1);
});

test('kutu MAX_BOX degerini asmaz', () => {
  let facts = createFactSet([2]);
  for (let i = 0; i < 20; i++) {
    facts = recordAnswer(facts, '2x3', { correct: true, ms: 1000, thresholdMs: 6000 });
  }
  assert.equal(facts['2x3'].box, MAX_BOX);
});

test('recordAnswer sayaclari ve ortalama sureyi gunceller', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 2000, thresholdMs: 6000 });
  facts = recordAnswer(facts, '2x3', { correct: false, ms: 4000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].seen, 2);
  assert.equal(facts['2x3'].correct, 1);
  assert.equal(facts['2x3'].wrong, 1);
  assert.equal(facts['2x3'].avgMs, 3000);
});

test('selectFact dusuk kutulu sorulari daha sik secer', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) {
    if (k !== '2x7') facts[k] = { ...facts[k], box: MAX_BOX };
  }
  let hits = 0;
  for (let i = 0; i < 500; i++) {
    const rng = () => (i + 0.5) / 500;
    if (selectFact(facts, rng) === '2x7') hits++;
  }
  assert.ok(hits > 250, `zayif soru 500 secimde ${hits} kez cikti, cogunlukta olmaliydi`);
});

test('selectFact her zaman gecerli bir anahtar dondurur', () => {
  const facts = createFactSet([3]);
  for (let i = 0; i < 50; i++) {
    const key = selectFact(facts, () => i / 50);
    assert.ok(facts[key], `gecersiz anahtar: ${key}`);
  }
});

test('tum carpimlar MASTERY_BOX ustunde ise tablo gecilmis sayilir', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  assert.equal(isTableMastered(facts, 2), true);
});

test('tek zayif carpim varken tablo gecilmemis sayilir', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  facts['2x9'] = { ...facts['2x9'], box: 2 };
  assert.equal(isTableMastered(facts, 2), false);
});

test('nextTable gecilmemis ilk tabloyu dondurur', () => {
  let facts = createFactSet([2, 3]);
  for (const k of Object.keys(facts)) {
    if (k.startsWith('2x')) facts[k] = { ...facts[k], box: MASTERY_BOX };
  }
  assert.equal(nextTable(facts, [2, 3]), 3);
});

test('hepsi gecilmisse nextTable null dondurur', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  assert.equal(nextTable(facts, [2]), null);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/math.test.js`
Expected: FAIL, `Cannot find module '../src/engines/math.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/engines/math.js`:

```js
/**
 * Leitner kutulu aralikli tekrar.
 *
 * Yavas verilen dogru cevap kutuyu yukseltmez. Carpim tablosunda hedef
 * dogruluk degil otomatikliktir; parmak sayarak bulunan dogru cevap
 * ogrenilmis sayilmaz.
 */

export const MAX_BOX = 5;
export const MASTERY_BOX = 4;

const BOX_WEIGHTS = { 1: 16, 2: 8, 3: 4, 4: 2, 5: 1 };

export function createFactSet(tables) {
  const facts = {};
  for (const t of tables) {
    for (let i = 1; i <= 10; i++) {
      facts[`${t}x${i}`] = {
        table: t,
        box: 1,
        seen: 0,
        correct: 0,
        wrong: 0,
        avgMs: 0,
        lastSeen: null
      };
    }
  }
  return facts;
}

export function recordAnswer(facts, key, { correct, ms, thresholdMs, timestamp = null }) {
  const fact = facts[key];
  if (!fact) return facts;

  let box = fact.box;
  if (!correct) {
    box = 1;
  } else if (ms <= thresholdMs) {
    box = Math.min(MAX_BOX, box + 1);
  }

  const seen = fact.seen + 1;

  return {
    ...facts,
    [key]: {
      ...fact,
      box,
      seen,
      correct: fact.correct + (correct ? 1 : 0),
      wrong: fact.wrong + (correct ? 0 : 1),
      avgMs: Math.round((fact.avgMs * fact.seen + ms) / seen),
      lastSeen: timestamp
    }
  };
}

export function selectFact(facts, rng = Math.random) {
  const keys = Object.keys(facts);
  if (keys.length === 0) return null;

  const weights = keys.map((k) => BOX_WEIGHTS[facts[k].box] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);

  let ticket = rng() * total;
  for (let i = 0; i < keys.length; i++) {
    ticket -= weights[i];
    if (ticket < 0) return keys[i];
  }
  return keys[keys.length - 1];
}

export function isTableMastered(facts, table) {
  const keys = Object.keys(facts).filter((k) => facts[k].table === table);
  if (keys.length === 0) return false;
  return keys.every((k) => facts[k].box >= MASTERY_BOX);
}

export function nextTable(facts, tables) {
  for (const t of tables) {
    if (!isTableMastered(facts, t)) return t;
  }
  return null;
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/math.test.js`
Expected: `# pass 12`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/math.js tests/math.test.js
git commit -m "feat(engines): Leitner tabanli matematik motoru, hiz esikli terfi"
```

---

## Task 6: engines/rewards.js

Günlük dakika tavanı ve ödül ilerlemesi. Ceza yok: fonksiyonlar hiçbir koşulda negatif değer üretmez.

**Files:**
- Create: `src/engines/rewards.js`
- Test: `tests/rewards.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/rewards.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cappedMinutes,
  rewardProgress,
  totalStars,
  validateRewardLadder
} from '../src/engines/rewards.js';

test('tavan altindaki dakika oldugu gibi kalir', () => {
  assert.equal(cappedMinutes(35, 60), 35);
});

test('tavani asan dakika kirpilir', () => {
  assert.equal(cappedMinutes(95, 60), 60);
});

test('negatif dakika sifira cekilir', () => {
  assert.equal(cappedMinutes(-10, 60), 0);
});

test('totalStars gunleri toplar', () => {
  const days = {
    '2026-07-23': { stars: 20 },
    '2026-07-24': { stars: 15 }
  };
  assert.equal(totalStars(days), 35);
});

test('rewardProgress ilerleme yuzdesi ve kilit durumu verir', () => {
  const rewards = [
    { id: 'r1', name: 'Dondurma', target: 30 },
    { id: 'r2', name: 'Bisiklet', target: 400 }
  ];
  const p = rewardProgress(60, rewards);
  assert.equal(p[0].unlocked, true);
  assert.equal(p[0].progress, 1);
  assert.equal(p[1].unlocked, false);
  assert.equal(p[1].progress, 0.15);
});

test('rewardProgress ilerlemeyi 1 ile sinirlar', () => {
  const p = rewardProgress(1000, [{ id: 'r1', name: 'X', target: 30 }]);
  assert.equal(p[0].progress, 1);
});

test('validateRewardLadder 2 kati asan sicramayi uyarir', () => {
  const r = validateRewardLadder([
    { target: 30 },
    { target: 100 },
    { target: 400 },
    { target: 1500 }
  ]);
  assert.equal(r.valid, false);
  assert.ok(r.warnings.some((w) => w.includes('400') && w.includes('1500')));
});

test('validateRewardLadder duzgun merdiveni onaylar', () => {
  const r = validateRewardLadder([
    { target: 30 }, { target: 60 }, { target: 120 }, { target: 240 }
  ]);
  assert.equal(r.valid, true);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/rewards.test.js`
Expected: FAIL, `Cannot find module '../src/engines/rewards.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/engines/rewards.js`:

```js
/**
 * Odul ve para birimi mantigi.
 *
 * Ceza yoktur: hicbir fonksiyon negatif deger uretmez. Kotu gun puan
 * kaybettirmez, sadece o gunun kazanci olmaz.
 */

const MAX_LADDER_RATIO = 2;

export function cappedMinutes(minutes, cap) {
  if (minutes < 0) return 0;
  return Math.min(minutes, cap);
}

export function totalStars(days) {
  return Object.values(days).reduce((sum, d) => sum + (d.stars ?? 0), 0);
}

export function rewardProgress(stars, rewards) {
  return rewards.map((r) => ({
    ...r,
    progress: r.target > 0 ? Math.min(1, stars / r.target) : 1,
    unlocked: stars >= r.target
  }));
}

export function validateRewardLadder(rewards) {
  const warnings = [];
  const sorted = [...rewards].sort((a, b) => a.target - b.target);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].target;
    const curr = sorted[i].target;
    if (prev > 0 && curr / prev > MAX_LADDER_RATIO) {
      warnings.push(
        `${prev} ile ${curr} arasindaki sicrama ${MAX_LADDER_RATIO} katini asiyor, ara odul eklenmeli`
      );
    }
  }

  return { valid: warnings.length === 0, warnings };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/rewards.test.js`
Expected: `# pass 8`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/rewards.js tests/rewards.test.js
git commit -m "feat(engines): odul motoru, gunluk tavan ve merdiven dogrulamasi"
```

---

## Task 7: engines/diary.js

Ebeveyn günlüğü. Spec Bölüm 3.6 ve 5: bu veri cihazı terk etmez.

**Files:**
- Create: `src/engines/diary.js`
- Test: `tests/diary.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/diary.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DIARY_TAGS, addEntry, summarize, emptyDiary } from '../src/engines/diary.js';

test('etiket listesi spec ile ayni', () => {
  assert.deepEqual(
    [...DIARY_TAGS].sort(),
    ['ekran', 'kasima', 'ofke', 'olumlu', 'tetikleyici', 'uyku', 'yemek'].sort()
  );
});

test('addEntry girdiyi gune ekler', () => {
  const d = addEntry(emptyDiary(), '2026-07-24', { tag: 'uyku', note: 'gec yatti' });
  assert.equal(d['2026-07-24'].length, 1);
  assert.equal(d['2026-07-24'][0].tag, 'uyku');
});

test('addEntry ayni gune birden fazla girdi ekleyebilir', () => {
  let d = addEntry(emptyDiary(), '2026-07-24', { tag: 'uyku' });
  d = addEntry(d, '2026-07-24', { tag: 'kasima' });
  assert.equal(d['2026-07-24'].length, 2);
});

test('addEntry orjinal nesneyi bozmaz', () => {
  const d1 = emptyDiary();
  const d2 = addEntry(d1, '2026-07-24', { tag: 'uyku' });
  assert.equal(Object.keys(d1).length, 0);
  assert.equal(Object.keys(d2).length, 1);
});

test('gecersiz etiket reddedilir', () => {
  assert.throws(
    () => addEntry(emptyDiary(), '2026-07-24', { tag: 'olmayan' }),
    /gecersiz etiket/
  );
});

test('summarize aralikta etiket sayilarini verir', () => {
  let d = emptyDiary();
  d = addEntry(d, '2026-07-20', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'uyku' });
  const s = summarize(d, '2026-07-20', '2026-07-24');
  assert.equal(s.tagCounts.kasima, 2);
  assert.equal(s.tagCounts.uyku, 1);
  assert.equal(s.daysWithEntries, 2);
});

test('summarize aralik disini saymaz', () => {
  let d = emptyDiary();
  d = addEntry(d, '2026-06-01', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'kasima' });
  const s = summarize(d, '2026-07-20', '2026-07-24');
  assert.equal(s.tagCounts.kasima, 1);
});

test('gunluk modulu ag cagrisi icermez', () => {
  const src = readFileSync(new URL('../src/engines/diary.js', import.meta.url), 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'WebSocket']) {
    assert.ok(!src.includes(forbidden), `diary.js icinde "${forbidden}" olmamali`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `node --test tests/diary.test.js`
Expected: FAIL, `Cannot find module '../src/engines/diary.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

Create `src/engines/diary.js`:

```js
/**
 * Ebeveyn gunlugu.
 *
 * SERT KURAL: bu veri cihazi terk etmez. Bulut yok, yedek yok, telemetri
 * yok. Gerekce: resit olmayan bireye ait saglik verisi, KVKK m.6 ozel
 * nitelikli kisisel veri kapsamina girer. Tek cikis yolu kullanicinin
 * kendi urettigi PDF.
 *
 * Bu modulde ag cagrisi bulunmasi bir testle engellenmistir.
 */

export const DIARY_TAGS = [
  'uyku',
  'kasima',
  'ofke',
  'yemek',
  'ekran',
  'olumlu',
  'tetikleyici'
];

export function emptyDiary() {
  return {};
}

export function addEntry(diary, dayKey, { tag, note = '', time = null }) {
  if (!DIARY_TAGS.includes(tag)) {
    throw new Error(`gecersiz etiket: ${tag}`);
  }

  return {
    ...diary,
    [dayKey]: [...(diary[dayKey] ?? []), { tag, note, time }]
  };
}

export function summarize(diary, fromKey, toKey) {
  const tagCounts = Object.fromEntries(DIARY_TAGS.map((t) => [t, 0]));
  let daysWithEntries = 0;

  for (const [day, entries] of Object.entries(diary)) {
    if (day < fromKey || day > toKey) continue;
    if (entries.length > 0) daysWithEntries++;
    for (const e of entries) {
      tagCounts[e.tag] = (tagCounts[e.tag] ?? 0) + 1;
    }
  }

  return { from: fromKey, to: toKey, tagCounts, daysWithEntries };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/diary.test.js`
Expected: `# pass 8`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/diary.js tests/diary.test.js
git commit -m "feat(engines): ebeveyn gunlugu, yerel-only kurali test ile korunuyor"
```

---

## Task 8: Tüm test paketi ve kapanış

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `cd ~/ataol-ai && node --test "tests/**/*.test.js"`
Expected: `# pass 56`, `# fail 0`

Dağılım: smoke 1, storage 5, crypto 5, profile 6, routine 11, math 12, rewards 8, diary 8.

- [ ] **Step 2: README'ye geliştirici bölümü ekle**

`README.md` dosyasının sonuna ekle:

```markdown
---

## Geliştirme

Bu proje bağımlılık kullanmaz. `node_modules` yoktur, build adımı yoktur.

Testler Node 22 yerleşik test runner'ı ile çalışır:

```bash
node --test "tests/**/*.test.js"
```

### Mimari kuralları

1. **Bağımlılık yönü tek taraflı:** `views` → `engines` → `core`. Ters import yasak.
2. **Motorlar saftır:** `engines/` altındaki modüller `localStorage`, `Date.now()` veya `Math.random()` çağırmaz. Zaman ve rastgelelik dışarıdan enjekte edilir.
3. **Kodda kişi adı sabit yazılmaz.** Tüm isimler profil verisinden gelir. Bu kural `tests/profile.test.js` ile korunur.
4. **Ebeveyn günlüğü cihazı terk etmez.** `engines/diary.js` içinde ağ çağrısı bulunması testle engellenir.
```

- [ ] **Step 3: Commit ve push**

```bash
git add README.md
git commit -m "docs: gelistirici bolumu ve mimari kurallari"
git push origin master
```

---

## Faz 1A sonrası

Bu plan bittiğinde elde: tamamen test edilmiş, UI'sız bir mantık katmanı. Uygulama henüz çalışmaz, çünkü arayüz yok.

**Plan 1B** şunları kapsayacak. Liste, spec'in 1A'da karşılanmayan her maddesiyle birebir eşleşiyor:

| Spec bölümü | 1B'de karşılanacak |
|---|---|
| 3.1 | Deha profilinin `src/data/defaults.js` üzerinden tohumlanması |
| 3.2 | Rutin görünümü, blok ve kart arayüzü |
| 3.3 | PIN giriş ekranı, haftalık "kim kaç onay verdi" özeti |
| 3.4 | Matematik quiz arayüzü ve ebeveyn panelindeki 10x10 ısı haritası |
| 3.5 | Ödül ekranı, dakika sayacı |
| 3.6 | Günlük giriş ekranı ve tek sayfalık PDF dışa aktarımı |
| 3.7 | İçerik havuzlarının (kahramanlar, fıkralar, bilmeceler, bilgi kartları) `src/data/` altına taşınması, `index.html` yeniden yapılandırma, mevcut `app.js`'in emekliye ayrılması |
| 3.8 | `src/engines/ai.js`: sağlayıcıdan bağımsız `ask(prompt, context)` arayüzü, Faz 1'de arkasında kullanıcının kendi Gemini anahtarı |

Ek olarak, spec'te geçmeyen ama gerekli olan tek iş: mevcut `localStorage` verisinin (yıldızlar, rozetler, okunan kahramanlar) v2 şemasına göçü. Deha'nın mevcut ilerlemesi sıfırlanmamalı.
