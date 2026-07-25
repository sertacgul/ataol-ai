# ATAOL v2 Faz 1B.1: İnceleme Düzeltmeleri

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Faz 1B incelemesinde bulunan iki blocker ile üç önemli kusuru gidermek.

**Architecture:** İki fikir yönlendiriyor. Birincisi, `main.js` içindeki karar mantığı saf modüllere çekiliyor; incelemenin de işaret ettiği gibi iki blocker da orada yaşıyordu ve test edilemez oldukları için görünmezlerdi. İkincisi, güvenlik iddiaları teste bağlanıyor: `el()` artık öznitelikleri denetliyor ve tek bir dizin taraması tüm `src/` ağacını koruyor.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

**Referans:** Faz 1B planı ve son inceleme.

---

## Neden bu beş şey

| # | Kusur | Neden şimdi |
|---|---|---|
| 1 | Matematik ve kitap kartı tek dokunuşla ödüyor | Uygulama matematiği atlamayı ödüllendiriyor. Ürünün asıl amacına aykırı |
| 2 | Zaman geçince ekran yenilenmiyor | Blok açılsa bile kart kilitli görünüyor. Çocuğun günün çoğunu geçirdiği durum |
| 3 | Bozuk kayıt uygulamayı kalıcı kilitliyor | Beyaz ekran, kurtarma yolu yok. 1C veri şeklini değiştirince kesinleşir |
| 4 | `el()` öznitelikleri filtresiz geçiriyor | Dosya "enjeksiyon imkânsız" diyor ama değil. Faz 2 ve 1D bu yoldan geçecek |
| 5 | Koruma testleri 4 dosyayı elle sayıyor | `main.js` ve `dom.js` hiç taranmıyor. README yanlış şey iddia ediyor |

---

## Task 1: Matematik ve kitap kartları onaya bağlansın

Ürün kararı: 1C'de gerçek matematik akışı gelene kadar bu iki kart ebeveyn onayına tabi. Böylece Deha rutini bozulmadan kullanmaya başlar, ama "yaptım" demesi tek başına yetmez.

**Files:**
- Modify: `src/data/defaults.js`
- Test: `tests/defaults.test.js`

- [ ] **Step 1: Regresyon testini ekle**

`tests/defaults.test.js` sonuna ekle:

```js
test('1B de hicbir kart dogrulamasiz odeme yapmaz', () => {
  // measured ve inapp kartlar tamamlaninca dogrudan puan verir.
  // Bu tiplerin gercek akislari 1C'de gelecek; o zamana kadar tohum
  // veride kullanilmazlar, yoksa cocuk tek dokunusla puan alir.
  for (const c of DEFAULT_CARDS) {
    assert.equal(c.type, 'approved', `${c.id} onaya bagli olmali (1C'ye kadar)`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/defaults.test.js`
Expected: FAIL. `ogle-matematik` `measured`, `aksam-kitap` `inapp` olduğu için kırılır.

- [ ] **Step 3: Düzelt**

`src/data/defaults.js` içinde iki kartın `type` alanını değiştir:

- `ogle-matematik`: `type: 'measured'` yerine `type: 'approved'`
- `aksam-kitap`: `type: 'inapp'` yerine `type: 'approved'`

Başka hiçbir alanı değiştirme; yıldız ve dakika değerleri aynı kalır.

Ayrıca `DEFAULT_CARDS` dizisinin üstündeki yorum bloğunun sonuna şunu ekle:

```
 * 1B'de tum kartlar 'approved'. measured (uygulama olcer) ve inapp
 * (uygulama icinde tamamlanir) tipleri motorda hazir ama akislari
 * 1C'de gelecek. O zamana kadar kullanilirlarsa tek dokunusla puan
 * odenir, cunku dogrulanacak bir aktivite yok.
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/defaults.test.js`
Expected: `# pass 11`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/data/defaults.js tests/defaults.test.js
git commit -m "fix(data): matematik ve kitap kartlari onaya baglandi"
```

---

## Task 2: Zaman geçince ekran yenilensin

Karar mantığı `main.js`'ten çıkarılıp saf bir modüle alınır ki test edilebilsin. `main.js` yalnızca karşılaştırma yapar.

**Files:**
- Create: `src/views/clock.js`
- Modify: `src/main.js`
- Test: `tests/clock.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/clock.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSignature } from '../src/views/clock.js';
import { seedProfile } from '../src/data/defaults.js';

const p = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });

test('ayni dakika icinde imza degismez', () => {
  const a = renderSignature(p, new Date('2026-07-24T07:00:00'));
  const b = renderSignature(p, new Date('2026-07-24T07:00:30'));
  assert.equal(a, b);
});

test('blok acilinca imza degisir', () => {
  const once = renderSignature(p, new Date('2026-07-24T14:59:00'));
  const sonra = renderSignature(p, new Date('2026-07-24T15:01:00'));
  assert.notEqual(once, sonra);
});

test('gun donunce imza degisir', () => {
  const once = renderSignature(p, new Date('2026-07-25T03:59:00'));
  const sonra = renderSignature(p, new Date('2026-07-25T04:01:00'));
  assert.notEqual(once, sonra);
});

test('ayni blok icinde saat ilerlese de imza degismez', () => {
  const a = renderSignature(p, new Date('2026-07-24T15:30:00'));
  const b = renderSignature(p, new Date('2026-07-24T18:00:00'));
  assert.equal(a, b);
});

test('imza gun anahtarini ve acik bloklari icerir', () => {
  const s = renderSignature(p, new Date('2026-07-24T20:00:00'));
  assert.ok(s.includes('2026-07-24'));
  assert.ok(s.includes('evening'));
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/clock.test.js`
Expected: FAIL, `Cannot find module '../src/views/clock.js'`

- [ ] **Step 3: clock.js yaz**

Create `src/views/clock.js`:

```js
import { dayKey, availableBlocks } from '../engines/routine.js';

/**
 * Ekranin yeniden cizilmesi gerekip gerekmedigini belirleyen saf imza.
 *
 * main.js bunu belirli araliklarla hesaplar ve degistiyse yeniden cizer.
 * Boylece blok acildiginda veya gun dondugunde ekran kendini gunceller;
 * degismediginde bosuna DOM uretilmez.
 */

export function renderSignature(profile, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const gun = dayKey(date, resetHour);
  const acik = availableBlocks(date, profile.schedule, resetHour);
  return `${gun}|${acik.join(',')}`;
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/clock.test.js`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: main.js'i bağla**

`src/main.js` içinde:

1. Import satırlarına ekle: `import { renderSignature } from './views/clock.js';`

2. `let pendingCardId = null;` satırının altına ekle:

```js
let lastSignature = null;
```

3. `render()` fonksiyonunu şununla değiştir:

```js
function render() {
  lastSignature = renderSignature(profile, now());
  renderRoutine();
  renderParent();
}

function renderIfStale() {
  if (document.getElementById('pin-modal').hidden === false) return;
  if (renderSignature(profile, now()) !== lastSignature) render();
}
```

4. Dosyanın en sonundaki `render();` çağrısının hemen üstüne ekle:

```js
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderIfStale();
});
window.addEventListener('pageshow', renderIfStale);
setInterval(renderIfStale, 30000);
```

PIN kutusu açıkken yeniden çizim yapılmaz, yoksa ebeveyn PIN girerken kutu kapanır.

- [ ] **Step 6: Commit**

```bash
git add src/views/clock.js src/main.js tests/clock.test.js
git commit -m "fix(app): blok acilinca ve gun donunce ekran kendini yeniler"
```

---

## Task 3: Bozuk kayıt uygulamayı kilitlemesin

**Files:**
- Modify: `src/engines/routine.js`, `src/core/state.js`, `src/core/profile.js`, `src/main.js`, `styles-v2.css`
- Test: `tests/routine.test.js`, `tests/state.test.js`

- [ ] **Step 1: Regresyon testlerini ekle**

`tests/routine.test.js` sonuna ekle. Import satırına `normalizeDayProgress` ekle.

```js
test('eksik alanli gun ilerlemesi tamamlanir', () => {
  const dp = normalizeDayProgress({});
  assert.deepEqual(dp.cards, {});
  assert.deepEqual(dp.approvals, []);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('normalizeDayProgress gecerli veriyi korur', () => {
  const dp = normalizeDayProgress({ cards: { a: { state: 'done' } }, approvals: [{ guardianId: 'g' }], stars: 5, minutes: 3 });
  assert.equal(dp.stars, 5);
  assert.equal(dp.cards.a.state, 'done');
  assert.equal(dp.approvals.length, 1);
});

test('normalizeDayProgress yanlis tipleri varsayilana cevirir', () => {
  const dp = normalizeDayProgress({ cards: 'bozuk', approvals: 42, stars: 'x', minutes: null });
  assert.deepEqual(dp.cards, {});
  assert.deepEqual(dp.approvals, []);
  assert.equal(dp.stars, 0);
  assert.equal(dp.minutes, 0);
});

test('normalizeDayProgress null ve undefined kabul eder', () => {
  assert.deepEqual(normalizeDayProgress(null), emptyDayProgress());
  assert.deepEqual(normalizeDayProgress(undefined), emptyDayProgress());
});
```

`tests/state.test.js` sonuna ekle:

```js
test('bozuk profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', '{}');
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('yanlis sema surumlu profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', JSON.stringify({ schemaVersion: 99, child: { name: 'X', birthYear: 2016 } }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('bozuk gun kaydi normalize edilerek okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:days', JSON.stringify({ '2026-07-24': {} }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  const dp = state.loadDayProgress('2026-07-24');
  assert.deepEqual(dp.cards, {});
  assert.equal(dp.stars, 0);
});

test('bakim vereni olmayan tohum profil gecerli sayilir', () => {
  const { state, profile } = (() => {
    const backend = memoryBackend();
    const s = createAppState(createStorage(backend, 'ataol2'));
    const pr = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });
    s.saveProfile(pr);
    return { state: s, profile: pr };
  })();
  assert.ok(state.loadProfile(), 'bakim veren yoklugu profili gecersiz yapmamali');
  assert.equal(state.loadProfile().child.name, profile.child.name);
});
```

- [ ] **Step 2: Testleri çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/routine.test.js tests/state.test.js`
Expected: FAIL.

- [ ] **Step 3: normalizeDayProgress ekle**

`src/engines/routine.js` içinde `emptyDayProgress`'in hemen altına ekle:

```js
export function normalizeDayProgress(raw) {
  const base = emptyDayProgress();
  if (!raw || typeof raw !== 'object') return base;

  return {
    cards: raw.cards && typeof raw.cards === 'object' && !Array.isArray(raw.cards) ? raw.cards : base.cards,
    approvals: Array.isArray(raw.approvals) ? raw.approvals : base.approvals,
    stars: Number.isFinite(raw.stars) ? raw.stars : base.stars,
    minutes: Number.isFinite(raw.minutes) ? raw.minutes : base.minutes
  };
}
```

- [ ] **Step 4: validateProfile'dan bakım veren zorunluluğunu kaldır**

Tohum profilde henüz bakım veren yok ve bu geçerli bir başlangıç durumu; onboarding Faz 2'nin işi. `src/core/profile.js` içindeki `validateProfile` fonksiyonundan şu bloğu **sil**:

```js
  if (!Array.isArray(profile.guardians) || profile.guardians.length === 0) {
    errors.push('en az bir bakim veren gerekli');
  }
```

Yerine dizi kontrolü kalsın:

```js
  if (!Array.isArray(profile.guardians)) errors.push('guardians dizi olmali');
```

`tests/profile.test.js` içinde `validateProfile gecerli profili onaylar` testi bakım veren ekleyerek profili doğruluyor; o test geçmeye devam eder. Başka bir test bakım veren zorunluluğuna dayanıyorsa onu da bu karara göre güncelle ve raporla.

- [ ] **Step 5: state.js'i sıkılaştır**

`src/core/state.js` import satırlarını güncelle:

```js
import { emptyDayProgress, normalizeDayProgress } from '../engines/routine.js';
import { SCHEMA_VERSION, validateProfile } from './profile.js';
```

`loadProfile` ve `loadDayProgress`'i şununla değiştir:

```js
    loadProfile() {
      const raw = storage.get('profile', null);
      if (!raw || typeof raw !== 'object') return null;
      if (raw.schemaVersion !== SCHEMA_VERSION) return null;
      if (!validateProfile(raw).valid) return null;
      return raw;
    },

    loadDayProgress(dayKey) {
      return normalizeDayProgress(storage.get('days', {})[dayKey]);
    },
```

`emptyDayProgress` artık doğrudan kullanılmıyorsa importtan çıkar.

- [ ] **Step 6: main.js'e kurtarma ekranı ekle**

`src/main.js`'in en üstündeki bootstrap bloğunu (`const state = ...` satırından `state.saveProfile(profile);` satırına kadar) şununla değiştir:

```js
let state;
let profile;

function showRecovery() {
  const app = document.getElementById('app');
  mount(app, [
    el('div', { className: 'v2-recovery' }, [
      el('p', { text: 'Uygulama açılamadı.' }),
      el('button', {
        text: 'Sıfırla ve yeniden başla',
        attrs: { type: 'button' },
        dataset: { recover: 'reset' }
      })
    ])
  ]);
  app.addEventListener('click', (e) => {
    if (e.target.closest('[data-recover]')) {
      window.localStorage.clear();
      window.location.reload();
    }
  });
}

try {
  state = createAppState(createStorage(window.localStorage, 'ataol2'));
  profile = state.loadProfile();
  if (!profile) {
    profile = seedProfile({ childName: 'Deha', birthYear: 2016, guardians: [] });
    state.saveProfile(profile);
  }
} catch (err) {
  profile = null;
  showRecovery();
}
```

Dosyanın en sonundaki başlatma satırlarını koru altına al:

```js
if (profile) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderIfStale();
  });
  window.addEventListener('pageshow', renderIfStale);
  setInterval(renderIfStale, 30000);
  render();
}
```

- [ ] **Step 7: styles-v2.css'e kurtarma stilini ekle**

`.v2-recovery` sınıfını tanımla: ortalanmış, okunaklı, mevcut CSS değişkenlerini kullanan basit bir blok. Yeni renk tanımlama.

- [ ] **Step 8: Testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`
Expected: hepsi geçer. Gerçek sayıyı raporla.

- [ ] **Step 9: Commit**

```bash
git add src/engines/routine.js src/core/state.js src/core/profile.js src/main.js styles-v2.css tests/routine.test.js tests/state.test.js tests/profile.test.js
git commit -m "fix(core): bozuk kayit uygulamayi kilitlemesin, kurtarma ekrani"
```

---

## Task 4: el() öznitelik denetimi ve dom.js testleri

`dom.js` tüm güvenlik modelinin geçtiği tek nokta ve şu an test edilmeyen tek modül. İnceleyicinin dediği gibi bu ters bir durum.

**Files:**
- Modify: `src/ui/dom.js`
- Test: `tests/dom.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/dom.test.js`. Sahte bir `document` kurar, jsdom gerektirmez.

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

function fakeDocument() {
  return {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        dataset: {},
        attributes: {},
        children: [],
        setAttribute(k, v) { this.attributes[k] = String(v); },
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) { this.children = this.children.filter((x) => x !== c); },
        get firstChild() { return this.children[0] ?? null; }
      };
    }
  };
}

globalThis.document = fakeDocument();
const { el, mount, clear } = await import('../src/ui/dom.js');

test('metin textContent olarak yazilir, yorumlanmaz', () => {
  const node = el('p', { text: '<img src=x onerror=alert(1)>' });
  assert.equal(node.textContent, '<img src=x onerror=alert(1)>');
  assert.deepEqual(node.attributes, {});
});

test('sayi ve sifir metne cevrilir', () => {
  assert.equal(el('p', { text: 0 }).textContent, '0');
});

test('izin verilen oznitelik yazilir', () => {
  const node = el('button', { attrs: { type: 'button' } });
  assert.equal(node.attributes.type, 'button');
});

test('olay ozniteligi reddedilir', () => {
  assert.throws(() => el('img', { attrs: { onerror: 'alert(1)' } }), /izin verilmeyen oznitelik/);
});

test('calistirilabilir oznitelikler reddedilir', () => {
  assert.throws(() => el('a', { attrs: { href: 'javascript:alert(1)' } }), /izin verilmeyen oznitelik/);
  assert.throws(() => el('div', { attrs: { style: 'x' } }), /izin verilmeyen oznitelik/);
});

test('aria oznitelikleri kabul edilir', () => {
  const node = el('button', { attrs: { 'aria-label': 'Onayla' } });
  assert.equal(node.attributes['aria-label'], 'Onayla');
});

test('dataset degerleri yazilir', () => {
  const node = el('li', { dataset: { cardId: 'abc' } });
  assert.equal(node.dataset.cardId, 'abc');
});

test('cocuklar eklenir, null atlanir', () => {
  const node = el('ul', {}, [el('li', { text: 'a' }), null, el('li', { text: 'b' })]);
  assert.equal(node.children.length, 2);
});

test('mount hedefi once temizler', () => {
  const hedef = el('div', {}, [el('span', { text: 'eski' })]);
  mount(hedef, [el('span', { text: 'yeni' })]);
  assert.equal(hedef.children.length, 1);
  assert.equal(hedef.children[0].textContent, 'yeni');
});

test('clear tum cocuklari siler', () => {
  const hedef = el('div', {}, [el('span', {}), el('span', {})]);
  clear(hedef);
  assert.equal(hedef.children.length, 0);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/dom.test.js`
Expected: FAIL. Öznitelik reddi testleri geçmez, çünkü henüz denetim yok.

- [ ] **Step 3: Düzelt**

`src/ui/dom.js` içinde, `el` fonksiyonunun üstüne ekle:

```js
const ALLOWED_ATTRS = new Set([
  'type', 'name', 'value', 'id', 'for', 'checked', 'disabled',
  'hidden', 'placeholder', 'inputmode', 'maxlength', 'role', 'tabindex'
]);
```

`attrs` döngüsünü şununla değiştir:

```js
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (!ALLOWED_ATTRS.has(k) && !k.startsWith('aria-')) {
      throw new Error(`izin verilmeyen oznitelik: ${k}`);
    }
    node.setAttribute(k, v);
  }
```

Dosya başındaki yorumu gerçeğe uygun hale getir:

```js
/**
 * Kucuk DOM kurucu.
 *
 * Metin daima textContent ile yazilir; HTML dogrudan hicbir yerde
 * basilmaz. Oznitelikler beyaz listeden gecer, yani olay ozniteligi ve
 * calistirilabilir alanlar reddedilir. Enjeksiyon bu iki kural birlikte
 * uygulandiginda yapisal olarak engellenir.
 */
```

Beyaz liste bilinçli olarak dar. Yeni bir özniteliğe gerçekten ihtiyaç olursa listeye eklenir; bu, eklerken bir kez düşünülmesini sağlar.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/dom.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Tarayıcıda kontrol et**

`python -m http.server 8080` ile `v2.html`'i aç. Mevcut çağrılar (`type`, `name`, `value`) beyaz listede olduğu için hata vermemeli. Konsolda hata olmadığını ve PIN kutusunun hâlâ açıldığını doğrula.

- [ ] **Step 6: Commit**

```bash
git add src/ui/dom.js tests/dom.test.js
git commit -m "fix(ui): el() oznitelik beyaz listesi ve dom testleri"
```

---

## Task 5: Tek dizin taramasıyla mimari koruması

**Files:**
- Create: `tests/architecture.test.js`
- Modify: `tests/profile.test.js`, `tests/diary.test.js`, `tests/routine-view.test.js`, `tests/parent-view.test.js`, `README.md`

- [ ] **Step 1: Yeni koruma testini yaz**

Create `tests/architecture.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function jsFiles(dir) {
  const out = [];
  for (const isim of readdirSync(dir)) {
    const tam = path.join(dir, isim);
    if (statSync(tam).isDirectory()) out.push(...jsFiles(tam));
    else if (isim.endsWith('.js')) out.push(tam);
  }
  return out;
}

const TUM = jsFiles(SRC).map((f) => ({
  yol: path.relative(SRC, f).replace(/\\/g, '/'),
  src: readFileSync(f, 'utf8')
}));

// Yasak belirtecler parcali yaziliyor ki bu dosyanin kendisi guvenlik
// tarayicilarina takilmasin ve tarama kapsami genislerse kendini
// eslesmesin.
const SINKLER = ['inner' + 'HTML', 'outer' + 'HTML', 'insertAdjacent' + 'HTML', 'document.' + 'write', 'eval' + '(', 'new ' + 'Function', 'src' + 'doc'];
const AG = ['fetch' + '(', 'XMLHttp' + 'Request', 'send' + 'Beacon', 'Web' + 'Socket'];

test('kaynak agacinda dosya bulundu', () => {
  assert.ok(TUM.length >= 10, `beklenenden az dosya: ${TUM.length}`);
});

test('hicbir dosya HTML enjeksiyon sinki icermez', () => {
  for (const { yol, src } of TUM) {
    for (const y of SINKLER) {
      assert.ok(!src.includes(y), `${yol} icinde "${y}" var`);
    }
  }
});

test('views core ve engines DOM api si icermez', () => {
  for (const { yol, src } of TUM) {
    if (!/^(views|core|engines)\//.test(yol)) continue;
    for (const y of ['document', 'window.', 'addEventListener']) {
      assert.ok(!src.includes(y), `${yol} icinde "${y}" olmamali`);
    }
  }
});

test('engines saf kalir, saat okumaz', () => {
  for (const { yol, src } of TUM) {
    if (!yol.startsWith('engines/')) continue;
    assert.ok(!/new Date\(\s*\)/.test(src), `${yol} argumansiz new Date() kullaniyor`);
    assert.ok(!src.includes('Date.now()'), `${yol} Date.now() kullaniyor`);
    assert.ok(!src.includes('Math.random()'), `${yol} dogrudan Math.random() cagiriyor`);
  }
});

test('core ve engines icinde kisi adi sabit yazili degil', () => {
  for (const { yol, src } of TUM) {
    if (!/^(core|engines)\//.test(yol)) continue;
    for (const isim of ['Deha', 'Feride', 'Sertaç', 'Sertac']) {
      assert.ok(!src.includes(isim), `${yol} icinde "${isim}" gecmemeli`);
    }
  }
});

test('gunluk modulu ag cagrisi icermez', () => {
  const diary = TUM.find(({ yol }) => yol === 'engines/diary.js');
  assert.ok(diary, 'engines/diary.js bulunamadi');
  for (const y of AG) {
    assert.ok(!diary.src.includes(y), `diary.js icinde "${y}" olmamali`);
  }
});

test('DOM sadece main.js ve ui altinda kullanilir', () => {
  const domlu = TUM.filter(({ src }) => src.includes('document')).map(({ yol }) => yol).sort();
  assert.deepEqual(domlu, ['main.js', 'ui/dom.js']);
});
```

Not: `engines/math.js` içinde `rng = Math.random` varsayılan parametresi var; test `Math.random()` (parantezli çağrı) arıyor, varsayılan parametre eşleşmez. Bu kasıtlı.

- [ ] **Step 2: Testi çalıştır**

Run: `node --test tests/architecture.test.js`

Kırılırsa **kodu düzelterek** çöz, testi gevşeterek değil. Örneğin bir yorum satırında `localStorage` veya bir yasak belirteç geçiyorsa yorumu yeniden yaz. Neyi düzelttiğini raporla.

- [ ] **Step 3: Eski nokta korumalarını kaldır**

Yeni test hepsini kapsıyor ve daha geniş. Şu testleri sil:

- `tests/profile.test.js` → `kodda kisi adi sabit yazili degil`
- `tests/diary.test.js` → `gunluk modulu ag cagrisi icermez`
- `tests/routine-view.test.js` → `gorunum modulu DOM api si icermez`
- `tests/parent-view.test.js` → `gorunum modulu DOM api si icermez`

Bu dosyalarda artık kullanılmayan `readFileSync` importlarını da temizle.

- [ ] **Step 4: Korumanın gerçekten yakaladığını kanıtla**

Geçici olarak `src/views/routine.js` sonuna `// document` satırı ekle, `node --test tests/architecture.test.js` çalıştır, kırıldığını gör, satırı sil, tekrar geçtiğini gör. Her iki çıktıyı da raporla.

- [ ] **Step 5: README'yi gerçeğe uygun hale getir**

`README.md` içindeki 5. maddeyi şununla değiştir:

```
5. **HTML doğrudan basılmaz.** Görünüm modülleri düz veri döndürür; DOM'u yalnızca `src/main.js` ve `src/ui/dom.js` kurar. `el()` yardımcısı metni `textContent` ile yazar ve öznitelikleri beyaz listeden geçirir. Bu kuralların tamamı `tests/architecture.test.js` içindeki tek bir dizin taramasıyla `src/` ağacının tümü üzerinde denetlenir.
```

- [ ] **Step 6: Commit**

```bash
git add tests/ README.md
git commit -m "test: mimari korumasi tek dizin taramasina donusturuldu"
```

---

## Task 6: Tüm paket ve tarayıcı doğrulaması

- [ ] **Step 1: Tüm testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`

Beklenen sayı yaklaşık 128'dir ama **kesin sayıyı hesaplamaya çalışma**, gerçek çıktıyı raporla. Önemli olan `# fail 0`.

- [ ] **Step 2: Tarayıcıda uçtan uca doğrula**

`python -m http.server 8080`, `http://localhost:8080/v2.html`.

Konsoldan iki bakım veren ekle:

```js
const { hashPin } = await import('./src/core/crypto.js');
const { addGuardian } = await import('./src/core/profile.js');
const p = JSON.parse(localStorage.getItem('ataol2:profile'));
const baba = await hashPin('1234');
const anne = await hashPin('5678');
let yeni = addGuardian(p, { name: 'Sertaç', label: 'Baba', pinHash: baba.hash, pinSalt: baba.salt });
yeni = addGuardian(yeni, { name: 'Feride', label: 'Feride mama', pinHash: anne.hash, pinSalt: anne.salt });
localStorage.setItem('ataol2:profile', JSON.stringify(yeni));
location.reload();
```

Doğrula ve ekran görüntüsü al:

1. **Matematik kartı artık onay istiyor.** Ona dokun: `awaiting_approval` olsun, yıldız sayacı artmasın, ebeveyn sekmesinde kuyruğa girsin.
2. **Kitap kartı da onay istiyor.** Aynı davranış.
3. **Kurtarma ekranı çalışıyor.** Konsolda `localStorage.setItem('ataol2:profile', '{}')` çalıştır, sayfayı yenile. Beyaz ekran yerine "Uygulama açılamadı" ve sıfırlama düğmesi görünmeli. Düğmeye bas, uygulama temiz açılmalı.
4. Konsolda hata yok.
5. `index.html` hâlâ çalışıyor.

Zaman tetikleyicisini doğrudan beklemek zor. Bunun yerine konsolda imzanın değiştiğini göster:

```js
const { renderSignature } = await import('./src/views/clock.js');
const p = JSON.parse(localStorage.getItem('ataol2:profile'));
console.log(renderSignature(p, new Date('2026-07-24T14:59:00')));
console.log(renderSignature(p, new Date('2026-07-24T15:01:00')));
```

İki satırın farklı olması, 15:00'te ekranın kendini yenileyeceği anlamına gelir.

- [ ] **Step 3: Rapor et**

Neyi doğruladığını ve neyi doğrulayamadığını açıkça yaz. Doğrulamadığın bir şeyi doğruladım deme.

---

## Kapsam dışı (1C'ye bırakıldı)

| Bulgu | Neden erteleniyor |
|---|---|
| `awaitingApproval` sayısı ekranda gösterilmiyor, ebeveyn sekmesinde rozet yok | Ebeveyn paneli 1C'de genişleyecek |
| Simge fontu çevrimdışı yüklenmiyor, kartlarda İngilizce kelimeler görünüyor | `sw.js` önbellek stratejisi, 1D'de v1 devriyle |
| İki sekme açıkken son yazan kazanıyor | Tek çocuk tek cihaz, düşük etki |
| PIN kutusunda Enter ile gönderme ve deneme sınırı yok | 1C ergonomi turu |
| `days` blobu sınırsız büyüyor | 1D veri göçüyle birlikte budama |
| `createdAt` hiç doldurulmuyor | Okuyan yok |
| `storage.set` kota hatası (Safari gizli mod) | Kurtarma ekranı artık çökmeyi yakalıyor; kalıcı çözüm 1C |
