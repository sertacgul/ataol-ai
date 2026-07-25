# Faz 1I-1: v1 → v2 Veri Taşıma

> **Ajan işçiler için:** GEREKLİ ALT BECERİ: superpowers:subagent-driven-development.

**Amaç:** Deha'nın v1'de biriktirdiği emeği v2'ye taşımak, yeteneğini ise taşımamak.

**Mimari:** Tek yönlü, tek seferlik, saf bir dönüştürücü: `engines/migrate.js`. v1 verisini okur, v2 verisi döndürür. Kendisi hiçbir şey yazmaz, silmez.

---

## Taşıma kararı ve gerekçeleri

**Emek taşınır, yetenek taşınmaz.** Bu tek cümle bütün listeyi belirliyor.

| v1 anahtarı | Taşınır mı | Neden |
|---|---|---|
| `ataol_stars` | **Evet** | Harcanmış emeğin karşılığı. Silmek sözünden dönmektir. |
| `ataol_unlocked_badges` | **Evet** | Kazanılmış. |
| `ataol_read_heroes` | **Evet** | Aynı içeriği tekrar göstermemek için. |
| `ataol_solved_riddles` | **Evet** | Aynı sebep. |
| `ataol_api_key` | **Evet** | Taşınmazsa sohbet çalışmaz. |
| `ataol_completed_math_tables` | **HAYIR** | En önemli karar. Bu kayıt bir testi bir kez geçtiğini gösterir, o çarpımı *bildiğini* değil. v2'ye "öğrenildi" diye aktarılırsa o çarpımlar Leitner döngüsünden çıkar ve çocuk hiç bilmediği şeyi bir daha görmez. Matematikte geri kalmasının sebebi tam olarak budur. Yetenek devralınmaz, yeniden ölçülür. |
| `ataol_messages` | **HAYIR** | İçinde düzeltilmiş "annen Feriş" ifadesi olabilir. Eski konuşmaları taşımak o yanlışı geleceğe taşır. Sohbet geçmişinin çocuk için ödül değeri yoktur; kaybını fark etmez. Ailesi hakkında yanlış bir cümleyi yeniden okuması ise bedellidir. |
| `ataol_correct_answers` | **HAYIR** | Salt sayaç, v2'de karşılığı yok. |
| `ataol_week` | **HAYIR** | v2'nin kendi gün/hafta mantığı var. |

**Yıldızlar nereye yazılır.** v2'de yıldız `days` içindeki günlerden toplanır (`totalStars`). v1'in yıldızı belli bir güne ait değildir. Sahte bir gün kaydı uydurmak yerine ayrı bir `legacyStars` alanı tutulur ve `totalStars` ona ekler. Böylece geçmiş gün raporları bozulmaz ve yıldızın nereden geldiği belli olur.

**Taşıma yıkıcı değildir.** v1 anahtarları SİLİNMEZ. v1 çalışmaya devam eder. Taşıma bir kez yapıldığında `ataol2:migrated` işareti konur ve bir daha yapılmaz; yoksa v1'de yıldız kazanmayı sürdüren bir çocuk her açılışta yıldızını ikinci kez alır.

**Taşınacak veri yoksa sessiz kalınır.** Uygulamayı ilk kez kuran bir aile için (App Store sürümü) taşıma diye bir şey yoktur; ekranda taşımadan söz eden hiçbir metin çıkmaz.

---

## Görev 1: Taşıma motoru

**Dosyalar:** Oluştur `src/engines/migrate.js`, Test `tests/migrate.test.js`

`v1Oku(getRaw)` → v1 verisini düz nesneye çevirir. `getRaw(anahtar)` enjekte edilir; motor `localStorage` OKUMAZ (mimari testi bunu zorluyor).

`tasimaPlani(v1)` → `{ legacyStars, badges, readHeroes, solvedRiddles, apiKey, tasinacakVarMi }`

- [ ] **Adım 1: Testleri yaz**

```js
import test from 'node:test';
import assert from 'node:assert';
import { v1Oku, tasimaPlani } from '../src/engines/migrate.js';

const sahteDepo = (veri) => (anahtar) => (anahtar in veri ? veri[anahtar] : null);

test('yildiz ve rozet tasinir', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_stars: '42',
    ataol_unlocked_badges: '["ilk_adim","matematikci"]'
  }));
  const p = tasimaPlani(v1);
  assert.strictEqual(p.legacyStars, 42);
  assert.deepStrictEqual(p.badges, ['ilk_adim', 'matematikci']);
  assert.strictEqual(p.tasinacakVarMi, true);
});

test('carpim tablosu ilerlemesi TASINMAZ', () => {
  const v1 = v1Oku(sahteDepo({ ataol_completed_math_tables: '[2,3,4,5]' }));
  const p = tasimaPlani(v1);
  assert.ok(!('completedMathTables' in p), 'yetenek devralinmaz, yeniden olculur');
  assert.ok(!JSON.stringify(p).includes('2,3,4,5'), 'tablo verisi plana hicbir sekilde sizmamali');
});

test('sohbet gecmisi TASINMAZ', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_messages: '[{"role":"user","text":"annen Feris"}]'
  }));
  const p = tasimaPlani(v1);
  assert.ok(!JSON.stringify(p).toLowerCase().includes('feris'),
    'eski sohbet ve icindeki aile hatasi gelecege tasinmamali');
});

test('bos depoda tasinacak bir sey yoktur', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({})));
  assert.strictEqual(p.tasinacakVarMi, false);
  assert.strictEqual(p.legacyStars, 0);
});

test('sadece sifir yildiz varsa tasinacak sey yok sayilir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_stars: '0' })));
  assert.strictEqual(p.tasinacakVarMi, false, 'sifir yildiz tasima ekrani acmamali');
});

test('bozuk JSON cokertmez', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_unlocked_badges: '{bozuk',
    ataol_read_heroes: 'null',
    ataol_stars: 'abc'
  }));
  const p = tasimaPlani(v1);
  assert.strictEqual(p.legacyStars, 0);
  assert.deepStrictEqual(p.badges, []);
  assert.deepStrictEqual(p.readHeroes, []);
});

test('plan JSON guvenlidir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_stars: '5' })));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(p)), p);
});
```

- [ ] **Adım 2: Başarısız olduğunu gör**
- [ ] **Adım 3: Motoru yaz** — her alanda güvenli JSON çözme, sayı çözümlemede `Number.isFinite` kontrolü
- [ ] **Adım 4: Testler geçsin**
- [ ] **Adım 5: Commit**

---

## Görev 2: Durum katmanına bağlama

**Dosyalar:** Değiştir `src/core/state.js`, Test `tests/state.test.js`

- `legacyStars` alanı `storage`'da tutulur, `totalStars()` ona ekler
- `migrateOnce(getRaw)` yalnız `migrated` işareti yoksa çalışır, çalıştıktan sonra işareti koyar
- v1 anahtarları SİLİNMEZ

- [ ] Test: `totalStars` legacy yıldızı ekler
- [ ] Test: `migrateOnce` iki kez çağrılınca yıldız İKİ KEZ EKLENMEZ (bu testin gerçekten iki kez çağırdığını doğrula)
- [ ] Test: taşımadan sonra v1 anahtarları hâlâ yerinde
- [ ] Commit

---

## Görev 3: Ekran

**Dosyalar:** Değiştir `src/main.js`, `v2.html`, `styles-v2.css`

Taşınacak veri varsa ilk açılışta tek seferlik bir karşılama: "Eski uygulamadaki 42 yıldızın burada. Hepsi duruyor."

Taşınacak veri yoksa hiçbir şey gösterilmez.

**Renk uyarısı:** `--card-bg` / `--card-border` kullanma, beyaz zeminde görünmez. `[hidden]` için açık `display: none` kuralı yaz.

- [ ] Ekranı yaz, tarayıcıda doğrula, ekran görüntüsü al
- [ ] Doğrula: taşınacak veri yokken ekran ÇIKMIYOR
- [ ] Commit
