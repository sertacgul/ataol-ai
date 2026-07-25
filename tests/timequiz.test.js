import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTimeFacts, buildQuestion, recordTimeAnswer, QUESTION_KINDS } from '../src/engines/timequiz.js';

const gun = new Date('2026-07-25T12:00:00'); // Cumartesi, 25 Temmuz, Yaz

test('createTimeFacts her soru turu icin kayit acar', () => {
  const f = createTimeFacts();
  assert.equal(Object.keys(f).length, QUESTION_KINDS.length);
  for (const k of QUESTION_KINDS) assert.equal(f[k].box, 1);
});

test('bugun sorusu dogru cevabi tasir', () => {
  const s = buildQuestion('bugun-gun', gun);
  assert.equal(s.answer, 'Cumartesi');
  assert.ok(s.prompt.length > 0);
});

test('yarin sorusu bir sonraki gunu ister', () => {
  assert.equal(buildQuestion('yarin-gun', gun).answer, 'Pazar');
});

test('ay sorusu dogru ayi ister', () => {
  assert.equal(buildQuestion('ay', gun).answer, 'Temmuz');
});

test('mevsim sorusu dogru mevsimi ister', () => {
  assert.equal(buildQuestion('mevsim', gun).answer, 'Yaz');
});

test('her sorunun secenekleri dogru cevabi icerir', () => {
  for (const kind of QUESTION_KINDS) {
    const s = buildQuestion(kind, gun);
    assert.ok(s.options.includes(s.answer), `${kind}: dogru cevap seceneklerde yok`);
  }
});

test('secenekler tekrarsiz ve en az uc tane', () => {
  for (const kind of QUESTION_KINDS) {
    const s = buildQuestion(kind, gun);
    assert.ok(s.options.length >= 3, `${kind}: az secenek`);
    assert.equal(s.options.length, new Set(s.options).size, `${kind}: tekrarli secenek`);
  }
});

test('bilinmeyen soru turu null dondurur', () => {
  assert.equal(buildQuestion('yok', gun), null);
});

test('dogru cevap kutuyu yukseltir', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true);
  assert.equal(f.ay.box, 2);
  assert.equal(f.ay.correct, 1);
});

test('yanlis cevap kutuyu 1e dusurur', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true);
  f = recordTimeAnswer(f, 'ay', true);
  f = recordTimeAnswer(f, 'ay', false);
  assert.equal(f.ay.box, 1);
  assert.equal(f.ay.wrong, 1);
});

test('takvim sorusunda hiz onemsizdir', () => {
  let f = createTimeFacts();
  f = recordTimeAnswer(f, 'ay', true, 60000);
  assert.equal(f.ay.box, 2, 'yavas dogru cevap da yukseltmeli');
});

test('recordTimeAnswer bilinmeyen anahtari yok sayar', () => {
  const f = createTimeFacts();
  assert.deepEqual(recordTimeAnswer(f, 'yok', true), f);
});
