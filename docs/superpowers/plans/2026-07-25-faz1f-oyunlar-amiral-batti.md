# ATAOL v2 Faz 1F: Oyun Sekmesi ve Amiral Battı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Günün rutini bitince açılan bir oyun bölümü ve içinde çalışan bir Amiral Battı.

**Architecture:** Oyun motoru saf ve test edilebilir; kilit kuralı `views/games.js` içinde saf bir fonksiyon. `main.js` yalnızca çizer.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

---

## Üç karar

**1. Oyunlar kazanılır, bedava açılmaz.** Deha'nın asıl sorunu YouTube Shorts. Sınırsız oynanabilir bir oyun koymak, bir ekran alışkanlığının yerine başkasını koymak olur ve rutin kartları oyunla rekabet etmeye başlar. Oyun sekmesi, o an açık olan blokların kartları bitene kadar kilitli.

**2. Kilit gün boyu değil, blok başına.** Tüm günün kartlarını şart koşarsak akşam bloğu açılana kadar oyun yok, yani sabahı bitirmenin ödülü gelmiyor. Bunun yerine: **o an açık olan blokların kartları** bitince oyun açılır. Yeni blok açılınca tekrar kilitlenir.

**3. Onay bekleyen kart tamamlanmış sayılır.** Deha üstüne düşeni yaptıysa, ebeveyn onaylayana kadar oyunsuz kalması onu başkasının gecikmesiyle cezalandırmak olur.

---

## Amiral Battı tasarımı

**8×8, dört gemi (2, 3, 3, 4).** Standart 10×10 ve beş gemi, dikkat süresi kısa bir çocuk için fazla uzun. 8×8 tahtada 12 gemi karesi var, oyun makul sürede biter.

**Yerleştirme otomatik.** Elle gemi yerleştirme arayüzü (döndür, sürükle, çakışma uyarısı) hem büyük bir iş hem de çocuk için sinir bozucu. İki taraf da otomatik yerleşir, çocuk doğrudan oynamaya başlar.

**Rakip kasten çok iyi değil.** Rastgele atar, isabet alırsa komşu karelere yönelir. Parite optimizasyonu yok. Sürekli kaybeden çocuk oynamayı bırakır; Deha'nın kazanabilmesi gerekiyor.

**Eğitim değeri koordinatta.** Kenarlarda A-H ve 1-8 etiketleri görünür. Koordinat okuma gerçek bir uzamsal beceridir ve okulda da karşısına çıkar.

---

## Task 1: engines/battleship.js

Durum JSON'a yazılabilir olmalı (localStorage), o yüzden `Set` ve `Map` kullanılmaz.

**Files:**
- Create: `src/engines/battleship.js`
- Test: `tests/battleship.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/battleship.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_SIZE, SHIP_SIZES, createBoard, cellId, parseCell,
  fire, isDefeated, aiChoose, remainingShips
} from '../src/engines/battleship.js';

const sirali = () => { let i = 0; return () => ((i++ * 0.137) % 1); };

test('tahta dogru boyutta ve dogru gemilerle kurulur', () => {
  const b = createBoard(sirali());
  assert.equal(b.size, BOARD_SIZE);
  assert.equal(b.ships.length, SHIP_SIZES.length);
  for (let i = 0; i < SHIP_SIZES.length; i++) {
    assert.equal(b.ships[i].cells.length, SHIP_SIZES[i], `gemi ${i} yanlis boyutta`);
  }
});

test('gemiler cakismaz', () => {
  for (let n = 0; n < 50; n++) {
    const b = createBoard(() => (n * 0.019 + 0.001) % 1);
    const hepsi = b.ships.flatMap((s) => s.cells);
    assert.equal(hepsi.length, new Set(hepsi).size, 'cakisan gemi var');
  }
});

test('gemiler tahta disina tasmaz', () => {
  for (let n = 0; n < 50; n++) {
    const b = createBoard(() => (n * 0.019 + 0.001) % 1);
    for (const s of b.ships) {
      for (const c of s.cells) {
        const { x, y } = parseCell(c);
        assert.ok(x >= 0 && x < BOARD_SIZE, `${c} yatayda tasti`);
        assert.ok(y >= 0 && y < BOARD_SIZE, `${c} dikeyde tasti`);
      }
    }
  }
});

test('gemi kareleri bitisik ve tek yonlu', () => {
  const b = createBoard(sirali());
  for (const s of b.ships) {
    const p = s.cells.map(parseCell);
    const ayniSatir = p.every((c) => c.y === p[0].y);
    const ayniSutun = p.every((c) => c.x === p[0].x);
    assert.ok(ayniSatir || ayniSutun, 'gemi duz degil');
    const eksen = ayniSatir ? p.map((c) => c.x) : p.map((c) => c.y);
    eksen.sort((a, c) => a - c);
    for (let i = 1; i < eksen.length; i++) {
      assert.equal(eksen[i], eksen[i - 1] + 1, 'gemi kareleri bitisik degil');
    }
  }
});

test('cellId ve parseCell birbirinin tersi', () => {
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      assert.deepEqual(parseCell(cellId(x, y)), { x, y });
    }
  }
});

test('bos kareye atis iska', () => {
  const b = createBoard(sirali());
  const dolu = new Set(b.ships.flatMap((s) => s.cells));
  const bos = [...Array(BOARD_SIZE * BOARD_SIZE).keys()]
    .map((i) => cellId(i % BOARD_SIZE, Math.floor(i / BOARD_SIZE)))
    .find((c) => !dolu.has(c));
  const r = fire(b, bos);
  assert.equal(r.result, 'miss');
  assert.equal(r.board.shots[bos], 'miss');
});

test('gemi karesine atis isabet', () => {
  const b = createBoard(sirali());
  const hedef = b.ships[0].cells[0];
  const r = fire(b, hedef);
  assert.equal(r.result, 'hit');
  assert.equal(r.board.shots[hedef], 'hit');
});

test('geminin son karesi batirir', () => {
  let b = createBoard(sirali());
  const gemi = b.ships[0];
  let son = null;
  for (const c of gemi.cells) son = fire(b, c), b = son.board;
  assert.equal(son.result, 'sunk');
  assert.equal(son.shipId, gemi.id);
});

test('ayni kareye ikinci atis durumu degistirmez', () => {
  const b = createBoard(sirali());
  const hedef = b.ships[0].cells[0];
  const bir = fire(b, hedef);
  const iki = fire(bir.board, hedef);
  assert.equal(iki.result, 'already');
  assert.deepEqual(iki.board, bir.board);
});

test('tum gemiler batinca oyun biter', () => {
  let b = createBoard(sirali());
  assert.equal(isDefeated(b), false);
  for (const s of b.ships) for (const c of s.cells) b = fire(b, c).board;
  assert.equal(isDefeated(b), true);
});

test('remainingShips batmayan gemi sayisini verir', () => {
  let b = createBoard(sirali());
  assert.equal(remainingShips(b), SHIP_SIZES.length);
  for (const c of b.ships[0].cells) b = fire(b, c).board;
  assert.equal(remainingShips(b), SHIP_SIZES.length - 1);
});

test('aiChoose atilmamis kare secer', () => {
  let b = createBoard(sirali());
  const secilen = new Set();
  for (let i = 0; i < 30; i++) {
    const c = aiChoose(b, () => (i * 0.041 + 0.007) % 1);
    assert.ok(c, 'null dondu');
    assert.ok(!b.shots[c], `zaten atilmis kare secildi: ${c}`);
    secilen.add(c);
    b = fire(b, c).board;
  }
  assert.equal(secilen.size, 30, 'ayni kare iki kez secildi');
});

test('aiChoose isabetten sonra komsu kareye yonelir', () => {
  let b = createBoard(sirali());
  const gemi = b.ships.find((s) => s.cells.length >= 3);
  b = fire(b, gemi.cells[1]).board;
  const { x, y } = parseCell(gemi.cells[1]);
  const komsular = [cellId(x - 1, y), cellId(x + 1, y), cellId(x, y - 1), cellId(x, y + 1)];
  let komsuSecildi = 0;
  for (let i = 0; i < 20; i++) {
    const c = aiChoose(b, () => (i * 0.053 + 0.011) % 1);
    if (komsular.includes(c)) komsuSecildi++;
  }
  assert.ok(komsuSecildi > 0, 'isabetten sonra komsuya hic yonelmedi');
});

test('tahta JSON turuna dayanir', () => {
  const b = createBoard(sirali());
  const geri = JSON.parse(JSON.stringify(b));
  assert.deepEqual(geri, b, 'Set veya Map kullanilmis olabilir');
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

- [ ] **Step 3: Implementasyonu yaz**

Create `src/engines/battleship.js`:

```js
/**
 * Amiral Batti.
 *
 * 8x8 ve dort gemi: standart 10x10 / bes gemi, dikkat suresi kisa bir
 * cocuk icin fazla uzun surer.
 *
 * Rakip kasten cok iyi degil. Rastgele atar, isabet alirsa komsu
 * karelere yonelir; parite optimizasyonu yok. Surekli kaybeden cocuk
 * oynamayi birakir, kazanabilmesi gerekir.
 *
 * Durum JSON'a yazilabilir olmali (localStorage), o yuzden Set ve Map
 * kullanilmaz.
 *
 * Saf modul: rastgelelik disaridan gelir.
 */

export const BOARD_SIZE = 8;
export const SHIP_SIZES = [4, 3, 3, 2];

const HARFLER = 'ABCDEFGH';

export function cellId(x, y) {
  return `${HARFLER[x]}${y + 1}`;
}

export function parseCell(id) {
  return { x: HARFLER.indexOf(id[0]), y: Number(id.slice(1)) - 1 };
}

function yerlestir(boyut, dolu, rng) {
  for (let deneme = 0; deneme < 500; deneme++) {
    const yatay = rng() < 0.5;
    const x = Math.floor(rng() * (yatay ? BOARD_SIZE - boyut + 1 : BOARD_SIZE));
    const y = Math.floor(rng() * (yatay ? BOARD_SIZE : BOARD_SIZE - boyut + 1));

    const cells = [];
    for (let i = 0; i < boyut; i++) {
      cells.push(yatay ? cellId(x + i, y) : cellId(x, y + i));
    }

    if (cells.every((c) => !dolu.has(c))) return cells;
  }
  return null;
}

export function createBoard(rng = Math.random) {
  const dolu = new Set();
  const ships = [];

  SHIP_SIZES.forEach((boyut, i) => {
    const cells = yerlestir(boyut, dolu, rng);
    if (!cells) return;
    cells.forEach((c) => dolu.add(c));
    ships.push({ id: i, size: boyut, cells, hits: [] });
  });

  return { size: BOARD_SIZE, ships, shots: {} };
}

export function fire(board, cell) {
  if (board.shots[cell]) return { board, result: 'already', shipId: null };

  const gemi = board.ships.find((s) => s.cells.includes(cell));

  if (!gemi) {
    return { board: { ...board, shots: { ...board.shots, [cell]: 'miss' } }, result: 'miss', shipId: null };
  }

  const ships = board.ships.map((s) =>
    s.id === gemi.id ? { ...s, hits: [...s.hits, cell] } : s
  );
  const guncel = ships.find((s) => s.id === gemi.id);
  const batti = guncel.hits.length === guncel.cells.length;

  return {
    board: { ...board, ships, shots: { ...board.shots, [cell]: 'hit' } },
    result: batti ? 'sunk' : 'hit',
    shipId: gemi.id
  };
}

export function remainingShips(board) {
  return board.ships.filter((s) => s.hits.length < s.cells.length).length;
}

export function isDefeated(board) {
  return remainingShips(board) === 0;
}

function komsular(cell) {
  const { x, y } = parseCell(cell);
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    .filter(([a, b]) => a >= 0 && a < BOARD_SIZE && b >= 0 && b < BOARD_SIZE)
    .map(([a, b]) => cellId(a, b));
}

export function aiChoose(board, rng = Math.random) {
  const atilmamis = (c) => !board.shots[c];

  // Batmamis gemilerdeki isabetlerin komsulari once denenir.
  const acikIsabetler = board.ships
    .filter((s) => s.hits.length > 0 && s.hits.length < s.cells.length)
    .flatMap((s) => s.hits);

  const hedefler = [...new Set(acikIsabetler.flatMap(komsular))].filter(atilmamis);
  if (hedefler.length > 0) return hedefler[Math.floor(rng() * hedefler.length)];

  const bos = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const c = cellId(x, y);
      if (atilmamis(c)) bos.push(c);
    }
  }

  return bos.length === 0 ? null : bos[Math.floor(rng() * bos.length)];
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula** — `# pass 14`

- [ ] **Step 5: Oynanabilirlik probe'u**

Rakip gerçekten yenilebilir mi, ölç. Çalıştır, çıktıyı raporla, sonra sil:

```js
// probe.tmp.mjs
import { createBoard, fire, aiChoose, isDefeated, BOARD_SIZE } from './src/engines/battleship.js';
let toplamAtis = 0;
const N = 200;
for (let n = 0; n < N; n++) {
  let b = createBoard();
  let atis = 0;
  while (!isDefeated(b) && atis < BOARD_SIZE * BOARD_SIZE) {
    const c = aiChoose(b);
    if (!c) break;
    b = fire(b, c).board;
    atis++;
  }
  toplamAtis += atis;
}
console.log('rakip 12 gemi karesini ortalama', (toplamAtis / N).toFixed(1), 'atista buluyor (64 kare)');
console.log('rastgele atis olsaydi beklenen ~', (64 * 12 / 13).toFixed(1));
```

Ortalama 35-50 arası olmalı. 25'in altındaysa rakip fazla iyi, çocuk sürekli kaybeder; raporla.

- [ ] **Step 6: Commit**

```bash
git add src/engines/battleship.js tests/battleship.test.js
git commit -m "feat(engines): Amiral Batti motoru, yenilebilir rakip"
```

---

## Task 2: views/games.js kilit kuralı

**Files:**
- Create: `src/views/games.js`
- Test: `tests/games-view.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/games-view.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gamesViewModel } from '../src/views/games.js';
import { seedProfile } from '../src/data/defaults.js';
import { emptyDayProgress, completeCard } from '../src/engines/routine.js';

const profile = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });
const sabah = new Date('2026-07-25T07:00:00');
const aksam = new Date('2026-07-25T20:00:00');

function sabahiBitir(dp, t) {
  for (const id of profile.routine.morning) dp = completeCard(profile, dp, id, t);
  return dp;
}

test('acik blogun kartlari bitmeden kilitli', () => {
  const vm = gamesViewModel(profile, emptyDayProgress(), sabah);
  assert.equal(vm.unlocked, false);
  assert.ok(vm.remaining > 0);
});

test('acik blogun kartlari bitince acilir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  const vm = gamesViewModel(profile, dp, sabah);
  assert.equal(vm.unlocked, true);
  assert.equal(vm.remaining, 0);
});

test('onay bekleyen kart tamamlanmis sayilir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  const onayBekleyen = Object.values(dp.cards).filter((c) => c.state === 'awaiting_approval');
  assert.ok(onayBekleyen.length > 0, 'test anlamsiz, hic onay bekleyen yok');
  assert.equal(gamesViewModel(profile, dp, sabah).unlocked, true);
});

test('yeni blok acilinca tekrar kilitlenir', () => {
  const dp = sabahiBitir(emptyDayProgress(), sabah);
  assert.equal(gamesViewModel(profile, dp, sabah).unlocked, true);
  assert.equal(gamesViewModel(profile, dp, aksam).unlocked, false);
});

test('kalan gorev sayisi dogru', () => {
  let dp = emptyDayProgress();
  const toplam = profile.routine.morning.length;
  assert.equal(gamesViewModel(profile, dp, sabah).remaining, toplam);
  dp = completeCard(profile, dp, profile.routine.morning[0], sabah);
  assert.equal(gamesViewModel(profile, dp, sabah).remaining, toplam - 1);
});

test('hic blok acik degilse kilitli kalir', () => {
  const gece = new Date('2026-07-25T05:00:00');
  assert.equal(gamesViewModel(profile, emptyDayProgress(), gece).unlocked, false);
});

test('oyun listesi tasinir', () => {
  const vm = gamesViewModel(profile, emptyDayProgress(), sabah);
  assert.ok(Array.isArray(vm.games));
  assert.ok(vm.games.some((g) => g.id === 'amiral'));
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/games.js', import.meta.url), 'utf8');
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(y), `games.js icinde "${y}" olmamali`);
  }
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

- [ ] **Step 3: Implementasyonu yaz**

Create `src/views/games.js`:

```js
import { cardStates, availableBlocks } from '../engines/routine.js';

/**
 * Oyun sekmesinin kilit kurali.
 *
 * Oyunlar kazanilir, bedava acilmaz. Cocugun asil sorunu ekran
 * bagimliligi; sinirsiz oynanabilir bir oyun, rutin kartlariyla
 * rekabet eder ve uygulamanin kendi amacini baltalar.
 *
 * Kilit gun boyu degil blok basina: tum gunun kartlari sart kosulsa
 * aksam blogu acilana kadar oyun olmaz, yani sabahi bitirmenin odulu
 * gelmez. O an acik olan bloklarin kartlari bitince acilir.
 *
 * Onay bekleyen kart tamamlanmis sayilir: cocuk ustune duseni
 * yaptiysa, ebeveyn onaylayana kadar oyunsuz kalmasi onu baskasinin
 * gecikmesiyle cezalandirmak olur.
 */

export const GAMES = [
  { id: 'amiral', title: 'Amiral Battı', icon: 'sailing' }
];

const BITMIS = new Set(['done', 'awaiting_approval']);

export function gamesViewModel(profile, dayProgress, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const acikBloklar = new Set(availableBlocks(date, profile.schedule, resetHour));

  const acikKartlar = cardStates(profile, dayProgress, date)
    .filter((s) => acikBloklar.has(s.block));

  const kalan = acikKartlar.filter((s) => !BITMIS.has(s.state)).length;

  return {
    unlocked: acikBloklar.size > 0 && kalan === 0,
    remaining: kalan,
    games: GAMES
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula** — `# pass 8`

- [ ] **Step 5: Commit**

```bash
git add src/views/games.js tests/games-view.test.js
git commit -m "feat(views): oyun sekmesi kilit kurali"
```

---

## Task 3: Ekran

**Files:**
- Modify: `v2.html`, `styles-v2.css`, `src/main.js`, `src/core/state.js`, `tests/state.test.js`

- [ ] **Step 1: Üçüncü sekme**

`v2.html` içindeki `.v2-nav`'a üçüncü düğme ekle (`data-nav="games"`, etiket `Oyun`) ve `<main id="view-games" class="v2-view"></main>` ekle. Amiral Battı için bir modal ekle:

```html
  <div id="amiral-modal" class="v2-modal" hidden>
    <div class="v2-modal__box v2-modal__box--wide">
      <p id="amiral-durum" class="v2-modal__note"></p>
      <div id="amiral-tahta" class="amiral__tahta"></div>
      <p id="amiral-mesaj" class="amiral__mesaj" hidden></p>
      <button type="button" id="amiral-yeni">Yeni oyun</button>
      <button type="button" id="amiral-kapat">Kapat</button>
    </div>
  </div>
```

- [ ] **Step 2: Oyun durumunu sakla**

`src/core/state.js`'e ekle:

```js
    loadGame(id) {
      return storage.get(`game:${id}`, null);
    },

    saveGame(id, durum) {
      storage.set(`game:${id}`, durum);
    },
```

`tests/state.test.js`'teki izinli anahtar listesi artık `game:` önekini de kabul etmeli. O testi şöyle güncelle:

```js
test('depolama sadece bilinen anahtarlari kullanir', () => {
  const { storage, state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 1, minutes: 1 });
  state.saveDrill(state.loadDrill());
  state.saveDiary({});
  state.saveTimeFacts({});
  state.saveGame('amiral', { x: 1 });
  const bilinen = ['profile', 'days', 'drill', 'diary', 'timefacts'];
  for (const k of storage.keys()) {
    assert.ok(bilinen.includes(k) || k.startsWith('game:'), `beklenmeyen anahtar: ${k}`);
  }
});
```

Ayrıca bir test ekle:

```js
test('oyun durumu kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(state.loadGame('amiral'), null);
  state.saveGame('amiral', { tur: 3 });
  assert.equal(state.loadGame('amiral').tur, 3);
});
```

- [ ] **Step 3: Stiller**

`styles-v2.css`'e ekle: `.amiral__tahta` (9 sütunlu grid: köşe + A-H etiketleri; satır başlarında 1-8), `.amiral__kare` (kare oranlı, en az 32px, dokunulabilir), `.amiral__kare--iska`, `.amiral__kare--isabet`, `.amiral__kare--batik`, `.amiral__etiket`, `.amiral__mesaj`, `.games-locked`, `.games-card`, `.v2-modal__box--wide`.

**Modal beyaz zeminde.** `--card-bg` ve `--card-border` orada görünmez kalır; kareler için belirgin bir kenarlık ve marka moru kullan. Bu hata iki kez yaşandı.

Isabet ve ıska bir bakışta ayırt edilmeli: ıska soluk, isabet kırmızımsı (`--accent`), batık koyu.

- [ ] **Step 4: main.js**

1. Gezinme üç sekmeye çıkar.
2. `renderGames()`: kilitliyse "Önce bugünün görevlerini bitir, {n} görev kaldı" mesajı ve soluk oyun kartı; açıksa oynanabilir kart.
3. Oyun kartına dokununca `acAmiral()`: kayıtlı oyun varsa yükler, yoksa `createBoard()` ile yeni kurar ve kaydeder.
4. Tahta `el()` ile çizilir: üst satır A-H etiketleri, her satır başında 1-8. Kareye dokununca `fire()`, sonuç kaydedilir, rakip `aiChoose()` ile karşılık verir.
5. **Rakibin attığı kareler ayrı bir tahtada tutulur** (çocuğun kendi tahtası). İki tahta göstermek küçük ekranda kalabalık olur; bunun yerine üstte "Senin gemilerin: 3/4" gibi bir sayaç yeterli.
6. Oyun bitince mesaj: kazandıysa kutlama, kaybettiyse "Rakip kazandı, tekrar dene". Ceza yok, yıldız da yok; oyun ödülün kendisi.
7. `renderIfStale` listesine `amiral-modal` eklenir.

- [ ] **Step 5: Testler**

`node --test "tests/**/*.test.js"` ve `node --test tests/architecture.test.js` — sayıları raporla.

- [ ] **Step 6: Commit**

```bash
git add src/ tests/ v2.html styles-v2.css
git commit -m "feat(app): oyun sekmesi ve Amiral Batti ekrani"
```

---

## Task 4: Tarayıcı doğrulaması

`python -m http.server 8080`, `localStorage.clear()`, bakım veren ekle.

Doğrula, ekran görüntüsü al:

1. Oyun sekmesi görünüyor ve **kilitli**, kaç görev kaldığını yazıyor.
2. Sabah bloğunun kartlarını bitir. Oyun sekmesi **açılıyor**.
3. Amiral Battı açılıyor, 8×8 tahta, kenarlarda A-H ve 1-8 etiketleri okunuyor.
4. Kareye dokununca ıska veya isabet işaretleniyor, ikisi bir bakışta ayırt ediliyor.
5. Bir gemi tamamen vurulunca "battı" bildirimi geliyor.
6. Sayfayı yenile: oyun kaldığı yerden devam ediyor.
7. Oyunu bitir (kazan veya kaybet), mesaj çıkıyor, "Yeni oyun" çalışıyor.
8. Öğleden sonra bloğu açıldığında oyun tekrar kilitleniyor.
9. Konsolda hata yok.

Neyi doğrulayamadığını açıkça yaz.

---

## Kapsam dışı

| İş | Faz |
|---|---|
| Satranç taş öğretme modu | 1G |
| Ebeveyn paneli, ısı haritası, günlük, PDF | 1H |
| İçerik taşıma, sohbet, v1 devri | 1I |
| Oyun için yıldız veya süre ödülü | Yok. Oyun ödülün kendisi; puanlamak onu göreve çevirir |
