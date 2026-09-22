import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';

const yeni = () => createAppState(createStorage(memoryBackend()));

test('bos depoda varsayilan ders ilerlemesi doner', () => {
  const i = yeni().loadDersIlerleme();
  assert.deepEqual(i.haftalar, {});
  assert.deepEqual(i.sinavlar, {});
  assert.equal(i.ayar.sesAcik, true);
  assert.equal(i.ayar.otomatikOynat, true);
  assert.equal(i.ayar.sabitHafta, null);
  assert.equal(i.ayar.sesliCevap, false);
});

test('kaydedilen ilerleme geri yuklenir', () => {
  const s = yeni();
  s.saveDersIlerleme({
    haftalar: { 3: { anlatim: ['a1'], etkilesimBitti: true, alistirma: {}, alistirmaDogru: 4, quiz: { enIyi: 80, denemeler: 1 }, yildizAlinan: ['anlatim'] } },
    sinavlar: { 'unite-geometrik-sekiller': { puan: 84, gecti: true, yildizAlindi: true } },
    ayar: { sesAcik: false, otomatikOynat: false, sabitHafta: 7, sesliCevap: true }
  });
  const i = s.loadDersIlerleme();
  assert.deepEqual(i.haftalar['3'].anlatim, ['a1']);
  assert.equal(i.sinavlar['unite-geometrik-sekiller'].puan, 84);
  assert.equal(i.ayar.sabitHafta, 7);
  assert.equal(i.ayar.sesAcik, false);
});

test('bozuk kayit varsayilana duser, cokmez', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', '"bu bir nesne degil"');
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.deepEqual(i.haftalar, {});
  assert.equal(i.ayar.sesAcik, true);
});

test('eksik alanlar varsayilanla tamamlanir', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', JSON.stringify({ haftalar: { 1: {} } }));
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.deepEqual(i.sinavlar, {});
  assert.equal(i.ayar.otomatikOynat, true);
});

test('gecersiz sabitHafta null olur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol:ders', JSON.stringify({ ayar: { sabitHafta: 'yedi' } }));
  const i = createAppState(createStorage(backend)).loadDersIlerleme();
  assert.equal(i.ayar.sabitHafta, null);
});

test('ders ilerlemesi diger anahtarlara dokunmaz', () => {
  const s = yeni();
  s.saveDrill({ level: 'toplama', byLevel: {} });
  s.saveDersIlerleme({ haftalar: {}, sinavlar: {}, ayar: {} });
  assert.equal(s.loadDrill().level, 'toplama');
});
