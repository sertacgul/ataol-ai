import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  bosDurum, cevapla, chessViewModel, kartId, sonrakiDers, TOPLAM_KART
} from '../src/views/chess.js';
import { DERSLER } from '../src/engines/chesspuzzle.js';
import { PIECES } from '../src/engines/chess.js';

function taslaBitir(durum, tas) {
  for (const d of DERSLER) durum = cevapla(durum, tas, d, true);
  return durum;
}

test('baslangicta yalniz kale acik', () => {
  const d = chessViewModel(bosDurum());
  assert.deepEqual(d.acikTaslar, ['K']);
});

test('kale bitmeden fil acilmaz', () => {
  let s = bosDurum();
  s = cevapla(s, 'K', 'serbest', true);
  s = cevapla(s, 'K', 'engelli', true);
  assert.deepEqual(chessViewModel(s).acikTaslar, ['K'], 'iki ders yetmez');
  s = cevapla(s, 'K', 'alma', true);
  assert.deepEqual(chessViewModel(s).acikTaslar, ['K', 'F']);
});

test('yanlis cevap ilerlemeyi geri almaz, kutuyu dusurur', () => {
  let s = cevapla(bosDurum(), 'K', 'serbest', true);
  const once = chessViewModel(s).acikTaslar.length;
  const kutuOnce = chessViewModel(s).taslar[0].dersler[0].kutu;
  s = cevapla(s, 'K', 'serbest', false);
  assert.equal(chessViewModel(s).acikTaslar.length, once, 'acik tas geri alinmaz');

  const ders = chessViewModel(s).taslar[0].dersler[0];
  assert.ok(ders.kutu < kutuOnce, 'yanlis cevap kutuyu dusurmeli');
  assert.equal(ders.ogrenildi, true, 'bir kez dogru yapilmis ders isaretli kalir');
});

test('sira atlanmaz, tas tas acilir', () => {
  let s = bosDurum();
  for (const p of PIECES) {
    assert.equal(chessViewModel(s).acikTaslar.at(-1), p.kod);
    s = taslaBitir(s, p.kod);
  }
  assert.deepEqual(chessViewModel(s).acikTaslar, PIECES.map((p) => p.kod));
  assert.equal(chessViewModel(s).hepsiOgrenildi, true);
});

test('kilitli tasin dersi calisilsa bile sonraki tas acilmaz', () => {
  const s = taslaBitir(bosDurum(), 'A');
  assert.deepEqual(chessViewModel(s).acikTaslar, ['K'], 'sirasi gelmeyen tas ilerletmez');
});

test('on sekiz kart vardir: alti tas uc ders', () => {
  const vm = chessViewModel(bosDurum());
  assert.equal(TOPLAM_KART, 18);
  assert.equal(vm.taslar.length, 6);
  assert.equal(vm.taslar.reduce((n, t) => n + t.dersler.length, 0), 18);
});

test('gorunum modeli tasin kuralini ve adini tasir', () => {
  const t = chessViewModel(bosDurum()).taslar[0];
  assert.equal(t.kod, 'K');
  assert.equal(t.ad, 'Kale');
  assert.ok(t.anlat.length > 0);
  assert.equal(t.acik, true);
  assert.equal(chessViewModel(bosDurum()).taslar[1].acik, false);
});

test('sonraki ders hep gecerli bir ders tipidir', () => {
  let s = bosDurum();
  for (let i = 0; i < 30; i++) {
    const d = sonrakiDers(s, 'K', () => (i * 37 % 100) / 100);
    assert.ok(DERSLER.includes(d), `gecersiz ders: ${d}`);
    s = cevapla(s, 'K', d, true);
  }
});

test('sonraki ders once calisilmamis olani secer', () => {
  let s = bosDurum();
  s = cevapla(s, 'K', 'serbest', true);
  s = cevapla(s, 'K', 'serbest', true);
  s = cevapla(s, 'K', 'serbest', true);
  const secimler = new Set();
  for (let i = 0; i < 40; i++) secimler.add(sonrakiDers(s, 'K', () => i / 40));
  assert.ok(secimler.has('engelli') && secimler.has('alma'),
    'kutusu dusuk dersler secilmeli');
});

test('durum JSON guvenlidir', () => {
  const s = taslaBitir(bosDurum(), 'K');
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
  assert.ok(Object.keys(s).includes(kartId('K', 'serbest')));
});

test('bozuk durum ekrani cokertmez', () => {
  for (const bozuk of [null, undefined, {}, { 'K:serbest': null }]) {
    const vm = chessViewModel(bozuk);
    assert.deepEqual(vm.acikTaslar, ['K']);
  }
});

test('gorunum modulu DOM api si icermez', () => {
  const src = readFileSync(new URL('../src/views/chess.js', import.meta.url), 'utf8');
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!src.includes(y), `chess.js icinde "${y}" olmamali`);
  }
});
