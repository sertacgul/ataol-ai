import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WIDGETLER, widgetKur } from '../src/ui/widget/index.js';

// node'da DOM yok; widget'in cagirdigi her seyi yutan en kucuk sahte.
function sahteBaglam() {
  const cagrilar = [];
  const yut = (ad) => (...a) => cagrilar.push([ad, ...a]);
  return {
    cagrilar,
    canvas: { width: 320, height: 240 },
    beginPath: yut('beginPath'), closePath: yut('closePath'),
    moveTo: yut('moveTo'), lineTo: yut('lineTo'), arc: yut('arc'),
    stroke: yut('stroke'), fill: yut('fill'), clearRect: yut('clearRect'),
    fillText: yut('fillText'), save: yut('save'), restore: yut('restore'),
    translate: yut('translate'), rotate: yut('rotate'), setTransform: yut('setTransform'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set lineCap(v) {}
  };
}

function sahteKok() {
  const dinleyiciler = [];
  const baglam = sahteBaglam();
  const canvas = {
    width: 320, height: 240,
    style: {},
    getContext: () => baglam,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    addEventListener: (ad, fn) => dinleyiciler.push([ad, fn]),
    removeEventListener: (ad, fn) => {
      const i = dinleyiciler.findIndex(([a, f]) => a === ad && f === fn);
      if (i >= 0) dinleyiciler.splice(i, 1);
    },
    setPointerCapture() {}, releasePointerCapture() {}
  };
  return { canvas, dinleyiciler, baglam };
}

const ADLAR = ['aciolcer', 'geometri-tuval'];

test('Faz 1 widgetleri kayitlidir', () => {
  for (const ad of ADLAR) {
    assert.equal(typeof WIDGETLER[ad], 'function', `${ad} kayitli degil`);
  }
});

test('bilinmeyen widget null dondurur, atmaz', () => {
  assert.equal(widgetKur('boyle-bir-widget-yok', {}, {}), null);
});

test('her widget sozlesmedeki uc uyeyi saglar', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    assert.equal(typeof w.ciz, 'function', `${ad}.ciz yok`);
    assert.equal(typeof w.dogrula, 'function', `${ad}.dogrula yok`);
    assert.equal(typeof w.yokEt, 'function', `${ad}.yokEt yok`);
    w.yokEt();
  }
});

test('dogrula her zaman tamam ve mesaj dondurur', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    const s = w.dogrula();
    assert.equal(typeof s.tamam, 'boolean', `${ad}: tamam bayragi yok`);
    assert.equal(typeof s.mesaj, 'string', `${ad}: mesaj yok`);
    w.yokEt();
  }
});

test('yokEt tum olay dinleyicilerini kaldirir', () => {
  for (const ad of ADLAR) {
    const { canvas, dinleyiciler } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    assert.ok(dinleyiciler.length > 0, `${ad}: hic dinleyici eklenmemis`);
    w.yokEt();
    assert.equal(dinleyiciler.length, 0,
      `${ad}: yokEt sonrasi ${dinleyiciler.length} dinleyici kaldi, ekran her acildiginda birikirler`);
  }
});

test('ciz tuvali temizleyip yeniden cizer', () => {
  for (const ad of ADLAR) {
    const { canvas, baglam } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    baglam.cagrilar.length = 0;
    w.ciz();
    assert.ok(baglam.cagrilar.some(([c]) => c === 'clearRect'), `${ad}: clearRect cagrilmadi`);
    assert.ok(baglam.cagrilar.length > 1, `${ad}: hicbir sey cizilmedi`);
    w.yokEt();
  }
});

test('ciz iki kez cagrilinca cokmez', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'serbest', veri: { derece: 60, r1: 5, r2: 5, d: 5, kenar: 4 } });
    w.ciz();
    w.ciz();
    w.yokEt();
    w.yokEt();
  }
});

test('aciolcer olc modunda hedef aciya ulasmadan tamam demez', () => {
  const { canvas } = sahteKok();
  const w = WIDGETLER.aciolcer(canvas, { mod: 'olc', veri: { derece: 75 } });
  assert.equal(w.dogrula().tamam, false, 'hic olculmeden tamam olmamali');
  w.yokEt();
});
