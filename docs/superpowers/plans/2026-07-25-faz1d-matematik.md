# ATAOL v2 Faz 1D: Matematik

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Günlük rutindeki "Matematik seti" kartını gerçek hale getirmek: dört işlem, kendini ayarlayan seviye, klavyeden cevap.

**Architecture:** `engines/math.js` emekliye ayrılır, yerine `engines/drill.js` gelir. Yeni motor `leitner.js` üstüne kurulur (kutu mantığı 1C'de tam bu yüzden ayrılmıştı). Karar veren hiçbir mantık `main.js`'te kalmaz.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

---

## Dört tasarım kararı

**1. `math.js` yerine `drill.js`.** Mevcut motorun API'si tablo merkezli: `createFactSet(tables)`, `isTableMastered(facts, table)`, `nextTable`. Toplama ve bölmeyi buna zorla sokmak çirkin bir melez üretir. Yeni motor sıfırdan dört işlem için tasarlanır; çarpma davranışı (yavaş doğru cevap terfi ettirmez) aynen korunur ve testle sabitlenir.

**2. Cevap klavyeden yazılır.** Çoktan seçmeli tahmine izin verir ve tanımayı ölçer. Yazmak **hatırlamayı** zorunlu kılar. Hedef otomatiklik olduğu için bu fark belirleyicidir. Takvim quizinde çoktan seçmeli doğruydu, çünkü orada amaç ay isimlerini tanımaktı; burada amaç `7×8`'i düşünmeden bilmek.

**3. Yanlış cevapta doğrusu gösterilir ve geçilir.** Takvim quizinin tersi. Orada aynı soru tekrar soruluyordu çünkü amaç maruz kalmaktı. Burada hemen tekrar sormak, az önce ekranda gösterilen cevabı kopyalamaya davettir. Leitner kutusu 1'e düşer ve soru zaten yakında geri gelir.

**4. Seviye kendini ayarlar.** Çocuk en baştan başlar. Biliyorsa kutular hızla dolar ve iki oturumda geçer; sürekli başarıdığı için aşağılayıcı olmaz. Gerçekten zayıfsa orada kalır ve temel oturur. Seviyesini tahmin etmek yerine motorun bulmasını sağlıyoruz.

---

## Task 1: engines/drill.js

**Files:**
- Create: `src/engines/drill.js`
- Test: `tests/drill.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/drill.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS, createDrill, factKey, selectDrillFact, recordDrillAnswer,
  isLevelMastered, nextLevel, levelById, formatQuestion
} from '../src/engines/drill.js';
import { MASTERY_BOX } from '../src/engines/leitner.js';

test('seviyeler sirali ve benzersiz', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(LEVELS.length >= 8);
  assert.equal(LEVELS[0].id, 'topla-10');
});

test('ilk seviye 10a kadar toplama uretir', () => {
  const f = createDrill('topla-10');
  const keys = Object.keys(f);
  assert.ok(keys.length > 0);
  for (const k of keys) {
    const { op, a, b, answer } = f[k];
    assert.equal(op, '+');
    assert.equal(answer, a + b);
    assert.ok(answer <= 10, `${k} 10u asiyor`);
    assert.ok(a >= 1 && b >= 1);
  }
});

test('cikarma seviyesinde sonuc negatif olmaz', () => {
  const f = createDrill('cikar-20');
  for (const k of Object.keys(f)) {
    assert.equal(f[k].op, '-');
    assert.ok(f[k].answer >= 0, `${k} negatif`);
    assert.equal(f[k].answer, f[k].a - f[k].b);
  }
});

test('bolme her zaman kalansiz', () => {
  const f = createDrill('bol');
  for (const k of Object.keys(f)) {
    assert.equal(f[k].op, '/');
    assert.equal(f[k].a % f[k].b, 0, `${k} kalanli`);
    assert.equal(f[k].answer, f[k].a / f[k].b);
  }
});

test('carpma seviyesi dogru tablolari icerir', () => {
  const f = createDrill('carp-2-5');
  const tablolar = new Set(Object.values(f).map((x) => x.a));
  assert.deepEqual([...tablolar].sort((x, y) => x - y), [2, 3, 4, 5]);
});

test('karisik seviye birden fazla islem icerir', () => {
  const f = createDrill('karisik');
  const islemler = new Set(Object.values(f).map((x) => x.op));
  assert.ok(islemler.size >= 3, `sadece ${[...islemler]} var`);
});

test('bilinmeyen seviye bos kume dondurur', () => {
  assert.deepEqual(createDrill('yok'), {});
});

test('factKey islem ve sayilari birlestirir', () => {
  assert.equal(factKey('x', 7, 8), '7x8');
  assert.equal(factKey('+', 3, 4), '3+4');
});

test('formatQuestion okunabilir isaret kullanir', () => {
  assert.equal(formatQuestion({ op: 'x', a: 7, b: 8 }), '7 × 8');
  assert.equal(formatQuestion({ op: '/', a: 24, b: 6 }), '24 ÷ 6');
  assert.equal(formatQuestion({ op: '-', a: 9, b: 4 }), '9 − 4');
  assert.equal(formatQuestion({ op: '+', a: 2, b: 5 }), '2 + 5');
});

test('dogru ve hizli cevap kutuyu yukseltir', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 1200, thresholdMs: 6000 });
  assert.equal(f[k].box, 2);
});

test('dogru ama yavas cevap kutuyu yukseltmez', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 9000, thresholdMs: 6000 });
  assert.equal(f[k].box, 1);
  assert.equal(f[k].correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  for (let i = 0; i < 3; i++) f = recordDrillAnswer(f, k, { correct: true, ms: 900, thresholdMs: 6000 });
  assert.equal(f[k].box, 4);
  f = recordDrillAnswer(f, k, { correct: false, ms: 2000, thresholdMs: 6000 });
  assert.equal(f[k].box, 1);
});

test('recordDrillAnswer ortalama sureyi gunceller', () => {
  let f = createDrill('topla-10');
  const k = Object.keys(f)[0];
  f = recordDrillAnswer(f, k, { correct: true, ms: 2000, thresholdMs: 6000 });
  f = recordDrillAnswer(f, k, { correct: false, ms: 4000, thresholdMs: 6000 });
  assert.equal(f[k].seen, 2);
  assert.equal(f[k].avgMs, 3000);
});

test('bilinmeyen anahtar yok sayilir', () => {
  const f = createDrill('topla-10');
  assert.deepEqual(recordDrillAnswer(f, 'yok', { correct: true, ms: 1, thresholdMs: 6000 }), f);
});

test('selectDrillFact zayif olani daha sik secer', () => {
  let f = createDrill('carp-2-5');
  const keys = Object.keys(f);
  const zayif = keys[0];
  for (const k of keys) if (k !== zayif) f[k] = { ...f[k], box: 5 };
  let hit = 0;
  for (let i = 0; i < 500; i++) {
    if (selectDrillFact(f, () => (i + 0.5) / 500) === zayif) hit++;
  }
  assert.ok(hit > 150, `zayif soru 500 secimde ${hit} kez cikti`);
});

test('tum kutular esige ulasinca seviye gecilir', () => {
  let f = createDrill('topla-10');
  for (const k of Object.keys(f)) f[k] = { ...f[k], box: MASTERY_BOX };
  assert.equal(isLevelMastered(f), true);
});

test('tek zayif kutu varken seviye gecilmez', () => {
  let f = createDrill('topla-10');
  const keys = Object.keys(f);
  for (const k of keys) f[k] = { ...f[k], box: MASTERY_BOX };
  f[keys[0]] = { ...f[keys[0]], box: 2 };
  assert.equal(isLevelMastered(f), false);
});

test('nextLevel siradaki seviyeyi verir', () => {
  assert.equal(nextLevel('topla-10'), LEVELS[1].id);
  assert.equal(nextLevel(LEVELS[LEVELS.length - 1].id), null);
  assert.equal(nextLevel('yok'), null);
});

test('levelById baslik dondurur', () => {
  assert.ok(levelById('topla-10').title.length > 0);
  assert.equal(levelById('yok'), null);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/drill.test.js`
Expected: FAIL, `Cannot find module '../src/engines/drill.js'`

- [ ] **Step 3: Implementasyonu yaz**

Create `src/engines/drill.js`:

```js
import { newBox, promote, demote, selectWeighted, isMastered } from './leitner.js';

/**
 * Dort islem alistirma motoru.
 *
 * Hedef otomatiklik: yavas verilen dogru cevap kutuyu yukseltmez,
 * cunku parmak sayarak bulunan sonuc ogrenilmis sayilmaz. Bu kural
 * takvim quizinde gecerli degildir; orada hedef bilgidir.
 *
 * Seviye kendini ayarlar: cocuk en bastan baslar, biliyorsa kutular
 * hizla dolar ve gecer. Seviyesini tahmin etmek yerine motor bulur.
 *
 * Saf modul: zaman ve rastgelelik disaridan gelir.
 */

const SIGNS = { '+': '+', '-': '−', 'x': '×', '/': '÷' };

export const LEVELS = [
  { id: 'topla-10', title: "Toplama, 10'a kadar" },
  { id: 'cikar-10', title: "Çıkarma, 10'a kadar" },
  { id: 'topla-20', title: "Toplama, 20'ye kadar" },
  { id: 'cikar-20', title: "Çıkarma, 20'ye kadar" },
  { id: 'carp-2-5', title: 'Çarpma: 2, 3, 4, 5' },
  { id: 'carp-6-10', title: 'Çarpma: 6, 7, 8, 9, 10' },
  { id: 'bol', title: 'Bölme' },
  { id: 'karisik', title: 'Karışık dört işlem' }
];

export function factKey(op, a, b) {
  return `${a}${op}${b}`;
}

export function formatQuestion({ op, a, b }) {
  return `${a} ${SIGNS[op]} ${b}`;
}

function ekle(hedef, op, a, b, answer) {
  hedef[factKey(op, a, b)] = newBox({ op, a, b, answer });
}

function uret(levelId, hedef) {
  if (levelId === 'topla-10' || levelId === 'topla-20') {
    const tavan = levelId === 'topla-10' ? 10 : 20;
    for (let a = 1; a <= tavan - 1; a++) {
      for (let b = 1; a + b <= tavan; b++) ekle(hedef, '+', a, b, a + b);
    }
    return;
  }

  if (levelId === 'cikar-10' || levelId === 'cikar-20') {
    const tavan = levelId === 'cikar-10' ? 10 : 20;
    for (let a = 1; a <= tavan; a++) {
      for (let b = 1; b <= a; b++) ekle(hedef, '-', a, b, a - b);
    }
    return;
  }

  if (levelId === 'carp-2-5' || levelId === 'carp-6-10') {
    const tablolar = levelId === 'carp-2-5' ? [2, 3, 4, 5] : [6, 7, 8, 9, 10];
    for (const a of tablolar) {
      for (let b = 1; b <= 10; b++) ekle(hedef, 'x', a, b, a * b);
    }
    return;
  }

  if (levelId === 'bol') {
    for (let b = 2; b <= 10; b++) {
      for (let q = 1; q <= 10; q++) ekle(hedef, '/', b * q, b, q);
    }
  }
}

export function createDrill(levelId) {
  const hedef = {};

  if (levelId === 'karisik') {
    for (const id of ['topla-20', 'cikar-20', 'carp-6-10', 'bol']) uret(id, hedef);
    return hedef;
  }

  uret(levelId, hedef);
  return hedef;
}

export function recordDrillAnswer(facts, key, { correct, ms, thresholdMs, timestamp = null }) {
  const fact = facts[key];
  if (!fact) return facts;

  let guncel = fact;
  if (!correct) guncel = demote(fact);
  else if (ms <= thresholdMs) guncel = promote(fact);

  const seen = fact.seen + 1;

  return {
    ...facts,
    [key]: {
      ...guncel,
      seen,
      correct: fact.correct + (correct ? 1 : 0),
      wrong: fact.wrong + (correct ? 0 : 1),
      avgMs: Math.round((fact.avgMs * fact.seen + ms) / seen),
      lastSeen: timestamp
    }
  };
}

export function selectDrillFact(facts, rng = Math.random) {
  return selectWeighted(facts, rng);
}

export function isLevelMastered(facts) {
  const keys = Object.keys(facts);
  return keys.length > 0 && keys.every((k) => isMastered(facts[k]));
}

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) ?? null;
}

export function nextLevel(id) {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i === -1 || i === LEVELS.length - 1 ? null : LEVELS[i + 1].id;
}
```

Türkçe karakterleri doğru yaz, UTF-8 kaydet.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/drill.test.js`
Expected: `# pass 19`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/drill.js tests/drill.test.js
git commit -m "feat(engines): dort islem alistirma motoru, kendini ayarlayan seviye"
```

---

## Task 2: math.js emekliye ayrılsın

Artık `drill.js` çarpmayı da kapsıyor. İki motoru birlikte tutmak, ileride hangisinin doğru olduğu sorusunu doğurur.

**Files:**
- Delete: `src/engines/math.js`, `tests/math.test.js`
- Modify: `src/core/state.js`, `src/data/defaults.js`, `tests/state.test.js`

- [ ] **Step 1: Kim import ediyor bul**

```bash
grep -rn "engines/math\|createFactSet\|DEFAULT_MATH_TABLES" src/ tests/
```

Beklenen: `src/core/state.js` (`createFactSet` ve `DEFAULT_MATH_TABLES`), `src/data/defaults.js` (`DEFAULT_MATH_TABLES` tanımı), `tests/state.test.js`.

- [ ] **Step 2: state.js'i drill'e taşı**

`loadFacts`/`saveFacts` yerine seviye bilinçli bir yapı gelir. `src/core/state.js` içinde `createFactSet` importunu kaldır, şunu ekle:

```js
import { createDrill, LEVELS } from '../engines/drill.js';
```

`loadFacts` ve `saveFacts` metotlarını şununla değiştir:

```js
    loadDrill() {
      const kayit = storage.get('drill', null);
      const level = kayit?.level ?? LEVELS[0].id;
      const byLevel = kayit?.byLevel ?? {};
      return {
        level,
        byLevel: { ...byLevel, [level]: byLevel[level] ?? createDrill(level) }
      };
    },

    saveDrill(drill) {
      storage.set('drill', drill);
    },
```

`byLevel` her seviyenin kutularını ayrı tutar; 1E'deki ısı haritası bu geçmişi kullanacak.

`tests/state.test.js` içindeki `matematik olgulari kaydedilip geri okunur` ve `olgu yoksa varsayilan tablolarla uretilir` testlerini şunlarla değiştir:

```js
test('alistirma ilk seviyeyle baslar', () => {
  const { state } = kur();
  const d = state.loadDrill();
  assert.equal(d.level, 'topla-10');
  assert.ok(Object.keys(d.byLevel['topla-10']).length > 0);
});

test('alistirma kaydedilip geri okunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  const k = Object.keys(d.byLevel[d.level])[0];
  d.byLevel[d.level][k] = { ...d.byLevel[d.level][k], box: 4 };
  state.saveDrill(d);
  assert.equal(state.loadDrill().byLevel['topla-10'][k].box, 4);
});

test('seviye atlaninca onceki seviyenin kutulari korunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  d.level = 'cikar-10';
  state.saveDrill(d);
  const yeni = state.loadDrill();
  assert.ok(yeni.byLevel['topla-10'], 'eski seviye silinmis');
  assert.ok(yeni.byLevel['cikar-10'], 'yeni seviye acilmamis');
});
```

`depolama sadece bilinen anahtarlari kullanir` testindeki izinli listede `'facts'` yerine `'drill'` yaz.

- [ ] **Step 3: defaults.js'ten DEFAULT_MATH_TABLES'ı kaldır**

Artık seviyeler `drill.js` içinde tanımlı. `src/data/defaults.js` içindeki `DEFAULT_MATH_TABLES` sabitini sil. Onu import eden kalmamalı.

- [ ] **Step 4: math.js'i sil**

```bash
git rm src/engines/math.js tests/math.test.js
```

- [ ] **Step 5: Testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`
Gerçek sayıyı raporla. Mimari testi de geçmeli: `node --test tests/architecture.test.js`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(engines): math.js emekliye ayrildi, yerini drill.js aldi"
```

---

## Task 3: views/drill.js oturum modeli

Bir oturum 10 sorudur. Karar mantığı `main.js`'te değil burada yaşar.

**Files:**
- Create: `src/views/drill.js`
- Test: `tests/drill-view.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/drill-view.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startSession, answerCurrent, SESSION_LENGTH } from '../src/views/drill.js';
import { createDrill } from '../src/engines/drill.js';

const yeni = () => ({ level: 'topla-10', byLevel: { 'topla-10': createDrill('topla-10') } });

test('oturum sabit sayida soruyla baslar', () => {
  const s = startSession(yeni(), () => 0.5);
  assert.equal(s.remaining, SESSION_LENGTH);
  assert.ok(s.current);
  assert.equal(s.finished, false);
});

test('mevcut soru okunabilir metin ve dogru cevap tasir', () => {
  const s = startSession(yeni(), () => 0.5);
  assert.match(s.current.text, /^\d+ [+−×÷] \d+$/);
  assert.equal(typeof s.current.answer, 'number');
});

test('dogru cevap kalan sayiyi azaltir', () => {
  const s = startSession(yeni(), () => 0.5);
  const s2 = answerCurrent(s, s.current.answer, 1000, () => 0.5);
  assert.equal(s2.remaining, SESSION_LENGTH - 1);
  assert.equal(s2.lastCorrect, true);
});

test('yanlis cevap da kalan sayiyi azaltir ve dogruyu bildirir', () => {
  const s = startSession(yeni(), () => 0.5);
  const s2 = answerCurrent(s, s.current.answer + 1, 1000, () => 0.5);
  assert.equal(s2.remaining, SESSION_LENGTH - 1);
  assert.equal(s2.lastCorrect, false);
  assert.equal(s2.lastAnswer, s.current.answer);
});

test('yanlis cevapta ayni soru hemen tekrar sorulmaz', () => {
  const s = startSession(yeni(), () => 0.5);
  const ilk = s.current.key;
  const s2 = answerCurrent(s, s.current.answer + 1, 1000, () => 0.5);
  assert.notEqual(s2.current?.key, ilk, 'ayni soru tekrar geldi, cevap kopyalanabilir');
});

test('oturum sonunda finished true olur ve soru kalmaz', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) {
    s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  }
  assert.equal(s.finished, true);
  assert.equal(s.remaining, 0);
  assert.equal(s.current, null);
});

test('oturum boyunca dogru sayisi tutulur', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const dogruMu = i % 2 === 0;
    s = answerCurrent(s, dogruMu ? s.current.answer : s.current.answer + 1, 900, () => 0.5);
  }
  assert.equal(s.correctCount, Math.ceil(SESSION_LENGTH / 2));
});

test('cevaplar kutulara islenir', () => {
  const s = startSession(yeni(), () => 0.5);
  const k = s.current.key;
  const s2 = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.equal(s2.drill.byLevel['topla-10'][k].seen, 1);
  assert.equal(s2.drill.byLevel['topla-10'][k].box, 2);
});

test('bitmis oturuma cevap verilemez', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.deepEqual(answerCurrent(s, 1, 900, () => 0.5), s);
});

test('seviye tamamlanirsa bir sonrakine gecilir', () => {
  const drill = yeni();
  const facts = drill.byLevel['topla-10'];
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: 4 };
  let s = startSession(drill, () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.equal(s.drill.level, 'cikar-10');
  assert.equal(s.levelUp, true);
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/drill.js', import.meta.url), 'utf8');
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(y), `drill.js icinde "${y}" olmamali`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/drill-view.test.js`

- [ ] **Step 3: Implementasyonu yaz**

Create `src/views/drill.js`:

```js
import {
  createDrill, selectDrillFact, recordDrillAnswer, formatQuestion,
  isLevelMastered, nextLevel
} from '../engines/drill.js';

/**
 * Alistirma oturumu.
 *
 * Yanlis cevapta ayni soru hemen tekrar sorulmaz: az once ekranda
 * gosterilen dogru cevabi kopyalamak ogrenme degildir. Leitner kutusu
 * 1'e duser ve soru zaten yakinda geri gelir.
 *
 * Bu modul HTML uretmez ve DOM'a dokunmaz.
 */

export const SESSION_LENGTH = 10;
const SPEED_THRESHOLD_MS = 6000;

function soruSec(drill, rng, haric = null) {
  const facts = drill.byLevel[drill.level];
  let key = selectDrillFact(facts, rng);

  if (key === haric) {
    const digerleri = Object.fromEntries(Object.entries(facts).filter(([k]) => k !== haric));
    key = selectDrillFact(digerleri, rng) ?? key;
  }

  if (!key) return null;
  const f = facts[key];
  return { key, text: formatQuestion(f), answer: f.answer };
}

export function startSession(drill, rng = Math.random) {
  return {
    drill,
    current: soruSec(drill, rng),
    remaining: SESSION_LENGTH,
    correctCount: 0,
    lastCorrect: null,
    lastAnswer: null,
    levelUp: false,
    finished: false
  };
}

export function answerCurrent(session, verilen, ms, rng = Math.random) {
  if (session.finished || !session.current) return session;

  const { key, answer } = session.current;
  const dogru = Number(verilen) === answer;

  const facts = recordDrillAnswer(session.drill.byLevel[session.drill.level], key, {
    correct: dogru,
    ms,
    thresholdMs: SPEED_THRESHOLD_MS
  });

  let drill = {
    ...session.drill,
    byLevel: { ...session.drill.byLevel, [session.drill.level]: facts }
  };

  const remaining = session.remaining - 1;
  const finished = remaining === 0;
  let levelUp = false;

  if (finished && isLevelMastered(facts)) {
    const sonraki = nextLevel(drill.level);
    if (sonraki) {
      levelUp = true;
      drill = {
        level: sonraki,
        byLevel: { ...drill.byLevel, [sonraki]: drill.byLevel[sonraki] ?? createDrill(sonraki) }
      };
    }
  }

  return {
    drill,
    current: finished ? null : soruSec(drill, rng, key),
    remaining,
    correctCount: session.correctCount + (dogru ? 1 : 0),
    lastCorrect: dogru,
    lastAnswer: answer,
    levelUp,
    finished
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/drill-view.test.js`
Expected: `# pass 11`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/views/drill.js tests/drill-view.test.js
git commit -m "feat(views): alistirma oturumu, yanlis cevapta ayni soru tekrarlanmaz"
```

---

## Task 4: Matematik ekranı

**Files:**
- Modify: `src/data/defaults.js`, `v2.html`, `styles-v2.css`, `src/main.js`, `tests/defaults.test.js`

- [ ] **Step 1: Kartı measured yap**

`src/data/defaults.js` içinde `ogle-matematik` kartının tipini `'approved'` yerine `'measured'` yap. Artık uygulama cevabı kendisi ölçüyor, beyana dayanmıyor.

`tests/defaults.test.js` içindeki `sadece uygulamanin olctugu kartlar measured olabilir` testinde `olculebilir` kümesine `'ogle-matematik'` ekle.

- [ ] **Step 2: v2.html'e ekran ekle**

`timequiz-modal`'ın altına:

```html
  <div id="drill-modal" class="v2-modal" hidden>
    <div class="v2-modal__box">
      <p id="drill-progress" class="v2-modal__note"></p>
      <p id="drill-question" class="drill__question"></p>
      <p id="drill-input" class="drill__input"></p>
      <div id="drill-pad" class="drill__pad"></div>
      <p id="drill-feedback" class="drill__feedback" hidden></p>
      <button type="button" id="drill-cancel">Kapat</button>
    </div>
  </div>
```

- [ ] **Step 3: styles-v2.css**

`.drill__question` (büyük, ortalanmış, `--font-heading`), `.drill__input` (girilen sayı, büyük, boşken soluk bir çizgi), `.drill__pad` (3 sütunlu grid), `.drill__key` (en az 56px, rakam tuşları), `.drill__feedback`.

**Dikkat:** takvim quizindeki hatayı tekrarlama. Modal kutusu beyaz; `--card-bg` ve `--card-border` orada görünmez kalır. Tuşlar için marka morunu kullan, kenarları belirgin olsun.

- [ ] **Step 4: main.js'i bağla**

Akış:

1. `ogle-matematik` kartına dokunulunca `completeCard` çağrılmaz, `acDrill()` çağrılır. Takvim kartındaki desenin aynısı.
2. `startSession(state.loadDrill())` ile oturum kurulur, modül düzeyinde tutulur.
3. Tuş takımı 0-9, **Sil** ve **Tamam**. Girilen sayı `drill-input` içinde gösterilir.
4. **Tamam**'a basılınca geçen süre ölçülür (`performance.now()` farkı) ve `answerCurrent` çağrılır.
5. Doğruysa kısa olumlu geri bildirim, yanlışsa `Doğrusu: N` gösterilir. Her iki durumda da **sonraki soruya geçilir.**
6. `finished` olunca `state.saveDrill(session.drill)`, `completeCard(profile, dp, 'ogle-matematik', now())`, modal kapanır, `render()`.
7. `levelUp` ise kapanışta bir kutlama satırı göster: yeni seviyenin başlığı.
8. `renderIfStale` içindeki modal kontrolüne `drill-modal` eklenir.

Soru gösterilirken süre başlatılır; yanlış cevaptan sonraki soruda süre sıfırlanır.

- [ ] **Step 5: Testler**

Run: `node --test "tests/**/*.test.js"` — gerçek sayıyı raporla, `# fail 0`.
Run: `node --test tests/architecture.test.js` — 7 geçmeli.

- [ ] **Step 6: Commit**

```bash
git add src/ tests/ v2.html styles-v2.css
git commit -m "feat(app): matematik alistirma ekrani ve tus takimi"
```

---

## Task 5: Tarayıcı doğrulaması

`python -m http.server 8080`, `localStorage.clear()`, bir bakım veren ekle, öğleden sonra bloğunu aç (saat 15:00 sonrası değilse `settings.dayResetHour` ile oynamak yerine sistem saatini beklemek yerine sabah kartlarını tamamlayıp öğleden sonraya geç).

Doğrula, her biri için ekran görüntüsü al:

1. "Matematik seti" kartına dokununca **puan verilmiyor**, alıştırma ekranı açılıyor.
2. Soru okunabilir: `3 + 4` gibi, büyük punto.
3. Tuş takımı rakam giriyor, **Sil** siliyor, **Tamam** gönderiyor.
4. Doğru cevap: sonraki soruya geçiyor, ilerleme `2 / 10` oluyor.
5. **Yanlış cevap:** doğrusu gösteriliyor ve **farklı bir soruya** geçiliyor. Aynı soru hemen tekrar gelmemeli.
6. 10 soru bitince modal kapanıyor, kart tamamlanmış görünüyor, yıldız sayacı artıyor.
7. Sayfayı yenile: kart tamamlanmış kalıyor, `localStorage['ataol2:drill']` içinde kutular değişmiş.
8. Konsolda hata yok.

Neyi doğrulayamadığını açıkça yaz.

---

## Kapsam dışı (1E ve sonrasına)

| İş | Faz |
|---|---|
| Araç temalı sözel problemler | 1E |
| Serbest matematik modu (rutin dışında oynanabilir) | 1E |
| Tema paketi altyapısı | Faz 2 |
| Ebeveyn panelinde ısı haritası (`byLevel` verisi hazır) | 1F |
| Günlük giriş ekranı ve hekim PDF'i | 1F |
| İçerik taşıma, sohbet, v1 devri | 1G |
