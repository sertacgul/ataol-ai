import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROZETLER, rozetSayaclari, rozetDurumu } from '../src/engines/rozetler.js';

const ist = (ust = {}) => ({
  okunanKahramanlar: [], matematikDogru: 0, kurulanMakineler: [], satrancGalibiyet: 0,
  dersHaftalari: 0, gecilenSinavlar: 0, tamPuanQuiz: 0, ...ust
});

test('uc yeni ders rozeti tanimlidir', () => {
  const idler = ROZETLER.map((r) => r.id);
  for (const id of ['ogrenci', 'sinavci', 'tamPuan']) {
    assert.ok(idler.includes(id), `${id} rozeti yok`);
  }
});

test('mevcut rozetler korunur', () => {
  const idler = ROZETLER.map((r) => r.id);
  for (const id of ['kasif', 'matematikci', 'muhendis', 'satrancci', 'sanatci', 'seri']) {
    assert.ok(idler.includes(id), `${id} rozeti kaybolmus`);
  }
});

test('ders sayaclari okunur', () => {
  const s = rozetSayaclari(ist({ dersHaftalari: 4, gecilenSinavlar: 2, tamPuanQuiz: 1 }), 0, 0);
  assert.equal(s.ogrenci, 4);
  assert.equal(s.sinavci, 2);
  assert.equal(s.tamPuan, 1);
});

test('eksik ders sayaclari sifir sayilir', () => {
  const s = rozetSayaclari({ okunanKahramanlar: [] }, 0, 0);
  assert.equal(s.ogrenci, 0);
  assert.equal(s.sinavci, 0);
  assert.equal(s.tamPuan, 0);
});

test('hedefe ulasinca rozet kazanilir', () => {
  const d = rozetDurumu(ist({ dersHaftalari: 10 }), 0, 0);
  assert.equal(d.find((r) => r.id === 'ogrenci').kazanildi, true);
});

test('hedefin altinda rozet kazanilmaz', () => {
  const d = rozetDurumu(ist({ dersHaftalari: 9 }), 0, 0);
  assert.equal(d.find((r) => r.id === 'ogrenci').kazanildi, false);
});
