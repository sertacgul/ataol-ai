import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KELIME_SORULAR } from '../src/data/kelime.js';
import { soruMetni } from '../src/data/muhendislik.js';

test('her sorunun dogru indeksi gecerli, iki dil ayni secenek sayisi', () => {
  for (const s of KELIME_SORULAR) {
    assert.ok(s.tr.secenekler.length >= 2, `${s.id} az secenek`);
    assert.equal(s.tr.secenekler.length, s.en.secenekler.length, `${s.id} dil secenek sayisi farkli`);
    assert.ok(s.dogru >= 0 && s.dogru < s.tr.secenekler.length, `${s.id} dogru indeks gecersiz`);
    assert.ok(s.tr.soru.trim() && s.en.soru.trim(), `${s.id} soru bos`);
  }
});

test('soru idleri benzersiz', () => {
  const ids = KELIME_SORULAR.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('kategoriler beklenen kumede', () => {
  const gecerli = new Set(['zit', 'esanlam', 'okuma', 'bilgi']);
  for (const s of KELIME_SORULAR) assert.ok(gecerli.has(s.kategori), `${s.id} gecersiz kategori`);
});

test('her kategoride en az uc soru var', () => {
  const say = {};
  for (const s of KELIME_SORULAR) say[s.kategori] = (say[s.kategori] ?? 0) + 1;
  for (const k of ['zit', 'esanlam', 'okuma', 'bilgi']) {
    assert.ok((say[k] ?? 0) >= 3, `${k} kategorisinde az soru`);
  }
});

test('kelime sorulari muhendislik quiz motoruyla uyumlu (soruMetni)', () => {
  const m = soruMetni(KELIME_SORULAR[0], 'tr');
  assert.ok(m.soru && Array.isArray(m.secenekler));
});
