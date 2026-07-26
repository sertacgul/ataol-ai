import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SORULAR, soruMetni } from '../src/data/muhendislik.js';

test('her sorunun dogru indeksi gecerli ve iki dil ayni secenek sayisi', () => {
  for (const s of SORULAR) {
    assert.ok(s.tr.secenekler.length >= 2, `${s.id} az secenek`);
    assert.equal(s.tr.secenekler.length, s.en.secenekler.length, `${s.id} dil secenek sayisi farkli`);
    assert.ok(s.dogru >= 0 && s.dogru < s.tr.secenekler.length, `${s.id} dogru indeks gecersiz`);
    assert.ok(s.tr.soru.trim() && s.en.soru.trim(), `${s.id} soru bos`);
    for (const o of [...s.tr.secenekler, ...s.en.secenekler]) {
      assert.ok(String(o).trim(), `${s.id} bos secenek`);
    }
  }
});

test('soru idleri benzersiz', () => {
  const ids = SORULAR.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('kategoriler beklenen kumede', () => {
  const gecerli = new Set(['parca', 'gorunus', 'kavram']);
  for (const s of SORULAR) assert.ok(gecerli.has(s.kategori), `${s.id} gecersiz kategori`);
});

test('soruMetni dile gore dondurur', () => {
  const s = SORULAR[0];
  assert.equal(soruMetni(s, 'tr').soru, s.tr.soru);
  assert.equal(soruMetni(s, 'en').soru, s.en.soru);
  assert.equal(soruMetni(s, 'de').soru, s.tr.soru, 'bilinmeyen dil TR');
});
