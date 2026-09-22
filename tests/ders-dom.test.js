import { test } from 'node:test';
import assert from 'node:assert/strict';

// Ayni sahte document, tests/dom.test.js'teki ile ayni sozlesmeyi
// tasir: el()/mount()'un kullandigi createElement/appendChild/
// removeChild/firstChild. ders-dom.js'in kendisi document'e DOGRUDAN
// dokunmaz, yalniz ./dom.js araciligiyla; bu yuzden ayni sahte
// document burada da yeterli.
function fakeDocument() {
  return {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        dataset: {},
        attributes: {},
        children: [],
        setAttribute(k, v) { this.attributes[k] = String(v); },
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) { this.children = this.children.filter((x) => x !== c); },
        get firstChild() { return this.children[0] ?? null; }
      };
    }
  };
}

globalThis.document = fakeDocument();
const { soruEkrani, sinavEkrani } = await import('../src/ui/ders-dom.js');

const ceviri = (anahtar) => anahtar;

// Fix 1: soru.gorsel tasiyan bir soru gosterildiginde soruEkrani/
// sinavEkrani bir tuval dugumu doner (main.js buna widgetKur ile
// widget kurar); tasimayan sorularda tuval hic olusturulmaz.
function soru(gorsel) {
  return {
    soru: { tr: 'Test sorusu' },
    secenekler: ['1', '2', '3'],
    dogru: 0,
    cozum: ['adim'],
    tip: 'test',
    gorsel
  };
}

test('soruEkrani gorsel tasiyan soru icin tuval doner ve koke eklenir', () => {
  const kok = document.createElement('div');
  const canvas = soruEkrani(kok, {
    baslik: 'b', ustBilgi: 'u',
    soru: soru({ widget: 'aciolcer', derece: 60, mod: 'olc' }),
    secildi: null, dogruMu: false, cozumGoster: true, devamEtiketi: 'devam', kapatVar: true
  }, ceviri);

  assert.ok(canvas, 'tuval donmedi');
  assert.equal(canvas.tagName, 'CANVAS');
  assert.ok(kok.children.includes(canvas), 'tuval koke eklenmedi');
});

test('soruEkrani gorsel tasimayan soru icin tuval DONDURMEZ', () => {
  const kok = document.createElement('div');
  const canvas = soruEkrani(kok, {
    baslik: 'b', ustBilgi: 'u', soru: soru(null),
    secildi: null, dogruMu: false, cozumGoster: true, devamEtiketi: 'devam', kapatVar: true
  }, ceviri);

  assert.equal(canvas, null);
});

test('sinavEkrani gorsel tasiyan soru icin tuval doner ve koke eklenir', () => {
  const kok = document.createElement('div');
  const canvas = sinavEkrani(kok, {
    soru: soru({ widget: 'geometri-tuval', mod: 'cember', r: 4 }),
    secildi: null, index: 0, toplam: 5, uyari: ''
  }, ceviri);

  assert.ok(canvas, 'tuval donmedi');
  assert.equal(canvas.tagName, 'CANVAS');
  assert.ok(kok.children.includes(canvas), 'tuval koke eklenmedi');
});

test('sinavEkrani gorsel tasimayan soru icin tuval DONDURMEZ', () => {
  const kok = document.createElement('div');
  const canvas = sinavEkrani(kok, {
    soru: soru(null),
    secildi: null, index: 0, toplam: 5, uyari: ''
  }, ceviri);

  assert.equal(canvas, null);
});
