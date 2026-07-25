import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFactSet,
  recordAnswer,
  selectFact,
  isTableMastered,
  nextTable,
  MASTERY_BOX,
  MAX_BOX
} from '../src/engines/math.js';

test('createFactSet her tablo icin 10 carpim uretir', () => {
  const facts = createFactSet([2, 3]);
  assert.equal(Object.keys(facts).length, 20);
  assert.equal(facts['2x1'].box, 1);
});

test('dogru ve hizli cevap kutuyu yukseltir', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 1500, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 2);
});

test('dogru ama yavas cevap kutuyu yukseltmez', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 9000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 1);
  assert.equal(facts['2x3'].correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let facts = createFactSet([2]);
  for (let i = 0; i < 3; i++) {
    facts = recordAnswer(facts, '2x3', { correct: true, ms: 1000, thresholdMs: 6000 });
  }
  assert.equal(facts['2x3'].box, 4);
  facts = recordAnswer(facts, '2x3', { correct: false, ms: 3000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].box, 1);
});

test('kutu MAX_BOX degerini asmaz', () => {
  let facts = createFactSet([2]);
  for (let i = 0; i < 20; i++) {
    facts = recordAnswer(facts, '2x3', { correct: true, ms: 1000, thresholdMs: 6000 });
  }
  assert.equal(facts['2x3'].box, MAX_BOX);
});

test('recordAnswer sayaclari ve ortalama sureyi gunceller', () => {
  let facts = createFactSet([2]);
  facts = recordAnswer(facts, '2x3', { correct: true, ms: 2000, thresholdMs: 6000 });
  facts = recordAnswer(facts, '2x3', { correct: false, ms: 4000, thresholdMs: 6000 });
  assert.equal(facts['2x3'].seen, 2);
  assert.equal(facts['2x3'].correct, 1);
  assert.equal(facts['2x3'].wrong, 1);
  assert.equal(facts['2x3'].avgMs, 3000);
});

test('selectFact dusuk kutulu sorulari daha sik secer', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) {
    if (k !== '2x7') facts[k] = { ...facts[k], box: MAX_BOX };
  }
  let hits = 0;
  for (let i = 0; i < 500; i++) {
    const rng = () => (i + 0.5) / 500;
    if (selectFact(facts, rng) === '2x7') hits++;
  }
  assert.ok(hits > 250, `zayif soru 500 secimde ${hits} kez cikti, cogunlukta olmaliydi`);
});

test('selectFact her zaman gecerli bir anahtar dondurur', () => {
  const facts = createFactSet([3]);
  for (let i = 0; i < 50; i++) {
    const key = selectFact(facts, () => i / 50);
    assert.ok(facts[key], `gecersiz anahtar: ${key}`);
  }
});

test('tum carpimlar MASTERY_BOX ustunde ise tablo gecilmis sayilir', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  assert.equal(isTableMastered(facts, 2), true);
});

test('tek zayif carpim varken tablo gecilmemis sayilir', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  facts['2x9'] = { ...facts['2x9'], box: 2 };
  assert.equal(isTableMastered(facts, 2), false);
});

test('nextTable gecilmemis ilk tabloyu dondurur', () => {
  let facts = createFactSet([2, 3]);
  for (const k of Object.keys(facts)) {
    if (k.startsWith('2x')) facts[k] = { ...facts[k], box: MASTERY_BOX };
  }
  assert.equal(nextTable(facts, [2, 3]), 3);
});

test('hepsi gecilmisse nextTable null dondurur', () => {
  let facts = createFactSet([2]);
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: MASTERY_BOX };
  assert.equal(nextTable(facts, [2]), null);
});
