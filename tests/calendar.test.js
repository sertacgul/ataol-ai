import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayName, monthName, season, dayIndex, nextDay, describeDate, DAYS, MONTHS, SEASONS } from '../src/engines/calendar.js';

test('gun isimleri pazartesi ile baslar', () => {
  assert.equal(DAYS[0], 'Pazartesi');
  assert.equal(DAYS[6], 'Pazar');
  assert.equal(DAYS.length, 7);
});

test('ay isimleri tam ve sirali', () => {
  assert.equal(MONTHS[0], 'Ocak');
  assert.equal(MONTHS[11], 'Aralık');
  assert.equal(MONTHS.length, 12);
});

test('dayName dogru gunu verir', () => {
  assert.equal(dayName(new Date('2026-07-25T12:00:00')), 'Cumartesi');
  assert.equal(dayName(new Date('2026-07-27T12:00:00')), 'Pazartesi');
});

test('dayIndex pazartesi 0 pazar 6', () => {
  assert.equal(dayIndex(new Date('2026-07-27T12:00:00')), 0);
  assert.equal(dayIndex(new Date('2026-07-26T12:00:00')), 6);
});

test('monthName dogru ayi verir', () => {
  assert.equal(monthName(new Date('2026-01-15T12:00:00')), 'Ocak');
  assert.equal(monthName(new Date('2026-12-15T12:00:00')), 'Aralık');
});

test('nextDay hafta sonunu dogru dolanir', () => {
  assert.equal(nextDay('Pazar'), 'Pazartesi');
  assert.equal(nextDay('Cuma'), 'Cumartesi');
});

test('mevsim sinirlari astronomik', () => {
  assert.equal(season(new Date('2026-03-20T12:00:00')), 'Kış');
  assert.equal(season(new Date('2026-03-21T12:00:00')), 'İlkbahar');
  assert.equal(season(new Date('2026-06-20T12:00:00')), 'İlkbahar');
  assert.equal(season(new Date('2026-06-21T12:00:00')), 'Yaz');
  assert.equal(season(new Date('2026-09-22T12:00:00')), 'Yaz');
  assert.equal(season(new Date('2026-09-23T12:00:00')), 'Sonbahar');
  assert.equal(season(new Date('2026-12-20T12:00:00')), 'Sonbahar');
  assert.equal(season(new Date('2026-12-21T12:00:00')), 'Kış');
});

test('ocak ayi kis sayilir', () => {
  assert.equal(season(new Date('2026-01-10T12:00:00')), 'Kış');
});

test('describeDate tum alanlari verir', () => {
  const d = describeDate(new Date('2026-07-25T12:00:00'));
  assert.equal(d.dayName, 'Cumartesi');
  assert.equal(d.dayOfMonth, 25);
  assert.equal(d.monthName, 'Temmuz');
  assert.equal(d.season, 'Yaz');
  assert.equal(d.year, 2026);
  assert.equal(d.dayIndex, 5);
});

test('SEASONS dort mevsim icerir', () => {
  assert.deepEqual([...SEASONS].sort(), ['İlkbahar', 'Kış', 'Sonbahar', 'Yaz'].sort());
});
