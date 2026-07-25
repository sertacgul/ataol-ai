# ATAOL v2 Faz 1B.2: Bakım Veren Ekleme Ekranı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ebeveynin konsol açmadan bakım veren ekleyebilmesi, böylece uygulamanın gerçekten kullanılmaya başlanabilmesi.

**Architecture:** Faz 1B.1'de konan kural geçerli: karar veren hiçbir mantık `main.js`'te kalmaz. Doğrulama ve kapı kuralı `src/views/settings.js` içinde saf fonksiyonlar olarak yaşar ve test edilir; `main.js` yalnızca formu kurar ve sonucu uygular.

**Tech Stack:** Vanilla ES modules, `node --test`, sıfır bağımlılık.

---

## İki tasarım kararı

**1. İlk bakım veren PIN'siz, sonrakiler PIN'li.**

Tavuk-yumurta problemi: ekranı baştan PIN'le korursak ilk bakım vereni kimse ekleyemez. Hiç korumazsak çocuk kendini bakım veren olarak ekleyip kendi onayını verir, ki bu tüm sistemin dayandığı kuralı yıkar.

Bu yüzden `profile.guardians` boşken ekran açıktır (kurulum durumu), dolduktan sonra yeni ekleme mevcut bir bakım verenin PIN'ini ister. Kurulumu ebeveyn yapar, kapı ondan sonra kilitlenir.

Kalan risk: telefonu ilk kez çocuk açarsa kendini ekleyebilir. Aile içi bir uygulama için kabul edilebilir; daha fazlası (kurulum kodu, hesap) bu ölçekte aşırı olur.

**2. PIN iki kez girilir.**

PIN hash'lenerek saklanıyor ve geri döndürülemez. Tek harflik bir yazım hatası, ebeveyni kalıcı olarak onay veremez hale getirir ve tek çözüm tüm veriyi sıfırlamak olur. Doğrulama alanı bunu ucuza engeller.

---

## Task 1: views/settings.js

**Files:**
- Create: `src/views/settings.js`
- Test: `tests/settings.test.js`

- [ ] **Step 1: Başarısız testi yaz**

Create `tests/settings.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardianSummary, validateGuardianInput, requiresExistingPin } from '../src/views/settings.js';
import { seedProfile } from '../src/data/defaults.js';

const bos = seedProfile({ childName: 'X', birthYear: 2016, guardians: [] });
const dolu = seedProfile({
  childName: 'X',
  birthYear: 2016,
  guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
});

test('bakim veren yokken kapi acik', () => {
  assert.equal(requiresExistingPin(bos), false);
});

test('bakim veren varken kapi PIN ister', () => {
  assert.equal(requiresExistingPin(dolu), true);
});

test('ozet ad ve etiketi verir, PIN alanlarini vermez', () => {
  const ozet = guardianSummary(dolu);
  assert.equal(ozet.length, 1);
  assert.equal(ozet[0].label, 'Baba');
  assert.equal(ozet[0].pinHash, undefined);
  assert.equal(ozet[0].pinSalt, undefined);
});

test('bos profilde ozet bos dizi', () => {
  assert.deepEqual(guardianSummary(bos), []);
});

test('gecerli girdi kabul edilir', () => {
  const r = validateGuardianInput({ name: 'Feride', label: 'Feride mama', pin: '4821', pinConfirm: '4821' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, []);
});

test('bos ad reddedilir', () => {
  const r = validateGuardianInput({ name: '  ', label: 'Baba', pin: '1234', pinConfirm: '1234' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('İsim')));
});

test('bos etiket reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: '', pin: '1234', pinConfirm: '1234' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('Etiket')));
});

test('kisa PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '123', pinConfirm: '123' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('4')));
});

test('uzun PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '123456789', pinConfirm: '123456789' });
  assert.equal(r.valid, false);
});

test('rakam disi PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '12a4', pinConfirm: '12a4' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('rakam')));
});

test('eslesmeyen PIN reddedilir', () => {
  const r = validateGuardianInput({ name: 'A', label: 'B', pin: '1234', pinConfirm: '1235' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes('aynı')));
});

test('birden fazla hata birlikte bildirilir', () => {
  const r = validateGuardianInput({ name: '', label: '', pin: 'x', pinConfirm: 'y' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.length >= 3);
});

test('eksik alanlar patlamak yerine hata verir', () => {
  const r = validateGuardianInput({});
  assert.equal(r.valid, false);
  assert.ok(r.errors.length > 0);
});
```

- [ ] **Step 2: Testi çalıştır, KIRILDIĞINI doğrula**

Run: `node --test tests/settings.test.js`
Expected: FAIL, `Cannot find module '../src/views/settings.js'`

- [ ] **Step 3: Implementasyonu yaz**

Create `src/views/settings.js`:

```js
/**
 * Bakim veren ekleme ekraninin saf mantigi.
 *
 * Kapi kurali: profilde hic bakim veren yokken ekran aciktir (kurulum
 * durumu), en az bir tane varken yeni ekleme mevcut bir bakim verenin
 * PIN'ini ister. Aksi halde cocuk kendini bakim veren olarak ekleyip
 * kendi onayini verebilirdi.
 *
 * PIN iki kez istenir, cunku hash geri dondurulemez ve tek harflik bir
 * yazim hatasi ebeveyni kalici olarak onay veremez hale getirir.
 */

const PIN_MIN = 4;
const PIN_MAX = 8;

export function requiresExistingPin(profile) {
  return (profile.guardians?.length ?? 0) > 0;
}

export function guardianSummary(profile) {
  return (profile.guardians ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    label: g.label
  }));
}

export function validateGuardianInput({ name, label, pin, pinConfirm } = {}) {
  const errors = [];

  if (!String(name ?? '').trim()) errors.push('İsim boş olamaz.');
  if (!String(label ?? '').trim()) errors.push('Etiket boş olamaz.');

  const p = String(pin ?? '');
  if (!/^\d*$/.test(p)) errors.push('PIN sadece rakamlardan oluşmalı.');
  if (p.length < PIN_MIN || p.length > PIN_MAX) {
    errors.push(`PIN ${PIN_MIN} ile ${PIN_MAX} rakam arasında olmalı.`);
  }
  if (p !== String(pinConfirm ?? '')) errors.push('İki PIN aynı değil.');

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `node --test tests/settings.test.js`
Expected: `# pass 13`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/views/settings.js tests/settings.test.js
git commit -m "feat(views): bakim veren ekleme dogrulamasi ve kapi kurali"
```

---

## Task 2: Ekran ve bağlantı

**Files:**
- Modify: `v2.html`, `styles-v2.css`, `src/main.js`

- [ ] **Step 1: v2.html'e bölüm ekle**

`view-parent` panelinin içeriği `main.js` tarafından üretiliyor, o yüzden HTML'e yalnızca form kabı ve bir kutu ekle. `pin-modal` tanımının hemen altına şunu ekle:

```html
  <div id="guardian-modal" class="v2-modal" hidden>
    <div class="v2-modal__box">
      <p id="guardian-modal__title">Bakım veren ekle</p>
      <input type="text" id="guardian-name" placeholder="İsim" autocomplete="off">
      <input type="text" id="guardian-label" placeholder="Nasıl görünsün (örn. Feride mama)" autocomplete="off">
      <input type="password" id="guardian-pin" inputmode="numeric" maxlength="8" placeholder="PIN" autocomplete="off">
      <input type="password" id="guardian-pin2" inputmode="numeric" maxlength="8" placeholder="PIN tekrar" autocomplete="off">
      <div id="guardian-gate" hidden>
        <p class="v2-modal__note">Yeni bakım veren eklemek için mevcut bir PIN gerekiyor.</p>
        <div id="guardian-gate-list"></div>
        <input type="password" id="guardian-gate-pin" inputmode="numeric" maxlength="8" placeholder="Mevcut PIN" autocomplete="off">
      </div>
      <p id="guardian-error" class="v2-modal__error" hidden></p>
      <button type="button" id="guardian-submit">Ekle</button>
      <button type="button" id="guardian-cancel">Vazgeç</button>
    </div>
  </div>
```

- [ ] **Step 2: styles-v2.css'e ekle**

`.v2-modal__note` ve `.v2-modal__box input` sınıflarını tanımla. Mevcut değişkenleri kullan, yeni renk tanımlama. Girdi alanları iPhone'da rahat dokunulabilir yükseklikte olsun (en az 44px).

- [ ] **Step 3: main.js'i bağla**

Import satırlarına ekle:

```js
import { hashPin } from './core/crypto.js';
import { addGuardian } from './core/profile.js';
import { guardianSummary, validateGuardianInput, requiresExistingPin } from './views/settings.js';
```

`renderParent()` fonksiyonunu şununla değiştir. Bakım veren listesi ve ekleme düğmesi kuyruğun üstünde durur; hiç bakım veren yoksa belirgin bir kurulum uyarısı görünür:

```js
function renderParent() {
  const queue = approvalQueue(profile, state.loadDayProgress(today()));
  const guardians = guardianSummary(profile);
  const target = document.getElementById('view-parent');

  const bolumler = [];

  bolumler.push(
    el('section', { className: 'parent-guardians' }, [
      el('h2', { className: 'parent-guardians__title', text: 'Bakım verenler' }),
      guardians.length === 0
        ? el('p', { className: 'parent-empty', text: 'Henüz bakım veren yok. Onay verebilmek için önce kendinizi ekleyin.' })
        : el('ul', { className: 'parent-guardians__list' }, guardians.map((g) =>
            el('li', { className: 'parent-guardians__item', text: g.label })
          )),
      el('button', {
        className: 'parent-guardians__add',
        text: 'Bakım veren ekle',
        attrs: { type: 'button' },
        dataset: { addGuardian: 'yes' }
      })
    ])
  );

  bolumler.push(
    queue.length === 0
      ? el('p', { className: 'parent-empty', text: 'Onay bekleyen görev yok.' })
      : el('ul', { className: 'parent-queue' }, queue.map((c) =>
          el('li', { className: 'parent-queue__item' }, [
            el('span', { className: 'material-symbols-rounded', text: c.icon }),
            el('span', { className: 'parent-queue__title', text: c.title }),
            el('span', { className: 'parent-queue__reward', text: `${c.stars}★` }),
            el('button', {
              className: 'parent-queue__approve',
              text: 'Onayla',
              attrs: { type: 'button' },
              dataset: { approveCard: c.id }
            })
          ])
        ))
  );

  mount(target, bolumler);
}
```

Aşağıdaki fonksiyonları `submitPin`'in altına ekle:

```js
function openGuardianModal() {
  const kapiGerekli = requiresExistingPin(profile);

  for (const id of ['guardian-name', 'guardian-label', 'guardian-pin', 'guardian-pin2', 'guardian-gate-pin']) {
    document.getElementById(id).value = '';
  }

  document.getElementById('guardian-gate').hidden = !kapiGerekli;

  if (kapiGerekli) {
    mount(document.getElementById('guardian-gate-list'), guardianSummary(profile).map((g, i) =>
      el('label', {}, [
        el('input', { attrs: { type: 'radio', name: 'gate-guardian', value: g.id, ...(i === 0 ? { checked: 'checked' } : {}) } }),
        el('span', { text: g.label })
      ])
    ));
  }

  document.getElementById('guardian-error').hidden = true;
  document.getElementById('guardian-modal').hidden = false;
}

function closeGuardianModal() {
  for (const id of ['guardian-name', 'guardian-label', 'guardian-pin', 'guardian-pin2', 'guardian-gate-pin']) {
    document.getElementById(id).value = '';
  }
  document.getElementById('guardian-modal').hidden = true;
}

function showGuardianError(mesaj) {
  const kutu = document.getElementById('guardian-error');
  kutu.textContent = mesaj;
  kutu.hidden = false;
}

async function submitGuardian() {
  const girdi = {
    name: document.getElementById('guardian-name').value,
    label: document.getElementById('guardian-label').value,
    pin: document.getElementById('guardian-pin').value,
    pinConfirm: document.getElementById('guardian-pin2').value
  };

  const sonuc = validateGuardianInput(girdi);
  if (!sonuc.valid) {
    showGuardianError(sonuc.errors[0]);
    return;
  }

  if (requiresExistingPin(profile)) {
    const secili = document.querySelector('input[name="gate-guardian"]:checked');
    const mevcut = profile.guardians.find((g) => g.id === secili?.value);
    const gatePin = document.getElementById('guardian-gate-pin').value;

    if (!mevcut || !(await verifyPin(gatePin, mevcut.pinHash, mevcut.pinSalt))) {
      showGuardianError('Mevcut PIN yanlış.');
      return;
    }
  }

  const { hash, salt } = await hashPin(girdi.pin);
  profile = addGuardian(profile, {
    name: girdi.name.trim(),
    label: girdi.label.trim(),
    pinHash: hash,
    pinSalt: salt
  });
  state.saveProfile(profile);

  closeGuardianModal();
  render();
}
```

Tıklama delegasyonuna, `approve` kontrolünün hemen altına ekle:

```js
  const ekle = e.target.closest('[data-add-guardian]');
  if (ekle) {
    openGuardianModal();
    return;
  }
```

Dosyanın altındaki dinleyicilere ekle:

```js
document.getElementById('guardian-submit').addEventListener('click', submitGuardian);
document.getElementById('guardian-cancel').addEventListener('click', closeGuardianModal);
```

Son olarak `renderIfStale` içindeki modal kontrolünü genişlet ki bakım veren formu doldurulurken de ekran altından kaymasın:

```js
function renderIfStale() {
  if (document.getElementById('pin-modal').hidden === false) return;
  if (document.getElementById('guardian-modal').hidden === false) return;
  if (renderSignature(profile, now()) !== lastSignature) render();
}
```

- [ ] **Step 4: Testleri çalıştır**

Run: `node --test "tests/**/*.test.js"`
Gerçek sayıyı raporla, `# fail 0` olmalı. Mimari testi de geçmeli: `settings.js` `views/` altında ve DOM'a dokunmuyor.

- [ ] **Step 5: Commit**

```bash
git add v2.html styles-v2.css src/main.js
git commit -m "feat(app): bakim veren ekleme ekrani ve kurulum kapisi"
```

---

## Task 3: Tarayıcı doğrulaması

- [ ] **Step 1: Sunucuyu başlat ve temiz durumdan başla**

```bash
cd ~/ataol-ai && python -m http.server 8080
```

`http://localhost:8080/v2.html` aç, konsolda `localStorage.clear()` çalıştır, yenile.

- [ ] **Step 2: Uçtan uca senaryoyu doğrula**

Her adımda ekran görüntüsü al:

1. Ebeveyn sekmesi: "Henüz bakım veren yok" uyarısı ve "Bakım veren ekle" düğmesi görünüyor.
2. Düğmeye bas: form açılıyor, **mevcut PIN alanı gizli** (ilk bakım veren, kapı açık).
3. Hatalı girdi denemeleri, her biri hata mesajı vermeli ve kaydetmemeli:
   - Boş isim
   - 3 haneli PIN
   - İki PIN farklı (`1234` / `1235`)
   - Rakam olmayan PIN (`12a4`)
4. Geçerli girdiyle ekle: `Sertaç` / `Baba` / `1234` / `1234`. Liste güncellenmeli.
5. Tekrar "Bakım veren ekle" bas: bu sefer **mevcut PIN alanı görünmeli** (kapı kilitlendi).
6. Yanlış mevcut PIN gir (`9999`): "Mevcut PIN yanlış" demeli ve eklememeli.
7. Doğru mevcut PIN (`1234`) ile `Feride` / `Feride mama` / `5678` / `5678` ekle. Listede iki kişi olmalı.
8. Rutin sekmesine geç, bir karta dokun, ebeveyn sekmesinden onayla: PIN kutusunda **iki kişi de seçenek olarak** görünmeli. Feride'nin PIN'iyle (`5678`) onayla, yıldız gelmeli.
9. Sayfayı yenile: iki bakım veren de kalıcı olmalı.
10. Konsolda hata yok.

- [ ] **Step 3: Rapor et**

Neyi doğruladığını ve neyi doğrulayamadığını açıkça yaz. Ekran görüntülerinin yollarını ver.

---

## Kapsam dışı

| İş | Neden |
|---|---|
| Bakım veren silme veya düzenleme | İstenmedi. Yanlış eklenirse şimdilik sıfırlama var |
| PIN değiştirme | Aynı sebep, 1C ergonomi turunda |
| Çocuk adını ve doğum yılını düzenleme | Faz 2 onboarding işi |
| Rutin kartlarını düzenleme | Faz 2 |
| Ebeveyn sekmesinin tamamının PIN ile korunması | Onay ve ekleme zaten PIN'li; sekmenin kendisinde gizli veri yok |
