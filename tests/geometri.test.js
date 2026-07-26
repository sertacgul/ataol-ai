import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GEOMETRI_SORULAR } from '../src/data/geometri.js';
import { soruMetni } from '../src/data/muhendislik.js';

test('her sorunun dogru indeksi gecerli, iki dil ayni secenek sayisi', () => {
  for (const s of GEOMETRI_SORULAR) {
    assert.ok(s.tr.secenekler.length >= 2, `${s.id} az secenek`);
    assert.equal(s.tr.secenekler.length, s.en.secenekler.length, `${s.id} dil secenek sayisi farkli`);
    assert.ok(s.dogru >= 0 && s.dogru < s.tr.secenekler.length, `${s.id} dogru indeks gecersiz`);
    assert.ok(s.tr.soru.trim() && s.en.soru.trim(), `${s.id} soru bos`);
  }
});

test('soru idleri benzersiz', () => {
  const ids = GEOMETRI_SORULAR.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('kategoriler beklenen kumede', () => {
  const gecerli = new Set(['sekil', 'kenar', 'aci', 'kavram']);
  for (const s of GEOMETRI_SORULAR) assert.ok(gecerli.has(s.kategori), `${s.id} gecersiz kategori`);
});

test('geometri sorulari muhendislik quiz motoruyla uyumlu (soruMetni)', () => {
  const s = GEOMETRI_SORULAR[0];
  assert.equal(soruMetni(s, 'tr').soru, s.tr.soru);
  assert.equal(soruMetni(s, 'en').secenekler.length, s.en.secenekler.length);
});
