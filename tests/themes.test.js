import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VEHICLE_THEME, themeById, THEMES } from '../src/data/themes.js';

test('arac temasi bulunabilir', () => {
  assert.equal(themeById('araclar').id, 'araclar');
  assert.equal(themeById('yok'), null);
  assert.ok(THEMES.length >= 1);
});

test('her aracin adi ve bulunma hali var', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(n.ad.length > 0, 'ad bos');
    assert.ok(n.bulunma.length > 0, `${n.ad} icin bulunma hali yok`);
  }
});

test('bulunma hali adla baslar', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(n.bulunma.startsWith(n.ad), `${n.ad} -> ${n.bulunma} tutarsiz`);
  }
});

test('her aracin en az bir birimi var', () => {
  for (const n of VEHICLE_THEME.nesneler) {
    assert.ok(Array.isArray(n.birimler) && n.birimler.length > 0, `${n.ad} icin birim yok`);
  }
});

test('yolcu tasiyan araclarda yuk birimi yok', () => {
  const yolcu = VEHICLE_THEME.nesneler.filter((n) => n.birimler.includes('yolcu'));
  assert.ok(yolcu.length > 0, 'hic yolcu tasiyan arac yok');
  for (const n of yolcu) {
    assert.deepEqual(n.birimler, ['yolcu'], `${n.ad} hem yolcu hem yuk tasiyor`);
  }
});

test('yeterince arac cesidi var', () => {
  assert.ok(VEHICLE_THEME.nesneler.length >= 6, 'cok az arac, problemler tekrara duser');
});

test('arac adlari benzersiz', () => {
  const adlar = VEHICLE_THEME.nesneler.map((n) => n.ad);
  assert.equal(adlar.length, new Set(adlar).size);
});
