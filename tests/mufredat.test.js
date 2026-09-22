import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER } from '../src/data/mufredat.js';
import {
  haftaBul, haftaNo, haftaGezin, uniteninHaftalari, aktifHafta
} from '../src/engines/mufredat.js';

test('hafta icindeki bir gun o haftayi bulur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  assert.equal(s.tip, 'ders');
  assert.equal(s.hafta.hafta, 1);
});

test('haftanin ilk ve son gunu de o haftaya aittir', () => {
  assert.equal(haftaBul(TAKVIM, TATILLER, '2026-09-14').hafta.hafta, 1);
  assert.equal(haftaBul(TAKVIM, TATILLER, '2026-09-18').hafta.hafta, 1);
});

test('hafta sonu bir sonraki haftaya sayilir', () => {
  // 19-20 Eylul cumartesi ve pazar: 1. hafta bitti, 2. hafta basliyor
  const s = haftaBul(TAKVIM, TATILLER, '2026-09-19');
  assert.equal(s.tip, 'ders');
  assert.equal(s.hafta.hafta, 2);
});

test('tatil gunu tatil dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-11-18');
  assert.equal(s.tip, 'tatil');
  assert.equal(s.ad, '1. Dönem Ara Tatili');
});

test('yariyil tatilinin ortasi tatildir', () => {
  assert.equal(haftaBul(TAKVIM, TATILLER, '2027-01-30').tip, 'tatil');
});

test('ogretim yili baslamadan once disinda dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2026-08-01');
  assert.equal(s.tip, 'disinda');
  assert.equal(s.once, true);
});

test('ogretim yili bittikten sonra disinda dondurur', () => {
  const s = haftaBul(TAKVIM, TATILLER, '2027-08-01');
  assert.equal(s.tip, 'disinda');
  assert.equal(s.once, false);
});

test('haftaNo numaradan hafta dondurur', () => {
  assert.equal(haftaNo(TAKVIM, 5).hafta, 5);
  assert.equal(haftaNo(TAKVIM, 99), null);
  assert.equal(haftaNo(TAKVIM, 0), null);
});

test('haftaGezin ileri ve geri gider', () => {
  assert.equal(haftaGezin(TAKVIM, 5, 1).hafta, 6);
  assert.equal(haftaGezin(TAKVIM, 5, -1).hafta, 4);
});

test('haftaGezin dersi olmayan haftayi atlar', () => {
  // 37. haftada ders yok; 36'dan ileri gitmek null dondurmeli
  assert.equal(haftaGezin(TAKVIM, 36, 1), null);
});

test('haftaGezin sinirlarda null dondurur', () => {
  assert.equal(haftaGezin(TAKVIM, 1, -1), null);
});

test('uniteninHaftalari o unitenin tum haftalarini sirali verir', () => {
  const h = uniteninHaftalari(TAKVIM, 'geometrik-sekiller');
  assert.deepEqual(h.map((x) => x.hafta), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('aktifHafta sabitHafta verilince takvimi yok sayar', () => {
  const h = aktifHafta(TAKVIM, TATILLER, '2026-09-16', 12);
  assert.equal(h.hafta, 12);
});

test('aktifHafta sabitHafta yokken tarihten bulur', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-10-14', null).hafta, 5);
});

test('aktifHafta tatilde null dondurur', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-11-18', null), null);
});

test('aktifHafta gecersiz sabitHaftayi yok sayip tarihe doner', () => {
  assert.equal(aktifHafta(TAKVIM, TATILLER, '2026-10-14', 99).hafta, 5);
});

test('motor saf kalir: ayni girdi ayni cikti', () => {
  const a = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  const b = haftaBul(TAKVIM, TATILLER, '2026-09-16');
  assert.deepEqual(a, b);
});
