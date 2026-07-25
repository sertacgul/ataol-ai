import test from 'node:test';
import assert from 'node:assert';
import { hedefKareler, PIECES } from '../src/engines/chess.js';

test('kale bos tahtada duz gider, capraz gitmez', () => {
  const h = hedefKareler('K', 'd4', {});
  assert.ok(h.includes('d8') && h.includes('a4') && h.includes('h4') && h.includes('d1'));
  assert.ok(!h.includes('e5'), 'kale capraz gidemez');
  assert.strictEqual(h.length, 14);
});

test('kalenin onundeki tas yolu keser, ama o tas alinabilir', () => {
  const h = hedefKareler('K', 'd4', { d6: 'P' });
  assert.ok(h.includes('d5'));
  assert.ok(h.includes('d6'), 'engel karesi alinabilir');
  assert.ok(!h.includes('d7'), 'engelin arkasi gorulmez');
});

test('at engel tanimaz', () => {
  const cevrili = { d3: 'P', d5: 'P', c4: 'P', e4: 'P', c3: 'P', c5: 'P', e3: 'P', e5: 'P' };
  const h = hedefKareler('A', 'd4', cevrili);
  assert.strictEqual(h.length, 8, 'at etrafi kapali olsa da sekiz kareye gider');
  assert.ok(h.includes('e6') && h.includes('b5'));
});

test('at kenarda daha az kareye gider', () => {
  assert.strictEqual(hedefKareler('A', 'a1', {}).length, 2);
});

test('piyon ilerler ama ilerideki tasi ALMAZ', () => {
  const h = hedefKareler('P', 'd4', { d5: 'K' });
  assert.ok(!h.includes('d5'), 'piyon onundeki tasi alamaz, bu piyonun istisnasi');
});

test('piyon caprazdaki tasi alir, bos caprazi almaz', () => {
  const h = hedefKareler('P', 'd4', { e5: 'K' });
  assert.ok(h.includes('e5'), 'capraz tas alinir');
  assert.ok(!h.includes('c5'), 'bos capraza gidilmez');
  assert.ok(h.includes('d5'), 'onu bos, ilerler');
});

test('vezir tam olarak kale ile filin toplamidir', () => {
  const tahta = { b2: 'P', f6: 'P', d7: 'P' };
  const v = hedefKareler('V', 'd4', tahta).sort();
  const kf = [...new Set([...hedefKareler('K', 'd4', tahta), ...hedefKareler('F', 'd4', tahta)])].sort();
  assert.deepStrictEqual(v, kf);
});

test('sah bir kare, sekiz yon', () => {
  assert.strictEqual(hedefKareler('S', 'd4', {}).length, 8);
  assert.strictEqual(hedefKareler('S', 'a1', {}).length, 3);
});

test('PIECES ogretim sirasindadir', () => {
  assert.deepStrictEqual(PIECES.map((p) => p.kod), ['K', 'F', 'V', 'S', 'A', 'P']);
  assert.ok(PIECES.every((p) => p.ad && p.anlat));
});
