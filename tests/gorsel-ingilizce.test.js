import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GORSELLER, gorselKur } from '../src/ui/gorsel/index.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';

function izleyenKanvas(kayit) {
  const y = (ad) => (...a) =>
    kayit.push(ad + ':' + a.slice(0, 4).map((v) => (typeof v === 'number' ? Math.round(v) : v)).join(','));
  const b = {
    beginPath: y('bp'), closePath: y('cp'), moveTo: y('mt'), lineTo: y('lt'),
    arc: y('arc'), arcTo: y('at'), quadraticCurveTo: y('q'), bezierCurveTo: y('bz'),
    ellipse: y('el'), rect: y('r'), fillRect: y('fr'), strokeRect: y('sr'), clip: y('cl'),
    stroke: y('s'), fill: y('f'), clearRect: y('cr'), fillText: y('ft'), strokeText: y('st'),
    measureText: () => ({ width: 10 }), setLineDash: y('sd'), getLineDash: () => [],
    save: y('sv'), restore: y('rs'), translate: y('tr'), rotate: y('ro'), scale: y('sc'),
    setTransform: y('t'), resetTransform: y('rt'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set lineCap(v) {}, set lineJoin(v) {}, set globalAlpha(v) {}
  };
  return {
    width: 320, height: 198,
    getContext: () => b,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 198 }),
    addEventListener() {}, removeEventListener() {}
  };
}

const BEKLENEN = SOZLUK.filter((k) => k.gorsel.tip === 'cizim').map((k) => k.gorsel.ad);

test('sozlukteki her cizim adi kayit defterinde var', () => {
  const eksik = BEKLENEN.filter((ad) => !GORSELLER[ad]);
  assert.deepEqual(eksik, [], `cizimi yazilmamis: ${eksik.join(', ')}`);
});

test('her Ingilizce cizim sozlesmeyi saglar ve bir sey cizer', () => {
  for (const ad of BEKLENEN) {
    const kayit = [];
    const g = gorselKur(ad, izleyenKanvas(kayit), {});
    assert.ok(g, `${ad}: gorselKur null dondu`);
    assert.equal(typeof g.ciz, 'function', `${ad}.ciz yok`);
    g.ciz();
    assert.ok(kayit.length > 2, `${ad}: hicbir sey cizmedi`);
  }
});

test('Ingilizce cizimler birbirinden FARKLI ciziyor', () => {
  // Dinle-sec dort gorsel gosterip dogrusunu sectiriyor. Iki cizim ayni
  // seyi cizerse soru cevaplanamaz hale gelir.
  const imzalar = new Map();
  for (const ad of BEKLENEN) {
    const kayit = [];
    gorselKur(ad, izleyenKanvas(kayit), {}).ciz();
    const imza = kayit.join('|');
    const ayni = imzalar.get(imza);
    assert.ok(!ayni, `${ad} ile ${ayni} ayni cizimi uretiyor`);
    imzalar.set(imza, ad);
  }
});
