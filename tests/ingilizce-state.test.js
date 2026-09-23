import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';

// tests/state.test.js ile AYNI kalip: elle sahte depo degil, projenin
// kendi bellek arka ucu. Tek bir kurulum yolu olsun diye.
function kur(baslangic = {}) {
  const storage = createStorage(memoryBackend(), 'ataol2');
  for (const [k, v] of Object.entries(baslangic)) storage.set(k, v);
  return createAppState(storage);
}

test('bos depoda varsayilan sekil doner', () => {
  assert.deepEqual(kur().loadIngilizce(), { haftalar: {}, sinavlar: {} });
});

test('kaydedilen ilerleme geri okunur', () => {
  const s = kur();
  s.saveIngilizce({ haftalar: { '4': { quiz: { enIyi: 80, denemeler: 1 } } }, sinavlar: {} });
  assert.equal(s.loadIngilizce().haftalar['4'].quiz.enIyi, 80);
});

test('bozuk kayit varsayilana duser, atmaz', () => {
  for (const bozuk of [null, 'metin', 42, [], true]) {
    const s = kur({ ingilizce: bozuk });
    assert.deepEqual(s.loadIngilizce(), { haftalar: {}, sinavlar: {} },
      `${JSON.stringify(bozuk)} varsayilana dusmedi`);
  }
});

test('eksik alanlar tamamlanir', () => {
  const i = kur({ ingilizce: { haftalar: { '4': {} } } }).loadIngilizce();
  assert.deepEqual(i.sinavlar, {}, 'eksik sinavlar bos nesne olmali');
  assert.ok(i.haftalar['4']);
});

test('haftalar ve sinavlar dizi ise nesneye cevrilir', () => {
  const i = kur({ ingilizce: { haftalar: [], sinavlar: [] } }).loadIngilizce();
  assert.ok(!Array.isArray(i.haftalar), 'dizi haftalar nesneye cevrilmeli');
  assert.ok(!Array.isArray(i.sinavlar), 'dizi sinavlar nesneye cevrilmeli');
});

test('Ingilizce deposu matematik deposunu BOZMAZ', () => {
  const s = kur({ ders: { haftalar: { '1': { quiz: { enIyi: 100, denemeler: 1 } } }, sinavlar: {}, ayar: {} } });
  s.saveIngilizce({ haftalar: { '4': {} }, sinavlar: {} });
  assert.equal(s.loadDersIlerleme().haftalar['1'].quiz.enIyi, 100,
    'matematik ilerlemesi Ingilizce yazildiktan sonra da durmali');
});
