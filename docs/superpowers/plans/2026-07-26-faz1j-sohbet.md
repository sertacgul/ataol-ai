# Faz 1J: Sohbet modülünün v2'ye taşınması

> **Ajan işçiler için:** GEREKLİ ALT BECERİ: superpowers:subagent-driven-development.

**Amaç:** v1'de olan ve v2'ye geçişte kaybedilen sohbeti geri getirmek.

**Aciliyet:** Bu bir gerileme. Deha v1'de bu özelliği kullanıyordu, PWA ile v2'ye geçince kaybetti. Yeni özellik değil, iade.

**Mimari:** İstem kurma ve yanıt temizleme SAF (`engines/ai.js`, test edilebilir). Ağ çağrısı `main.js`'te. Motorlar ağa çıkmaz.

---

## Korunacaklar (v1'den birebir)

**Kimlik kuralı.** "Seni kim geliştirdi?" sorusuna daima "ATAOL AI Techs tarafından geliştirildim." Google, Gemini, OpenAI, ChatGPT gibi hiçbir marka adı geçmez. Anahtardan söz ederken "ATAOL API Anahtarı" denir.

**Biçim kuralı.** Yanıt düz metin. Markdown yok: `*`, `**`, `#`, `_`, backtick, tire ile madde işareti yok. Bu işaretler ekranda olduğu gibi görünüp çocuğu şaşırtıyor. Vurgu gerekirse büyük harf veya emoji.

**`duzMetin()` süzgeci.** İstem yetmez, model yine de markdown üretebilir. Yanıt gösterilmeden önce süzülür. v1'deki hâli birebir taşınır; çarpma işaretini bozmadığı için `(^|\s)\*([^*\n]+)\*` kalıbı aynen korunur.

**Aile gerçeği.** Feride Mama babanın eşidir, Deha'nın annesi DEĞİLDİR. "annen", "annecigin", "Feride maman" asla kullanılmaz, yalnız "Feride Mama". Deha kendisi "annem" derse düzeltilmez, tartışılmaz. Deha kendi annesinden söz ederse şefkatle dinlenir, kıyaslama yapılmaz, konu Feride Mama'ya çevrilmez.

**Kısalık.** En fazla 1-2 cümle. Uzun paragraf dikkatini dağıtıyor.

**Ses tonu.** Babanın sesi. "Dehacığım", "aslanım", "canım oğlum".

---

## Değişecekler ve gerekçeleri

**Yapay zekâ YILDIZ VEREMEZ, VAAT EDEMEZ.** v1'in istemi "Doğru bilirsen +10 Yıldız senin!" dedirtiyordu. v2'de yıldız yalnız bir bakım verenin PIN ile onayladığı görevlerden gelir. Sohbetten yıldız verilirse çocuk yıldızı sohbete soru sordurarak toplar ve rutinin anlamı kalmaz.

Ayrım net: **yapay zekâ soru sorabilir, övebilir, ama para basamaz.** Soru-cevap kalır (baba özellikle istedi), yalnız ödül birimi sohbetin elinde değildir.

İsteme açık yasak yazılır: yıldız, puan, ödül sayısı vaat etme; "kazandın", "+10 yıldız" gibi ifadeler kullanma. Övgü serbest, para basmak yasak.

**Sabit hafta müfredatı yerine gerçek ilerleme.** v1 `WEEKS_DATA` içinden bir hafta başlığı okuyordu. v2 çocuğun o an hangi seviyede olduğunu (`drill.level`) ve takvim/satranç ilerlemesini gerçekten biliyor. İsteme uydurma müfredat değil, gerçek durum verilir.

**Tarih zaten var.** v2 gün/ay/mevsim biliyor; istemde `Intl` ile yeniden hesaplamak yerine görünüm modelinden gelir.

---

## Gizlilik notu

Sohbet, çocuğun yazdıklarını bir yapay zekâ sağlayıcısına gönderir. Bu, cihazdan çıkmayan ebeveyn günlüğünden farklıdır ve farklı olduğu bilinerek yapılır. v1 de böyle çalışıyordu. Günlük (`diary.js`) ağ yasağı testi aynen durur; bu modül o yasağın kapsamında değildir.

Sohbet penceresinde çocuğun sağlık bilgisi, adres, okul adı gibi verileri paylaşmaması için isteme bir kural eklenir: model bu tür bilgileri sormaz.

---

## Görev 1: Saf istem motoru

**Dosyalar:** Oluştur `src/engines/ai.js`, Test `tests/ai.test.js`

Dışa açılanlar: `duzMetin(metin)`, `sistemIstemi(baglam)`, `istekGovdesi(sistem, gecmis, mesaj)`, `yanitAyikla(apiYaniti)`

`baglam`: `{ cocukAdi, seviyeAdi, gun, ay, mevsim }`. Motor `Date` OKUMAZ.

- [ ] **Adım 1: Testleri yaz**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { duzMetin, sistemIstemi, istekGovdesi, yanitAyikla } from '../src/engines/ai.js';

const baglam = { cocukAdi: 'Deha', seviyeAdi: '2-5 arası çarpım', gun: 'Pazar', ay: 'Temmuz', mevsim: 'Yaz' };

test('markdown temizlenir', () => {
  assert.equal(duzMetin('**kalin** ve *egik*'), 'kalin ve egik');
  assert.equal(duzMetin('# Baslik\nmetin'), 'Baslik\nmetin');
  assert.equal(duzMetin('`kod`'), 'kod');
  assert.equal(duzMetin('- madde'), '• madde');
});

test('carpma isareti bozulmaz', () => {
  // Tek yildiz kalibinin cevresinde bosluk arar; carpma ifadesi korunmali.
  assert.equal(duzMetin('6 * 8 = 48'), '6 * 8 = 48');
});

test('istem aile gercegini icerir ve yasakli ifadeleri icermez', () => {
  const s = sistemIstemi(baglam);
  assert.ok(s.includes('Feride Mama'));
  for (const y of ['annen', 'annecigin', 'Feride maman']) {
    assert.ok(!s.includes(`"${y}"`) || s.includes('ASLA'), `${y} yasak baglaminda gecmeli`);
  }
  assert.ok(/ANNES[İI] DE[ĞG][İI]LD[İI]R/i.test(s), 'aile gercegi acikca yazilmali');
});

test('istem yildiz vaadini YASAKLAR', () => {
  const s = sistemIstemi(baglam);
  assert.ok(/y[ıi]ld[ıi]z/i.test(s), 'yildiz konusu gecmeli');
  assert.ok(/vaat etme|s[öo]z verme|veremezsin|yasak/i.test(s),
    'yildiz vaadi acikca yasaklanmali; v1 bunu yapmiyordu ve cocuk sohbetten yildiz topluyordu');
});

test('istem marka adi icermez', () => {
  const s = sistemIstemi(baglam);
  for (const marka of ['Gemini', 'OpenAI', 'ChatGPT', 'Anthropic', 'Claude']) {
    // Yalnizca "bu isimleri kullanma" talimati olarak gecebilir.
    if (s.includes(marka)) {
      assert.ok(/ge[çc]memelidir|kullanma|asla/i.test(s), `${marka} yalniz yasak listesinde gecebilir`);
    }
  }
  assert.ok(s.includes('ATAOL AI Techs'));
});

test('istem cocugun GERCEK seviyesini tasir', () => {
  const s = sistemIstemi(baglam);
  assert.ok(s.includes('2-5 arası çarpım'), 'uydurma mufredat degil gercek seviye');
});

test('istek govdesi gecmisi sirasiyla tasir', () => {
  const g = istekGovdesi('SISTEM', [{ rol: 'cocuk', metin: 'merhaba' }], 'nasilsin');
  const json = JSON.stringify(g);
  assert.ok(json.indexOf('merhaba') < json.indexOf('nasilsin'), 'gecmis once gelmeli');
  assert.deepEqual(JSON.parse(json), g, 'govde JSON guvenli olmali');
});

test('yanit ayiklama bozuk cevapta cokmez', () => {
  assert.equal(yanitAyikla(null), null);
  assert.equal(yanitAyikla({}), null);
  assert.equal(yanitAyikla({ candidates: [] }), null);
  assert.equal(
    yanitAyikla({ candidates: [{ content: { parts: [{ text: '**selam**' }] } }] }),
    'selam',
    'ayiklama duzMetin sonucunu dondurmeli'
  );
});
```

- [ ] **Adım 2-5:** kırmızı gör, yaz, yeşil gör, commit

---

## Görev 2: Ekran ve ağ

**Dosyalar:** Değiştir `src/main.js`, `v2.html`, `styles-v2.css`, `src/core/state.js` (sohbet geçmişi)

- Dördüncü sekme: Sohbet
- Ağ çağrısı `main.js`'te (`engines/` ağa çıkmaz)
- API anahtarı: taşınan `legacy.apiKey`, yoksa ayarlardan girilebilir
- Anahtar yoksa çocuğa teknik hata gösterme; sakin bir "şu an konuşamıyorum" mesajı
- Geçmiş cihazda saklanır (`state`), v1'den TAŞINMAZ (aile hatası içerebilir)
- Gönderirken bekleme göstergesi; çocuk boşluğa bakmasın
- Öneri baloncukları: v1'dekiler, "Feride Mama'ya iyi davranacağım" dahil

**Renk uyarısı:** `--card-bg` / `--card-border` kullanma, beyaz zeminde görünmez. `[hidden]` için açık `display: none` yaz.

- [x] Ekranı yaz, tarayıcıda doğrula, ekran görüntüsü al
- [x] Anahtar YOKKEN çökmediğini doğrula (sakin mesaj gösteriyor)
- [x] Yanıtta `**` veya `#` görünmediğini doğrula (`yanitAyikla` -> `duzMetin` süzüyor, test edildi)
- [x] Commit (be7bad8 özellik, b1b79f3 TDZ + sw.js düzeltmesi)

**Not (kurulum katmanı):** `main.js` yeni `engines/ai.js`'i import ettiği için
o dosya `sw.js` ASSETS listesine eklendi ve `CACHE_NAME` v9 -> v10 yükseltildi;
yoksa Deha'nın kurulu PWA'sı yeni import'u çevrimdışı bulamaz, eski cache'te kalırdı.

**Kararlaştırıldı:** "Feride Mama" (annesi olmayan bakım veren) adı, guardian
listesinden tahmin edilmiyor; Ebeveyn sekmesinde ayrı bir alandan giriliyor
(`state.loadSohbetEs`). Boşsa istem jenerik aile dalını kullanıp kimseye
"annen değil" demiyor. Öneri baloncukları isim içermiyor (Türkçe sevgi/durum
eki kodla üretilemez kuralı gereği).
