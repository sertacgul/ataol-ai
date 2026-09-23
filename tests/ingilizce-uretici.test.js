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
