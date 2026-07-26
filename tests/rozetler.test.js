import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROZETLER,
  rozetSayaclari,
  rozetDurumu,
  kazanilanSayisi,
  seriHesapla
} from '../src/engines/rozetler.js';

test('rozet idleri benzersiz, her rozetin hedefi pozitif', () => {
  const ids = ROZETLER.map((r) => r.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const r of ROZETLER) assert.ok(r.hedef > 0, `${r.id} hedef gecersiz`);
});

test('bos istatistikte hicbir rozet kazanilmaz', () => {
  const durum = rozetDurumu({}, 0, 0);
  assert.equal(durum.length, ROZETLER.length);
  assert.equal(kazanilanSayisi({}, 0, 0), 0);
  for (const r of durum) {
    assert.equal(r.n, 0, `${r.id} bos baslamiyor`);
    assert.equal(r.kazanildi, false, `${r.id} bosken kazanilmis`);
  }
});

test('sayaclar dogru kaynaklardan okunur', () => {
  const ist = {
    okunanKahramanlar: ['a', 'b', 'c'],
    matematikDogru: 12,
    kurulanMakineler: ['ekskavator', 'vinc'],
    satrancGalibiyet: 1
  };
  const s = rozetSayaclari(ist, 4, 7);
  assert.equal(s.kasif, 3);
  assert.equal(s.matematikci, 12);
  assert.equal(s.muhendis, 2);
  assert.equal(s.satrancci, 1);
  assert.equal(s.sanatci, 7);
  assert.equal(s.seri, 4);
});

test('hedefe ulasinca kazanilir, n hedefte kirpilir', () => {
  const ist = { matematikDogru: 200 };
  const mat = rozetDurumu(ist, 0, 0).find((r) => r.id === 'matematikci');
  assert.equal(mat.kazanildi, true);
  assert.equal(mat.n, mat.hedef);
});

test('9 makine muhendis rozetini verir', () => {
  const ist = { kurulanMakineler: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] };
  const muh = rozetDurumu(ist, 0, 0).find((r) => r.id === 'muhendis');
  assert.equal(muh.kazanildi, true);
});

test('seri: ust uste aktif gunler sayilir', () => {
  assert.equal(seriHesapla([true, true, true]), 3);
  assert.equal(seriHesapla([true, true, false, true]), 2);
});

test('seri: bugun bos ise dunden devam eder', () => {
  assert.equal(seriHesapla([false, true, true]), 2);
  assert.equal(seriHesapla([false, false, true]), 0);
});

test('seri: bos dizi sifir', () => {
  assert.equal(seriHesapla([]), 0);
  assert.equal(seriHesapla(undefined), 0);
});
