import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newBox, promote, demote, selectWeighted, isMastered, MAX_BOX, MASTERY_BOX } from '../src/engines/leitner.js';

test('yeni kutu 1den baslar', () => {
  assert.equal(newBox().box, 1);
  assert.equal(newBox().seen, 0);
});

test('promote kutuyu bir artirir', () => {
  assert.equal(promote({ box: 2 }).box, 3);
});

test('promote MAX_BOX degerini asmaz', () => {
  assert.equal(promote({ box: MAX_BOX }).box, MAX_BOX);
});

test('demote kutuyu 1e dusurur', () => {
  assert.equal(demote({ box: 5 }).box, 1);
});

test('selectWeighted dusuk kutuyu daha sik secer', () => {
  const kayitlar = { a: { box: 1 }, b: { box: 5 }, c: { box: 5 } };
  let a = 0;
  for (let i = 0; i < 1000; i++) {
    if (selectWeighted(kayitlar, () => (i + 0.5) / 1000) === 'a') a++;
  }
  assert.ok(a > 600, `zayif kayit 1000 secimde ${a} kez cikti`);
});

test('selectWeighted her zaman gecerli anahtar dondurur', () => {
  const kayitlar = { a: { box: 1 }, b: { box: 3 } };
  for (let i = 0; i < 50; i++) {
    assert.ok(kayitlar[selectWeighted(kayitlar, () => i / 50)]);
  }
});

test('bos kumede selectWeighted null dondurur', () => {
  assert.equal(selectWeighted({}, () => 0.5), null);
});

test('isMastered MASTERY_BOX esigini kullanir', () => {
  assert.equal(isMastered({ box: MASTERY_BOX }), true);
  assert.equal(isMastered({ box: MASTERY_BOX - 1 }), false);
});
