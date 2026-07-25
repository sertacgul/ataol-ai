# ATAOL v2 Faz 1E: Araç Temalı Sözel Problemler

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Günlük matematik oturumunun son iki sorusunu, Deha'nın araç merakına yaslanan sözel problemlere çevirmek.

**Architecture:** Problemler ayrı bir sayı havuzu kurmaz; mevcut seviyenin olgularını giydirir. Tema verisi koddan ayrı durur, böylece ilgi değişirse veya App Store sürümünde başka temalar istenirse tek dosyada değişir.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

---

## Dört karar

**1. Problemler aynı olguları giydirir.** Çocuk 10'a kadar toplamadaysa problem de `3+4` olur, `24-8` olmaz. Aksi halde problem hem okuma hem de seviyesinin üstünde aritmetik yükler ve ikisi birden çöker. Sonuç aynı Leitner kutusuna işlenir: **bir olgu, iki sunum.**

**2. Problemde süre ölçülmez.** Aritmetik aynı ama süreye okuma da dahildir. Çıplak `3+4`'te hız otomatikliği ölçer; hikâyede yavaşlık okuma demektir, bilmeme değil. Doğru cevap süreye bakılmaksızın kutuyu yükseltir.

Bu, projedeki üçüncü kip. Özet:

| Kip | Süre önemli mi | Yanlışta ne olur |
|---|---|---|
| `drill` çıplak işlem | Evet, otomatiklik hedefi | Doğrusu gösterilir, farklı soruya geçilir |
| `timequiz` takvim | Hayır, bilgi hedefi | Doğrusu gösterilir, **aynı soru tekrar sorulur** |
| `problems` sözel | Hayır, okuma dahil | Doğrusu gösterilir, farklı soruya geçilir |

**3. Türkçe ekler veri olur, algoritma değil.** `{arac}ta` diye birleştirilemez: tır→tırda, otobüs→otobüste, taksi→takside, vinç→vinçte. Ünlü uyumu ve ünsüz benzeşmesi kodla üretilmeye çalışılırsa bozuk Türkçe çıkar. Çekimli biçimler tema dosyasında elle yazılır.

**4. Her aracın kendi birimi olur.** "Takside 8 palet vardı" saçmadır. Tır kasa taşır, otobüs yolcu taşır. Anlamsız cümle, zaten zorlanan bir çocukta yalnızca kafa karışıklığı üretir.

**Oturum yapısı:** 8 çıplak işlem + 2 problem, problemler hep sonda. Toplam yine 10, gün uzamıyor. Sonda olması bilinçli, öngörülebilirlik için: "toplamalardan sonra hikâyeler gelir."

---

## Task 1: data/themes.js

**Files:**
- Create: `src/data/themes.js`
- Test: `tests/themes.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/themes.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VEHICLE_THEME, themeById, THEMES } from '../src/data/themes.js';

test('arac temasi bulunabilir', () => {
  assert.equal(themeById('araclar').id, 'araclar');
  assert.equal(themeById('yok'), null);
  assert.ok(THEMES.length >= 1);
});

test('her aracin adi ve bulunma hali var', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(n.ad.length > 0, 'ad bos');
    assert.ok(n.bulunma.length > 0, `${n.ad} icin bulunma hali yok`);
  }
});

test('bulunma hali adla baslar', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(n.bulunma.startsWith(n.ad), `${n.ad} -> ${n.bulunma} tutarsiz`);
  }
});

test('her aracin en az bir birimi var', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(Array.isArray(n.birimler) && n.birimler.length > 0, `${n.ad} icin birim yok`);
  }
});

test('yolcu tasiyan araclarda yuk birimi yok', () => {
  const yolcu = VEHICLE_THEME.nesneler.filter((n) => n.birimler.includes('yolcu'));
  assert.ok(yolcu.length > 0, 'hic yolcu tasiyan arac yok');
  for (const n of yolcu) {
    assert.deepEqual(n.birimler, ['yolcu'], `${n.ad} hem yolcu hem yuk tasiyor`);
  }
});

test('yeterince arac cesidi var', () => {
  assert.ok(VEHICLE_THEME.nesneler.length >= 6, 'cok az arac, problemler tekrara duser');
});

test('arac adlari benzersiz', () => {
  const adlar = VEHICLE_THEME.nesneler.map((n) => n.ad);
  assert.equal(adlar.length, new Set(adlar).size);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

- [ ] **Step 3: Implementasyonu yaz**

Create `src/data/themes.js`:

```js
/**
 * Problem temalari. Bu bir VERI dosyasidir.
 *
 * Turkce ekler burada elle yazilir, kodda uretilmez. "tir" -> "tirda",
 * "otobus" -> "otobuste", "vinc" -> "vincte": unlu uyumu ve unsuz
 * benzesmesi algoritmayla dogru uretilemez, denenirse bozuk Turkce cikar.
 *
 * Her aracin kendi birimi vardir. "Takside 8 palet vardi" sacmadir ve
 * zorlanan bir cocukta yalnizca kafa karisikligi uretir.
 */

export const VEHICLE_THEME = {
  id: 'araclar',
  ad: 'Araçlar',
  nesneler: [
    { ad: 'tır', bulunma: 'tırda', birimler: ['kasa', 'palet', 'koli'] },
    { ad: 'kamyon', bulunma: 'kamyonda', birimler: ['kasa', 'çuval', 'koli'] },
    { ad: 'kamyonet', bulunma: 'kamyonette', birimler: ['koli', 'sandık'] },
    { ad: 'vinç', bulunma: 'vinçte', birimler: ['blok', 'boru'] },
    { ad: 'traktör', bulunma: 'traktörde', birimler: ['çuval', 'balya'] },
    { ad: 'otobüs', bulunma: 'otobüste', birimler: ['yolcu'] },
    { ad: 'taksi', bulunma: 'takside', birimler: ['yolcu'] },
    { ad: 'minibüs', bulunma: 'minibüste', birimler: ['yolcu'] }
  ]
};

export const THEMES = [VEHICLE_THEME];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) ?? null;
}
```

Türkçe karakterleri doğru yaz, UTF-8 kaydet. Testler `bulunma` alanının `ad` ile başladığını kontrol ediyor, o yüzden `tır`/`tırda` gibi çiftler tutarlı olmalı.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula** — `# pass 7`

- [ ] **Step 5: Commit**

```bash
git add src/data/themes.js tests/themes.test.js
git commit -m "feat(data): arac temasi, Turkce ekler veri olarak"
```

---

## Task 2: engines/problems.js

**Files:**
- Create: `src/engines/problems.js`
- Test: `tests/problems.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/problems.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProblem, templatesFor, TEMPLATES } from '../src/engines/problems.js';
import { VEHICLE_THEME } from '../src/data/themes.js';

const sabit = (v) => () => v;

test('her islem icin en az bir sablon var', () => {
  for (const op of ['+', '-', 'x', '/']) {
    assert.ok(templatesFor(op).length > 0, `${op} icin sablon yok`);
  }
});

test('sablon idleri benzersiz', () => {
  const ids = TEMPLATES.map((t) => t.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('problem metni ve dogru cevap uretir', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.equal(p.answer, 5);
  assert.ok(p.text.length > 10);
  assert.ok(p.text.endsWith('?'), 'soru isareti yok');
});

test('metinde sayilar gecer', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.ok(p.text.includes('9'), '9 yok');
  assert.ok(p.text.includes('4'), '4 yok');
});

test('metinde doldurulmamis yer tutucu kalmaz', () => {
  for (const op of ['+', '-', 'x', '/']) {
    for (let i = 0; i < 40; i++) {
      const p = buildProblem({ op, a: 12, b: 3, answer: op === '/' ? 4 : 15 }, VEHICLE_THEME, () => i / 40);
      assert.ok(!p.text.includes('{'), `${op}: doldurulmamis yer tutucu -> ${p.text}`);
      assert.ok(!p.text.includes('}'), `${op}: doldurulmamis yer tutucu -> ${p.text}`);
    }
  }
});

test('yolcu tasiyan aracla yuk birimi eslesmez', () => {
  const yasakli = ['kasa', 'palet', 'koli', 'çuval', 'sandık', 'blok', 'boru', 'balya'];
  for (let i = 0; i < 200; i++) {
    const p = buildProblem({ op: '+', a: 3, b: 4, answer: 7 }, VEHICLE_THEME, () => i / 200);
    for (const arac of VEHICLE_THEME.nesneler.filter((n) => n.birimler.includes('yolcu'))) {
      if (p.text.includes(arac.ad)) {
        for (const y of yasakli) {
          assert.ok(!p.text.includes(y), `${arac.ad} ile ${y} eslesti: ${p.text}`);
        }
      }
    }
  }
});

test('ayni rng ayni metni verir', () => {
  const f = { op: '+', a: 2, b: 5, answer: 7 };
  assert.equal(
    buildProblem(f, VEHICLE_THEME, sabit(0.42)).text,
    buildProblem(f, VEHICLE_THEME, sabit(0.42)).text
  );
});

test('farkli rng farkli metin uretebilir', () => {
  const f = { op: '+', a: 2, b: 5, answer: 7 };
  const metinler = new Set();
  for (let i = 0; i < 60; i++) metinler.add(buildProblem(f, VEHICLE_THEME, () => i / 60).text);
  assert.ok(metinler.size > 3, `sadece ${metinler.size} farkli metin cikti`);
});

test('bilinmeyen islem null dondurur', () => {
  assert.equal(buildProblem({ op: '?', a: 1, b: 1, answer: 2 }, VEHICLE_THEME, sabit(0)), null);
});

test('cikarma probleminde buyuk sayi once gecer', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.ok(p.text.indexOf('9') < p.text.indexOf('4'), `siralama ters: ${p.text}`);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

- [ ] **Step 3: Implementasyonu yaz**

Create `src/engines/problems.js`:

```js
/**
 * Sozel problem uretimi.
 *
 * Problemler kendi sayi havuzunu kurmaz; mevcut seviyenin olgularini
 * giydirir. Cocuk 10'a kadar toplamadaysa problem de 3+4 olur. Aksi
 * halde problem hem okuma hem de seviyesinin ustunde aritmetik yukler.
 *
 * Sure olculmez: aritmetik ayni ama sureye okuma da dahildir.
 *
 * Saf modul: rastgelelik disaridan gelir.
 */

export const TEMPLATES = [
  {
    id: 'indirme',
    op: '-',
    yaz: ({ bulunma, birim, a, b }) =>
      `Bir ${bulunma} ${a} ${birim} vardı. ${b} ${birim} indirildi. Kaç ${birim} kaldı?`
  },
  {
    id: 'inme',
    op: '-',
    yaz: ({ bulunma, birim, a, b }) =>
      `${bulunma.charAt(0).toUpperCase() + bulunma.slice(1)} ${a} ${birim} vardı. Durakta ${b} ${birim} indi. Kaç ${birim} kaldı?`
  },
  {
    id: 'yukleme',
    op: '+',
    yaz: ({ bulunma, birim, a, b }) =>
      `Bir ${bulunma} ${a} ${birim} vardı. ${b} ${birim} daha yüklendi. Toplam kaç ${birim} oldu?`
  },
  {
    id: 'binme',
    op: '+',
    yaz: ({ bulunma, birim, a, b }) =>
      `${bulunma.charAt(0).toUpperCase() + bulunma.slice(1)} ${a} ${birim} vardı. Durakta ${b} ${birim} daha bindi. Toplam kaç ${birim} oldu?`
  },
  {
    id: 'filo',
    op: 'x',
    yaz: ({ ad, birim, a, b }) =>
      `${a} ${ad} sıraya dizildi. Her ${ad} ${b} ${birim} taşıyor. Toplam kaç ${birim} taşınıyor?`
  },
  {
    id: 'paylastirma',
    op: '/',
    yaz: ({ ad, birim, a, b }) =>
      `${a} ${birim} ${b} ${ad}a eşit olarak paylaştırıldı. Her ${ad} kaç ${birim} taşıyor?`
  }
];

export function templatesFor(op) {
  return TEMPLATES.filter((t) => t.op === op);
}

function sec(liste, rng) {
  return liste[Math.min(liste.length - 1, Math.floor(rng() * liste.length))];
}

export function buildProblem(fact, theme, rng = Math.random) {
  const sablonlar = templatesFor(fact.op);
  if (sablonlar.length === 0) return null;

  const sablon = sec(sablonlar, rng);
  const nesne = sec(theme.nesneler, rng);
  const birim = sec(nesne.birimler, rng);

  return {
    key: fact.key ?? null,
    op: fact.op,
    answer: fact.answer,
    text: sablon.yaz({ ad: nesne.ad, bulunma: nesne.bulunma, birim, a: fact.a, b: fact.b })
  };
}
```

Not: `paylastirma` şablonundaki `${ad}a` yönelme eki için basitleştirilmiş bir birleştirmedir ve `tır` → `tıra`, `kamyon` → `kamyona` için doğru çalışır ama `otobüs` → `otobüsa` yanlış olur. **Bölme şablonu yalnızca yük taşıyan araçlarla kullanılmalı.** Eğer test bunu yakalarsa, çözüm nesne verisine bir `yonelme` alanı eklemektir, şablonu gevşetmek değil.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula** — `# pass 10`

- [ ] **Step 5: Türkçe kontrolü**

Şu probe'u çalıştır, çıktıyı raporla, sonra sil. Üretilen cümleler gerçekten okunabilir Türkçe mi, gözle kontrol edilmeli:

```js
// probe.tmp.mjs
import { buildProblem } from './src/engines/problems.js';
import { VEHICLE_THEME } from './src/data/themes.js';
const orn = [
  { op: '-', a: 9, b: 4, answer: 5 }, { op: '+', a: 3, b: 5, answer: 8 },
  { op: 'x', a: 4, b: 6, answer: 24 }, { op: '/', a: 24, b: 6, answer: 4 }
];
for (const f of orn) {
  for (let i = 0; i < 4; i++) {
    const p = buildProblem(f, VEHICLE_THEME, () => (i * 0.27 + 0.05) % 1);
    console.log(`${f.op}  ${p.text}   -> ${p.answer}`);
  }
}
```

**Bozuk Türkçe görürsen bildir.** Özellikle bölme şablonundaki yönelme ekine bak.

- [ ] **Step 6: Commit**

```bash
git add src/engines/problems.js tests/problems.test.js
git commit -m "feat(engines): sozel problem uretimi, olgulari giydirir"
```

---

## Task 3: Oturuma yerleştirme

**Files:**
- Modify: `src/views/drill.js`
- Test: `tests/drill-view.test.js`

- [ ] **Step 1: Regresyon testlerini ekle**

`tests/drill-view.test.js` sonuna ekle:

```js
test('oturumun son iki sorusu problemdir', () => {
  let s = startSession(yeni(), () => 0.5);
  const tipler = [];
  for (let i = 0; i < SESSION_LENGTH; i++) {
    tipler.push(s.current.kind);
    s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  }
  assert.deepEqual(tipler.slice(0, 8), Array(8).fill('fact'));
  assert.deepEqual(tipler.slice(8), ['problem', 'problem']);
});

test('problem sorusunun metni bir cumledir', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < 8; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.equal(s.current.kind, 'problem');
  assert.ok(s.current.text.length > 20, `cok kisa: ${s.current.text}`);
  assert.ok(s.current.text.endsWith('?'));
});

test('problemde yavas dogru cevap da kutuyu yukseltir', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < 8; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  const k = s.current.key;
  const oncekiKutu = s.drill.byLevel[s.drill.level][k].box;
  s = answerCurrent(s, s.current.answer, 30000, () => 0.5);
  assert.ok(
    s.drill.byLevel[s.drill.level][k].box > oncekiKutu,
    'problemde sure olculmemeli, yavas dogru cevap da yukseltmeli'
  );
});

test('ciplak islemde yavas dogru cevap kutuyu yukseltmez', () => {
  const s = startSession(yeni(), () => 0.5);
  const k = s.current.key;
  const s2 = answerCurrent(s, s.current.answer, 30000, () => 0.5);
  assert.equal(s2.drill.byLevel[s2.drill.level][k].box, 1);
});
```

- [ ] **Step 2: Testleri çalıştır, KIRILDIĞINI doğrula**

- [ ] **Step 3: drill.js'i güncelle**

`src/views/drill.js` içinde:

1. Import ekle:

```js
import { buildProblem } from '../engines/problems.js';
import { VEHICLE_THEME } from '../data/themes.js';
```

2. Sabit ekle: `const PROBLEM_COUNT = 2;`

3. `soruSec` fonksiyonunu, kaçıncı soruda olunduğunu bilecek şekilde genişlet. Kalan soru sayısı `PROBLEM_COUNT` veya daha azsa problem üret:

```js
function soruSec(drill, rng, kalan, haric = null) {
  const facts = drill.byLevel[drill.level];
  let key = selectDrillFact(facts, rng);

  if (key === haric) {
    const digerleri = Object.fromEntries(Object.entries(facts).filter(([k]) => k !== haric));
    key = selectDrillFact(digerleri, rng) ?? key;
  }

  if (!key) return null;
  const f = { ...facts[key], key };

  if (kalan <= PROBLEM_COUNT) {
    const p = buildProblem(f, VEHICLE_THEME, rng);
    if (p) return { key, kind: 'problem', text: p.text, answer: p.answer };
  }

  return { key, kind: 'fact', text: formatQuestion(f), answer: f.answer };
}
```

4. `startSession` çağrısını `soruSec(drill, rng, SESSION_LENGTH)` olarak güncelle.

5. `answerCurrent` içinde süre eşiği soru tipine göre belirlenir:

```js
  const esik = session.current.kind === 'problem' ? Infinity : SPEED_THRESHOLD_MS;

  const facts = recordDrillAnswer(session.drill.byLevel[session.drill.level], key, {
    correct: dogru,
    ms,
    thresholdMs: esik
  });
```

`Infinity` eşiği, doğru cevabın süreye bakılmaksızın kutuyu yükseltmesini sağlar.

6. Sonraki soru seçilirken kalan sayı geçirilir: `soruSec(drill, rng, remaining, key)`.

- [ ] **Step 4: Testleri çalıştır** — tüm paketi çalıştır, gerçek sayıyı raporla.

- [ ] **Step 5: Commit**

```bash
git add src/views/drill.js tests/drill-view.test.js
git commit -m "feat(views): oturumun son iki sorusu sozel problem"
```

---

## Task 4: Ekran ve doğrulama

**Files:**
- Modify: `src/main.js`, `styles-v2.css`

- [ ] **Step 1: Soru metnini tipe göre biçimlendir**

`src/main.js` içindeki `cizDrill()` fonksiyonunda, `#drill-question` elemanına soru tipine göre sınıf ver:

- `kind === 'fact'` → mevcut `.drill__question` (büyük, ortalanmış rakamlar)
- `kind === 'problem'` → `.drill__question--problem` sınıfı da eklenir

`styles-v2.css`'e ekle:

```css
/* Sozel problem: rakam degil cumle. Daha kucuk punto, sola yasli,
   satir araligi acik. 32px ortalanmis bir cumle okunmaz. */
.drill__question--problem {
  font-size: 18px;
  line-height: 1.5;
  text-align: left;
  font-family: var(--font-body);
  font-weight: 500;
}
```

Bu önemli: `.drill__question` 32 punto ve ortalanmış, rakamlar için doğru ama iki satırlık bir cümle o boyutta okunmaz.

- [ ] **Step 2: Tarayıcıda doğrula**

`python -m http.server 8080`, `localStorage.clear()`, bakım veren ekle, matematik kartına ulaş.

Doğrula, ekran görüntüsü al:

1. İlk 8 soru çıplak işlem, büyük rakamlarla.
2. **9. soru bir cümle.** Okunabilir punto, sola yaslı, taşmıyor.
3. Cümle anlamlı Türkçe. Ekran görüntüsünde cümleyi **birebir aktar** ki bozuk ek varsa görelim.
4. Tuş takımı problemde de çalışıyor.
5. Yanlış cevapta `Doğrusu: N` çıkıyor ve farklı soruya geçiliyor.
6. 10 soru bitince kart tamamlanıyor, yıldız geliyor.
7. Konsolda hata yok.

- [ ] **Step 3: Commit**

```bash
git add src/main.js styles-v2.css
git commit -m "feat(app): sozel problem ekranda cumle olarak gosterilsin"
```

---

## Kapsam dışı

| İş | Faz |
|---|---|
| Serbest mod (rutin dışında oynanabilir bölüm) | 1F |
| Tema seçimi ve yeni temalar (at, uzay, dinozor) | Faz 2 |
| Ebeveyn paneli, ısı haritası, günlük, PDF | 1G |
| İçerik taşıma, sohbet, v1 devri | 1H |
