import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uret, VARLIKLAR, ARACLAR,
  aracSorusu, tanimSorusu, ucSorusu, gosterimSorusu
} from '../src/engines/uretici/temel-cizimler.js';
import { ureticiyiSina, sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

test('seviye 1 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 1, (soru) => {
    assert.ok(soru.tip.startsWith('temel-cizimler-'), `beklenmeyen tip ${soru.tip}`);
  });
});

test('seviye 2 sozlesmeye 200 tohumda uyar', () => {
  ureticiyiSina(uret, 2, (soru) => {
    assert.ok(soru.tip.startsWith('temel-cizimler-'), `beklenmeyen tip ${soru.tip}`);
  });
});

test('seviye 1 yalniz arac ve tanim sorusu uretir', () => {
  const tipler = new Set();
  for (let t = 1; t <= 200; t++) tipler.add(uret(1, tohumluRng(t)).tip);
  assert.deepEqual([...tipler].sort(), ['temel-cizimler-arac', 'temel-cizimler-tanim']);
});

test('seviye 2 yalniz uc ve gosterim sorusu uretir', () => {
  const tipler = new Set();
  for (let t = 1; t <= 200; t++) tipler.add(uret(2, tohumluRng(t)).tip);
  assert.deepEqual([...tipler].sort(), ['temel-cizimler-gosterim', 'temel-cizimler-uc']);
});

test('her varligin arac sorusunda dogru cevap tablodaki aractir', () => {
  for (const v of VARLIKLAR) {
    for (let t = 1; t <= 20; t++) {
      const soru = aracSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `arac ${v.id} tohum ${t}`);
      const beklenen = ARACLAR.find((a) => a.id === v.arac).ad;
      assert.equal(soru.secenekler[soru.dogru], beklenen, `${v.ad} icin yanlis arac`);
      assert.ok(soru.soru.tr.includes(v.ad), `${v.ad} soru metninde gecmiyor`);
    }
  }
});

test('her varligin tanim sorusunda dogru cevap varligin adidir', () => {
  for (const v of VARLIKLAR) {
    for (let t = 1; t <= 20; t++) {
      const soru = tanimSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `tanim ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], v.ad);
      assert.ok(soru.soru.tr.includes(v.tanim), 'tanim metni soruda yok');
    }
  }
});

test('uc sorusu yalniz uc sayisi tanimli varliklar icin kurulur', () => {
  const ucluVarliklar = VARLIKLAR.filter((v) => Number.isInteger(v.uc));
  assert.ok(ucluVarliklar.length >= 3, 'uc sayisi tanimli varlik az');
  for (const v of ucluVarliklar) {
    for (let t = 1; t <= 20; t++) {
      const soru = ucSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `uc ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], String(v.uc));
    }
  }
});

test('gosterim sorusunda dogru cevap varligin adidir', () => {
  const gosterimli = VARLIKLAR.filter((v) => v.gosterim);
  assert.ok(gosterimli.length >= 3, 'gosterimi olan varlik az');
  for (const v of gosterimli) {
    for (let t = 1; t <= 20; t++) {
      const soru = gosterimSorusu(v, tohumluRng(t));
      sozlesmeyiDogrula(soru, `gosterim ${v.id} tohum ${t}`);
      assert.equal(soru.secenekler[soru.dogru], v.ad);
      assert.ok(soru.soru.tr.includes(v.gosterim), 'gosterim soruda yok');
    }
  }
});

test('varlik tablosu kazanimin tum ogelerini kapsar', () => {
  const adlar = VARLIKLAR.map((v) => v.ad.toLocaleLowerCase('tr'));
  for (const gereken of ['nokta', 'doğru', 'doğru parçası', 'ışın', 'açı', 'çember', 'dikme']) {
    assert.ok(adlar.includes(gereken), `MAT.5.3.1 ogesi eksik: ${gereken}`);
  }
});

test('varlik kimlikleri benzersizdir', () => {
  const idler = VARLIKLAR.map((v) => v.id);
  assert.equal(new Set(idler).size, idler.length);
});

test('her varligin araci arac tablosunda vardir', () => {
  for (const v of VARLIKLAR) {
    assert.ok(ARACLAR.some((a) => a.id === v.arac), `${v.ad} araci tanimsiz: ${v.arac}`);
  }
});

test('ayni tohum ayni soruyu uretir', () => {
  assert.deepEqual(uret(1, tohumluRng(99)), uret(1, tohumluRng(99)));
});
