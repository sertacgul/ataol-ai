import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildProblem, templatesFor, TEMPLATES } from '../src/engines/problems.js';
import { VEHICLE_THEME } from '../src/data/themes.js';

const sabit = (v) => () => v;

test('her islem icin en az bir sablon var', () => {
  for (const op of ['+', '-', 'x', '/']) {
    assert.ok(templatesFor(op).length > 0, `${op} icin sablon yok`);
  }
});

test('sablon idleri benzersiz', () => {
  const ids = TEMPLATES.map((t) => t.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('problem metni ve dogru cevap uretir', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.equal(p.answer, 5);
  assert.ok(p.text.length > 10);
  assert.ok(p.text.endsWith('?'), 'soru isareti yok');
});

test('metinde sayilar gecer', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.ok(p.text.includes('9'), '9 yok');
  assert.ok(p.text.includes('4'), '4 yok');
});

test('metinde doldurulmamis yer tutucu kalmaz', () => {
  for (const op of ['+', '-', 'x', '/']) {
    for (let i = 0; i < 40; i++) {
      const p = buildProblem({ op, a: 12, b: 3, answer: op === '/' ? 4 : 15 }, VEHICLE_THEME, () => i / 40);
      assert.ok(!p.text.includes('{'), `${op}: doldurulmamis yer tutucu -> ${p.text}`);
      assert.ok(!p.text.includes('}'), `${op}: doldurulmamis yer tutucu -> ${p.text}`);
    }
  }
});

test('yolcu tasiyan aracla yuk birimi eslesmez', () => {
  const yasakli = ['kasa', 'palet', 'koli', 'çuval', 'sandık', 'blok', 'boru', 'balya'];
  for (let i = 0; i < 200; i++) {
    const p = buildProblem({ op: '+', a: 3, b: 4, answer: 7 }, VEHICLE_THEME, () => i / 200);
    for (const arac of VEHICLE_THEME.nesneler.filter((n) => n.birimler.includes('yolcu'))) {
      if (p.text.includes(arac.ad)) {
        for (const y of yasakli) {
          assert.ok(!p.text.includes(y), `${arac.ad} ile ${y} eslesti: ${p.text}`);
        }
      }
    }
  }
});

test('ayni rng ayni metni verir', () => {
  const f = { op: '+', a: 2, b: 5, answer: 7 };
  assert.equal(
    buildProblem(f, VEHICLE_THEME, sabit(0.42)).text,
    buildProblem(f, VEHICLE_THEME, sabit(0.42)).text
  );
});

test('farkli rng farkli metin uretebilir', () => {
  const f = { op: '+', a: 2, b: 5, answer: 7 };
  const metinler = new Set();
  for (let i = 0; i < 60; i++) metinler.add(buildProblem(f, VEHICLE_THEME, () => i / 60).text);
  assert.ok(metinler.size > 3, `sadece ${metinler.size} farkli metin cikti`);
});

test('bilinmeyen islem null dondurur', () => {
  assert.equal(buildProblem({ op: '?', a: 1, b: 1, answer: 2 }, VEHICLE_THEME, sabit(0)), null);
});

test('cikarma probleminde buyuk sayi once gecer', () => {
  const p = buildProblem({ op: '-', a: 9, b: 4, answer: 5 }, VEHICLE_THEME, sabit(0));
  assert.ok(p.text.indexOf('9') < p.text.indexOf('4'), `siralama ters: ${p.text}`);
});
