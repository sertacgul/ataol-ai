import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startSession, answerCurrent, SESSION_LENGTH } from '../src/views/drill.js';
import { createDrill } from '../src/engines/drill.js';

const yeni = () => ({ level: 'topla-10', byLevel: { 'topla-10': createDrill('topla-10') } });

test('oturum sabit sayida soruyla baslar', () => {
  const s = startSession(yeni(), () => 0.5);
  assert.equal(s.remaining, SESSION_LENGTH);
  assert.ok(s.current);
  assert.equal(s.finished, false);
});

test('mevcut soru okunabilir metin ve dogru cevap tasir', () => {
  const s = startSession(yeni(), () => 0.5);
  assert.match(s.current.text, /^\d+ [+−×÷] \d+$/);
  assert.equal(typeof s.current.answer, 'number');
});

test('dogru cevap kalan sayiyi azaltir', () => {
  const s = startSession(yeni(), () => 0.5);
  const s2 = answerCurrent(s, s.current.answer, 1000, () => 0.5);
  assert.equal(s2.remaining, SESSION_LENGTH - 1);
  assert.equal(s2.lastCorrect, true);
});

test('yanlis cevap da kalan sayiyi azaltir ve dogruyu bildirir', () => {
  const s = startSession(yeni(), () => 0.5);
  const s2 = answerCurrent(s, s.current.answer + 1, 1000, () => 0.5);
  assert.equal(s2.remaining, SESSION_LENGTH - 1);
  assert.equal(s2.lastCorrect, false);
  assert.equal(s2.lastAnswer, s.current.answer);
});

test('yanlis cevapta ayni soru hemen tekrar sorulmaz', () => {
  const s = startSession(yeni(), () => 0.5);
  const ilk = s.current.key;
  const s2 = answerCurrent(s, s.current.answer + 1, 1000, () => 0.5);
  assert.notEqual(s2.current?.key, ilk, 'ayni soru tekrar geldi, cevap kopyalanabilir');
});

test('oturum sonunda finished true olur ve soru kalmaz', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) {
    s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  }
  assert.equal(s.finished, true);
  assert.equal(s.remaining, 0);
  assert.equal(s.current, null);
});

test('oturum boyunca dogru sayisi tutulur', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const dogruMu = i % 2 === 0;
    s = answerCurrent(s, dogruMu ? s.current.answer : s.current.answer + 1, 900, () => 0.5);
  }
  assert.equal(s.correctCount, Math.ceil(SESSION_LENGTH / 2));
});

test('cevaplar kutulara islenir', () => {
  const s = startSession(yeni(), () => 0.5);
  const k = s.current.key;
  const s2 = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.equal(s2.drill.byLevel['topla-10'][k].seen, 1);
  assert.equal(s2.drill.byLevel['topla-10'][k].box, 2);
});

test('bitmis oturuma cevap verilemez', () => {
  let s = startSession(yeni(), () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.deepEqual(answerCurrent(s, 1, 900, () => 0.5), s);
});

test('seviye tamamlanirsa bir sonrakine gecilir', () => {
  const drill = yeni();
  const facts = drill.byLevel['topla-10'];
  for (const k of Object.keys(facts)) facts[k] = { ...facts[k], box: 4 };
  let s = startSession(drill, () => 0.5);
  for (let i = 0; i < SESSION_LENGTH; i++) s = answerCurrent(s, s.current.answer, 900, () => 0.5);
  assert.equal(s.drill.level, 'cikar-10');
  assert.equal(s.levelUp, true);
});

test('metin olarak girilen cevap da kabul edilir', () => {
  const s = startSession(yeni(), () => 0.5);
  const s2 = answerCurrent(s, String(s.current.answer), 1000, () => 0.5);
  assert.equal(s2.lastCorrect, true);
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/drill.js', import.meta.url), 'utf8');
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(y), `drill.js icinde "${y}" olmamali`);
  }
});
