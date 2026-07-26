import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BILIM_SORULAR } from '../src/data/bilim.js';
import { DENEYLER, deneySayisi } from '../src/data/deneyler.js';
import { soruMetni } from '../src/data/muhendislik.js';

test('bilim: dogru indeks gecerli, iki dil ayni secenek sayisi', () => {
  for (const s of BILIM_SORULAR) {
    assert.ok(s.tr.secenekler.length >= 2, `${s.id} az secenek`);
    assert.equal(s.tr.secenekler.length, s.en.secenekler.length, `${s.id} dil secenek sayisi farkli`);
    assert.ok(s.dogru >= 0 && s.dogru < s.tr.secenekler.length, `${s.id} dogru indeks gecersiz`);
    assert.ok(s.tr.soru.trim() && s.en.soru.trim(), `${s.id} soru bos`);
  }
});

test('bilim: soru idleri benzersiz, kategoriler beklenen kumede', () => {
  const ids = BILIM_SORULAR.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
  const gecerli = new Set(['canli', 'madde', 'kuvvet', 'uzay']);
  for (const s of BILIM_SORULAR) assert.ok(gecerli.has(s.kategori), `${s.id} gecersiz kategori`);
});

test('bilim sorulari quiz motoruyla uyumlu (soruMetni)', () => {
  const m = soruMetni(BILIM_SORULAR[0], 'en');
  assert.ok(m.soru && Array.isArray(m.secenekler));
});

test('deneyler: idler benzersiz, her deney iki dilde tam', () => {
  const ids = DENEYLER.map((d) => d.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(deneySayisi(), DENEYLER.length);
  for (const d of DENEYLER) {
    for (const dil of ['tr', 'en']) {
      assert.ok(d[dil].ad.trim(), `${d.id} ${dil} ad bos`);
      assert.ok(Array.isArray(d[dil].malzemeler) && d[dil].malzemeler.length >= 2, `${d.id} ${dil} malzeme az`);
      assert.ok(Array.isArray(d[dil].adimlar) && d[dil].adimlar.length >= 2, `${d.id} ${dil} adim az`);
      assert.ok(d[dil].neden.trim(), `${d.id} ${dil} neden bos`);
    }
  }
});
