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

// okumaSorusu icin cizilen derece araligi (derece(rng, 15, 165)). Bu
// sinirlari burada literal tutuyoruz ki uretici sessizce degisirse bu
// test kirilsin, uyumlu bir hesaplamayla kendi kendini dogrulamasin.
const OKUMA_EN = 15;
const OKUMA_ENCOK = 165;

test('aciolcer okuma sorusunda gorsel ve secenekler gercek kisitlari saglar', () => {
  for (let t = 1; t <= 300; t++) {
    const soru = uret(1, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-okuma') continue;

    assert.ok(soru.gorsel && soru.gorsel.widget === 'aciolcer', 'gorsel widget aciolcer degil');
    assert.equal(soru.gorsel.mod, 'olc', 'gorsel modu olc olmali');

    const d = soru.gorsel.derece;
    assert.ok(Number.isInteger(d), `derece tam sayi degil: ${d}`);
    assert.equal(d % 5, 0, `derece besin kati degil: ${d}`);
    assert.ok(d >= OKUMA_EN && d <= OKUMA_ENCOK, `derece ${d} cizim araligi disinda`);

    for (const secenek of soru.secenekler) {
      const n = Number(secenek);
      assert.equal(n % 5, 0, `secenek besin kati degil: ${secenek}`);
      assert.ok(n > 0 && n < 180, `secenek aciolcerde okunamaz: ${secenek}`);
    }

    // Aciolcerin ters skalasini okuma hatasi: cocuk sifirin basladigi
    // skala yerine oteki skaladan okursa 180 - derece'yi bulur. d = 90
    // oldugunda bu deger dogru cevaba esit oldugundan ayirt edici
    // degildir, o durumda kontrol atlanir.
    const tersSkala = 180 - d;
    if (tersSkala !== d) {
      assert.ok(soru.secenekler.includes(String(tersSkala)),
        `ters skala hatasi (${tersSkala}) secenekler arasinda yok`);
    }

    // Ic tutarlilik: dogru cevap gorsel verideki dereceyle ayni olmali.
    assert.equal(soru.secenekler[soru.dogru], String(d));
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
      // Ust sinir 180: turSorusu dogru aciyi (180 derece) bilerek ara
      // sira ozel deger olarak cekiyor (bkz. aci-olcme.js turSorusu
      // yorumu), 175 degil 180 gercek ust sinirdir.
      assert.ok(d >= 5 && d <= 180, `mantiksiz derece ${d}`);
    }
  }
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(2, tohumluRng(55)), uret(2, tohumluRng(55)));
});

// Regresyon: brief incelemesinde bulunan bir hata. d = 90 oldugunda
// butunlerSorusu ve tersSorusu'nun orijinal celdirici listeleri
// filtreden sonra tek elemana dusuyordu ve secmeliKur firlatiyordu.
// 200 tohumluk sozlesme taramasi 90'i her zaman yakalamayabilir (rng
// zar atisi ozel degerleri secmiyor), bu yuzden burada dogrudan
// uret() cagirilarak 90 derece disaridan zorlanir; boylece bu iki
// dal her calistirmada test edilir ve regresyon sessizce kacmaz.
test('butunlerSorusu ve tersSorusu 90 derecede en az iki celdirici uretir (regresyon)', () => {
  // rng() < ilk esik testte hangi soru dalina girildigini belirler;
  // sabit 90 vermek icin dogrudan iceriye derece(rng, en, encok) = 90
  // dondurecek bir sahte rng kurmak yerine, cok sayida tohumu tarayip
  // derece == 90 olan her iki soru tipini de yakaliyoruz.
  let butunlerBulundu = false;
  let tersBulundu = false;

  for (let t = 1; t <= 5000 && (!butunlerBulundu || !tersBulundu); t++) {
    const soru = uret(2, tohumluRng(t));
    if (soru.tip !== 'aci-olcme-butunler' && soru.tip !== 'aci-olcme-ters') continue;
    const derece = dereceAl(soru.soru.tr);
    if (derece !== 90) continue;

    assert.ok(soru.secenekler.length >= 3, `${soru.tip}: 90 derecede en az iki celdirici olmali`);

    if (soru.tip === 'aci-olcme-butunler') {
      assert.equal(Number(soru.secenekler[soru.dogru]), 90);
      butunlerBulundu = true;
    } else {
      assert.equal(Number(soru.secenekler[soru.dogru]), 90);
      tersBulundu = true;
    }
  }

  assert.ok(butunlerBulundu, 'd = 90 icin butunlerSorusu 5000 tohumda hic uretilmedi');
  assert.ok(tersBulundu, 'd = 90 icin tersSorusu 5000 tohumda hic uretilmedi');
});
