import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GORSELLER, gorselKur, gorselVarMi } from '../src/ui/gorsel/index.js';
import { KONULAR } from '../src/data/konular/index.js';

/** Veride gecen tum gorsel adlari. */
function veridekiAdlar() {
  const adlar = new Set();
  for (const konu of Object.values(KONULAR)) {
    for (const sev of konu.seviyeler) {
      for (const adim of sev.anlatim) {
        if (adim.gorsel) adlar.add(adim.gorsel);
      }
    }
  }
  return adlar;
}

test('kayit defterinde veride olmayan gorsel yok', () => {
  const veride = veridekiAdlar();
  for (const ad of Object.keys(GORSELLER)) {
    assert.ok(veride.has(ad),
      `"${ad}" kayitli ama hicbir anlatim adimi onu istemiyor; olu kod`);
  }
});

test('her kayitli gorsel sozlesmeyi saglar', () => {
  // Tuval 2d baglaminin cizim gorsellerinin kullandigi tum uyeleri.
  // Eksik bir uye burada TypeError olarak patlar; bu testin isi zaten
  // her kayitli gorseli bir kez cizip dokundurmak, yani eksikligi
  // cocugun ekraninda degil burada yakalamak.
  const sahteBaglam = () => ({
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {},
    arcTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, ellipse() {},
    rect() {}, fillRect() {}, strokeRect() {}, clip() {},
    stroke() {}, fill() {}, clearRect() {}, fillText() {}, strokeText() {},
    measureText: () => ({ width: 10 }), setLineDash() {}, getLineDash: () => [],
    save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
    setTransform() {}, resetTransform() {},
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set lineCap(v) {}, set lineJoin(v) {}, set globalAlpha(v) {}
  });
  const sahteKanvas = () => ({
    width: 320, height: 198,
    getContext: () => sahteBaglam(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 198 }),
    addEventListener() {}, removeEventListener() {}
  });

  for (const ad of Object.keys(GORSELLER)) {
    const g = gorselKur(ad, sahteKanvas(), {});
    assert.ok(g, `${ad}: gorselKur null dondu`);
    assert.equal(typeof g.ciz, 'function', `${ad}.ciz yok`);
    assert.equal(typeof g.ipucu, 'string', `${ad}.ipucu yok`);
    assert.ok(g.ipucu.length > 0, `${ad}.ipucu bos`);
    g.ciz();
    if (g.dokun) g.dokun({ x: 0.5, y: 0.5 });
  }
});

test('bilinmeyen ad null doner, atmaz', () => {
  assert.equal(gorselKur('boyle-bir-gorsel-yok', {}, {}), null);
  assert.equal(gorselVarMi('boyle-bir-gorsel-yok'), false);
  assert.equal(gorselVarMi(null), false);
});

/**
 * Bu test KIRMIZI degil, RAPOR verir: henuz cizilmemis gorseller
 * beklenen durumdur (cokgen ailesi ayri gorevde). Sayi sifira
 * dustugunde kapsam tamamlanmis demektir.
 */
test('kapsanmayan gorseller raporlanir', () => {
  const veride = veridekiAdlar();
  const eksik = [...veride].filter((ad) => !gorselVarMi(ad)).sort();
  console.log(`  gorsel kapsami: ${veride.size - eksik.length} / ${veride.size}`);
  if (eksik.length > 0) console.log(`  eksik: ${eksik.join(', ')}`);
  assert.ok(Array.isArray(eksik));
});
