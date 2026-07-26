import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAKINELER, makineById } from '../src/views/kurucu.js';

test('her makinenin parcalari id, adKey ve ciz fonksiyonu tasir', () => {
  for (const m of MAKINELER) {
    assert.ok(m.id && m.adKey, 'makine id/adKey eksik');
    assert.ok(m.parcalar.length >= 2, `${m.id} az parca`);
    const ids = m.parcalar.map((p) => p.id);
    assert.equal(ids.length, new Set(ids).size, `${m.id} tekrarli parca id`);
    for (const p of m.parcalar) {
      assert.ok(p.id && p.adKey, `${m.id} parca id/adKey eksik`);
      assert.equal(typeof p.ciz, 'function', `${m.id}.${p.id} ciz fonksiyon degil`);
    }
  }
});

test('makineById dogru makineyi verir', () => {
  assert.equal(makineById('vinc').id, 'vinc');
  assert.equal(makineById('yok'), null);
});

test('ciz fonksiyonu sahte ctx ile cokmez ve cizim cagrilari yapar', () => {
  // Sahte ctx: cagrilan metotlari sayar. ciz saf oldugu icin DOM gerekmez.
  const cagrilar = [];
  const ctx = new Proxy({}, {
    get: (_t, k) => {
      if (k === 'fillStyle' || k === 'strokeStyle' || k === 'lineWidth' || k === 'lineCap') return '';
      return (...a) => { cagrilar.push(k); return a; };
    },
    set: () => true
  });
  for (const m of MAKINELER) {
    for (const p of m.parcalar) {
      const oncesi = cagrilar.length;
      p.ciz(ctx);
      assert.ok(cagrilar.length > oncesi, `${m.id}.${p.id} hic cizim yapmadi`);
    }
  }
});
