# Matematik Mufredat Modulu - Faz 0 ve Faz 1 Uygulama Plani

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5. sinif matematik mufredatinin haftalik ders iskeletini kurmak ve
ilk uniteyi (Geometrik Sekiller, 1-8. haftalar) sesli anlatim, etkilesimli
widget, sinirsiz alistirma, hafta quizi ve unite sinaviyla calisir hale
getirmek.

**Architecture:** Konu merkezli veri modeli. `data/mufredat.js` haftalari
konu-seviye ciftlerine esler; `data/konular/*.js` icerigi tasir; saf
motorlar (`engines/`) hafta bulma, ders akisi, soru uretimi ve sinav
puanlamasini yapar; DOM yalnizca `main.js` ve `ui/` altinda yasar. Sorularin
cevaplari parametrelerden insa yoluyla uretilir, tahminle degil.

**Tech Stack:** Bagimliliksiz ES modulleri, `node:test` yerlesik test
runner'i, Canvas 2D, Web Speech API, Web Audio API, Google Cloud
Text-to-Speech Chirp 3 HD (yalnizca uretim scripti).

**Spec:** `docs/2026-09-21-faz3a-matematik-mufredat-tasarim.md`

**Dal:** `feat/matematik-mufredat`

## Global Constraints

Her gorevin gereksinimleri asagidakileri ortulu olarak icerir.

- **Bagimlilik yok.** `node_modules` yok, build adimi yok, paket kurulmaz.
  `package.json` icindeki tek script `test`'tir ve degismez.
- **Bagimlilik yonu tek tarafli:** `views` -> `engines` -> `core`. Ters
  import yasak. `engines` ve `core`, `views`'i import edemez.
- **Motorlar saftir.** `engines/` altinda `Date.now()`, argumansiz
  `new Date()` ve `Math.random()` yasaktir. Zaman ve rastgelelik disaridan
  enjekte edilir.
- **HTML enjeksiyon sinki yasagi.** Hicbir dosyada `innerHTML`,
  `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`,
  `new Function`, `srcdoc` gecmez. Metin daima `textContent` ile yazilir.
- **DOM yalnizca `main.js` ve `ui/` altinda.** `engines/`, `core/`,
  `views/` icinde `document`, `window.` ve `addEventListener` gecmez.
- **Kisi adi sabit yazilmaz.** `core/` ve `engines/` icinde `Deha`,
  `Feride`, `Sertac` gecmez. Isimler profil verisinden gelir.
- **Ders icerigi yalnizca Turkce.** Arayuz anahtarlari `core/i18n.js`
  icinde TR ve EN olarak ikisi birden eklenir (`tests/i18n.test.js` esitligi
  zorlar), ders metinleri yalnizca TR yazilir.
- **Turkce karakter kullanimi:** kaynak kod yorumlari ve degisken adlari
  ASCII kalir (mevcut kalip). Kullaniciya gorunen metinler (i18n degerleri,
  ders icerigi) tam Turkce karakterlidir.
- **Test komutu:** `npm test` yani `node --test "tests/**/*.test.js"`.
- **Commit mesajlari Turkce ve mevcut kalipta:** `feat(ders): ...`,
  `test(ders): ...`, `fix(ders): ...`.

## Dosya Yapisi

Faz 0 ve Faz 1'de olusturulacak veya degistirilecek dosyalar:

| Dosya | Sorumluluk |
|---|---|
| `src/data/mufredat.js` | 37 haftanin konu-seviye eslemesi, tatiller, uniteler. Icerik tasimaz |
| `src/data/konular/temel-cizimler.js` | 2 seviye ders icerigi (h1-2) |
| `src/data/konular/aci-olcme.js` | 2 seviye ders icerigi (h3-4) |
| `src/data/konular/cokgenler-cember.js` | 4 seviye ders icerigi (h5-8) |
| `src/data/konular/index.js` | Konu kayit defteri, id -> konu nesnesi |
| `src/engines/mufredat.js` | Hafta bulma, gezinme, unite haftalari, kazanim durumu |
| `src/engines/ders.js` | Ders akisi durum makinesi, asama tamamlama, yildiz hesabi |
| `src/engines/sinav.js` | Quiz ve sinav kurma, cevaplama, puanlama |
| `src/engines/uretici/index.js` | Uretici kayit defteri |
| `src/engines/uretici/temel-cizimler.js` | Soru ureticisi |
| `src/engines/uretici/aci-olcme.js` | Soru ureticisi |
| `src/engines/uretici/cokgenler-cember.js` | Soru ureticisi |
| `src/engines/widgets/aci.js` | Aci hesaplari (saf) |
| `src/views/ders.js` | Hafta karti ve ekran modeli, DOM yok |
| `src/ui/ses.js` | Ses dosyasi calma, TTS'e dusme, efekt sentezi |
| `src/ui/ders-dom.js` | Ders ekranlarinin DOM'u |
| `src/ui/widget/aciolcer.js` | Aciolcer widget'i |
| `src/ui/widget/geometri-tuval.js` | Geometrik cizim widget'i |
| `src/core/state.js` | **Degisir:** `loadDersIlerleme` / `saveDersIlerleme` |
| `src/core/i18n.js` | **Degisir:** ders arayuz anahtarlari (TR + EN) |
| `src/main.js` | **Degisir:** Ders sekmesi yonlendirmesi, `ders-dom` cagrisi |
| `v2.html` | **Degisir:** `view-ders` ve nav butonu |
| `sw.js` | **Degisir:** yeni `src/` dosyalari, `CACHE_NAME` v38 |
| `tests/architecture.test.js` | **Degisir:** `ui/` alti DOM kullanabilir |
| `tools/ses-uret.js` | Chirp 3 HD ile `sesler/*.m4a` uretimi |
| `tests/yardim/soru-sozlesmesi.js` | Uretici property testleri icin ortak dogrulayici |

---

# FAZ 0: Iskelet

## Task 1: Mimari testini gevset

Widget'lar canvas ve pointer olaylari kullanacak. Mevcut test DOM kullanan
dosyalarin tam listesini zorluyor ve yeni dosyalarin eklenmesini imkansiz
kiliyor. Kural, amacini koruyacak sekilde gevsetilir.

**Files:**
- Modify: `tests/architecture.test.js:74-77`
- Create: `src/ui/ornek-dom.js` (gecici, Step 1'de olusur, Step 5'te silinir)

**Interfaces:**
- Consumes: yok
- Produces: `ui/` altindaki her dosya `document` kullanabilir. Sonraki tum
  widget ve `ders-dom` gorevleri buna dayanir.

- [ ] **Step 1: Kuralin su an yeni dosyayi reddettigini kanitla**

Gecici bir dosya olustur:

```js
// src/ui/ornek-dom.js
export function kok() {
  return document.getElementById('app');
}
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `npm test`
Expected: FAIL. `DOM sadece main.js ve ui altinda kullanilir` testi
`ui/ornek-dom.js` dosyasini beklenmedik bulup `deepEqual` hatasi verir.

- [ ] **Step 3: Kurali gevset**

`tests/architecture.test.js` sonundaki testi tamamen degistir:

```js
test('DOM sadece main.js ve ui altinda kullanilir', () => {
  for (const { yol, src } of TUM) {
    if (!src.includes('document')) continue;
    assert.ok(
      yol === 'main.js' || yol.startsWith('ui/'),
      `${yol} DOM kullanamaz; DOM yalniz main.js ve ui/ altinda yasar`
    );
  }
});
```

Ayni dosyadaki `views core ve engines DOM api si icermez` testi
DEGISMEZ. Asil koruma odur: `engines`, `core` ve `views` temiz kalir.
`SINKLER` listesi de DEGISMEZ; `innerHTML` yasagi tum agacta surer.

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `npm test`
Expected: PASS. Tum testler gecer, `ui/ornek-dom.js` artik kabul edilir.

- [ ] **Step 5: Gecici dosyayi sil ve testin hala gectigini dogrula**

```bash
rm src/ui/ornek-dom.js
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/architecture.test.js
git commit -m "test(mimari): DOM kurali ui/ altina acilsin

Widget'lar canvas ve pointer olayi kullanacak. Kuralin amaci DOM'u
belirli bir katmanda tutmakti; tam dosya listesi yerine katman kurali
ayni amaci sagliyor. engines, core ve views kurali aynen duruyor,
innerHTML yasagi da tum agacta surdurulur."
```

---

## Task 2: Mufredat takvim verisi

37 haftanin konu-seviye eslemesi. Bu dosya icerik tasimaz, yalnizca esleme
tasir. Testler veriyi butunluk acisindan dogrular; bu tablo tum modulun
referansidir, hatasi her yere yayilir.

**Files:**
- Create: `src/data/mufredat.js`
- Test: `tests/mufredat-veri.test.js`

**Interfaces:**
- Consumes: yok
- Produces:
  - `TAKVIM: Array<{ hafta: number, bas: string, bit: string, dersSaati: number, unite: string, dersler: Array<{ konu: string, seviye: number }> }>`
  - `TATILLER: Array<{ ad: string, bas: string, bit: string }>`
  - `UNITELER: Array<{ id: string, ad: string, ilk: number, son: number }>`
  - `KONU_IDLERI: string[]` (15 konu kimligi)
  - Tarihler `'YYYY-MM-DD'` bicimindedir, `Date` nesnesi degil.

- [ ] **Step 1: Basarisiz butunluk testlerini yaz**

```js
// tests/mufredat-veri.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER, UNITELER, KONU_IDLERI } from '../src/data/mufredat.js';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

test('37 hafta vardir ve numaralar 1den 37ye kesintisizdir', () => {
  assert.equal(TAKVIM.length, 37);
  TAKVIM.forEach((h, i) => assert.equal(h.hafta, i + 1));
});

test('tum tarihler ISO bicimindedir ve bas bitten sonra degildir', () => {
  for (const h of TAKVIM) {
    assert.match(h.bas, ISO, `hafta ${h.hafta} bas`);
    assert.match(h.bit, ISO, `hafta ${h.hafta} bit`);
    assert.ok(h.bas <= h.bit, `hafta ${h.hafta} tarih siralamasi bozuk`);
  }
});

test('haftalar zaman icinde ileri gider ve ust uste binmez', () => {
  for (let i = 1; i < TAKVIM.length; i++) {
    assert.ok(
      TAKVIM[i - 1].bit < TAKVIM[i].bas,
      `hafta ${TAKVIM[i].hafta} onceki haftayla cakisiyor`
    );
  }
});

test('hicbir hafta tatil araligiyla cakismaz', () => {
  for (const h of TAKVIM) {
    for (const t of TATILLER) {
      const cakisma = h.bas <= t.bit && t.bas <= h.bit;
      assert.ok(!cakisma, `hafta ${h.hafta} "${t.ad}" ile cakisiyor`);
    }
  }
});

test('37. hafta disinda her hafta en az bir derse baglidir', () => {
  for (const h of TAKVIM) {
    if (h.hafta === 37) {
      assert.equal(h.dersler.length, 0, 'sosyal etkinlik haftasinda ders olmaz');
      continue;
    }
    assert.ok(h.dersler.length >= 1 && h.dersler.length <= 2,
      `hafta ${h.hafta} ders sayisi ${h.dersler.length}`);
  }
});

test('toplam 42 konu-seviye cifti vardir', () => {
  const toplam = TAKVIM.reduce((n, h) => n + h.dersler.length, 0);
  assert.equal(toplam, 42);
});

test('her ders bilinen bir konuya isaret eder', () => {
  for (const h of TAKVIM) {
    for (const d of h.dersler) {
      assert.ok(KONU_IDLERI.includes(d.konu),
        `hafta ${h.hafta}: bilinmeyen konu "${d.konu}"`);
      assert.ok(Number.isInteger(d.seviye) && d.seviye >= 1,
        `hafta ${h.hafta}: gecersiz seviye`);
    }
  }
});

test('her konunun seviyeleri 1den baslar ve bosluksuz artar', () => {
  const gorulen = new Map();
  for (const h of TAKVIM) {
    for (const d of h.dersler) {
      if (!gorulen.has(d.konu)) gorulen.set(d.konu, []);
      gorulen.get(d.konu).push(d.seviye);
    }
  }
  assert.equal(gorulen.size, KONU_IDLERI.length, 'kullanilmayan konu var');
  for (const [konu, seviyeler] of gorulen) {
    const sirali = [...seviyeler].sort((a, b) => a - b);
    assert.deepEqual(sirali, seviyeler, `${konu} seviyeleri takvimde sirali degil`);
    sirali.forEach((s, i) => assert.equal(s, i + 1, `${konu} seviye bosluklu`));
  }
});

test('her hafta bilinen bir uniteye aittir', () => {
  const idler = UNITELER.map((u) => u.id);
  for (const h of TAKVIM) {
    if (h.hafta === 37) continue;
    assert.ok(idler.includes(h.unite), `hafta ${h.hafta}: bilinmeyen unite`);
  }
});

test('unite sinirlari takvimle tutarlidir', () => {
  for (const u of UNITELER) {
    const haftalar = TAKVIM.filter((h) => h.unite === u.id).map((h) => h.hafta);
    assert.ok(haftalar.length > 0, `${u.id} icin hafta yok`);
    assert.equal(Math.min(...haftalar), u.ilk, `${u.id} ilk hafta`);
    assert.equal(Math.max(...haftalar), u.son, `${u.id} son hafta`);
  }
});

test('dersSaati makul araliktadir', () => {
  for (const h of TAKVIM) {
    assert.ok(h.dersSaati >= 1 && h.dersSaati <= 5,
      `hafta ${h.hafta} ders saati ${h.dersSaati}`);
  }
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/mufredat-veri.test.js`
Expected: FAIL, `Cannot find module '../src/data/mufredat.js'`.

- [ ] **Step 3: Veri dosyasini yaz**

`src/data/mufredat.js`. Tablo spec Bolum 4.3'ten birebir alinmistir; Excel
kaynagidir, tahmin degildir. `14, 22, 29, 30, 32, 35` numarali haftalar iki
derse birden baglidir, bu planin kendisinden gelir.

```js
/**
 * 2026-2027 egitim yili 5. sinif matematik cerceve yillik plani.
 *
 * Bu bir VERI dosyasidir, motor degildir. Yalnizca ESLEME tasir: hangi
 * hafta hangi konunun kacinci seviyesini aciyor. Ders metni ve sorular
 * burada durmaz; onlar data/konular/ altindadir.
 *
 * Kaynak: MEB Talim Terbiye Kurulu 07.08.2026 tarih 70 sayili karar eki
 * Matematik Dersi Ogretim Programi, "MATEMATIK 5. Sinif Cerceve Yillik
 * Plan" calisma takvimi.
 *
 * Alti hafta (14, 22, 29, 30, 32, 35) iki konuya birden dusuyor; planin
 * kendisi o haftalarda ders saatini boluyor (3+2, 2+3, 4+1 gibi).
 * "(2)*" ile isaretli okul temelli planlama suresi dersSaati'ne dahil
 * DEGILDIR.
 *
 * Tarihler 'YYYY-MM-DD' metnidir, Date degil: motorlar saf kalsin ve
 * saat dilimi kaymasi yasanmasin diye.
 */

export const KONU_IDLERI = [
  'temel-cizimler',
  'aci-olcme',
  'cokgenler-cember',
  'cok-basamakli-sayilar',
  'dort-islem-problem',
  'dikdortgen',
  'kesir-gosterim',
  'kesir-karsilastirma',
  'kategorik-veri',
  'veri-yorumlama',
  'esitlik-islem-ozellikleri',
  'islem-onceligi',
  'oruntuler',
  'algoritma',
  'olasilik'
];

export const UNITELER = [
  { id: 'geometrik-sekiller',   ad: 'Geometrik Şekiller',                ilk: 1,  son: 8 },
  { id: 'sayilar-1',            ad: 'Sayılar ve Nicelikler 1',           ilk: 9,  son: 14 },
  { id: 'geometrik-nicelikler', ad: 'Geometrik Nicelikler',              ilk: 15, son: 18 },
  { id: 'sayilar-2',            ad: 'Sayılar ve Nicelikler 2',           ilk: 19, son: 25 },
  { id: 'istatistik',           ad: 'İstatistiksel Araştırma Süreci',    ilk: 26, son: 30 },
  { id: 'cebir',                ad: 'İşlemlerle Cebirsel Düşünme',       ilk: 31, son: 35 },
  { id: 'olasilik',             ad: 'Veriden Olasılığa',                 ilk: 36, son: 36 }
];

const d = (konu, seviye) => ({ konu, seviye });

export const TAKVIM = [
  { hafta: 1,  bas: '2026-09-14', bit: '2026-09-18', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('temel-cizimler', 1)] },
  { hafta: 2,  bas: '2026-09-21', bit: '2026-09-25', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('temel-cizimler', 2)] },
  { hafta: 3,  bas: '2026-09-28', bit: '2026-10-02', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('aci-olcme', 1)] },
  { hafta: 4,  bas: '2026-10-05', bit: '2026-10-09', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('aci-olcme', 2)] },
  { hafta: 5,  bas: '2026-10-12', bit: '2026-10-16', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 1)] },
  { hafta: 6,  bas: '2026-10-19', bit: '2026-10-23', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 2)] },
  { hafta: 7,  bas: '2026-10-26', bit: '2026-10-30', dersSaati: 3, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 3)] },
  { hafta: 8,  bas: '2026-11-02', bit: '2026-11-06', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 4)] },
  { hafta: 9,  bas: '2026-11-09', bit: '2026-11-13', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('cok-basamakli-sayilar', 1)] },
  { hafta: 10, bas: '2026-11-23', bit: '2026-11-27', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('cok-basamakli-sayilar', 2)] },
  { hafta: 11, bas: '2026-11-30', bit: '2026-12-04', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 1)] },
  { hafta: 12, bas: '2026-12-07', bit: '2026-12-11', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 2)] },
  { hafta: 13, bas: '2026-12-14', bit: '2026-12-18', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 3)] },
  { hafta: 14, bas: '2026-12-21', bit: '2026-12-25', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 4), d('dikdortgen', 1)] },
  { hafta: 15, bas: '2026-12-28', bit: '2026-12-31', dersSaati: 3, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 2)] },
  { hafta: 16, bas: '2027-01-04', bit: '2027-01-08', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 3)] },
  { hafta: 17, bas: '2027-01-11', bit: '2027-01-15', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 4)] },
  { hafta: 18, bas: '2027-01-18', bit: '2027-01-22', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 5)] },
  { hafta: 19, bas: '2027-02-08', bit: '2027-02-12', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 1)] },
  { hafta: 20, bas: '2027-02-15', bit: '2027-02-19', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 2)] },
  { hafta: 21, bas: '2027-02-22', bit: '2027-02-26', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 3)] },
  { hafta: 22, bas: '2027-03-01', bit: '2027-03-05', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 4), d('kesir-karsilastirma', 1)] },
  { hafta: 23, bas: '2027-03-15', bit: '2027-03-19', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 2)] },
  { hafta: 24, bas: '2027-03-22', bit: '2027-03-26', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 3)] },
  { hafta: 25, bas: '2027-03-29', bit: '2027-04-02', dersSaati: 3, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 4)] },
  { hafta: 26, bas: '2027-04-05', bit: '2027-04-09', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 1)] },
  { hafta: 27, bas: '2027-04-12', bit: '2027-04-16', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 2)] },
  { hafta: 28, bas: '2027-04-19', bit: '2027-04-23', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 3)] },
  { hafta: 29, bas: '2027-04-26', bit: '2027-04-30', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 4), d('veri-yorumlama', 1)] },
  { hafta: 30, bas: '2027-05-03', bit: '2027-05-07', dersSaati: 5, unite: 'istatistik',           dersler: [d('veri-yorumlama', 2), d('esitlik-islem-ozellikleri', 1)] },
  { hafta: 31, bas: '2027-05-10', bit: '2027-05-14', dersSaati: 5, unite: 'cebir',                dersler: [d('esitlik-islem-ozellikleri', 2)] },
  { hafta: 32, bas: '2027-05-20', bit: '2027-05-21', dersSaati: 5, unite: 'cebir',                dersler: [d('islem-onceligi', 1), d('oruntuler', 1)] },
  { hafta: 33, bas: '2027-05-24', bit: '2027-05-28', dersSaati: 5, unite: 'cebir',                dersler: [d('oruntuler', 2)] },
  { hafta: 34, bas: '2027-05-31', bit: '2027-06-04', dersSaati: 3, unite: 'cebir',                dersler: [d('algoritma', 1)] },
  { hafta: 35, bas: '2027-06-07', bit: '2027-06-11', dersSaati: 5, unite: 'cebir',                dersler: [d('algoritma', 2), d('olasilik', 1)] },
  { hafta: 36, bas: '2027-06-14', bit: '2027-06-18', dersSaati: 5, unite: 'olasilik',             dersler: [d('olasilik', 2)] },
  // Sosyal etkinlik haftasi: ders yok, unite yok. unite null olmali,
  // yoksa "unite sinirlari takvimle tutarlidir" testi olasilik unitesinin
  // son haftasini 37 sanip patlar.
  { hafta: 37, bas: '2027-06-21', bit: '2027-06-25', dersSaati: 5, unite: null,                   dersler: [] }
];

export const TATILLER = [
  { ad: '1. Dönem Ara Tatili',         bas: '2026-11-16', bit: '2026-11-20' },
  { ad: 'Yarıyıl Tatili',              bas: '2027-01-25', bit: '2027-02-05' },
  { ad: 'Ara Tatil - Ramazan Bayramı', bas: '2027-03-08', bit: '2027-03-12' },
  { ad: 'Kurban Bayramı ve 19 Mayıs',  bas: '2027-05-15', bit: '2027-05-19' }
];
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/mufredat-veri.test.js`
Expected: PASS, 11 test gecer.

**Spec'ten bilincli sapma, uygulayiciya not.** Spec Bolum 4.2'de unite
sinirlari `geometrik-nicelikler [14,18]`, `cebir [30,35]`,
`olasilik [35,36]` yaziyordu. Bu araliklar ust uste biniyor cunku 14, 30 ve
35. haftalar karma hafta: iki konuya birden dusuyorlar. Bir hafta yalnizca
tek bir uniteye ait olabilecegi icin karma hafta **birinci** konusunun
unitesine baglandi ve `UNITELER` yukaridaki gibi duzeltildi: 15-18, 31-35,
36-36.

Bunun tek sonucu su: karma haftanin ikinci konusu (ornegin hafta 14'teki
`dikdortgen` seviye 1) kendi unitesinin sinavinda olculur, o haftanin
unitesinin sinavinda degil. Bu zaten dogru davranis. Unite sinavi
haftalari degismedi: 8, 14, 18, 25, 30, 35, 36.

- [ ] **Step 5: Tum testleri calistir**

Run: `npm test`
Expected: PASS, mevcut testlerin hicbiri bozulmaz.

- [ ] **Step 6: Commit**

```bash
git add src/data/mufredat.js tests/mufredat-veri.test.js
git commit -m "feat(ders): 2026-2027 matematik yillik plan takvimi

37 hafta, 15 konu, 42 konu-seviye cifti, 7 unite ve 4 tatil araligi.
Yalnizca esleme tasir, icerik tasimaz. Butunluk testleri hafta
kesintisizligini, tatil cakismasini, seviye bosluklarini ve unite
sinirlarini zorluyor."
```

---

## Task 3: Hafta motoru

Tarihten haftayi bulan, haftalar arasi gezinen ve kazanim durumunu ozetleyen
saf motor. Tarih metin olarak girer, `Date` nesnesi girmez.

**Files:**
- Create: `src/engines/mufredat.js`
- Test: `tests/mufredat.test.js`

**Interfaces:**
- Consumes: `TAKVIM`, `TATILLER`, `UNITELER` (Task 2)
- Produces:
  - `haftaBul(takvim, tatiller, tarihMetni)` -> `{ tip: 'ders', hafta }` veya `{ tip: 'tatil', ad, bas, bit }` veya `{ tip: 'disinda', once: boolean }`
  - `haftaNo(takvim, no)` -> hafta nesnesi veya `null`
  - `haftaGezin(takvim, no, yon)` -> hafta nesnesi veya `null` (`yon` -1 veya 1)
  - `uniteninHaftalari(takvim, uniteId)` -> hafta dizisi
  - `aktifHafta(takvim, tatiller, tarihMetni, sabitHafta)` -> hafta nesnesi veya `null`

Not: Spec Bolum 5.1'de bu modulde `kazanimDurumu` da listelenmisti. O
fonksiyon konu verisine (kazanim kodlarina) ihtiyac duyuyor ve konu
verisi `data/konular/` altinda; `engines/mufredat.js` yalnizca takvimi
bilir. Bu yuzden `kazanimDurumu` **Task 18'de `views/ders.js` icinde**
`kazanimDurumu(takvim, konular, ilerleme)` imzasiyla yazilacak.

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/mufredat.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER } from '../src/data/mufredat.js';
import {
  haftaBul, haftaNo, haftaGezin, uniteninHaftalari, aktifHafta
} from '../src/engines/mufredat.js';

test('hafta icindeki bir gun o haftayi bulur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  assert.equal(s.tip, 'ders');
  assert.equal(s.hafta.hafta, 1);
});

test('haftanin ilk ve son gunu de o haftaya aittir', () => {
  assert.equal(haftaBul(TAKVIM, TATILLER, '2026-09-14').hafta.hafta, 1);
  assert.equal(haftaBul(TAKVIM, TATILLER, '2026-09-18').hafta.hafta, 1);
});

test('hafta sonu bir sonraki haftaya sayilir', () => {
  // 19-20 Eylul cumartesi ve pazar: 1. hafta bitti, 2. hafta basliyor
  const s = haftaBul(TAKVIM, TATILLER, '2026-09-19');
  assert.equal(s.tip, 'ders');
  assert.equal(s.hafta.hafta, 2);
});

test('tatil gunu tatil dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-11-18');
  assert.equal(s.tip, 'tatil');
  assert.equal(s.ad, '1. Dönem Ara Tatili');
});

test('yariyil tatilinin ortasi tatildir', () => {
  assert.equal(haftaBul(TAKVIM, TATILLER, '2027-01-30').tip, 'tatil');
});

test('ogretim yili baslamadan once disinda dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-08-01');
  assert.equal(s.tip, 'disinda');
  assert.equal(s.once, true);
});

test('ogretim yili bittikten sonra disinda dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2027-08-01');
  assert.equal(s.tip, 'disinda');
  assert.equal(s.once, false);
});

test('haftaNo numaradan hafta dondurur', () => {
  assert.equal(haftaNo(TAKVIM, 5).hafta, 5);
  assert.equal(haftaNo(TAKVIM, 99), null);
  assert.equal(haftaNo(TAKVIM, 0), null);
});

test('haftaGezin ileri ve geri gider', () => {
  assert.equal(haftaGezin(TAKVIM, 5, 1).hafta, 6);
  assert.equal(haftaGezin(TAKVIM, 5, -1).hafta, 4);
});

test('haftaGezin dersi olmayan haftayi atlar', () => {
  // 37. haftada ders yok; 36'dan ileri gitmek null dondurmeli
  assert.equal(haftaGezin(TAKVIM, 36, 1), null);
});

test('haftaGezin sinirlarda null dondurur', () => {
  assert.equal(haftaGezin(TAKVIM, 1, -1), null);
});

test('uniteninHaftalari o unitenin tum haftalarini sirali verir', () => {
  const h = uniteninHaftalari(TAKVIM, 'geometrik-sekiller');
  assert.deepEqual(h.map((x) => x.hafta), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('aktifHafta sabitHafta verilince takvimi yok sayar', () => {
  const h = aktifHafta(TAKVIM, TATILLER, '2026-09-16', 12);
  assert.equal(h.hafta, 12);
});

test('aktifHafta sabitHafta yokken tarihten bulur', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-10-14', null).hafta, 5);
});

test('aktifHafta tatilde null dondurur', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-11-18', null), null);
});

test('aktifHafta gecersiz sabitHaftayi yok sayip tarihe doner', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-10-14', 99).hafta, 5);
});

test('motor saf kalir: ayni girdi ayni cikti', () => {
  const a = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  const b = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  assert.deepEqual(a, b);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/mufredat.test.js`
Expected: FAIL, `Cannot find module '../src/engines/mufredat.js'`.

- [ ] **Step 3: Motoru yaz**

```js
/**
 * Mufredat takvimi motoru. Saf: tarih disaridan 'YYYY-MM-DD' metni
 * olarak gelir, Date nesnesi ve sistem saati hic okunmaz.
 *
 * Tarihin metin olmasi bilerek: ISO tarih metinleri sozluk siralamasiyla
 * kronolojik siralanir, yani '<' ve '>' dogrudan calisir ve saat dilimi
 * kaymasi olmaz. Date kullansaydik Turkiye'de gece 01:00'de bir onceki
 * gunu gosterebilirdi.
 */

function tatilBul(tatiller, tarih) {
  return tatiller.find((t) => t.bas <= tarih && tarih <= t.bit) ?? null;
}

/**
 * Tarihin hangi haftaya dustugunu bulur.
 *
 * Hafta araliklari pazartesi-cuma; hafta sonlari bosta kalir. Bos gun
 * BIR SONRAKI haftaya sayilir, cunku cumartesi gunu uygulamayi acan
 * cocuk gecen haftayi degil onundeki haftayi gormeli.
 */
export function haftaBul(takvim, tatiller, tarih) {
  const tatil = tatilBul(tatiller, tarih);
  if (tatil) return { tip: 'tatil', ad: tatil.ad, bas: tatil.bas, bit: tatil.bit };

  const ilk = takvim[0];
  const son = takvim[takvim.length - 1];
  if (tarih < ilk.bas) return { tip: 'disinda', once: true };
  if (tarih > son.bit) return { tip: 'disinda', once: false };

  const tam = takvim.find((h) => h.bas <= tarih && tarih <= h.bit);
  if (tam) return { tip: 'ders', hafta: tam };

  // Iki hafta arasindaki bosluk (hafta sonu). Sonraki haftaya sayilir.
  const sonraki = takvim.find((h) => h.bas > tarih);
  return sonraki ? { tip: 'ders', hafta: sonraki } : { tip: 'disinda', once: false };
}

export function haftaNo(takvim, no) {
  return takvim.find((h) => h.hafta === no) ?? null;
}

/**
 * Bir onceki veya sonraki DERS haftasi. Dersi olmayan hafta (37. hafta,
 * sosyal etkinlik) atlanir; o haftada gosterilecek ders yoktur. Atlanan
 * haftadan sonra aday kalmazsa null doner.
 */
export function haftaGezin(takvim, no, yon) {
  const aday = takvim.find((h) => h.hafta === no + yon);
  if (!aday) return null;
  if (aday.dersler.length === 0) return haftaGezin(takvim, aday.hafta, yon);
  return aday;
}

export function uniteninHaftalari(takvim, uniteId) {
  return takvim.filter((h) => h.unite === uniteId);
}

/**
 * Ekranda gosterilecek hafta.
 *
 * sabitHafta ebeveynin panelden secebildigi degerdir ve takvime ustun
 * gelir: cocuk okuldan geri kaldiysa ya da ileri gitmek istiyorsa
 * takvimin dedigi hafta yanlis olur. Gecersiz bir sabitHafta sessizce
 * yok sayilir, yoksa ekran bos kalirdi.
 */
export function aktifHafta(takvim, tatiller, tarih, sabitHafta) {
  if (Number.isInteger(sabitHafta)) {
    const sabit = haftaNo(takvim, sabitHafta);
    if (sabit && sabit.dersler.length > 0) return sabit;
  }
  const sonuc = haftaBul(takvim, tatiller, tarih);
  if (sonuc.tip !== 'ders') return null;
  return sonuc.hafta.dersler.length > 0 ? sonuc.hafta : null;
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/mufredat.test.js`
Expected: PASS, 17 test gecer.

- [ ] **Step 5: Mimari testini calistir**

Run: `npm test`
Expected: PASS. Ozellikle `engines saf kalir, saat okumaz` testi gecmeli:
dosyada `Date.now()`, argumansiz `new Date()` ve `Math.random()` yok.

- [ ] **Step 6: Commit**

```bash
git add src/engines/mufredat.js tests/mufredat.test.js
git commit -m "feat(ders): hafta bulma ve gezinme motoru

Tarih 'YYYY-MM-DD' metni olarak girer; ISO metinleri sozluk
siralamasiyla kronolojik siralandigi icin saat dilimi kaymasi olmaz.
Hafta sonu bir sonraki haftaya sayilir. sabitHafta takvime ustun gelir,
gecersizse sessizce yok sayilir."
```

---

## Task 4: Ders ilerlemesinin kaydi

`core/state.js` motorlar ile depolama arasindaki tek kopru. Ders ilerlemesi
de oradan gecer. Mevcut yukleyiciler gibi savunmaci normalize eder: bozuk
kayit uygulamayi cokertmemeli.

**Files:**
- Modify: `src/core/state.js` (yeni iki metot, `saveIstatistik` sonrasina)
- Test: `tests/ders-state.test.js`

**Interfaces:**
- Consumes: `createStorage`, `memoryBackend` (`core/storage.js`)
- Produces:
  - `state.loadDersIlerleme()` -> `{ haftalar: {}, sinavlar: {}, ayar: { sesAcik, otomatikOynat, sabitHafta, sesliCevap } }`
  - `state.saveDersIlerleme(ilerleme)` -> void
  - Depolama anahtari: `ataol:ders`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/ders-state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';

const yeni = () => createAppState(createStorage(memoryBackend()));

test('bos depoda varsayilan ders ilerlemesi doner', () => {
  const i = yeni().loadDersIlerleme();
  assert.deepEqual(i.haftalar, {});
  assert.deepEqual(i.sinavlar, {});
  assert.equal(i.ayar.sesAcik, true);
  assert.equal(i.ayar.otomatikOynat, true);
  assert.equal(i.ayar.sabitHafta, null);
  assert.equal(i.ayar.sesliCevap, false);
});

test('kaydedilen ilerleme geri yuklenir', () => {
  const s = yeni();
  s.saveDersIlerleme({
    haftalar: { 3: { anlatim: ['a1'], etkilesimBitti: true, alistirma: {}, alistirmaDogru: 4, quiz: { enIyi: 80, denemeler: 1 }, yildizAlinan: ['anlatim'] } },
    sinavlar: { 'unite-geometrik-sekiller': { puan: 84, gecti: true, yildizAlindi: true } },
    ayar: { sesAcik: false, otomatikOynat: false, sabitHafta: 7, sesliCevap: true }
  });
  const i = s.loadDersIlerleme();
  assert.deepEqual(i.haftalar['3'].anlatim, ['a1']);
  assert.equal(i.sinavlar['unite-geometrik-sekiller'].puan, 84);
  assert.equal(i.ayar.sabitHafta, 7);
  assert.equal(i.ayar.sesAcik, false);
});

test('bozuk kayit varsayilana duser, cokmez', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', '"bu bir nesne degil"');
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.deepEqual(i.haftalar, {});
  assert.equal(i.ayar.sesAcik, true);
});

test('eksik alanlar varsayilanla tamamlanir', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', JSON.stringify({ haftalar: { 1: {} } }));
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.deepEqual(i.sinavlar, {});
  assert.equal(i.ayar.otomatikOynat, true);
});

test('gecersiz sabitHafta null olur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', JSON.stringify({ ayar: { sabitHafta: 'yedi' } }));
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.equal(i.ayar.sabitHafta, null);
});

test('ders ilerlemesi diger anahtarlara dokunmaz', () => {
  const s = yeni();
  s.saveDrill({ level: 'toplama', byLevel: {} });
  s.saveDersIlerleme({ haftalar: {}, sinavlar: {}, ayar: {} });
  assert.equal(s.loadDrill().level, 'toplama');
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders-state.test.js`
Expected: FAIL, `state.loadDersIlerleme is not a function`.

- [ ] **Step 3: `core/state.js` icine iki metot ekle**

`saveIstatistik(ist) { ... }` metodunun HEMEN ARDINA, donen nesnenin icine
(son `}` oncesine) su blogu ekle. Oncesindeki `saveIstatistik` satirinin
sonuna virgul koymayi unutma.

```js
    /**
     * Matematik ders modulunun ilerlemesi.
     *
     * haftalar: hafta numarasi -> { anlatim: string[], etkilesimBitti,
     *   alistirma: leitner kutulari, quiz: { enIyi, denemeler,
     *   yildizAlindi } }
     * sinavlar: sinav kimligi -> { puan, gecti, tarih, yildizAlindi }
     * ayar: ses ve hafta tercihleri
     *
     * Savunmaci yuklenir: bozuk ya da eksik kayit uygulamayi cokertmez,
     * varsayilana duser. Cocugun elindeki tek cihazda kayit bozulursa
     * ders ekrani acilmaya devam etmeli.
     */
    loadDersIlerleme() {
      const bos = {
        haftalar: {},
        sinavlar: {},
        ayar: { sesAcik: true, otomatikOynat: true, sabitHafta: null, sesliCevap: false }
      };
      const kayit = storage.get('ders', null);
      if (!kayit || typeof kayit !== 'object' || Array.isArray(kayit)) return bos;

      const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
      const bayrak = (x, varsayilan) => (typeof x === 'boolean' ? x : varsayilan);
      const ayar = nesne(kayit.ayar);

      return {
        haftalar: nesne(kayit.haftalar),
        sinavlar: nesne(kayit.sinavlar),
        ayar: {
          sesAcik: bayrak(ayar.sesAcik, true),
          otomatikOynat: bayrak(ayar.otomatikOynat, true),
          sabitHafta: Number.isInteger(ayar.sabitHafta) ? ayar.sabitHafta : null,
          sesliCevap: bayrak(ayar.sesliCevap, false)
        }
      };
    },

    saveDersIlerleme(ilerleme) {
      storage.set('ders', ilerleme);
    }
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ders-state.test.js`
Expected: PASS, 6 test gecer.

- [ ] **Step 5: Tum testleri calistir**

Run: `npm test`
Expected: PASS, mevcut `state.test.js` bozulmaz.

- [ ] **Step 6: Commit**

```bash
git add src/core/state.js tests/ders-state.test.js
git commit -m "feat(ders): ders ilerlemesi kaydi

state uzerinden ataol:ders anahtari. Savunmaci yuklenir: bozuk veya
eksik kayit varsayilana duser, cocugun elindeki tek cihazda kayit
bozulsa bile ders ekrani acilmaya devam eder."
```

---

## Task 5: Ses katmani

Tek giris noktasi. Ses dosyasi varsa onu calar, yoksa cihaz TTS'ine duser.
Geri bildirim efektleri Web Audio ile kod icinde sentezlenir, hicbir dosya
inmez.

Bu dosya `ui/` altindadir ama **`document` gecmez**: `speechSynthesis`,
`AudioContext` ve `Audio` disaridan enjekte edilir. Bu hem test edilebilir
kilar hem de tarayici disinda (node testinde) calismasini saglar.

**Files:**
- Create: `src/ui/ses.js`
- Test: `tests/ses.test.js`

**Interfaces:**
- Consumes: yok
- Produces:
  - `createSes({ speechSynthesis, AudioContext, Audio, sesKok })` -> ses nesnesi
  - `ses.hazirla()` -> `Promise<void>` (iOS icin kullanici dokunusunda cagrilir)
  - `ses.oku({ metin, ses })` -> `Promise<'dosya' | 'tts' | 'kapali'>`
  - `ses.dur()` -> void
  - `ses.efekt('dogru' | 'yanlis' | 'kutlama' | 'tik')` -> void
  - `ses.ayarla({ sesAcik })` -> void
  - `sesKok` varsayilani `'sesler/'`, dosya uzantisi `.m4a`

- [ ] **Step 1: Basarisiz testleri yaz**

Sahte tarayici nesneleri testin icinde kurulur; gercek bir tarayici
gerekmez.

```js
// tests/ses.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSes } from '../src/ui/ses.js';

function sahteTts() {
  const soylenen = [];
  return {
    soylenen,
    speaking: false,
    speak(u) { soylenen.push(u); if (u.onend) u.onend(); },
    cancel() { soylenen.length = 0; }
  };
}

// calabilir=false ise error olayini tetikler, yani dosya yok demektir.
function sahteAudioSinifi(calabilir) {
  const kurulan = [];
  class SahteAudio {
    constructor(src) {
      this.src = src;
      kurulan.push(src);
      this._olaylar = {};
    }
    addEventListener(ad, fn) { this._olaylar[ad] = fn; }
    play() {
      if (calabilir) {
        if (this._olaylar.ended) setTimeout(() => this._olaylar.ended(), 0);
        return Promise.resolve();
      }
      if (this._olaylar.error) setTimeout(() => this._olaylar.error(), 0);
      return Promise.reject(new Error('calinamadi'));
    }
    pause() { this.duraklatildi = true; }
  }
  SahteAudio.kurulan = kurulan;
  return SahteAudio;
}

function sahteAudioContext() {
  const baglananlar = [];
  class SahteOsc {
    constructor() { this.frequency = { setValueAtTime() {} }; }
    connect(x) { baglananlar.push('osc->' + x.ad); return x; }
    start() { this.basladi = true; }
    stop() { this.durdu = true; }
  }
  class SahteCtx {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = { ad: 'dest' };
      this.olusanOsc = [];
    }
    resume() { this.state = 'running'; return Promise.resolve(); }
    createOscillator() { const o = new SahteOsc(); this.olusanOsc.push(o); return o; }
    createGain() {
      return {
        ad: 'gain',
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
        connect(x) { baglananlar.push('gain->' + x.ad); return x; }
      };
    }
  }
  SahteCtx.baglananlar = baglananlar;
  return SahteCtx;
}

test('ses dosyasi varsa dosya calinir, TTS kullanilmaz', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  assert.equal(sonuc, 'dosya');
  assert.equal(Audio.kurulan[0], 'sesler/temel-cizimler-1-a1.m4a');
  assert.equal(tts.soylenen.length, 0);
});

test('ses dosyasi yoksa TTS ile okunur', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(false);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'yok-boyle-bir-dosya' });

  assert.equal(sonuc, 'tts');
  assert.equal(tts.soylenen.length, 1);
  assert.equal(tts.soylenen[0].text, 'Merhaba');
  assert.equal(tts.soylenen[0].lang, 'tr-TR');
});

test('ses alani hic yoksa dogrudan TTS kullanilir, dosya denenmez', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Sadece metin' });

  assert.equal(sonuc, 'tts');
  assert.equal(Audio.kurulan.length, 0);
});

test('ses kapaliyken hicbir sey calinmaz', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });
  ses.ayarla({ sesAcik: false });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  assert.equal(sonuc, 'kapali');
  assert.equal(Audio.kurulan.length, 0);
  assert.equal(tts.soylenen.length, 0);
});

test('hazirla AudioContext i resume eder (iOS kilidi)', async () => {
  const Ctx = sahteAudioContext();
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: Ctx, Audio: sahteAudioSinifi(true) });

  await ses.hazirla();

  assert.equal(ses.ctxDurumu(), 'running');
});

test('efekt osilator olusturur ve calistirir', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();

  ses.efekt('dogru');

  assert.equal(ses.sonEfekt(), 'dogru');
});

test('bilinmeyen efekt adi sessizce yok sayilir', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();

  ses.efekt('boyle-bir-efekt-yok');

  assert.equal(ses.sonEfekt(), null);
});

test('ses kapaliyken efekt calmaz', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();
  ses.ayarla({ sesAcik: false });

  ses.efekt('dogru');

  assert.equal(ses.sonEfekt(), null);
});

test('dur calan dosyayi duraklatir ve TTS i iptal eder', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });
  await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  ses.dur();

  assert.equal(tts.soylenen.length, 0);
});

test('tarayici yetenekleri yoksa cokmez', async () => {
  const ses = createSes({});
  assert.equal(await ses.oku({ metin: 'Merhaba' }), 'kapali');
  ses.efekt('dogru');
  ses.dur();
  await ses.hazirla();
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ses.test.js`
Expected: FAIL, `Cannot find module '../src/ui/ses.js'`.

- [ ] **Step 3: Ses katmanini yaz**

```js
/**
 * Ses katmani. Tek giris noktasi.
 *
 * Iki kaynak vardir ve sirasi onemlidir:
 *   1. sesler/<id>.m4a  - onceden uretilmis gercek anlatim (Chirp 3 HD)
 *   2. cihaz TTS'i      - dosya yoksa geri dusulen cozum
 *
 * Bu sira sayesinde ses uretimi kod yazimini bekletmez: dosyalar
 * sonradan damlayarak gelir, uygulama kodu hic degismez.
 *
 * Geri bildirim efektleri Web Audio ile kod icinde sentezlenir; tek bir
 * ses dosyasi bile inmez ve uygulama sismez.
 *
 * Bu dosya ui/ altindadir ama DOM'a dokunmaz: speechSynthesis,
 * AudioContext ve Audio disaridan enjekte edilir. Boylece node testinde
 * gercek tarayici olmadan calisir.
 */

// Efekt tarifleri: [frekans Hz, sure sn] ciftleri. Kisa ve yumusak
// tutuldu; cocuk gun boyu duyacak.
const EFEKTLER = {
  dogru: [[660, 0.09], [880, 0.14]],
  yanlis: [[300, 0.16]],
  kutlama: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.22]],
  tik: [[1200, 0.03]]
};

export function createSes({ speechSynthesis, AudioContext, Audio, sesKok = 'sesler/' } = {}) {
  let sesAcik = true;
  let ctx = null;
  let calan = null;
  let sonEfekt = null;

  const ttsVar = () => Boolean(speechSynthesis && typeof speechSynthesis.speak === 'function');

  /**
   * iOS'ta ses ancak bir kullanici dokunusunun icinde baslatilabilir.
   * "Derse basla" butonu bu dokunustur ve burayi cagirir.
   */
  async function hazirla() {
    if (!AudioContext) return;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      await ctx.resume();
    }
  }

  function dosyaCal(id) {
    if (!Audio) return Promise.reject(new Error('Audio yok'));
    return new Promise((coz, at) => {
      const a = new Audio(`${sesKok}${id}.m4a`);
      calan = a;
      a.addEventListener('ended', () => coz('dosya'));
      a.addEventListener('error', () => at(new Error('dosya yok')));
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => at(new Error('calinamadi')));
    });
  }

  function ttsOku(metin) {
    return new Promise((coz) => {
      if (!ttsVar()) return coz('kapali');
      const u = { text: metin, lang: 'tr-TR', rate: 0.95, onend: () => coz('tts') };
      speechSynthesis.speak(u);
      // Sahte veya eski motorlar onend cagirmazsa soz asili kalmasin.
      if (!speechSynthesis.speaking) coz('tts');
    });
  }

  /**
   * Bir anlatim adimini seslendirir.
   *
   * adim.ses varsa once dosya denenir; dosya yoksa ya da calinamiyorsa
   * sessizce TTS'e dusulur. Dusme sessizdir cunku cocugun ekraninda
   * "ses dosyasi bulunamadi" yazmasinin hicbir faydasi yok.
   */
  async function oku(adim) {
    if (!sesAcik) return 'kapali';
    const metin = String(adim?.metin ?? '');
    if (adim?.ses) {
      try {
        return await dosyaCal(adim.ses);
      } catch {
        // dosya yok; TTS'e dusulur
      }
    }
    if (!metin) return 'kapali';
    return ttsOku(metin);
  }

  function dur() {
    if (calan && typeof calan.pause === 'function') calan.pause();
    calan = null;
    if (ttsVar() && typeof speechSynthesis.cancel === 'function') speechSynthesis.cancel();
  }

  function efekt(ad) {
    sonEfekt = null;
    if (!sesAcik || !ctx) return;
    const tarif = EFEKTLER[ad];
    if (!tarif) return;

    let t = ctx.currentTime;
    for (const [hz, sure] of tarif) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(hz, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + sure);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + sure);
      t += sure;
    }
    sonEfekt = ad;
  }

  function ayarla({ sesAcik: acik } = {}) {
    if (typeof acik === 'boolean') sesAcik = acik;
    if (!sesAcik) dur();
  }

  return {
    hazirla,
    oku,
    dur,
    efekt,
    ayarla,
    // Test ve teshis icin; uygulama mantigi bunlara dayanmaz.
    ctxDurumu: () => ctx?.state ?? null,
    sonEfekt: () => sonEfekt
  };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ses.test.js`
Expected: PASS, 10 test gecer.

- [ ] **Step 5: Mimari testini calistir**

Run: `npm test`
Expected: PASS. `src/ui/ses.js` icinde `document` gecmedigi icin DOM kurali
da ihlal edilmez; Task 1'deki gevsetme olmasa da gecerdi.

- [ ] **Step 6: Commit**

```bash
git add src/ui/ses.js tests/ses.test.js
git commit -m "feat(ders): ses katmani

Dosya varsa sesler/<id>.m4a calinir, yoksa sessizce cihaz TTS'ine
dusulur. Bu sira sayesinde ses uretimi kod yazimini bekletmiyor.
Geri bildirim efektleri Web Audio ile sentezleniyor, dosya inmiyor.
speechSynthesis, AudioContext ve Audio enjekte edildigi icin gercek
tarayici olmadan test edilebiliyor."
```

---

## Task 6: Ders akisi motoru

Ekranlar arasi gecisin ve yildiz kazanmanin kurallari. Saf; DOM'a, saate ve
rastgeleye dokunmaz. Yildiz hesabinin burada olmasi bilerek: para dagitan
kural test edilebilir tek bir yerde durmali.

**Files:**
- Create: `src/engines/ders.js`
- Test: `tests/ders.test.js`

**Interfaces:**
- Consumes: yok
- Produces:
  - `ASAMALAR: ['anlatim', 'etkilesim', 'alistirma', 'quiz']`
  - `YILDIZ: { anlatim: 4, etkilesim: 3, quizGecme: 6, quizTamPuan: 10, uniteSinavi: 15, donemSinavi: 25 }`
  - `QUIZ_GECME: 70`, `SINAV_GECME: 60`, `ALISTIRMA_HEDEF: 10`
  - `bosHafta()` -> `{ anlatim: [], etkilesimBitti: false, alistirma: {}, alistirmaDogru: 0, quiz: { enIyi: 0, denemeler: 0 }, yildizAlinan: [] }`
  - `haftaKaydi(ilerleme, haftaNo)` -> hafta kaydi (yoksa `bosHafta()`)
  - `haftaDurumu(adimIdleri, kayit)` -> `{ asamalar: { anlatim: { tamam, n, toplam }, etkilesim: { tamam }, alistirma: { tamam, n, toplam }, quiz: { tamam, enIyi } }, yuzde, bitti }`
  - `adimTamamla(kayit, adimId)` -> `{ kayit, kazanilanYildiz }`
  - `etkilesimTamamla(kayit)` -> `{ kayit, kazanilanYildiz }`
  - `alistirmaCevap(kayit, tip, kutu, dogruMu)` -> `{ kayit, kazanilanYildiz }`
  - `quizBitir(kayit, yuzde)` -> `{ kayit, kazanilanYildiz, gecti }`
  - `sinavBitir(sinavlar, sinavId, { puan, tarih, tip })` -> `{ sinavlar, kazanilanYildiz, gecti }`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/ders.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASAMALAR, YILDIZ, QUIZ_GECME, SINAV_GECME, ALISTIRMA_HEDEF,
  bosHafta, haftaKaydi, haftaDurumu,
  adimTamamla, etkilesimTamamla, alistirmaCevap, quizBitir, sinavBitir
} from '../src/engines/ders.js';

const ADIMLAR = ['a1', 'a2', 'a3'];

test('bos hafta kaydi sifirdan baslar', () => {
  const k = bosHafta();
  assert.deepEqual(k.anlatim, []);
  assert.equal(k.etkilesimBitti, false);
  assert.equal(k.alistirmaDogru, 0);
  assert.equal(k.quiz.enIyi, 0);
  assert.deepEqual(k.yildizAlinan, []);
});

test('haftaKaydi olmayan haftada bos kayit dondurur', () => {
  assert.deepEqual(haftaKaydi({ haftalar: {} }, 3), bosHafta());
});

test('haftaKaydi var olan kaydi eksik alanlariyla tamamlar', () => {
  const k = haftaKaydi({ haftalar: { 3: { anlatim: ['a1'] } } }, 3);
  assert.deepEqual(k.anlatim, ['a1']);
  assert.equal(k.alistirmaDogru, 0);
  assert.deepEqual(k.yildizAlinan, []);
});

test('adimTamamla adimi ekler ama tekrarlamaz', () => {
  let k = bosHafta();
  k = adimTamamla(k, 'a1').kayit;
  k = adimTamamla(k, 'a1').kayit;
  assert.deepEqual(k.anlatim, ['a1']);
});

test('son anlatim adimi bitince anlatim yildizi verilir', () => {
  let k = bosHafta();
  assert.equal(adimTamamla(k, 'a1', ADIMLAR).kazanilanYildiz, 0);
  k = adimTamamla(k, 'a1', ADIMLAR).kayit;
  k = adimTamamla(k, 'a2', ADIMLAR).kayit;
  const son = adimTamamla(k, 'a3', ADIMLAR);
  assert.equal(son.kazanilanYildiz, YILDIZ.anlatim);
  assert.ok(son.kayit.yildizAlinan.includes('anlatim'));
});

test('anlatim yildizi ikinci kez verilmez', () => {
  let k = bosHafta();
  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  // Ayni adimlari tekrar isaretlemek yildiz uretmemeli
  assert.equal(adimTamamla(k, 'a3', ADIMLAR).kazanilanYildiz, 0);
});

test('etkilesimTamamla bir kez yildiz verir', () => {
  const ilk = etkilesimTamamla(bosHafta());
  assert.equal(ilk.kazanilanYildiz, YILDIZ.etkilesim);
  assert.equal(ilk.kayit.etkilesimBitti, true);
  assert.equal(etkilesimTamamla(ilk.kayit).kazanilanYildiz, 0);
});

test('alistirma dogru cevabi sayar ve kutuyu saklar', () => {
  const s = alistirmaCevap(bosHafta(), 'aci-turu', { box: 2, seen: 1, correct: 1 }, true);
  assert.equal(s.kayit.alistirmaDogru, 1);
  assert.equal(s.kayit.alistirma['aci-turu'].box, 2);
});

test('alistirma yanlis cevabi sayaci artirmaz', () => {
  const s = alistirmaCevap(bosHafta(), 'aci-turu', { box: 1 }, false);
  assert.equal(s.kayit.alistirmaDogru, 0);
});

test('alistirma yildiz vermez', () => {
  let k = bosHafta();
  for (let i = 0; i < ALISTIRMA_HEDEF + 5; i++) {
    const s = alistirmaCevap(k, 'aci-turu', { box: 3 }, true);
    assert.equal(s.kazanilanYildiz, 0, 'alistirma asla yildiz vermemeli');
    k = s.kayit;
  }
});

test('quiz gecme notunu asinca yildiz verir', () => {
  const s = quizBitir(bosHafta(), 80);
  assert.equal(s.gecti, true);
  assert.equal(s.kazanilanYildiz, YILDIZ.quizGecme);
  assert.equal(s.kayit.quiz.enIyi, 80);
  assert.equal(s.kayit.quiz.denemeler, 1);
});

test('quiz tam puanda daha cok yildiz verir', () => {
  assert.equal(quizBitir(bosHafta(), 100).kazanilanYildiz, YILDIZ.quizTamPuan);
});

test('quiz gecme notunun altinda yildiz vermez ama denemeyi sayar', () => {
  const s = quizBitir(bosHafta(), QUIZ_GECME - 1);
  assert.equal(s.gecti, false);
  assert.equal(s.kazanilanYildiz, 0);
  assert.equal(s.kayit.quiz.denemeler, 1);
});

test('quiz yildizi bir kez verilir, tekrar girmek yildiz uretmez', () => {
  const ilk = quizBitir(bosHafta(), 80);
  const ikinci = quizBitir(ilk.kayit, 100);
  assert.equal(ikinci.kazanilanYildiz, 0);
  assert.equal(ikinci.kayit.quiz.enIyi, 100, 'en iyi puan yine de guncellenmeli');
  assert.equal(ikinci.kayit.quiz.denemeler, 2);
});

test('quiz en iyi puani dusurmez', () => {
  const ilk = quizBitir(bosHafta(), 90);
  const ikinci = quizBitir(ilk.kayit, 40);
  assert.equal(ikinci.kayit.quiz.enIyi, 90);
});

test('haftaDurumu asamalari ve yuzdeyi hesaplar', () => {
  let k = bosHafta();
  let d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.asamalar.anlatim.tamam, false);
  assert.equal(d.asamalar.anlatim.toplam, 3);
  assert.equal(d.yuzde, 0);
  assert.equal(d.bitti, false);

  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  k = etkilesimTamamla(k).kayit;
  d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.asamalar.anlatim.tamam, true);
  assert.equal(d.asamalar.etkilesim.tamam, true);
  assert.equal(d.yuzde, 50, '4 asamanin 2si bitti');
});

test('haftaDurumu dort asama bitince bitti der', () => {
  let k = bosHafta();
  for (const a of ADIMLAR) k = adimTamamla(k, a, ADIMLAR).kayit;
  k = etkilesimTamamla(k).kayit;
  for (let i = 0; i < ALISTIRMA_HEDEF; i++) {
    k = alistirmaCevap(k, 't' + i, { box: 2 }, true).kayit;
  }
  k = quizBitir(k, 90).kayit;
  const d = haftaDurumu(ADIMLAR, k);
  assert.equal(d.yuzde, 100);
  assert.equal(d.bitti, true);
});

test('sinavBitir unite sinavinda gecince yildiz verir', () => {
  const s = sinavBitir({}, 'unite-geometrik-sekiller', { puan: 84, tarih: '2026-11-08', tip: 'unite' });
  assert.equal(s.gecti, true);
  assert.equal(s.kazanilanYildiz, YILDIZ.uniteSinavi);
  assert.equal(s.sinavlar['unite-geometrik-sekiller'].puan, 84);
});

test('sinavBitir donem sinavinda daha cok yildiz verir', () => {
  const s = sinavBitir({}, 'donem-1', { puan: 70, tarih: '2027-01-22', tip: 'donem' });
  assert.equal(s.kazanilanYildiz, YILDIZ.donemSinavi);
});

test('sinavBitir gecme notunun altinda yildiz vermez', () => {
  const s = sinavBitir({}, 'unite-geometrik-sekiller', { puan: SINAV_GECME - 1, tarih: '2026-11-08', tip: 'unite' });
  assert.equal(s.gecti, false);
  assert.equal(s.kazanilanYildiz, 0);
});

test('sinav yildizi bir kez verilir', () => {
  const ilk = sinavBitir({}, 'unite-geometrik-sekiller', { puan: 70, tarih: '2026-11-08', tip: 'unite' });
  const ikinci = sinavBitir(ilk.sinavlar, 'unite-geometrik-sekiller', { puan: 95, tarih: '2026-11-09', tip: 'unite' });
  assert.equal(ikinci.kazanilanYildiz, 0);
  assert.equal(ikinci.sinavlar['unite-geometrik-sekiller'].puan, 95);
});

test('asamalar dizisi beklenen sirada', () => {
  assert.deepEqual(ASAMALAR, ['anlatim', 'etkilesim', 'alistirma', 'quiz']);
});

test('girdiler degistirilmez (saf kalir)', () => {
  const k = bosHafta();
  const kopya = JSON.parse(JSON.stringify(k));
  adimTamamla(k, 'a1', ADIMLAR);
  quizBitir(k, 90);
  assert.deepEqual(k, kopya);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders.test.js`
Expected: FAIL, `Cannot find module '../src/engines/ders.js'`.

- [ ] **Step 3: Motoru yaz**

```js
/**
 * Ders akisinin durum makinesi ve yildiz kurallari.
 *
 * Saf kalir: saat, rastgelelik ve DOM yok. Yildiz hesabinin burada
 * olmasi bilincli bir karar: para dagitan kural test edilebilir tek bir
 * yerde durmali, ekran kodunun icine dagilmamali.
 *
 * Yildiz BIR KEZ verilir. yildizAlinan listesi hangi asamalarin odulunun
 * alindigini tutar. Aksi halde cocuk ayni quize tekrar tekrar girip
 * yildiz basardi; o da ogrenmeyi degil tekrari odullendirirdi.
 *
 * Alistirma bilincli olarak yildiz VERMEZ: sorular sinirsiz uretiliyor,
 * odul konsaydi cocuk ogrenmek yerine sayac doldurmaya oynardi.
 */

export const ASAMALAR = ['anlatim', 'etkilesim', 'alistirma', 'quiz'];

export const YILDIZ = {
  anlatim: 4,
  etkilesim: 3,
  quizGecme: 6,
  quizTamPuan: 10,
  uniteSinavi: 15,
  donemSinavi: 25
};

export const QUIZ_GECME = 70;
export const SINAV_GECME = 60;

// Alistirma asamasinin "tamam" sayilmasi icin gereken dogru cevap sayisi.
// Alistirma yine de sinirsiz devam edebilir; bu yalnizca ilerleme
// cubugunun dolma esigidir.
export const ALISTIRMA_HEDEF = 10;

export function bosHafta() {
  return {
    anlatim: [],
    etkilesimBitti: false,
    alistirma: {},
    alistirmaDogru: 0,
    quiz: { enIyi: 0, denemeler: 0 },
    yildizAlinan: []
  };
}

const dizi = (x) => (Array.isArray(x) ? x : []);
const nesne = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const sayi = (x) => (Number.isFinite(x) ? x : 0);

/**
 * Kayitli hafta verisini eksik alanlariyla tamamlar. Eski surumden gelen
 * ya da elle bozulmus kayit burada duzelir, cagiranlar hep tam sekil
 * gorur.
 */
export function haftaKaydi(ilerleme, no) {
  const ham = nesne(nesne(ilerleme?.haftalar)[String(no)]);
  const quiz = nesne(ham.quiz);
  return {
    anlatim: dizi(ham.anlatim),
    etkilesimBitti: ham.etkilesimBitti === true,
    alistirma: nesne(ham.alistirma),
    alistirmaDogru: sayi(ham.alistirmaDogru),
    quiz: { enIyi: sayi(quiz.enIyi), denemeler: sayi(quiz.denemeler) },
    yildizAlinan: dizi(ham.yildizAlinan)
  };
}

function yildizVer(kayit, asama, miktar) {
  if (kayit.yildizAlinan.includes(asama)) {
    return { kayit, kazanilanYildiz: 0 };
  }
  return {
    kayit: { ...kayit, yildizAlinan: [...kayit.yildizAlinan, asama] },
    kazanilanYildiz: miktar
  };
}

/**
 * Bir anlatim adimini bitmis isaretler. Tum adimlar bitince anlatim
 * yildizi verilir.
 *
 * tumAdimlar verilmezse yildiz kontrolu yapilmaz; cagiran yalnizca
 * isaretlemek istiyordur.
 */
export function adimTamamla(kayit, adimId, tumAdimlar = null) {
  const anlatim = kayit.anlatim.includes(adimId)
    ? kayit.anlatim
    : [...kayit.anlatim, adimId];
  const yeni = { ...kayit, anlatim };

  if (!Array.isArray(tumAdimlar) || tumAdimlar.length === 0) {
    return { kayit: yeni, kazanilanYildiz: 0 };
  }
  const hepsiBitti = tumAdimlar.every((a) => anlatim.includes(a));
  if (!hepsiBitti) return { kayit: yeni, kazanilanYildiz: 0 };

  return yildizVer(yeni, 'anlatim', YILDIZ.anlatim);
}

export function etkilesimTamamla(kayit) {
  return yildizVer({ ...kayit, etkilesimBitti: true }, 'etkilesim', YILDIZ.etkilesim);
}

/**
 * Bir alistirma cevabini kaydeder. Leitner kutusu disaridan gelir;
 * bu motor kutu mantigini bilmez, yalnizca saklar.
 */
export function alistirmaCevap(kayit, tip, kutu, dogruMu) {
  return {
    kayit: {
      ...kayit,
      alistirma: { ...kayit.alistirma, [tip]: kutu },
      alistirmaDogru: kayit.alistirmaDogru + (dogruMu ? 1 : 0)
    },
    kazanilanYildiz: 0
  };
}

export function quizBitir(kayit, yuzde) {
  const gecti = yuzde >= QUIZ_GECME;
  const temel = {
    ...kayit,
    quiz: {
      enIyi: Math.max(kayit.quiz.enIyi, yuzde),
      denemeler: kayit.quiz.denemeler + 1
    }
  };

  if (!gecti) return { kayit: temel, kazanilanYildiz: 0, gecti: false };

  const miktar = yuzde >= 100 ? YILDIZ.quizTamPuan : YILDIZ.quizGecme;
  const sonuc = yildizVer(temel, 'quiz', miktar);
  return { ...sonuc, gecti: true };
}

/**
 * Haftanin dort asamasinin durumu ve yuzdesi.
 *
 * adimIdleri: o haftanin anlatim adimlarinin id listesi. Hafta iki derse
 * bagliysa cagiran iki dersin adimlarini birlestirip verir.
 */
export function haftaDurumu(adimIdleri, kayit) {
  const toplamAdim = adimIdleri.length;
  const bitenAdim = adimIdleri.filter((a) => kayit.anlatim.includes(a)).length;

  const asamalar = {
    anlatim: { tamam: toplamAdim > 0 && bitenAdim === toplamAdim, n: bitenAdim, toplam: toplamAdim },
    etkilesim: { tamam: kayit.etkilesimBitti },
    alistirma: {
      tamam: kayit.alistirmaDogru >= ALISTIRMA_HEDEF,
      n: Math.min(kayit.alistirmaDogru, ALISTIRMA_HEDEF),
      toplam: ALISTIRMA_HEDEF
    },
    quiz: { tamam: kayit.quiz.enIyi >= QUIZ_GECME, enIyi: kayit.quiz.enIyi }
  };

  const biten = ASAMALAR.filter((a) => asamalar[a].tamam).length;
  return {
    asamalar,
    yuzde: Math.round((biten / ASAMALAR.length) * 100),
    bitti: biten === ASAMALAR.length
  };
}

/**
 * Unite ya da donem sinavi sonucu. sinavlar nesnesi hafta kayitlarindan
 * ayridir cunku sinav bir haftaya degil bir uniteye aittir.
 */
export function sinavBitir(sinavlar, sinavId, { puan, tarih, tip }) {
  const onceki = nesne(nesne(sinavlar)[sinavId]);
  const gecti = puan >= SINAV_GECME;
  const dahaOnceAlindi = onceki.yildizAlindi === true;
  const miktar = tip === 'donem' ? YILDIZ.donemSinavi : YILDIZ.uniteSinavi;
  const kazanilanYildiz = gecti && !dahaOnceAlindi ? miktar : 0;

  return {
    sinavlar: {
      ...nesne(sinavlar),
      [sinavId]: {
        puan,
        gecti,
        tarih,
        tip,
        yildizAlindi: dahaOnceAlindi || kazanilanYildiz > 0
      }
    },
    kazanilanYildiz,
    gecti
  };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ders.test.js`
Expected: PASS, 22 test gecer.

- [ ] **Step 5: Mimari testini calistir**

Run: `npm test`
Expected: PASS. `engines saf kalir` testi gecmeli.

- [ ] **Step 6: Commit**

```bash
git add src/engines/ders.js tests/ders.test.js
git commit -m "feat(ders): ders akisi ve yildiz motoru

Dort asama (anlatim, etkilesim, alistirma, quiz), yildiz bir kez
verilir. Alistirma bilincli olarak yildiz vermiyor: sorular sinirsiz
uretildigi icin odul konsa cocuk ogrenmek yerine sayac doldururdu.
Quiz tekrar girilebilir, en iyi puan guncellenir ama yildiz tekrar
verilmez."
```

---

## Task 7: Ders sekmesi ve hafta ekrani

Faz 0'i kapatan entegrasyon gorevi. Sekme acilir, bu haftanin karti
gorunur, haftalar arasinda gezinilir. Icerik henuz yok; kart "icerik
hazirlaniyor" der. Bu bilerek boyle: iskeletin calistigini icerik yazmadan
once gormek istiyoruz.

**Files:**
- Create: `src/views/ders.js`
- Create: `src/ui/ders-dom.js`
- Create: `src/data/konular/index.js`
- Modify: `src/core/i18n.js` (TR ve EN bloklarina ders anahtarlari)
- Modify: `v2.html` (nav butonu + `view-ders`)
- Modify: `src/main.js` (import, `renderDers`, ses kurulumu, `render()`)
- Modify: `sw.js` (yeni dosyalar, `CACHE_NAME` v38)
- Test: `tests/ders-view.test.js`

**Interfaces:**
- Consumes: `TAKVIM`, `TATILLER`, `UNITELER` (Task 2); `aktifHafta`,
  `haftaGezin`, `haftaNo`, `haftaBul` (Task 3); `loadDersIlerleme` (Task 4);
  `createSes` (Task 5); `haftaKaydi`, `haftaDurumu` (Task 6)
- Produces:
  - `adimKimligi(konuId, seviye, adimId)` -> `'temel-cizimler-1-a1'`
  - `haftaKarti(hafta, konular, uniteAd, ilerleme)` -> `{ no, bas, bit, uniteAd, dersler, adimIdleri, durum, hazir }`
  - `ekranDurumu(takvim, tatiller, tarih, sabitHafta)` -> `{ tip: 'ders' | 'tatil' | 'once' | 'sonra', hafta?, ad? }`
  - `KONULAR` (konu id -> konu nesnesi; Faz 0'da bos nesne)
  - `dersDom.render(kok, model, kancalar)` -> void

### Plan duzeyinde bir iyilestirme

Spec Bolum 4.4'te anlatim adimi hem `id: 'a1'` hem `ses: 'dikdortgen-1-a1'`
tasiyordu. Bu ikisi ayni bilgiyi iki kez yaziyor ve yazim hatasina acik.
Bunun yerine ses dosyasinin adi **turetilir**:

```
ses dosyasi = `${konuId}-${seviye}-${adimId}` + '.m4a'
```

Konu dosyalarinda `ses` alani artik YOKTUR. `tools/ses-uret.js` de ayni
kurali kullanacagi icin dosya adlari kendiliginden eslesir. Ayni deger
ayrica hafta kaydindaki `anlatim` listesinin ogesidir; yani bir adimin tek
bir kimligi olur.

- [ ] **Step 1: Basarisiz view testlerini yaz**

```js
// tests/ders-view.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER } from '../src/data/mufredat.js';
import { adimKimligi, haftaKarti, ekranDurumu } from '../src/views/ders.js';

const SAHTE_KONULAR = {
  'temel-cizimler': {
    id: 'temel-cizimler',
    ad: { tr: 'Temel Geometrik Çizimler' },
    seviyeler: [
      { seviye: 1, baslik: 'Nokta ve doğru', anlatim: [{ id: 'a1', metin: '...' }, { id: 'a2', metin: '...' }] },
      { seviye: 2, baslik: 'Işın ve dikme', anlatim: [{ id: 'a1', metin: '...' }] }
    ]
  }
};

test('adimKimligi konu, seviye ve adimi birlestirir', () => {
  assert.equal(adimKimligi('temel-cizimler', 1, 'a1'), 'temel-cizimler-1-a1');
});

test('haftaKarti icerigi olan haftayi hazir isaretler', () => {
  const hafta = TAKVIM[0];
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Geometrik Şekiller', { haftalar: {} });
  assert.equal(k.no, 1);
  assert.equal(k.hazir, true);
  assert.equal(k.uniteAd, 'Geometrik Şekiller');
  assert.equal(k.dersler[0].konuAd, 'Temel Geometrik Çizimler');
  assert.equal(k.dersler[0].baslik, 'Nokta ve doğru');
});

test('haftaKarti adim kimliklerini konu ve seviyeyle niteler', () => {
  const k = haftaKarti(TAKVIM[0], SAHTE_KONULAR, 'Geometrik Şekiller', { haftalar: {} });
  assert.deepEqual(k.adimIdleri, ['temel-cizimler-1-a1', 'temel-cizimler-1-a2']);
});

test('haftaKarti icerigi olmayan haftayi hazir degil isaretler', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20); // kesir-gosterim, Faz 3
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Sayılar ve Nicelikler 2', { haftalar: {} });
  assert.equal(k.hazir, false);
  assert.deepEqual(k.adimIdleri, []);
});

test('haftaKarti iki derse bagli haftada iki dersi de listeler', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 14);
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Sayılar ve Nicelikler 1', { haftalar: {} });
  assert.equal(k.dersler.length, 2);
});

test('haftaKarti ilerlemeyi durum olarak tasir', () => {
  const ilerleme = {
    haftalar: { 1: { anlatim: ['temel-cizimler-1-a1', 'temel-cizimler-1-a2'], etkilesimBitti: true } }
  };
  const k = haftaKarti(TAKVIM[0], SAHTE_KONULAR, 'Geometrik Şekiller', ilerleme);
  assert.equal(k.durum.asamalar.anlatim.tamam, true);
  assert.equal(k.durum.yuzde, 50);
});

test('ekranDurumu ders gununde ders dondurur', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-09-16', null);
  assert.equal(e.tip, 'ders');
  assert.equal(e.hafta.hafta, 1);
});

test('ekranDurumu tatilde tatil dondurur', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-11-18', null);
  assert.equal(e.tip, 'tatil');
  assert.equal(e.ad, '1. Dönem Ara Tatili');
});

test('ekranDurumu yil baslamadan once once dondurur', () => {
  assert.equal(ekranDurumu(TAKVIM, TATILLER, '2026-08-01', null).tip, 'once');
});

test('ekranDurumu yil bittikten sonra sonra dondurur', () => {
  assert.equal(ekranDurumu(TAKVIM, TATILLER, '2027-08-01', null).tip, 'sonra');
});

test('ekranDurumu sabitHafta tatilde bile dersi gosterir', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-11-18', 5);
  assert.equal(e.tip, 'ders');
  assert.equal(e.hafta.hafta, 5);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders-view.test.js`
Expected: FAIL, `Cannot find module '../src/views/ders.js'`.

- [ ] **Step 3: `src/views/ders.js` yaz**

```js
/**
 * Ders ekraninin saf model katmani. DOM yok; yalnizca ekranda
 * gosterilecek veriyi hazirlar.
 *
 * Adim kimligi konu ve seviyeyle nitelenir ('temel-cizimler-1-a1')
 * cunku bir hafta iki konuya birden baglanabiliyor ve iki konuda da
 * 'a1' adinda adim var. Ayni kimlik hem ilerleme kaydinda hem ses
 * dosyasi adinda kullanilir; boylece tek kaynak olur.
 */

import { haftaKaydi, haftaDurumu } from '../engines/ders.js';
import { haftaBul, aktifHafta } from '../engines/mufredat.js';

export const adimKimligi = (konuId, seviye, adimId) => `${konuId}-${seviye}-${adimId}`;

function seviyeBul(konu, no) {
  return konu?.seviyeler?.find((s) => s.seviye === no) ?? null;
}

/**
 * Hafta kartinin modeli.
 *
 * hazir: o haftanin TUM dersleri icin icerik yazilmis mi. Faz 1'de
 * yalnizca 1-8. haftalar hazirdir; digerleri kartta "icerik
 * hazirlaniyor" gosterir. Yari hazir hafta hazir sayilmaz, yoksa cocuk
 * ikinci derse tiklayip bos ekrana duser.
 */
export function haftaKarti(hafta, konular, uniteAd, ilerleme) {
  const dersler = hafta.dersler.map((d) => {
    const konu = konular[d.konu] ?? null;
    const sev = seviyeBul(konu, d.seviye);
    return {
      konuId: d.konu,
      konuAd: konu?.ad?.tr ?? d.konu,
      seviye: d.seviye,
      baslik: sev?.baslik ?? '',
      hazir: Boolean(sev)
    };
  });

  const adimIdleri = hafta.dersler.flatMap((d) => {
    const sev = seviyeBul(konular[d.konu], d.seviye);
    if (!sev) return [];
    return sev.anlatim.map((a) => adimKimligi(d.konu, d.seviye, a.id));
  });

  const kayit = haftaKaydi(ilerleme, hafta.hafta);

  return {
    no: hafta.hafta,
    bas: hafta.bas,
    bit: hafta.bit,
    uniteAd,
    dersler,
    adimIdleri,
    durum: haftaDurumu(adimIdleri, kayit),
    hazir: dersler.length > 0 && dersler.every((d) => d.hazir)
  };
}

/**
 * Ekranin hangi halde acilacagi. Tatilde ders gosterilmez ama ebeveynin
 * sabitledigi hafta varsa tatil kurali gecersizdir: cocuk tatilde de
 * calisabilmeli.
 */
export function ekranDurumu(takvim, tatiller, tarih, sabitHafta) {
  const sabit = aktifHafta(takvim, tatiller, tarih, sabitHafta);
  if (sabit && Number.isInteger(sabitHafta)) return { tip: 'ders', hafta: sabit };

  const sonuc = haftaBul(takvim, tatiller, tarih);
  if (sonuc.tip === 'tatil') return { tip: 'tatil', ad: sonuc.ad, bas: sonuc.bas, bit: sonuc.bit };
  if (sonuc.tip === 'disinda') return { tip: sonuc.once ? 'once' : 'sonra' };
  if (sonuc.hafta.dersler.length === 0) return { tip: 'sonra' };
  return { tip: 'ders', hafta: sonuc.hafta };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ders-view.test.js`
Expected: PASS, 11 test gecer.

- [ ] **Step 5: Bos konu kayit defterini olustur**

```js
// src/data/konular/index.js
/**
 * Konu kayit defteri. Icerik dosyalari yazildikca buraya eklenir.
 *
 * Faz 0'da bos: iskeletin icerik olmadan calistigini gormek istiyoruz.
 * Hafta karti icerigi olmayan haftayi "hazirlaniyor" diye gosterir.
 */

export const KONULAR = {};
```

- [ ] **Step 6: i18n anahtarlarini ekle**

`src/core/i18n.js` icinde `STRINGS.tr` blogunun `'nav.chat'` satirindan
sonra:

```js
    'nav.ders': 'Ders',

    'ders.thisWeek': 'Bu hafta',
    'ders.week': '{n}. hafta',
    'ders.unit': 'Ünite',
    'ders.dates': '{bas} - {bit}',
    'ders.progress': 'Tamamlanan %{n}',
    'ders.start': 'Derse başla',
    'ders.continue': 'Devam et',
    'ders.prev': 'Önceki hafta',
    'ders.next': 'Sonraki hafta',
    'ders.allWeeks': 'Tüm haftalar',
    'ders.notReady': 'Bu haftanın içeriği henüz hazırlanıyor.',
    'ders.holiday': 'Tatil',
    'ders.holidayNote': '{ad}. Tatilde ders yok, istersen geçmiş haftaları tekrar edebilirsin.',
    'ders.beforeStart': 'Ders yılı henüz başlamadı.',
    'ders.afterEnd': 'Ders yılı bitti. Geçmiş haftaları tekrar edebilirsin.',
    'ders.stage.anlatim': 'Anlatım',
    'ders.stage.etkilesim': 'Kendin dene',
    'ders.stage.alistirma': 'Alıştırma',
    'ders.stage.quiz': 'Quiz',
    'ders.trOnly': 'Bu bölüm Türkçe müfredata göre hazırlandı.',
```

`STRINGS.en` blogunda `'nav.chat'` satirindan sonra AYNI anahtarlar:

```js
    'nav.ders': 'Lesson',

    'ders.thisWeek': 'This week',
    'ders.week': 'Week {n}',
    'ders.unit': 'Unit',
    'ders.dates': '{bas} - {bit}',
    'ders.progress': '{n}% complete',
    'ders.start': 'Start the lesson',
    'ders.continue': 'Continue',
    'ders.prev': 'Previous week',
    'ders.next': 'Next week',
    'ders.allWeeks': 'All weeks',
    'ders.notReady': 'This week is still being prepared.',
    'ders.holiday': 'Holiday',
    'ders.holidayNote': '{ad}. No lessons during the holiday; you can revisit earlier weeks.',
    'ders.beforeStart': 'The school year has not started yet.',
    'ders.afterEnd': 'The school year is over. You can revisit earlier weeks.',
    'ders.stage.anlatim': 'Lesson',
    'ders.stage.etkilesim': 'Try it yourself',
    'ders.stage.alistirma': 'Practice',
    'ders.stage.quiz': 'Quiz',
    'ders.trOnly': 'This section follows the Turkish curriculum and is in Turkish.',
```

- [ ] **Step 7: i18n testini calistir**

Run: `node --test tests/i18n.test.js`
Expected: PASS. Bu test iki dildeki anahtar kumelerinin ayni olmasini
zorlar; bir dilde unutulan anahtar burada yakalanir.

- [ ] **Step 8: `v2.html` icine sekme ve gorunum ekle**

`<main id="view-parent" class="v2-view"></main>` satirindan SONRA:

```html
        <main id="view-ders" class="v2-view"></main>
```

Nav icinde `data-nav="routine"` butonundan SONRA:

```html
            <button type="button" data-nav="ders">
                <span class="material-symbols-rounded">school</span>
                <span data-i18n="nav.ders">Ders</span>
            </button>
```

- [ ] **Step 9: `src/ui/ders-dom.js` yaz**

```js
/**
 * Ders ekranlarinin DOM'u.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer: karar veren kod
 * views/ders.js ve engines/ altindadir.
 */

import { el, mount } from './dom.js';

function asamaRozeti(ad, tamam, etiket) {
  return el('div', {
    className: `ders-asama ${tamam ? 'ders-asama--tamam' : ''}`,
    dataset: { dersAsama: ad }
  }, [
    el('span', { className: 'material-symbols-rounded', text: tamam ? 'check_circle' : 'radio_button_unchecked' }),
    el('span', { className: 'ders-asama__etiket', text: etiket })
  ]);
}

function haftaKartiDom(kart, ceviri) {
  const ust = el('div', { className: 'ders-kart__ust' }, [
    el('p', { className: 'ders-kart__etiket', text: ceviri('ders.thisWeek') }),
    el('h2', { className: 'ders-kart__hafta', text: ceviri('ders.week', { n: kart.no }) }),
    el('p', { className: 'ders-kart__unite', text: `${ceviri('ders.unit')}: ${kart.uniteAd}` }),
    el('p', { className: 'ders-kart__tarih', text: ceviri('ders.dates', { bas: kart.bas, bit: kart.bit }) })
  ]);

  const konular = el('div', { className: 'ders-kart__konular' },
    kart.dersler.map((d) =>
      el('div', { className: 'ders-konu' }, [
        el('p', { className: 'ders-konu__ad', text: d.konuAd }),
        d.baslik ? el('p', { className: 'ders-konu__baslik', text: d.baslik }) : null
      ])
    )
  );

  if (!kart.hazir) {
    return el('div', { className: 'ders-kart ders-kart--bos' }, [
      ust, konular,
      el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })
    ]);
  }

  const asamalar = el('div', { className: 'ders-kart__asamalar' }, [
    asamaRozeti('anlatim', kart.durum.asamalar.anlatim.tamam, ceviri('ders.stage.anlatim')),
    asamaRozeti('etkilesim', kart.durum.asamalar.etkilesim.tamam, ceviri('ders.stage.etkilesim')),
    asamaRozeti('alistirma', kart.durum.asamalar.alistirma.tamam, ceviri('ders.stage.alistirma')),
    asamaRozeti('quiz', kart.durum.asamalar.quiz.tamam, ceviri('ders.stage.quiz'))
  ]);

  return el('div', { className: 'ders-kart' }, [
    ust,
    konular,
    asamalar,
    el('p', { className: 'ders-kart__ilerleme', text: ceviri('ders.progress', { n: kart.durum.yuzde }) }),
    el('button', {
      className: 'ders-kart__basla',
      text: kart.durum.yuzde > 0 ? ceviri('ders.continue') : ceviri('ders.start'),
      attrs: { type: 'button' },
      dataset: { dersBasla: String(kart.no) }
    })
  ]);
}

function gezinme(no, ceviri) {
  return el('div', { className: 'ders-gezinme' }, [
    el('button', {
      className: 'ders-gezinme__dugme',
      text: ceviri('ders.prev'),
      attrs: { type: 'button' },
      dataset: { dersGezin: 'geri', dersHafta: String(no) }
    }),
    el('button', {
      className: 'ders-gezinme__dugme',
      text: ceviri('ders.next'),
      attrs: { type: 'button' },
      dataset: { dersGezin: 'ileri', dersHafta: String(no) }
    })
  ]);
}

function bilgiKarti(baslik, metin) {
  return el('div', { className: 'ders-kart ders-kart--bilgi' }, [
    el('h2', { className: 'ders-kart__hafta', text: baslik }),
    el('p', { className: 'ders-kart__not', text: metin })
  ]);
}

/**
 * Hafta ekranini cizer.
 *
 * model: { tip, kart?, ad?, dilTr } — views/ders.js ciktisindan main.js
 * tarafindan hazirlanir.
 */
export function haftaEkrani(kok, model, ceviri) {
  const parcalar = [];

  if (model.dilTr === false) {
    parcalar.push(el('p', { className: 'ders-not-tr', text: ceviri('ders.trOnly') }));
  }

  if (model.tip === 'ders') {
    parcalar.push(haftaKartiDom(model.kart, ceviri));
    parcalar.push(gezinme(model.kart.no, ceviri));
  } else if (model.tip === 'tatil') {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.holidayNote', { ad: model.ad })));
    parcalar.push(gezinme(model.sonHaftaNo, ceviri));
  } else if (model.tip === 'once') {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.beforeStart')));
  } else {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.afterEnd')));
    parcalar.push(gezinme(model.sonHaftaNo, ceviri));
  }

  mount(kok, parcalar);
}
```

- [ ] **Step 10: `src/main.js` icine bagla**

Import bloguna (diger `views` importlarinin yanina):

```js
import { TAKVIM, TATILLER, UNITELER } from './data/mufredat.js';
import { KONULAR } from './data/konular/index.js';
import { haftaKarti, ekranDurumu } from './views/ders.js';
import { haftaGezin, haftaNo } from './engines/mufredat.js';
import { haftaEkrani } from './ui/ders-dom.js';
import { createSes } from './ui/ses.js';
```

`let seciliOdulEmoji = null;` satirindan sonra modul durumu:

```js
// Ders sekmesi. Gorulen hafta ekranda gezinmeyle degisir; null ise
// tarihten (ya da ebeveynin sabitledigi haftadan) bulunur.
let dersGorulenHafta = null;

const ses = createSes({
  speechSynthesis: window.speechSynthesis,
  AudioContext: window.AudioContext ?? window.webkitAudioContext,
  Audio: window.Audio
});
```

`renderGames()` fonksiyonunun ardina:

```js
// Ders sekmesinin tarihi rutinle ayni gun tanimini kullanir. dayKey'e
// resetHour 0 verilir: burada istedigimiz sey yerel takvim gunudur,
// rutinin sabaha sarkan gun tanimi degil. toISOString kullanilmaz,
// cunku o UTC verir ve Turkiye'de gece yarisindan sonra bir onceki
// gunu gosterirdi.
function bugununTarihi() {
  return dayKey(now(), 0);
}

function dersModeli() {
  const ilerleme = state.loadDersIlerleme();
  const sabit = ilerleme.ayar.sabitHafta;
  const sonHaftaNo = TAKVIM[TAKVIM.length - 1].hafta;

  const hafta = dersGorulenHafta === null
    ? null
    : haftaNo(TAKVIM, dersGorulenHafta);

  const durum = hafta
    ? { tip: 'ders', hafta }
    : ekranDurumu(TAKVIM, TATILLER, bugununTarihi(), sabit);

  if (durum.tip !== 'ders') {
    return { ...durum, sonHaftaNo, dilTr: dil() === 'tr' };
  }

  const unite = UNITELER.find((u) => u.id === durum.hafta.unite);
  return {
    tip: 'ders',
    kart: haftaKarti(durum.hafta, KONULAR, unite?.ad ?? '', ilerleme),
    dilTr: dil() === 'tr'
  };
}

function renderDers() {
  haftaEkrani(document.getElementById('view-ders'), dersModeli(), ceviri);
}
```

`render()` fonksiyonuna `renderGames();` satirindan sonra:

```js
  renderDers();
```

Gezinme dugmeleri icin, mevcut genel tiklama dinleyicisinde
`const nav = e.target.closest('[data-nav]');` satirindan ONCE:

```js
  const dersGezin = e.target.closest('[data-ders-gezin]');
  if (dersGezin) {
    const su = Number(dersGezin.dataset.dersHafta);
    const yon = dersGezin.dataset.dersGezin === 'ileri' ? 1 : -1;
    const hedef = haftaGezin(TAKVIM, su, yon);
    if (hedef) {
      dersGorulenHafta = hedef.hafta;
      renderDers();
    }
    return;
  }

  const dersBasla = e.target.closest('[data-ders-basla]');
  if (dersBasla) {
    // iOS'ta ses ancak kullanici dokunusunun icinde baslatilabilir.
    ses.hazirla();
    // Anlatim ekrani Task 13'te baglanacak.
    return;
  }
```

- [ ] **Step 11: `sw.js` guncelle**

`CACHE_NAME` degerini `'ataol-ai-v38'` yap. `ASSETS` dizisine
`'./src/ui/dom.js'` satirindan sonra:

```js
  './src/data/mufredat.js',
  './src/data/konular/index.js',
  './src/engines/mufredat.js',
  './src/engines/ders.js',
  './src/views/ders.js',
  './src/ui/ses.js',
  './src/ui/ders-dom.js',
```

`sesler/` dizini ASSETS'e **eklenmez**. Toplam ~38 MB'lik ses kurulumda
indirilmeye calisilirsa iOS'ta PWA kurulumu coker. Mevcut fetch
dinleyicisi zaten network-first ve basarili yaniti onbellege aliyor;
ses dosyalari ilk dinlemede kendiliginden onbellege girer.

- [ ] **Step 12: Tum testleri calistir**

Run: `npm test`
Expected: PASS. Ozellikle:
- `architecture.test.js` -> `ui/ders-dom.js` DOM kullanabiliyor
- `i18n.test.js` -> TR ve EN anahtarlari esit
- `views core ve engines DOM api si icermez` -> `views/ders.js` temiz

- [ ] **Step 13: Tarayicida elle dogrula**

`v2.html` dosyasini bir yerel sunucuyla ac (`python -m http.server 8000`
ve `http://localhost:8000/v2.html`). Dogrula:

1. Alt menude 5 sekme var, ikincisi "Ders"
2. Ders sekmesi aciliyor ve 1. hafta karti gorunuyor (bugunun tarihine
   gore hangi hafta ise o)
3. Kart "Bu haftanın içeriği henüz hazırlanıyor." diyor
4. "Önceki hafta" ve "Sonraki hafta" dugmeleri haftayi degistiriyor
5. Tarayici konsolunda hata yok

- [ ] **Step 14: Commit**

```bash
git add src/views/ders.js src/ui/ders-dom.js src/data/konular/index.js \
        src/core/i18n.js src/main.js v2.html sw.js tests/ders-view.test.js
git commit -m "feat(ders): Ders sekmesi ve hafta ekrani

Alt menuye besinci sekme, tarihten bulunan hafta karti, haftalar arasi
gezinme, tatil ve yil disi halleri. Icerik henuz yok; kart
'hazirlaniyor' diyor. Iskeletin icerik yazilmadan once calistigini
gormek icin bilerek boyle.

Adim kimligi konu ve seviyeyle niteleniyor (temel-cizimler-1-a1); ayni
kimlik hem ilerleme kaydinda hem ses dosyasi adinda kullanilacak.
sesler/ precache disinda birakildi, iOS kurulumunu cokertmesin."
```

**FAZ 0 BITTI.** Iskelet calisiyor, icerik yazilmaya hazir.

---

# FAZ 1: Geometrik Sekiller Unitesi (1-8. haftalar)

## Task 8: Uretici sozlesmesi ve kayit defteri

Her soru ureticisi ayni sekli uretmek zorunda. Sozlesme tek yerde
tanimlanir ve her ureticinin testi onu 200 tohumla zorlar. Bu, "yanlis
matematik ogretme" riskine karsi asil savunmadir.

**Files:**
- Create: `src/engines/uretici/ortak.js`
- Create: `src/engines/uretici/index.js`
- Create: `tests/yardim/soru-sozlesmesi.js`
- Test: `tests/uretici-index.test.js`

**Interfaces:**
- Consumes: yok
- Produces (`ortak.js`):
  - `BICIMLER: ['secmeli', 'sayi']`
  - `karistir(dizi, rng)` -> yeni dizi (Fisher-Yates, rng enjekte)
  - `secmeliKur({ tip, soru, dogruCevap, celdiriciler, cozum, gorsel }, rng)` -> soru nesnesi
  - `sec(dizi, rng)` -> diziden bir oge
- Produces (`index.js`):
  - `URETICILER: { [ureticiId]: (seviye, rng) => soru }`
  - `soruUret(ureticiId, seviye, rng)` -> soru; bilinmeyen id'de `null`
  - `ureticiVarMi(ureticiId)` -> boolean
  - `ortak.js` ciktilarini yeniden disa aktarir
- Test yardimcisi: `sozlesmeyiDogrula(soru, baglam)`, `tohumluRng(tohum)`,
  `ureticiyiSina(uret, seviye, ekDogrula, tur)`

**Neden iki dosya:** `index.js` ureticileri import ediyor, ureticiler de
ortak yardimcilari kullaniyor. Ikisi ayni dosyada olsaydi dongusel import
olurdu. ESM bunu cogu zaman tolere eder ama kirilgandir ve yukleme
sirasina bagimli hatalar uretir. Yardimcilar bu yuzden `ortak.js`'te
durur: `index.js -> uretici -> ortak.js`, tek yonlu.

Soru sozlesmesi:

```js
{
  tip: string,            // Leitner kutu anahtari; ORNEK degil TIP
  bicim: 'secmeli' | 'sayi',
  soru: { tr: string },
  secenekler: string[],   // yalniz bicim === 'secmeli'
  dogru: number,          // yalniz bicim === 'secmeli'; secenekler icindeki indeks
  cevap: string,          // yalniz bicim === 'sayi'; metin olarak karsilastirilir
  cozum: string[],        // en az 1 adim, hicbiri bos degil
  gorsel: object | null   // istege bagli widget verisi
}
```

- [ ] **Step 1: Test yardimcisini yaz**

Bu bir test destek dosyasidir, `.test.js` uzantisi YOKTUR; `npm test`
onu ayri bir test dosyasi olarak calistirmaz.

```js
// tests/yardim/soru-sozlesmesi.js
import assert from 'node:assert/strict';

/**
 * Tohumlu, belirlenimci rastgele sayi uretici.
 *
 * Math.random yerine bunu kullaniyoruz ki basarisiz bir test tekrar
 * calistirildiginda AYNI soruyu uretsin. Rastgele basarisiz olan bir
 * test hic olmayan testten daha kotudur.
 *
 * mulberry32: kucuk, hizli ve testler icin yeterince dagilimli.
 */
export function tohumluRng(tohum) {
  let a = tohum >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BICIMLER = ['secmeli', 'sayi'];

/**
 * Ortak soru sozlesmesi. Her uretici testi her tohumda bunu cagirir.
 * Cevabin DOGRULUGU burada denetlenmez; onu her ureticinin kendi testi
 * parametrelerden bagimsiz olarak yeniden hesaplayarak dogrular.
 */
export function sozlesmeyiDogrula(soru, baglam) {
  const b = (m) => `${baglam}: ${m}`;

  assert.ok(soru && typeof soru === 'object', b('soru nesnesi degil'));
  assert.ok(typeof soru.tip === 'string' && soru.tip.length > 0, b('tip bos'));
  assert.ok(BICIMLER.includes(soru.bicim), b(`gecersiz bicim "${soru.bicim}"`));

  assert.ok(soru.soru && typeof soru.soru.tr === 'string', b('soru.tr yok'));
  assert.ok(soru.soru.tr.trim().length >= 10, b('soru metni fazla kisa'));

  assert.ok(Array.isArray(soru.cozum), b('cozum dizi degil'));
  assert.ok(soru.cozum.length >= 1, b('cozum adimi yok'));
  for (const adim of soru.cozum) {
    assert.ok(typeof adim === 'string' && adim.trim().length > 0, b('bos cozum adimi'));
  }

  if (soru.bicim === 'secmeli') {
    assert.ok(Array.isArray(soru.secenekler), b('secenekler dizi degil'));
    assert.ok(soru.secenekler.length >= 3 && soru.secenekler.length <= 5,
      b(`secenek sayisi ${soru.secenekler.length}`));

    for (const s of soru.secenekler) {
      assert.ok(typeof s === 'string' && s.trim().length > 0, b('bos secenek'));
    }

    const benzersiz = new Set(soru.secenekler);
    assert.equal(benzersiz.size, soru.secenekler.length,
      b(`tekrar eden secenek: ${soru.secenekler.join(', ')}`));

    assert.ok(Number.isInteger(soru.dogru), b('dogru indeks degil'));
    assert.ok(soru.dogru >= 0 && soru.dogru < soru.secenekler.length,
      b(`dogru indeks disarida: ${soru.dogru}`));
  }

  if (soru.bicim === 'sayi') {
    assert.ok(typeof soru.cevap === 'string' && soru.cevap.length > 0,
      b('sayi biciminde cevap metni yok'));
  }
}

/**
 * Bir ureticiyi N tohumla calistirip sozlesmeyi ve cagiranin verdigi
 * ek dogrulamayi uygular.
 *
 * ekDogrula(soru, rngTohumu): ureticiye ozel kontrol. Burasi cevabin
 * parametrelerden bagimsiz olarak yeniden hesaplandigi yerdir.
 */
export function ureticiyiSina(uret, seviye, ekDogrula, tur = 200) {
  for (let tohum = 1; tohum <= tur; tohum++) {
    const soru = uret(seviye, tohumluRng(tohum));
    sozlesmeyiDogrula(soru, `seviye ${seviye}, tohum ${tohum}`);
    if (ekDogrula) ekDogrula(soru, tohum);
  }
}
```

- [ ] **Step 2: Kayit defteri testini yaz**

```js
// tests/uretici-index.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { URETICILER, soruUret, ureticiVarMi, karistir, secmeliKur } from '../src/engines/uretici/index.js';
import { tohumluRng, sozlesmeyiDogrula } from './yardim/soru-sozlesmesi.js';

test('Faz 1 ureticileri kayitlidir', () => {
  for (const id of ['temel-cizimler', 'aci-olcme', 'cokgenler-cember']) {
    assert.ok(ureticiVarMi(id), `${id} kayitli degil`);
    assert.equal(typeof URETICILER[id], 'function');
  }
});

test('bilinmeyen uretici null dondurur, atmaz', () => {
  assert.equal(soruUret('boyle-bir-konu-yok', 1, tohumluRng(1)), null);
  assert.equal(ureticiVarMi('boyle-bir-konu-yok'), false);
});

test('soruUret kayitli ureticiyi cagirir', () => {
  const soru = soruUret('aci-olcme', 1, tohumluRng(42));
  sozlesmeyiDogrula(soru, 'soruUret');
});

test('karistir tum ogeleri korur', () => {
  const kaynak = ['a', 'b', 'c', 'd', 'e'];
  for (let t = 1; t <= 50; t++) {
    const sonuc = karistir(kaynak, tohumluRng(t));
    assert.equal(sonuc.length, kaynak.length);
    assert.deepEqual([...sonuc].sort(), [...kaynak].sort());
  }
});

test('karistir kaynagi degistirmez', () => {
  const kaynak = ['a', 'b', 'c'];
  karistir(kaynak, tohumluRng(1));
  assert.deepEqual(kaynak, ['a', 'b', 'c']);
});

test('karistir gercekten karistirir', () => {
  const kaynak = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let farkli = 0;
  for (let t = 1; t <= 50; t++) {
    if (karistir(kaynak, tohumluRng(t)).join('') !== kaynak.join('')) farkli++;
  }
  assert.ok(farkli > 40, `50 denemede yalniz ${farkli} kez karisti`);
});

test('secmeliKur dogru indeksi karistirmadan sonra dogru gosterir', () => {
  for (let t = 1; t <= 100; t++) {
    const soru = secmeliKur({
      tip: 'deneme',
      soru: 'Bu bir deneme sorusudur, cevabi nedir?',
      dogruCevap: '42',
      celdiriciler: ['41', '43', '24'],
      cozum: ['Cunku oyle']
    }, tohumluRng(t));

    sozlesmeyiDogrula(soru, `secmeliKur tohum ${t}`);
    assert.equal(soru.secenekler[soru.dogru], '42');
  }
});

test('secmeliKur tekrar eden celdiriciyi eler', () => {
  const soru = secmeliKur({
    tip: 'deneme',
    soru: 'Bu bir deneme sorusudur, cevabi nedir?',
    dogruCevap: '42',
    celdiriciler: ['41', '41', '42', '43'],
    cozum: ['Cunku oyle']
  }, tohumluRng(7));

  assert.equal(new Set(soru.secenekler).size, soru.secenekler.length);
  assert.ok(soru.secenekler.includes('42'));
});
```

- [ ] **Step 3: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/uretici-index.test.js`
Expected: FAIL, `Cannot find module '../src/engines/uretici/index.js'`.

- [ ] **Step 4: `src/engines/uretici/ortak.js` yaz**

```js
/**
 * Soru ureticilerinin ortak yardimcilari.
 *
 * index.js'ten AYRI bir dosyadir cunku index.js ureticileri import
 * ediyor, ureticiler de bu yardimcilari kullaniyor. Tek dosya olsaydi
 * dongusel import olurdu; boyle akis tek yonlu kalir:
 *   index.js -> uretici/<konu>.js -> ortak.js
 *
 * TEMEL KURAL: cevap, ureticinin sectigi parametrelerden HESAPLANIR.
 * Hicbir yerde "cevap muhtemelen su" yoktur. Celdiriciler de rastgele
 * sayi degil, cocugun gercekten yaptigi hatalarin sonucudur; yanlis
 * secildiginde cozum adimlari hangi hatanin yapildigini gosterir.
 */

export const BICIMLER = ['secmeli', 'sayi'];

/** Diziden rastgele bir oge. rng disaridan gelir. */
export const sec = (dizi, rng) => dizi[Math.floor(rng() * dizi.length)];

/**
 * Fisher-Yates. Kaynagi degistirmez.
 */
export function karistir(dizi, rng) {
  const out = [...dizi];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Secmeli soru kurar.
 *
 * Celdiriciler once benzersizlestirilir ve dogru cevapla cakisanlar
 * elenir; yoksa ayni sik iki kez cikar ve cocuk hakli olarak sasirir.
 * En fazla 3 celdirici alinir, yani 4 sik olur.
 *
 * dogru indeksi karistirmadan SONRA bulunur, sabit tutulmaz. Sabit
 * kalsaydi cocuk bir sure sonra "cevap hep ikinci sik" diye ogrenirdi.
 */
export function secmeliKur({ tip, soru, dogruCevap, celdiriciler, cozum, gorsel = null }, rng) {
  const dogruMetin = String(dogruCevap);
  const temiz = [];
  for (const c of celdiriciler.map(String)) {
    if (c !== dogruMetin && !temiz.includes(c)) temiz.push(c);
    if (temiz.length === 3) break;
  }

  const secenekler = karistir([dogruMetin, ...temiz], rng);

  return {
    tip,
    bicim: 'secmeli',
    soru: { tr: soru },
    secenekler,
    dogru: secenekler.indexOf(dogruMetin),
    cozum,
    gorsel
  };
}
```

- [ ] **Step 5: `src/engines/uretici/index.js` yaz**

```js
/**
 * Soru ureticilerinin kayit defteri.
 *
 * Her uretici uret(seviye, rng) imzasini tasir ve soru sozlesmesine
 * uyan bir nesne dondurur. rng disaridan gelir: motorlar saf kalir ve
 * testler tohumlu calisir.
 *
 * Ortak yardimcilar ortak.js'tedir ve buradan yeniden disa aktarilir;
 * cagiranlar tek yerden import edebilsin diye.
 */

import { uret as temelCizimler } from './temel-cizimler.js';
import { uret as aciOlcme } from './aci-olcme.js';
import { uret as cokgenlerCember } from './cokgenler-cember.js';

export { BICIMLER, sec, karistir, secmeliKur } from './ortak.js';

export const URETICILER = {
  'temel-cizimler': temelCizimler,
  'aci-olcme': aciOlcme,
  'cokgenler-cember': cokgenlerCember
};

export function ureticiVarMi(id) {
  return typeof URETICILER[id] === 'function';
}

export function soruUret(id, seviye, rng) {
  const uret = URETICILER[id];
  return typeof uret === 'function' ? uret(seviye, rng) : null;
}
```

- [ ] **Step 6: Kismi testi calistir**

Run: `node --test tests/uretici-index.test.js`
Expected: FAIL, `Cannot find module './temel-cizimler.js'`. Bu beklenen
haldir; uretici dosyalari Task 9, 10 ve 11'de yazilacak ve bu test
Task 11'in sonunda yesil olacak. `ortak.js` yardimcilarini sinayan
testler (`karistir`, `secmeliKur`) da o zaman calisacak.

- [ ] **Step 7: Commit**

```bash
git add src/engines/uretici/ortak.js src/engines/uretici/index.js \
        tests/yardim/soru-sozlesmesi.js tests/uretici-index.test.js
git commit -m "feat(ders): soru ureticisi sozlesmesi ve kayit defteri

Ortak soru sekli, tohumlu rng yardimcisi ve 200 turlu sozlesme
dogrulayicisi. secmeliKur celdiricileri benzersizlestirir ve dogru
indeksi karistirmadan sonra bulur; sabit indeks olsa cocuk bir sure
sonra cevabin yerini ezberlerdi.

Uretici dosyalari Task 9-11'de gelecek; uretici-index testi o zamana
kadar kirmizi kalir."
```

---

## Task 9: Temel cizimler ureticisi

Kazanim MAT.5.3.1 (arac ve teknoloji) ve MAT.5.3.2 (ozelliklere dair
cikarim). Bu konu parametrik degil kavramsal: sorular bir varlik
tablosundan uretilir. "Insa yoluyla dogruluk" burada su demek: cevap
tablodan okunur, tahmin edilmez, ve test AYNI tabloyu bagimsiz olarak
tarayip her kaydi tek tek dogrular.

**Files:**
- Create: `src/engines/uretici/temel-cizimler.js`
- Test: `tests/uretici-temel-cizimler.test.js`

**Interfaces:**
- Consumes: `secmeliKur`, `karistir`, `sec` (`src/engines/uretici/ortak.js`, Task 8)
- Produces:
  - `uret(seviye, rng)` -> soru
  - `VARLIKLAR` -> `Array<{ id, ad, tanim, arac, uc, gosterim }>`
  - `ARACLAR` -> `Array<{ id, ad }>`
  - `aracSorusu(varlik, rng)`, `tanimSorusu(varlik, rng)`,
    `ucSorusu(varlik, rng)`, `gosterimSorusu(varlik, rng)`
  - Soru tipleri: `temel-cizimler-arac`, `temel-cizimler-tanim`,
    `temel-cizimler-uc`, `temel-cizimler-gosterim`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/uretici-temel-cizimler.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uret, VARLIKLAR, ARACLAR,
  aracSorusu, tanimSorusu, ucSorusu, gosterimSorusu
} from '../src/engines/uretici/temel-cizimler.js';
import { ureticiyiSina, sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

test('seviye 1 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 1, (soru) => {
    assert.ok(soru.tip.startsWith('temel-cizimler-'), `beklenmeyen tip ${soru.tip}`);
  });
});

test('seviye 2 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 2, (soru) => {
    assert.ok(soru.tip.startsWith('temel-cizimler-'), `beklenmeyen tip ${soru.tip}`);
  });
});

test('seviye 1 yalniz arac ve tanim sorusu uretir', () => {
  const tipler = new Set();
  for (let t = 1; t <= 200; t++) tipler.add(uret(1, tohumluRng(t)).tip);
  assert.deepEqual([...tipler].sort(), ['temel-cizimler-arac', 'temel-cizimler-tanim']);
});

test('seviye 2 yalniz uc ve gosterim sorusu uretir', () => {
  const tipler = new Set();
  for (let t = 1; t <= 200; t++) tipler.add(uret(2, tohumluRng(t)).tip);
  assert.deepEqual([...tipler].sort(), ['temel-cizimler-gosterim', 'temel-cizimler-uc']);
});

test('her varligin arac sorusunda dogru cevap tablodaki aractir', () => {
  for (const v of VARLIKLAR) {
    for (let t = 1; t <= 20; t++) {
      const soru = aracSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `arac ${v.id} tohum ${t}`);
      const beklenen = ARACLAR.find((a) => a.id === v.arac).ad;
      assert.equal(soru.secenekler[soru.dogru], beklenen, `${v.ad} icin yanlis arac`);
      assert.ok(soru.soru.tr.includes(v.ad), `${v.ad} soru metninde gecmiyor`);
    }
  }
});

test('her varligin tanim sorusunda dogru cevap varligin adidir', () => {
  for (const v of VARLIKLAR) {
    for (let t = 1; t <= 20; t++) {
      const soru = tanimSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `tanim ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], v.ad);
      assert.ok(soru.soru.tr.includes(v.tanim), 'tanim metni soruda yok');
    }
  }
});

test('uc sorusu yalniz uc sayisi tanimli varliklar icin kurulur', () => {
  const ucluVarliklar = VARLIKLAR.filter((v) => Number.isInteger(v.uc));
  assert.ok(ucluVarliklar.length >= 3, 'uc sayisi tanimli varlik az');
  for (const v of ucluVarliklar) {
    for (let t = 1; t <= 20; t++) {
      const soru = ucSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `uc ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], String(v.uc));
    }
  }
});

test('gosterim sorusunda dogru cevap varligin adidir', () => {
  const gosterimli = VARLIKLAR.filter((v) => v.gosterim);
  assert.ok(gosterimli.length >= 3, 'gosterimi olan varlik az');
  for (const v of gosterimli) {
    for (let t = 1; t <= 20; t++) {
      const soru = gosterimSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `gosterim ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], v.ad);
      assert.ok(soru.soru.tr.includes(v.gosterim), 'gosterim soruda yok');
    }
  }
});

test('varlik tablosu kazanimin tum ogelerini kapsar', () => {
  const adlar = VARLIKLAR.map((v) => v.ad.toLocaleLowerCase('tr'));
  for (const gereken of ['nokta', 'doğru', 'doğru parçası', 'ışın', 'açı', 'çember', 'dikme']) {
    assert.ok(adlar.includes(gereken), `MAT.5.3.1 ogesi eksik: ${gereken}`);
  }
});

test('varlik kimlikleri benzersizdir', () => {
  const idler = VARLIKLAR.map((v) => v.id);
  assert.equal(new Set(idler).size, idler.length);
});

test('her varligin araci arac tablosunda vardir', () => {
  for (const v of VARLIKLAR) {
    assert.ok(ARACLAR.some((a) => a.id === v.arac), `${v.ad} araci tanimsiz: ${v.arac}`);
  }
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(1, tohumluRng(99)), uret(1, tohumluRng(99)));
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/uretici-temel-cizimler.test.js`
Expected: FAIL, `Cannot find module '../src/engines/uretici/temel-cizimler.js'`.

- [ ] **Step 3: Ureticiyi yaz**

```js
/**
 * Temel geometrik cizimler soru ureticisi.
 * Kazanimlar: MAT.5.3.1 (arac ve teknoloji), MAT.5.3.2 (cikarim).
 *
 * Bu konu parametrik degil kavramsaldir; sorular asagidaki varlik
 * tablosundan uretilir. Cevap her zaman tablodan OKUNUR. Celdiriciler
 * de tablodan gelir, yani hepsi makul ama yanlis secenekler olur;
 * rastgele uydurulmus bir sik cocuga hicbir sey ogretmez.
 */

import { secmeliKur, karistir, sec } from './ortak.js';

export const ARACLAR = [
  { id: 'cetvel', ad: 'Cetvel' },
  { id: 'pergel', ad: 'Pergel' },
  { id: 'aciolcer', ad: 'Açıölçer' },
  { id: 'gonye', ad: 'Gönye' }
];

export const VARLIKLAR = [
  {
    id: 'nokta', ad: 'Nokta', arac: 'cetvel', uc: 0, gosterim: 'A',
    tanim: 'Yeri belli olan, boyu ve eni olmayan şekil'
  },
  {
    id: 'dogru', ad: 'Doğru', arac: 'cetvel', uc: 0, gosterim: 'AB doğrusu',
    tanim: 'İki yönde de sonsuza giden, başı ve sonu olmayan şekil'
  },
  {
    id: 'dogru-parcasi', ad: 'Doğru parçası', arac: 'cetvel', uc: 2, gosterim: '[AB]',
    tanim: 'İki ucu belli olan, uzunluğu ölçülebilen şekil'
  },
  {
    id: 'isin', ad: 'Işın', arac: 'cetvel', uc: 1, gosterim: '[AB',
    tanim: 'Bir ucu belli olan, diğer yönde sonsuza giden şekil'
  },
  {
    id: 'aci', ad: 'Açı', arac: 'aciolcer', uc: null, gosterim: 'ABC açısı',
    tanim: 'Başlangıç noktaları aynı olan iki ışının oluşturduğu şekil'
  },
  {
    id: 'cember', ad: 'Çember', arac: 'pergel', uc: null, gosterim: null,
    tanim: 'Bir noktaya eşit uzaklıktaki noktaların oluşturduğu kapalı eğri'
  },
  {
    id: 'dikme', ad: 'Dikme', arac: 'gonye', uc: null, gosterim: null,
    tanim: 'Bir doğruya 90 derecelik açıyla çizilen doğru'
  }
];

const varlikAdi = (id) => VARLIKLAR.find((v) => v.id === id).ad;

export function aracSorusu(varlik, rng) {
  const dogru = ARACLAR.find((a) => a.id === varlik.arac);
  const celdiriciler = ARACLAR.filter((a) => a.id !== varlik.arac).map((a) => a.ad);

  return secmeliKur({
    tip: 'temel-cizimler-arac',
    soru: `${varlik.ad} çizmek için hangi aracı kullanırsın?`,
    dogruCevap: dogru.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${varlik.ad}: ${varlik.tanim.toLocaleLowerCase('tr')}.`,
      `Bunu çizmek için ${dogru.ad.toLocaleLowerCase('tr')} gerekir.`
    ]
  }, rng);
}

export function tanimSorusu(varlik, rng) {
  const celdiriciler = VARLIKLAR.filter((v) => v.id !== varlik.id).map((v) => v.ad);

  return secmeliKur({
    tip: 'temel-cizimler-tanim',
    soru: `${varlik.tanim} hangisidir?`,
    dogruCevap: varlik.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `Tanım "${varlik.tanim.toLocaleLowerCase('tr')}" diyor.`,
      `Bu tanıma uyan şekil ${varlik.ad.toLocaleLowerCase('tr')}.`
    ]
  }, rng);
}

export function ucSorusu(varlik, rng) {
  // Celdiriciler diger varliklarin uc sayilari: "isin ile dogru
  // parcasini karistirma" hatasini dogrudan hedefler.
  const celdiriciler = [0, 1, 2, 3]
    .filter((n) => n !== varlik.uc)
    .map(String);

  return secmeliKur({
    tip: 'temel-cizimler-uc',
    soru: `Bir ${varlik.ad.toLocaleLowerCase('tr')} şeklinin kaç ucu vardır?`,
    dogruCevap: String(varlik.uc),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${varlik.ad}: ${varlik.tanim.toLocaleLowerCase('tr')}.`,
      `Buna göre uç sayısı ${varlik.uc}.`
    ]
  }, rng);
}

export function gosterimSorusu(varlik, rng) {
  const celdiriciler = VARLIKLAR
    .filter((v) => v.id !== varlik.id && v.gosterim)
    .map((v) => v.ad);

  return secmeliKur({
    tip: 'temel-cizimler-gosterim',
    soru: `"${varlik.gosterim}" gösterimi neyi ifade eder?`,
    dogruCevap: varlik.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `"${varlik.gosterim}" gösterimi ${varlik.ad.toLocaleLowerCase('tr')} demektir.`,
      `${varlik.tanim}.`
    ]
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    const varlik = sec(VARLIKLAR, rng);
    return rng() < 0.5 ? aracSorusu(varlik, rng) : tanimSorusu(varlik, rng);
  }

  // Seviye 2: ozellik cikarimi. uc sorusu yalniz uc sayisi tanimli,
  // gosterim sorusu yalniz gosterimi olan varliklar icin kurulabilir.
  const ucluler = VARLIKLAR.filter((v) => Number.isInteger(v.uc));
  const gosterimliler = VARLIKLAR.filter((v) => v.gosterim);

  return rng() < 0.5
    ? ucSorusu(sec(ucluler, rng), rng)
    : gosterimSorusu(sec(gosterimliler, rng), rng);
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/uretici-temel-cizimler.test.js`
Expected: PASS, 12 test gecer.

Not: `secmeliKur` en fazla 3 celdirici alir, yani `ucSorusu` icin 4 sik
olur. `aracSorusu` icin de 3 celdirici vardir (4 arac, biri dogru).

- [ ] **Step 5: Commit**

```bash
git add src/engines/uretici/temel-cizimler.js tests/uretici-temel-cizimler.test.js
git commit -m "feat(ders): temel cizimler soru ureticisi

MAT.5.3.1 ve MAT.5.3.2. Sorular varlik tablosundan uretilir, cevap
tablodan okunur. Celdiriciler tablonun diger kayitlarindan gelir:
'isin ile dogru parcasini karistirma' hatasini dogrudan hedefler.
Test her varligi tek tek dogrular, rastgele orneklemez."
```

---

## Task 10: Aci motoru ve aci olcme ureticisi

Kazanim MAT.5.3.3 (aci olcme araci) ve MAT.5.3.4 (iki-uc dogrunun
olusturdugu acilar). Burasi gercekten parametrik: derece secilir, cevap
hesaplanir.

**Files:**
- Create: `src/engines/widgets/aci.js`
- Create: `src/engines/uretici/aci-olcme.js`
- Test: `tests/widgets-aci.test.js`
- Test: `tests/uretici-aci-olcme.test.js`

**Interfaces:**
- Consumes: `secmeliKur`, `karistir`, `sec` (`src/engines/uretici/ortak.js`, Task 8)
- Produces (`engines/widgets/aci.js`):
  - `aciTuru(derece)` -> `'dar' | 'dik' | 'genis' | 'dogru' | 'tam'`
  - `ACI_TURU_ADI: { dar: 'Dar açı', dik: 'Dik açı', genis: 'Geniş açı', dogru: 'Doğru açı', tam: 'Tam açı' }`
  - `butunler(a)` -> `180 - a`
  - `tumler(a)` -> `90 - a`
  - `tersAci(a)` -> `a`
  - `komsuAci(a)` -> `180 - a`
- Produces (`engines/uretici/aci-olcme.js`):
  - `uret(seviye, rng)` -> soru
  - Soru tipleri: `aci-olcme-tur`, `aci-olcme-okuma`, `aci-olcme-butunler`,
    `aci-olcme-tumler`, `aci-olcme-ters`

- [ ] **Step 1: Aci motoru testini yaz**

```js
// tests/widgets-aci.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aciTuru, ACI_TURU_ADI, butunler, tumler, tersAci, komsuAci } from '../src/engines/widgets/aci.js';

test('aci turleri sinirlariyla birlikte dogru siniflanir', () => {
  assert.equal(aciTuru(1), 'dar');
  assert.equal(aciTuru(89), 'dar');
  assert.equal(aciTuru(90), 'dik');
  assert.equal(aciTuru(91), 'genis');
  assert.equal(aciTuru(179), 'genis');
  assert.equal(aciTuru(180), 'dogru');
  assert.equal(aciTuru(360), 'tam');
});

test('her aci turunun Turkce adi vardir', () => {
  for (const tur of ['dar', 'dik', 'genis', 'dogru', 'tam']) {
    assert.ok(ACI_TURU_ADI[tur], `${tur} icin ad yok`);
  }
});

test('butunler acilari 180 yapar', () => {
  for (let a = 1; a <= 179; a++) {
    assert.equal(a + butunler(a), 180);
  }
});

test('tumler acilari 90 yapar', () => {
  for (let a = 1; a <= 89; a++) {
    assert.equal(a + tumler(a), 90);
  }
});

test('ters aci kendisine esittir', () => {
  for (let a = 1; a <= 179; a++) assert.equal(tersAci(a), a);
});

test('komsu aci butunleridir', () => {
  for (let a = 1; a <= 179; a++) assert.equal(komsuAci(a), butunler(a));
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/widgets-aci.test.js`
Expected: FAIL, modul yok.

- [ ] **Step 3: Aci motorunu yaz**

```js
/**
 * Aci hesaplari. Saf, DOM yok, rastgele yok.
 *
 * Hem soru ureticisi hem aciolcer widget'i buradan okur; boylece
 * ekranda gosterilen ile soruda sorulan ayni kuraldan gelir.
 */

export const ACI_TURU_ADI = {
  dar: 'Dar açı',
  dik: 'Dik açı',
  genis: 'Geniş açı',
  dogru: 'Doğru açı',
  tam: 'Tam açı'
};

export function aciTuru(derece) {
  if (derece === 360) return 'tam';
  if (derece === 180) return 'dogru';
  if (derece === 90) return 'dik';
  return derece < 90 ? 'dar' : 'genis';
}

/** Butunler acilar toplami 180'dir. */
export function butunler(a) {
  return 180 - a;
}

/** Tumler acilar toplami 90'dir. */
export function tumler(a) {
  return 90 - a;
}

/**
 * Iki dogru kesistiginde karsilikli (ters) acilar esittir. Fonksiyon
 * ayni degeri donduruyor gibi gorunuyor ama kurali adlandirmak onemli:
 * ureticideki cozum adimi bu kurali gosteriyor ve testi de var.
 */
export function tersAci(a) {
  return a;
}

/** Kesisen iki dogruda komsu acilar butunlerdir. */
export function komsuAci(a) {
  return butunler(a);
}
```

- [ ] **Step 4: Aci motoru testini calistir**

Run: `node --test tests/widgets-aci.test.js`
Expected: PASS, 6 test gecer.

- [ ] **Step 5: Uretici testini yaz**

```js
// tests/uretici-aci-olcme.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uret } from '../src/engines/uretici/aci-olcme.js';
import { aciTuru, ACI_TURU_ADI, butunler, tumler } from '../src/engines/widgets/aci.js';
import { ureticiyiSina, tohumluRng } from './yardim/soru-sozlesmesi.js';

// Soru metninden dereceyi geri okur; test cevabi BAGIMSIZ olarak
// yeniden hesaplayabilsin diye.
const dereceAl = (metin) => Number(metin.match(/(\d+)\s*derece/)[1]);

test('seviye 1 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 1, (soru) => {
    assert.ok(['aci-olcme-tur', 'aci-olcme-okuma'].includes(soru.tip), soru.tip);
  });
});

test('seviye 2 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 2, (soru) => {
    assert.ok(['aci-olcme-butunler', 'aci-olcme-tumler', 'aci-olcme-ters'].includes(soru.tip), soru.tip);
  });
});

test('aci turu sorusunun cevabi bagimsiz hesapla dogrulanir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(1, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-tur') continue;
    const derece = dereceAl(soru.soru.tr);
    assert.equal(soru.secenekler[soru.dogru], ACI_TURU_ADI[aciTuru(derece)],
      `${derece} derece icin yanlis tur, tohum ${t}`);
  }
});

test('aciolcer okuma sorusunda cevap gorsel verideki derecedir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(1, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-okuma') continue;
    assert.ok(soru.gorsel && soru.gorsel.widget === 'aciolcer', 'gorsel verisi yok');
    assert.equal(soru.secenekler[soru.dogru], String(soru.gorsel.derece));
  }
});

test('butunler sorusunun cevabi 180 den cikarmayla dogrulanir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-butunler') continue;
    const derece = dereceAl(soru.soru.tr);
    assert.equal(Number(soru.secenekler[soru.dogru]), butunler(derece));
    assert.equal(derece + Number(soru.secenekler[soru.dogru]), 180);
  }
});

test('tumler sorusunun cevabi 90 dan cikarmayla dogrulanir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-tumler') continue;
    const derece = dereceAl(soru.soru.tr);
    assert.equal(Number(soru.secenekler[soru.dogru]), tumler(derece));
    assert.ok(tumler(derece) > 0, 'tumleri sifir veya negatif olmamali');
  }
});

test('ters aci sorusunun cevabi verilen aciya esittir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-ters') continue;
    const derece = dereceAl(soru.soru.tr);
    assert.equal(Number(soru.secenekler[soru.dogru]), derece);
  }
});

test('celdiriciler gercek hatalardan gelir, dogruya esit degildir', () => {
  for (let t = 1; t <= 300; t++) {
    for (const seviye of [1, 2]) {
      const soru = uret(seviye, tohumluRng(t));
      const dogru = soru.secenekler[soru.dogru];
      const digerleri = soru.secenekler.filter((_, i) => i !== soru.dogru);
      assert.ok(!digerleri.includes(dogru), `tohum ${t}: celdirici dogruya esit`);
    }
  }
});

test('butunler sorusunda 90 dan cikarma hatasi celdirici olarak bulunur', () => {
  let bulundu = 0;
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-butunler') continue;
    const derece = dereceAl(soru.soru.tr);
    if (derece < 90 && soru.secenekler.includes(String(tumler(derece)))) bulundu++;
  }
  assert.ok(bulundu > 0, 'yaygin hata celdirici olarak hic kullanilmamis');
});

test('uretilen dereceler makul araliktadir', () => {
  for (let t = 1; t <= 300; t++) {
    for (const seviye of [1, 2]) {
      const soru = uret(seviye, tohumluRng(t));
      const eslesme = soru.soru.tr.match(/(\d+)\s*derece/);
      if (!eslesme) continue;
      const d = Number(eslesme[1]);
      assert.ok(d >= 5 && d <= 175, `mantiksiz derece ${d}`);
    }
  }
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(2, tohumluRng(55)), uret(2, tohumluRng(55)));
});
```

- [ ] **Step 6: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/uretici-aci-olcme.test.js`
Expected: FAIL, modul yok.

- [ ] **Step 7: Ureticiyi yaz**

```js
/**
 * Aci olcme soru ureticisi.
 * Kazanimlar: MAT.5.3.3 (olcme araci), MAT.5.3.4 (kesisen dogrularin
 * olusturdugu acilar).
 *
 * Gercekten parametriktir: once derece secilir, sonra cevap o dereceden
 * HESAPLANIR. Celdiriciler cocugun gercekten yaptigi hatalardir:
 *   - butunler yerine tumler almak (180 yerine 90'dan cikarmak)
 *   - aciyi oldugu gibi birakmak
 *   - komsu ile ters aciyi karistirmak
 * Yanlis secildiginde cozum adimlari hangi hatanin yapildigini gosterir.
 */

import { secmeliKur, karistir, sec } from './ortak.js';
import { aciTuru, ACI_TURU_ADI, butunler, tumler } from '../widgets/aci.js';

// Beste bir katlari: aciolcerle gercekten okunabilir degerler. 1 derece
// hassasiyetinde soru sormak cocuga olcmeyi degil goz karariyla tahmini
// ogretirdi.
const derece = (rng, en, encok) => {
  const adim = 5;
  const kac = Math.floor(((encok - en) / adim) + 1);
  return en + adim * Math.floor(rng() * kac);
};

function turSorusu(rng) {
  // Dik ve dogru aciyi da ara sira sor: yalniz rastgele deger secersek
  // tam 90 ve 180 neredeyse hic cikmaz.
  const ozel = [90, 180];
  const d = rng() < 0.25 ? sec(ozel, rng) : derece(rng, 10, 175);
  const tur = aciTuru(d);
  const celdiriciler = Object.keys(ACI_TURU_ADI)
    .filter((k) => k !== tur && k !== 'tam')
    .map((k) => ACI_TURU_ADI[k]);

  return secmeliKur({
    tip: 'aci-olcme-tur',
    soru: `Ölçüsü ${d} derece olan açı hangi türdendir?`,
    dogruCevap: ACI_TURU_ADI[tur],
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      '90 dereceden küçük açı dardır, 90 derece diktir, 90 ile 180 arası geniştir, 180 derece doğru açıdır.',
      `${d} derece bu kurala göre ${ACI_TURU_ADI[tur].toLocaleLowerCase('tr')}dır.`
    ],
    gorsel: { widget: 'aciolcer', derece: d, mod: 'goster' }
  }, rng);
}

function okumaSorusu(rng) {
  const d = derece(rng, 15, 165);
  // Celdiriciler aciolcerin ters skalasini okuma hatasi (180 - d) ve
  // bir buyuk/kucuk bolme kaymasi.
  const celdiriciler = [180 - d, d + 10, d - 10]
    .filter((x) => x > 0 && x < 180 && x !== d)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-okuma',
    soru: 'Açıölçerde gösterilen açı kaç derecedir?',
    dogruCevap: String(d),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Açıölçerin merkezini açının köşesine, sıfır çizgisini bir kenarına koy.',
      'Diğer kenarın geçtiği sayıyı, sıfırın başladığı skaladan oku.',
      `Bu açı ${d} derecedir.`
    ],
    gorsel: { widget: 'aciolcer', derece: d, mod: 'olc' }
  }, rng);
}

function butunlerSorusu(rng) {
  const d = derece(rng, 15, 165);
  const dogru = butunler(d);
  const celdiriciler = [tumler(d), d, dogru + 10]
    .filter((x) => x > 0 && x !== dogru)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-butunler',
    soru: `Bir doğru üzerinde açılardan biri ${d} derece ise, komşusu kaç derecedir?`,
    dogruCevap: String(dogru),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Bir doğru üzerindeki komşu açılar bütünlerdir, toplamları 180 derecedir.',
      `180 - ${d} = ${dogru}`,
      'Dikkat: 90 değil 180 kullanılır. 90 kullanırsan tümler açıyı bulursun.'
    ]
  }, rng);
}

function tumlerSorusu(rng) {
  const d = derece(rng, 15, 75);
  const dogru = tumler(d);
  const celdiriciler = [butunler(d), d, dogru + 10]
    .filter((x) => x > 0 && x !== dogru)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-tumler',
    soru: `Bir dik açı ${d} derece ve başka bir açıya bölünmüş. Diğer açı kaç derecedir?`,
    dogruCevap: String(dogru),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Dik açı 90 derecedir, iki parçanın toplamı 90 eder.',
      `90 - ${d} = ${dogru}`,
      'Dikkat: 180 kullanırsan bütünler açıyı bulursun, burada 90 kullanılır.'
    ]
  }, rng);
}

function tersSorusu(rng) {
  const d = derece(rng, 25, 155);
  const celdiriciler = [butunler(d), 90, d + 10]
    .filter((x) => x > 0 && x !== d)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-ters',
    soru: `İki doğru kesişiyor. Oluşan açılardan biri ${d} derece ise, karşısındaki (ters) açı kaç derecedir?`,
    dogruCevap: String(d),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'İki doğru kesiştiğinde karşılıklı duran açılar birbirine eşittir.',
      `Bu yüzden ters açı da ${d} derecedir.`,
      `Komşu açı olsaydı 180 - ${d} = ${butunler(d)} olurdu; ters açı farklıdır.`
    ]
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    return rng() < 0.5 ? turSorusu(rng) : okumaSorusu(rng);
  }
  const p = rng();
  if (p < 0.34) return butunlerSorusu(rng);
  if (p < 0.67) return tumlerSorusu(rng);
  return tersSorusu(rng);
}
```

- [ ] **Step 8: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/uretici-aci-olcme.test.js`
Expected: PASS, 11 test gecer.

- [ ] **Step 9: Commit**

```bash
git add src/engines/widgets/aci.js src/engines/uretici/aci-olcme.js \
        tests/widgets-aci.test.js tests/uretici-aci-olcme.test.js
git commit -m "feat(ders): aci motoru ve aci olcme ureticisi

MAT.5.3.3 ve MAT.5.3.4. Derece once secilir, cevap ondan hesaplanir;
test cevabi soru metninden dereceyi geri okuyup bagimsiz olarak
yeniden hesaplar.

Dereceler beste bir katlari, cunku aciolcerle gercekten okunabilmeli.
Celdiriciler gercek hatalar: 180 yerine 90'dan cikarmak, aciyi oldugu
gibi birakmak, komsu ile ters aciyi karistirmak."
```

---

## Task 11: Cokgenler ve cember ureticisi

Kazanimlar MAT.5.3.5 (cokgen olusumu), MAT.5.3.6 (kenar ve aci
ozellikleri), MAT.5.3.7 (kesisen cember ciftinden insa edilen ucgenler).

Seviye 3 ve 4 gercek bir insa problemidir: iki cemberin yaricaplari ve
merkezler arasi uzaklik secilir, olusan ucgenin kenarlari bunlardir, tur
kenarlardan HESAPLANIR. Ayrica cemberlerin gercekten iki noktada
kesismesi gerekir; uretici bu kosulu saglamak zorundadir, yoksa var
olmayan bir ucgen sorulur.

**Files:**
- Create: `src/engines/uretici/cokgenler-cember.js`
- Test: `tests/uretici-cokgenler-cember.test.js`

**Interfaces:**
- Consumes: `secmeliKur`, `karistir`, `sec` (`src/engines/uretici/ortak.js`, Task 8)
- Produces:
  - `uret(seviye, rng)` -> soru
  - `COKGENLER` -> `Array<{ kenar, ad }>` (3-8 kenar)
  - `ucgenTuru(a, b, c)` -> `'eskenar' | 'ikizkenar' | 'cesitkenar'`
  - `kesisirMi(r1, r2, d)` -> boolean
  - `UCGEN_TURU_ADI` -> `{ eskenar: 'Eşkenar üçgen', ... }`
  - Soru tipleri: `cokgen-olusum`, `cokgen-ad`, `cokgen-kenar-kose`,
    `cember-ucgen-tur`, `cember-yaricap`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/uretici-cokgenler-cember.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uret, COKGENLER, ucgenTuru, kesisirMi, UCGEN_TURU_ADI
} from '../src/engines/uretici/cokgenler-cember.js';
import { ureticiyiSina, tohumluRng } from './yardim/soru-sozlesmesi.js';

test('ucgenTuru kenarlardan turu dogru hesaplar', () => {
  assert.equal(ucgenTuru(5, 5, 5), 'eskenar');
  assert.equal(ucgenTuru(5, 5, 8), 'ikizkenar');
  assert.equal(ucgenTuru(5, 8, 5), 'ikizkenar');
  assert.equal(ucgenTuru(8, 5, 5), 'ikizkenar');
  assert.equal(ucgenTuru(3, 5, 7), 'cesitkenar');
});

test('her ucgen turunun Turkce adi vardir', () => {
  for (const t of ['eskenar', 'ikizkenar', 'cesitkenar']) {
    assert.ok(UCGEN_TURU_ADI[t], `${t} icin ad yok`);
  }
});

test('kesisirMi ucgen esitsizligini uygular', () => {
  assert.equal(kesisirMi(5, 5, 6), true);
  assert.equal(kesisirMi(5, 5, 10), false, 'teget durum iki noktada kesismez');
  assert.equal(kesisirMi(5, 5, 11), false, 'ayrik cemberler kesismez');
  assert.equal(kesisirMi(3, 9, 5), false, 'ic ice cemberler kesismez');
  assert.equal(kesisirMi(3, 9, 7), true);
});

test('cokgen tablosu 3 ile 8 kenar arasini kapsar', () => {
  const kenarlar = COKGENLER.map((c) => c.kenar).sort((a, b) => a - b);
  assert.deepEqual(kenarlar, [3, 4, 5, 6, 7, 8]);
});

for (const seviye of [1, 2, 3, 4]) {
  test(`seviye ${seviye} sozlesmeye 200 tohumda uyar`, () => {
    ureticiyiSina(uret, seviye, (soru) => {
      assert.ok(soru.tip.length > 0);
    });
  });
}

test('seviye 1 ve 2 cokgen sorusu, seviye 3 ve 4 cember sorusu uretir', () => {
  const cokgenTipleri = new Set();
  const cemberTipleri = new Set();
  for (let t = 1; t <= 200; t++) {
    cokgenTipleri.add(uret(1, tohumluRng(t)).tip);
    cokgenTipleri.add(uret(2, tohumluRng(t)).tip);
    cemberTipleri.add(uret(3, tohumluRng(t)).tip);
    cemberTipleri.add(uret(4, tohumluRng(t)).tip);
  }
  for (const tip of cokgenTipleri) assert.ok(tip.startsWith('cokgen-'), tip);
  for (const tip of cemberTipleri) assert.ok(tip.startsWith('cember-'), tip);
});

test('cokgen olusum sorusunda dogru cevap dogru sayisidir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(1, tohumluRng(t));
    if (soru.tip !== 'cokgen-olusum') continue;
    const kenar = soru.gorsel.kenar;
    const beklenen = COKGENLER.find((c) => c.kenar === kenar).ad;
    assert.equal(soru.secenekler[soru.dogru], beklenen);
  }
});

test('kenar-kose sorusunda kenar sayisi kose sayisina esittir', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'cokgen-kenar-kose') continue;
    assert.equal(Number(soru.secenekler[soru.dogru]), soru.gorsel.kenar);
  }
});

test('cember ucgen sorusundaki ucgen gercekten var olur', () => {
  let sayac = 0;
  for (let t = 1; t <= 400; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      assert.ok(kesisirMi(r1, r2, d),
        `tohum ${t}: cemberler kesismiyor (${r1}, ${r2}, ${d}) ama ucgen soruluyor`);
      sayac++;
    }
  }
  assert.ok(sayac > 0, 'hic cember-ucgen sorusu uretilmemis');
});

test('cember ucgen sorusunun cevabi kenarlardan bagimsiz hesapla dogrulanir', () => {
  for (let t = 1; t <= 400; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      const beklenen = UCGEN_TURU_ADI[ucgenTuru(r1, r2, d)];
      assert.equal(soru.secenekler[soru.dogru], beklenen,
        `tohum ${t}: (${r1}, ${r2}, ${d}) icin yanlis tur`);
    }
  }
});

test('uc ucgen turu de zamanla uretilir', () => {
  const turler = new Set();
  for (let t = 1; t <= 600; t++) {
    for (const seviye of [3, 4]) {
      const soru = uret(seviye, tohumluRng(t));
      if (soru.tip !== 'cember-ucgen-tur') continue;
      const { r1, r2, d } = soru.gorsel;
      turler.add(ucgenTuru(r1, r2, d));
    }
  }
  assert.deepEqual([...turler].sort(), ['cesitkenar', 'eskenar', 'ikizkenar']);
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(4, tohumluRng(21)), uret(4, tohumluRng(21)));
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/uretici-cokgenler-cember.test.js`
Expected: FAIL, modul yok.

- [ ] **Step 3: Ureticiyi yaz**

```js
/**
 * Cokgenler ve cember soru ureticisi.
 * Kazanimlar: MAT.5.3.5 (cokgen olusumu), MAT.5.3.6 (kenar ve aci
 * ozellikleri), MAT.5.3.7 (kesisen cember ciftinden insa edilen
 * ucgenler).
 *
 * Seviye 3 ve 4 gercek bir insa problemidir. Once iki yaricap ve
 * merkezler arasi uzaklik secilir; olusan ucgenin kenarlari tam olarak
 * bunlardir (iki yaricap + merkezler arasi uzaklik). Tur kenarlardan
 * HESAPLANIR.
 *
 * Kritik kosul: cemberler gercekten IKI noktada kesismeli. Kesismezse
 * ortada ucgen yoktur ve soru anlamsiz olur. kesisirMi bunu zorlar ve
 * uretici gecerli bir uclu bulana kadar dener.
 */

import { secmeliKur, karistir, sec } from './ortak.js';

export const COKGENLER = [
  { kenar: 3, ad: 'Üçgen' },
  { kenar: 4, ad: 'Dörtgen' },
  { kenar: 5, ad: 'Beşgen' },
  { kenar: 6, ad: 'Altıgen' },
  { kenar: 7, ad: 'Yedigen' },
  { kenar: 8, ad: 'Sekizgen' }
];

export const UCGEN_TURU_ADI = {
  eskenar: 'Eşkenar üçgen',
  ikizkenar: 'İkizkenar üçgen',
  cesitkenar: 'Çeşitkenar üçgen'
};

export function ucgenTuru(a, b, c) {
  if (a === b && b === c) return 'eskenar';
  if (a === b || b === c || a === c) return 'ikizkenar';
  return 'cesitkenar';
}

/**
 * Iki cember IKI noktada kesisir mi?
 *
 * Kosul: |r1 - r2| < d < r1 + r2
 * Esitlik halleri (teget cemberler) tek noktada kesisir; ucgen
 * olusmaz, bu yuzden disaridadir.
 */
export function kesisirMi(r1, r2, d) {
  return Math.abs(r1 - r2) < d && d < r1 + r2;
}

function olusumSorusu(rng) {
  const c = sec(COKGENLER, rng);
  const celdiriciler = COKGENLER.filter((x) => x.kenar !== c.kenar).map((x) => x.ad);

  return secmeliKur({
    tip: 'cokgen-olusum',
    soru: `Düzlemde ${c.kenar} doğru, sonuncusu ilkiyle kesişecek biçimde ardışık kesişiyor. Oluşan kapalı şekil hangisidir?`,
    dogruCevap: c.ad,
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Ardışık kesişen doğrular kapalı bir şekil oluşturur.',
      `${c.kenar} doğru kesiştiğinde ${c.kenar} kenar oluşur.`,
      `${c.kenar} kenarlı çokgenin adı ${c.ad.toLocaleLowerCase('tr')}dir.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

function adSorusu(rng) {
  const c = sec(COKGENLER, rng);
  const celdiriciler = COKGENLER.filter((x) => x.kenar !== c.kenar).map((x) => String(x.kenar));

  return secmeliKur({
    tip: 'cokgen-ad',
    soru: `${c.ad} kaç kenarlıdır?`,
    dogruCevap: String(c.kenar),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      `${c.ad}, adından anlaşılacağı gibi ${c.kenar} kenarlıdır.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

function kenarKoseSorusu(rng) {
  const c = sec(COKGENLER, rng);
  // Celdiriciler: "kose sayisi kenardan bir eksik/fazladir" yanilgisi.
  const celdiriciler = [c.kenar - 1, c.kenar + 1, c.kenar * 2]
    .filter((x) => x > 0 && x !== c.kenar)
    .map(String);

  return secmeliKur({
    tip: 'cokgen-kenar-kose',
    soru: `Bir ${c.ad.toLocaleLowerCase('tr')}in ${c.kenar} kenarı var. Kaç köşesi vardır?`,
    dogruCevap: String(c.kenar),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Her çokgende iki komşu kenar bir köşede birleşir.',
      'Bu yüzden köşe sayısı kenar sayısına eşittir.',
      `${c.ad} için ${c.kenar} kenar, ${c.kenar} köşe.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cokgen', kenar: c.kenar }
  }, rng);
}

/**
 * Kesisen iki cember secer.
 *
 * Istenen ucgen turunu hedefleyerek secer ki uc tur de yeterince siksin;
 * tamamen rastgele secseydik eskenar neredeyse hic cikmazdi.
 * Secilen uclu yine de kesisirMi ile dogrulanir.
 */
function cemberCifti(rng) {
  const hedef = sec(['eskenar', 'ikizkenar', 'cesitkenar'], rng);

  for (let deneme = 0; deneme < 50; deneme++) {
    let r1, r2, d;

    if (hedef === 'eskenar') {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1;
      d = r1;
    } else if (hedef === 'ikizkenar') {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1;
      d = 2 + Math.floor(rng() * (2 * r1 - 3));
      if (d === r1) d += 1;
    } else {
      r1 = 3 + Math.floor(rng() * 8);
      r2 = r1 + 1 + Math.floor(rng() * 4);
      d = Math.abs(r1 - r2) + 1 + Math.floor(rng() * (2 * Math.min(r1, r2) - 1));
      if (d === r1 || d === r2) d += 1;
    }

    if (kesisirMi(r1, r2, d) && ucgenTuru(r1, r2, d) === hedef) {
      return { r1, r2, d };
    }
  }

  // Her zaman gecerli olan geri dusus: eskenar ucgen.
  return { r1: 5, r2: 5, d: 5 };
}

function ucgenTurSorusu(rng) {
  const { r1, r2, d } = cemberCifti(rng);
  const tur = ucgenTuru(r1, r2, d);
  const celdiriciler = Object.keys(UCGEN_TURU_ADI)
    .filter((k) => k !== tur)
    .map((k) => UCGEN_TURU_ADI[k]);

  return secmeliKur({
    tip: 'cember-ucgen-tur',
    soru: `Yarıçapları ${r1} cm ve ${r2} cm olan iki çemberin merkezleri arası ${d} cm. Çemberler iki noktada kesişiyor. Merkezleri ve kesişim noktalarından biriyle kurulan üçgen hangi türdendir?`,
    dogruCevap: UCGEN_TURU_ADI[tur],
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Üçgenin kenarları: birinci yarıçap, ikinci yarıçap ve merkezler arası uzaklık.',
      `Yani kenarlar ${r1} cm, ${r2} cm ve ${d} cm.`,
      tur === 'eskenar'
        ? 'Üç kenar da eşit, bu yüzden eşkenar üçgendir.'
        : tur === 'ikizkenar'
          ? 'İki kenar eşit, üçüncüsü farklı, bu yüzden ikizkenar üçgendir.'
          : 'Üç kenar da farklı, bu yüzden çeşitkenar üçgendir.'
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cember-ucgen', r1, r2, d }
  }, rng);
}

function yaricapSorusu(rng) {
  const { r1, r2, d } = cemberCifti(rng);
  const celdiriciler = [d, r1 + r2, Math.abs(r1 - r2)]
    .filter((x) => x > 0 && x !== r1)
    .map(String);

  return secmeliKur({
    tip: 'cember-yaricap',
    soru: `Bir çemberin merkezi M, üzerindeki bir noktası K. Yarıçapı ${r1} cm ise [MK] uzunluğu kaç cm'dir?`,
    dogruCevap: String(r1),
    celdiriciler: karistir(celdiriciler.length >= 2 ? celdiriciler : [String(r1 + 1), String(r1 + 2), String(r1 * 2)], rng),
    cozum: [
      'Çemberin merkezi ile üzerindeki her noktanın arası eşittir.',
      'Bu uzunluğa yarıçap denir.',
      `Yarıçap ${r1} cm olduğuna göre [MK] de ${r1} cm.`
    ],
    gorsel: { widget: 'geometri-tuval', mod: 'cember', r: r1 }
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    return rng() < 0.5 ? olusumSorusu(rng) : adSorusu(rng);
  }
  if (seviye === 2) {
    return rng() < 0.5 ? kenarKoseSorusu(rng) : adSorusu(rng);
  }
  if (seviye === 3) {
    return rng() < 0.5 ? yaricapSorusu(rng) : ucgenTurSorusu(rng);
  }
  return ucgenTurSorusu(rng);
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/uretici-cokgenler-cember.test.js`
Expected: PASS.

Test "seviye 1 ve 2 cokgen sorusu ... uretir" seviye 2'de `cokgen-ad`
tipini de kabul eder cunku `adSorusu` iki seviyede birden kullaniliyor;
ikisi de `cokgen-` ile basladigi icin test gecer.

- [ ] **Step 5: Kayit defteri testini calistir**

Run: `node --test tests/uretici-index.test.js`
Expected: PASS. Uc uretici de yazildi, Task 8'den beri kirmizi duran bu
test artik yesil.

- [ ] **Step 6: Tum testleri calistir**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/engines/uretici/cokgenler-cember.js tests/uretici-cokgenler-cember.test.js
git commit -m "feat(ders): cokgenler ve cember ureticisi

MAT.5.3.5, MAT.5.3.6 ve MAT.5.3.7. Cember sorularinda once yaricaplar
ve merkezler arasi uzaklik seciliyor, ucgenin kenarlari tam olarak
bunlar oluyor, tur kenarlardan hesaplaniyor.

kesisirMi ile cemberlerin gercekten iki noktada kesistigi zorlaniyor;
kesismeselerdi ortada ucgen olmazdi ve var olmayan bir sekli sormus
olurduk. Uretici hedef turu gozeterek seciyor, yoksa eskenar ucgen
neredeyse hic cikmazdi."
```

---

## Task 12: Geometrik Sekiller unitesinin ders icerigi

Uc konu dosyasi, sekiz seviye. Bu gorevin ciktisi **yazilmis Turkce ders
metnidir**; asagida bir seviye tam olarak yazilmistir, kalan yedisi ayni
sekle ve ayni yazim kurallarina gore yazilacaktir. Kurallar somuttur ve
test edilir.

**Files:**
- Create: `src/data/konular/temel-cizimler.js` (seviye 1-2)
- Create: `src/data/konular/aci-olcme.js` (seviye 1-2)
- Create: `src/data/konular/cokgenler-cember.js` (seviye 1-4)
- Modify: `src/data/konular/index.js` (uc konuyu kaydet)
- Test: `tests/konular.test.js`

**Interfaces:**
- Consumes: yok
- Produces:
  - Her konu dosyasi `export default { id, ad: { tr }, kazanimlar, seviyeler }`
  - `seviyeler[n]` -> `{ seviye, baslik, anlatim, ornekler, etkilesim, uretici, quiz }`
  - `anlatim[n]` -> `{ id, metin, gorsel? }` (`ses` alani YOK, turetilir)
  - `ornekler[n]` -> `{ soru, adimlar, cevap }`
  - `etkilesim` -> `{ widget, mod, gorev, veri? }`
  - `KONULAR` -> `{ 'temel-cizimler': ..., 'aci-olcme': ..., 'cokgenler-cember': ... }`

### Icerik yazim kurallari (test edilir)

| Kural | Deger |
|---|---|
| Seviye basina anlatim adimi | 4 ile 6 arasi |
| Adim metni uzunlugu | 120 ile 420 karakter arasi |
| Adim kimligi | `a1`, `a2`, ... sirali ve bosluksuz |
| Seviye basina ornek | en az 1, her orneğin en az 2 cozum adimi |
| Her seviyede | `etkilesim`, `uretici`, `quiz` dolu |
| `uretici` degeri | konunun kendi kimligi |
| Kazanim kodlari | `mufredat.js` ile ayni haftalara denk gelmeli |

### Yazim uslubu kurallari (insan denetimi)

- Hitap ikinci tekil sahis: "çizersin", "bakalım". Emir kipi degil.
- Cocuk adi GECMEZ. Metin herhangi bir cocuga okunabilir olmali.
- Her adim TEK bir fikir anlatir. Iki fikir varsa iki adim olur.
- Sayilar rakamla yazilir ("90 derece"), TTS dogru okusun diye.
- Sembol yerine sozcuk: "doksan derecelik açı" degil "90 derecelik açı";
  ama "∠" gibi isaretler HIC kullanilmaz, TTS onlari okuyamaz.
- Gunluk hayattan bir bag her seviyede en az bir kez gecer (kapı, saat,
  bisiklet tekerleği gibi).

- [ ] **Step 1: Basarisiz icerik testlerini yaz**

```js
// tests/konular.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KONULAR } from '../src/data/konular/index.js';
import { TAKVIM } from '../src/data/mufredat.js';
import { ureticiVarMi } from '../src/engines/uretici/index.js';

const FAZ1 = ['temel-cizimler', 'aci-olcme', 'cokgenler-cember'];

test('Faz 1 konularinin hepsi kayitlidir', () => {
  for (const id of FAZ1) {
    assert.ok(KONULAR[id], `${id} kayitli degil`);
    assert.equal(KONULAR[id].id, id, 'id kendi anahtariyla uyusmuyor');
  }
});

test('her konunun Turkce adi ve kazanimlari vardir', () => {
  for (const id of FAZ1) {
    const k = KONULAR[id];
    assert.ok(k.ad?.tr?.length > 3, `${id}: ad yok`);
    assert.ok(Array.isArray(k.kazanimlar) && k.kazanimlar.length >= 1, `${id}: kazanim yok`);
    for (const kz of k.kazanimlar) {
      assert.match(kz.kod, /^MAT\.5\.\d\.\d$/, `${id}: gecersiz kazanim kodu ${kz.kod}`);
      assert.ok(kz.metin.length > 20, `${id}: kazanim metni fazla kisa`);
    }
  }
});

test('takvimin istedigi her seviye yazilmistir', () => {
  for (const hafta of TAKVIM) {
    for (const ders of hafta.dersler) {
      if (!FAZ1.includes(ders.konu)) continue;
      const sev = KONULAR[ders.konu].seviyeler.find((s) => s.seviye === ders.seviye);
      assert.ok(sev, `hafta ${hafta.hafta}: ${ders.konu} seviye ${ders.seviye} yazilmamis`);
    }
  }
});

test('seviye numaralari 1den bosluksuz artar', () => {
  for (const id of FAZ1) {
    KONULAR[id].seviyeler.forEach((s, i) => {
      assert.equal(s.seviye, i + 1, `${id}: seviye sirasi bozuk`);
    });
  }
});

test('her seviyede 4 ile 6 arasi anlatim adimi vardir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.anlatim.length >= 4 && s.anlatim.length <= 6,
        `${id} seviye ${s.seviye}: ${s.anlatim.length} adim`);
    }
  }
});

test('adim kimlikleri a1den bosluksuz artar', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      s.anlatim.forEach((a, i) => {
        assert.equal(a.id, `a${i + 1}`, `${id} seviye ${s.seviye}: adim kimligi ${a.id}`);
      });
    }
  }
});

test('adim metinleri okunabilir uzunluktadir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        const n = a.metin.trim().length;
        assert.ok(n >= 120 && n <= 420,
          `${id} seviye ${s.seviye} ${a.id}: ${n} karakter (120-420 bekleniyor)`);
      }
    }
  }
});

test('anlatim adimlarinda ses alani YOKTUR, kimlikten turetilir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        assert.equal(a.ses, undefined,
          `${id} seviye ${s.seviye} ${a.id}: ses alani elle yazilmamali`);
      }
    }
  }
});

test('metinlerde TTS nin okuyamayacagi sembol yoktur', () => {
  const yasak = ['∠', '°', '≅', '⊥', '∥', '→', '|'];
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        for (const sembol of yasak) {
          assert.ok(!a.metin.includes(sembol),
            `${id} ${a.id}: "${sembol}" sembolu TTS tarafindan okunamaz`);
        }
      }
    }
  }
});

test('her seviyede en az bir ornek ve her ornekte en az iki adim vardir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.ornekler.length >= 1, `${id} seviye ${s.seviye}: ornek yok`);
      for (const o of s.ornekler) {
        assert.ok(o.soru.length > 15, `${id} seviye ${s.seviye}: ornek sorusu kisa`);
        assert.ok(o.adimlar.length >= 2, `${id} seviye ${s.seviye}: ornek cozumu tek adim`);
        assert.ok(String(o.cevap).length > 0, `${id} seviye ${s.seviye}: ornek cevabi yok`);
      }
    }
  }
});

test('her seviyede etkilesim, uretici ve quiz tanimlidir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.etkilesim?.widget, `${id} seviye ${s.seviye}: widget yok`);
      assert.ok(s.etkilesim?.gorev?.length > 10, `${id} seviye ${s.seviye}: gorev metni yok`);
      assert.equal(s.uretici, id, `${id} seviye ${s.seviye}: uretici kimligi yanlis`);
      assert.ok(ureticiVarMi(s.uretici), `${id}: uretici kayitli degil`);
      assert.equal(s.quiz.soruSayisi, 10, `${id} seviye ${s.seviye}: quiz soru sayisi`);
      assert.equal(s.quiz.gecmeNotu, 70, `${id} seviye ${s.seviye}: quiz gecme notu`);
    }
  }
});

test('seviye basliklari benzersizdir', () => {
  for (const id of FAZ1) {
    const basliklar = KONULAR[id].seviyeler.map((s) => s.baslik);
    assert.equal(new Set(basliklar).size, basliklar.length, `${id}: tekrar eden baslik`);
    for (const b of basliklar) assert.ok(b.length > 4, `${id}: baslik fazla kisa`);
  }
});

test('kullanilan widget kimlikleri Faz 1 de var olanlardir', () => {
  const mevcut = ['geometri-tuval', 'aciolcer'];
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(mevcut.includes(s.etkilesim.widget),
        `${id} seviye ${s.seviye}: "${s.etkilesim.widget}" Faz 1 de yok`);
    }
  }
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/konular.test.js`
Expected: FAIL, `KONULAR['temel-cizimler']` tanimsiz.

- [ ] **Step 3: `temel-cizimler.js` yaz, seviye 1 asagidaki gibi tam**

Bu seviye **tam olarak yazilmistir**. Diger yedi seviye ayni sekle,
yukaridaki test kurallarina ve yazim uslubu kurallarina gore yazilir.

```js
/**
 * Temel Geometrik Cizimler. Haftalar 1-2.
 * Kazanimlar: MAT.5.3.1, MAT.5.3.2.
 *
 * Bu bir VERI dosyasidir. Ders metni Turkcedir ve cocuga dogrudan
 * okunur; ses dosyasi adi konuId-seviye-adimId kalibindan TURETILIR,
 * burada elle yazilmaz.
 */

export default {
  id: 'temel-cizimler',
  ad: { tr: 'Temel Geometrik Çizimler' },
  kazanimlar: [
    { kod: 'MAT.5.3.1', metin: 'Temel geometrik çizimler için matematiksel araç ve teknolojiden yararlanabilme' },
    { kod: 'MAT.5.3.2', metin: 'Temel geometrik çizimlere dayalı deneyimlerini yansıtabilme' }
  ],
  seviyeler: [
    {
      seviye: 1,
      baslik: 'Nokta, doğru ve araçlar',
      anlatim: [
        {
          id: 'a1',
          metin: 'Geometrinin en küçük parçası noktadır. Nokta bir yeri gösterir ama eni, boyu, kalınlığı yoktur. Kalemini kâğıda bir kez değdirdiğinde bıraktığın iz bir noktadır. Noktalara isim vermek için büyük harf kullanırız: A noktası, B noktası gibi.',
          gorsel: 'nokta'
        },
        {
          id: 'a2',
          metin: 'İki noktayı birleştirip iki yönde de durmadan uzatırsan doğru elde edersin. Doğrunun başı da sonu da yoktur, sonsuza kadar gider. Defterinin çizgileri aslında birer doğru parçasıdır, çünkü sayfanın kenarında biterler.',
          gorsel: 'dogru'
        },
        {
          id: 'a3',
          metin: 'Doğruyu bir yerinden kesersen ışın olur. Işının bir başlangıç noktası vardır, diğer yönde sonsuza gider. Güneşten çıkan ışık tam olarak böyledir: bir yerden başlar ve gittikçe uzaklaşır. Bu yüzden adı ışındır.',
          gorsel: 'isin'
        },
        {
          id: 'a4',
          metin: 'İki ucu da belli olan parçaya doğru parçası denir. Uzunluğunu cetvelle ölçebilirsin, çünkü nerede başlayıp nerede bittiği bellidir. Bir kitabın kenarı, bir masanın kenarı birer doğru parçasıdır.',
          gorsel: 'dogru-parcasi'
        },
        {
          id: 'a5',
          metin: 'Her şeklin kendi aracı vardır. Doğru ve doğru parçası için cetvel kullanırsın. Çember çizmek için pergel gerekir, çünkü pergel merkeze olan uzaklığı sabit tutar. Açı ölçmek için açıölçer, dik açı çizmek için gönye kullanılır.',
          gorsel: 'araclar'
        }
      ],
      ornekler: [
        {
          soru: 'Elinde cetvel, pergel, açıölçer ve gönye var. Bir çember çizmen isteniyor. Hangisini seçersin ve neden?',
          adimlar: [
            'Çemberin her noktası merkeze eşit uzaklıktadır.',
            'Bu eşit uzaklığı sabit tutabilen tek araç pergeldir.',
            'Pergelin açıklığını istediğin yarıçap kadar ayarlar, sivri ucunu merkeze basarsın.'
          ],
          cevap: 'Pergel'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'serbest',
        gorev: 'Tuvale bir nokta, bir doğru parçası ve bir ışın çiz. Her birini çizdiğinde uygulama ne çizdiğini sana söyleyecek.'
      },
      uretici: 'temel-cizimler',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 2,
      baslik: 'Gösterimler ve dikme',
      // Yazim kurallarina gore doldurulacak: 4-6 adim, her biri 120-420
      // karakter, tek fikir. Kapsanacak icerik:
      //   - [AB] gosterimi doğru parçası, [AB ışın, AB doğrusu
      //   - Uc sayilari: doğru parçası 2, ışın 1, doğru sonsuz
      //   - Dikme: bir doğruya 90 derecelik açıyla çizilen doğru
      //   - Dik kesişen iki doğrunun oluşturduğu dört açı da 90 derece
      //   - Gunluk hayat bagi: kapı çerçevesi, duvar ile zemin
      anlatim: [],
      ornekler: [],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'dikme',
        gorev: 'Verilen doğruya, üzerindeki noktadan bir dikme çiz. Açının 90 derece olduğunu gönyeyle kontrol et.'
      },
      uretici: 'temel-cizimler',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    }
  ]
};
```

- [ ] **Step 4: Seviye 2'yi doldur ve testi calistir**

Yukaridaki `seviye: 2` blogundaki bos `anlatim` ve `ornekler` dizilerini
yorumda listelenen icerige gore doldur.

Run: `node --test tests/konular.test.js`
Expected: `temel-cizimler` ile ilgili testler gecer, diger iki konu icin
hala FAIL.

- [ ] **Step 5: `aci-olcme.js` yaz (seviye 1-2)**

Ayni sekil. Kapsanacak icerik:

**Seviye 1, baslik "Açı nedir, nasıl ölçülür"** (kazanim MAT.5.3.3)
- Açının tanımı: başlangıç noktaları aynı iki ışın, köşe ve kollar
- Açıölçerin tanıtımı: merkez, sıfır çizgisi, iç ve dış skala
- Ölçme adımları: merkezi köşeye, sıfır çizgisini bir kola koy, diğer
  kolun geçtiği sayıyı oku
- Hangi skalayı okuyacağını sıfırın başladığı yerden bulma (en sık hata)
- Günlük hayat bağı: saatin akrep ve yelkovanı arasındaki açı
- Etkilesim: `{ widget: 'aciolcer', mod: 'olc', gorev: 'Ekrandaki açıyı açıölçeri sürükleyerek ölç ve kaç derece olduğunu yaz.' }`

**Seviye 2, baslik "Kesişen doğruların açıları"** (kazanim MAT.5.3.4)
- Açı türleri: dar, dik, geniş, doğru açı ve dereceleri
- Bir doğru üzerindeki komşu açılar bütünlerdir, toplamı 180 derece
- İki doğru kesiştiğinde ters açılar eşittir
- Üç doğru kesiştiğinde kaç açı oluşur, hangileri eşittir
- Günlük hayat bağı: yol kavşağı, makasın açılması
- Etkilesim: `{ widget: 'aciolcer', mod: 'kesisim', gorev: 'İki doğruyu kesiştir. Bir açıyı değiştirdiğinde diğerlerine ne oluyor, gözle ve kuralı bul.' }`

Kazanimlar:
```js
kazanimlar: [
  { kod: 'MAT.5.3.3', metin: 'Açıları ölçmek için matematiksel araç ve teknolojiden yararlanabilme' },
  { kod: 'MAT.5.3.4', metin: 'Düzlemde iki veya üç doğrunun birbirine göre durumuna bağlı olarak oluşabilecek açılara dair çıkarım yapabilme' }
]
```

- [ ] **Step 6: `cokgenler-cember.js` yaz (seviye 1-4)**

**Seviye 1, "Çokgen nasıl oluşur"** (MAT.5.3.5)
- En az üç doğru, sonuncusu ilkiyle kesişecek biçimde ardışık kesişirse
  kapalı bir şekil oluşur
- Kaç doğru varsa o kadar kenar oluşur
- Çokgen adları: üçgen, dörtgen, beşgen, altıgen
- Kapalı olmayan şekil çokgen değildir
- Günlük hayat bağı: trafik levhaları, arı peteği
- Etkilesim: `{ widget: 'geometri-tuval', mod: 'cokgen', gorev: 'Dört doğru çiz, sonuncusu ilkiyle kesişsin. Oluşan çokgenin kaç kenarı ve kaç köşesi olduğunu say.' }`

**Seviye 2, "Kenar, köşe ve açı"** (MAT.5.3.6)
- Kenar sayısı köşe sayısına eşittir, neden
- Her köşede bir iç açı oluşur, yani açı sayısı da kenar sayısına eşit
- Kenar uzunlukları eşit olan çokgenlere düzgün çokgen denir
- Kare bir dörtgendir ama her dörtgen kare değildir
- Günlük hayat bağı: fayans döşemesi
- Etkilesim: `{ widget: 'geometri-tuval', mod: 'cokgen', gorev: 'Farklı kenar sayılarında çokgenler kur ve kenar ile köşe sayısının her zaman eşit olduğunu kendin gör.' }`

**Seviye 3, "Çember ve yarıçap"** (MAT.5.3.7)
- Çemberin merkezi, yarıçapı, çapı
- Merkeze eşit uzaklıktaki noktaların hepsi çember üzerindedir
- Pergelle çember çizme adımları
- Çap yarıçapın iki katıdır
- Günlük hayat bağı: bisiklet tekerleği, saat kadranı
- Etkilesim: `{ widget: 'geometri-tuval', mod: 'cember', gorev: 'Pergel aracıyla farklı yarıçaplarda çemberler çiz. Yarıçapı iki katına çıkardığında çembere ne oluyor?' }`

**Seviye 4, "Kesişen çemberlerden üçgen"** (MAT.5.3.7)
- İki çember ne zaman iki noktada kesişir
- Merkezler ve bir kesişim noktası bir üçgen oluşturur
- Bu üçgenin kenarları: iki yarıçap ve merkezler arası uzaklık
- Üç kenar eşitse eşkenar, ikisi eşitse ikizkenar, hepsi farklıysa
  çeşitkenar
- Yarıçapları eşit seçersen ne olur, kendin dene
- Etkilesim: `{ widget: 'geometri-tuval', mod: 'cember-ucgen', gorev: 'İki çemberin yarıçaplarını ve merkezler arası uzaklığı değiştir. Oluşan üçgenin türünü tahmin et, sonra kontrol et.' }`

Kazanimlar:
```js
kazanimlar: [
  { kod: 'MAT.5.3.5', metin: 'Çokgenleri düzlemde ardışık olarak kesişen doğruların oluşturduğu kapalı şekiller olarak yorumlayabilme' },
  { kod: 'MAT.5.3.6', metin: 'Çokgenlerin özellikleri ile ilgili edindiği deneyimleri yansıtabilme' },
  { kod: 'MAT.5.3.7', metin: 'Matematiksel araç ve teknoloji yardımıyla düzlemde iki noktada kesişen çember çiftinin merkezleri ve kesişim noktalarından biri ile inşa edilen üçgenlerin kenar özelliklerine yönelik çıkarım yapabilme' }
]
```

- [ ] **Step 7: Kayit defterini doldur**

```js
// src/data/konular/index.js
/**
 * Konu kayit defteri. Icerik dosyalari yazildikca buraya eklenir.
 *
 * Faz 1: Geometrik Sekiller unitesi (1-8. haftalar).
 * Faz 2-5'te kalan 12 konu eklenecek.
 */

import temelCizimler from './temel-cizimler.js';
import aciOlcme from './aci-olcme.js';
import cokgenlerCember from './cokgenler-cember.js';

export const KONULAR = {
  'temel-cizimler': temelCizimler,
  'aci-olcme': aciOlcme,
  'cokgenler-cember': cokgenlerCember
};
```

- [ ] **Step 8: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/konular.test.js`
Expected: PASS, 13 test gecer.

- [ ] **Step 9: Tum testleri calistir ve tarayicida bak**

Run: `npm test`
Expected: PASS.

Tarayicida `v2.html` ac, Ders sekmesine git. Ebeveyn panelinden henuz
sabit hafta ayarlanamiyor (Task 18'de gelecek), bu yuzden gecici olarak
tarayici konsolunda su komutu calistirip 1. haftaya git:

```js
localStorage.setItem('ataol:ders', JSON.stringify({ ayar: { sabitHafta: 1 } }));
location.reload();
```

Dogrula: hafta karti artik "hazırlanıyor" demiyor, konu adi ve seviye
basligi gorunuyor, "Derse başla" dugmesi aktif.

- [ ] **Step 10: Commit**

```bash
git add src/data/konular/ tests/konular.test.js
git commit -m "feat(ders): Geometrik Sekiller unitesi ders icerigi

Uc konu, sekiz seviye, 1-8. haftalar. Anlatim adimlari 4-6 arasi ve
her biri 120-420 karakter; test bunu zorluyor cunku cok kisa adim
ogretmiyor, cok uzun adim 10 yasindaki bir cocugun dikkatini asiyor.

Adimlarda ses alani YOK: dosya adi konu-seviye-adim kalibindan
turetiliyor, iki yerde yazilan ayni bilgi yazim hatasi kaynagi olurdu.

TTS nin okuyamayacagi semboller (derece isareti, dik isareti) test ile
yasaklandi; metinler '90 derece' gibi sozcukle yaziliyor."
```

---

## Task 13: Anlatim ekrani ve ses baglantisi

Adim adim ilerleyen anlatim. Her adimda ses otomatik calar, "tekrar
dinle" var, son adimda anlatim yildizi verilir.

**Files:**
- Modify: `src/views/ders.js` (`anlatimModeli`)
- Modify: `src/ui/ders-dom.js` (`anlatimEkrani`)
- Modify: `src/main.js` (ekran durumu, olaylar, yildiz yazimi)
- Modify: `src/core/i18n.js` (yeni anahtarlar)
- Test: `tests/ders-view.test.js` (yeni testler eklenir)

**Interfaces:**
- Consumes: `KONULAR` (Task 12), `adimKimligi`, `haftaKarti` (Task 7),
  `adimTamamla`, `haftaKaydi` (Task 6), `ses.oku`, `ses.efekt` (Task 5)
- Produces:
  - `anlatimModeli(hafta, konular, ilerleme, index)` -> `{ adimlar, index, aktif, toplam, sonMu, tamamlanan }`
  - `adimlar[n]` -> `{ kimlik, metin, gorsel, konuId, konuAd, seviye }`
  - `anlatimEkrani(kok, model, ceviri)` -> void
  - `data-ders-adim="ileri" | "geri" | "dinle" | "kapat" | "bitir"`

- [ ] **Step 1: Basarisiz testleri yaz**

`tests/ders-view.test.js` dosyasinin SONUNA ekle:

```js
import { anlatimModeli } from '../src/views/ders.js';

const IKI_KONU = {
  ...SAHTE_KONULAR,
  'dikdortgen': {
    id: 'dikdortgen',
    ad: { tr: 'Dikdörtgen' },
    seviyeler: [{ seviye: 1, baslik: 'Çevre', anlatim: [{ id: 'a1', metin: 'Çevre...' }] }]
  }
};

test('anlatimModeli adimlari sirayla duzlestirir', () => {
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 0);
  assert.equal(m.toplam, 2);
  assert.equal(m.adimlar[0].kimlik, 'temel-cizimler-1-a1');
  assert.equal(m.adimlar[1].kimlik, 'temel-cizimler-1-a2');
  assert.equal(m.aktif.kimlik, 'temel-cizimler-1-a1');
  assert.equal(m.sonMu, false);
});

test('anlatimModeli iki konulu haftada iki konunun adimlarini birlestirir', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 14);
  const m = anlatimModeli(hafta, IKI_KONU, { haftalar: {} }, 0);
  // hafta 14: dort-islem-problem (yazilmamis) + dikdortgen seviye 1
  assert.equal(m.toplam, 1);
  assert.equal(m.adimlar[0].kimlik, 'dikdortgen-1-a1');
  assert.equal(m.adimlar[0].konuAd, 'Dikdörtgen');
});

test('anlatimModeli son adimi isaretler', () => {
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 1);
  assert.equal(m.sonMu, true);
});

test('anlatimModeli index sinirlari disina tasmaz', () => {
  const ust = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 99);
  assert.equal(ust.index, 1, 'son adimda kirpilmali');
  const alt = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, -5);
  assert.equal(alt.index, 0, 'ilk adimda kirpilmali');
});

test('anlatimModeli tamamlanan adimlari isaretler', () => {
  const ilerleme = { haftalar: { 1: { anlatim: ['temel-cizimler-1-a1'] } } };
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, ilerleme, 0);
  assert.deepEqual(m.tamamlanan, ['temel-cizimler-1-a1']);
});

test('anlatimModeli icerigi olmayan haftada bos doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  const m = anlatimModeli(hafta, SAHTE_KONULAR, { haftalar: {} }, 0);
  assert.equal(m.toplam, 0);
  assert.equal(m.aktif, null);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders-view.test.js`
Expected: FAIL, `anlatimModeli is not a function`.

- [ ] **Step 3: `views/ders.js` icine `anlatimModeli` ekle**

Dosyanin sonuna:

```js
/**
 * Anlatim ekraninin modeli.
 *
 * Bir hafta iki konuya baglanabildigi icin adimlar duzlestirilerek tek
 * bir sira haline getirilir. Cocuk icin bu tek bir anlatimdir; iki
 * konudan geldigini bilmesine gerek yok, ama her adim kendi konu adini
 * tasir ki basliktan nerede oldugunu anlasin.
 */
export function anlatimModeli(hafta, konular, ilerleme, index) {
  const adimlar = hafta.dersler.flatMap((d) => {
    const konu = konular[d.konu] ?? null;
    const sev = seviyeBul(konu, d.seviye);
    if (!sev) return [];
    return sev.anlatim.map((a) => ({
      kimlik: adimKimligi(d.konu, d.seviye, a.id),
      metin: a.metin,
      gorsel: a.gorsel ?? null,
      konuId: d.konu,
      konuAd: konu.ad.tr,
      seviye: d.seviye
    }));
  });

  const toplam = adimlar.length;
  const guvenli = toplam === 0 ? 0 : Math.max(0, Math.min(index, toplam - 1));
  const kayit = haftaKaydi(ilerleme, hafta.hafta);

  return {
    adimlar,
    index: guvenli,
    aktif: toplam === 0 ? null : adimlar[guvenli],
    toplam,
    sonMu: toplam > 0 && guvenli === toplam - 1,
    tamamlanan: kayit.anlatim
  };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ders-view.test.js`
Expected: PASS, 17 test gecer.

- [ ] **Step 5: i18n anahtarlarini ekle**

TR blogunda `'ders.trOnly'` satirindan sonra:

```js
    'ders.stepOf': '{n} / {t}',
    'ders.listen': 'Tekrar dinle',
    'ders.back': 'Geri',
    'ders.forward': 'İleri',
    'ders.close': 'Kapat',
    'ders.finishLesson': 'Anlatımı bitir',
    'ders.starsEarned': '{n} yıldız kazandın!',
    'ders.explainAgain': 'Anlamadım, başka türlü anlat',
```

EN blogunda ayni yerde:

```js
    'ders.stepOf': '{n} / {t}',
    'ders.listen': 'Listen again',
    'ders.back': 'Back',
    'ders.forward': 'Next',
    'ders.close': 'Close',
    'ders.finishLesson': 'Finish the lesson',
    'ders.starsEarned': 'You earned {n} stars!',
    'ders.explainAgain': "I didn't get it, explain differently",
```

- [ ] **Step 6: `ui/ders-dom.js` icine `anlatimEkrani` ekle**

Dosyanin sonuna:

```js
/**
 * Anlatim ekrani.
 *
 * Metin buyuk ve seyrek yazilir; cocuk hem okuyup hem dinleyebilsin
 * diye. Adim sayaci ustte durur ki nerede oldugunu bilsin, bitmeyen
 * bir sey hissi vermesin.
 */
export function anlatimEkrani(kok, model, ceviri) {
  if (!model.aktif) {
    mount(kok, [el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })]);
    return;
  }

  const adim = model.aktif;

  const ust = el('div', { className: 'anlatim__ust' }, [
    el('button', {
      className: 'anlatim__kapat',
      text: ceviri('ders.close'),
      attrs: { type: 'button' },
      dataset: { dersAdim: 'kapat' }
    }),
    el('p', { className: 'anlatim__sayac', text: ceviri('ders.stepOf', { n: model.index + 1, t: model.toplam }) })
  ]);

  const govde = el('div', { className: 'anlatim__govde' }, [
    el('p', { className: 'anlatim__konu', text: adim.konuAd }),
    el('p', { className: 'anlatim__metin', text: adim.metin })
  ]);

  const dinle = el('button', {
    className: 'anlatim__dinle',
    attrs: { type: 'button' },
    dataset: { dersAdim: 'dinle' }
  }, [
    el('span', { className: 'material-symbols-rounded', text: 'volume_up' }),
    el('span', { text: ceviri('ders.listen') })
  ]);

  const alt = el('div', { className: 'anlatim__alt' }, [
    el('button', {
      className: 'anlatim__gez',
      text: ceviri('ders.back'),
      attrs: { type: 'button', disabled: model.index === 0 ? 'true' : undefined },
      dataset: { dersAdim: 'geri' }
    }),
    el('button', {
      className: 'anlatim__gez anlatim__gez--vurgu',
      text: model.sonMu ? ceviri('ders.finishLesson') : ceviri('ders.forward'),
      attrs: { type: 'button' },
      dataset: { dersAdim: model.sonMu ? 'bitir' : 'ileri' }
    })
  ]);

  mount(kok, [ust, govde, dinle, alt]);
}
```

Not: `el` yalnizca beyaz listedeki oznitelikleri kabul eder ve `disabled`
listede vardir. Degeri `undefined` oldugunda `Object.entries` onu yine de
dondurur, bu yuzden kosulu disarida cozmek gerekir:

```js
    el('button', {
      className: 'anlatim__gez',
      text: ceviri('ders.back'),
      attrs: model.index === 0 ? { type: 'button', disabled: 'true' } : { type: 'button' },
      dataset: { dersAdim: 'geri' }
    }),
```

Yukaridaki kod blogunda "geri" dugmesini bu haliyle yaz.

- [ ] **Step 7: `main.js` icine ekran durumunu ve olaylari bagla**

Import satirina ekle:

```js
import { anlatimModeli } from './views/ders.js';
import { anlatimEkrani } from './ui/ders-dom.js';
import { haftaKaydi, adimTamamla } from './engines/ders.js';
```

`let dersGorulenHafta = null;` yanina:

```js
// Ders sekmesinde acik olan ic ekran. Sekmenin kendisi tek bir
// gorunumdur; icindeki ekranlar bu degiskene gore degisir.
let dersEkran = 'hafta';
let dersAdimIndex = 0;
```

`renderDers` fonksiyonunu degistir:

```js
function dersAktifHafta() {
  const model = dersModeli();
  return model.tip === 'ders' ? haftaNo(TAKVIM, model.kart.no) : null;
}

function renderDers() {
  const kok = document.getElementById('view-ders');

  if (dersEkran === 'anlatim') {
    const hafta = dersAktifHafta();
    if (!hafta) { dersEkran = 'hafta'; }
    else {
      anlatimEkrani(kok, anlatimModeli(hafta, KONULAR, state.loadDersIlerleme(), dersAdimIndex), ceviri);
      return;
    }
  }

  haftaEkrani(kok, dersModeli(), ceviri);
}
```

Adim sesini calan yardimci, `renderDers`'in ardina:

```js
// Anlatim adimini seslendirir. Ses dosyasi varsa o calinir, yoksa
// cihaz TTS'i okur; ses.oku bu secimi kendisi yapar.
function dersAdimiSeslendir() {
  const ilerleme = state.loadDersIlerleme();
  if (!ilerleme.ayar.sesAcik) return;

  const hafta = dersAktifHafta();
  if (!hafta) return;

  const model = anlatimModeli(hafta, KONULAR, ilerleme, dersAdimIndex);
  if (!model.aktif) return;

  ses.dur();
  ses.oku({ metin: model.aktif.metin, ses: model.aktif.kimlik });
}
```

Genel tiklama dinleyicisinde `data-ders-gezin` blogundan SONRA:

```js
  const dersAdimDugme = e.target.closest('[data-ders-adim]');
  if (dersAdimDugme) {
    const eylem = dersAdimDugme.dataset.dersAdim;
    const hafta = dersAktifHafta();
    if (!hafta) return;

    const ilerleme = state.loadDersIlerleme();
    const model = anlatimModeli(hafta, KONULAR, ilerleme, dersAdimIndex);

    if (eylem === 'kapat') {
      ses.dur();
      dersEkran = 'hafta';
      renderDers();
      return;
    }

    if (eylem === 'dinle') {
      dersAdimiSeslendir();
      return;
    }

    if (eylem === 'geri') {
      dersAdimIndex = Math.max(0, dersAdimIndex - 1);
      renderDers();
      dersAdimiSeslendir();
      return;
    }

    // 'ileri' ve 'bitir': once icinde bulunulan adim tamamlanmis
    // isaretlenir. Cocuk adimi OKUDUKTAN sonra ilerledigi icin
    // isaretleme ileri giderken yapilir, ekrana gelirken degil.
    const sonuc = adimTamamla(
      haftaKaydi(ilerleme, hafta.hafta),
      model.aktif.kimlik,
      model.adimlar.map((a) => a.kimlik)
    );
    dersIlerlemeYaz(hafta.hafta, sonuc.kayit);
    if (sonuc.kazanilanYildiz > 0) {
      dersYildizVer(sonuc.kazanilanYildiz);
      ses.efekt('kutlama');
    }

    if (eylem === 'bitir') {
      ses.dur();
      dersEkran = 'hafta';
      dersAdimIndex = 0;
      render();
      return;
    }

    dersAdimIndex += 1;
    renderDers();
    dersAdimiSeslendir();
    return;
  }
```

Yazma yardimcilari, `dersAdimiSeslendir`'in ardina:

```js
function dersIlerlemeYaz(haftaNumarasi, kayit) {
  const ilerleme = state.loadDersIlerleme();
  state.saveDersIlerleme({
    ...ilerleme,
    haftalar: { ...ilerleme.haftalar, [String(haftaNumarasi)]: kayit }
  });
}

/**
 * Ders yildizi gunun ilerlemesine dogrudan yazilir, rutin karti
 * uzerinden degil.
 *
 * Rutin kartlari blok sirasina gore kilitleniyor (cardStates icindeki
 * previousClosed mantigi). Ders sekmesi serbest erisimli oldugu icin
 * ikisini baglasaydik "sabah dersi yaptim ama ogle blogu acilmadi,
 * yildizim gelmedi" hatasi cikardi.
 */
function dersYildizVer(miktar) {
  const anahtar = dayKey(now(), profile.settings?.dayResetHour ?? 4);
  const gun = state.loadDayProgress(anahtar);
  state.saveDayProgress(anahtar, { ...gun, stars: gun.stars + miktar });
}
```

`data-ders-basla` blogunu degistir:

```js
  const dersBasla = e.target.closest('[data-ders-basla]');
  if (dersBasla) {
    // iOS'ta ses ancak kullanici dokunusunun icinde baslatilabilir.
    ses.hazirla();
    dersEkran = 'anlatim';
    dersAdimIndex = 0;
    renderDers();
    dersAdimiSeslendir();
    return;
  }
```

`data-ders-gezin` blogunda hafta degisince ekrani sifirla:

```js
    if (hedef) {
      dersGorulenHafta = hedef.hafta;
      dersEkran = 'hafta';
      dersAdimIndex = 0;
      renderDers();
    }
```

- [ ] **Step 8: `sw.js` dosya listesini guncelle**

`CACHE_NAME` degerini `'ataol-ai-v39'` yap ve ASSETS'e ekle:

```js
  './src/data/konular/temel-cizimler.js',
  './src/data/konular/aci-olcme.js',
  './src/data/konular/cokgenler-cember.js',
  './src/engines/uretici/ortak.js',
  './src/engines/uretici/index.js',
  './src/engines/uretici/temel-cizimler.js',
  './src/engines/uretici/aci-olcme.js',
  './src/engines/uretici/cokgenler-cember.js',
  './src/engines/widgets/aci.js',
```

- [ ] **Step 9: Tum testleri calistir**

Run: `npm test`
Expected: PASS.

- [ ] **Step 10: Tarayicida elle dogrula**

1. Ders sekmesi, "Derse başla" dugmesi anlatimi aciyor
2. Ilk adim ekranda, cihaz sesi metni Turkce okuyor
3. "İleri" sonraki adima geciyor ve yeni metin okunuyor
4. "Tekrar dinle" ayni adimi bastan okuyor
5. Son adimda dugme "Anlatımı bitir" yaziyor
6. Bitirince hafta ekranina donuyor, "Anlatım" rozeti yesil
7. Rutin sekmesinde yildiz toplami 4 artmis
8. Anlatimi ikinci kez bitirince yildiz TEKRAR artmiyor

- [ ] **Step 11: Commit**

```bash
git add src/views/ders.js src/ui/ders-dom.js src/main.js src/core/i18n.js sw.js tests/ders-view.test.js
git commit -m "feat(ders): anlatim ekrani ve sesli okuma

Adimlar iki konudan geliyorsa duzlestirilip tek sira yapiliyor; cocuk
icin bu tek bir anlatim. Her adim kendi konu adini tasiyor.

Adim 'ileri'ye basilinca tamamlanmis sayiliyor, ekrana gelince degil:
okumadan gecilen adim ogrenilmis sayilmamali. Anlatim yildizi son
adimda ve yalniz bir kez veriliyor.

Yildiz rutin karti uzerinden degil dogrudan gune yaziliyor; rutin
kartlari blok sirasina kilitli ve ders sekmesi serbest erisimli."
```

---

## Task 13b: Ornek cozum ekrani

Spec Bolum 11'deki dorduncu ekran. Konu verisinde `ornekler` zaten var
(Task 12 testi varligini zorluyor) ama hicbir ekran onu gostermiyordu.

Adimlar tek tek acilir, hepsi birden degil. Gerekce: cozumun tamami bir
anda ekranda olursa cocuk okumaz, cevaba bakar. Adim adim acilinca her
adimda durup dusunme sansi olur.

Anlatim ile "Kendin dene" arasina girer.

**Files:**
- Modify: `src/views/ders.js` (`ornekModeli`)
- Modify: `src/ui/ders-dom.js` (`ornekEkrani`)
- Modify: `src/main.js`, `src/core/i18n.js`
- Test: `tests/ders-ornek.test.js`

**Interfaces:**
- Consumes: `KONULAR` (Task 12), `seviyeBul` (`views/ders.js` ici)
- Produces:
  - `ornekModeli(hafta, konular, acikAdim)` -> `{ ornek, konuAd, acik, toplam, bitti }`
  - `ornekEkrani(kok, model, ceviri)` -> void
  - `data-ders-ornek="adim" | "gec" | "kapat"`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/ders-ornek.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { ornekModeli } from '../src/views/ders.js';

const HAFTA1 = TAKVIM[0];

test('ornekModeli haftanin ilk ornegini verir', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 0);
  assert.ok(m.ornek, 'ornek yok');
  assert.ok(m.ornek.soru.length > 15);
  assert.equal(m.konuAd, 'Temel Geometrik Çizimler');
  assert.ok(m.toplam >= 2, 'ornek en az iki adimli olmali');
});

test('acikAdim 0 iken hicbir cozum adimi gorunmez', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 0);
  assert.deepEqual(m.acik, []);
  assert.equal(m.bitti, false);
});

test('acikAdim arttikca adimlar sirayla acilir', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 2);
  assert.equal(m.acik.length, 2);
  assert.equal(m.acik[0], m.ornek.adimlar[0]);
  assert.equal(m.acik[1], m.ornek.adimlar[1]);
});

test('tum adimlar acilinca bitti olur', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 99);
  assert.equal(m.acik.length, m.toplam);
  assert.equal(m.bitti, true);
});

test('negatif acikAdim sifira kirpilir', () => {
  assert.deepEqual(ornekModeli(HAFTA1, KONULAR, -5).acik, []);
});

test('icerigi olmayan haftada ornek null doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  assert.equal(ornekModeli(hafta, KONULAR, 0).ornek, null);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders-ornek.test.js`
Expected: FAIL, `ornekModeli is not a function`.

- [ ] **Step 3: `views/ders.js` icine ekle**

```js
/**
 * Ornek cozum ekraninin modeli.
 *
 * Cozum adimlari tek tek acilir. Tamami bir anda ekranda olursa cocuk
 * okumaz, dogrudan cevaba bakar; adim adim acilinca her adimda durup
 * dusunme sansi olur.
 *
 * Hafta iki konuya bagliysa ilk hazir konunun ilk ornegi gosterilir.
 * Iki ornegi birden gostermek bu ekrani uzatirdi; asil is zaten
 * alistirmada.
 */
export function ornekModeli(hafta, konular, acikAdim) {
  for (const d of hafta.dersler) {
    const konu = konular[d.konu];
    const sev = seviyeBul(konu, d.seviye);
    if (!sev || sev.ornekler.length === 0) continue;

    const ornek = sev.ornekler[0];
    const toplam = ornek.adimlar.length;
    const n = Math.max(0, Math.min(acikAdim, toplam));

    return {
      ornek,
      konuAd: konu.ad.tr,
      acik: ornek.adimlar.slice(0, n),
      toplam,
      bitti: n === toplam
    };
  }

  return { ornek: null, konuAd: '', acik: [], toplam: 0, bitti: false };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/ders-ornek.test.js`
Expected: PASS, 6 test gecer.

- [ ] **Step 5: i18n anahtarlari**

TR (Task 14'te eklenen `'ders.example'` zaten var, yanina):

```js
    'ders.exampleSkip': 'Geç',
    'ders.exampleShow': 'Sonraki adımı göster',
    'ders.exampleDone': 'Anladım, kendim deneyeyim',
```

EN:

```js
    'ders.exampleSkip': 'Skip',
    'ders.exampleShow': 'Show the next step',
    'ders.exampleDone': "Got it, let me try",
```

- [ ] **Step 6: `ui/ders-dom.js` icine `ornekEkrani` ekle**

```js
/**
 * Ornek cozum ekrani. Adimlar tek tek acilir.
 *
 * Cevap yalniz tum adimlar acildiktan sonra gorunur; once cevabi
 * gostermek cozum adimlarini okunmaz kilardi.
 */
export function ornekEkrani(kok, model, ceviri) {
  if (!model.ornek) {
    mount(kok, [el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })]);
    return;
  }

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      el('button', {
        className: 'anlatim__kapat',
        text: ceviri('ders.close'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: 'kapat' }
      }),
      el('p', { className: 'anlatim__sayac', text: ceviri('ders.example') })
    ]),
    el('p', { className: 'ornek__konu', text: model.konuAd }),
    el('p', { className: 'ornek__soru', text: model.ornek.soru }),
    el('div', { className: 'ornek__adimlar' },
      model.acik.map((adim, i) =>
        el('p', { className: 'ornek__adim', text: `${i + 1}. ${adim}` })
      )
    ),
    model.bitti
      ? el('p', { className: 'ornek__cevap', text: ceviri('ders.answer', { c: model.ornek.cevap }) })
      : null,
    el('div', { className: 'etkilesim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.exampleSkip'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: 'gec' }
      }),
      el('button', {
        className: 'anlatim__gez anlatim__gez--vurgu',
        text: model.bitti ? ceviri('ders.exampleDone') : ceviri('ders.exampleShow'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: model.bitti ? 'gec' : 'adim' }
      })
    ])
  ]);
}
```

- [ ] **Step 7: `main.js` icine bagla**

Import:

```js
import { ornekModeli } from './views/ders.js';
import { ornekEkrani } from './ui/ders-dom.js';
```

Modul durumu:

```js
let dersOrnekAdim = 0;
```

`renderDers` icine, `anlatim` dalindan sonra:

```js
  if (dersEkran === 'ornek') {
    const hafta = dersAktifHafta();
    if (!hafta) { dersEkran = 'hafta'; }
    else {
      ornekEkrani(kok, ornekModeli(hafta, KONULAR, dersOrnekAdim), ceviri);
      return;
    }
  }
```

Olay:

```js
  const ornekDugme = e.target.closest('[data-ders-ornek]');
  if (ornekDugme) {
    const eylem = ornekDugme.dataset.dersOrnek;
    if (eylem === 'adim') {
      dersOrnekAdim += 1;
      ses.efekt('tik');
      renderDers();
      return;
    }
    dersOrnekAdim = 0;
    dersEkran = eylem === 'gec' ? 'etkilesim' : 'hafta';
    renderDers();
    return;
  }
```

Task 13'te anlatim "bitir" eylemi `dersEkran = 'etkilesim'` yapiyordu.
Bunu `dersEkran = 'ornek'; dersOrnekAdim = 0;` olarak degistir. Akis
boylece **anlatim -> ornek -> kendin dene** olur.

- [ ] **Step 8: Testleri ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: anlatim bitince ornek cozum aciliyor, "Sonraki adımı göster"
adimlari tek tek aciyor, son adimda cevap gorunuyor, "Anladım, kendim
deneyeyim" widget ekranina geciyor. "Geç" dugmesi her an widget ekranina
atliyor.

- [ ] **Step 9: Commit**

```bash
git add src/views/ders.js src/ui/ders-dom.js src/main.js src/core/i18n.js tests/ders-ornek.test.js
git commit -m "feat(ders): ornek cozum ekrani

Cozum adimlari tek tek aciliyor. Tamami bir anda ekranda olsa cocuk
okumaz, dogrudan cevaba bakar; adim adim acilinca her adimda durup
dusunme sansi oluyor. Cevap ancak tum adimlar acilinca gorunuyor.

Akis artik anlatim -> ornek -> kendin dene."
```

---

## Task 14: Etkilesimli widget'lar ve "Kendin dene" ekrani

Iki widget: `aciolcer` ve `geometri-tuval`. Ikisi de canvas uzerinde
calisir ve ayni arayuzu saglar, boylece ekran kodu hangi widget oldugunu
bilmek zorunda kalmaz.

Cizim ve olay kodu `ui/widget/` altinda; olculebilir matematik
`engines/widgets/aci.js` icinde (Task 10'da yazildi) ve oradan okunur.

**Files:**
- Create: `src/ui/widget/aciolcer.js`
- Create: `src/ui/widget/geometri-tuval.js`
- Create: `src/ui/widget/index.js`
- Modify: `src/ui/ders-dom.js` (`etkilesimEkrani`)
- Modify: `src/main.js`, `src/core/i18n.js`, `sw.js`
- Test: `tests/widget-arayuz.test.js`

**Interfaces:**
- Consumes: `aciTuru`, `ACI_TURU_ADI`, `butunler` (Task 10); `el`, `mount`
- Produces (her widget ayni sozlesme):
  - `create(canvas, { mod, veri, ses })` -> `{ ciz(), dogrula(), yokEt() }`
  - `geometri-tuval` ayrica `aracSec(ad)` ve `temizle()` saglar; ekran
    kodu bunlari varsa cagirir (`dersWidget?.temizle?.()`)
  - Gorev metni widget'a GECMEZ; onu ekran cizer
  - `dogrula()` -> `{ tamam: boolean, mesaj: string }`
  - `WIDGETLER: { aciolcer, 'geometri-tuval' }` (`ui/widget/index.js`)
  - `widgetKur(ad, kok, secenekler)` -> widget veya `null`

### Widget sozlesmesi

| Uye | Anlam |
|---|---|
| `ciz()` | Tuvali bastan cizer. Boyut degisince ve her durum degisiminde cagrilir |
| `dogrula()` | Gorev tamamlandi mi. Ekran "Tamamla" dugmesinde cagirir |
| `yokEt()` | Olay dinleyicilerini kaldirir. Ekran kapanirken cagrilir |

`yokEt()` sozlesmenin en onemli parcasidir: widget `pointermove`
dinleyicisi birakirsa ekran her acildiginda bir tane daha eklenir ve
uygulama zamanla yavaslar.

- [ ] **Step 1: Widget sozlesmesi testini yaz**

Canvas node'da yok; test sahte bir canvas ve 2D baglam ile calisir.

```js
// tests/widget-arayuz.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WIDGETLER, widgetKur } from '../src/ui/widget/index.js';

// node'da DOM yok; widget'in cagirdigi her seyi yutan en kucuk sahte.
function sahteBaglam() {
  const cagrilar = [];
  const yut = (ad) => (...a) => cagrilar.push([ad, ...a]);
  return {
    cagrilar,
    canvas: { width: 320, height: 240 },
    beginPath: yut('beginPath'), closePath: yut('closePath'),
    moveTo: yut('moveTo'), lineTo: yut('lineTo'), arc: yut('arc'),
    stroke: yut('stroke'), fill: yut('fill'), clearRect: yut('clearRect'),
    fillText: yut('fillText'), save: yut('save'), restore: yut('restore'),
    translate: yut('translate'), rotate: yut('rotate'), setTransform: yut('setTransform'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set lineCap(v) {}
  };
}

function sahteKok() {
  const dinleyiciler = [];
  const baglam = sahteBaglam();
  const canvas = {
    width: 320, height: 240,
    style: {},
    getContext: () => baglam,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    addEventListener: (ad, fn) => dinleyiciler.push([ad, fn]),
    removeEventListener: (ad, fn) => {
      const i = dinleyiciler.findIndex(([a, f]) => a === ad && f === fn);
      if (i >= 0) dinleyiciler.splice(i, 1);
    },
    setPointerCapture() {}, releasePointerCapture() {}
  };
  return { canvas, dinleyiciler, baglam };
}

const ADLAR = ['aciolcer', 'geometri-tuval'];

test('Faz 1 widgetleri kayitlidir', () => {
  for (const ad of ADLAR) {
    assert.equal(typeof WIDGETLER[ad], 'function', `${ad} kayitli degil`);
  }
});

test('bilinmeyen widget null dondurur, atmaz', () => {
  assert.equal(widgetKur('boyle-bir-widget-yok', {}, {}), null);
});

test('her widget sozlesmedeki uc uyeyi saglar', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    assert.equal(typeof w.ciz, 'function', `${ad}.ciz yok`);
    assert.equal(typeof w.dogrula, 'function', `${ad}.dogrula yok`);
    assert.equal(typeof w.yokEt, 'function', `${ad}.yokEt yok`);
    w.yokEt();
  }
});

test('dogrula her zaman tamam ve mesaj dondurur', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    const s = w.dogrula();
    assert.equal(typeof s.tamam, 'boolean', `${ad}: tamam bayragi yok`);
    assert.equal(typeof s.mesaj, 'string', `${ad}: mesaj yok`);
    w.yokEt();
  }
});

test('yokEt tum olay dinleyicilerini kaldirir', () => {
  for (const ad of ADLAR) {
    const { canvas, dinleyiciler } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    assert.ok(dinleyiciler.length > 0, `${ad}: hic dinleyici eklenmemis`);
    w.yokEt();
    assert.equal(dinleyiciler.length, 0,
      `${ad}: yokEt sonrasi ${dinleyiciler.length} dinleyici kaldi, ekran her acildiginda birikirler`);
  }
});

test('ciz tuvali temizleyip yeniden cizer', () => {
  for (const ad of ADLAR) {
    const { canvas, baglam } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    baglam.cagrilar.length = 0;
    w.ciz();
    assert.ok(baglam.cagrilar.some(([c]) => c === 'clearRect'), `${ad}: clearRect cagrilmadi`);
    assert.ok(baglam.cagrilar.length > 1, `${ad}: hicbir sey cizilmedi`);
    w.yokEt();
  }
});

test('ciz iki kez cagrilinca cokmez', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    w.ciz();
    w.ciz();
    w.yokEt();
    w.yokEt();
  }
});

test('aciolcer olc modunda hedef aciya ulasmadan tamam demez', () => {
  const { canvas } = sahteKok();
  const w = WIDGETLER.aciolcer(canvas, { mod: 'olc', veri: { derece: 75 } });
  assert.equal(w.dogrula().tamam, false, 'hic olculmeden tamam olmamali');
  w.yokEt();
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/widget-arayuz.test.js`
Expected: FAIL, `Cannot find module '../src/ui/widget/index.js'`.

- [ ] **Step 3: `src/ui/widget/aciolcer.js` yaz**

```js
/**
 * Aciolcer widget'i.
 *
 * Uc mod:
 *   goster  - verilen aciyi cizer, cocuk turunu gorur
 *   olc     - aciyi cizer, cocuk aciolceri surukleyip okur
 *   kesisim - iki dogru kesistirir, komsu ve ters acilari renklendirir
 *
 * Aci matematigi engines/widgets/aci.js icindedir; burada yalniz cizim
 * ve dokunma var. Boylece ekranda gorunen ile soruda sorulan ayni
 * kuraldan gelir.
 */

import { aciTuru, ACI_TURU_ADI, butunler } from '../../engines/widgets/aci.js';

const RENK = {
  cizgi: '#2d3436', vurgu: '#6C5CE7', ikinci: '#00b894',
  yay: 'rgba(108, 92, 231, 0.25)', metin: '#2d3436'
};

const RAD = Math.PI / 180;

export function aciolcer(canvas, { mod = 'goster', veri = {}, ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const hedef = Number(veri.derece) || 60;

  // olc modunda cocugun aciolceri dondurerek buldugu deger.
  let okunan = null;
  let kesisimAcisi = Number(veri.derece) || 50;
  let suruyor = false;

  const merkez = () => ({ x: canvas.width / 2, y: canvas.height * 0.72 });
  const yaricap = () => Math.min(canvas.width, canvas.height) * 0.42;

  function kolCiz(derece, renk, uzunluk) {
    const m = merkez();
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x + Math.cos(-derece * RAD) * uzunluk, m.y + Math.sin(-derece * RAD) * uzunluk);
    ctx.strokeStyle = renk;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function yayCiz(derece) {
    const m = merkez();
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.arc(m.x, m.y, yaricap() * 0.3, 0, -derece * RAD, true);
    ctx.closePath();
    ctx.fillStyle = RENK.yay;
    ctx.fill();
  }

  function olcekCiz() {
    const m = merkez();
    const r = yaricap();
    ctx.beginPath();
    ctx.arc(m.x, m.y, r, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = RENK.cizgi;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let d = 0; d <= 180; d += 10) {
      const ic = d % 30 === 0 ? r - 14 : r - 8;
      ctx.beginPath();
      ctx.moveTo(m.x + Math.cos(-d * RAD) * ic, m.y + Math.sin(-d * RAD) * ic);
      ctx.lineTo(m.x + Math.cos(-d * RAD) * r, m.y + Math.sin(-d * RAD) * r);
      ctx.strokeStyle = RENK.cizgi;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (d % 30 === 0) {
        ctx.fillStyle = RENK.metin;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(d), m.x + Math.cos(-d * RAD) * (r - 26), m.y + Math.sin(-d * RAD) * (r - 26) + 4);
      }
    }
  }

  function yaziCiz(metin) {
    ctx.fillStyle = RENK.metin;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metin, canvas.width / 2, 24);
  }

  function ciz() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const r = yaricap();

    if (mod === 'kesisim') {
      const m = merkez();
      // Iki dogru: her biri iki yonde uzanan birer cizgi.
      for (const [derece, renk] of [[0, RENK.cizgi], [kesisimAcisi, RENK.vurgu]]) {
        ctx.beginPath();
        ctx.moveTo(m.x - Math.cos(-derece * RAD) * r, m.y - Math.sin(-derece * RAD) * r);
        ctx.lineTo(m.x + Math.cos(-derece * RAD) * r, m.y + Math.sin(-derece * RAD) * r);
        ctx.strokeStyle = renk;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      yayCiz(kesisimAcisi);
      yaziCiz(`${kesisimAcisi} derece, komşusu ${butunler(kesisimAcisi)} derece`);
      return;
    }

    olcekCiz();
    kolCiz(0, RENK.cizgi, r);
    kolCiz(hedef, RENK.ikinci, r);
    yayCiz(hedef);

    if (mod === 'goster') {
      yaziCiz(`${hedef} derece - ${ACI_TURU_ADI[aciTuru(hedef)]}`);
    } else {
      yaziCiz(okunan === null ? 'Açıölçeri sürükle ve açıyı oku' : `Okuduğun: ${okunan} derece`);
    }
  }

  function noktadanDerece(olay) {
    const kutu = canvas.getBoundingClientRect();
    const m = merkez();
    const x = ((olay.clientX - kutu.left) / kutu.width) * canvas.width - m.x;
    const y = ((olay.clientY - kutu.top) / kutu.height) * canvas.height - m.y;
    let d = Math.round((Math.atan2(-y, x) / RAD) / 5) * 5;
    if (d < 0) d = 0;
    if (d > 180) d = 180;
    return d;
  }

  function basla(olay) {
    suruyor = true;
    hareket(olay);
  }

  function hareket(olay) {
    if (!suruyor) return;
    const d = noktadanDerece(olay);
    if (mod === 'olc') {
      okunan = d;
      if (okunan === hedef && ses) ses.efekt('dogru');
    } else if (mod === 'kesisim') {
      kesisimAcisi = Math.max(10, Math.min(170, d));
    }
    ciz();
  }

  function bitir() {
    suruyor = false;
  }

  canvas.addEventListener('pointerdown', basla);
  canvas.addEventListener('pointermove', hareket);
  canvas.addEventListener('pointerup', bitir);
  canvas.addEventListener('pointercancel', bitir);

  function dogrula() {
    if (mod === 'olc') {
      if (okunan === null) return { tamam: false, mesaj: 'Önce açıölçeri sürükleyip açıyı oku.' };
      if (okunan !== hedef) return { tamam: false, mesaj: `${okunan} derece okudun. Sıfır çizgisinin başladığı skalayı takip et.` };
      return { tamam: true, mesaj: 'Doğru okudun!' };
    }
    if (mod === 'kesisim') {
      return { tamam: true, mesaj: 'Komşu açıların toplamının hep 180 ettiğini gördün.' };
    }
    return { tamam: true, mesaj: 'Açıyı ve türünü gördün.' };
  }

  function yokEt() {
    canvas.removeEventListener('pointerdown', basla);
    canvas.removeEventListener('pointermove', hareket);
    canvas.removeEventListener('pointerup', bitir);
    canvas.removeEventListener('pointercancel', bitir);
  }

  return { ciz, dogrula, yokEt };
}
```

- [ ] **Step 4: `src/ui/widget/geometri-tuval.js` yaz**

```js
/**
 * Geometrik cizim tuvali.
 *
 * Modlar:
 *   serbest      - nokta, dogru parcasi, isin secip cizer; ne cizdigini soyler
 *   dikme        - verilen dogruya dikme cizdirir
 *   cokgen       - ardisik kesisen dogrularla cokgen kurdurur
 *   cember       - pergel gibi cember cizdirir
 *   cember-ucgen - iki cember ve merkezleri ile ucgen gosterir
 *
 * Cizilen sekiller bir dizide tutulur ve her ciz() cagrisinda bastan
 * cizilir. Boylece geri alma ve yeniden boyutlandirma bedava gelir.
 */

const RENK = {
  cizgi: '#2d3436', vurgu: '#6C5CE7', ikinci: '#00b894',
  ucuncu: '#e17055', silik: 'rgba(45, 52, 54, 0.25)'
};

export function geometriTuval(canvas, { mod = 'serbest', veri = {}, ses = null } = {}) {
  const ctx = canvas.getContext('2d');
  const sekiller = [];
  let baslangic = null;
  let arac = mod === 'cember' ? 'cember' : 'dogru-parcasi';

  const olcek = () => Math.min(canvas.width, canvas.height) / 26;

  function noktaAl(olay) {
    const kutu = canvas.getBoundingClientRect();
    return {
      x: ((olay.clientX - kutu.left) / kutu.width) * canvas.width,
      y: ((olay.clientY - kutu.top) / kutu.height) * canvas.height
    };
  }

  function noktaCiz(p, renk) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = renk;
    ctx.fill();
  }

  function cizgiCiz(a, b, renk, uzat) {
    ctx.beginPath();
    if (uzat) {
      // Isin ve dogru icin tuval disina tasiracak kadar uzat.
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const n = Math.hypot(dx, dy) || 1;
      const k = (canvas.width + canvas.height) / n;
      ctx.moveTo(uzat === 'iki' ? a.x - dx * k : a.x, uzat === 'iki' ? a.y - dy * k : a.y);
      ctx.lineTo(a.x + dx * k, a.y + dy * k);
    } else {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function cemberCiz(merkez, r, renk) {
    ctx.beginPath();
    ctx.arc(merkez.x, merkez.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = renk;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    noktaCiz(merkez, renk);
  }

  function yaziCiz(metin, y) {
    ctx.fillStyle = RENK.cizgi;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metin, canvas.width / 2, y);
  }

  function cemberUcgenCiz() {
    const b = olcek();
    const { r1 = 5, r2 = 5, d = 5 } = veri;
    const m1 = { x: canvas.width / 2 - (d * b) / 2, y: canvas.height * 0.6 };
    const m2 = { x: canvas.width / 2 + (d * b) / 2, y: canvas.height * 0.6 };

    cemberCiz(m1, r1 * b, RENK.silik);
    cemberCiz(m2, r2 * b, RENK.silik);

    // Kesisim noktasi: iki cemberin ust kesisimi. Merkezler yatay
    // oldugu icin x, kosinus teoreminden; y, Pisagor'dan bulunur.
    const a = (d * d - r2 * r2 + r1 * r1) / (2 * d);
    const h2 = r1 * r1 - a * a;
    const h = h2 > 0 ? Math.sqrt(h2) : 0;
    const k = { x: m1.x + a * b, y: m1.y - h * b };

    cizgiCiz(m1, m2, RENK.vurgu);
    cizgiCiz(m1, k, RENK.ikinci);
    cizgiCiz(m2, k, RENK.ucuncu);
    noktaCiz(k, RENK.cizgi);

    yaziCiz(`Kenarlar: ${r1} cm, ${r2} cm, ${d} cm`, 24);
  }

  function ciz() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mod === 'cember-ucgen') {
      cemberUcgenCiz();
      return;
    }

    if (mod === 'dikme') {
      const y = canvas.height * 0.6;
      cizgiCiz({ x: 0, y }, { x: canvas.width, y }, RENK.cizgi);
      noktaCiz({ x: canvas.width / 2, y }, RENK.vurgu);
    }

    for (const s of sekiller) {
      if (s.tip === 'nokta') noktaCiz(s.a, RENK.vurgu);
      else if (s.tip === 'cember') cemberCiz(s.a, s.r, RENK.vurgu);
      else cizgiCiz(s.a, s.b, RENK.vurgu, s.tip === 'isin' ? 'tek' : s.tip === 'dogru' ? 'iki' : null);
    }

    if (mod === 'cokgen' && sekiller.length > 0) {
      yaziCiz(`${sekiller.length} kenar, ${sekiller.length} köşe`, canvas.height - 12);
    }
  }

  function basla(olay) {
    baslangic = noktaAl(olay);
  }

  function bitir(olay) {
    if (!baslangic) return;
    const son = noktaAl(olay);
    const uzunluk = Math.hypot(son.x - baslangic.x, son.y - baslangic.y);

    if (arac === 'cember') {
      if (uzunluk > 8) sekiller.push({ tip: 'cember', a: baslangic, r: uzunluk });
    } else if (uzunluk < 6) {
      sekiller.push({ tip: 'nokta', a: baslangic });
    } else {
      sekiller.push({ tip: arac, a: baslangic, b: son });
    }

    baslangic = null;
    if (ses) ses.efekt('tik');
    ciz();
  }

  canvas.addEventListener('pointerdown', basla);
  canvas.addEventListener('pointerup', bitir);
  canvas.addEventListener('pointercancel', () => { baslangic = null; });

  function aracSec(yeni) {
    arac = yeni;
  }

  function temizle() {
    sekiller.length = 0;
    ciz();
  }

  function dogrula() {
    if (mod === 'cokgen') {
      return sekiller.length >= 3
        ? { tamam: true, mesaj: `${sekiller.length} kenarlı bir çokgen kurdun.` }
        : { tamam: false, mesaj: 'Çokgen için en az 3 doğru gerekir.' };
    }
    if (mod === 'serbest') {
      const tipler = new Set(sekiller.map((s) => s.tip));
      return tipler.size >= 2
        ? { tamam: true, mesaj: 'Farklı şekiller çizdin, güzel.' }
        : { tamam: false, mesaj: 'En az iki farklı şekil çiz: nokta, doğru parçası, ışın.' };
    }
    if (mod === 'cember') {
      return sekiller.some((s) => s.tip === 'cember')
        ? { tamam: true, mesaj: 'Çember çizdin.' }
        : { tamam: false, mesaj: 'Merkeze bas ve dışarı sürükleyerek bir çember çiz.' };
    }
    if (mod === 'dikme') {
      return sekiller.length > 0
        ? { tamam: true, mesaj: 'Dikmeyi çizdin.' }
        : { tamam: false, mesaj: 'Doğrunun üzerindeki noktadan yukarı doğru bir çizgi çek.' };
    }
    return { tamam: true, mesaj: 'İncelemeni tamamladın.' };
  }

  function yokEt() {
    canvas.removeEventListener('pointerdown', basla);
    canvas.removeEventListener('pointerup', bitir);
  }

  return { ciz, dogrula, yokEt, aracSec, temizle };
}
```

Dikkat: `pointercancel` dinleyicisi isimsiz bir ok fonksiyonuyla
eklenirse `yokEt` onu kaldiramaz ve test basarisiz olur. Yukaridaki kodu
yazarken o dinleyiciyi de adlandirilmis bir fonksiyona cevir:

```js
  function iptal() { baslangic = null; }
  canvas.addEventListener('pointercancel', iptal);
  // yokEt icinde:
  canvas.removeEventListener('pointercancel', iptal);
```

- [ ] **Step 5: `src/ui/widget/index.js` yaz**

```js
/**
 * Widget kayit defteri. Ekran kodu hangi widget oldugunu bilmek
 * zorunda kalmasin diye hepsi ayni sozlesmeyi saglar:
 *   create(kok, secenekler) -> { ciz, dogrula, yokEt }
 */

import { aciolcer } from './aciolcer.js';
import { geometriTuval } from './geometri-tuval.js';

export const WIDGETLER = {
  'aciolcer': aciolcer,
  'geometri-tuval': geometriTuval
};

export function widgetKur(ad, kok, secenekler) {
  const kur = WIDGETLER[ad];
  return typeof kur === 'function' ? kur(kok, secenekler) : null;
}
```

- [ ] **Step 6: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/widget-arayuz.test.js`
Expected: PASS, 8 test gecer.

- [ ] **Step 7: i18n anahtarlarini ekle**

TR: `'ders.explainAgain'` satirindan sonra

```js
    'ders.tryIt': 'Kendin dene',
    'ders.check': 'Kontrol et',
    'ders.done': 'Tamamla',
    'ders.clear': 'Temizle',
    'ders.example': 'Örnek çözüm',
    'ders.showStep': 'Sonraki adım',
    'ders.answer': 'Cevap: {c}',
```

EN: ayni yerde

```js
    'ders.tryIt': 'Try it yourself',
    'ders.check': 'Check',
    'ders.done': 'Complete',
    'ders.clear': 'Clear',
    'ders.example': 'Worked example',
    'ders.showStep': 'Next step',
    'ders.answer': 'Answer: {c}',
```

- [ ] **Step 8: `ui/ders-dom.js` icine `etkilesimEkrani` ekle**

```js
/**
 * "Kendin dene" ekrani. Widget'i canvas'a kurar; widget'in kendisini
 * kurmaz, o isi main.js yapar cunku yokEt cagrisinin sahibi odur.
 *
 * Doner: olusturulan canvas. Cagiran bunu widget'a verir.
 */
export function etkilesimEkrani(kok, { gorev, mesaj }, ceviri) {
  const canvas = el('canvas', { className: 'etkilesim__tuval', attrs: { id: 'ders-tuval' } });

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      el('button', {
        className: 'anlatim__kapat',
        text: ceviri('ders.close'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'kapat' }
      }),
      el('p', { className: 'anlatim__sayac', text: ceviri('ders.tryIt') })
    ]),
    el('p', { className: 'etkilesim__gorev', text: gorev }),
    canvas,
    mesaj ? el('p', { className: 'etkilesim__mesaj', text: mesaj }) : null,
    el('div', { className: 'etkilesim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.clear'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'temizle' }
      }),
      el('button', {
        className: 'anlatim__gez anlatim__gez--vurgu',
        text: ceviri('ders.check'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'kontrol' }
      })
    ])
  ]);

  return canvas;
}
```

`el` cagrisinda `id` beyaz listede vardir, bu yuzden `attrs: { id: ... }`
kabul edilir.

- [ ] **Step 9: `main.js` icine bagla**

Import:

```js
import { etkilesimEkrani } from './ui/ders-dom.js';
import { widgetKur } from './ui/widget/index.js';
import { etkilesimTamamla } from './engines/ders.js';
```

Modul durumu:

```js
// Acik widget. Ekran degisirken yokEt cagrilmali, yoksa pointer
// dinleyicileri birikir ve uygulama zamanla yavaslar.
let dersWidget = null;
let dersEtkilesimMesaj = '';
```

`renderDers` icine, `anlatim` blogundan sonra:

```js
  if (dersEkran === 'etkilesim') {
    const hafta = dersAktifHafta();
    const ders = hafta?.dersler.find((d) => KONULAR[d.konu]);
    const sev = ders ? KONULAR[ders.konu].seviyeler.find((s) => s.seviye === ders.seviye) : null;

    if (sev) {
      dersWidgetKapat();
      const canvas = etkilesimEkrani(kok, { gorev: sev.etkilesim.gorev, mesaj: dersEtkilesimMesaj }, ceviri);
      // Tuvalin cizim cozunurlugu CSS boyutundan ayridir; retina
      // ekranda bulanik cikmasin diye oranla carpilir.
      const oran = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * oran;
      canvas.height = Math.round(canvas.clientWidth * 0.75) * oran;
      dersWidget = widgetKur(sev.etkilesim.widget, canvas, {
        mod: sev.etkilesim.mod,
        veri: sev.etkilesim.veri ?? {},
        ses
      });
      dersWidget?.ciz();
      return;
    }
    dersEkran = 'hafta';
  }
```

Yardimci:

```js
function dersWidgetKapat() {
  if (dersWidget) {
    dersWidget.yokEt();
    dersWidget = null;
  }
}
```

Olay bloklari (`data-ders-adim` blogundan sonra):

```js
  const dersEtk = e.target.closest('[data-ders-etkilesim]');
  if (dersEtk) {
    const eylem = dersEtk.dataset.dersEtkilesim;

    if (eylem === 'kapat') {
      dersWidgetKapat();
      dersEtkilesimMesaj = '';
      dersEkran = 'hafta';
      renderDers();
      return;
    }

    if (eylem === 'temizle') {
      dersWidget?.temizle?.();
      return;
    }

    const sonuc = dersWidget?.dogrula() ?? { tamam: false, mesaj: '' };
    dersEtkilesimMesaj = sonuc.mesaj;

    if (sonuc.tamam) {
      const hafta = dersAktifHafta();
      const kayit = etkilesimTamamla(haftaKaydi(state.loadDersIlerleme(), hafta.hafta));
      dersIlerlemeYaz(hafta.hafta, kayit.kayit);
      if (kayit.kazanilanYildiz > 0) {
        dersYildizVer(kayit.kazanilanYildiz);
        ses.efekt('kutlama');
      }
      dersWidgetKapat();
      dersEkran = 'hafta';
      dersEtkilesimMesaj = '';
      render();
      return;
    }

    ses.efekt('yanlis');
    renderDers();
    return;
  }
```

Anlatim "bitir" eylemi Task 13b'de zaten `dersEkran = 'ornek'` olarak
ayarlandi; ornek ekraninin "Geç" ve "Anladım" dugmeleri buraya, yani
`etkilesim` ekranina getirir. Burada ayrica bir yonlendirme yazma.

Hafta kartindaki asama rozetlerinden dogrudan girilebilmesi icin
`data-ders-asama` tiklamasini da bagla:

```js
  const asamaDugme = e.target.closest('[data-ders-asama]');
  if (asamaDugme) {
    ses.hazirla();
    dersEkran = asamaDugme.dataset.dersAsama;
    dersAdimIndex = 0;
    renderDers();
    if (dersEkran === 'anlatim') dersAdimiSeslendir();
    return;
  }
```

`ders-asama` su an `div`; tiklanabilir olmasi icin `ders-dom.js` icindeki
`asamaRozeti` fonksiyonunda `el('div', ...)` yerine
`el('button', { ..., attrs: { type: 'button' } }, ...)` kullan.

- [ ] **Step 10: `sw.js` guncelle**

`CACHE_NAME` -> `'ataol-ai-v40'`, ASSETS'e ekle:

```js
  './src/ui/widget/index.js',
  './src/ui/widget/aciolcer.js',
  './src/ui/widget/geometri-tuval.js',
```

- [ ] **Step 11: Tum testleri ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: anlatim bitince "Kendin dene" aciliyor, tuvale cizim
yapilabiliyor, "Kontrol et" gorev tamamlanmadiysa mesaj veriyor,
tamamlandiginda hafta ekranina donuyor ve rozet yesil oluyor, yildiz
3 artiyor.

- [ ] **Step 12: Commit**

```bash
git add src/ui/widget/ src/ui/ders-dom.js src/main.js src/core/i18n.js sw.js tests/widget-arayuz.test.js
git commit -m "feat(ders): aciolcer ve geometri tuvali widgetleri

Ikisi de ayni sozlesmeyi sagliyor (ciz, dogrula, yokEt), boylece ekran
kodu hangi widget oldugunu bilmek zorunda degil.

yokEt testi ozellikle onemli: widget pointer dinleyicisi birakirsa
ekran her acildiginda bir tane daha eklenir ve uygulama zamanla
yavaslar. Test bunu zorluyor.

Aci matematigi engines/widgets/aci.js'ten okunuyor; ekranda gorunen
ile soruda sorulan ayni kuraldan geliyor."
```

---

## Task 15: Alistirma ekrani

Sinirsiz soru, aninda geri bildirim, yanlista cozum adimlari. Leitner
kutulari yanlis yapilan soru tipini daha sik getirir.

**Files:**
- Modify: `src/views/ders.js` (`alistirmaSorusu`)
- Modify: `src/ui/ders-dom.js` (`soruEkrani`)
- Modify: `src/main.js`, `src/core/i18n.js`
- Test: `tests/alistirma.test.js`

**Interfaces:**
- Consumes: `soruUret` (Task 8), `newBox`, `promote`, `demote`,
  `selectWeighted` (`engines/leitner.js`), `alistirmaCevap` (Task 6)
- Produces:
  - `alistirmaSorusu(hafta, konular, kayit, rng)` -> `{ soru, ureticiId, seviye }` veya `null`
  - `soruEkrani(kok, model, ceviri)` -> void
  - `data-ders-secenek="<indeks>"`, `data-ders-soru="devam" | "kapat"`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/alistirma.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { alistirmaSorusu } from '../src/views/ders.js';
import { bosHafta, alistirmaCevap } from '../src/engines/ders.js';
import { sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

const HAFTA1 = TAKVIM[0];

test('alistirmaSorusu gecerli bir soru uretir', () => {
  for (let t = 1; t <= 100; t++) {
    const s = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(t));
    assert.ok(s, 'soru uretilmedi');
    sozlesmeyiDogrula(s.soru, `alistirma tohum ${t}`);
    assert.equal(s.ureticiId, 'temel-cizimler');
    assert.equal(s.seviye, 1);
  }
});

test('alistirmaSorusu icerigi olmayan haftada null doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  assert.equal(alistirmaSorusu(hafta, KONULAR, bosHafta(), tohumluRng(1)), null);
});

test('iki konulu haftada iki konudan da soru gelir', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 8);
  const ureticiler = new Set();
  for (let t = 1; t <= 100; t++) {
    ureticiler.add(alistirmaSorusu(hafta, KONULAR, bosHafta(), tohumluRng(t)).ureticiId);
  }
  assert.ok(ureticiler.size >= 1);
  for (const u of ureticiler) assert.ok(['cokgenler-cember'].includes(u), u);
});

test('zayif kutudaki tip daha sik gelir', () => {
  // 'temel-cizimler-arac' tipini 1. kutuya, digerlerini 5. kutuya koy.
  let kayit = bosHafta();
  kayit = alistirmaCevap(kayit, 'temel-cizimler-arac', { box: 1 }, false).kayit;
  kayit = alistirmaCevap(kayit, 'temel-cizimler-tanim', { box: 5 }, true).kayit;

  let zayifSayisi = 0;
  for (let t = 1; t <= 400; t++) {
    const s = alistirmaSorusu(HAFTA1, KONULAR, kayit, tohumluRng(t));
    if (s.soru.tip === 'temel-cizimler-arac') zayifSayisi++;
  }
  assert.ok(zayifSayisi > 200,
    `zayif tip 400 denemede yalniz ${zayifSayisi} kez geldi, Leitner agirligi calismiyor`);
});

test('ayni tohum ayni soruyu uretir', () => {
  const a = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(7));
  const b = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(7));
  assert.deepEqual(a, b);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/alistirma.test.js`
Expected: FAIL, `alistirmaSorusu is not a function`.

- [ ] **Step 3: `views/ders.js` icine ekle**

```js
import { soruUret } from '../engines/uretici/index.js';
import { selectWeighted } from '../engines/leitner.js';

/**
 * Bir alistirma sorusu secer.
 *
 * Once hangi konudan soru gelecegi belirlenir (hafta iki konuya
 * bagliysa rastgele biri), sonra uretici calistirilir.
 *
 * Leitner agirligi soru URETILDIKTEN sonra uygulanir: uretici rastgele
 * bir tip seciyor, biz de zayif kutudaki tip cikana kadar birkac kez
 * deniyoruz. Ureticiyi tip zorlamak icin degistirmek her ureticiye
 * ayni karmasikligi tasirdi; burada tek yerde duruyor.
 */
export function alistirmaSorusu(hafta, konular, kayit, rng) {
  const hazirDersler = hafta.dersler.filter((d) => {
    const sev = seviyeBul(konular[d.konu], d.seviye);
    return Boolean(sev);
  });
  if (hazirDersler.length === 0) return null;

  const ders = hazirDersler[Math.floor(rng() * hazirDersler.length)];

  const zayifTip = Object.keys(kayit.alistirma).length > 0
    ? selectWeighted(kayit.alistirma, rng)
    : null;

  let soru = soruUret(ders.konu, ders.seviye, rng);
  if (zayifTip) {
    // En fazla 12 deneme: zayif tip bulunamazsa elde olanla devam
    // edilir, cocugu bekletmenin anlami yok.
    for (let i = 0; i < 12 && soru.tip !== zayifTip; i++) {
      soru = soruUret(ders.konu, ders.seviye, rng);
    }
  }

  return { soru, ureticiId: ders.konu, seviye: ders.seviye };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/alistirma.test.js`
Expected: PASS, 5 test gecer.

- [ ] **Step 5: i18n anahtarlari**

TR:

```js
    'ders.practice': 'Alıştırma',
    'ders.correct': 'Doğru!',
    'ders.wrong': 'Bu değil, bak bakalım:',
    'ders.next': 'Devam',
    'ders.practiceCount': 'Doğru cevap: {n}',
```

EN:

```js
    'ders.practice': 'Practice',
    'ders.correct': 'Correct!',
    'ders.wrong': "Not this one, let's look:",
    'ders.next': 'Continue',
    'ders.practiceCount': 'Correct answers: {n}',
```

- [ ] **Step 6: `ui/ders-dom.js` icine `soruEkrani` ekle**

Quiz ve sinav da ayni ekrani kullanir; farki `model` belirler.

```js
/**
 * Soru ekrani. Alistirma, quiz ve sinav ayni ekrani kullanir.
 *
 * model: {
 *   baslik, ustBilgi, soru, secildi, dogruMu, cozumGoster,
 *   devamEtiketi, kapatVar
 * }
 *
 * secildi null ise henuz cevaplanmamistir. Cevaplandiktan sonra
 * secenekler yeniden cizilir ve dogru olan isaretlenir; yanlis secilen
 * ayrica kirmizi gosterilir ki cocuk neyi sectigini gorsun.
 */
export function soruEkrani(kok, model, ceviri) {
  const secenekler = model.soru.secenekler.map((metin, i) => {
    let sinif = 'soru__secenek';
    if (model.secildi !== null && model.cozumGoster) {
      if (i === model.soru.dogru) sinif += ' soru__secenek--dogru';
      else if (i === model.secildi) sinif += ' soru__secenek--yanlis';
    }
    return el('button', {
      className: sinif,
      text: metin,
      attrs: { type: 'button' },
      dataset: { dersSecenek: String(i) }
    });
  });

  const cozum = model.cozumGoster && model.secildi !== null
    ? el('div', { className: 'soru__cozum' }, [
        el('p', {
          className: model.dogruMu ? 'soru__geri soru__geri--dogru' : 'soru__geri soru__geri--yanlis',
          text: model.dogruMu ? ceviri('ders.correct') : ceviri('ders.wrong')
        }),
        ...model.soru.cozum.map((adim) => el('p', { className: 'soru__cozum-adim', text: adim }))
      ])
    : null;

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      model.kapatVar
        ? el('button', {
            className: 'anlatim__kapat',
            text: ceviri('ders.close'),
            attrs: { type: 'button' },
            dataset: { dersSoru: 'kapat' }
          })
        : null,
      el('p', { className: 'anlatim__sayac', text: model.ustBilgi })
    ]),
    el('p', { className: 'soru__baslik', text: model.baslik }),
    el('p', { className: 'soru__metin', text: model.soru.soru.tr }),
    el('div', { className: 'soru__secenekler' }, secenekler),
    cozum,
    model.secildi !== null
      ? el('button', {
          className: 'anlatim__gez anlatim__gez--vurgu',
          text: model.devamEtiketi,
          attrs: { type: 'button' },
          dataset: { dersSoru: 'devam' }
        })
      : null
  ]);
}
```

- [ ] **Step 7: `main.js` icine bagla**

Import:

```js
import { alistirmaSorusu } from './views/ders.js';
import { soruEkrani } from './ui/ders-dom.js';
import { alistirmaCevap } from './engines/ders.js';
import { newBox, promote, demote } from './engines/leitner.js';
```

Modul durumu:

```js
// Ekranda duran alistirma sorusu. Cevaplanana kadar degismez; her
// render'da yeni soru uretmek cocugun okudugu soruyu degistirirdi.
let dersSoru = null;
let dersSecildi = null;
```

`renderDers` icine:

```js
  if (dersEkran === 'alistirma') {
    const hafta = dersAktifHafta();
    if (!hafta) { dersEkran = 'hafta'; }
    else {
      const ilerleme = state.loadDersIlerleme();
      const kayit = haftaKaydi(ilerleme, hafta.hafta);
      if (!dersSoru) {
        dersSoru = alistirmaSorusu(hafta, KONULAR, kayit, Math.random);
        dersSecildi = null;
      }
      if (dersSoru) {
        soruEkrani(kok, {
          baslik: ceviri('ders.practice'),
          ustBilgi: ceviri('ders.practiceCount', { n: kayit.alistirmaDogru }),
          soru: dersSoru.soru,
          secildi: dersSecildi,
          dogruMu: dersSecildi === dersSoru.soru.dogru,
          cozumGoster: true,
          devamEtiketi: ceviri('ders.next'),
          kapatVar: true
        }, ceviri);
        return;
      }
      dersEkran = 'hafta';
    }
  }
```

Olaylar:

```js
  const secenekDugme = e.target.closest('[data-ders-secenek]');
  if (secenekDugme && dersEkran === 'alistirma') {
    if (dersSecildi !== null) return;   // ayni soruya iki kez cevap yok

    dersSecildi = Number(secenekDugme.dataset.dersSecenek);
    const dogruMu = dersSecildi === dersSoru.soru.dogru;
    const hafta = dersAktifHafta();
    const kayit = haftaKaydi(state.loadDersIlerleme(), hafta.hafta);
    const tip = dersSoru.soru.tip;
    const onceki = kayit.alistirma[tip] ?? newBox();
    const yeniKutu = dogruMu ? promote(onceki) : demote(onceki);

    const sonuc = alistirmaCevap(kayit, tip, {
      ...yeniKutu,
      seen: (onceki.seen ?? 0) + 1,
      correct: (onceki.correct ?? 0) + (dogruMu ? 1 : 0),
      wrong: (onceki.wrong ?? 0) + (dogruMu ? 0 : 1)
    }, dogruMu);

    dersIlerlemeYaz(hafta.hafta, sonuc.kayit);
    ses.efekt(dogruMu ? 'dogru' : 'yanlis');
    renderDers();
    return;
  }

  const soruDugme = e.target.closest('[data-ders-soru]');
  if (soruDugme && dersEkran === 'alistirma') {
    if (soruDugme.dataset.dersSoru === 'kapat') {
      dersSoru = null;
      dersSecildi = null;
      dersEkran = 'hafta';
      render();
      return;
    }
    dersSoru = null;
    dersSecildi = null;
    renderDers();
    return;
  }
```

- [ ] **Step 8: Tum testleri ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: hafta kartindaki "Alıştırma" rozetine basinca soru geliyor,
secenek seciliyor, dogruda yesil ses, yanlista cozum adimlari cikiyor,
"Devam" yeni soru getiriyor, 10 dogruda rozet yesil oluyor. 10 dogru
sonrasi yildiz gelmiyor (alistirma yildiz vermez).

- [ ] **Step 9: Commit**

```bash
git add src/views/ders.js src/ui/ders-dom.js src/main.js src/core/i18n.js tests/alistirma.test.js
git commit -m "feat(ders): sinirsiz alistirma ekrani

Leitner kutulari yanlis yapilan soru tipini daha sik getiriyor.
Agirlik soru uretildikten SONRA uygulaniyor: ureticiye tip zorlamak
her ureticiye ayni karmasikligi tasirdi, burada tek yerde duruyor ve
12 denemeden sonra elde olanla devam ediyor, cocugu bekletmiyor.

Ekrandaki soru cevaplanana kadar sabit; her render'da yeni soru
uretmek cocugun okudugu soruyu degistirirdi."
```

---

## Task 16: Sinav motoru ve hafta quizi

Quiz ve sinav ayni motoru kullanir, farki kapsam ve geri bildirim
zamanidir. Quiz her soruda aninda geri bildirim verir cunku ogretme
aracidir; sinav sonda verir cunku olcme aracidir.

**Files:**
- Create: `src/engines/sinav.js`
- Modify: `src/main.js`, `src/core/i18n.js`, `sw.js`
- Test: `tests/sinav.test.js`

**Interfaces:**
- Consumes: `soruUret` (Task 8)
- Produces:
  - `sinavKur({ kaynaklar, soruSayisi, gecmeNotu, aninda }, rng)` -> sinav
  - `kaynaklar[n]` -> `{ ureticiId, seviye, agirlik }`
  - `cevapla(sinav, index, secilen)` -> yeni sinav
  - `puanla(sinav)` -> `{ dogru, toplam, yuzde, gecti, konuBazli }`
  - `konuBazli` -> `{ [ureticiId]: { dogru, toplam } }`
  - `agirlikHesapla(takvim, uniteId)` -> `kaynaklar` dizisi
  - `sinav` -> `{ sorular, kaynaklar, cevaplar, gecmeNotu, aninda, bitti }`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/sinav.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sinavKur, cevapla, puanla, agirlikHesapla } from '../src/engines/sinav.js';
import { TAKVIM } from '../src/data/mufredat.js';
import { sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

const KAYNAK = [
  { ureticiId: 'temel-cizimler', seviye: 1, agirlik: 1 },
  { ureticiId: 'aci-olcme', seviye: 1, agirlik: 1 }
];

const kur = (ust = {}) => sinavKur({
  kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70, aninda: true, ...ust
}, tohumluRng(1));

test('sinavKur istenen sayida soru uretir', () => {
  assert.equal(kur().sorular.length, 10);
  assert.equal(kur({ soruSayisi: 20 }).sorular.length, 20);
});

test('uretilen tum sorular sozlesmeye uyar', () => {
  for (let t = 1; t <= 50; t++) {
    const s = sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(t));
    s.sorular.forEach((soru, i) => sozlesmeyiDogrula(soru, `tohum ${t} soru ${i}`));
  }
});

test('sinav basladiginda cevaplar bostur', () => {
  const s = kur();
  assert.equal(s.cevaplar.length, 10);
  assert.ok(s.cevaplar.every((c) => c === null));
  assert.equal(s.bitti, false);
});

test('cevapla yalniz ilgili indeksi degistirir', () => {
  const s = cevapla(kur(), 3, 2);
  assert.equal(s.cevaplar[3], 2);
  assert.equal(s.cevaplar[0], null);
});

test('cevapla girdiyi degistirmez', () => {
  const s = kur();
  cevapla(s, 0, 1);
  assert.equal(s.cevaplar[0], null);
});

test('cevapla sinir disi indeksi yok sayar', () => {
  const s = kur();
  assert.deepEqual(cevapla(s, 99, 1).cevaplar, s.cevaplar);
  assert.deepEqual(cevapla(s, -1, 1).cevaplar, s.cevaplar);
});

test('cevap degistirilebilir', () => {
  let s = cevapla(kur(), 0, 1);
  s = cevapla(s, 0, 3);
  assert.equal(s.cevaplar[0], 3);
});

test('hepsi dogru cevaplaninca 100 alinir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, soru.dogru); });
  const p = puanla(s);
  assert.equal(p.dogru, 10);
  assert.equal(p.yuzde, 100);
  assert.equal(p.gecti, true);
});

test('hic cevaplanmayinca 0 alinir ve gecilemez', () => {
  const p = puanla(kur());
  assert.equal(p.dogru, 0);
  assert.equal(p.yuzde, 0);
  assert.equal(p.gecti, false);
});

test('yuzde gecme notuyla karsilastirilir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, i < 7 ? soru.dogru : (soru.dogru + 1) % soru.secenekler.length); });
  const p = puanla(s);
  assert.equal(p.yuzde, 70);
  assert.equal(p.gecti, true, 'gecme notuna esit puan gecer');
});

test('gecme notunun bir altinda gecilemez', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, i < 6 ? soru.dogru : (soru.dogru + 1) % soru.secenekler.length); });
  assert.equal(puanla(s).gecti, false);
});

test('konu bazli kirilim her kaynak icin sayi verir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, soru.dogru); });
  const p = puanla(s);
  const toplam = Object.values(p.konuBazli).reduce((n, k) => n + k.toplam, 0);
  assert.equal(toplam, 10);
  for (const k of Object.values(p.konuBazli)) {
    assert.equal(k.dogru, k.toplam, 'hepsi dogruyken kirilim da tam olmali');
  }
});

test('agirlikli kaynak daha cok soru alir', () => {
  const s = sinavKur({
    kaynaklar: [
      { ureticiId: 'temel-cizimler', seviye: 1, agirlik: 4 },
      { ureticiId: 'aci-olcme', seviye: 1, agirlik: 1 }
    ],
    soruSayisi: 20, gecmeNotu: 60
  }, tohumluRng(3));

  const sayim = {};
  for (const soru of s.sorular) {
    const k = soru.tip.startsWith('temel-cizimler') ? 'tc' : 'ao';
    sayim[k] = (sayim[k] ?? 0) + 1;
  }
  assert.ok(sayim.tc > sayim.ao, `agirlikli kaynak az soru aldi: ${JSON.stringify(sayim)}`);
  assert.ok(sayim.ao >= 1, 'dusuk agirlikli kaynak hic soru almamis');
});

test('agirlikHesapla unitenin konu seviyelerini sayar', () => {
  const k = agirlikHesapla(TAKVIM, 'geometrik-sekiller');
  const toplamAgirlik = k.reduce((n, x) => n + x.agirlik, 0);
  assert.equal(toplamAgirlik, 8, 'unite 1 de 8 konu-seviye var');
  assert.equal(k.filter((x) => x.ureticiId === 'cokgenler-cember').length, 4);
  assert.equal(k.filter((x) => x.ureticiId === 'temel-cizimler').length, 2);
});

test('ayni tohum ayni sinavi kurar', () => {
  assert.deepEqual(
    sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(9)),
    sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(9))
  );
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/sinav.test.js`
Expected: FAIL, modul yok.

- [ ] **Step 3: `src/engines/sinav.js` yaz**

```js
/**
 * Quiz ve sinav motoru. Saf: rng disaridan gelir.
 *
 * Quiz ve sinav ayni motoru kullanir. Tek fark 'aninda' bayragidir:
 * quiz her soruda geri bildirim verir cunku OGRETME aracidir, sinav
 * sonda verir cunku OLCME aracidir. Ikisini ayni ekranin iki modu
 * yapmak, iki ayri sistem yazmaktan hem az kod hem az hata demek.
 *
 * Sure siniri BILEREK yoktur. 10 yasinda bir cocuk kronometreyle
 * paniklerse olculen sey matematik degil kaygi olur.
 */

import { soruUret } from './uretici/index.js';

/**
 * Sorulari kaynaklara agirlikla dagitir.
 *
 * Once her kaynaga agirligi oraninda tam sayi pay verilir, sonra
 * yuvarlamadan artan sorular en buyuk agirliktan baslayarak dagitilir.
 * Her kaynak en az 1 soru alir: bir konu sinavda hic cikmazsa o konuyu
 * olcmemis oluruz.
 */
function dagit(kaynaklar, soruSayisi) {
  const toplamAgirlik = kaynaklar.reduce((n, k) => n + k.agirlik, 0);
  const paylar = kaynaklar.map((k) => ({
    kaynak: k,
    pay: Math.max(1, Math.floor((k.agirlik / toplamAgirlik) * soruSayisi))
  }));

  let dagitilan = paylar.reduce((n, p) => n + p.pay, 0);

  // Fazla dagittiysak en cok payi olandan geri al (1'in altina inmeden).
  while (dagitilan > soruSayisi) {
    const enBuyuk = paylar.filter((p) => p.pay > 1).sort((a, b) => b.pay - a.pay)[0];
    if (!enBuyuk) break;
    enBuyuk.pay -= 1;
    dagitilan -= 1;
  }

  // Eksik kaldiysa agirligi en buyuk olana ver.
  let i = 0;
  const sirali = [...paylar].sort((a, b) => b.kaynak.agirlik - a.kaynak.agirlik);
  while (dagitilan < soruSayisi) {
    sirali[i % sirali.length].pay += 1;
    dagitilan += 1;
    i += 1;
  }

  return paylar;
}

export function sinavKur({ kaynaklar, soruSayisi, gecmeNotu, aninda = false }, rng) {
  const paylar = dagit(kaynaklar, soruSayisi);

  const sorular = [];
  const soruKaynagi = [];
  for (const { kaynak, pay } of paylar) {
    for (let n = 0; n < pay; n++) {
      sorular.push(soruUret(kaynak.ureticiId, kaynak.seviye, rng));
      soruKaynagi.push(kaynak.ureticiId);
    }
  }

  // Konular bloklar halinde degil karisik gelsin; art arda ayni konu
  // gelirse cocuk sinavi "bitti mi" diye degil "hala mi" diye yasar.
  const sira = sorular.map((_, i) => i);
  for (let i = sira.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [sira[i], sira[j]] = [sira[j], sira[i]];
  }

  return {
    sorular: sira.map((i) => sorular[i]),
    soruKaynagi: sira.map((i) => soruKaynagi[i]),
    cevaplar: sira.map(() => null),
    gecmeNotu,
    aninda,
    bitti: false
  };
}

export function cevapla(sinav, index, secilen) {
  if (!Number.isInteger(index) || index < 0 || index >= sinav.sorular.length) return sinav;
  const cevaplar = [...sinav.cevaplar];
  cevaplar[index] = secilen;
  return { ...sinav, cevaplar };
}

export function puanla(sinav) {
  const konuBazli = {};
  let dogru = 0;

  sinav.sorular.forEach((soru, i) => {
    const kaynak = sinav.soruKaynagi[i];
    if (!konuBazli[kaynak]) konuBazli[kaynak] = { dogru: 0, toplam: 0 };
    konuBazli[kaynak].toplam += 1;

    if (sinav.cevaplar[i] === soru.dogru) {
      dogru += 1;
      konuBazli[kaynak].dogru += 1;
    }
  });

  const toplam = sinav.sorular.length;
  const yuzde = toplam === 0 ? 0 : Math.round((dogru / toplam) * 100);

  return { dogru, toplam, yuzde, gecti: yuzde >= sinav.gecmeNotu, konuBazli };
}

/**
 * Bir unitenin kaynak listesi: o unitedeki her konu-seviye cifti bir
 * kaynaktir ve agirligi 1'dir. Boylece 5 seviyeli bir konu, 2 seviyeli
 * bir konudan iki buçuk kat fazla soru alir; unitede ne kadar zaman
 * gecirdiyse sinavda o kadar yer kaplar.
 */
export function agirlikHesapla(takvim, uniteId) {
  const kaynaklar = [];
  for (const hafta of takvim) {
    if (hafta.unite !== uniteId) continue;
    for (const ders of hafta.dersler) {
      kaynaklar.push({ ureticiId: ders.konu, seviye: ders.seviye, agirlik: 1 });
    }
  }
  return kaynaklar;
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/sinav.test.js`
Expected: PASS, 15 test gecer.

- [ ] **Step 5: i18n anahtarlari**

TR:

```js
    'ders.quiz': 'Hafta quizi',
    'ders.quizOf': 'Soru {n} / {t}',
    'ders.quizResult': '{n} / {t} doğru',
    'ders.quizPassed': 'Geçtin! {y} yıldız kazandın.',
    'ders.quizFailed': 'Geçmek için {g} puan gerekiyor. Tekrar dene.',
    'ders.quizBest': 'En iyi puanın: {n}',
    'ders.retry': 'Tekrar dene',
    'ders.backToWeek': 'Haftaya dön',
```

EN:

```js
    'ders.quiz': 'Weekly quiz',
    'ders.quizOf': 'Question {n} / {t}',
    'ders.quizResult': '{n} / {t} correct',
    'ders.quizPassed': 'You passed! You earned {y} stars.',
    'ders.quizFailed': 'You need {g} points to pass. Try again.',
    'ders.quizBest': 'Your best score: {n}',
    'ders.retry': 'Try again',
    'ders.backToWeek': 'Back to the week',
```

- [ ] **Step 6: `ui/ders-dom.js` icine `sonucEkrani` ekle**

```js
/**
 * Quiz ve sinav sonuc ekrani.
 *
 * Not tek basina ise yaramaz; nereye gidilecegini soylemesi gerekir.
 * Bu yuzden konu bazli kirilim ve zayif konunun yaninda dogrudan o
 * konunun alistirmasina goturen bir dugme var.
 */
export function sonucEkrani(kok, model, ceviri) {
  const kirilim = model.konular.map((k) =>
    el('div', { className: 'sonuc__konu' }, [
      el('p', { className: 'sonuc__konu-ad', text: `${k.ad}: ${k.dogru} / ${k.toplam}` }),
      k.zayif
        ? el('button', {
            className: 'sonuc__calis',
            text: ceviri('ders.stage.alistirma'),
            attrs: { type: 'button' },
            dataset: { dersSonuc: 'calis', dersKonu: k.id }
          })
        : null
    ])
  );

  mount(kok, [
    el('p', { className: 'sonuc__baslik', text: model.baslik }),
    el('p', { className: 'sonuc__puan', text: ceviri('ders.quizResult', { n: model.dogru, t: model.toplam }) }),
    el('p', {
      className: model.gecti ? 'sonuc__durum sonuc__durum--gecti' : 'sonuc__durum',
      text: model.gecti
        ? ceviri('ders.quizPassed', { y: model.yildiz })
        : ceviri('ders.quizFailed', { g: model.gecmeNotu })
    }),
    el('div', { className: 'sonuc__kirilim' }, kirilim),
    el('div', { className: 'sonuc__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.retry'),
        attrs: { type: 'button' },
        dataset: { dersSonuc: 'tekrar' }
      }),
      el('button', {
        className: 'anlatim__gez anlatim__gez--vurgu',
        text: ceviri('ders.backToWeek'),
        attrs: { type: 'button' },
        dataset: { dersSonuc: 'kapat' }
      })
    ])
  ]);
}
```

- [ ] **Step 7: `main.js` icine quiz akisini bagla**

Import:

```js
import { sinavKur, cevapla as sinavCevapla, puanla, agirlikHesapla } from './engines/sinav.js';
import { sonucEkrani } from './ui/ders-dom.js';
import { quizBitir, QUIZ_GECME } from './engines/ders.js';
```

Modul durumu:

```js
// Acik quiz ya da sinav. null ise yok. dersSinavSonuc dolu ise sonuc
// ekrani gosteriliyordur.
let dersSinav = null;
let dersSinavSonuc = null;
```

`renderDers` icine, `alistirma` blogundan sonra:

```js
  if (dersEkran === 'quiz' || dersEkran === 'sinav') {
    if (dersSinavSonuc) {
      sonucEkrani(kok, dersSinavSonuc, ceviri);
      return;
    }
    if (dersSinav) {
      const i = dersSinav.cevaplar.findIndex((c) => c === null);
      const index = i === -1 ? dersSinav.sorular.length - 1 : i;
      soruEkrani(kok, {
        baslik: dersEkran === 'quiz' ? ceviri('ders.quiz') : ceviri('ders.unitExam'),
        ustBilgi: ceviri('ders.quizOf', { n: index + 1, t: dersSinav.sorular.length }),
        soru: dersSinav.sorular[index],
        secildi: dersSinav.cevaplar[index],
        dogruMu: dersSinav.cevaplar[index] === dersSinav.sorular[index].dogru,
        cozumGoster: dersSinav.aninda,
        devamEtiketi: ceviri('ders.next'),
        kapatVar: true
      }, ceviri);
      return;
    }
    dersEkran = 'hafta';
  }
```

Quiz baslatma, `data-ders-asama` blogunun icine:

```js
    if (dersEkran === 'quiz') {
      const hafta = dersAktifHafta();
      const kaynaklar = hafta.dersler
        .filter((d) => KONULAR[d.konu])
        .map((d) => ({ ureticiId: d.konu, seviye: d.seviye, agirlik: 1 }));
      dersSinav = sinavKur({ kaynaklar, soruSayisi: 10, gecmeNotu: QUIZ_GECME, aninda: true }, Math.random);
      dersSinavSonuc = null;
    }
```

Quiz icindeki secenek ve devam olaylari (alistirma bloklarinin altina):

```js
  if (secenekDugme && (dersEkran === 'quiz' || dersEkran === 'sinav')) {
    const i = dersSinav.cevaplar.findIndex((c) => c === null);
    const index = i === -1 ? dersSinav.sorular.length - 1 : i;
    if (dersSinav.cevaplar[index] !== null) return;

    dersSinav = sinavCevapla(dersSinav, index, Number(secenekDugme.dataset.dersSecenek));
    if (dersSinav.aninda) {
      ses.efekt(dersSinav.cevaplar[index] === dersSinav.sorular[index].dogru ? 'dogru' : 'yanlis');
    }
    renderDers();
    return;
  }

  if (soruDugme && (dersEkran === 'quiz' || dersEkran === 'sinav')) {
    if (soruDugme.dataset.dersSoru === 'kapat') {
      dersSinav = null;
      dersSinavSonuc = null;
      dersEkran = 'hafta';
      render();
      return;
    }
    if (dersSinav.cevaplar.every((c) => c !== null)) {
      dersSinavBitir();
      return;
    }
    renderDers();
    return;
  }
```

Bitirme ve sonuc:

```js
function dersSinavBitir() {
  const p = puanla(dersSinav);
  const hafta = dersAktifHafta();
  const sonuc = quizBitir(haftaKaydi(state.loadDersIlerleme(), hafta.hafta), p.yuzde);
  dersIlerlemeYaz(hafta.hafta, sonuc.kayit);
  if (sonuc.kazanilanYildiz > 0) {
    dersYildizVer(sonuc.kazanilanYildiz);
    ses.efekt('kutlama');
  }

  dersSinavSonuc = {
    baslik: ceviri('ders.quiz'),
    dogru: p.dogru,
    toplam: p.toplam,
    gecti: p.gecti,
    gecmeNotu: dersSinav.gecmeNotu,
    yildiz: sonuc.kazanilanYildiz,
    konular: Object.entries(p.konuBazli).map(([id, k]) => ({
      id,
      ad: KONULAR[id]?.ad?.tr ?? id,
      dogru: k.dogru,
      toplam: k.toplam,
      zayif: k.dogru / k.toplam < 0.7
    }))
  };
  renderDers();
}
```

Sonuc ekrani olaylari:

```js
  const sonucDugme = e.target.closest('[data-ders-sonuc]');
  if (sonucDugme) {
    const eylem = sonucDugme.dataset.dersSonuc;
    if (eylem === 'calis') {
      dersSinav = null;
      dersSinavSonuc = null;
      dersSoru = null;
      dersSecildi = null;
      dersEkran = 'alistirma';
      renderDers();
      return;
    }
    if (eylem === 'tekrar') {
      dersSinavSonuc = null;
      dersEkran = 'quiz';
      const hafta = dersAktifHafta();
      const kaynaklar = hafta.dersler
        .filter((d) => KONULAR[d.konu])
        .map((d) => ({ ureticiId: d.konu, seviye: d.seviye, agirlik: 1 }));
      dersSinav = sinavKur({ kaynaklar, soruSayisi: 10, gecmeNotu: QUIZ_GECME, aninda: true }, Math.random);
      renderDers();
      return;
    }
    dersSinav = null;
    dersSinavSonuc = null;
    dersEkran = 'hafta';
    render();
    return;
  }
```

- [ ] **Step 8: `sw.js` guncelle**

`CACHE_NAME` -> `'ataol-ai-v41'`, ASSETS'e `'./src/engines/sinav.js',` ekle.

- [ ] **Step 9: Tum testleri ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: "Quiz" rozeti 10 soruluk quizi aciyor, her soruda aninda
geri bildirim var, son soruda "Devam" sonuc ekranini getiriyor, gecince
6 yildiz geliyor, tam puanda 10 geliyor, ikinci kez gecince yildiz
gelmiyor ama en iyi puan guncelleniyor.

- [ ] **Step 10: Commit**

```bash
git add src/engines/sinav.js src/ui/ders-dom.js src/main.js src/core/i18n.js sw.js tests/sinav.test.js
git commit -m "feat(ders): sinav motoru ve hafta quizi

Quiz ve sinav ayni motoru kullaniyor; tek fark 'aninda' bayragi. Quiz
her soruda geri bildirim veriyor (ogretme araci), sinav sonda veriyor
(olcme araci).

Sorular kaynaklara agirlikla dagitiliyor ve her kaynak en az 1 soru
aliyor: bir konu sinavda hic cikmazsa o konuyu olcmemis oluruz.
Sorular karistiriliyor, yoksa ayni konu blok blok gelir ve cocuk
sinavi 'hala mi' diye yasar.

Sure siniri bilerek yok."
```

---

## Task 17: Unite sinavi

Unite bitince acilan 20 soruluk sinav. Quiz'den farki: kapsam tum unite,
geri bildirim sonda, sorular arasinda ileri geri gezinilebiliyor.

**Files:**
- Modify: `src/views/ders.js` (`uniteSinaviDurumu`)
- Modify: `src/ui/ders-dom.js` (`sinavEkrani`)
- Modify: `src/main.js`, `src/core/i18n.js`
- Test: `tests/unite-sinavi.test.js`

**Interfaces:**
- Consumes: `agirlikHesapla`, `sinavKur`, `puanla` (Task 16);
  `sinavBitir`, `SINAV_GECME` (Task 6); `UNITELER`, `TAKVIM` (Task 2)
- Produces:
  - `uniteSinaviDurumu(takvim, uniteler, uniteId, ilerleme, konular)` -> `{ acik, sebep, sinavId, puan, gecti }`
  - `sinavEkrani(kok, model, ceviri)` -> void
  - `data-ders-sinav="ileri" | "geri" | "bitir" | "kapat"`

- [ ] **Step 1: Basarisiz testleri yaz**

```js
// tests/unite-sinavi.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, UNITELER } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { uniteSinaviDurumu } from '../src/views/ders.js';

const bosIlerleme = { haftalar: {}, sinavlar: {} };

// 1-8. haftalarin quizini gecmis bir ilerleme uretir.
function quizleriGec(haftalar) {
  const out = { haftalar: {}, sinavlar: {} };
  for (const h of haftalar) {
    out.haftalar[String(h)] = {
      anlatim: [], etkilesimBitti: true, alistirma: {}, alistirmaDogru: 10,
      quiz: { enIyi: 80, denemeler: 1 }, yildizAlinan: ['anlatim', 'etkilesim', 'quiz']
    };
  }
  return out;
}

test('hicbir hafta bitmemisken unite sinavi kapalidir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', bosIlerleme, KONULAR);
  assert.equal(d.acik, false);
  assert.ok(d.sebep.length > 0, 'neden kapali oldugu soylenmelidir');
});

test('bazi haftalar bitmisken hala kapalidir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', quizleriGec([1, 2, 3]), KONULAR);
  assert.equal(d.acik, false);
});

test('unitenin tum haftalarinin quizi gecilince acilir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', quizleriGec([1, 2, 3, 4, 5, 6, 7, 8]), KONULAR);
  assert.equal(d.acik, true);
  assert.equal(d.sinavId, 'unite-geometrik-sekiller');
});

test('daha once girilmis sinavin puani dondurulur', () => {
  const ilerleme = quizleriGec([1, 2, 3, 4, 5, 6, 7, 8]);
  ilerleme.sinavlar['unite-geometrik-sekiller'] = { puan: 84, gecti: true, tip: 'unite', yildizAlindi: true };
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', ilerleme, KONULAR);
  assert.equal(d.puan, 84);
  assert.equal(d.gecti, true);
});

test('icerigi yazilmamis unite icin sinav acilmaz', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'sayilar-2', quizleriGec([19, 20, 21, 22, 23, 24, 25]), KONULAR);
  assert.equal(d.acik, false);
});

test('bilinmeyen unite kimliginde kapali doner, atmaz', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'boyle-bir-unite-yok', bosIlerleme, KONULAR);
  assert.equal(d.acik, false);
});
```

- [ ] **Step 2: Testi calistir, kirmizi oldugunu gor**

Run: `node --test tests/unite-sinavi.test.js`
Expected: FAIL, `uniteSinaviDurumu is not a function`.

- [ ] **Step 3: `views/ders.js` icine ekle**

```js
import { QUIZ_GECME } from '../engines/ders.js';

/**
 * Unite sinavinin acik olup olmadigi.
 *
 * Kosul: unitedeki TUM haftalarin quizi gecilmis olmali. Sinav bir
 * ozettir; konuyu hic calismadan sinava girmek cocugu bosuna
 * basarisizliga ugratir ve sinavdan sogutur.
 *
 * Icerigi henuz yazilmamis unitede (Faz 2-5) sinav hic acilmaz.
 */
export function uniteSinaviDurumu(takvim, uniteler, uniteId, ilerleme, konular) {
  const unite = uniteler.find((u) => u.id === uniteId);
  if (!unite) return { acik: false, sebep: 'Ünite bulunamadı.', sinavId: null, puan: null, gecti: false };

  const haftalar = takvim.filter((h) => h.unite === uniteId && h.dersler.length > 0);

  const icerikHazir = haftalar.every((h) =>
    h.dersler.every((d) => konular[d.konu]?.seviyeler.some((s) => s.seviye === d.seviye))
  );
  if (!icerikHazir) {
    return { acik: false, sebep: 'Bu ünitenin içeriği henüz hazırlanıyor.', sinavId: null, puan: null, gecti: false };
  }

  const eksik = haftalar.filter((h) => {
    const kayit = ilerleme.haftalar?.[String(h.hafta)];
    return !(kayit?.quiz?.enIyi >= QUIZ_GECME);
  });

  const sinavId = `unite-${uniteId}`;
  const gecmis = ilerleme.sinavlar?.[sinavId] ?? null;

  if (eksik.length > 0) {
    return {
      acik: false,
      sebep: `Sınav için ${eksik.length} haftanın quizini daha geçmen gerekiyor.`,
      sinavId,
      puan: gecmis?.puan ?? null,
      gecti: gecmis?.gecti ?? false
    };
  }

  return { acik: true, sebep: '', sinavId, puan: gecmis?.puan ?? null, gecti: gecmis?.gecti ?? false };
}
```

- [ ] **Step 4: Testi calistir, yesil oldugunu gor**

Run: `node --test tests/unite-sinavi.test.js`
Expected: PASS, 6 test gecer.

- [ ] **Step 5: i18n anahtarlari**

TR:

```js
    'ders.unitExam': 'Ünite sınavı',
    'ders.unitExamLocked': 'Ünite sınavı kilitli',
    'ders.unitExamStart': 'Ünite sınavına gir',
    'ders.unitExamScore': 'Ünite sınavı: {n} puan',
    'ders.finishExam': 'Sınavı bitir',
    'ders.unanswered': '{n} soru boş. Yine de bitirmek istiyor musun?',
    'ders.examNote': 'Bu sınavda cevaplar sonunda gösterilir. İstediğin soruya geri dönebilirsin.',
```

EN:

```js
    'ders.unitExam': 'Unit exam',
    'ders.unitExamLocked': 'Unit exam locked',
    'ders.unitExamStart': 'Take the unit exam',
    'ders.unitExamScore': 'Unit exam: {n} points',
    'ders.finishExam': 'Finish the exam',
    'ders.unanswered': '{n} questions are blank. Finish anyway?',
    'ders.examNote': 'Answers are shown at the end. You can go back to any question.',
```

- [ ] **Step 6: `ui/ders-dom.js` icine `sinavEkrani` ekle ve hafta kartina sinav bolumu koy**

```js
/**
 * Sinav ekrani. Quiz'den uc farki var:
 *   1. Cevaptan sonra cozum GOSTERILMEZ (olcme araci)
 *   2. Sorular arasinda ileri geri gezinilebilir
 *   3. Bitirmek ayri bir dugme ve bos soru varsa uyarir
 */
export function sinavEkrani(kok, model, ceviri) {
  const secenekler = model.soru.secenekler.map((metin, i) =>
    el('button', {
      className: model.secildi === i ? 'soru__secenek soru__secenek--secili' : 'soru__secenek',
      text: metin,
      attrs: { type: 'button' },
      dataset: { dersSecenek: String(i) }
    })
  );

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      el('button', {
        className: 'anlatim__kapat',
        text: ceviri('ders.close'),
        attrs: { type: 'button' },
        dataset: { dersSinav: 'kapat' }
      }),
      el('p', { className: 'anlatim__sayac', text: ceviri('ders.quizOf', { n: model.index + 1, t: model.toplam }) })
    ]),
    el('p', { className: 'soru__baslik', text: ceviri('ders.unitExam') }),
    el('p', { className: 'sinav__not', text: ceviri('ders.examNote') }),
    el('p', { className: 'soru__metin', text: model.soru.soru.tr }),
    el('div', { className: 'soru__secenekler' }, secenekler),
    model.uyari ? el('p', { className: 'sinav__uyari', text: model.uyari }) : null,
    el('div', { className: 'etkilesim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.back'),
        attrs: model.index === 0 ? { type: 'button', disabled: 'true' } : { type: 'button' },
        dataset: { dersSinav: 'geri' }
      }),
      model.index === model.toplam - 1
        ? el('button', {
            className: 'anlatim__gez anlatim__gez--vurgu',
            text: ceviri('ders.finishExam'),
            attrs: { type: 'button' },
            dataset: { dersSinav: 'bitir' }
          })
        : el('button', {
            className: 'anlatim__gez anlatim__gez--vurgu',
            text: ceviri('ders.forward'),
            attrs: { type: 'button' },
            dataset: { dersSinav: 'ileri' }
          })
    ])
  ]);
}
```

`haftaEkrani` icinde, `model.tip === 'ders'` dalinda `gezinme`'den ONCE
sinav bolumunu ekle:

```js
  if (model.tip === 'ders' && model.sinav) {
    parcalar.push(
      el('div', { className: 'ders-sinav' }, [
        el('p', {
          className: 'ders-sinav__baslik',
          text: model.sinav.puan !== null
            ? ceviri('ders.unitExamScore', { n: model.sinav.puan })
            : ceviri('ders.unitExam')
        }),
        model.sinav.acik
          ? el('button', {
              className: 'ders-sinav__gir',
              text: ceviri('ders.unitExamStart'),
              attrs: { type: 'button' },
              dataset: { dersSinavBasla: model.sinav.sinavId }
            })
          : el('p', { className: 'ders-kart__not', text: model.sinav.sebep })
      ])
    );
  }
```

Bu blok `parcalar.push(haftaKartiDom(...))` ile `parcalar.push(gezinme(...))`
arasina girer.

- [ ] **Step 7: `main.js` icine bagla**

Import:

```js
import { uniteSinaviDurumu } from './views/ders.js';
import { sinavEkrani } from './ui/ders-dom.js';
import { sinavBitir, SINAV_GECME } from './engines/ders.js';
```

Modul durumu:

```js
// Sinavda gorulen soru. Quiz'de ilk bos soruya otomatik gidilir ama
// sinavda cocuk istedigi soruya donebilmeli, bu yuzden ayri tutulur.
let dersSinavIndex = 0;
let dersSinavUyari = '';
```

`dersModeli` icinde `tip === 'ders'` donusune sinav durumunu ekle:

```js
  const ilerlemeSinav = state.loadDersIlerleme();
  return {
    tip: 'ders',
    kart: haftaKarti(durum.hafta, KONULAR, unite?.ad ?? '', ilerleme),
    sinav: unite ? uniteSinaviDurumu(TAKVIM, UNITELER, unite.id, ilerlemeSinav, KONULAR) : null,
    dilTr: dil() === 'tr'
  };
```

`renderDers` icinde `dersEkran === 'sinav'` dalini quiz dalindan ayir:

```js
  if (dersEkran === 'sinav' && dersSinav && !dersSinavSonuc) {
    sinavEkrani(kok, {
      soru: dersSinav.sorular[dersSinavIndex],
      secildi: dersSinav.cevaplar[dersSinavIndex],
      index: dersSinavIndex,
      toplam: dersSinav.sorular.length,
      uyari: dersSinavUyari
    }, ceviri);
    return;
  }
```

Bu blok `dersEkran === 'quiz' || dersEkran === 'sinav'` blogundan ONCE
gelmelidir.

Sinav baslatma olayi:

```js
  const sinavBaslaDugme = e.target.closest('[data-ders-sinav-basla]');
  if (sinavBaslaDugme) {
    const uniteId = sinavBaslaDugme.dataset.dersSinavBasla.replace(/^unite-/, '');
    ses.hazirla();
    dersSinav = sinavKur({
      kaynaklar: agirlikHesapla(TAKVIM, uniteId),
      soruSayisi: 20,
      gecmeNotu: SINAV_GECME,
      aninda: false
    }, Math.random);
    dersSinavIndex = 0;
    dersSinavUyari = '';
    dersSinavSonuc = null;
    dersEkran = 'sinav';
    renderDers();
    return;
  }
```

Sinav gezinme ve bitirme:

```js
  const sinavDugme = e.target.closest('[data-ders-sinav]');
  if (sinavDugme) {
    const eylem = sinavDugme.dataset.dersSinav;

    if (eylem === 'kapat') {
      dersSinav = null;
      dersSinavSonuc = null;
      dersEkran = 'hafta';
      render();
      return;
    }
    if (eylem === 'geri') {
      dersSinavIndex = Math.max(0, dersSinavIndex - 1);
      dersSinavUyari = '';
      renderDers();
      return;
    }
    if (eylem === 'ileri') {
      dersSinavIndex = Math.min(dersSinav.sorular.length - 1, dersSinavIndex + 1);
      dersSinavUyari = '';
      renderDers();
      return;
    }

    // 'bitir': bos soru varsa once uyar, ikinci basista bitir.
    const bos = dersSinav.cevaplar.filter((c) => c === null).length;
    if (bos > 0 && !dersSinavUyari) {
      dersSinavUyari = ceviri('ders.unanswered', { n: bos });
      renderDers();
      return;
    }
    dersUniteSinaviBitir();
    return;
  }
```

Sinavda secenek secimi (quiz blogundan ONCE):

```js
  if (secenekDugme && dersEkran === 'sinav') {
    dersSinav = sinavCevapla(dersSinav, dersSinavIndex, Number(secenekDugme.dataset.dersSecenek));
    ses.efekt('tik');   // dogru/yanlis SOYLENMEZ, bu bir olcme
    renderDers();
    return;
  }
```

Bitirme:

```js
function dersUniteSinaviBitir() {
  const p = puanla(dersSinav);
  const model = dersModeli();
  const sinavId = model.sinav?.sinavId ?? 'unite-bilinmeyen';
  const ilerleme = state.loadDersIlerleme();

  const sonuc = sinavBitir(ilerleme.sinavlar, sinavId, {
    puan: p.yuzde,
    tarih: bugununTarihi(),
    tip: 'unite'
  });
  state.saveDersIlerleme({ ...ilerleme, sinavlar: sonuc.sinavlar });

  if (sonuc.kazanilanYildiz > 0) {
    dersYildizVer(sonuc.kazanilanYildiz);
    ses.efekt('kutlama');
  }

  dersSinavSonuc = {
    baslik: ceviri('ders.unitExam'),
    dogru: p.dogru,
    toplam: p.toplam,
    gecti: p.gecti,
    gecmeNotu: dersSinav.gecmeNotu,
    yildiz: sonuc.kazanilanYildiz,
    konular: Object.entries(p.konuBazli).map(([id, k]) => ({
      id,
      ad: KONULAR[id]?.ad?.tr ?? id,
      dogru: k.dogru,
      toplam: k.toplam,
      zayif: k.dogru / k.toplam < 0.6
    }))
  };
  dersSinavUyari = '';
  renderDers();
}
```

- [ ] **Step 8: Tum testleri ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: 1-8. haftalarin quizini gecmeden sinav kilitli ve kac hafta
kaldigini soyluyor. Hepsi gecilince "Ünite sınavına gir" cikiyor. Sinavda
cevaptan sonra cozum GORUNMUYOR, sorular arasinda gezinilebiliyor, bos
soru varken "Sınavı bitir" once uyariyor, ikinci basista bitiriyor.
Gecince 15 yildiz geliyor.

- [ ] **Step 9: Commit**

```bash
git add src/views/ders.js src/ui/ders-dom.js src/main.js src/core/i18n.js tests/unite-sinavi.test.js
git commit -m "feat(ders): unite sinavi

Unitedeki tum haftalarin quizi gecilmeden acilmiyor; konuyu hic
calismadan sinava girmek cocugu bosuna basarisizliga ugratir ve
sinavdan sogutur. Kilitliyken kac hafta kaldigini soyluyor.

Sinavda cevaptan sonra cozum gosterilmiyor ve dogru/yanlis sesi
calmiyor: bu bir olcme araci. Sorular arasinda gezinilebiliyor, bos
soru varsa bitirmeden once bir kez uyariyor.

Sonuc ekrani konu bazli kirilim ve zayif konunun alistirmasina
goturen dugme veriyor; not tek basina nereye gidilecegini soylemez."
```

---

## Task 18: AI aciklama, ebeveyn paneli ve rozetler

Faz 1'i tamamlayan uc kucuk parca. Ucu de kendi basina kucuk oldugu icin
tek gorevde birlesti; hicbiri digeri olmadan anlamli bir teslim etmiyor.

**Files:**
- Modify: `src/engines/ai.js` (`dersIstemi`)
- Modify: `src/engines/rozetler.js` (uc yeni rozet)
- Modify: `src/core/state.js` (`loadIstatistik` yeni sayaclar)
- Modify: `src/views/ders.js` (`kazanimDurumu`)
- Modify: `src/ui/ders-dom.js`, `src/main.js`, `src/core/i18n.js`
- Test: `tests/ders-ai.test.js`, `tests/ders-rozet.test.js`

**Interfaces:**
- Consumes: `sistemIstemi`, `istekGovdesi`, `yanitAyikla` (`engines/ai.js`)
- Produces:
  - `dersIstemi({ konuAd, kazanim, adimMetni, yas })` -> string
  - `ROZETLER` uc yeni kayit: `ogrenci`, `sinavci`, `tamPuan`
  - `rozetSayaclari` yeni alanlar: `dersHaftalari`, `gecilenSinavlar`, `tamPuanQuiz`
  - `kazanimDurumu(takvim, konular, ilerleme)` -> `Array<{ kod, konuAd, haftalar, tamam }>`

- [ ] **Step 1: AI istemi testini yaz**

```js
// tests/ders-ai.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dersIstemi } from '../src/engines/ai.js';

const ORNEK = {
  konuAd: 'Açı Ölçme',
  kazanim: 'Açıları ölçmek için matematiksel araç ve teknolojiden yararlanabilme',
  adimMetni: 'Açıölçerin merkezini açının köşesine koy.',
  yas: 10
};

test('istem konuyu, kazanimi ve takilinan adimi icerir', () => {
  const i = dersIstemi(ORNEK);
  assert.ok(i.includes('Açı Ölçme'));
  assert.ok(i.includes(ORNEK.kazanim));
  assert.ok(i.includes(ORNEK.adimMetni));
  assert.ok(i.includes('10'));
});

test('istem yeni soru uretmeyi yasaklar', () => {
  const i = dersIstemi(ORNEK).toLocaleLowerCase('tr');
  assert.ok(i.includes('soru sorma') || i.includes('yeni soru'), 'soru uretme yasagi yok');
});

test('istem quiz ve sinav cevabi vermeyi yasaklar', () => {
  const i = dersIstemi(ORNEK).toLocaleLowerCase('tr');
  assert.ok(i.includes('cevap'), 'cevap verme yasagi yok');
});

test('istem cocuk adi icermez', () => {
  const i = dersIstemi(ORNEK);
  for (const ad of ['Deha', 'Feride', 'Sertac']) {
    assert.ok(!i.includes(ad), `istemde "${ad}" gecmemeli`);
  }
});

test('eksik alanlarla cagrilinca cokmez', () => {
  assert.equal(typeof dersIstemi({}), 'string');
  assert.ok(dersIstemi({}).length > 50);
});
```

- [ ] **Step 2: Rozet testini yaz**

```js
// tests/ders-rozet.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROZETLER, rozetSayaclari, rozetDurumu } from '../src/engines/rozetler.js';

const ist = (ust = {}) => ({
  okunanKahramanlar: [], matematikDogru: 0, kurulanMakineler: [], satrancGalibiyet: 0,
  dersHaftalari: 0, gecilenSinavlar: 0, tamPuanQuiz: 0, ...ust
});

test('uc yeni ders rozeti tanimlidir', () => {
  const idler = ROZETLER.map((r) => r.id);
  for (const id of ['ogrenci', 'sinavci', 'tamPuan']) {
    assert.ok(idler.includes(id), `${id} rozeti yok`);
  }
});

test('mevcut rozetler korunur', () => {
  const idler = ROZETLER.map((r) => r.id);
  for (const id of ['kasif', 'matematikci', 'muhendis', 'satrancci', 'sanatci', 'seri']) {
    assert.ok(idler.includes(id), `${id} rozeti kaybolmus`);
  }
});

test('ders sayaclari okunur', () => {
  const s = rozetSayaclari(ist({ dersHaftalari: 4, gecilenSinavlar: 2, tamPuanQuiz: 1 }), 0, 0);
  assert.equal(s.ogrenci, 4);
  assert.equal(s.sinavci, 2);
  assert.equal(s.tamPuan, 1);
});

test('eksik ders sayaclari sifir sayilir', () => {
  const s = rozetSayaclari({ okunanKahramanlar: [] }, 0, 0);
  assert.equal(s.ogrenci, 0);
  assert.equal(s.sinavci, 0);
  assert.equal(s.tamPuan, 0);
});

test('hedefe ulasinca rozet kazanilir', () => {
  const d = rozetDurumu(ist({ dersHaftalari: 10 }), 0, 0);
  assert.equal(d.find((r) => r.id === 'ogrenci').kazanildi, true);
});

test('hedefin altinda rozet kazanilmaz', () => {
  const d = rozetDurumu(ist({ dersHaftalari: 9 }), 0, 0);
  assert.equal(d.find((r) => r.id === 'ogrenci').kazanildi, false);
});
```

- [ ] **Step 3: Testleri calistir, kirmizi oldugunu gor**

Run: `node --test tests/ders-ai.test.js tests/ders-rozet.test.js`
Expected: FAIL.

- [ ] **Step 4: `engines/ai.js` icine `dersIstemi` ekle**

Dosyanin sonuna:

```js
/**
 * Ders modulunun "Anlamadim, baska turlu anlat" istemi.
 *
 * Iki siki yasak istemin icinde yazilidir ve bunlar tasarim karari:
 *   1. Yeni soru uretmez. Sorular offline ve dogrulanmis kalmali;
 *      modelin urettigi soru yanlis kurulabilir ve cocuk yanlis ogrenir.
 *   2. Quiz veya sinav cevabi vermez. Aksi halde cocuk anlamak yerine
 *      cevabi sormayi ogrenir.
 *
 * Cocugun adi ISTEME GIRMEZ: bu modul engines/ altindadir ve mimari
 * testi burada kisi adi bulunmasini yasaklar. Ad gerekirse cagiran
 * taraf ekler.
 */
export function dersIstemi({ konuAd, kazanim, adimMetni, yas } = {}) {
  const konu = konuAd ?? 'matematik konusu';
  const hedef = kazanim ?? 'bu konunun temel fikri';
  const adim = adimMetni ?? 'konunun tamamı';
  const yasMetni = Number.isFinite(yas) ? String(yas) : '10';

  return `Sen bir ilkokul matematik öğretmenisin. ${yasMetni} yaşında bir çocuğa anlatıyorsun.

KONU: ${konu}
KAZANIM: ${hedef}
ÇOCUĞUN TAKILDIĞI YER: "${adim}"

GÖREVİN: Bu fikri, yukarıdakinden FARKLI bir yoldan anlat. Günlük hayattan
somut bir örnek ver. En fazla 4 kısa cümle kur. Basit kelimeler kullan.

KESİN YASAKLAR:
- Yeni soru sorma. Çocuğa soru yöneltme, alıştırma verme.
- Quiz veya sınav cevabı verme. Hangi şıkkın doğru olduğunu söyleme.
- Sembol kullanma (derece işareti, dik işareti gibi). "90 derece" diye yaz.
- Uzun anlatma. Dört cümleyi aşma.

Sadece anlat. Başka hiçbir şey yapma.`;
}
```

- [ ] **Step 5: `engines/rozetler.js` guncelle**

`ROZETLER` dizisine uc kayit ekle:

```js
  { id: 'ogrenci', emoji: '📚', hedef: 10 },
  { id: 'sinavci', emoji: '🎓', hedef: 3 },
  { id: 'tamPuan', emoji: '💯', hedef: 5 }
```

`rozetSayaclari` donen nesnesine uc alan ekle:

```js
    ogrenci: Number.isFinite(g.dersHaftalari) ? g.dersHaftalari : 0,
    sinavci: Number.isFinite(g.gecilenSinavlar) ? g.gecilenSinavlar : 0,
    tamPuan: Number.isFinite(g.tamPuanQuiz) ? g.tamPuanQuiz : 0
```

- [ ] **Step 6: `core/state.js` icindeki `loadIstatistik` guncelle**

`bos` nesnesine ve donen nesneye uc alan ekle:

```js
      const bos = {
        okunanKahramanlar: [], matematikDogru: 0, kurulanMakineler: [], satrancGalibiyet: 0,
        dersHaftalari: 0, gecilenSinavlar: 0, tamPuanQuiz: 0
      };
```

```js
        dersHaftalari: Number.isFinite(kayit.dersHaftalari) ? kayit.dersHaftalari : 0,
        gecilenSinavlar: Number.isFinite(kayit.gecilenSinavlar) ? kayit.gecilenSinavlar : 0,
        tamPuanQuiz: Number.isFinite(kayit.tamPuanQuiz) ? kayit.tamPuanQuiz : 0
```

- [ ] **Step 7: `views/ders.js` icine `kazanimDurumu` ekle**

```js
/**
 * Ebeveyn raporu icin kazanim bazli tablo.
 *
 * Cocuk MAT.5.3.1 gibi kodlari HIC gormez; bu tablo yalniz ebeveyn
 * panelinde cikar. Kazanim kodunu veriye gomme karari tam da bunun
 * icindi: MEB raporuna uyan bir ozet cikarabilmek.
 */
export function kazanimDurumu(takvim, konular, ilerleme) {
  const satirlar = new Map();

  for (const hafta of takvim) {
    for (const ders of hafta.dersler) {
      const konu = konular[ders.konu];
      if (!konu) continue;

      const kayit = ilerleme.haftalar?.[String(hafta.hafta)];
      const bitti = kayit?.quiz?.enIyi >= QUIZ_GECME;

      for (const kz of konu.kazanimlar) {
        if (!satirlar.has(kz.kod)) {
          satirlar.set(kz.kod, { kod: kz.kod, konuAd: konu.ad.tr, haftalar: [], tamamlanan: 0 });
        }
        const satir = satirlar.get(kz.kod);
        if (!satir.haftalar.includes(hafta.hafta)) {
          satir.haftalar.push(hafta.hafta);
          if (bitti) satir.tamamlanan += 1;
        }
      }
    }
  }

  return [...satirlar.values()].map((s) => ({
    ...s,
    tamam: s.tamamlanan === s.haftalar.length
  }));
}
```

- [ ] **Step 8: i18n anahtarlari**

TR:

```js
    'ders.explaining': 'Düşünüyorum...',
    'ders.explainError': 'Şu an bağlanamadım. İnternet olmadan da derse devam edebilirsin.',
    'parent.dersSection': 'Matematik dersi',
    'parent.dersWeek': 'Sabit hafta (boş bırakırsan takvimden bulunur)',
    'parent.dersSound': 'Ders sesi açık',
    'parent.dersAutoplay': 'Anlatımı otomatik oku',
    'parent.dersVoiceAnswer': 'Sesli cevap (deneysel)',
    'parent.dersOutcomes': 'Kazanım durumu',
    'parent.dersExams': 'Sınav notları',
    'parent.dersNoExam': 'Henüz sınava girilmedi.',
```

EN:

```js
    'ders.explaining': 'Thinking...',
    'ders.explainError': 'I could not connect. You can keep going without the internet.',
    'parent.dersSection': 'Maths lessons',
    'parent.dersWeek': 'Fixed week (leave blank to use the calendar)',
    'parent.dersSound': 'Lesson sound on',
    'parent.dersAutoplay': 'Read the lesson automatically',
    'parent.dersVoiceAnswer': 'Voice answers (experimental)',
    'parent.dersOutcomes': 'Learning outcomes',
    'parent.dersExams': 'Exam scores',
    'parent.dersNoExam': 'No exam taken yet.',
```

- [ ] **Step 9: Anlatim ekranina "Anlamadim" dugmesi ekle**

`ui/ders-dom.js` icindeki `anlatimEkrani`'nda `dinle` dugmesinin yanina,
yalnizca `model.aiVar` true ise:

```js
  const aiDugme = model.aiVar
    ? el('button', {
        className: 'anlatim__ai',
        text: ceviri('ders.explainAgain'),
        attrs: { type: 'button' },
        dataset: { dersAdim: 'anlat' }
      })
    : null;
```

`mount` cagrisina `aiDugme` ve varsa `model.aiMetin`'i ekle:

```js
  mount(kok, [ust, govde, dinle, aiDugme,
    model.aiMetin ? el('p', { className: 'anlatim__ai-metin', text: model.aiMetin }) : null,
    alt]);
```

`main.js` icinde `anlatimModeli` sonucuna `aiVar` ve `aiMetin` eklenir:

```js
// AI aciklamasi yalniz anahtar varken ve cevrimici iken teklif edilir.
// Yoksa dugme hic gorunmez; calismayan bir dugme cocugu bosuna
// umutlandirir.
const dersAiVar = () => Boolean(state.loadApiKey()) && navigator.onLine;
let dersAiMetin = '';
```

`renderDers` icindeki anlatim dali:

```js
      const m = anlatimModeli(hafta, KONULAR, state.loadDersIlerleme(), dersAdimIndex);
      anlatimEkrani(kok, { ...m, aiVar: dersAiVar(), aiMetin: dersAiMetin }, ceviri);
      return;
```

`data-ders-adim` blogunda `anlat` eylemi:

```js
    if (eylem === 'anlat') {
      dersAiMetin = ceviri('ders.explaining');
      renderDers();
      dersAiSor(model.aktif);
      return;
    }
```

Mevcut sohbet cagrisi kalibini kullanan yardimci:

```js
async function dersAiSor(adim) {
  const konu = KONULAR[adim.konuId];
  const sev = konu.seviyeler.find((s) => s.seviye === adim.seviye);
  const kazanim = konu.kazanimlar[0]?.metin ?? '';

  try {
    const govde = istekGovdesi(
      dersIstemi({ konuAd: konu.ad.tr, kazanim, adimMetni: adim.metin, yas: profile.child?.age }),
      []
    );
    const yanit = await fetch(AI_URL(state.loadApiKey()), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(govde)
    });
    dersAiMetin = yanitAyikla(await yanit.json());
  } catch {
    dersAiMetin = ceviri('ders.explainError');
  }
  renderDers();
}
```

`AI_URL` ve `istekGovdesi` kullanimi icin mevcut `sohbetGonder`
fonksiyonundaki cagriyi ornek al; ayni uc nokta ve ayni anahtar kullanilir.
Yeni bir ag katmani YAZILMAZ.

Ekran degisince AI metnini temizle: `dersEkran` degisen her yerde
`dersAiMetin = '';` ekle.

- [ ] **Step 10: Ebeveyn paneline ders bolumu ekle**

`main.js` icindeki `renderParent` fonksiyonunun sonuna, mevcut bolumlerin
ardina su blogu ekleyen bir cagri koy:

```js
function ebeveynDersBolumu() {
  const ilerleme = state.loadDersIlerleme();
  const kazanimlar = kazanimDurumu(TAKVIM, KONULAR, ilerleme);
  const sinavlar = Object.entries(ilerleme.sinavlar);

  return el('section', { className: 'parent__bolum' }, [
    el('h2', { text: ceviri('parent.dersSection') }),

    el('label', { className: 'parent__satir' }, [
      el('span', { text: ceviri('parent.dersWeek') }),
      el('input', {
        attrs: { type: 'number', inputmode: 'numeric', id: 'ders-sabit-hafta',
                 value: ilerleme.ayar.sabitHafta === null ? '' : String(ilerleme.ayar.sabitHafta) }
      })
    ]),

    ...[['sesAcik', 'parent.dersSound'], ['otomatikOynat', 'parent.dersAutoplay'], ['sesliCevap', 'parent.dersVoiceAnswer']]
      .map(([anahtar, etiket]) =>
        el('label', { className: 'parent__satir' }, [
          el('span', { text: ceviri(etiket) }),
          el('input', {
            attrs: ilerleme.ayar[anahtar]
              ? { type: 'checkbox', checked: 'checked' }
              : { type: 'checkbox' },
            dataset: { dersAyar: anahtar }
          })
        ])
      ),

    el('h3', { text: ceviri('parent.dersOutcomes') }),
    el('div', { className: 'parent__kazanimlar' }, kazanimlar.map((k) =>
      el('p', {
        className: k.tamam ? 'parent__kazanim parent__kazanim--tamam' : 'parent__kazanim',
        text: `${k.kod} - ${k.konuAd}: ${k.tamamlanan} / ${k.haftalar.length} hafta`
      })
    )),

    el('h3', { text: ceviri('parent.dersExams') }),
    sinavlar.length === 0
      ? el('p', { text: ceviri('parent.dersNoExam') })
      : el('div', {}, sinavlar.map(([id, s]) =>
          el('p', { text: `${id}: ${s.puan} (${s.gecti ? 'geçti' : 'geçmedi'})` })
        ))
  ]);
}
```

`value` ve `checked` oznitelikleri `ui/dom.js` beyaz listesinde vardir.

**`sesliCevap` anahtari Faz 1'de hicbir sey yapmaz.** Ayar kaydedilir ama
okuyan kod Faz 6'da yazilacak. Anahtarin simdiden konmasi bilincli: ayar
sekli bir kez oturur ve Faz 6'da `state` semasini degistirmek gerekmez.
Yanina su i18n notunu koy ki ebeveyn bosuna denemesin:

```js
    'parent.dersVoiceAnswerNote': 'Bu özellik henüz hazır değil, ileride açılacak.',
```

EN:

```js
    'parent.dersVoiceAnswerNote': 'Not ready yet; this will be enabled later.',
```

Ve `sesliCevap` satirinin altina:

```js
    el('p', { className: 'parent__not', text: ceviri('parent.dersVoiceAnswerNote') }),
```

Ayar degisikligi olayi:

```js
  const dersAyarKutu = e.target.closest('[data-ders-ayar]');
  if (dersAyarKutu) {
    const ilerleme = state.loadDersIlerleme();
    const anahtar = dersAyarKutu.dataset.dersAyar;
    state.saveDersIlerleme({
      ...ilerleme,
      ayar: { ...ilerleme.ayar, [anahtar]: dersAyarKutu.checked }
    });
    if (anahtar === 'sesAcik') ses.ayarla({ sesAcik: dersAyarKutu.checked });
    render();
    return;
  }
```

Sabit hafta alanini `change` olayinda kaydet:

```js
document.getElementById('view-parent').addEventListener('change', (e) => {
  if (e.target.id !== 'ders-sabit-hafta') return;
  const ham = e.target.value.trim();
  const sayi = ham === '' ? null : Number(ham);
  const ilerleme = state.loadDersIlerleme();
  state.saveDersIlerleme({
    ...ilerleme,
    ayar: { ...ilerleme.ayar, sabitHafta: Number.isInteger(sayi) ? sayi : null }
  });
  dersGorulenHafta = null;
  render();
});
```

- [ ] **Step 11: Rozet sayaclarini besle**

`dersSinavBitir` icinde, quiz gecildiginde:

```js
  if (p.yuzde >= 100) dersIstatistikArtir('tamPuanQuiz');
```

`dersUniteSinaviBitir` icinde, gecildiginde:

```js
  if (p.gecti) dersIstatistikArtir('gecilenSinavlar');
```

Hafta tamamlandiginda (`haftaDurumu(...).bitti` ilk kez true olunca):

```js
function dersHaftaBittiMi(hafta, kayit) {
  const m = dersModeli();
  return m.tip === 'ders' && haftaDurumu(m.kart.adimIdleri, kayit).bitti;
}

function dersIstatistikArtir(alan) {
  const ist = state.loadIstatistik();
  state.saveIstatistik({ ...ist, [alan]: (ist[alan] ?? 0) + 1 });
}
```

`dersSinavBitir` icinde, ilerleme yazildiktan sonra:

```js
  const guncelKayit = haftaKaydi(state.loadDersIlerleme(), hafta.hafta);
  if (dersHaftaBittiMi(hafta, guncelKayit) && !sonuc.kayit.yildizAlinan.includes('hafta')) {
    dersIstatistikArtir('dersHaftalari');
    dersIlerlemeYaz(hafta.hafta, {
      ...guncelKayit,
      yildizAlinan: [...guncelKayit.yildizAlinan, 'hafta']
    });
  }
```

`'hafta'` isareti yildiz vermez, yalnizca rozet sayacinin iki kez
artmasini onler.

- [ ] **Step 12: Testleri calistir ve tarayiciyi dogrula**

Run: `npm test`
Expected: PASS.

Tarayicida: anlatimda "Anlamadım" dugmesi gorunuyor (API anahtari
varsa), basinca AI aciklamasi geliyor ve yeni soru sormuyor. Ebeveyn
panelinde sabit hafta, ses anahtarlari, kazanim tablosu ve sinav notlari
gorunuyor. Rozet ekraninda uc yeni rozet var.

- [ ] **Step 13: Commit**

```bash
git add src/engines/ai.js src/engines/rozetler.js src/core/state.js \
        src/views/ders.js src/ui/ders-dom.js src/main.js src/core/i18n.js \
        tests/ders-ai.test.js tests/ders-rozet.test.js
git commit -m "feat(ders): AI aciklama, ebeveyn paneli ve ders rozetleri

AI istemi iki siki yasak tasiyor ve testi var: yeni soru uretmez,
quiz/sinav cevabi vermez. Sorular offline ve dogrulanmis kalmali;
modelin urettigi soru yanlis kurulabilir ve cocuk yanlis ogrenir.

Dugme yalniz API anahtari varken ve cevrimici iken gorunuyor;
calismayan bir dugme cocugu bosuna umutlandirir.

Ebeveyn paneline kazanim tablosu (MAT kodlari) eklendi. Cocuk bu
kodlari hic gormuyor; kodu veriye gomme karari tam da bunun icindi."
```

---

## Task 19: Ses uretim scripti

Uygulamanin parcasi degildir, elle calistirilir. `tools/make-icons.js`
zaten ayni sekilde calisiyor, emsal var, "build adimi yok" kurali
bozulmuyor.

**Files:**
- Create: `tools/ses-uret.js`
- Create: `sesler/.gitkeep`
- Modify: `README.md` (kullanim notu)

**Interfaces:**
- Consumes: `KONULAR` (Task 12), `adimKimligi` (Task 7)
- Produces: `sesler/<konuId>-<seviye>-<adimId>.m4a`

- [ ] **Step 1: Scripti yaz**

```js
/**
 * Anlatim seslerini uretir. UYGULAMANIN PARCASI DEGILDIR.
 *
 * Kullanim:
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js
 *   GOOGLE_TTS_KEY=... node tools/ses-uret.js temel-cizimler
 *
 * Google Cloud Text-to-Speech Chirp 3 HD, tr-TR. Aylik ilk 1M karakter
 * ucretsiz; bu projenin tamami yaklasik 150k karakter, yani ucretsiz
 * kotaya siginir.
 *
 * Dosya adi konuId-seviye-adimId kalibindan TURETILIR; ui/ses.js ayni
 * kalibi kullanir, boylece iki taraf kendiliginden eslesir.
 *
 * Var olan dosyanin ustune yazmaz. Yeniden uretmek icin once sil.
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KONULAR } from '../src/data/konular/index.js';

const KOK = fileURLToPath(new URL('..', import.meta.url));
const CIKTI = path.join(KOK, 'sesler');

const ANAHTAR = process.env.GOOGLE_TTS_KEY;
const SADECE = process.argv[2] ?? null;

const SES = 'tr-TR-Chirp3-HD-Aoede';
const UC_NOKTA = 'https://texttospeech.googleapis.com/v1/text:synthesize';

if (!ANAHTAR) {
  console.error('GOOGLE_TTS_KEY ortam degiskeni gerekli.');
  console.error('Ornek: GOOGLE_TTS_KEY=xxx node tools/ses-uret.js');
  process.exit(1);
}

function adimlariTopla() {
  const isler = [];
  for (const [konuId, konu] of Object.entries(KONULAR)) {
    if (SADECE && konuId !== SADECE) continue;
    for (const sev of konu.seviyeler) {
      for (const adim of sev.anlatim) {
        isler.push({
          kimlik: `${konuId}-${sev.seviye}-${adim.id}`,
          metin: adim.metin
        });
      }
    }
  }
  return isler;
}

async function seslendir(metin) {
  const yanit = await fetch(`${UC_NOKTA}?key=${ANAHTAR}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: metin },
      voice: { languageCode: 'tr-TR', name: SES },
      // 32 kbps mono AAC: konusma icin yeterli, hafta basina ~1.3 MB.
      audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000, speakingRate: 0.95 }
    })
  });

  if (!yanit.ok) {
    throw new Error(`TTS ${yanit.status}: ${await yanit.text()}`);
  }
  const govde = await yanit.json();
  return Buffer.from(govde.audioContent, 'base64');
}

async function main() {
  if (!existsSync(CIKTI)) mkdirSync(CIKTI, { recursive: true });

  const isler = adimlariTopla();
  console.log(`${isler.length} adim bulundu.`);

  let uretilen = 0;
  let atlanan = 0;
  let karakter = 0;

  for (const is of isler) {
    const hedef = path.join(CIKTI, `${is.kimlik}.m4a`);
    if (existsSync(hedef)) {
      atlanan++;
      continue;
    }

    try {
      const ses = await seslendir(is.metin);
      writeFileSync(hedef, ses);
      uretilen++;
      karakter += is.metin.length;
      console.log(`  ${is.kimlik} (${is.metin.length} karakter)`);
    } catch (hata) {
      console.error(`  ${is.kimlik} BASARISIZ: ${hata.message}`);
    }
  }

  console.log(`\nUretilen: ${uretilen}, atlanan: ${atlanan}, karakter: ${karakter}`);
  console.log('Var olan dosyanin ustune yazilmaz; yeniden uretmek icin once sil.');
}

main();
```

Not: `audioEncoding: 'MP3'` kullaniliyor ama dosya `.m4a` uzantisiyla
yaziliyor. Bu tutarsizdir ve duzeltilmelidir. Iki secenekten birini uygula:

**Secenek A (onerilen):** Uzantiyi `.mp3` yap. `ui/ses.js` icindeki
`${sesKok}${id}.m4a` ifadesini `${sesKok}${id}.mp3` olarak degistir ve
`tests/ses.test.js` icindeki beklentiyi de guncelle. MP3 iOS Safari'de
sorunsuz calar ve Google TTS dogrudan MP3 veriyor, donusturme gerekmez.

**Secenek B:** `audioEncoding: 'LINEAR16'` alip `ffmpeg` ile AAC'ye
cevir. Daha kucuk dosya verir ama repoya `ffmpeg` bagimliligi getirir.

**Secenek A uygulanacaktir.** Bagimliliksizlik bu projenin temel kurali;
1.3 MB yerine 1.8 MB'lik hafta dosyasi bu kurali bozmaya degmez.

- [ ] **Step 2: Secenek A'yi uygula**

1. `tools/ses-uret.js` icinde `${is.kimlik}.m4a` -> `${is.kimlik}.mp3`
2. `src/ui/ses.js` icinde `${sesKok}${id}.m4a` -> `${sesKok}${id}.mp3`
3. `tests/ses.test.js` icinde `'sesler/temel-cizimler-1-a1.m4a'` ->
   `'sesler/temel-cizimler-1-a1.mp3'`

- [ ] **Step 3: Testi calistir**

Run: `node --test tests/ses.test.js`
Expected: PASS.

- [ ] **Step 4: `sesler/` dizinini olustur**

```bash
mkdir -p sesler
printf '# Uretilmis anlatim sesleri. tools/ses-uret.js ile uretilir.\n' > sesler/.gitkeep
```

`sesler/` dizini `sw.js` icindeki ASSETS listesine **girmez**; runtime
cache'e birakilir.

- [ ] **Step 5: `README.md` icine kullanim notu ekle**

"Gelistirme" bolumunun sonuna:

```markdown
### Anlatim seslerini uretme

Ders anlatimlari onceden seslendirilip `sesler/` altina konur. Ses dosyasi
yoksa uygulama cihazin kendi TTS'ine duser, yani ses uretimi zorunlu
degildir.

```bash
GOOGLE_TTS_KEY=xxx node tools/ses-uret.js                  # hepsi
GOOGLE_TTS_KEY=xxx node tools/ses-uret.js temel-cizimler   # tek konu
```

Google Cloud Text-to-Speech Chirp 3 HD kullanilir (tr-TR). Aylik ilk 1M
karakter ucretsizdir; bu projenin tamami yaklasik 150k karakterdir.

Var olan dosyanin ustune yazilmaz. Bir anlatim metnini degistirdiysen o
dosyayi silip scripti tekrar calistir.
```

- [ ] **Step 6: Elle dogrula**

Anahtar olmadan calistir ve anlamli hata verdigini gor:

```bash
node tools/ses-uret.js
```

Expected: `GOOGLE_TTS_KEY ortam degiskeni gerekli.` ve cikis kodu 1.

Anahtar varsa tek konuyla dene, `sesler/temel-cizimler-1-a1.mp3`
olustugunu ve tarayicida anlatim acildiginda cihaz TTS'i yerine bu
dosyanin calindigini dogrula.

- [ ] **Step 7: Commit**

```bash
git add tools/ses-uret.js sesler/.gitkeep src/ui/ses.js tests/ses.test.js README.md
git commit -m "feat(ders): anlatim sesi uretim scripti

Chirp 3 HD ile sesler/<konu>-<seviye>-<adim>.mp3 uretir. Dosya adi
kalibi ui/ses.js ile ayni, iki taraf kendiliginden eslesiyor.

Uzanti m4a yerine mp3: Google TTS dogrudan MP3 veriyor ve AAC'ye
cevirmek repoya ffmpeg bagimliligi getirirdi. Bagimliliksizlik bu
projenin temel kurali; hafta basina 0.5 MB fark bunu bozmaya degmez.

Var olan dosyanin ustune yazmaz. Ses uretimi zorunlu degil: dosya
yoksa uygulama cihaz TTS'ine duser."
```

**FAZ 1 BITTI.** Cocuk 1-8. haftalari sesli anlatim, etkilesimli widget,
sinirsiz alistirma, hafta quizi ve unite sinaviyla calisabilir.

---

## Faz 1 sonrasi dogrulama listesi

Faz 1'i teslim etmeden once bastan sona su akisi bir kez elle gec:

1. Ebeveyn panelinden sabit haftayi 1 yap
2. Ders sekmesi 1. haftayi, "Temel Geometrik Çizimler" konusunu gosteriyor
3. "Derse başla" anlatimi aciyor, ses okuyor, 5 adim ilerliyor
4. Anlatim bitince 4 yildiz geliyor ve "Kendin dene" aciliyor
5. Tuvale cizim yapilip "Kontrol et" ile 3 yildiz aliniyor
6. Alistirmada 10 dogru yapiliyor, yildiz GELMIYOR, rozet yesil oluyor
7. Quiz 10 soru soruyor, gecince 6 yildiz geliyor
8. Ayni quize tekrar girip 100 alinca yildiz GELMIYOR, en iyi puan 100 oluyor
9. 2-8. haftalar icin 3-8 tekrarlanip unite sinavi aciliyor
10. Unite sinavi 20 soru soruyor, cozum gostermiyor, gecince 15 yildiz veriyor
11. Rutin sekmesinde toplam yildiz dogru artmis
12. Ucak moduna al: ders, alistirma ve quiz calismaya devam ediyor,
    yalniz "Anlamadım" dugmesi kayboluyor
13. Uygulamayi kapatip ac: tum ilerleme duruyor
14. `npm test` tamamen yesil

---

## Task 20: Ders modulu stilleri (plan bosluğu, yurutme sirasinda eklendi)

Bu gorev plan yazilirken ATLANMIS bir bosluktur. Plan veri katmanini,
motorlari, ekranlari, testleri, sesi, ureticileri ve icerigi ayrintisiyla
tarif ediyor ama **tek satir CSS tarif etmiyor**. Task 13 sirasinda
dogrulandi: `styles-v2.css` ve `styles.css` icinde `ders-kart`,
`ders-asama`, `ders-gezinme`, `anlatim__*`, `etkilesim__*`, `soru__*`,
`sonuc__*`, `ornek__*` siniflarinin HICBIRI yok. Modul dogru calisiyor ama
bicimsiz goruniyor.

**Neden tek gorevde ve sonda:** stili alti goreve bolmek tutarsiz bir
gorunum ve tekrar is demek. Tum ekranlar var olduktan sonra tek gecisde
stillemek hem tutarli bir dil verir hem tek incelemeye konu olur.

**Files:**
- Modify: `styles-v2.css`

**Kapsanacak ekranlar ve sinif aileleri:**
- Hafta karti: `ders-kart`, `ders-kart__ust/etiket/hafta/unite/tarih/konular/
  asamalar/ilerleme/basla/not`, `ders-konu`, `ders-asama`, `ders-gezinme`
- Anlatim: `anlatim__ust/kapat/sayac/govde/konu/metin/dinle/alt/gez/ai/ai-metin`
- Ornek: `ornek__konu/soru/adimlar/adim/cevap`
- Etkilesim: `etkilesim__tuval/gorev/mesaj/alt`
- Soru ve sinav: `soru__baslik/metin/secenekler/secenek/cozum/geri/cozum-adim`,
  `sinav__not/uyari`
- Sonuc: `sonuc__baslik/puan/durum/kirilim/konu/konu-ad/calis/alt`
- Ebeveyn eki: `parent__bolum/satir/kazanimlar/kazanim/not`

**Kurallar:**
- Mevcut v2 tasarim dilini izle: `styles-v2.css` icindeki `games-card`,
  `drill__`, `v2-modal__` kaliplarina bak ve ayni degisken, renk, kose
  yaricapi ve boslugu kullan. Yeni bir tema icat etme.
- iPhone 12 hedef cihaz: dokunma hedefleri en az 44 piksel, yatay tasma yok,
  guvenli alan (safe area) dolgusu mevcut kalibi izler.
- Anlatim metni buyuk ve seyrek: cocuk hem okuyup hem dinleyecek.
- Dogru/yanlis secenek renkleri yalnizca renge dayanmasin; ikon ya da
  kalinlik da degissin.
- Yeni CSS degiskeni gerekiyorsa `:root` icindeki mevcut kumeye ekle.

**Dogrulama:** tarayicida her ekranin ekran goruntusu alinir ve mevcut
sekmelerle yan yana karsilastirilir. Bu gorev testle degil GOZLE dogrulanir.
