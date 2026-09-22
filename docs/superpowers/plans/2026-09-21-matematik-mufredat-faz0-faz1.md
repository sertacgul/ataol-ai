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
