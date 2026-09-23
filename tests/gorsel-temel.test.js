import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gorselAraclar, gorselCemberAciDikme, gorselGosterimDogruParcasi,
  gorselGosterimIsin, gorselUcSayilari, gorselDikme, gorselDikKesisim,
  gorselKapiCercevesi
} from '../src/ui/gorsel/temel.js';

// node'da DOM yok; ciz()'in cagirdigi her seyi kaydeden en kucuk sahte.
function sahteBaglam() {
  const cagrilar = [];
  const yut = (ad) => (...a) => cagrilar.push([ad, ...a]);
  return {
    cagrilar,
    beginPath: yut('beginPath'), closePath: yut('closePath'),
    moveTo: yut('moveTo'), lineTo: yut('lineTo'), arc: yut('arc'),
    stroke: yut('stroke'), fill: yut('fill'), clearRect: yut('clearRect'),
    fillText: yut('fillText'), save: yut('save'), restore: yut('restore'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set textBaseline(v) {}, set lineCap(v) {}
  };
}

function sahteCanvas() {
  const baglam = sahteBaglam();
  const canvas = { width: 320, height: 198.4, getContext: () => baglam };
  return { canvas, baglam };
}

const metinler = (cagrilar) => cagrilar.filter(([c]) => c === 'fillText').map(([, m]) => m);
const sayi = (cagrilar, tip) => cagrilar.filter(([c]) => c === tip).length;

const TR_HARF = /[çğıöşüÇĞİÖŞÜ]/;

function ipucuTest(ad, kur) {
  test(`${ad}: ipucu dolu ve Turkce`, () => {
    const { canvas } = sahteCanvas();
    const w = kur(canvas, {});
    assert.equal(typeof w.ipucu, 'string');
    assert.ok(w.ipucu.length > 0, 'ipucu bos olmamali');
    assert.match(w.ipucu, TR_HARF, 'ipucu Turkce harf icermiyor');
  });
}

function cizAtmazTest(ad, kur) {
  test(`${ad}: ciz() dokunmadan once atmaz ve bir sey cizer`, () => {
    const { canvas, baglam } = sahteCanvas();
    const w = kur(canvas, {});
    assert.doesNotThrow(() => w.ciz());
    assert.ok(baglam.cagrilar.length > 0, 'hicbir sey cizilmedi');
  });
}

// --- araclar -------------------------------------------------------------

ipucuTest('araclar', gorselAraclar);
cizAtmazTest('araclar', gorselAraclar);

test('araclar: bir arac secmek o aracin ciktigi sekli degistirir', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselAraclar(canvas, {});

  baglam.cagrilar.length = 0;
  w.ciz();
  assert.equal(sayi(baglam.cagrilar, 'arc'), 0, 'hicbir arac secilmeden cember cizilmemeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.4, y: 0.15 }); // Pergel bolgesi
  assert.ok(sayi(baglam.cagrilar, 'arc') > 0, 'Pergel secilince cember (arc) cizilmeli');
  assert.ok(metinler(baglam.cagrilar).some((m) => m.startsWith('Pergel')), 'aciklama Pergel olmali');
});

// --- cember-aci-dikme ------------------------------------------------------

ipucuTest('cember-aci-dikme', gorselCemberAciDikme);
cizAtmazTest('cember-aci-dikme', gorselCemberAciDikme);

test('cember-aci-dikme: dokunmak siradaki sekle gecirir', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselCemberAciDikme(canvas, {});

  baglam.cagrilar.length = 0;
  w.ciz();
  assert.equal(sayi(baglam.cagrilar, 'arc'), 0, 'baslangicta hicbir sekil cizilmemeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.ok(sayi(baglam.cagrilar, 'arc') > 0, 'ilk dokunustan sonra cember cizilmeli');
  assert.ok(metinler(baglam.cagrilar).some((m) => m.startsWith('Çember')), 'aciklama cember tanimi olmali');
});

// --- gosterim-dogru-parcasi ------------------------------------------------

ipucuTest('gosterim-dogru-parcasi', gorselGosterimDogruParcasi);
cizAtmazTest('gosterim-dogru-parcasi', gorselGosterimDogruParcasi);

test('gosterim-dogru-parcasi: ikinci uc konunca [AB] gosterimi cikar', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselGosterimDogruParcasi(canvas, {});

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.2, y: 0.5 });
  assert.ok(!metinler(baglam.cagrilar).includes('[AB]'), 'tek ucla [AB] gosterimi cikmamali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.8, y: 0.5 });
  assert.ok(metinler(baglam.cagrilar).includes('[AB]'), 'iki uc konunca [AB] gosterimi cikmali');
});

// --- gosterim-isin -----------------------------------------------------

ipucuTest('gosterim-isin', gorselGosterimIsin);
cizAtmazTest('gosterim-isin', gorselGosterimIsin);

test('gosterim-isin: ucuncu dokunus isin gosterimini dogru gosterimine cevirir', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselGosterimIsin(canvas, {});
  w.dokun({ x: 0.2, y: 0.5 });

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.8, y: 0.5 });
  assert.ok(metinler(baglam.cagrilar).includes('[AB'), 'iki noktadan sonra isin gosterimi [AB olmali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 }); // uzerine tekrar dokunmak modu degistirir
  const sonra = metinler(baglam.cagrilar);
  assert.ok(!sonra.includes('[AB'), 'mod degisince isin gosterimi kalmamali');
  assert.ok(sonra.includes('AB doğrusu'), 'mod degisince dogru gosterimi cikmali');
});

// --- uc-sayilari ---------------------------------------------------------

ipucuTest('uc-sayilari', gorselUcSayilari);
cizAtmazTest('uc-sayilari', gorselUcSayilari);

test('uc-sayilari: dokunmak cocugun kendi arama sonucunu gosterir', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselUcSayilari(canvas, {});

  baglam.cagrilar.length = 0;
  w.ciz();
  assert.ok(metinler(baglam.cagrilar).some((m) => /ucu var mı\?/.test(m)),
    'baslangicta arama sorusu durmali, sonuc degil');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.1, y: 0.1 }); // nokta sekli: her dokunus ayni sonucu verir
  assert.ok(metinler(baglam.cagrilar).includes('Nokta tek başına bir yerdir, onun da ucu yoktur'),
    'aramadan sonra noktanin ucu olmadigi sonucu cikmali');
});

// --- dikme -----------------------------------------------------------------

ipucuTest('dikme', gorselDikme);
cizAtmazTest('dikme', gorselDikme);

test('dikme: sadece 90 dereceye yakin secimde dik isareti cikar', () => {
  const { canvas, baglam } = sahteCanvas();

  const w1 = gorselDikme(canvas, {});
  baglam.cagrilar.length = 0;
  w1.dokun({ x: 0.9, y: 0.55 }); // hemen hemen yatay, dik degil
  assert.ok(metinler(baglam.cagrilar).includes("Bu doğru P'den geçiyor ama dik değil, tekrar dene"),
    'yataya yakin secim dik sayilmamali');

  const w2 = gorselDikme(canvas, {});
  baglam.cagrilar.length = 0;
  w2.dokun({ x: 0.5, y: 0.2 }); // tam dikey, P'nin uzerinden geciyor
  assert.ok(metinler(baglam.cagrilar).includes('Şimdi 90 derece: buna dikme denir'),
    'dikeye yakin secim dik sayilmali');
});

// --- dik-kesisim -------------------------------------------------------

ipucuTest('dik-kesisim', gorselDikKesisim);
cizAtmazTest('dik-kesisim', gorselDikKesisim);

test('dik-kesisim: her dokunulan kose kendi dik isaretini ekler', () => {
  const { canvas, baglam } = sahteCanvas();
  const w = gorselDikKesisim(canvas, {});

  baglam.cagrilar.length = 0;
  w.ciz();
  const oncekiMoveTo = sayi(baglam.cagrilar, 'moveTo');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.7, y: 0.3 }); // sag-ust kose
  const sonrakiMoveTo = sayi(baglam.cagrilar, 'moveTo');
  assert.ok(sonrakiMoveTo > oncekiMoveTo, 'bir kose isaretlenince ekstra bir dik isareti cizilmeli');
  assert.ok(metinler(baglam.cagrilar).some((m) => m.startsWith('1 köşeye')), 'sayac 1 kose gostermeli');
});

// --- kapi-cercevesi ------------------------------------------------------

ipucuTest('kapi-cercevesi', gorselKapiCercevesi);
cizAtmazTest('kapi-cercevesi', gorselKapiCercevesi);

test('kapi-cercevesi: gercek koseye denk gelmek ile bos yere denk gelmek farkli sonuc verir', () => {
  const { canvas, baglam } = sahteCanvas();

  const wIsabet = gorselKapiCercevesi(canvas, {});
  baglam.cagrilar.length = 0;
  wIsabet.dokun({ x: 0.31, y: 0.84 }); // sol koseye yakin
  assert.ok(metinler(baglam.cagrilar).some((m) => m.startsWith('Boşluk kalmadı')),
    'gercek koseye dokununca bosluk kalmadi mesaji cikmali');

  const wYanlis = gorselKapiCercevesi(canvas, {});
  baglam.cagrilar.length = 0;
  wYanlis.dokun({ x: 0.5, y: 0.5 }); // cercevenin hicbir kosesine yakin degil
  assert.ok(metinler(baglam.cagrilar).some((m) => m.startsWith('Burada köşe yok')),
    'bos yere dokununca bosluk kaliyor mesaji cikmali');
});
