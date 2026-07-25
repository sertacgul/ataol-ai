# Faz 1G: Satranç Taş Öğretme Modu

> **Ajan işçiler için:** GEREKLİ ALT BECERİ: superpowers:subagent-driven-development.

**Amaç:** Satrancı hiç bilmeyen bir çocuğa altı taşın hareketini, oyun oynatmadan, tek tek öğretmek.

**Mimari:** `engines/chess.js` saf hareket kuralları, `engines/chesspuzzle.js` üretilmiş sorular, `views/chess.js` ders ilerleyişi. Var olan kurallar geçerli: motorlar saat ve rastgelelik okumaz, `innerHTML` yok, bağımlılık yönü `views → engines → core`.

**Tech Stack:** Vanilla ES modules, sıfır bağımlılık, Node 22 test runner.

---

## Tasarım kararları ve gerekçeleri

**Satranç oynatmıyoruz.** Oyun oynamak altı kuralı, rakibin planını ve kendi planını aynı anda tutmayı ister. Deha taşları hiç bilmiyor. Bu modda ekranda tek taş vardır ve tek soru sorulur: bu taş nereye gidebilir.

**Taş sırası sistem mantığına göre:** kale, fil, vezir, şah, at, piyon. Vezir üçüncü sıradadır çünkü kale ile filin *birleşimidir*; çocuk yeni bir kural değil, bildiği iki kuralın toplandığını görür. Piyon sondadır çünkü tek istisnalı taştır (ilerler ama çapraz alır); istisna, kural oturduktan sonra öğrenilir.

**Süre ölçülmez.** Bu modülde hız hedefi yoktur. Amaç kuralı anlamak; matematik alıştırmasındaki gibi otomatikleşme değil. `drill.js`'in aksine eşik yoktur.

**Yanlış kare cezalandırılmaz.** Çocuk yanlış kareye dokununca kare kırmızı olur ve doğru cevap gösterilir, soru kaybedilmez. Kural öğrenmede deneme, hata değildir.

**Üç ders tipi, her taş için:**
- `serbest`: boş tahtada taş nereye gidebilir (tüm kareler işaretlenir)
- `engelli`: yolda başka taşlar var (kalenin önündeki taş yolu keser; at kesilmez, bunu görmek atın asıl dersidir)
- `alma`: tek hamlede hedef taşı al

**Leitner kullanılır.** Her taş bir kart değil, her `taş+ders tipi` çifti bir karttır (6 × 3 = 18 kart). Böylece "at serbest" öğrenilmişken "at engelli" hâlâ tekrar edilebilir.

**Şah tehdidi, mat, rok, geçerken alma yok.** Bunlar oyun kurallarıdır, taş kuralları değil. Kapsam dışı.

---

## Dosya yapısı

- Oluştur: `src/engines/chess.js` — taş hareket kuralları, saf
- Oluştur: `src/engines/chesspuzzle.js` — soru üretimi, rng enjekte
- Oluştur: `src/views/chess.js` — ders ilerleyişi görünüm modeli
- Oluştur: `tests/chess.test.js`, `tests/chesspuzzle.test.js`, `tests/chess-view.test.js`
- Değiştir: `src/views/games.js` — GAMES listesine satranç eklenir
- Değiştir: `src/main.js`, `v2.html`, `styles.css` — ekran

---

## Görev 1: Hareket motoru

**Dosyalar:** Oluştur `src/engines/chess.js`, Test `tests/chess.test.js`

Tahta gösterimi: `{ [kare]: tas }` düz nesne, kare `'e4'` biçiminde, taş `'K'|'F'|'V'|'S'|'A'|'P'` (kale, fil, vezir, şah, at, piyon). Renk yok; bu modda tek taş ve hedefler var, hedefler her zaman "alınabilir". JSON güvenli, Set/Map dönmez.

- [ ] **Adım 1: Başarısız testi yaz**

```js
import test from 'node:test';
import assert from 'node:assert';
import { hedefKareler, PIECES } from '../src/engines/chess.js';

test('kale bos tahtada duz gider, capraz gitmez', () => {
  const h = hedefKareler('K', 'd4', {});
  assert.ok(h.includes('d8') && h.includes('a4') && h.includes('h4') && h.includes('d1'));
  assert.ok(!h.includes('e5'), 'kale capraz gidemez');
  assert.strictEqual(h.length, 14);
});

test('kalenin onundeki tas yolu keser, ama o tas alinabilir', () => {
  const h = hedefKareler('K', 'd4', { d6: 'P' });
  assert.ok(h.includes('d5'));
  assert.ok(h.includes('d6'), 'engel karesi alinabilir');
  assert.ok(!h.includes('d7'), 'engelin arkasi gorulmez');
});

test('at engel tanimaz', () => {
  const cevrili = { d3: 'P', d5: 'P', c4: 'P', e4: 'P', c3: 'P', c5: 'P', e3: 'P', e5: 'P' };
  const h = hedefKareler('A', 'd4', cevrili);
  assert.strictEqual(h.length, 8, 'at etrafi kapali olsa da sekiz kareye gider');
  assert.ok(h.includes('e6') && h.includes('b5'));
});

test('at kenarda daha az kareye gider', () => {
  assert.strictEqual(hedefKareler('A', 'a1', {}).length, 2);
});

test('piyon ilerler ama ilerideki tasi ALMAZ', () => {
  const h = hedefKareler('P', 'd4', { d5: 'K' });
  assert.ok(!h.includes('d5'), 'piyon onundeki tasi alamaz, bu piyonun istisnasi');
});

test('piyon caprazdaki tasi alir, bos caprazi almaz', () => {
  const h = hedefKareler('P', 'd4', { e5: 'K' });
  assert.ok(h.includes('e5'), 'capraz tas alinir');
  assert.ok(!h.includes('c5'), 'bos capraza gidilmez');
  assert.ok(h.includes('d5'), 'onu bos, ilerler');
});

test('vezir tam olarak kale ile filin toplamidir', () => {
  const tahta = { b2: 'P', f6: 'P', d7: 'P' };
  const v = hedefKareler('V', 'd4', tahta).sort();
  const kf = [...new Set([...hedefKareler('K', 'd4', tahta), ...hedefKareler('F', 'd4', tahta)])].sort();
  assert.deepStrictEqual(v, kf);
});

test('sah bir kare, sekiz yon', () => {
  assert.strictEqual(hedefKareler('S', 'd4', {}).length, 8);
  assert.strictEqual(hedefKareler('S', 'a1', {}).length, 3);
});

test('PIECES ogretim sirasindadir', () => {
  assert.deepStrictEqual(PIECES.map((p) => p.kod), ['K', 'F', 'V', 'S', 'A', 'P']);
  assert.ok(PIECES.every((p) => p.ad && p.anlat));
});
```

- [ ] **Adım 2: Testi çalıştır, başarısız olduğunu gör**

`node --test tests/chess.test.js` → FAIL

- [ ] **Adım 3: Motoru yaz**

Yön tabanlı üretim. Kale/fil/vezir "kayan" taşlar: yön boyunca ilerle, boşsa ekle ve devam et, doluysa ekle ve dur. At/şah "sıçrayan": tek adım, dolu olsun olmasın ekle. Piyon ayrı: ileri yalnız boşsa, çapraz yalnız doluysa. Piyon her zaman yukarı (beyaz) gider, bu modda renk yok.

`PIECES` her taş için `{ kod, ad, anlat }` tutar; `anlat` çocuğa gösterilecek tek cümlelik kuraldır ("Kale düz gider. Yukarı, aşağı, sağa, sola.").

- [ ] **Adım 4: Testler geçsin**

- [ ] **Adım 5: Commit**

---

## Görev 2: Soru üretici

**Dosyalar:** Oluştur `src/engines/chesspuzzle.js`, Test `tests/chesspuzzle.test.js`

`soruUret(tasKod, dersTipi, rng)` → `{ tas, kare, tahta, dogruKareler, tip, anlat }`

- [ ] **Adım 1: Testi yaz**

```js
import test from 'node:test';
import assert from 'node:assert';
import { soruUret, DERSLER } from '../src/engines/chesspuzzle.js';
import { hedefKareler } from '../src/engines/chess.js';

const sabitRng = (deger) => () => deger;

test('serbest derste tahta bostur ve cevap motorla ayni', () => {
  const s = soruUret('K', 'serbest', sabitRng(0.5));
  assert.deepStrictEqual(s.tahta, {});
  assert.deepStrictEqual(s.dogruKareler.sort(), hedefKareler('K', s.kare, {}).sort());
});

test('engelli derste gercekten engel vardir ve yol kisalir', () => {
  let engelliBulundu = false;
  for (let i = 0; i < 200; i++) {
    const rng = () => (i * 7919 % 1000) / 1000;
    const s = soruUret('K', 'engelli', rng);
    if (Object.keys(s.tahta).length === 0) continue;
    engelliBulundu = true;
    assert.ok(s.dogruKareler.length < hedefKareler('K', s.kare, {}).length,
      'engel varsa gidilebilir kare sayisi azalmali');
  }
  assert.ok(engelliBulundu, 'test bosa dondu: hic engelli soru uretilmedi');
});

test('alma dersinde tek dogru vardir ve o karede tas vardir', () => {
  for (let i = 1; i <= 50; i++) {
    const s = soruUret('A', 'alma', () => (i * 37 % 100) / 100);
    assert.strictEqual(s.dogruKareler.length, 1, 'alma dersinde tek cevap olmali');
    assert.ok(s.tahta[s.dogruKareler[0]], 'dogru karede alinacak tas olmali');
  }
});

test('hicbir soru cevapsiz kalmaz', () => {
  for (const p of ['K', 'F', 'V', 'S', 'A', 'P']) {
    for (const d of DERSLER) {
      for (let i = 1; i <= 60; i++) {
        const s = soruUret(p, d, () => (i * 31 % 100) / 100);
        assert.ok(s.dogruKareler.length > 0, `${p}/${d} cevapsiz soru uretti`);
      }
    }
  }
});

test('taslar ust uste binmez', () => {
  for (let i = 1; i <= 100; i++) {
    const s = soruUret('V', 'engelli', () => (i * 53 % 100) / 100);
    assert.ok(!s.tahta[s.kare], 'tasin kendi karesinde baska tas olamaz');
  }
});
```

- [ ] **Adım 2: Başarısız olduğunu gör**

- [ ] **Adım 3: Üreticiyi yaz**

Üretim döngüsü: taşı rastgele kareye koy, ders tipine göre tahtayı doldur, `hedefKareler` ile cevabı hesapla, cevap boşsa yeniden dene (en fazla 40 deneme, sonra bilinen güvenli kurulum). `alma` dersinde önce taşı koy, hedeflerini hesapla, hedeflerden birini seç ve oraya alınacak taşı koy; böylece cevap tanım gereği vardır.

- [ ] **Adım 4-5: Testler geçsin, commit**

---

## Görev 3: Ders ilerleyişi

**Dosyalar:** Oluştur `src/views/chess.js`, Test `tests/chess-view.test.js`

18 kart (6 taş × 3 ders), `engines/leitner.js` kutularıyla. Yeni taş, önceki taşın üç dersi de en az bir kez doğru yapılmadan açılmaz; sıra atlanmaz.

- [ ] **Adım 1: Testi yaz**

```js
test('baslangicta yalniz kale acik', () => {
  const d = chessViewModel(bosDurum());
  assert.deepStrictEqual(d.acikTaslar, ['K']);
});

test('kale bitmeden fil acilmaz', () => {
  let s = bosDurum();
  s = cevapla(s, 'K', 'serbest', true);
  s = cevapla(s, 'K', 'engelli', true);
  assert.deepStrictEqual(chessViewModel(s).acikTaslar, ['K'], 'iki ders yetmez');
  s = cevapla(s, 'K', 'alma', true);
  assert.deepStrictEqual(chessViewModel(s).acikTaslar, ['K', 'F']);
});

test('yanlis cevap ilerlemeyi geri almaz, kutuyu dusurur', () => {
  let s = cevapla(bosDurum(), 'K', 'serbest', true);
  const once = chessViewModel(s).acikTaslar.length;
  s = cevapla(s, 'K', 'serbest', false);
  assert.strictEqual(chessViewModel(s).acikTaslar.length, once, 'acik tas geri alinmaz');
});
```

- [ ] **Adım 2-5: TDD döngüsü, commit**

---

## Görev 4: Ekran ve tarayıcı doğrulaması

**Dosyalar:** Değiştir `src/views/games.js` (GAMES listesi), `src/main.js`, `v2.html`, `styles.css`

8×8 tahta, 390px genişlikte yatay kaydırma olmadan sığmalı (Amiral Battı'daki ölçüm yöntemi: `scrollWidth === clientWidth`). Taşlar Unicode satranç karakterleriyle (♜♝♛♚♞♟), resim dosyası yok.

Doğru kare yeşil, yanlış kare kırmızı ve ardından doğru cevap gösterilir. Taşın kuralı (`anlat`) soru üstünde her zaman görünür; çocuk kuralı ezberlemek zorunda kalmaz, okuyarak uygular.

**Renk uyarısı:** yeni ekranda `--card-bg` / `--card-border` değişkenlerini kullanma. Bunlar beyaza yakın; beyaz zeminde görünmez düğme üretiyorlar. Daha önce iki kez bu yüzden ekran boş göründü. Kendi belirgin renklerini tanımla ve ekran görüntüsüyle doğrula.

- [ ] Ekranı yaz
- [ ] Tarayıcıda doğrula: tahta 390px'e sığıyor; taş simgeleri okunuyor; doğru/yanlış geri bildirimi ayırt ediliyor; kural metni görünüyor; kale bitmeden fil kilitli; sayfa yenilenince ilerleme korunuyor; konsol hatası yok
- [ ] Ekran görüntüsü al, commit
