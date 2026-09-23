# Ingilizce Modulu Faz 0-1 Uygulama Plani

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ders sekmesine calisan bir Ingilizce bolumu ve ~120 kelimelik, iki yonlu, gorselli, sesli bir sozluk eklemek.

**Architecture:** Matematik modulunun katman duzenini aynen izler: saf veri (`data/`), saf motor (`engines/`), saf sunum modeli (`views/`), DOM (`ui/`), olay baglama (`main.js`). Takvim matematikle PAYLASILIR. Ilerleme ayri depoda (`ataol2:ingilizce`) ama alan adlari ayni, boylece `quizBitir`/`sinavBitir`/`tamPuanIsaretle`/`yildizVer` aynen tekrar kullanilir.

**Tech Stack:** Bagimliliksiz ES modulleri, derleme adimi yok. Test: `node --test`. Ses: Google Cloud Chirp 3 HD (tr-TR ve en-US).

**Spec:** `docs/2026-09-23-ingilizce-modulu-tasarim.md`

**Dal:** `feat/ingilizce-modulu`

## Global Constraints

- **Bagimlilik yok, derleme adimi yok, `node_modules` yok.** Tek npm betigi `test`.
- **Yorumlar ve tanimlayicilar ASCII.** Turkce diakritiksiz yazilir (`cizgi`, `dogru`, `gorsel`).
- **Cocugun GORDUGU her metin tam Turkce diakritikli.** `tests/architecture.test.js` bunu tuval metinlerinde otomatik yakaliyor.
- **Bagimlilik yonu:** hicbir saf katman (`core/`, `engines/`, `views/`) `ui/` veya `views/` icinden ithal edemez. `tests/architecture.test.js` olcuyor.
- **`engines/` saf kalir:** `Date.now()` yok, argumansiz `new Date()` yok, `Math.random()` yok, DOM yok.
- **Her yerde yasak:** `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, `srcdoc`.
- **`el()` beyaz liste disindaki oznitelikte ATAR** ve `Object.entries` ile doner, yani `undefined` degerli beyaz listedeki anahtar bile attirir. `data-*` `dataset` ile gecer.
- **`tests/i18n.test.js` yalnizca `tr` ve `en` bloklarinin anahtar KUMESINI karsilastirir.** Tek blok icindeki tekrari goremez; yeni anahtar eklemeden once elle kontrol et.
- **Her test isirmali.** Korudugu seyi mutasyona ugrat, KIRMIZI gor, geri al, YESIL gor. Raporunda ne mutasyona ugrattigini ve ne gordugunu yaz.
- **Kirmizi suite asla commit edilmez.** Baslangic: **761 test, 0 hata**.
- **Yildiz hafta basina 13:** kelime 4 + dinle 3 + soyle 0 + cumle 0 + quiz 6. Tema sinavi 15. Matematikle ayni (bkz. spec D12).

---

## Dosya yapisi

| Dosya | Sorumluluk |
|---|---|
| `src/data/ingilizce/temalar.js` | 8 temanin adi, hafta araligi, kazanim kodlari |
| `src/data/ingilizce/sozluk/tema1.js` | 1. temanin kelimeleri |
| `src/data/ingilizce/sozluk/index.js` | Birlestirilmis `SOZLUK` dizisi |
| `src/engines/ingilizce/sozluk.js` | `normalize`, `kelimeKimligi`, `ara` |
| `src/engines/ingilizce/ders.js` | `bosIngHafta`, `ingHaftaKaydi`, `ingHaftaDurumu`, `ING_ASAMALAR`, `ING_YILDIZ` |
| `src/views/ingilizce.js` | `temaBul`, `haftaninTemasi`, `sozlukSonucModeli` |
| `src/ui/sozluk-dom.js` | Sozluk arama ekrani |
| `src/core/state.js` | `loadIngilizce` / `saveIngilizce` |
| `src/main.js` | Ders secici, sozluk olaylari |

---

## Task 1: Tema verisi ve paylasilan takvim

**Files:**
- Create: `src/data/ingilizce/temalar.js`
- Test: `tests/ingilizce-temalar.test.js`

**Interfaces:**
- Consumes: `TAKVIM` (`src/data/mufredat.js`) - `[{ hafta, bas, bit, unite, dersler }]`
- Produces:
  - `TEMALAR` -> `Array<{ no, ad: { en, tr }, haftalar: number[], kazanimlar: string[] }>`
  - `TEMA_IDLERI` -> `number[]` (1..8)

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-temalar.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMALAR, TEMA_IDLERI } from '../src/data/ingilizce/temalar.js';
import { TAKVIM } from '../src/data/mufredat.js';

test('sekiz tema var ve numaralari 1..8', () => {
  assert.equal(TEMALAR.length, 8);
  assert.deepEqual(TEMALAR.map((t) => t.no), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(TEMA_IDLERI, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('temalarin haftalari MEB planiyla birebir', () => {
  const beklenen = {
    1: [4, 5, 6, 7],
    2: [8, 9, 10, 11, 12],
    3: [13, 14, 15, 16],
    4: [17, 18, 19, 20],
    5: [21, 22, 23, 24],
    6: [25, 26, 27, 28],
    7: [29, 30, 31, 32],
    8: [33, 34, 35, 36, 37]
  };
  for (const t of TEMALAR) {
    assert.deepEqual(t.haftalar, beklenen[t.no], `tema ${t.no} haftalari yanlis`);
  }
});

test('hafta 1-3 hicbir temaya ait degil (oryantasyon ve tekrar)', () => {
  const kapsanan = new Set(TEMALAR.flatMap((t) => t.haftalar));
  for (const h of [1, 2, 3]) {
    assert.ok(!kapsanan.has(h), `hafta ${h} temaya baglanmamali`);
  }
});

test('her hafta EN FAZLA bir temaya ait', () => {
  const sayac = new Map();
  for (const t of TEMALAR) {
    for (const h of t.haftalar) sayac.set(h, (sayac.get(h) ?? 0) + 1);
  }
  for (const [h, n] of sayac) {
    assert.equal(n, 1, `hafta ${h} ${n} temaya birden bagli`);
  }
});

test('her tema haftasi paylasilan TAKVIM icinde var', () => {
  const takvimHaftalari = new Set(TAKVIM.map((h) => h.hafta));
  for (const t of TEMALAR) {
    for (const h of t.haftalar) {
      assert.ok(takvimHaftalari.has(h), `hafta ${h} TAKVIM'de yok`);
    }
  }
});

test('4..37 arasi her hafta bir temaya ait, bosluk yok', () => {
  const kapsanan = new Set(TEMALAR.flatMap((t) => t.haftalar));
  for (let h = 4; h <= 37; h++) {
    assert.ok(kapsanan.has(h), `hafta ${h} hicbir temaya ait degil`);
  }
});

test('her temanin dort kazanim kodu var', () => {
  for (const t of TEMALAR) {
    assert.equal(t.kazanimlar.length, 4, `tema ${t.no}`);
    for (const k of t.kazanimlar) {
      assert.match(k, /^ENG\.5\.\d\.L[1-4]$/, `gecersiz kod: ${k}`);
    }
  }
});

test('tema adlari iki dilli ve bos degil', () => {
  for (const t of TEMALAR) {
    assert.ok(t.ad.en.trim().length > 0, `tema ${t.no} en adi bos`);
    assert.ok(t.ad.tr.trim().length > 0, `tema ${t.no} tr adi bos`);
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-temalar.test.js`
Expected: FAIL, "Cannot find module '../src/data/ingilizce/temalar.js'"

- [ ] **Step 3: Veriyi yaz**

```js
// src/data/ingilizce/temalar.js
/**
 * 5. sinif Ingilizce mufredatinin sekiz temasi.
 *
 * Kaynak: MEB 2026-2027 "INGILIZCE (5.SINIF) TASLAK YILLIK CERCEVE PLAN".
 * Hafta numaralari ve tarihler matematik modulundeki TAKVIM ile BIREBIR
 * ayni cikti; bu yuzden burada tarih TUTULMUYOR, yalnizca hafta numarasi.
 * Iki takvim kopyasi olsaydi biri duzeltilip digeri unutuldugunda cocuk
 * iki derste farkli hafta gorurdu.
 *
 * Hafta 1 oryantasyon, 2-3 tekrar: hicbir temaya bagli degil.
 */

export const TEMALAR = [
  {
    no: 1,
    ad: { en: 'School Life', tr: 'Okul Hayatı' },
    haftalar: [4, 5, 6, 7],
    kazanimlar: ['ENG.5.1.L1', 'ENG.5.1.L2', 'ENG.5.1.L3', 'ENG.5.1.L4']
  },
  {
    no: 2,
    ad: { en: 'Classroom Life', tr: 'Sınıf Hayatı' },
    haftalar: [8, 9, 10, 11, 12],
    kazanimlar: ['ENG.5.2.L1', 'ENG.5.2.L2', 'ENG.5.2.L3', 'ENG.5.2.L4']
  },
  {
    no: 3,
    ad: { en: 'Personal Life', tr: 'Kişisel Hayat' },
    haftalar: [13, 14, 15, 16],
    kazanimlar: ['ENG.5.3.L1', 'ENG.5.3.L2', 'ENG.5.3.L3', 'ENG.5.3.L4']
  },
  {
    no: 4,
    ad: { en: 'Family Life', tr: 'Aile Hayatı' },
    haftalar: [17, 18, 19, 20],
    kazanimlar: ['ENG.5.4.L1', 'ENG.5.4.L2', 'ENG.5.4.L3', 'ENG.5.4.L4']
  },
  {
    no: 5,
    ad: { en: 'Life in the Neighbourhood and City', tr: 'Mahalle ve Şehir Hayatı' },
    haftalar: [21, 22, 23, 24],
    kazanimlar: ['ENG.5.5.L1', 'ENG.5.5.L2', 'ENG.5.5.L3', 'ENG.5.5.L4']
  },
  {
    no: 6,
    ad: { en: 'Life in the World', tr: 'Dünyada Hayat' },
    haftalar: [25, 26, 27, 28],
    kazanimlar: ['ENG.5.6.L1', 'ENG.5.6.L2', 'ENG.5.6.L3', 'ENG.5.6.L4']
  },
  {
    no: 7,
    ad: { en: 'Life in Nature', tr: 'Doğada Hayat' },
    haftalar: [29, 30, 31, 32],
    kazanimlar: ['ENG.5.7.L1', 'ENG.5.7.L2', 'ENG.5.7.L3', 'ENG.5.7.L4']
  },
  {
    no: 8,
    ad: { en: 'Life in the Universe and Future', tr: 'Evrende Hayat ve Gelecek' },
    haftalar: [33, 34, 35, 36, 37],
    kazanimlar: ['ENG.5.8.L1', 'ENG.5.8.L2', 'ENG.5.8.L3', 'ENG.5.8.L4']
  }
];

export const TEMA_IDLERI = TEMALAR.map((t) => t.no);
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-temalar.test.js`
Expected: PASS, 8 test

- [ ] **Step 5: Mutasyonla kaniti al**

`TEMALAR[1].haftalar` icinden `9`u cikar. `node --test tests/ingilizce-temalar.test.js` KIRMIZI olmali ("tema 2 haftalari yanlis" VE "hafta 9 hicbir temaya ait degil"). Geri al, YESIL gor. Raporunda yaz.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/data/ingilizce/temalar.js tests/ingilizce-temalar.test.js
git commit -m "feat(ingilizce): sekiz tema ve hafta eslemesi

Hafta numaralari MEB planindan cikarildi. Tarih TUTULMUYOR: Ingilizce
takvimi matematikle birebir ayni, TAKVIM tek kaynak olarak paylasiliyor.

Testler bosluk ve cakisma ariyor: 4-37 arasi her hafta tam bir temaya
ait olmali. Elle yazilan bir tabloda en kolay kacirilan hata bu.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Kelime kimligi ve Turkce normalizasyon

**Files:**
- Create: `src/engines/ingilizce/sozluk.js`
- Test: `tests/ingilizce-normalize.test.js`

**Interfaces:**
- Produces:
  - `kelimeKimligi(en)` -> string (`'school bag'` -> `'school-bag'`)
  - `normalize(metin)` -> string (diakritiksiz, kucuk harf)

**NEDEN AYRI GOREV:** Normalizasyon Turkce'ye ozgu bir tuzak tasiyor ve
sozluk aramasinin tamami buna dayaniyor. Once bunu saglama alip sonra
arama yazilacak.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-normalize.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';

test('Turkce diakritikler duz harfe iner', () => {
  assert.equal(normalize('çanta'), 'canta');
  assert.equal(normalize('öğretmen'), 'ogretmen');
  assert.equal(normalize('şişe'), 'sise');
  assert.equal(normalize('ılık'), 'ilik');
  assert.equal(normalize('üzüm'), 'uzum');
  assert.equal(normalize('ğ'), 'g');
});

test('buyuk I ve noktali I Turkce kurala gore iner', () => {
  // toLowerCase() 'I' -> 'i' yapar; Turkce'de 'I'nin kucugu 'ı'dir.
  // toLocaleLowerCase('tr') kullanilmazsa 'IŞIK' -> 'isik' yerine
  // 'ışık' -> normalize 'isik' ile eslesmez.
  assert.equal(normalize('IŞIK'), normalize('ışık'));
  assert.equal(normalize('İSTANBUL'), normalize('istanbul'));
  assert.equal(normalize('Iyi'), normalize('ıyi'));
});

test('bastaki ve sondaki bosluk atilir, ic bosluk korunur', () => {
  assert.equal(normalize('  school bag  '), 'school bag');
});

test('normalize bos ve gecersiz girdide cokmez', () => {
  assert.equal(normalize(''), '');
  assert.equal(normalize(null), '');
  assert.equal(normalize(undefined), '');
  assert.equal(normalize(42), '42');
});

test('kelimeKimligi bosluklari tire yapar ve kucultur', () => {
  assert.equal(kelimeKimligi('school bag'), 'school-bag');
  assert.equal(kelimeKimligi('Science'), 'science');
  assert.equal(kelimeKimligi('go to school'), 'go-to-school');
});

test('kelimeKimligi noktalama ve apostrofu atar', () => {
  assert.equal(kelimeKimligi("What's your name?"), 'whats-your-name');
  assert.equal(kelimeKimligi('P.E.'), 'pe');
});

test('kelimeKimligi dosya adi olarak guvenli', () => {
  for (const ham of ['school bag', "What's your name?", 'P.E.', 'Maths / Science']) {
    const id = kelimeKimligi(ham);
    assert.match(id, /^[a-z0-9-]+$/, `${ham} -> ${id} dosya adi olarak guvensiz`);
    assert.ok(!id.startsWith('-') && !id.endsWith('-'), `${id} tire ile baslayip bitmemeli`);
    assert.ok(!id.includes('--'), `${id} cift tire icermemeli`);
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-normalize.test.js`
Expected: FAIL, modul yok

- [ ] **Step 3: Uygula**

```js
// src/engines/ingilizce/sozluk.js
/**
 * Sozluk motoru. Saf: DOM yok, saat yok, rastgele yok.
 */

// Turkce'ye ozgu harfler ve duz karsiliklari.
const DUZ = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u'
};

/**
 * Aramada karsilastirilacak bicime indirger.
 *
 * On yasindaki bir cocuk telefonda "canta" yazar, "çanta" degil. Bu
 * yuzden diakritikler yok sayilir.
 *
 * toLocaleLowerCase('tr') SART: duz toLowerCase() 'I' harfini 'i' yapar
 * ama Turkce'de 'I'nin kucugu 'ı'dir. Bu fark yuzunden 'IŞIK' ile 'ışık'
 * farkli normalize edilir ve cocuk kendi yazdigini bulamaz.
 */
export function normalize(metin) {
  if (metin === null || metin === undefined) return '';
  return String(metin)
    .toLocaleLowerCase('tr')
    .replace(/[çğıiöşüâîû]/g, (h) => DUZ[h] ?? h)
    .trim();
}

/**
 * Kelimenin kalici kimligi. Ses dosyasi adi da bundan turetilir
 * (sesler/en/<id>.mp3), yani dosya adi olarak GUVENLI olmali.
 */
export function kelimeKimligi(en) {
  return normalize(en)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-normalize.test.js`
Expected: PASS, 7 test

- [ ] **Step 5: Mutasyonla kaniti al**

`toLocaleLowerCase('tr')` yerine `toLowerCase()` yaz. "buyuk I ve noktali I" testi KIRMIZI olmali. Geri al, YESIL gor. Raporuna yaz - bu testin varlik sebebi tam olarak bu satir.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/engines/ingilizce/sozluk.js tests/ingilizce-normalize.test.js
git commit -m "feat(ingilizce): kelime kimligi ve Turkce normalizasyon

Aramada diakritikler yok sayilir: cocuk telefonda 'canta' yazar.

toLocaleLowerCase('tr') kullaniliyor, duz toLowerCase() degil. Fark
kritik: toLowerCase 'I' harfini 'i' yapar ama Turkce'de 'I'nin kucugu
'ı'dir. Bu yuzden 'IŞIK' ile 'ışık' farkli normalize edilir ve cocuk
kendi yazdigini bulamaz. Testi var.

kelimeKimligi ses dosyasi adini da uretiyor, o yuzden ciktisi
[a-z0-9-] ile sinirli ve bu test ediliyor.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Iki yonlu arama

**Files:**
- Modify: `src/engines/ingilizce/sozluk.js`
- Test: `tests/ingilizce-arama.test.js`

**Interfaces:**
- Consumes: `normalize` (Task 2)
- Produces: `ara(sozluk, sorgu, { limit })` -> `Array<{ kelime, yon, skor }>`
  - `yon`: `'en-tr'` (Ingilizce tarafi eslesti) veya `'tr-en'` (Turkce tarafi eslesti)
  - `skor`: 4 tam eslesme, 3 bastan, 2 kelime sinirinda, 1 icinde

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-arama.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ara } from '../src/engines/ingilizce/sozluk.js';

const SOZLUK = [
  { id: 'bag', en: 'bag', tr: 'çanta', tema: 1 },
  { id: 'school-bag', en: 'school bag', tr: 'okul çantası', tema: 1 },
  { id: 'school', en: 'school', tr: 'okul', tema: 1 },
  { id: 'teacher', en: 'teacher', tr: 'öğretmen', tema: 1 },
  { id: 'book', en: 'book', tr: 'kitap', tema: 2 }
];

test('Ingilizce sorgu Ingilizce tarafindan bulur', () => {
  const s = ara(SOZLUK, 'bag');
  assert.ok(s.length >= 2, 'bag ve school bag gelmeli');
  assert.equal(s[0].kelime.id, 'bag', 'tam eslesme once gelmeli');
  assert.equal(s[0].yon, 'en-tr');
});

test('Turkce sorgu Turkce tarafindan bulur', () => {
  const s = ara(SOZLUK, 'okul');
  assert.ok(s.some((x) => x.kelime.id === 'school'));
  assert.equal(s.find((x) => x.kelime.id === 'school').yon, 'tr-en');
});

test('Turkce sorgu DIAKRITIKSIZ yazilinca da bulur', () => {
  const diakritikli = ara(SOZLUK, 'çanta').map((x) => x.kelime.id);
  const duz = ara(SOZLUK, 'canta').map((x) => x.kelime.id);
  assert.deepEqual(duz, diakritikli, 'canta ile çanta ayni sonucu vermeli');
  assert.ok(duz.includes('bag'));
});

test('ogretmen diakritiksiz de bulunur', () => {
  assert.ok(ara(SOZLUK, 'ogretmen').some((x) => x.kelime.id === 'teacher'));
  assert.ok(ara(SOZLUK, 'öğretmen').some((x) => x.kelime.id === 'teacher'));
});

test('siralama: tam eslesme bastan eslesmeden once', () => {
  const s = ara(SOZLUK, 'school');
  assert.equal(s[0].kelime.id, 'school', 'tam eslesme "school" ilk olmali');
  const bag = s.findIndex((x) => x.kelime.id === 'school-bag');
  assert.ok(bag > 0, '"school bag" sonra gelmeli');
});

test('kelime sinirinda eslesme icinde gecmeden once', () => {
  const ek = [...SOZLUK, { id: 'preschool', en: 'preschool', tr: 'anaokulu', tema: 1 }];
  const s = ara(ek, 'school');
  const sinir = s.findIndex((x) => x.kelime.id === 'school-bag');
  const icinde = s.findIndex((x) => x.kelime.id === 'preschool');
  assert.ok(sinir < icinde, '"school bag" (kelime siniri) "preschool"dan (icinde) once gelmeli');
});

test('bos sorgu bos sonuc verir, tum sozlugu dokmez', () => {
  assert.deepEqual(ara(SOZLUK, ''), []);
  assert.deepEqual(ara(SOZLUK, '   '), []);
  assert.deepEqual(ara(SOZLUK, null), []);
});

test('eslesmeyen sorgu bos dizi verir, atmaz', () => {
  assert.deepEqual(ara(SOZLUK, 'zzzzz'), []);
});

test('limit uygulanir', () => {
  assert.equal(ara(SOZLUK, 'o', { limit: 2 }).length, 2);
});

test('ayni kelime iki yonden de eslesirse BIR KEZ doner', () => {
  const tek = [{ id: 'bus', en: 'bus', tr: 'bus durağı', tema: 5 }];
  const s = ara(tek, 'bus');
  assert.equal(s.length, 1, 'iki taraf da eslesse bile kelime bir kez listelenmeli');
});

test('sozluk bos ya da bozukken cokmez', () => {
  assert.deepEqual(ara([], 'bag'), []);
  assert.deepEqual(ara(null, 'bag'), []);
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-arama.test.js`
Expected: FAIL, "ara is not a function"

- [ ] **Step 3: Uygula**

`src/engines/ingilizce/sozluk.js` sonuna ekle:

```js
const SKOR = { tam: 4, bastan: 3, sinir: 2, icinde: 1 };

/**
 * Bir alanin sorguyla ne kadar iyi eslestigini puanlar. 0 = eslesmiyor.
 *
 * "Kelime siniri" ile "icinde gecen" AYRI puanlanir: 'school' sorgusu
 * icin 'school bag' (kelime basi) 'preschool'dan (ortasinda) daha
 * alakalidir ve once gelmelidir.
 */
function puanla(alan, sorgu) {
  const a = normalize(alan);
  if (!a) return 0;
  if (a === sorgu) return SKOR.tam;
  if (a.startsWith(sorgu)) return SKOR.bastan;
  if (a.includes(` ${sorgu}`)) return SKOR.sinir;
  if (a.includes(sorgu)) return SKOR.icinde;
  return 0;
}

/**
 * Sozlukte iki yonlu arama.
 *
 * Her kelime EN FAZLA BIR KEZ doner: iki taraf da eslesirse yuksek
 * puanli yon secilir. Ayni kelimeyi iki satirda gostermek cocuga iki
 * ayri kelime var gibi gelir.
 */
export function ara(sozluk, sorgu, { limit = 20 } = {}) {
  const s = normalize(sorgu);
  if (!s || !Array.isArray(sozluk)) return [];

  const sonuc = [];
  for (const kelime of sozluk) {
    const enSkor = puanla(kelime.en, s);
    const trSkor = puanla(kelime.tr, s);
    if (enSkor === 0 && trSkor === 0) continue;

    sonuc.push(enSkor >= trSkor
      ? { kelime, yon: 'en-tr', skor: enSkor }
      : { kelime, yon: 'tr-en', skor: trSkor });
  }

  // Esit puanda alfabetik: sonuc siralamasi girdi sirasina gore
  // degismesin, yoksa veri dosyasinda satir tasimak sonucu degistirir.
  sonuc.sort((a, b) => b.skor - a.skor || a.kelime.id.localeCompare(b.kelime.id));
  return sonuc.slice(0, limit);
}
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-arama.test.js`
Expected: PASS, 11 test

- [ ] **Step 5: Mutasyonla kaniti al, UC kez**

1. `puanla` icinde `a.includes(\` ${sorgu}\`)` satirini sil -> "kelime sinirinda eslesme" testi KIRMIZI.
2. `enSkor >= trSkor` yerine iki ayri kayit push et -> "ayni kelime BIR KEZ doner" KIRMIZI.
3. `normalize(sorgu)` yerine ham `sorgu` kullan -> "diakritiksiz de bulur" KIRMIZI.

Her birinde geri al ve YESIL gor. Ucunu de raporuna yaz.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/engines/ingilizce/sozluk.js tests/ingilizce-arama.test.js
git commit -m "feat(ingilizce): iki yonlu sozluk aramasi

Sorgu hem Ingilizce hem Turkce tarafta aranir ve her sonuc hangi yonden
eslestigini tasir; ekran dogru tarafi vurgulayabilsin diye.

Kelime siniri ile icinde gecen AYRI puanlanir: 'school' sorgusunda
'school bag' 'preschool'dan daha alakali.

Ayni kelime iki taraftan da eslesse bile BIR KEZ doner. Iki satirda
gostermek cocuga iki ayri kelime var gibi gelir.

Esit puanda alfabetik siralanir; yoksa veri dosyasinda satir tasimak
arama sonucunu degistirirdi.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 1. tema kelimeleri

**Files:**
- Create: `src/data/ingilizce/sozluk/tema1.js`
- Create: `src/data/ingilizce/sozluk/index.js`
- Test: `tests/ingilizce-sozluk-veri.test.js`

**Interfaces:**
- Consumes: `kelimeKimligi` (Task 2), `TEMA_IDLERI` (Task 1)
- Produces: `SOZLUK` -> `Array<{ id, en, tr, tema, tur, gorsel, ornek }>`

**KAPSAM:** 1. tema (School Life) icin **en az 40 kelime**. Alt temalar:
okuldaki kisiler, yerler ve kurallar; okul kulupleri; ulkeler; milli gunler.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-sozluk-veri.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';
import { TEMA_IDLERI } from '../src/data/ingilizce/temalar.js';

test('1. temada en az 40 kelime var', () => {
  const t1 = SOZLUK.filter((k) => k.tema === 1);
  assert.ok(t1.length >= 40, `1. temada ${t1.length} kelime var, en az 40 olmali`);
});

test('kelime idleri benzersiz', () => {
  const ids = SOZLUK.map((k) => k.id);
  const tekrar = ids.filter((x, i) => ids.indexOf(x) !== i);
  assert.deepEqual(tekrar, [], `tekrar eden id: ${tekrar.join(', ')}`);
});

test('her id kendi Ingilizcesinden turetilmis', () => {
  for (const k of SOZLUK) {
    assert.equal(k.id, kelimeKimligi(k.en),
      `${k.en} icin id "${k.id}" olmali ama "${kelimeKimligi(k.en)}" bekleniyordu`);
  }
});

test('her kelimenin tr, tema, tur, gorsel ve ornegi var', () => {
  const TURLER = ['isim', 'fiil', 'sifat', 'edat', 'ifade'];
  for (const k of SOZLUK) {
    assert.ok(k.tr.trim().length > 0, `${k.id} tr bos`);
    assert.ok(TEMA_IDLERI.includes(k.tema), `${k.id} gecersiz tema: ${k.tema}`);
    assert.ok(TURLER.includes(k.tur), `${k.id} gecersiz tur: ${k.tur}`);
    assert.ok(k.gorsel && ['emoji', 'cizim'].includes(k.gorsel.tip),
      `${k.id} gorsel tipi gecersiz`);
    assert.ok(k.gorsel.deger || k.gorsel.ad, `${k.id} gorsel degeri bos`);
    assert.ok(k.ornek.en.trim().length > 0, `${k.id} ornek.en bos`);
    assert.ok(k.ornek.tr.trim().length > 0, `${k.id} ornek.tr bos`);
  }
});

test('ornek cumle kelimeyi GERCEKTEN iceriyor', () => {
  for (const k of SOZLUK) {
    const c = k.ornek.en.toLowerCase();
    const kel = k.en.toLowerCase();
    // Cogul ve cekim icin ilk kelimeyi arar; "bag" -> "bags" de gecerli.
    const kok = kel.split(' ')[0];
    assert.ok(c.includes(kok),
      `${k.id}: ornek cumle "${k.ornek.en}" kelimeyi ("${k.en}") icermiyor`);
  }
});

test('Turkce alanlar diakritiklerini korumus', () => {
  // Ingilizce karsiliklari diakritik gerektiren kelimeler duz yazilmis
  // olmamali; cocuk yanlis yazimi ogrenir.
  const SUPHELI = ['ogretmen', 'ogrenci', 'canta', 'kutuphane', 'mudur', 'kulup'];
  for (const k of SOZLUK) {
    for (const s of SUPHELI) {
      assert.ok(!k.tr.toLowerCase().includes(s),
        `${k.id}: tr alani diakritiksiz "${s}" iceriyor -> "${k.tr}"`);
    }
  }
});

test('emoji gorseller gercekten tek bir emoji', () => {
  for (const k of SOZLUK) {
    if (k.gorsel.tip !== 'emoji') continue;
    assert.ok(k.gorsel.deger.length > 0 && k.gorsel.deger.length <= 8,
      `${k.id}: emoji "${k.gorsel.deger}" fazla uzun, metin olabilir`);
    assert.ok(!/^[a-zA-Z0-9]+$/.test(k.gorsel.deger),
      `${k.id}: emoji alani duz metin iceriyor: "${k.gorsel.deger}"`);
  }
});

test('TTS'in okuyamayacagi sembol yok', () => {
  for (const k of SOZLUK) {
    for (const [ad, metin] of [['en', k.en], ['ornek.en', k.ornek.en], ['ornek.tr', k.ornek.tr]]) {
      assert.ok(!/[°×÷≠≤≥→←]/.test(metin), `${k.id} ${ad}: TTS okuyamaz -> ${metin}`);
    }
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-sozluk-veri.test.js`
Expected: FAIL, modul yok

- [ ] **Step 3: Kelimeleri yaz**

`src/data/ingilizce/sozluk/tema1.js` - **en az 40 kelime**, su alt temalari
kapsayacak sekilde dagit:
- Okuldaki kisiler: teacher, student, principal, classmate, friend, caretaker
- Okuldaki yerler: school, classroom, library, canteen, playground, gym, laboratory, corridor
- Okul esyalari: school bag, book, notebook, pencil, pen, eraser, ruler
- Kurallar: rule, listen, speak, run, be quiet, be on time, raise your hand
- Kulupler: club, music club, chess club, drama club, sports club, art club
- Ulkeler: country, Turkiye, England, Germany, France, Italy, Spain
- Milli gunler: national day, flag, celebration, ceremony, holiday

Kalip (ilk uc ornek, kalani ayni bicimde):

```js
// src/data/ingilizce/sozluk/tema1.js
/**
 * THEME 1: SCHOOL LIFE kelimeleri.
 *
 * Alt temalar (MEB plani): okuldaki kisiler, yerler ve kurallar; okul
 * kulupleri; ulkeler; milli gunler ve kutlamalar.
 *
 * id alani en alanindan kelimeKimligi() ile turetilir ama BURAYA YAZILIR:
 * boylece bir yazim duzeltilse bile ses dosyasi adi ve cocugun ilerlemesi
 * kopmaz. Testi bu tutarliligi kontrol ediyor.
 *
 * gorsel.tip 'emoji' ise deger dogrudan basilir; 'cizim' ise ad
 * src/ui/gorsel/ingilizce.js icindeki kayit defterine bakar.
 */

export default [
  {
    id: 'teacher', en: 'teacher', tr: 'öğretmen', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '👩‍🏫' },
    ornek: { en: 'My teacher is very kind.', tr: 'Öğretmenim çok nazik.' }
  },
  {
    id: 'school-bag', en: 'school bag', tr: 'okul çantası', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '🎒' },
    ornek: { en: 'My school bag is red.', tr: 'Okul çantam kırmızı.' }
  },
  {
    id: 'raise-your-hand', en: 'raise your hand', tr: 'elini kaldır', tema: 1, tur: 'ifade',
    gorsel: { tip: 'cizim', ad: 'el-kaldir' },
    ornek: { en: 'Raise your hand before you speak.', tr: 'Konuşmadan önce elini kaldır.' }
  }
  // ... en az 40 kayit
];
```

```js
// src/data/ingilizce/sozluk/index.js
/**
 * Birlestirilmis sozluk. Tema dosyalari buraya eklenir; arama ve
 * ders ekranlari yalnizca bu diziyi gorur.
 */

import tema1 from './tema1.js';

export const SOZLUK = [...tema1];
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-sozluk-veri.test.js`
Expected: PASS, 8 test

- [ ] **Step 5: Emoji kapsamini OLC ve raporla**

```bash
node --input-type=module -e "
import { SOZLUK } from './src/data/ingilizce/sozluk/index.js';
const e = SOZLUK.filter(k => k.gorsel.tip === 'emoji').length;
console.log('emoji:', e, '/ toplam:', SOZLUK.length, '=', Math.round(e/SOZLUK.length*100) + '%');
console.log('cizim gerekenler:', SOZLUK.filter(k=>k.gorsel.tip==='cizim').map(k=>k.gorsel.ad).join(', '));
"
```

Cikan sayiyi raporuna YAZ. Spec'te "~450/700 emoji" diye bir TAHMIN var;
bu adimin amaci o tahmini gercek olcumle degistirmek.

- [ ] **Step 6: Mutasyonla kaniti al**

Bir kelimenin `id` alanini elle boz (`'teacher'` -> `'teachers'`).
"her id kendi Ingilizcesinden turetilmis" KIRMIZI olmali. Geri al.

Bir ornek cumleden kelimeyi cikar. "ornek cumle kelimeyi GERCEKTEN
iceriyor" KIRMIZI olmali. Geri al.

- [ ] **Step 7: Tam suite ve commit**

```bash
npm test
git add src/data/ingilizce/sozluk/ tests/ingilizce-sozluk-veri.test.js
git commit -m "feat(ingilizce): 1. tema kelimeleri

THEME 1 SCHOOL LIFE: okuldaki kisiler, yerler, kurallar, kulupler,
ulkeler ve milli gunler.

id alani kelimeden turetilir ama dosyaya YAZILIR; boylece bir yazim
duzeltilse bile ses dosyasi adi ve cocugun ilerlemesi kopmaz. Test
ikisinin tutarliligini kontrol ediyor.

Testler icerik dogruluyor, sekil degil: ornek cumle kelimeyi gercekten
iceriyor mu, Turkce alanlar diakritiklerini korumus mu, emoji alanina
duz metin sizmis mi.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Ilerleme deposu

**Files:**
- Modify: `src/core/state.js`
- Test: `tests/ingilizce-state.test.js`

**Interfaces:**
- Produces: `state.loadIngilizce()` / `state.saveIngilizce(ilerleme)`
  - Sekil: `{ haftalar: {}, sinavlar: {} }`

**NEDEN AYRI DEPO:** Matematik deposu (`ataol2:ders`) su an canlida ve
Deha'nin gercek yildizlarini tutuyor. Sekilini degistirmek o ilerlemeyi
riske atar. Ayri depo katkisaldir ve var olani bozamaz.

**AYARLAR ORTAK KALIR:** `sesAcik`, `otomatikOynat`, `sabitHafta`,
`sesliCevap` `ataol2:ders` icindeki `ayar` alaninda kalir. Ebeveyn sesi
iki kez kapatmak zorunda olmamali; sabit hafta tek takvim icin tek olmali.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/core/state.js';

function sahteDepo(baslangic = {}) {
  const veri = { ...baslangic };
  return {
    get: (k, v) => (k in veri ? veri[k] : v),
    set: (k, v) => { veri[k] = v; },
    _veri: veri
  };
}

test('bos depoda varsayilan sekil doner', () => {
  const s = createState(sahteDepo());
  assert.deepEqual(s.loadIngilizce(), { haftalar: {}, sinavlar: {} });
});

test('kaydedilen ilerleme geri okunur', () => {
  const depo = sahteDepo();
  const s = createState(depo);
  s.saveIngilizce({ haftalar: { '4': { quiz: { enIyi: 80, denemeler: 1 } } }, sinavlar: {} });
  assert.equal(s.loadIngilizce().haftalar['4'].quiz.enIyi, 80);
});

test('bozuk kayit varsayilana duser, atmaz', () => {
  for (const bozuk of [null, 'metin', 42, [], true]) {
    const s = createState(sahteDepo({ ingilizce: bozuk }));
    assert.deepEqual(s.loadIngilizce(), { haftalar: {}, sinavlar: {} },
      `${JSON.stringify(bozuk)} varsayilana dusmedi`);
  }
});

test('eksik alanlar tamamlanir', () => {
  const s = createState(sahteDepo({ ingilizce: { haftalar: { '4': {} } } }));
  const i = s.loadIngilizce();
  assert.deepEqual(i.sinavlar, {}, 'eksik sinavlar bos nesne olmali');
  assert.ok(i.haftalar['4']);
});

test('haftalar ve sinavlar dizi ise nesneye cevrilir', () => {
  const s = createState(sahteDepo({ ingilizce: { haftalar: [], sinavlar: [] } }));
  const i = s.loadIngilizce();
  assert.ok(!Array.isArray(i.haftalar), 'dizi haftalar nesneye cevrilmeli');
  assert.ok(!Array.isArray(i.sinavlar), 'dizi sinavlar nesneye cevrilmeli');
});

test('Ingilizce deposu matematik deposunu BOZMAZ', () => {
  const depo = sahteDepo({ ders: { haftalar: { '1': { quiz: { enIyi: 100 } } }, sinavlar: {}, ayar: {} } });
  const s = createState(depo);
  s.saveIngilizce({ haftalar: { '4': {} }, sinavlar: {} });
  assert.equal(s.loadDersIlerleme().haftalar['1'].quiz.enIyi, 100,
    'matematik ilerlemesi Ingilizce yazildiktan sonra da durmali');
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-state.test.js`
Expected: FAIL, "loadIngilizce is not a function"

- [ ] **Step 3: Uygula**

`src/core/state.js` icinde `saveDersIlerleme`den hemen sonra:

```js
    /**
     * Ingilizce ilerlemesi AYRI depoda durur.
     *
     * Matematik deposu (ataol2:ders) canlida ve cocugun gercek
     * yildizlarini tutuyor; sekline dokunmak onu riske atar. Ayri depo
     * katkisaldir ve var olani bozamaz.
     *
     * Alan adlari matematikle ayni (haftalar, sinavlar) cunku quizBitir,
     * sinavBitir, tamPuanIsaretle ve yildizVer aynen tekrar kullaniliyor.
     *
     * AYARLAR BURADA DEGIL: sesAcik/otomatikOynat/sabitHafta/sesliCevap
     * ataol2:ders icindeki ayar alaninda kalir. Ebeveyn sesi iki kez
     * kapatmak zorunda olmamali.
     */
    loadIngilizce() {
      const bos = { haftalar: {}, sinavlar: {} };
      const kayit = storage.get('ingilizce', null);
      if (!kayit || typeof kayit !== 'object' || Array.isArray(kayit)) return bos;

      const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
      return {
        haftalar: nesne(kayit.haftalar),
        sinavlar: nesne(kayit.sinavlar)
      };
    },

    saveIngilizce(ilerleme) {
      storage.set('ingilizce', ilerleme);
    },
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-state.test.js`
Expected: PASS, 6 test

- [ ] **Step 5: Mutasyonla kaniti al**

`nesne()` sarmalayicisini kaldirip `kayit.haftalar ?? {}` yaz. "dizi ise
nesneye cevrilir" KIRMIZI olmali. Geri al, YESIL gor.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/core/state.js tests/ingilizce-state.test.js
git commit -m "feat(ingilizce): ayri ilerleme deposu

Matematik deposu canlida ve Deha'nin gercek yildizlarini tutuyor;
sekline dokunmak onu riske atar. Ayri depo katkisal, var olani bozamaz
ve testi bunu dogruluyor.

Alan adlari matematikle ayni cunku quizBitir, sinavBitir,
tamPuanIsaretle ve yildizVer aynen tekrar kullanilacak.

Ayarlar ORTAK kaliyor: ebeveyn sesi iki kez kapatmak zorunda olmamali,
sabit hafta tek takvim icin tek olmali.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Sunum modeli

**Files:**
- Create: `src/views/ingilizce.js`
- Test: `tests/ingilizce-view.test.js`

**Interfaces:**
- Consumes: `TEMALAR` (Task 1), `SOZLUK` (Task 4), `ara` (Task 3), `TAKVIM`
- Produces:
  - `haftaninTemasi(temalar, haftaNo)` -> tema nesnesi veya `null`
  - `sozlukModeli(sozluk, sorgu)` -> `{ sorgu, sonuclar, bos, mesajAnahtari }`

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-view.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haftaninTemasi, sozlukModeli } from '../src/views/ingilizce.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';

const SOZLUK = [
  { id: 'bag', en: 'bag', tr: 'çanta', tema: 1, tur: 'isim',
    gorsel: { tip: 'emoji', deger: '👜' }, ornek: { en: 'A bag.', tr: 'Bir çanta.' } }
];

test('tema haftasi dogru temayi verir', () => {
  assert.equal(haftaninTemasi(TEMALAR, 4).no, 1);
  assert.equal(haftaninTemasi(TEMALAR, 12).no, 2);
  assert.equal(haftaninTemasi(TEMALAR, 37).no, 8);
});

test('temasiz haftalar null verir', () => {
  for (const h of [1, 2, 3]) {
    assert.equal(haftaninTemasi(TEMALAR, h), null, `hafta ${h} temasiz olmali`);
  }
});

test('gecersiz hafta numarasi null verir, atmaz', () => {
  assert.equal(haftaninTemasi(TEMALAR, 0), null);
  assert.equal(haftaninTemasi(TEMALAR, 99), null);
  assert.equal(haftaninTemasi(TEMALAR, null), null);
});

test('bos sorguda model bos ve ipucu mesaji tasir', () => {
  const m = sozlukModeli(SOZLUK, '');
  assert.equal(m.bos, true);
  assert.deepEqual(m.sonuclar, []);
  assert.equal(m.mesajAnahtari, 'sozluk.ipucu');
});

test('sonucsuz sorguda bulunamadi mesaji', () => {
  const m = sozlukModeli(SOZLUK, 'zzzz');
  assert.equal(m.bos, true);
  assert.equal(m.mesajAnahtari, 'sozluk.bulunamadi');
});

test('sonuclu sorguda mesaj YOK', () => {
  const m = sozlukModeli(SOZLUK, 'bag');
  assert.equal(m.bos, false);
  assert.equal(m.mesajAnahtari, null);
  assert.equal(m.sonuclar.length, 1);
});

test('sonuclar ekranin ihtiyaci olan her alani tasir', () => {
  const s = sozlukModeli(SOZLUK, 'bag').sonuclar[0];
  for (const alan of ['id', 'en', 'tr', 'tur', 'gorsel', 'ornek', 'yon']) {
    assert.ok(alan in s, `sonucta ${alan} yok`);
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-view.test.js`
Expected: FAIL, modul yok

- [ ] **Step 3: Uygula**

```js
// src/views/ingilizce.js
/**
 * Ingilizce ekranlarinin saf model katmani. DOM yok.
 *
 * Mesajlar ANAHTAR olarak doner, metin olarak degil: ceviri ui/
 * katmaninda yapilir, boylece bu dosya dilden bagimsiz kalir ve
 * test edilebilir.
 */

import { ara } from '../engines/ingilizce/sozluk.js';

export function haftaninTemasi(temalar, haftaNo) {
  if (!Number.isInteger(haftaNo)) return null;
  return temalar.find((t) => t.haftalar.includes(haftaNo)) ?? null;
}

export function sozlukModeli(sozluk, sorgu) {
  const sonuclar = ara(sozluk, sorgu).map((s) => ({ ...s.kelime, yon: s.yon }));
  const yazilmis = String(sorgu ?? '').trim().length > 0;

  return {
    sorgu: String(sorgu ?? ''),
    sonuclar,
    bos: sonuclar.length === 0,
    mesajAnahtari: sonuclar.length > 0
      ? null
      : (yazilmis ? 'sozluk.bulunamadi' : 'sozluk.ipucu')
  };
}
```

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-view.test.js`
Expected: PASS, 7 test

- [ ] **Step 5: Mutasyonla kaniti al**

`mesajAnahtari` icindeki `yazilmis` kontrolunu kaldirip her zaman
`'sozluk.bulunamadi'` dondur. "bos sorguda ipucu mesaji" KIRMIZI olmali.
Geri al, YESIL gor.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/views/ingilizce.js tests/ingilizce-view.test.js
git commit -m "feat(ingilizce): sunum modeli

haftaninTemasi ve sozlukModeli. Mesajlar ANAHTAR olarak doner, metin
olarak degil: ceviri ui/ katmaninda yapilir, boylece bu dosya dilden
bagimsiz kalir ve test edilebilir.

Bos sorgu ile sonucsuz sorgu AYRI mesaj veriyor: cocuk daha hicbir sey
yazmadiginda 'bulunamadi' demek yanlis olurdu.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Sozluk ekrani

**Files:**
- Create: `src/ui/sozluk-dom.js`
- Modify: `src/core/i18n.js`
- Test: `tests/sozluk-dom.test.js`

**Interfaces:**
- Consumes: `sozlukModeli` ciktisi (Task 6), `el`/`mount` (`src/ui/dom.js`)
- Produces: `sozlukEkrani(kok, model, ceviri)` -> void

- [ ] **Step 1: i18n anahtarlarini ekle**

`src/core/i18n.js`, `tr` blogunda `'ders.examNote'` satirindan SONRA:

```js
    'sozluk.baslik': 'Sözlük',
    'sozluk.ara': 'Kelime ara',
    'sozluk.ipucu': 'Türkçe ya da İngilizce yazabilirsin.',
    'sozluk.bulunamadi': 'Bu kelimeyi bulamadım. Başka türlü yazmayı dene.',
    'sozluk.sonucSayisi': '{n} sonuç',
    'sozluk.dinle': 'Dinle',
    'sozluk.tur.isim': 'isim',
    'sozluk.tur.fiil': 'fiil',
    'sozluk.tur.sifat': 'sıfat',
    'sozluk.tur.edat': 'edat',
    'sozluk.tur.ifade': 'ifade',
```

`en` blogunda ayni yere:

```js
    'sozluk.baslik': 'Dictionary',
    'sozluk.ara': 'Search a word',
    'sozluk.ipucu': 'You can type in Turkish or English.',
    'sozluk.bulunamadi': 'I could not find that word. Try spelling it differently.',
    'sozluk.sonucSayisi': '{n} results',
    'sozluk.dinle': 'Listen',
    'sozluk.tur.isim': 'noun',
    'sozluk.tur.fiil': 'verb',
    'sozluk.tur.sifat': 'adjective',
    'sozluk.tur.edat': 'preposition',
    'sozluk.tur.ifade': 'phrase',
```

**ONEMLI:** Eklemeden once `grep -c "'sozluk\." src/core/i18n.js` calistir;
`tests/i18n.test.js` tek blok icindeki TEKRARI goremez, sonradan eklenen
sessizce kazanir.

- [ ] **Step 2: Testi yaz**

```js
// tests/sozluk-dom.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sozlukEkrani } from '../src/ui/sozluk-dom.js';

function sahteDugum(etiket = 'div') {
  return {
    etiket, cocuklar: [], metin: '', sinif: '', nitelik: {}, veri: {},
    appendChild(c) { this.cocuklar.push(c); return c; },
    set textContent(v) { this.metin = v; },
    get textContent() { return this.metin; },
    set className(v) { this.sinif = v; },
    get className() { return this.sinif; },
    setAttribute(a, v) { this.nitelik[a] = v; },
    addEventListener() {},
    removeChild(c) { this.cocuklar = this.cocuklar.filter((x) => x !== c); },
    get firstChild() { return this.cocuklar[0] ?? null; },
    dataset: {}
  };
}

// Tum agaci duz metne cevirir; ne yazildigini kontrol etmek icin.
function metinler(d) {
  const c = d.metin ? [d.metin] : [];
  for (const k of d.cocuklar) c.push(...metinler(k));
  return c;
}

const ceviri = (k, p = {}) => (p.n !== undefined ? `${k}:${p.n}` : k);

const MODEL_DOLU = {
  sorgu: 'bag', bos: false, mesajAnahtari: null,
  sonuclar: [{
    id: 'bag', en: 'bag', tr: 'çanta', tur: 'isim', yon: 'en-tr',
    gorsel: { tip: 'emoji', deger: '👜' },
    ornek: { en: 'A bag.', tr: 'Bir çanta.' }
  }]
};

test('sonuclar ekrana Ingilizce ve Turkce karsilikla yazilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('bag'), 'Ingilizce kelime yazilmali');
  assert.ok(m.includes('çanta'), 'Turkce karsilik yazilmali');
});

test('ornek cumle iki dilde de gorunur', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('A bag.'), 'Ingilizce ornek yazilmali');
  assert.ok(m.includes('Bir çanta.'), 'Turkce ornek yazilmali');
});

test('emoji gorsel ekrana basilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  assert.ok(metinler(kok).includes('👜'), 'emoji basilmali');
});

test('bos sorguda ipucu mesaji gorunur, sonuc listesi degil', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, { sorgu: '', bos: true, mesajAnahtari: 'sozluk.ipucu', sonuclar: [] }, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('sozluk.ipucu'), 'ipucu mesaji gorunmeli');
  assert.ok(!m.includes('bag'), 'sonuc gorunmemeli');
});

test('bulunamadi mesaji gorunur', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, { sorgu: 'zzz', bos: true, mesajAnahtari: 'sozluk.bulunamadi', sonuclar: [] }, ceviri);
  assert.ok(metinler(kok).includes('sozluk.bulunamadi'));
});

test('sonuc sayisi gosterilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  assert.ok(metinler(kok).some((x) => x.startsWith('sozluk.sonucSayisi:1')));
});

test('her sonucun dinle dugmesi kelime id sini tasir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const bul = (d) => {
    if (d.dataset && d.dataset.sozlukDinle) return d.dataset.sozlukDinle;
    for (const k of d.cocuklar) { const r = bul(k); if (r) return r; }
    return null;
  };
  assert.equal(bul(kok), 'bag', 'dinle dugmesi kelime id tasimali');
});
```

- [ ] **Step 3: Testi calistir, KIRMIZI gor**

Run: `node --test tests/sozluk-dom.test.js`
Expected: FAIL, modul yok

- [ ] **Step 4: Uygula**

```js
// src/ui/sozluk-dom.js
/**
 * Sozluk ekrani.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer.
 */

import { el, mount } from './dom.js';

/**
 * Faz 1'de yalniz emoji gorseller ciziliyor. gorsel.tip === 'cizim' olan
 * kelimeler (in/on/under, timetable gibi soyut olanlar) gecici olarak
 * notr bir kitap simgesi gosteriyor.
 *
 * Bu BILINCLI bir eksiklik, unutulmus degil: tuval cizimleri Faz 2'de
 * src/ui/gorsel/ingilizce.js altina yazilacak ve buradaki dal oraya
 * baglanacak. Yedek simge konmasaydi kartin sol tarafi bos kalir ve
 * cocuk kartin yarisinin yuklenmedigini sanirdi.
 */
function sonucKarti(k, ceviri) {
  const gorsel = k.gorsel.tip === 'emoji'
    ? el('span', { className: 'sozluk__emoji', text: k.gorsel.deger })
    : el('span', { className: 'sozluk__emoji', text: '📘' });

  return el('div', { className: 'sozluk__kart' }, [
    gorsel,
    el('div', { className: 'sozluk__govde' }, [
      el('p', { className: 'sozluk__en', text: k.en }),
      el('p', { className: 'sozluk__tr', text: k.tr }),
      el('p', { className: 'sozluk__tur', text: ceviri(`sozluk.tur.${k.tur}`) }),
      el('p', { className: 'sozluk__ornek-en', text: k.ornek.en }),
      el('p', { className: 'sozluk__ornek-tr', text: k.ornek.tr })
    ]),
    el('button', {
      className: 'sozluk__dinle',
      text: ceviri('sozluk.dinle'),
      attrs: { type: 'button' },
      dataset: { sozlukDinle: k.id }
    })
  ]);
}

export function sozlukEkrani(kok, model, ceviri) {
  const parcalar = [
    el('h2', { className: 'sozluk__baslik', text: ceviri('sozluk.baslik') })
  ];

  if (model.bos) {
    parcalar.push(el('p', { className: 'sozluk__mesaj', text: ceviri(model.mesajAnahtari) }));
  } else {
    parcalar.push(el('p', {
      className: 'sozluk__sayi',
      text: ceviri('sozluk.sonucSayisi', { n: model.sonuclar.length })
    }));
    parcalar.push(el('div', { className: 'sozluk__liste' },
      model.sonuclar.map((k) => sonucKarti(k, ceviri))));
  }

  mount(kok, parcalar);
}
```

- [ ] **Step 5: Testi calistir, YESIL gor**

Run: `node --test tests/sozluk-dom.test.js`
Expected: PASS, 7 test

- [ ] **Step 6: Mutasyonla kaniti al**

`sonucKarti` icindeki `sozluk__ornek-tr` satirini sil. "ornek cumle iki
dilde de gorunur" KIRMIZI olmali. Geri al, YESIL gor.

`dataset: { sozlukDinle: k.id }` yerine sabit `'x'` yaz. "dinle dugmesi
kelime id sini tasir" KIRMIZI olmali. Geri al.

- [ ] **Step 7: Tam suite ve commit**

```bash
npm test
git add src/ui/sozluk-dom.js src/core/i18n.js tests/sozluk-dom.test.js
git commit -m "feat(ingilizce): sozluk ekrani

Her sonuc kartinda gorsel, Ingilizce kelime, Turkce karsilik, tur,
iki dilli ornek cumle ve dinle dugmesi var.

src/ui/ altinda daha once hic test yoktu; sahte DOM dugumuyle ne
YAZILDIGI kontrol ediliyor, yalnizca cagri sayisi degil.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Ders secici ve sozlugu baglama

**Files:**
- Modify: `src/main.js`
- Modify: `src/ui/ders-dom.js`
- Modify: `src/core/i18n.js`
- Modify: `styles-v2.css`
- Modify: `sw.js`
- Test: elle + tarayici (bkz. Step 6)

**Interfaces:**
- Consumes: `sozlukEkrani` (Task 7), `sozlukModeli` (Task 6), `SOZLUK` (Task 4), `state.loadIngilizce` (Task 5)
- Produces: Ders sekmesinde `[Matematik] [İngilizce] [Sözlük]` secici

- [ ] **Step 1: i18n anahtarlari**

`tr` blogu:

```js
    'ders.dersMatematik': 'Matematik',
    'ders.dersIngilizce': 'İngilizce',
    'ders.dersSozluk': 'Sözlük',
    'ders.ingilizceHazirlaniyor': 'İngilizce dersleri hazırlanıyor. Şimdilik sözlüğü kullanabilirsin.',
```

`en` blogu:

```js
    'ders.dersMatematik': 'Maths',
    'ders.dersIngilizce': 'English',
    'ders.dersSozluk': 'Dictionary',
    'ders.ingilizceHazirlaniyor': 'English lessons are being prepared. You can use the dictionary for now.',
```

- [ ] **Step 2: Secici bilesenini ders-dom.js icine ekle**

```js
/**
 * Ders secici. Alt menuye alti sekme koymak yerine burada seciliyor:
 * iPhone 12'de alti sekme her birini ~65px'e dusurur ve yazilar kirpilir.
 */
export function dersSecici(secili, ceviri) {
  const dugme = (id, anahtar) => el('button', {
    className: secili === id ? 'ders-secici__dugme ders-secici__dugme--secili' : 'ders-secici__dugme',
    text: ceviri(anahtar),
    attrs: { type: 'button' },
    dataset: { dersSec: id }
  });

  return el('div', { className: 'ders-secici' }, [
    dugme('matematik', 'ders.dersMatematik'),
    dugme('ingilizce', 'ders.dersIngilizce'),
    dugme('sozluk', 'ders.dersSozluk')
  ]);
}
```

- [ ] **Step 3: main.js modul durumu ve yonlendirme**

`let dersWidgetAnahtar = null;` satirinin yanina:

```js
// Hangi ders gosteriliyor: 'matematik' | 'ingilizce' | 'sozluk'.
// Depoya YAZILMAZ: her acilista matematikten baslar. Kalici olsaydi
// cocuk sozlukte birakip ertesi gun dersi bulamazdi.
let dersSecim = 'matematik';
let sozlukSorgu = '';
```

`renderDers()` fonksiyonunun EN BASINA:

```js
  if (dersSecim === 'sozluk') {
    const kok = document.getElementById('view-ders');
    mount(kok, [dersSecici(dersSecim, ceviri)]);
    const kutu = el('input', {
      className: 'sozluk__kutu',
      attrs: { type: 'text', id: 'sozluk-kutu', placeholder: ceviri('sozluk.ara'), value: sozlukSorgu }
    });
    kok.appendChild(kutu);
    const liste = el('div', { className: 'sozluk__alan' });
    kok.appendChild(liste);
    sozlukEkrani(liste, sozlukModeli(SOZLUK, sozlukSorgu), ceviri);
    return;
  }

  if (dersSecim === 'ingilizce') {
    const kok = document.getElementById('view-ders');
    mount(kok, [
      dersSecici(dersSecim, ceviri),
      el('div', { className: 'ders-kart ders-kart--bilgi' }, [
        el('p', { className: 'ders-kart__not', text: ceviri('ders.ingilizceHazirlaniyor') })
      ])
    ]);
    return;
  }
```

Matematik dalinda, `haftaEkrani(kok, dersModeli(), ceviri);` cagrisindan
SONRA seciciyi basa ekle:

```js
  kok.insertBefore(dersSecici(dersSecim, ceviri), kok.firstChild);
```

- [ ] **Step 4: Olaylari bagla**

Delege click dinleyicisine, `dersBasla` kontrolunden ONCE:

```js
  const dersSecDugme = e.target.closest('[data-ders-sec]');
  if (dersSecDugme) {
    dersSecim = dersSecDugme.dataset.dersSec;
    // Ekran degisiyor: matematigin acik widget'i ve AI metni birakilmali.
    dersWidgetKapat();
    dersAnlatimGorseliKapat();
    dersEkran = 'hafta';
    dersAiMetin = '';
    renderDers();
    return;
  }

  const sozlukDinleDugme = e.target.closest('[data-sozluk-dinle]');
  if (sozlukDinleDugme) {
    const id = sozlukDinleDugme.dataset.sozlukDinle;
    const kelime = SOZLUK.find((k) => k.id === id);
    if (kelime) ses.oku({ metin: kelime.en, ses: `en/${id}` });
    return;
  }
```

Ayri bir `input` dinleyicisi (delege click ile yakalanmaz):

```js
document.getElementById('view-ders').addEventListener('input', (e) => {
  if (e.target.id !== 'sozluk-kutu') return;
  sozlukSorgu = e.target.value;
  const liste = document.querySelector('.sozluk__alan');
  if (liste) sozlukEkrani(liste, sozlukModeli(SOZLUK, sozlukSorgu), ceviri);
});
```

**DIKKAT:** Yalniz sonuc listesi yeniden ciziliyor, tum ekran DEGIL.
`renderDers()` cagirsaydik girdi kutusu her harfte yeniden yaratilir ve
klavye odagi kaybolurdu; cocuk tek harf yazip duraklardi.

- [ ] **Step 5: CSS, sw.js ve ithallar**

`styles-v2.css` sonuna:

```css
/* --- Ders secici ve sozluk --- */
.ders-secici {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.ders-secici__dugme {
  flex: 1;
  min-height: 44px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
}

.ders-secici__dugme--secili {
  background: var(--primary);
  color: #fff;
}

.sozluk__kutu {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 2px solid var(--card-border);
  border-radius: 14px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 1rem;
  margin-bottom: 12px;
}

.sozluk__kart {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
}

.sozluk__emoji { font-size: 2rem; line-height: 1; }
.sozluk__govde { flex: 1; min-width: 0; }
.sozluk__en { margin: 0; font-family: var(--font-heading); font-weight: 700; color: var(--text-dark); }
.sozluk__tr { margin: 2px 0 0; color: var(--primary); font-weight: 600; }
.sozluk__tur { margin: 2px 0 6px; font-size: 0.78rem; color: var(--text-muted); }
.sozluk__ornek-en { margin: 0; font-size: 0.85rem; color: var(--text-dark); }
.sozluk__ornek-tr { margin: 2px 0 0; font-size: 0.85rem; color: var(--text-muted); }
.sozluk__dinle { min-height: 44px; min-width: 44px; border: none; border-radius: 12px;
  background: var(--secondary); color: #fff; font-weight: 600; }
.sozluk__baslik { font-family: var(--font-heading); color: var(--text-dark); }
.sozluk__mesaj, .sozluk__sayi { color: var(--text-muted); font-size: 0.9rem; }
```

`sw.js`: `CACHE_NAME` `'ataol-ai-v43'` yap ve ASSETS listesine ekle:

```js
  './src/data/ingilizce/temalar.js',
  './src/data/ingilizce/sozluk/index.js',
  './src/data/ingilizce/sozluk/tema1.js',
  './src/engines/ingilizce/sozluk.js',
  './src/views/ingilizce.js',
  './src/ui/sozluk-dom.js',
```

`src/main.js` ithalleri:

```js
import { sozlukEkrani } from './ui/sozluk-dom.js';
import { sozlukModeli } from './views/ingilizce.js';
import { SOZLUK } from './data/ingilizce/sozluk/index.js';
import { dersSecici } from './ui/ders-dom.js';   // mevcut ithale ekle
```

- [ ] **Step 6: Tam suite ve TARAYICIDA dogrula**

```bash
npm test
```

`src/main.js` test edilemiyor (disa aktarimi yok, modul tepesinde DOM
okuyor). Bu yuzden asagidakiler TARAYICIDA dogrulanacak ve raporda ne
gorduğun yazilacak:

1. Ders sekmesinde uc dugme goruyor musun, "Matematik" secili mi
2. "Sözlük"e basinca arama kutusu ve ipucu mesaji geliyor mu
3. "canta" yazinca (diakritiksiz) `bag` ve `school bag` geliyor mu
4. "çanta" yazinca AYNI sonuclar geliyor mu
5. Harf sildiginde sonuclar guncelleniyor ve **klavye odagi kaybolmuyor** mu
6. Dinle dugmesi Ingilizce sesi cagiriyor mu (ses dosyasi henuz yok,
   cihaz TTS'ine dusmesi beklenir)
7. "Matematik"e geri basinca hafta karti eskisi gibi geliyor mu
8. Konsolda hata var mi (olmamali)
9. 390px genislikte yatay tasma var mi (olmamali)

- [ ] **Step 7: Commit**

```bash
git add src/main.js src/ui/ders-dom.js src/core/i18n.js styles-v2.css sw.js
git commit -m "feat(ingilizce): ders secici ve calisan sozluk

Ders sekmesinin ustune Matematik/Ingilizce/Sozluk secici kondu. Alt menu
bes sekmede kaldi: iPhone 12'de alti sekme her birini ~65px'e dusurur.

Sozluk aramasinda YALNIZ sonuc listesi yeniden ciziliyor, tum ekran
degil. renderDers() cagirsaydik girdi kutusu her harfte yeniden
yaratilir ve klavye odagi kaybolurdu; cocuk tek harf yazip duraklardi.

Ders secimi depoya YAZILMIYOR: her acilista matematikten baslar. Kalici
olsaydi cocuk sozlukte birakip ertesi gun dersi bulamazdi.

sw.js: yeni dosyalar ASSETS'e eklendi, CACHE_NAME v43.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Ingilizce kelime sesleri

**Files:**
- Modify: `tools/ses-uret.js`
- Modify: `README.md`
- Test: elle calistirma

**Interfaces:**
- Consumes: `SOZLUK` (Task 4), `kelimeKimligi` (Task 2)
- Produces: `sesler/en/<id>.mp3`, `sesler/en/<id>-ornek.mp3`

- [ ] **Step 1: Scripti genislet**

Mevcut script konu/seviye/adim uzerinden calisiyor. Ikinci bir kaynak
ekle, ayri script YAZMA: iki script iki adlandirma kurali demektir ve
biri degisince digeri unutulur.

```js
const SESLER = {
  tr: { dil: 'tr-TR', ad: 'tr-TR-Chirp3-HD-Aoede' },
  en: { dil: 'en-US', ad: 'en-US-Chirp3-HD-Aoede' }
};

function ingilizceIsleri() {
  const isler = [];
  for (const k of SOZLUK) {
    isler.push({ kimlik: `en/${k.id}`, metin: k.en, ses: SESLER.en });
    isler.push({ kimlik: `en/${k.id}-ornek`, metin: k.ornek.en, ses: SESLER.en });
  }
  return isler;
}
```

`seslendir(metin)` imzasini `seslendir(metin, ses)` yap ve
`voice: { languageCode: ses.dil, name: ses.ad }` kullan.

`main()` icinde `mkdirSync(path.join(CIKTI, 'en'), { recursive: true })`
ekle (alt dizin yoksa `writeFileSync` atar).

Komut satiri: `node tools/ses-uret.js ingilizce` yalniz Ingilizceyi,
argumansiz calistirma ikisini birden uretsin.

- [ ] **Step 2: Anahtarsiz calistir, anlamli hata gor**

Run: `node tools/ses-uret.js ingilizce`
Expected: `GOOGLE_TTS_KEY ortam degiskeni gerekli.` ve cikis kodu 1

```bash
node tools/ses-uret.js ingilizce; echo "cikis kodu: $?"
```

- [ ] **Step 3: Sesleri uret**

```bash
GOOGLE_TTS_KEY=<anahtar> node tools/ses-uret.js ingilizce
```

Uretilen dosya sayisini ve toplam boyutu raporla:

```bash
ls sesler/en/*.mp3 | wc -l && du -sh sesler/en/
```

- [ ] **Step 4: Ad tutarliligini DOGRULA**

```bash
node --input-type=module -e "
import { SOZLUK } from './src/data/ingilizce/sozluk/index.js';
import { existsSync } from 'node:fs';
const eksik = SOZLUK.filter(k => !existsSync('sesler/en/' + k.id + '.mp3'));
console.log(eksik.length === 0 ? 'Tum kelimelerin sesi var' : 'EKSIK: ' + eksik.map(k=>k.id).join(', '));
"
```

Uretim tarafinin yazdigi ad ile okuma tarafinin aradigi ad ayni
fonksiyondan (`kelimeKimligi`) geliyor; bu adim onu fiilen dogruluyor.

- [ ] **Step 5: README**

"Anlatim seslerini uretme" bolumune ekle:

```markdown
Ingilizce kelime ve ornek cumle sesleri ayri uretilir:

```bash
GOOGLE_TTS_KEY=xxx node tools/ses-uret.js ingilizce
```

`sesler/en/<id>.mp3` kelimeyi, `sesler/en/<id>-ornek.mp3` ornek cumleyi
okur. Ses `en-US-Chirp3-HD-Aoede`. Dosya adi `kelimeKimligi()` ile
uretilir; ui/ses.js ayni fonksiyonu kullanir.
```

- [ ] **Step 6: Tarayicida dogrula ve commit**

Sozlukte bir kelimenin "Dinle" dugmesine bas: cihaz TTS'i degil, uretilen
mp3 dosyasi calmali. `window.Audio` izleyerek dogrula.

```bash
npm test
git add tools/ses-uret.js README.md sesler/en/
git commit -m "feat(ingilizce): kelime ve ornek cumle sesleri

tools/ses-uret.js genisletildi, ikinci script YAZILMADI: iki script iki
adlandirma kurali demektir ve biri degisince digeri unutulur.

Dosya adi kelimeKimligi() ile uretiliyor ve ui/ses.js ayni fonksiyonu
kullaniyor; bir dogrulama adimi her kelimenin dosyasinin gercekten
olustugunu kontrol ediyor.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Kapsam ve butunluk testleri

**Files:**
- Create: `tests/ingilizce-butunluk.test.js`

**Interfaces:**
- Consumes: hepsi

**NEDEN SON GOREV:** Bu testler modullerin BIRBIRIYLE tutarliligini
olcuyor; hepsi var olmadan yazilamaz.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-butunluk.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';
import { ara, kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';

test('her kelimenin temasi gercekten var', () => {
  const no = new Set(TEMALAR.map((t) => t.no));
  for (const k of SOZLUK) {
    assert.ok(no.has(k.tema), `${k.id} olmayan temaya bagli: ${k.tema}`);
  }
});

test('her kelime kendi Ingilizcesiyle aranabiliyor', () => {
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, k.en);
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} kendi Ingilizcesiyle ("${k.en}") bulunamiyor`);
  }
});

test('her kelime kendi Turkcesiyle aranabiliyor', () => {
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, k.tr);
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} kendi Turkcesiyle ("${k.tr}") bulunamiyor`);
  }
});

test('her kelime Turkcesinin DIAKRITIKSIZ hali ile de bulunuyor', () => {
  const duz = (m) => m.toLocaleLowerCase('tr')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, duz(k.tr));
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} diakritiksiz Turkcesiyle ("${duz(k.tr)}") bulunamiyor`);
  }
});

test('ses dosyasi adi uretim ve okuma tarafinda AYNI', () => {
  for (const k of SOZLUK) {
    assert.equal(`en/${k.id}`, `en/${kelimeKimligi(k.en)}`,
      `${k.en}: uretim ve okuma tarafi farkli ad uretiyor`);
  }
});

test('kapsam raporu', () => {
  const emoji = SOZLUK.filter((k) => k.gorsel.tip === 'emoji').length;
  const cizim = SOZLUK.length - emoji;
  const temalar = new Set(SOZLUK.map((k) => k.tema));
  console.log(`  kelime: ${SOZLUK.length} | emoji: ${emoji} | cizim: ${cizim} | tema: ${[...temalar].sort().join(',')}`);
  assert.ok(SOZLUK.length > 0);
});
```

- [ ] **Step 2: Calistir**

Run: `node --test tests/ingilizce-butunluk.test.js`
Expected: PASS, 6 test. Kapsam raporunu raporuna kopyala.

- [ ] **Step 3: Mutasyonla kaniti al, IKI kez**

1. `src/engines/ingilizce/sozluk.js` icindeki `ara` fonksiyonunda
   `const trSkor = puanla(kelime.tr, s);` satirini `const trSkor = 0;`
   yap. "kendi Turkcesiyle aranabiliyor" ve "diakritiksiz hali ile de
   bulunuyor" testleri KIRMIZI olmali. Geri al, YESIL gor.

2. `normalize` icindeki `.replace(/[çğıiöşüâîû]/g, ...)` satirini sil.
   "diakritiksiz hali ile de bulunuyor" KIRMIZI olmali ama "kendi
   Turkcesiyle aranabiliyor" YESIL kalmali - ikisi farkli seyi koruyor
   ve bunu gormek ikisinin de gerekli oldugunun kaniti. Geri al.

- [ ] **Step 4: Commit**

```bash
npm test
git add tests/ingilizce-butunluk.test.js
git commit -m "feat(ingilizce): kapsam ve butunluk testleri

Moduller arasi tutarliligi olcuyor: her kelime kendi Ingilizcesiyle,
kendi Turkcesiyle ve Turkcesinin diakritiksiz haliyle bulunabiliyor mu.

Son maddenin sebebi somut: cocuk telefonda 'canta' yazar. Tek tek
kelimeler dogru gorunse bile veri girisi sirasinda bir diakritik
kacarsa o kelime aranamaz hale gelir ve bunu ancak Deha fark ederdi.

Ses dosyasi adinin iki tarafta ayni uretildigi de burada pinleniyor.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Faz 1 sonrasi dogrulama listesi

Teslimden once bastan sona su akisi bir kez elle gec:

1. Ders sekmesi uc dugme gosteriyor, "Matematik" secili
2. Matematik tarafi eskisi gibi calisiyor (hafta karti, anlatim, quiz)
3. "Sözlük"e basinca arama kutusu ve ipucu mesaji geliyor
4. "canta" -> `bag`, `school bag`; "çanta" -> ayni sonuclar
5. "teacher" -> `öğretmen`; "ogretmen" -> ayni kelime
6. Harf silince liste guncelleniyor, klavye odagi KAYBOLMUYOR
7. Dinle dugmesi uretilen mp3'u caliyor (cihaz TTS'i degil)
8. "İngilizce"ye basinca "hazirlaniyor" mesaji geliyor, cokmuyor
9. "Matematik"e donunce hafta karti bozulmamis
10. Ucak modunda sozluk calisiyor (sw.js ASSETS)
11. Uygulamayi kapatip acinca matematik ilerlemesi DURUYOR
12. Konsolda hic hata yok
13. 390px'te yatay tasma yok
14. `npm test` tamamen yesil

---

## Spec kapsam notu (plan yazarken yapilan kontrol)

Spec'in her bolumu bir goreve baglaniyor mu diye bakildi:

| Spec bolumu | Gorev |
|---|---|
| §2 Mufredat, D1 paylasilan takvim | Task 1 |
| §3.1 Kelime kaydi, D2 ses adi turetilir, D3 id sabitlenir | Task 4 |
| §4 Sozluk motoru, D4 normalizasyon, D5 iki yon | Task 2, 3 |
| §6 Gorseller (emoji kismi), D8 | Task 4 |
| §7 Ses, D9 script genisletilir | Task 9 |
| §8 Yerlesim, D10 ders secici | Task 8 |
| §8 D11 ayri depo, ortak ayarlar | Task 5 |
| §10 Test stratejisi | Task 10 |
| §3.2 Ders icerigi, §5 Ders akisi, D6 kayit-dinlet, D7 mikrofon izni, D12 yildiz | **Faz 2** |
| §6 Gorseller (cizim kismi) | **Faz 2** |

Faz 1'de KAPSANMAYANLAR bilincli: ders akisi ve tuval cizimleri Faz 2'ye
birakildi. Faz 1 tek basina calisan bir urun teslim ediyor - Deha odevde
sozluge bakabilir.

## Faz 2 notu

Faz 2 (1. temanin dersleri: 4 hafta, alti asama, quiz, tema sinavi) AYRI
bir plan olarak yazilacak. Sebep: ders akisinin sekli sozluk verisinin
gercek halini gormeden kesinlesmez - ornek cumlelerin uzunlugu "cumle
kur" asamasinin tasarimini, emoji kapsami "dinle, sec" asamasinin dort
secenegini belirler. Faz 1 bittiginde bu iki sayi OLCULMUS olacak ve
Faz 2 plani tahmin uzerine degil olcum uzerine yazilacak.
