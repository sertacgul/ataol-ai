import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DIARY_TAGS, addEntry, summarize, emptyDiary } from '../src/engines/diary.js';

test('etiket listesi spec ile ayni', () => {
  assert.deepEqual(
    [...DIARY_TAGS].sort(),
    ['ekran', 'kasima', 'ofke', 'olumlu', 'tetikleyici', 'uyku', 'yemek'].sort()
  );
});

test('addEntry girdiyi gune ekler', () => {
  const d = addEntry(emptyDiary(), '2026-07-24', { tag: 'uyku', note: 'gec yatti' });
  assert.equal(d['2026-07-24'].length, 1);
  assert.equal(d['2026-07-24'][0].tag, 'uyku');
});

test('addEntry ayni gune birden fazla girdi ekleyebilir', () => {
  let d = addEntry(emptyDiary(), '2026-07-24', { tag: 'uyku' });
  d = addEntry(d, '2026-07-24', { tag: 'kasima' });
  assert.equal(d['2026-07-24'].length, 2);
});

test('addEntry orjinal nesneyi bozmaz', () => {
  const d1 = emptyDiary();
  const d2 = addEntry(d1, '2026-07-24', { tag: 'uyku' });
  assert.equal(Object.keys(d1).length, 0);
  assert.equal(Object.keys(d2).length, 1);
});

test('gecersiz etiket reddedilir', () => {
  assert.throws(
    () => addEntry(emptyDiary(), '2026-07-24', { tag: 'olmayan' }),
    /gecersiz etiket/
  );
});

test('summarize aralikta etiket sayilarini verir', () => {
  let d = emptyDiary();
  d = addEntry(d, '2026-07-20', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'uyku' });
  const s = summarize(d, '2026-07-20', '2026-07-24');
  assert.equal(s.tagCounts.kasima, 2);
  assert.equal(s.tagCounts.uyku, 1);
  assert.equal(s.daysWithEntries, 2);
});

test('summarize aralik disini saymaz', () => {
  let d = emptyDiary();
  d = addEntry(d, '2026-06-01', { tag: 'kasima' });
  d = addEntry(d, '2026-07-22', { tag: 'kasima' });
  const s = summarize(d, '2026-07-20', '2026-07-24');
  assert.equal(s.tagCounts.kasima, 1);
});

test('gunluk modulu ag cagrisi icermez', () => {
  const src = readFileSync(new URL('../src/engines/diary.js', import.meta.url), 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'WebSocket']) {
    assert.ok(!src.includes(forbidden), `diary.js icinde "${forbidden}" olmamali`);
  }
});
