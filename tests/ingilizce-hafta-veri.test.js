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
