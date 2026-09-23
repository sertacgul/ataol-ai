# Ingilizce Modulu Faz 2a Uygulama Plani

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1. temanin (SCHOOL LIFE, 4-7. haftalar) yildiz oduyen tam ders yolunu calisir hale getirmek: kelime kartlari, dinle-sec, hafta quizi ve tema sinavi.

**Architecture:** Matematik modulunun katman duzenini izler. Yildiz ve sinav mantigi icin `engines/ders.js` ve `engines/sinav.js` icindeki saf fonksiyonlar AYNEN tekrar kullanilir; yalnizca hafta kaydinin sekli ve asama listesi Ingilizceye ozgudur. Gorseller Faz 1'de kurulan `ui/gorsel/` kayit defterine eklenir.

**Tech Stack:** Bagimliliksiz ES modulleri, derleme adimi yok. Test: `node --test`. Ses: Chirp 3 HD (tr-TR anlatim, en-US kelime).

**Spec:** `docs/2026-09-23-ingilizce-modulu-tasarim.md`

**Dal:** `feat/ingilizce-faz2`

## Neden bu kapsam

Spec'teki alti asamanin YILDIZ ODEYEN dordu bu planda (kelime kartlari 4,
dinle-sec 3, hafta quizi 6, tema sinavi 15). "Soyle-dinle" ve "cumle kur"
yildiz odemiyor (spec D12: sinirsiz tekrar edilebilen asama yildiz vermez)
ve ikisi de cihaz yetenegine bagli riskler tasiyor; ayri bir plana birakildi.

Bu plan bittiginde Deha 4-7. haftalari bastan sona calisabilir ve tam
yildizini alabilir. Faz 2b eklendiginde alistirma derinlesir, ama hicbir
odul kapisi acilmaz.

## Olculen girdiler (tahmin degil)

Faz 1 verisi uzerinde calistirildi:

| Olcum | Deger | Tasarima etkisi |
|---|---|---|
| Kelime | 46 | Hafta basina 11-12 kart |
| Emoji / cizim | 33 / 13 (%72) | 13 cizim Task 3'te yazilir |
| Ornek cumle uzunlugu | min 3, ortanca 5, max 8 kelime | Faz 2b'nin "cumle kur"unu ilgilendirir |
| Tur dagilimi | 40 isim, 3 fiil, 3 ifade | **Dinle-sec dort RESIM soruyor; 6 fiil/ifade icin resim zayif** |

Son satir Task 5'in tasarimini belirliyor ve orada acikca ele aliniyor.

## Global Constraints

- **Bagimlilik yok, derleme adimi yok, `node_modules` yok.** Tek npm betigi `test`.
- **Yorumlar, tanimlayicilar ve TEST ADLARI ASCII.** Turkce diakritiksiz (`ayni`, `aynı` degil).
- **Cocugun GORDUGU her metin tam Turkce diakritikli.** `tests/architecture.test.js` tuval metinlerinde otomatik yakaliyor.
- **Bagimlilik yonu:** hicbir saf katman (`core/`, `engines/`, `views/`) `ui/` icinden ithal edemez.
- **`engines/` saf kalir:** `Date.now()` yok, argumansiz `new Date()` yok, `Math.random()` yok, DOM yok.
- **Her yerde yasak:** `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, `srcdoc`.
- **`el()`** beyaz liste disindaki oznitelikte ATAR ve `Object.entries` ile doner; `undefined` degerli beyaz listedeki anahtar bile attirir. `data-*` `dataset` ile gecer.
- **`tests/i18n.test.js`** yalnizca `tr`/`en` anahtar KUMESINI karsilastirir; tek blok icindeki tekrari goremez, sonradan yazilan sessizce kazanir. Yeni anahtardan once elle say.
- **Her test isirmali.** Korudugu seyi mutasyona ugrat, KIRMIZI gor, geri al, YESIL gor; raporda ne gordugunu yaz.
- **Kirmizi suite asla commit edilmez.** Baslangic: **827 test, 0 hata**.
- **Yildiz hafta basina 13:** kelime 4 + dinle-sec 3 + quiz 6. Tema sinavi 15. Matematikle ayni.
- **Ses dosyasi adi TURETILIR:** `sesler/en/<id>.mp3`, `sesler/en/<id>-ornek.mp3`, `sesler/tr-ing/<haftaNo>-<adimId>.mp3`. Uretim ve okuma ayni ifadeden gelir.

---

## Yeniden kullanilan ve kullanilamayan saf fonksiyonlar

Faz 1'de olculdu, tekrar olculmesin:

| Fonksiyon | Durum |
|---|---|
| `quizBitir`, `sinavBitir`, `tamPuanIsaretle`, `yildizVer` | AYNEN kullanilir |
| `sinavKur`, `cevapla`, `puanla`, `agirlikHesapla` (`engines/sinav.js`) | AYNEN kullanilir |
| `haftaKaydi`, `bosHafta`, `haftaDurumu`, `ASAMALAR` | KULLANILAMAZ (matematige ozgu alanlar, dort asama) |

Ingilizce hafta kaydi `quiz` ve `yildizAlinan` alanlarini MUTLAKA tasir,
cunku `quizBitir` ve `yildizVer` onlari bekliyor.

## Dosya yapisi

| Dosya | Sorumluluk |
|---|---|
| `src/data/ingilizce/haftalar.js` | 4-7. haftalarin kelime listesi ve anlatim metni |
| `src/engines/ingilizce/ders.js` | `ING_ASAMALAR`, `ING_YILDIZ`, `bosIngHafta`, `ingHaftaKaydi`, `ingHaftaDurumu`, asama tamamlama |
| `src/engines/ingilizce/uretici.js` | Quiz ve sinav sorusu ureticileri |
| `src/ui/gorsel/ingilizce.js` | 13 cizim |
| `src/views/ingilizce.js` | `ingHaftaKarti`, `kartModeli`, `dinleSecModeli` (mevcut dosyaya eklenir) |
| `src/ui/ingilizce-dom.js` | Hafta karti, kelime karti, dinle-sec ve sonuc ekranlari |
| `src/main.js` | Olay baglama |

---

## Task 1: Ingilizce ders motoru

**Files:**
- Create: `src/engines/ingilizce/ders.js`
- Test: `tests/ingilizce-ders.test.js`

**Interfaces:**
- Consumes: `quizBitir`, `yildizVer`, `tamPuanIsaretle` (`src/engines/ders.js`)
- Produces:
  - `ING_ASAMALAR` -> `['kelime', 'dinle', 'soyle', 'cumle', 'quiz']`
  - `ING_YILDIZ` -> `{ kelime: 4, dinle: 3, soyle: 0, cumle: 0, quizGecme: 6, quizTamPuan: 10, temaSinavi: 15 }`
  - `bosIngHafta()` -> kayit
  - `ingHaftaKaydi(ilerleme, haftaNo)` -> kayit (savunmali)
  - `ingHaftaDurumu(kelimeIdleri, kayit)` -> `{ asamalar, yuzde, bitti }`
  - `kartGoruldu(kayit, kelimeId)` -> `{ kayit, kazanilanYildiz }`
  - `dinleBitir(kayit, dogruSayisi, toplam)` -> `{ kayit, kazanilanYildiz, gecti }`

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-ders.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ING_ASAMALAR, ING_YILDIZ, bosIngHafta, ingHaftaKaydi, ingHaftaDurumu,
  kartGoruldu, dinleBitir
} from '../src/engines/ingilizce/ders.js';
import { YILDIZ } from '../src/engines/ders.js';

const KELIMELER = ['teacher', 'student', 'school', 'book'];

test('bes asama var ve sirasi sabit', () => {
  assert.deepEqual(ING_ASAMALAR, ['kelime', 'dinle', 'soyle', 'cumle', 'quiz']);
});

test('hafta basina yildiz matematikle AYNI: 13', () => {
  const hafta = ING_YILDIZ.kelime + ING_YILDIZ.dinle + ING_YILDIZ.soyle
    + ING_YILDIZ.cumle + ING_YILDIZ.quizGecme;
  assert.equal(hafta, 13);
  const matematik = YILDIZ.anlatim + YILDIZ.etkilesim + 0 + YILDIZ.quizGecme;
  assert.equal(hafta, matematik,
    'yildiz iki ders arasinda ortak para birimi; biri fazla oderse cocuk dersi degil odulu secer');
});

test('tema sinavi matematikteki unite sinaviyla ayni oder', () => {
  assert.equal(ING_YILDIZ.temaSinavi, YILDIZ.uniteSinavi);
});

test('sinirsiz tekrar edilen asamalar yildiz VERMEZ', () => {
  assert.equal(ING_YILDIZ.soyle, 0);
  assert.equal(ING_YILDIZ.cumle, 0);
});

test('bos kayit quiz ve yildizAlinan alanlarini tasir', () => {
  const k = bosIngHafta();
  assert.deepEqual(k.quiz, { enIyi: 0, denemeler: 0 },
    'quizBitir bu sekli bekliyor');
  assert.deepEqual(k.yildizAlinan, [], 'yildizVer bu alani bekliyor');
  assert.deepEqual(k.kelimeler, []);
  assert.equal(k.dinleBitti, false);
});

test('ingHaftaKaydi bozuk kayitta cokmez', () => {
  for (const bozuk of [null, undefined, 'metin', 42, [], true]) {
    const k = ingHaftaKaydi({ haftalar: { '4': bozuk } }, 4);
    assert.deepEqual(k, bosIngHafta(), `${JSON.stringify(bozuk)} varsayilana dusmedi`);
  }
  assert.deepEqual(ingHaftaKaydi(null, 4), bosIngHafta());
});

test('ingHaftaKaydi dogru tipteki alanlari KORUR', () => {
  const kayit = { kelimeler: ['teacher'], dinleBitti: true,
    quiz: { enIyi: 80, denemeler: 2 }, yildizAlinan: ['kelime'] };
  const k = ingHaftaKaydi({ haftalar: { '4': kayit } }, 4);
  assert.deepEqual(k.kelimeler, ['teacher']);
  assert.equal(k.dinleBitti, true);
  assert.equal(k.quiz.enIyi, 80);
  assert.deepEqual(k.yildizAlinan, ['kelime']);
});

test('kelime asamasi TUM kartlar gorulunce tamam olur', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER.slice(0, 3)) k = kartGoruldu(k, id, KELIMELER).kayit;
  assert.equal(ingHaftaDurumu(KELIMELER, k).asamalar.kelime.tamam, false,
    '3/4 kart tamam sayilmamali');
  k = kartGoruldu(k, KELIMELER[3], KELIMELER).kayit;
  assert.equal(ingHaftaDurumu(KELIMELER, k).asamalar.kelime.tamam, true);
});

test('bos kelime listesi TAMAM sayilmaz', () => {
  // Icerigi yazilmamis hafta ilerleme sayilmamali, yoksa bedava yildiz.
  assert.equal(ingHaftaDurumu([], bosIngHafta()).asamalar.kelime.tamam, false);
});

test('ayni kart iki kez gorulunce sayac artmaz', () => {
  let k = kartGoruldu(bosIngHafta(), 'teacher', KELIMELER).kayit;
  k = kartGoruldu(k, 'teacher', KELIMELER).kayit;
  assert.deepEqual(k.kelimeler, ['teacher']);
});

test('kelime yildizi BIR KEZ odenir', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER) k = kartGoruldu(k, id, KELIMELER).kayit;
  const ilk = kartGoruldu(k, KELIMELER[0], KELIMELER);
  assert.equal(ilk.kazanilanYildiz, 0, 'tum kartlar zaten goruldu');

  let t = bosIngHafta();
  let toplam = 0;
  for (const id of KELIMELER) {
    const s = kartGoruldu(t, id, KELIMELER); t = s.kayit; toplam += s.kazanilanYildiz;
  }
  assert.equal(toplam, ING_YILDIZ.kelime, 'yildiz son kartta bir kez odenmeli');
});

test('dinle-sec gecme esigi ve yildizi', () => {
  const dusuk = dinleBitir(bosIngHafta(), 5, 10);
  assert.equal(dusuk.gecti, false);
  assert.equal(dusuk.kazanilanYildiz, 0);
  assert.equal(dusuk.kayit.dinleBitti, false);

  const yuksek = dinleBitir(bosIngHafta(), 8, 10);
  assert.equal(yuksek.gecti, true);
  assert.equal(yuksek.kazanilanYildiz, ING_YILDIZ.dinle);
  assert.equal(yuksek.kayit.dinleBitti, true);
});

test('dinle-sec tekrar gecmek yildiz ODEMEZ', () => {
  const ilk = dinleBitir(bosIngHafta(), 10, 10);
  const tekrar = dinleBitir(ilk.kayit, 10, 10);
  assert.equal(tekrar.kazanilanYildiz, 0);
  assert.equal(tekrar.gecti, true, 'gectigi yine dogru raporlanmali');
});

test('sifir soruda dinle-sec gecmez, bolme hatasi vermez', () => {
  const s = dinleBitir(bosIngHafta(), 0, 0);
  assert.equal(s.gecti, false);
  assert.ok(Number.isFinite(s.kazanilanYildiz));
});

test('bitti yalniz BES asama da tamamken true', () => {
  let k = bosIngHafta();
  for (const id of KELIMELER) k = kartGoruldu(k, id, KELIMELER).kayit;
  k = dinleBitir(k, 10, 10).kayit;
  k = { ...k, soyleBitti: true, cumleBitti: true };
  assert.equal(ingHaftaDurumu(KELIMELER, k).bitti, false, 'quiz eksikken bitmis sayilmamali');
  k = { ...k, quiz: { enIyi: 80, denemeler: 1 } };
  assert.equal(ingHaftaDurumu(KELIMELER, k).bitti, true);
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-ders.test.js`
Expected: FAIL, "Cannot find module '../src/engines/ingilizce/ders.js'"

- [ ] **Step 3: Uygula**

```js
// src/engines/ingilizce/ders.js
/**
 * Ingilizce ders ilerlemesi. Saf: DOM yok, saat yok, rastgele yok.
 *
 * Matematikten AYRI bir dosya cunku asama listesi ve kayit sekli farkli
 * (matematikte dort asama, burada bes). Ama kayit `quiz` ve `yildizAlinan`
 * alanlarini AYNI sekilde tasiyor, boylece quizBitir, yildizVer ve
 * tamPuanIsaretle aynen tekrar kullanilabiliyor.
 */

import { yildizVer } from '../ders.js';

export const ING_ASAMALAR = ['kelime', 'dinle', 'soyle', 'cumle', 'quiz'];

/**
 * Hafta basina toplam 13: 4 + 3 + 0 + 0 + 6. Matematikle AYNI.
 *
 * Yildiz iki ders arasinda ortak para birimi. Biri fazla odeseydi cocuk
 * dersi degil odulu secerdi. Sinirsiz tekrar edilebilen asamalar
 * (soyle-dinle, cumle kur) yildiz VERMEZ - matematikte alistirma da boyle.
 */
export const ING_YILDIZ = {
  kelime: 4, dinle: 3, soyle: 0, cumle: 0,
  quizGecme: 6, quizTamPuan: 10, temaSinavi: 15
};

export const DINLE_GECME = 70;

const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const dizi = (x) => (Array.isArray(x) ? x : []);
const sayi = (x) => (Number.isFinite(x) ? x : 0);

export function bosIngHafta() {
  return {
    kelimeler: [],
    dinleBitti: false,
    soyleBitti: false,
    cumleBitti: false,
    quiz: { enIyi: 0, denemeler: 0 },
    yildizAlinan: []
  };
}

export function ingHaftaKaydi(ilerleme, haftaNo) {
  const ham = nesne(nesne(ilerleme?.haftalar)[String(haftaNo)]);
  const quiz = nesne(ham.quiz);
  return {
    kelimeler: dizi(ham.kelimeler),
    dinleBitti: ham.dinleBitti === true,
    soyleBitti: ham.soyleBitti === true,
    cumleBitti: ham.cumleBitti === true,
    quiz: { enIyi: sayi(quiz.enIyi), denemeler: sayi(quiz.denemeler) },
    yildizAlinan: dizi(ham.yildizAlinan)
  };
}

export function ingHaftaDurumu(kelimeIdleri, kayit) {
  const toplam = kelimeIdleri.length;
  const goruldu = kelimeIdleri.filter((id) => kayit.kelimeler.includes(id)).length;

  const asamalar = {
    // Bos kelime listesi icerigin yazilmadigini anlatir; tamam: false
    // tutmak bilincli, yoksa bos hafta bedava yildiz oderdi.
    kelime: { tamam: toplam > 0 && goruldu === toplam, n: goruldu, toplam },
    dinle: { tamam: kayit.dinleBitti },
    soyle: { tamam: kayit.soyleBitti },
    cumle: { tamam: kayit.cumleBitti },
    quiz: { tamam: kayit.quiz.enIyi >= 70, enIyi: kayit.quiz.enIyi }
  };

  const biten = ING_ASAMALAR.filter((a) => asamalar[a].tamam).length;
  return {
    asamalar,
    yuzde: Math.round((biten / ING_ASAMALAR.length) * 100),
    bitti: biten === ING_ASAMALAR.length
  };
}

/**
 * Bir kelime karti goruldu.
 *
 * Yildiz kart basina DEGIL, son kart gorulunce BIR KEZ odenir; bu yuzden
 * fonksiyon haftanin tum kelime idlerini de alir. yildizVer 'kelime'
 * isaretini yildizAlinan'a koydugu icin tekrar odeme olmaz.
 */
export function kartGoruldu(kayit, kelimeId, kelimeIdleri = []) {
  if (kayit.kelimeler.includes(kelimeId)) return { kayit, kazanilanYildiz: 0 };

  const yeni = { ...kayit, kelimeler: [...kayit.kelimeler, kelimeId] };
  const tamam = kelimeIdleri.length > 0
    && kelimeIdleri.every((id) => yeni.kelimeler.includes(id));

  return tamam
    ? yildizVer(yeni, 'kelime', ING_YILDIZ.kelime)
    : { kayit: yeni, kazanilanYildiz: 0 };
}

- [ ] **Step 4: `yildizVer`i disa aktar**

Yukaridaki kod `import { yildizVer } from '../ders.js';` diyor ama o
fonksiyon su an disa aktarilmiyor - `src/engines/ders.js:68` satirinda
`function yildizVer(...)` olarak duruyor. Basina `export` ekle.

Tek kelimelik degisiklik; matematik davranisi degismez, cunku ayni dosya
icindeki cagrilar etkilenmiyor.

Kopyalamak YERINE disa aktariyoruz: iki kopya, biri degisip digeri
unutuldugunda sessizce ayrisir. Bu dalda tam o hatanin bir ornegi
yasandi (tablo buyudu, onu kullanan regex buyumedi, davranis hic
degismedi).

- [ ] **Step 5: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-ders.test.js`
Expected: PASS, 15 test

- [ ] **Step 6: Mutasyonla kaniti al, UC kez**

1. `ING_YILDIZ.dinle`i 3 yerine 5 yap -> "hafta basina yildiz matematikle
   AYNI: 13" KIRMIZI olmali. Geri al.
2. `ingHaftaDurumu` icindeki `toplam > 0` kosulunu kaldir -> "bos kelime
   listesi TAMAM sayilmaz" KIRMIZI. Geri al.
3. `dinleBitir` icindeki `yildizVer` cagrisini duz `{ kayit, kazanilanYildiz:
   ING_YILDIZ.dinle }` ile degistir -> "tekrar gecmek yildiz ODEMEZ"
   KIRMIZI. Geri al.

Ucunu de raporuna yaz.

- [ ] **Step 7: Tam suite ve commit**

```bash
npm test
git add src/engines/ingilizce/ders.js src/engines/ders.js tests/ingilizce-ders.test.js
git commit -m "feat(ingilizce): ders motoru - asamalar, yildiz, hafta kaydi

Bes asama (matematikte dort) ve kendi kayit sekli, ama quiz ve
yildizAlinan alanlari matematikle AYNI; boylece quizBitir, yildizVer ve
tamPuanIsaretle aynen tekrar kullaniliyor.

Hafta basina yildiz 13: matematikle birebir ayni ve testi var. Yildiz
iki ders arasinda ortak para birimi; biri fazla odeseydi cocuk dersi
degil odulu secerdi.

yildizVer ders.js'ten disa aktarildi, kopyalanmadi. Bu dalda 'tablo
buyudu, onu kullanan satir buyumedi' hatasi bir kez zaten yasandi.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Hafta verisi (4-7. haftalar)

**Files:**
- Create: `src/data/ingilizce/haftalar.js`
- Test: `tests/ingilizce-hafta-veri.test.js`

**Interfaces:**
- Consumes: `SOZLUK` (Faz 1), `TEMALAR` (Faz 1)
- Produces: `ING_HAFTALAR` -> `Array<{ hafta, tema, baslik: { en, tr }, kelimeler: string[], anlatim: Array<{ id, tr, en }> }>`

**KAPSAM:** 46 kelime dort haftaya dagitilir (hafta basina 11-12). Dagitim
mufredatin alt temalarini izler:

| Hafta | Alt tema | Yaklasik kelime |
|---|---|---|
| 4 | Okuldaki kisiler | teacher, student, principal, classmate, friend, caretaker + okul, sinif |
| 5 | Okuldaki yerler | library, canteen, playground, gym, laboratory, corridor + esyalar |
| 6 | Kurallar ve kulupler | rule, listen, speak, run, be quiet, be on time, raise your hand, club ve kulupler |
| 7 | Ulkeler ve milli gunler | country, Türkiye ve ulkeler, national day, flag, celebration, ceremony, holiday |

Her hafta **2-3 anlatim adimi**: Turkce aciklama + Ingilizce ornek.
Anlatim Turkce seslendirilir, ornek Ingilizce.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-hafta-veri.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';

const IDLER = new Set(SOZLUK.map((k) => k.id));

test('dort hafta var: 4, 5, 6, 7', () => {
  assert.deepEqual(ING_HAFTALAR.map((h) => h.hafta), [4, 5, 6, 7]);
});

test('her hafta 1. temaya ait ve tema o haftayi tanir', () => {
  const tema1 = TEMALAR.find((t) => t.no === 1);
  for (const h of ING_HAFTALAR) {
    assert.equal(h.tema, 1, `hafta ${h.hafta}`);
    assert.ok(tema1.haftalar.includes(h.hafta),
      `hafta ${h.hafta} tema 1'in hafta listesinde yok`);
  }
});

test('her kelime id sozlukte GERCEKTEN var', () => {
  for (const h of ING_HAFTALAR) {
    for (const id of h.kelimeler) {
      assert.ok(IDLER.has(id), `hafta ${h.hafta}: "${id}" sozlukte yok`);
    }
  }
});

test('her hafta en az 8 kelime tasir', () => {
  for (const h of ING_HAFTALAR) {
    assert.ok(h.kelimeler.length >= 8,
      `hafta ${h.hafta} yalniz ${h.kelimeler.length} kelime; bir haftalik ders olmaz`);
  }
});

test('hicbir kelime iki haftaya birden atanmamis', () => {
  const sayac = new Map();
  for (const h of ING_HAFTALAR) {
    for (const id of h.kelimeler) sayac.set(id, (sayac.get(id) ?? 0) + 1);
  }
  const cift = [...sayac].filter(([, n]) => n > 1).map(([id]) => id);
  assert.deepEqual(cift, [], `iki haftada birden: ${cift.join(', ')}`);
});

test('1. temanin TUM kelimeleri bir haftaya atanmis', () => {
  const atanan = new Set(ING_HAFTALAR.flatMap((h) => h.kelimeler));
  const eksik = SOZLUK.filter((k) => k.tema === 1 && !atanan.has(k.id)).map((k) => k.id);
  assert.deepEqual(eksik, [], `hicbir haftada gecmeyen kelime: ${eksik.join(', ')}`);
});

test('her haftanin 2-3 anlatim adimi var ve idleri benzersiz', () => {
  for (const h of ING_HAFTALAR) {
    assert.ok(h.anlatim.length >= 2 && h.anlatim.length <= 3,
      `hafta ${h.hafta}: ${h.anlatim.length} adim`);
    const ids = h.anlatim.map((a) => a.id);
    assert.equal(ids.length, new Set(ids).size, `hafta ${h.hafta} adim idleri tekrar ediyor`);
  }
});

test('anlatim adimlari iki dilli ve bos degil', () => {
  for (const h of ING_HAFTALAR) {
    for (const a of h.anlatim) {
      assert.ok(a.tr.trim().length > 20, `hafta ${h.hafta}/${a.id} tr cok kisa`);
      assert.ok(a.en.trim().length > 0, `hafta ${h.hafta}/${a.id} en bos`);
    }
  }
});

test('anlatim Turkcesi diakritiklerini korumus', () => {
  const SUPHELI = ['ogretmen', 'ogrenci', 'kutuphane', 'mudur', 'kulup',
    'sinif', 'ingilizce', 'soyle', 'gorursun', 'kullanirsin'];
  for (const h of ING_HAFTALAR) {
    for (const a of h.anlatim) {
      for (const s of SUPHELI) {
        assert.ok(!a.tr.toLowerCase().includes(s),
          `hafta ${h.hafta}/${a.id}: diakritiksiz "${s}" -> "${a.tr}"`);
      }
    }
  }
});

test('anlatim metinlerinde TTS okuyamayacagi sembol yok', () => {
  for (const h of ING_HAFTALAR) {
    for (const a of h.anlatim) {
      for (const [ad, m] of [['tr', a.tr], ['en', a.en]]) {
        assert.ok(!/[°×÷≠≤≥→←]/.test(m), `hafta ${h.hafta}/${a.id} ${ad}: ${m}`);
      }
    }
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-hafta-veri.test.js`
Expected: FAIL, modul yok

- [ ] **Step 3: Veriyi yaz**

```js
// src/data/ingilizce/haftalar.js
/**
 * 1. temanin (SCHOOL LIFE) hafta hafta dagilimi.
 *
 * Kelime idleri sozlukten gelir ve BURADA TEKRARLANMAZ - yalnizca id
 * yazilir. Kelimenin kendisi, gorseli, ornegi ve sesi tek kaynaktadir
 * (src/data/ingilizce/sozluk/). Iki yerde tutulsaydi biri duzeltilip
 * digeri unutulurdu.
 *
 * Anlatim Turkce yazilir ve Turkce seslendirilir; ornek Ingilizcedir ve
 * Ingilizce seslendirilir. Spec karari: 5. sinif seviyesinde kuralin
 * anadilde anlatilmasi, ornegin hedef dilde olmasi dogru olan.
 */

export const ING_HAFTALAR = [
  {
    hafta: 4,
    tema: 1,
    baslik: { en: 'People at school', tr: 'Okuldaki kişiler' },
    kelimeler: ['teacher', 'student', 'principal', 'classmate', 'friend',
      'caretaker', 'school', 'classroom'],
    anlatim: [
      {
        id: 'a1',
        tr: 'Okuldaki kişileri tanıtırken "This is ..." kalıbını kullanırsın. Bu kalıp "Bu ..." demektir ve yanındaki kişiyi gösterirken söylenir.',
        en: 'This is my teacher.'
      },
      {
        id: 'a2',
        tr: 'Kendinden söz ederken "my" kelimesini kullanırsın. "My teacher" senin öğretmenin, "my friend" senin arkadaşın demektir.',
        en: 'My friend is in my classroom.'
      }
    ]
  }
  // ... hafta 5, 6, 7 ayni bicimde
];
```

Kalan uc haftayi yukaridaki kalibi izleyerek yaz. Kelime dagitimi icin
gorev basindaki tabloyu kullan ve testin "tum kelimeler atanmis"
kosulunu sagla.

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-hafta-veri.test.js`
Expected: PASS, 10 test

- [ ] **Step 5: Mutasyonla kaniti al**

1. Bir kelimeyi iki haftaya birden koy -> "hicbir kelime iki haftaya
   birden atanmamis" KIRMIZI. Geri al.
2. Bir kelimeyi hicbir haftaya koyma -> "TUM kelimeleri bir haftaya
   atanmis" KIRMIZI. Geri al.
3. Bir kelime idini `'teacherr'` yap -> "her kelime id sozlukte GERCEKTEN
   var" KIRMIZI. Geri al.

- [ ] **Step 6: Dagilimi OLC ve raporla**

```bash
node --input-type=module -e "
import { ING_HAFTALAR } from './src/data/ingilizce/haftalar.js';
for (const h of ING_HAFTALAR)
  console.log('hafta', h.hafta, '|', h.kelimeler.length, 'kelime |', h.anlatim.length, 'anlatim |', h.baslik.tr);
console.log('toplam kelime:', ING_HAFTALAR.reduce((n,h)=>n+h.kelimeler.length,0));
"
```

Cikan sayilari raporuna yaz.

- [ ] **Step 7: Tam suite ve commit**

```bash
npm test
git add src/data/ingilizce/haftalar.js tests/ingilizce-hafta-veri.test.js
git commit -m "feat(ingilizce): 1. temanin hafta dagilimi (4-7)

Kelime idleri yaziliyor, kelimenin kendisi degil: tek kaynak sozlukte
kaliyor. Iki yerde tutulsaydi biri duzeltilip digeri unutulurdu.

Testler butunluk ariyor: her id sozlukte gercekten var mi, hicbir kelime
iki haftaya birden atanmis mi, temanin tum kelimeleri bir haftaya
dusmus mu. Elle yazilan bir dagitimda en kolay kacirilan hatalar bunlar.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 13 cizim

**Files:**
- Create: `src/ui/gorsel/ingilizce.js`
- Modify: `src/ui/gorsel/index.js`
- Test: `tests/gorsel-ingilizce.test.js`

**Interfaces:**
- Consumes: `cizim.js` yardimcilari (Faz 1 matematik modulunden)
- Produces: 13 cizim, `GORSELLER` kayit defterine eklenir

**NEDEN SIMDI:** Task 5'teki "dinle-sec" asamasi dort GORSEL gosterip
dogrusunu sectiriyor. 13 kelime hala yer tutucu simge gosteriyor; dordu
birden yer tutucu olursa soru cevaplanamaz hale gelir. Ayni sinif hata
Faz 1'de matematik tarafinda yasandi (uretilen ama cizilmeyen gorsel).

**Cizilecekler:** `okul-muduru`, `arkadas`, `okul-hizmetlisi`, `sinif`,
`spor-salonu`, `koridor`, `silgi`, `kural`, `zamaninda-ol`, `el-kaldir`,
`kulup`, `bayrak`, `toren`

- [ ] **Step 1: Testi yaz**

```js
// tests/gorsel-ingilizce.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GORSELLER, gorselKur } from '../src/ui/gorsel/index.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';

function izleyenKanvas(kayit) {
  const y = (ad) => (...a) =>
    kayit.push(ad + ':' + a.slice(0, 4).map((v) => (typeof v === 'number' ? Math.round(v) : v)).join(','));
  const b = {
    beginPath: y('bp'), closePath: y('cp'), moveTo: y('mt'), lineTo: y('lt'),
    arc: y('arc'), arcTo: y('at'), quadraticCurveTo: y('q'), bezierCurveTo: y('bz'),
    ellipse: y('el'), rect: y('r'), fillRect: y('fr'), strokeRect: y('sr'), clip: y('cl'),
    stroke: y('s'), fill: y('f'), clearRect: y('cr'), fillText: y('ft'), strokeText: y('st'),
    measureText: () => ({ width: 10 }), setLineDash: y('sd'), getLineDash: () => [],
    save: y('sv'), restore: y('rs'), translate: y('tr'), rotate: y('ro'), scale: y('sc'),
    setTransform: y('t'), resetTransform: y('rt'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set lineCap(v) {}, set lineJoin(v) {}, set globalAlpha(v) {}
  };
  return {
    width: 320, height: 198,
    getContext: () => b,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 198 }),
    addEventListener() {}, removeEventListener() {}
  };
}

const BEKLENEN = SOZLUK.filter((k) => k.gorsel.tip === 'cizim').map((k) => k.gorsel.ad);

test('sozlukteki her cizim adi kayit defterinde var', () => {
  const eksik = BEKLENEN.filter((ad) => !GORSELLER[ad]);
  assert.deepEqual(eksik, [], `cizimi yazilmamis: ${eksik.join(', ')}`);
});

test('her Ingilizce cizim sozlesmeyi saglar ve bir sey cizer', () => {
  for (const ad of BEKLENEN) {
    const kayit = [];
    const g = gorselKur(ad, izleyenKanvas(kayit), {});
    assert.ok(g, `${ad}: gorselKur null dondu`);
    assert.equal(typeof g.ciz, 'function', `${ad}.ciz yok`);
    g.ciz();
    assert.ok(kayit.length > 2, `${ad}: hicbir sey cizmedi`);
  }
});

test('Ingilizce cizimler birbirinden FARKLI ciziyor', () => {
  // Dinle-sec dort gorsel gosterip dogrusunu sectiriyor. Iki cizim ayni
  // seyi cizerse soru cevaplanamaz hale gelir.
  const imzalar = new Map();
  for (const ad of BEKLENEN) {
    const kayit = [];
    gorselKur(ad, izleyenKanvas(kayit), {}).ciz();
    const imza = kayit.join('|');
    const ayni = imzalar.get(imza);
    assert.ok(!ayni, `${ad} ile ${ayni} ayni cizimi uretiyor`);
    imzalar.set(imza, ad);
  }
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/gorsel-ingilizce.test.js`
Expected: FAIL, 13 cizim eksik

- [ ] **Step 3: Cizimleri yaz**

`src/ui/gorsel/temel.js` ve `src/ui/gorsel/cokgen.js` kaliplarini izle.
Sozlesme ayni: `create(canvas, { ses }) -> { ciz, dokun?, ipucu }`.

Bu cizimler sozlukte ve kelime kartinda gosteriliyor, ders etkinligi
degil; `dokun` ZORUNLU DEGIL. Ama `ipucu` yazilirsa kelime kartinin
altinda gorunur, bu yuzden ya anlamli yaz ya hic verme.

Yalniz `src/ui/gorsel/cizim.js` yardimcilarini kullan (`nokta`, `cizgi`,
`cember`, `yay`, `dikIsaret`, `etiket`, `altYazi`, `ok`, `temizle`,
`RENK`). Yeni ilkel gerekirse KENDI dosyanda yerel fonksiyon yaz;
`cizim.js`e DOKUNMA.

Tuval orani 1 : 0.62. Her sey 0.05..0.95 araliginda kalsin.

- [ ] **Step 4: Kayit defterine ekle**

`src/ui/gorsel/index.js` icine ithal ve `GORSELLER` icine 13 giris ekle.
Matematik girislerinin altina `// ingilizce` yorumuyla ayri blok yap.

- [ ] **Step 5: Testi calistir, YESIL gor**

Run: `node --test tests/gorsel-ingilizce.test.js`
Expected: PASS, 3 test

- [ ] **Step 6: Mutasyonla kaniti al**

1. Bir cizimi kayit defterinden cikar -> "sozlukteki her cizim adi kayit
   defterinde var" KIRMIZI. Geri al.
2. Iki cizimin govdesini ayni yap -> "birbirinden FARKLI ciziyor"
   KIRMIZI. Geri al.

- [ ] **Step 7: Kapsami OLC**

```bash
node --input-type=module -e "
import { SOZLUK } from './src/data/ingilizce/sozluk/index.js';
import { gorselVarMi } from './src/ui/gorsel/index.js';
const c = SOZLUK.filter(k=>k.gorsel.tip==='cizim');
const eksik = c.filter(k=>!gorselVarMi(k.gorsel.ad)).map(k=>k.gorsel.ad);
console.log('cizim gereken:', c.length, '| yazilan:', c.length-eksik.length);
console.log(eksik.length ? 'EKSIK: '+eksik.join(', ') : 'TAM');
"
```

- [ ] **Step 8: Tam suite ve commit**

```bash
npm test
git add src/ui/gorsel/ingilizce.js src/ui/gorsel/index.js tests/gorsel-ingilizce.test.js
git commit -m "feat(ingilizce): 13 kelime cizimi

Emojisi olmayan kelimeler (okul muduru, kural, el kaldir, toren...) artik
yer tutucu degil gercek cizim gosteriyor.

Simdi yaziliyorlar cunku dinle-sec asamasi dort gorsel gosterip dogrusunu
sectiriyor; dordu birden yer tutucu olursa soru cevaplanamaz hale gelir.

Test cizimlerin birbirinden FARKLI cizdigini de kontrol ediyor: iki cizim
ayni sonucu uretirse dinle-sec sorusu yine cevaplanamaz olur.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Quiz ve sinav ureticisi

**Files:**
- Create: `src/engines/ingilizce/uretici.js`
- Test: `tests/ingilizce-uretici.test.js`

**Interfaces:**
- Consumes: `SOZLUK`, `ING_HAFTALAR`, `tohumluRng` (test yardimcisi)
- Produces:
  - `soruUret(kelimeler, sozluk, rng)` -> `{ tip, soru, secenekler, dogru, cozum }`
  - `haftaQuizi(hafta, sozluk, rng, adet)` -> soru dizisi

**UC SORU TIPI**, olculen tur dagilimina gore:

| Tip | Sorulan | Neden |
|---|---|---|
| `en-tr` | "school bag ne demek?" -> dort Turkce secenek | Her kelimeye uygulanabilir |
| `tr-en` | "okul çantası İngilizcede ne?" -> dort Ingilizce secenek | Her kelimeye uygulanabilir |
| `bosluk` | "My ___ is red." -> dort Ingilizce secenek | Ornek cumleden turer, baglam olcer |

**Celdiriciler AYNI HAFTADAN secilir.** Baska haftanin kelimesi celdirici
olursa soru kolaylasir ve cocuk ogrenmeden gecer.

- [ ] **Step 1: Testi yaz**

```js
// tests/ingilizce-uretici.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { soruUret, haftaQuizi } from '../src/engines/ingilizce/uretici.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

const HAFTA4 = ING_HAFTALAR[0];

test('200 tohumda soru sozlesmesi bozulmuyor', () => {
  for (let s = 0; s < 200; s++) {
    const q = soruUret(HAFTA4.kelimeler, SOZLUK, tohumluRng(s));
    assert.ok(['en-tr', 'tr-en', 'bosluk'].includes(q.tip), `tip: ${q.tip}`);
    assert.equal(q.secenekler.length, 4, `tohum ${s}: ${q.secenekler.length} secenek`);
    assert.ok(q.dogru >= 0 && q.dogru < 4, `tohum ${s}: dogru indeks ${q.dogru}`);
    assert.equal(new Set(q.secenekler).size, 4, `tohum ${s}: secenek tekrari var`);
    assert.ok(q.soru.trim().length > 0, `tohum ${s}: soru bos`);
    assert.ok(q.cozum.trim().length > 0, `tohum ${s}: cozum bos`);
  }
});

test('celdiriciler AYNI HAFTANIN kelimelerinden gelir', () => {
  const haftaKelimeleri = HAFTA4.kelimeler.map((id) => SOZLUK.find((k) => k.id === id));
  const trKumesi = new Set(haftaKelimeleri.map((k) => k.tr));
  const enKumesi = new Set(haftaKelimeleri.map((k) => k.en));

  for (let s = 0; s < 200; s++) {
    const q = soruUret(HAFTA4.kelimeler, SOZLUK, tohumluRng(s));
    if (q.tip === 'en-tr') {
      for (const sec of q.secenekler) {
        assert.ok(trKumesi.has(sec),
          `tohum ${s}: "${sec}" bu haftanin kelimesi degil; baska haftadan celdirici soruyu kolaylastirir`);
      }
    }
    if (q.tip === 'tr-en' || q.tip === 'bosluk') {
      for (const sec of q.secenekler) {
        assert.ok(enKumesi.has(sec), `tohum ${s}: "${sec}" bu haftanin kelimesi degil`);
      }
    }
  }
});

test('dogru secenek GERCEKTEN dogru cevap', () => {
  for (let s = 0; s < 200; s++) {
    const q = soruUret(HAFTA4.kelimeler, SOZLUK, tohumluRng(s));
    const kelime = SOZLUK.find((k) => k.id === q.kelimeId);
    assert.ok(kelime, `tohum ${s}: kelimeId cozulemedi`);
    const beklenen = q.tip === 'en-tr' ? kelime.tr : kelime.en;
    assert.equal(q.secenekler[q.dogru], beklenen,
      `tohum ${s} (${q.tip}): dogru sik yanlis kelimeyi gosteriyor`);
  }
});

test('bosluk sorusu kelimenin kendisini GIZLER', () => {
  let bulundu = 0;
  for (let s = 0; s < 400; s++) {
    const q = soruUret(HAFTA4.kelimeler, SOZLUK, tohumluRng(s));
    if (q.tip !== 'bosluk') continue;
    bulundu++;
    const kelime = SOZLUK.find((k) => k.id === q.kelimeId);
    assert.ok(!q.soru.toLowerCase().includes(kelime.en.toLowerCase()),
      `tohum ${s}: soru cevabi iceriyor -> "${q.soru}"`);
    assert.ok(q.soru.includes('___'), `tohum ${s}: bosluk isareti yok`);
  }
  assert.ok(bulundu > 0, '400 tohumda hic bosluk sorusu cikmadi');
});

test('uc tipin ucu de 200 tohumda cikiyor', () => {
  const tipler = new Set();
  for (let s = 0; s < 200; s++) tipler.add(soruUret(HAFTA4.kelimeler, SOZLUK, tohumluRng(s)).tip);
  assert.equal(tipler.size, 3, `yalniz ${[...tipler].join(', ')} cikti`);
});

test('haftaQuizi istenen sayida soru verir ve kelimeleri tekrarlamaz', () => {
  const q = haftaQuizi(HAFTA4, SOZLUK, tohumluRng(1), 8);
  assert.equal(q.length, 8);
  const idler = q.map((x) => x.kelimeId);
  assert.equal(idler.length, new Set(idler).size,
    'ayni kelime iki kez sorulmus; hafta 8 kelimeden fazla tasiyor');
});

test('istenen sayi kelime sayisini asarsa kelime sayisi kadar doner', () => {
  const q = haftaQuizi(HAFTA4, SOZLUK, tohumluRng(2), 99);
  assert.equal(q.length, HAFTA4.kelimeler.length,
    'var olandan fazla soru uretilmemeli, kelime tekrar edilmemeli');
});

test('ayni tohum ayni quizi verir', () => {
  const a = haftaQuizi(HAFTA4, SOZLUK, tohumluRng(7), 6).map((q) => q.kelimeId + q.tip);
  const b = haftaQuizi(HAFTA4, SOZLUK, tohumluRng(7), 6).map((q) => q.kelimeId + q.tip);
  assert.deepEqual(a, b);
});
```

- [ ] **Step 2: Testi calistir, KIRMIZI gor**

Run: `node --test tests/ingilizce-uretici.test.js`
Expected: FAIL, modul yok

- [ ] **Step 3: Uygula**

Uretici saf olmali: `Math.random()` YOK, disaridan gelen `rng` kullanilir.
`tests/yardim/soru-sozlesmesi.js` icindeki `tohumluRng` kalibina bak.

Bosluk sorusu `kelime.ornek.en` icindeki kelimeyi `___` ile degistirir.
Kelime cumlede gecmiyorsa (Faz 1 testi bunu garanti ediyor ama yine de)
o kelime icin `bosluk` tipi SECILMEZ, baska tipe dusulur.

- [ ] **Step 4: Testi calistir, YESIL gor**

Run: `node --test tests/ingilizce-uretici.test.js`
Expected: PASS, 8 test

- [ ] **Step 5: Mutasyonla kaniti al, UC kez**

1. Celdiricileri tum `SOZLUK`tan sec -> "celdiriciler AYNI HAFTANIN"
   KIRMIZI. Geri al.
2. Bosluk sorusunda `___` degistirmesini kaldir -> "kelimenin kendisini
   GIZLER" KIRMIZI. Geri al.
3. `haftaQuizi`de kelime tekrarini engelleyen kontrolu kaldir ve 99 soru
   iste -> "istenen sayi kelime sayisini asarsa" KIRMIZI. Geri al.

- [ ] **Step 6: Tam suite ve commit**

```bash
npm test
git add src/engines/ingilizce/uretici.js tests/ingilizce-uretici.test.js
git commit -m "feat(ingilizce): quiz ve sinav sorusu ureticisi

Uc tip: en-tr, tr-en ve ornek cumleden turetilen bosluk doldurma.

Celdiriciler AYNI HAFTADAN seciliyor ve testi var. Baska haftanin
kelimesi celdirici olsaydi soru kolaylasirdi ve cocuk ogrenmeden gecerdi.

Bosluk sorusunun cevabi sorunun icinde gecmiyor; 400 tohumda kontrol
ediliyor.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Ekranlar ve baglanti

**Files:**
- Modify: `src/views/ingilizce.js`, `src/ui/ingilizce-dom.js` (yeni), `src/main.js`, `src/core/i18n.js`, `styles-v2.css`, `sw.js`
- Test: `tests/ingilizce-ekran.test.js`

**Interfaces:**
- Consumes: Task 1-4'un tamami
- Produces: Calisan hafta karti, kelime karti, dinle-sec, quiz ve tema sinavi ekranlari

**DINLE-SEC TASARIMI - olculen tur dagilimina gore:**

46 kelimenin 40'i isim, 6'si fiil/ifade. Dort GORSEL gosterip dogrusunu
sectirmek isimlerde calisir; `listen`, `speak`, `run`, `be quiet`,
`be on time`, `raise your hand` icin resim secimi zayif.

**Karar:** Dinle-sec, kelimenin gorsel tipine gore soru sekli degistirir:
- Gorseli olan (emoji ya da cizim) kelimeler -> dort GORSEL, sesi duyup
  dogrusunu sec
- Fiil ve ifadeler -> dort TURKCE metin, sesi duyup dogrusunu sec

Ikisi de "sesi duy, dogrusunu sec" olarak kalir; yalnizca secenegin
bicimi degisir. Bu ayrimin testi yazilir.

- [ ] **Step 1: i18n anahtarlarini ekle**

Eklemeden once `grep -c "'ing\." src/core/i18n.js` calistir; tekrari
`tests/i18n.test.js` goremiyor.

`tr` blogu:

```js
    'ing.week': '{n}. hafta',
    'ing.theme': 'Tema',
    'ing.stage.kelime': 'Kelimeler',
    'ing.stage.dinle': 'Dinle ve seç',
    'ing.stage.soyle': 'Söyle',
    'ing.stage.cumle': 'Cümle kur',
    'ing.stage.quiz': 'Quiz',
    'ing.cardOf': '{n} / {t}',
    'ing.listen': 'Dinle',
    'ing.next': 'İleri',
    'ing.back': 'Geri',
    'ing.close': 'Kapat',
    'ing.finishCards': 'Kartları bitir',
    'ing.pickHeard': 'Duyduğun kelimeyi seç',
    'ing.correct': 'Doğru!',
    'ing.wrong': 'Bu değil. Doğrusu:',
    'ing.quizResult': '{n} / {t} doğru',
    'ing.themeExam': 'Tema sınavı',
    'ing.themeExamLocked': 'Tema sınavı için 4 haftanın quizini geçmen gerekiyor.',
    'ing.starsEarned': '{n} yıldız kazandın!',
    'ing.notReady': 'Bu haftanın içeriği henüz hazırlanıyor.',
```

`en` blogunda ayni anahtarlarin Ingilizce karsiliklari.

- [ ] **Step 2: Sunum modelini yaz ve testini yaz**

```js
// tests/ingilizce-ekran.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingHaftaKarti, kartModeli, dinleSecModeli } from '../src/views/ingilizce.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { bosIngHafta } from '../src/engines/ingilizce/ders.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

const H4 = ING_HAFTALAR[0];

test('hafta karti bes asamayi ve ilerlemeyi tasir', () => {
  const k = ingHaftaKarti(H4, SOZLUK, { haftalar: {} });
  assert.equal(k.no, 4);
  assert.equal(k.kelimeSayisi, H4.kelimeler.length);
  assert.equal(Object.keys(k.durum.asamalar).length, 5);
  assert.equal(k.durum.yuzde, 0);
});

test('kart modeli sozlukten TUM alanlari getirir', () => {
  const m = kartModeli(H4, SOZLUK, 0);
  for (const alan of ['id', 'en', 'tr', 'gorsel', 'ornek']) {
    assert.ok(alan in m.kelime, `kartta ${alan} yok`);
  }
  assert.equal(m.index, 0);
  assert.equal(m.toplam, H4.kelimeler.length);
  assert.equal(m.sonMu, false);
});

test('kart indexi sinirlarin disina tasmaz', () => {
  assert.equal(kartModeli(H4, SOZLUK, -5).index, 0);
  assert.equal(kartModeli(H4, SOZLUK, 999).index, H4.kelimeler.length - 1);
  assert.equal(kartModeli(H4, SOZLUK, 999).sonMu, true);
});

test('dinle-sec gorselli kelimede GORSEL secenek verir', () => {
  const gorselli = H4.kelimeler.find((id) => SOZLUK.find((k) => k.id === id).tur === 'isim');
  const m = dinleSecModeli(H4, SOZLUK, tohumluRng(1), gorselli);
  assert.equal(m.bicim, 'gorsel');
  assert.equal(m.secenekler.length, 4);
  for (const s of m.secenekler) assert.ok(s.gorsel, 'gorsel secenek gorsel tasimali');
});

test('dinle-sec fiil ve ifadede METIN secenek verir', () => {
  // 46 kelimenin 40'i isim, 6'si fiil/ifade. Fiil icin dort resim
  // gostermek zayif bir soru olurdu.
  const fiil = SOZLUK.find((k) => k.tema === 1 && k.tur !== 'isim');
  if (!H4.kelimeler.includes(fiil.id)) return; // bu hafta fiil yoksa atla
  const m = dinleSecModeli(H4, SOZLUK, tohumluRng(1), fiil.id);
  assert.equal(m.bicim, 'metin');
  for (const s of m.secenekler) assert.ok(s.metin, 'metin secenek metin tasimali');
});

test('dinle-sec dogru secenek GERCEKTEN dogru', () => {
  for (let s = 0; s < 50; s++) {
    for (const id of H4.kelimeler) {
      const m = dinleSecModeli(H4, SOZLUK, tohumluRng(s), id);
      assert.equal(m.secenekler[m.dogru].id, id, `tohum ${s}, kelime ${id}`);
      assert.equal(new Set(m.secenekler.map((x) => x.id)).size, 4, 'secenek tekrari');
    }
  }
});
```

- [ ] **Step 3: Testi calistir, KIRMIZI gor, uygula, YESIL gor**

Run: `node --test tests/ingilizce-ekran.test.js`

- [ ] **Step 4: Ekranlari ve olaylari bagla**

`src/ui/ingilizce-dom.js` icinde `ingHaftaEkrani`, `kartEkrani`,
`dinleSecEkrani`, `ingSonucEkrani`. Matematikteki `ders-dom.js`
kaliplarini izle; `secenekListesi` gibi paylasilan parcalar varsa
kopyalama, ithal et.

`src/main.js` icinde `dersSecim === 'ingilizce'` dalini "hazirlaniyor"
mesajindan gercek hafta kartina cevir. Widget ve gorsel yasam dongusu
icin R26 kalibini izle: tek yeniden kurma noktasi, ayni adim tekrar
gelince dokunma.

**Ses:** kelime kartinda ve dinle-sec'te `ses.oku({ metin: kelime.en,
ses: 'en/' + id, dil: 'en' })`. Her cagridan ONCE `ses.dur()` - Faz 1'de
iki sesin ust uste calmasi gercek bir hata olarak bulundu.

- [ ] **Step 5: sw.js ve CSS**

`CACHE_NAME` `'ataol-ai-v44'`. Yeni `src/` dosyalarini ASSETS'e ekle.
`sesler/` GIRMEZ.

CSS icin `styles-v2.css` sonuna ekle; `ders-kart`, `soru__` ve
`sozluk__` kaliplarini izle, yeni tema icat etme.

- [ ] **Step 6: Tam suite ve TARAYICIDA dogrula**

`src/main.js` test edilemiyor. Tarayicida dogrula ve raporda ne gorduğunu yaz:

1. Ingilizce sekmesi 4. haftanin kartini gosteriyor mu (bes asama rozeti)
2. "Kelimeler" -> kart aciliyor, gorsel ve ornek cumle gorunuyor mu
3. Dinle dugmesi gercek mp3 caliyor mu (cihaz TTS'i DEGIL)
4. Kartlari bitirince 4 yildiz geliyor ve asama yesil oluyor mu
5. "Dinle ve seç" -> ses caliyor, dort secenek geliyor mu
6. Isim kelimede dort GORSEL, fiilde dort METIN cikiyor mu
7. %70 gecince 3 yildiz geliyor mu
8. Quiz 8-10 soru soruyor, gecince 6 yildiz veriyor mu
9. Dort haftanin quizi gecilmeden tema sinavi KILITLI mi
10. Iki Dinle dugmesine arka arkaya basinca ikisi ust uste CALMIYOR mu
11. Matematik ve Sozluk bozulmamis mi
12. Konsolda hata var mi (olmamali)
13. 390px'te yatay tasma var mi (olmamali)

- [ ] **Step 7: Commit**

```bash
npm test
git add src/views/ingilizce.js src/ui/ingilizce-dom.js src/main.js \
        src/core/i18n.js styles-v2.css sw.js tests/ingilizce-ekran.test.js
git commit -m "feat(ingilizce): hafta karti, kelime kartlari, dinle-sec ve quiz

Dinle-sec soru bicimini kelimenin turune gore degistiriyor: isimlerde
dort gorsel, fiil ve ifadelerde dort Turkce metin. Sebebi olculdu -
46 kelimenin 40'i isim, 6'si fiil/ifade ve fiil icin dort resim
gostermek zayif bir soru olurdu.

Her ses cagrisindan once ses.dur(): Faz 1'de iki sesin ust uste calmasi
gercek bir hata olarak bulunmustu.

sw.js: yeni dosyalar ASSETS'e, CACHE_NAME v44. sesler/ yine disarida.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Anlatim sesleri

**Files:**
- Modify: `tools/ses-uret.js`, `README.md`
- Test: elle calistirma

**Interfaces:**
- Consumes: `ING_HAFTALAR`
- Produces: `sesler/tr-ing/<haftaNo>-<adimId>.mp3`

Anlatim metinleri TURKCE ve Turkce sesle okunur (`tr-TR-Chirp3-HD-Aoede`).
Ornekler zaten `sesler/en/<id>-ornek.mp3` olarak Faz 1'de uretildi.

- [ ] **Step 1: Uc kaynak ekle**

Script su an iki kaynak isliyor (matematik, ingilizce kelime). Ucuncuyu
ekle: `ING_HAFTALAR` uzerinden anlatim adimlari, `tr` sesiyle,
`tr-ing/<hafta>-<adimId>` kimligiyle.

Komut satiri: `node tools/ses-uret.js ingilizce-anlatim`.

- [ ] **Step 2: Anahtarsiz calistir**

```bash
node tools/ses-uret.js ingilizce-anlatim; echo "cikis kodu: $?"
```
Expected: `GOOGLE_TTS_KEY ortam degiskeni gerekli.` ve cikis kodu 1

- [ ] **Step 3: Sesleri uret**

**Bu adimi KULLANICI calistirir.** Uygulayici anahtari istemez ve
raporunda bunun bekledigini yazar.

- [ ] **Step 4: Ad tutarliligini dogrula**

```bash
node --input-type=module -e "
import { ING_HAFTALAR } from './src/data/ingilizce/haftalar.js';
import { existsSync } from 'node:fs';
const eksik = [];
for (const h of ING_HAFTALAR)
  for (const a of h.anlatim)
    if (!existsSync('sesler/tr-ing/' + h.hafta + '-' + a.id + '.mp3'))
      eksik.push(h.hafta + '-' + a.id);
console.log(eksik.length ? 'EKSIK: ' + eksik.join(', ') : 'Tum anlatim sesleri var');
"
```

- [ ] **Step 5: README ve commit**

```bash
npm test
git add tools/ses-uret.js README.md sesler/tr-ing/
git commit -m "feat(ingilizce): anlatim sesleri (tr-TR)

Anlatim Turkce yazilip Turkce seslendirilir, ornek Ingilizce. Ucuncu
kaynak mevcut scripte eklendi, ayri script yazilmadi.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Faz 2a sonrasi dogrulama listesi

1. Ingilizce sekmesi 4. haftanin kartini, bes asama rozetini gosteriyor
2. Kelime kartlari aciliyor, gorsel + ornek cumle + ses calisiyor
3. 13 cizim yer tutucu degil gercek cizim gosteriyor
4. Kartlar bitince 4 yildiz, asama yesil
5. Dinle-sec: isimde dort gorsel, fiilde dort metin
6. %70 gecince 3 yildiz, tekrar gecmek yildiz VERMIYOR
7. Quiz gecince 6 yildiz, tam puanda 10
8. Dort haftanin quizi gecilmeden tema sinavi kilitli
9. Tema sinavi gecince 15 yildiz
10. Hafta basina toplam 13 yildiz (matematikle ayni)
11. Iki ses ust uste CALMIYOR
12. Matematik ve Sozluk bozulmamis
13. Ucak modunda dersler calisiyor
14. Konsolda hata yok, 390px'te tasma yok
15. `npm test` tamamen yesil

## Faz 2b notu

"Soyle-dinle" ve "cumle kur" asamalari ayri plana birakildi. Ikisi de
yildiz ODEMIYOR (spec D12), yani bu plan bittiginde odul ekonomisi
TAMAMLANMIS olur; 2b yalnizca alistirmayi derinlestirir.

**2b'nin cozulmemis riski:** spec D6 "soyle-dinle"nin `MediaRecorder` ile
kayit alip model sesiyle karsilastirmasini soyluyor ve bunun gercek
iPhone'da dogrulanmasi gerektigini yaziyor. Ben o cihaza erisemiyorum.
2b plani yazilirken karar: ozellik tespiti yapilip `MediaRecorder` ya da
`getUserMedia` yoksa asama sessizce "dinle ve tekrarla"ya duser ve bu
kullaniciya SOYLENIR. Boylece cihaz ne olursa olsun calisan bir sey
teslim edilir ve kirik bir dugme kalmaz.
