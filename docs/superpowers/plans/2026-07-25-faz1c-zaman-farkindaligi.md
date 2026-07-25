# ATAOL v2 Faz 1C: Zaman Farkındalığı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Deha'nın gün, hafta, ay ve mevsim kavramlarını yaşayarak öğrenmesi.

**Architecture:** İki parça. Birincisi rutin ekranının tepesinde her gün görünen tarih şeridi, ayrı bir modül bile değil. İkincisi günlük üç soruluk küçük bir kart. Leitner kutu mantığı `math.js`'ten ortak bir modüle çıkarılır, çünkü hem takvim quizi hem de Faz 1D'deki dört işlem aynı mantığı kullanacak.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

---

## Neden quiz değil de maruz kalma

Ay isimlerini bilmeyen bir çocuğa quiz çözdürerek öğretilmez. Otizmde gün ve ay isimlerinin oturmamasının sebebi genelde ezber eksikliği değil, bu kavramların **soyut ve döngüsel** olmasıdır: "Salı" görünmez, tutulmaz, tekrarlanır ama hep aynı değildir.

Asıl öğretici olan şey, Deha'nın zaten her gün açacağı ekranın tepesindeki şerittir. Bir yıl boyunca her gün "Cumartesi · 25 Temmuz · Yaz" görmek, haftada bir çözülen quizden kat kat güçlüdür.

Bu yüzden kart **sınav gibi davranmaz**: yanlış cevapta doğrusu gösterilir ve soru hemen tekrar sorulur. Puan katılım için verilir, doğruluk için değil. Doğruluk yalnızca kaydedilir, böylece hangi kavramın zayıf olduğu ebeveyn panelinde (1E) görünür.

## Neden astronomik mevsim

Mevsim sınırları 21 Mart, 21 Haziran, 23 Eylül, 21 Aralık olarak alınır. Meteorolojik sınırlar (ay başları) kod açısından daha kolay olurdu ama Türkiye'de okulda astronomik sınırlar öğretiliyor. Uygulama öğretmeniyle çelişirse çocuğun kafası karışır; bu bir kazanç değil zarar olur.

---

## Task 1: Leitner mantığını ortak modüle çıkar

Saf yeniden düzenleme. Davranış değişmez, mevcut testlerin tamamı değişmeden geçmeye devam eder.

**Files:**
- Create: `src/engines/leitner.js`
- Modify: `src/engines/math.js`
- Test: `tests/leitner.test.js`

- [ ] **Step 1: Yeni modülün testini yaz**

Create `tests/leitner.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newBox, promote, demote, selectWeighted, isMastered, MAX_BOX, MASTERY_BOX } from '../src/engines/leitner.js';

test('yeni kutu 1den baslar', () => {
  assert.equal(newBox().box, 1);
  assert.equal(newBox().seen, 0);
});

test('promote kutuyu bir artirir', () => {
  assert.equal(promote({ box: 2 }).box, 3);
});

test('promote MAX_BOX degerini asmaz', () => {
  assert.equal(promote({ box: MAX_BOX }).box, MAX_BOX);
});

test('demote kutuyu 1e dusurur', () => {
  assert.equal(demote({ box: 5 }).box, 1);
});

test('selectWeighted dusuk kutuyu daha sik secer', () => {
  const kayitlar = { a: { box: 1 }, b: { box: 5 }, c: { box: 5 } };
  let a = 0;
  for (let i = 0; i < 1000; i++) {
    if (selectWeighted(kayitlar, () => (i + 0.5) / 1000) === 'a') a++;
  }
  assert.ok(a > 600, `zayif kayit 1000 secimde ${a} kez cikti`);
});

test('selectWeighted her zaman gecerli anahtar dondurur', () => {
  const kayitlar = { a: { box: 1 }, b: { box: 3 } };
  for (let i = 0; i < 50; i++) {
    assert.ok(kayitlar[selectWeighted(kayitlar, () => i / 50)]);
  }
});

test('bos kumede selectWeighted null dondurur', () => {
  assert.equal(selectWeighted({}, () => 0.5), null);
});

test('isMastered MASTERY_BOX esigini kullanir', () => {
  assert.equal(isMastered({ box: MASTERY_BOX }), true);
  assert.equal(isMastered({ box: MASTERY_BOX - 1 }), false);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/leitner.test.js`
Expected: FAIL, `Cannot find module '../src/engines/leitner.js'`

- [ ] **Step 3: leitner.js yaz**

Create `src/engines/leitner.js`:

```js
/**
 * Alana bagimsiz Leitner kutu mantigi.
 *
 * Hem carpim tablosu hem takvim sorulari hem de Faz 1D'deki dort islem
 * ayni kutu mantigini kullanir. Ayni mantigi uc kez kopyalamamak icin
 * burada tek yerde durur.
 *
 * Bu modul saf: zaman ve rastgelelik disaridan gelir.
 */

export const MAX_BOX = 5;
export const MASTERY_BOX = 4;

const BOX_WEIGHTS = { 1: 16, 2: 8, 3: 4, 4: 2, 5: 1 };

export function newBox(extra = {}) {
  return { box: 1, seen: 0, correct: 0, wrong: 0, avgMs: 0, lastSeen: null, ...extra };
}

export function promote(kayit) {
  return { ...kayit, box: Math.min(MAX_BOX, kayit.box + 1) };
}

export function demote(kayit) {
  return { ...kayit, box: 1 };
}

export function isMastered(kayit) {
  return kayit.box >= MASTERY_BOX;
}

export function selectWeighted(kayitlar, rng = Math.random) {
  const keys = Object.keys(kayitlar);
  if (keys.length === 0) return null;

  const weights = keys.map((k) => BOX_WEIGHTS[kayitlar[k].box] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);

  let ticket = rng() * total;
  for (let i = 0; i < keys.length; i++) {
    ticket -= weights[i];
    if (ticket < 0) return keys[i];
  }
  return keys[keys.length - 1];
}
```

- [ ] **Step 4: math.js'i bu modülü kullanacak şekilde yeniden yaz**

`src/engines/math.js` içindeki `MAX_BOX`, `MASTERY_BOX`, `BOX_WEIGHTS` tanımlarını sil ve leitner'dan al. Dosyanın başına:

```js
import { newBox, promote, demote, selectWeighted, isMastered, MAX_BOX, MASTERY_BOX } from './leitner.js';

export { MAX_BOX, MASTERY_BOX };
```

`createFactSet` içindeki nesne kurulumunu `newBox({ table: t })` ile değiştir.

`recordAnswer` içindeki kutu hesabını şununla değiştir:

```js
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
```

`selectFact`'i `selectWeighted`'a delege et:

```js
export function selectFact(facts, rng = Math.random) {
  return selectWeighted(facts, rng);
}
```

`isTableMastered` içindeki `facts[k].box >= MASTERY_BOX` kontrolünü `isMastered(facts[k])` ile değiştir.

**Kritik:** `tests/math.test.js` dosyasına dokunma. Bu saf bir yeniden düzenleme, 12 matematik testinin hepsi değişmeden geçmeli. Geçmiyorsa davranışı değiştirmişsindir, testi değil kodu düzelt.

- [ ] **Step 5: Testleri çalıştır**

Run: `node --test tests/leitner.test.js tests/math.test.js`
Expected: leitner 8, math 12, hepsi geçer.

Sonra tüm paket: `node --test "tests/**/*.test.js"` — gerçek sayıyı raporla.

- [ ] **Step 6: Commit**

```bash
git add src/engines/leitner.js src/engines/math.js tests/leitner.test.js
git commit -m "refactor(engines): Leitner kutu mantigi ortak module cikarildi"
```

---

## Task 2: engines/calendar.js

**Files:**
- Create: `src/engines/calendar.js`
- Test: `tests/calendar.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/calendar.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayName, monthName, season, dayIndex, nextDay, describeDate, DAYS, MONTHS, SEASONS } from '../src/engines/calendar.js';

test('gun isimleri pazartesi ile baslar', () => {
  assert.equal(DAYS[0], 'Pazartesi');
  assert.equal(DAYS[6], 'Pazar');
  assert.equal(DAYS.length, 7);
});

test('ay isimleri tam ve sirali', () => {
  assert.equal(MONTHS[0], 'Ocak');
  assert.equal(MONTHS[11], 'Aralık');
  assert.equal(MONTHS.length, 12);
});

test('dayName dogru gunu verir', () => {
  assert.equal(dayName(new Date('2026-07-25T12:00:00')), 'Cumartesi');
  assert.equal(dayName(new Date('2026-07-27T12:00:00')), 'Pazartesi');
});

test('dayIndex pazartesi 0 pazar 6', () => {
  assert.equal(dayIndex(new Date('2026-07-27T12:00:00')), 0);
  assert.equal(dayIndex(new Date('2026-07-26T12:00:00')), 6);
});

test('monthName dogru ayi verir', () => {
  assert.equal(monthName(new Date('2026-01-15T12:00:00')), 'Ocak');
  assert.equal(monthName(new Date('2026-12-15T12:00:00')), 'Aralık');
});

test('nextDay hafta sonunu dogru dolanir', () => {
  assert.equal(nextDay('Pazar'), 'Pazartesi');
  assert.equal(nextDay('Cuma'), 'Cumartesi');
});

test('mevsim sinirlari astronomik', () => {
  assert.equal(season(new Date('2026-03-20T12:00:00')), 'Kış');
  assert.equal(season(new Date('2026-03-21T12:00:00')), 'İlkbahar');
  assert.equal(season(new Date('2026-06-20T12:00:00')), 'İlkbahar');
  assert.equal(season(new Date('2026-06-21T12:00:00')), 'Yaz');
  assert.equal(season(new Date('2026-09-22T12:00:00')), 'Yaz');
  assert.equal(season(new Date('2026-09-23T12:00:00')), 'Sonbahar');
  assert.equal(season(new Date('2026-12-20T12:00:00')), 'Sonbahar');
  assert.equal(season(new Date('2026-12-21T12:00:00')), 'Kış');
});

test('ocak ayi kis sayilir', () => {
  assert.equal(season(new Date('2026-01-10T12:00:00')), 'Kış');
});

test('describeDate tum alanlari verir', () => {
  const d = describeDate(new Date('2026-07-25T12:00:00'));
  assert.equal(d.dayName, 'Cumartesi');
  assert.equal(d.dayOfMonth, 25);
  assert.equal(d.monthName, 'Temmuz');
  assert.equal(d.season, 'Yaz');
  assert.equal(d.year, 2026);
  assert.equal(d.dayIndex, 5);
});

test('SEASONS dort mevsim icerir', () => {
  assert.deepEqual([...SEASONS].sort(), ['İlkbahar', 'Kış', 'Sonbahar', 'Yaz'].sort());
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/calendar.test.js`
Expected: FAIL, `Cannot find module '../src/engines/calendar.js'`

- [ ] **Step 3: Implementasyonu yaz**

Create `src/engines/calendar.js`:

```js
/**
 * Takvim kavramlari: gun, ay, mevsim.
 *
 * Mevsim sinirlari astronomiktir (21 Mart, 21 Haziran, 23 Eylul,
 * 21 Aralik), meteorolojik degil. Sebep: Turkiye'de okulda boyle
 * ogretiliyor ve uygulama ogretmenle celismemeli.
 *
 * Saf modul: zaman disaridan gelir.
 */

export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const SEASONS = ['Kış', 'İlkbahar', 'Yaz', 'Sonbahar'];

const SEASON_STARTS = [
  { month: 12, day: 21, name: 'Kış' },
  { month: 9, day: 23, name: 'Sonbahar' },
  { month: 6, day: 21, name: 'Yaz' },
  { month: 3, day: 21, name: 'İlkbahar' }
];

export function dayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function dayName(date) {
  return DAYS[dayIndex(date)];
}

export function monthName(date) {
  return MONTHS[date.getMonth()];
}

export function nextDay(ad) {
  const i = DAYS.indexOf(ad);
  return i === -1 ? null : DAYS[(i + 1) % 7];
}

export function season(date) {
  const m = date.getMonth() + 1;
  const g = date.getDate();

  for (const s of SEASON_STARTS) {
    if (m > s.month || (m === s.month && g >= s.day)) return s.name;
  }
  return 'Kış';
}

export function describeDate(date) {
  return {
    dayName: dayName(date),
    dayIndex: dayIndex(date),
    dayOfMonth: date.getDate(),
    monthName: monthName(date),
    monthIndex: date.getMonth(),
    season: season(date),
    year: date.getFullYear()
  };
}
```

Türkçe karakterleri doğru yaz ve UTF-8 kaydet. Testler `Salı`, `Çarşamba`, `Şubat`, `Ağustos`, `Kış`, `İlkbahar` üzerinden karşılaştırıyor; mojibake başarısızlıktır.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/calendar.test.js`
Expected: `# pass 11`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/calendar.js tests/calendar.test.js
git commit -m "feat(engines): takvim kavramlari, astronomik mevsim sinirlari"
```

---

## Task 3: Takvim quiz motoru

Sorular Leitner kutularında tutulur ki zayıf kavramlar daha sık çıksın.

**Files:**
- Create: `src/engines/timequiz.js`
- Test: `tests/timequiz.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/timequiz.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTimeFacts, buildQuestion, recordTimeAnswer, QUESTION_KINDS } from '../src/engines/timequiz.js';

const gun = new Date('2026-07-25T12:00:00'); // Cumartesi, 25 Temmuz, Yaz

test('createTimeFacts her soru turu icin kayit acar', () => {
  const f = createTimeFacts();
  assert.equal(Object.keys(f).length, QUESTION_KINDS.length);
  for (const k of QUESTION_KINDS) assert.equal(f[k].box, 1);
});

test('bugun sorusu dogru cevabi tasir', () => {
  const s = buildQuestion('bugun-gun', gun);
  assert.equal(s.answer, 'Cumartesi');
  assert.ok(s.prompt.length > 0);
});

test('yarin sorusu bir sonraki gunu ister', () => {
  assert.equal(buildQuestion('yarin-gun', gun).answer, 'Pazar');
});

test('ay sorusu dogru ayi ister', () => {
  assert.equal(buildQuestion('ay', gun).answer, 'Temmuz');
});

test('mevsim sorusu dogru mevsimi ister', () => {
  assert.equal(buildQuestion('mevsim', gun).answer, 'Yaz');
});

test('her sorunun secenekleri dogru cevabi icerir', () => {
  for (const kind of QUESTION_KINDS) {
    const s = buildQuestion(kind, gun);
    assert.ok(s.options.includes(s.answer), `${kind}: dogru cevap seceneklerde yok`);
  }
});

test('secenekler tekrarsiz ve en az uc tane', () => {
  for (const kind of QUESTION_KINDS) {
    const s = buildQuestion(kind, gun);
    assert.ok(s.options.length >= 3, `${kind}: az secenek`);
    assert.equal(s.options.length, new Set(s.options).size, `${kind}: tekrarli secenek`);
  }
});

test('bilinmeyen soru turu null dondurur', () => {
  assert.equal(buildQuestion('yok', gun), null);
});

test('dogru cevap kutuyu yukseltir', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true);
  assert.equal(f.ay.box, 2);
  assert.equal(f.ay.correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true);
  f = recordTimeAnswer(f, 'ay', true);
  f = recordTimeAnswer(f, 'ay', false);
  assert.equal(f.ay.box, 1);
  assert.equal(f.ay.wrong, 1);
});

test('takvim sorusunda hiz onemsizdir', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true, 60000);
  assert.equal(f.ay.box, 2, 'yavas dogru cevap da yukseltmeli');
});

test('recordTimeAnswer bilinmeyen anahtari yok sayar', () => {
  const f = createTimeFacts();
  assert.deepEqual(recordTimeAnswer(f, 'yok', true), f);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/timequiz.test.js`
Expected: FAIL

- [ ] **Step 3: Implementasyonu yaz**

Create `src/engines/timequiz.js`:

```js
import { DAYS, MONTHS, SEASONS, dayName, monthName, season, nextDay } from './calendar.js';
import { newBox, promote, demote } from './leitner.js';

/**
 * Takvim sorulari.
 *
 * Onemli fark: matematik motorunda yavas verilen dogru cevap kutuyu
 * yukseltmez, cunku orada hedef otomatikliktir. Burada hedef bilgidir;
 * cocuk dusunup dogru bulduysa ogrenmistir. Bu yuzden sure olculmez.
 *
 * Kart sinav degil maruz kalma araci: yanlis cevapta dogrusu gosterilip
 * soru tekrar sorulur. Bu davranis arayuz tarafinda uygulanir.
 */

export const QUESTION_KINDS = ['bugun-gun', 'yarin-gun', 'ay', 'mevsim'];

const PROMPTS = {
  'bugun-gun': 'Bugün ne günü?',
  'yarin-gun': 'Yarın ne günü?',
  'ay': 'Hangi aydayız?',
  'mevsim': 'Hangi mevsimdeyiz?'
};

export function createTimeFacts() {
  return Object.fromEntries(QUESTION_KINDS.map((k) => [k, newBox({ kind: k })]));
}

function secenekler(dogru, havuz, adet) {
  const digerleri = havuz.filter((x) => x !== dogru);
  const secilen = [dogru];
  const adim = Math.max(1, Math.floor(digerleri.length / (adet - 1)));

  for (let i = 0; secilen.length < adet && i < digerleri.length; i += adim) {
    secilen.push(digerleri[i]);
  }

  return secilen;
}

export function buildQuestion(kind, date) {
  if (!QUESTION_KINDS.includes(kind)) return null;

  let answer;
  let havuz;

  if (kind === 'bugun-gun') {
    answer = dayName(date);
    havuz = DAYS;
  } else if (kind === 'yarin-gun') {
    answer = nextDay(dayName(date));
    havuz = DAYS;
  } else if (kind === 'ay') {
    answer = monthName(date);
    havuz = MONTHS;
  } else {
    answer = season(date);
    havuz = SEASONS;
  }

  return {
    kind,
    prompt: PROMPTS[kind],
    answer,
    options: secenekler(answer, havuz, Math.min(4, havuz.length))
  };
}

export function recordTimeAnswer(facts, kind, correct, ms = null) {
  const kayit = facts[kind];
  if (!kayit) return facts;

  const guncel = correct ? promote(kayit) : demote(kayit);

  return {
    ...facts,
    [kind]: {
      ...guncel,
      seen: kayit.seen + 1,
      correct: kayit.correct + (correct ? 1 : 0),
      wrong: kayit.wrong + (correct ? 0 : 1),
      lastSeen: ms
    }
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/timequiz.test.js`
Expected: `# pass 12`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/engines/timequiz.js tests/timequiz.test.js
git commit -m "feat(engines): takvim quiz motoru, hiz olculmez"
```

---

## Task 4: Tarih şeridi ve quiz kartı

**Files:**
- Modify: `src/views/routine.js`, `src/core/state.js`, `src/data/defaults.js`, `src/main.js`, `v2.html`, `styles-v2.css`
- Test: `tests/routine-view.test.js`, `tests/state.test.js`, `tests/defaults.test.js`

- [ ] **Step 1: Görünüm modeline tarih ekle**

`tests/routine-view.test.js` sonuna ekle:

```js
test('gorunum modeli bugunun tarihini tasir', () => {
  const vm = routineViewModel(profile, emptyDayProgress(), new Date('2026-07-25T07:00:00'));
  assert.equal(vm.today.dayName, 'Cumartesi');
  assert.equal(vm.today.monthName, 'Temmuz');
  assert.equal(vm.today.season, 'Yaz');
  assert.equal(vm.today.dayOfMonth, 25);
});
```

`src/views/routine.js` içinde `describeDate`'i import et ve döndürülen nesneye `today: describeDate(date)` ekle.

- [ ] **Step 2: Takvim olgularını depolamaya bağla**

`tests/state.test.js` sonuna ekle:

```js
test('takvim olgulari kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(Object.keys(state.loadTimeFacts()).length, 4);
  state.saveTimeFacts({ ay: { kind: 'ay', box: 3, seen: 1, correct: 1, wrong: 0, avgMs: 0, lastSeen: null } });
  assert.equal(state.loadTimeFacts().ay.box, 3);
});
```

`src/core/state.js` içine `createTimeFacts` importunu ekle ve iki metot ekle:

```js
    loadTimeFacts() {
      return storage.get('timefacts', null) ?? createTimeFacts();
    },

    saveTimeFacts(facts) {
      storage.set('timefacts', facts);
    },
```

`depolama sadece bilinen anahtarlari kullanir` testindeki izinli anahtar listesine `'timefacts'` ekle.

- [ ] **Step 3: Rutin kartını ekle**

`src/data/defaults.js` içinde sabah bloğuna yeni bir kart ekle. Sabah bloğunun **ilk kartı** olsun, çünkü günün ilk teması tarih olmalı:

```js
  { id: 'sabah-takvim', block: 'morning', type: 'measured', title: 'Bugün ne günü?', icon: 'calendar_month', stars: 2, minutes: 4 },
```

`DEFAULT_ROUTINE.morning` dizisinin başına `'sabah-takvim'` ekle.

**Dikkat:** `tests/defaults.test.js` içinde `1B de hicbir kart dogrulamasiz odeme yapmaz` testi tüm kartların `approved` olmasını şart koşuyor. Bu kart bilinçli olarak `measured`, çünkü **uygulama cevabı kendisi ölçüyor**, beyana dayanmıyor. Testi şu şekilde güncelle:

```js
test('sadece uygulamanin olctugu kartlar measured olabilir', () => {
  const olculebilir = new Set(['sabah-takvim']);
  for (const c of DEFAULT_CARDS) {
    if (olculebilir.has(c.id)) {
      assert.equal(c.type, 'measured', `${c.id} measured olmali`);
    } else {
      assert.equal(c.type, 'approved', `${c.id} onaya bagli olmali (1D'ye kadar)`);
    }
  }
});
```

Ayrıca `mukemmel gun dakika tavanina ulasir` testi hâlâ geçmeli; yeni kart toplam dakikayı 64'e çıkarır, tavan 60 olduğu için test geçer.

- [ ] **Step 4: v2.html'e quiz kutusu ekle**

`guardian-modal`'ın altına ekle:

```html
  <div id="timequiz-modal" class="v2-modal" hidden>
    <div class="v2-modal__box">
      <p id="timequiz-progress" class="v2-modal__note"></p>
      <p id="timequiz-prompt" class="timequiz__prompt"></p>
      <div id="timequiz-options" class="timequiz__options"></div>
      <p id="timequiz-feedback" class="timequiz__feedback" hidden></p>
      <button type="button" id="timequiz-cancel">Kapat</button>
    </div>
  </div>
```

- [ ] **Step 5: main.js'i bağla**

Şu akışı kur:

1. Kartın tipi `measured` olduğu için `completeCard` doğrudan puan verir. Bunu istemiyoruz: kart tıklandığında **önce quiz açılsın**, quiz bitince kart tamamlansın. Tıklama delegasyonunda kart id'si `sabah-takvim` ise `completeCard` çağırma, `openTimeQuiz()` çağır.
2. Quiz üç soru sorar. Sorular `selectWeighted` ile seçilir, aynı tür arka arkaya gelmez.
3. Doğru cevapta kısa bir olumlu geri bildirim, sonraki soru.
4. **Yanlış cevapta doğru cevap gösterilir ve aynı soru tekrar sorulur.** Puan kaybı yok, ilerleme durmaz.
5. Üç soru bitince `recordTimeAnswer` sonuçları kaydedilir, `completeCard` ile kart tamamlanır, kutu kapanır, ekran yenilenir.

`renderIfStale` içindeki modal kontrolüne `timequiz-modal`'ı da ekle.

Tarih şeridini `renderRoutine` içindeki başlığa ekle:

```js
el('p', { className: 'routine-header__date', text: `${vm.today.dayName} · ${vm.today.dayOfMonth} ${vm.today.monthName} · ${vm.today.season}` }),
```

- [ ] **Step 6: styles-v2.css**

`.routine-header__date`, `.timequiz__prompt`, `.timequiz__options`, `.timequiz__options button`, `.timequiz__feedback` sınıflarını tanımla. Mevcut değişkenleri kullan. Seçenek düğmeleri en az 44px yüksek ve parmakla rahat basılabilir olsun; dört seçenek alt alta dursun.

- [ ] **Step 7: Testler**

Run: `node --test "tests/**/*.test.js"`
Gerçek sayıyı raporla, `# fail 0` olmalı.

- [ ] **Step 8: Commit**

```bash
git add src/ tests/ v2.html styles-v2.css
git commit -m "feat(app): tarih seridi ve gunluk takvim quizi"
```

---

## Task 5: Tarayıcı doğrulaması

- [ ] **Step 1: Sunucu ve temiz durum**

```bash
cd ~/ataol-ai && python -m http.server 8080
```

`localStorage.clear()`, yenile, bir bakım veren ekle.

- [ ] **Step 2: Doğrula ve ekran görüntüsü al**

1. Rutin ekranının tepesinde bugünün tarihi görünüyor: gün adı, gün, ay, mevsim.
2. Sabah bloğunun **ilk kartı** "Bugün ne günü?" ve açık durumda.
3. Karta dokununca quiz açılıyor, soru ve dört seçenek görünüyor.
4. **Yanlış cevap ver:** doğru cevap gösteriliyor ve aynı soru tekrar soruluyor. Puan kaybı yok.
5. Doğru cevap ver: sonraki soruya geçiyor.
6. Üç soru bitince kutu kapanıyor, kart tamamlanmış görünüyor, yıldız sayacı artıyor.
7. Sayfayı yenile: kart tamamlanmış kalıyor, aynı gün tekrar sorulmuyor.
8. Konsolda hata yok.

- [ ] **Step 3: Rapor et**

Neyi doğrulayamadığını açıkça yaz.

---

## Kapsam dışı (1D ve sonrasına)

| İş | Faz |
|---|---|
| Toplama, çıkarma, bölme | 1D |
| Araç temalı problem şablonları | 1D |
| Serbest matematik modu | 1D |
| Tema paketi altyapısı (at, dinozor, uzay) | Faz 2 |
| Hangi gün/ay zayıf, ebeveyn panelinde ısı haritası | 1E |
| Yıl, saat okuma, dün kavramı | Sonra. Önce bunlar otursun |
