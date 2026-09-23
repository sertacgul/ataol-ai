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

test('TTS\'in okuyamayacagi sembol yok', () => {
  for (const k of SOZLUK) {
    for (const [ad, metin] of [['en', k.en], ['ornek.en', k.ornek.en], ['ornek.tr', k.ornek.tr]]) {
      assert.ok(!/[°×÷≠≤≥→←]/.test(metin), `${k.id} ${ad}: TTS okuyamaz -> ${metin}`);
    }
  }
});
