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

test('geometri-tuval cokgen modunda uc nokta kenar sayilmaz', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'cokgen', veri: {} });
  const basla = dinleyiciler.find(([ad]) => ad === 'pointerdown')[1];
  const bitir = dinleyiciler.find(([ad]) => ad === 'pointerup')[1];

  // Her tikla-birak ayni noktada: surukleme uzunlugu 6px altinda kalir,
  // bu yuzden widget bunlari 'nokta' olarak kaydeder, kenar olarak degil.
  for (const [x, y] of [[10, 10], [50, 50], [100, 100]]) {
    basla({ clientX: x, clientY: y });
    bitir({ clientX: x, clientY: y });
  }

  const sonuc = w.dogrula();
  assert.equal(sonuc.tamam, false, 'uc nokta bir cokgen olusturmamali');
  w.yokEt();
});

// --- Gercekten gonderilen modlarin testleri ---------------------------
//
// Yukaridaki sozlesme testleri iki widget'i da mod: 'serbest' ile
// kuruyor, ama aciolcer'de 'serbest' diye bir mod YOK: hepsi onun
// varsayilan dalini yokluyordu. Asagidakiler veride gercekten gecen
// modlari yokluyor.

function suruklemeYap(dinleyiciler, noktalar) {
  const bul = (ad) => dinleyiciler.find(([a]) => a === ad)?.[1];
  const basla = bul('pointerdown');
  const hareket = bul('pointermove');
  const bitir = bul('pointerup');
  basla(noktalar[0]);
  for (const p of noktalar.slice(1)) if (hareket) hareket(p);
  bitir(noktalar[noktalar.length - 1]);
}

test('bilinmeyen mod GECMEZ (iki widget da)', () => {
  for (const ad of ADLAR) {
    const { canvas } = sahteKok();
    const w = WIDGETLER[ad](canvas, { mod: 'boyle-bir-mod-yok', veri: {} });
    assert.equal(w.dogrula().tamam, false,
      `${ad}: kapsanmayan mod sessizce gecti; her yeni mod ayni hatayla dogar`);
    w.yokEt();
  }
});

test('aciolcer kesisim modunda tek dokunusla gecmez', () => {
  const { canvas } = sahteKok();
  const w = WIDGETLER.aciolcer(canvas, { mod: 'kesisim', veri: { derece: 50 } });
  assert.equal(w.dogrula().tamam, false, 'hic degistirmeden tamam olmamali');
  w.yokEt();
});

test('aciolcer kesisim modunda birkac aci denenince gecer', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER.aciolcer(canvas, { mod: 'kesisim', veri: { derece: 50 } });
  // Merkez (160, 172.8) civari; farkli yonlere surukleyip uc ayri aci uret.
  suruklemeYap(dinleyiciler, [
    { clientX: 260, clientY: 172 },
    { clientX: 240, clientY: 100 },
    { clientX: 160, clientY: 40 },
    { clientX: 80, clientY: 100 }
  ]);
  assert.equal(w.dogrula().tamam, true, 'uc farkli aci denendikten sonra gecmeli');
  w.yokEt();
});

test('aciolcer temizle uyesini saglar ve durumu sifirlar', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER.aciolcer(canvas, { mod: 'kesisim', veri: { derece: 50 } });
  assert.equal(typeof w.temizle, 'function',
    'temizle yok; main.js ?.() ile cagirdigi icin dugme sessizce olu kalir');
  suruklemeYap(dinleyiciler, [
    { clientX: 260, clientY: 172 }, { clientX: 240, clientY: 100 },
    { clientX: 160, clientY: 40 }, { clientX: 80, clientY: 100 }
  ]);
  w.temizle();
  assert.equal(w.dogrula().tamam, false, 'temizle sonrasi bastan baslamali');
  w.yokEt();
});

test('dikme modu dik olmayan cizgiyi kabul etmez', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'dikme', veri: {} });
  // Referans dogru yatay; yatayimsi bir cizgi dikme degildir.
  suruklemeYap(dinleyiciler, [{ clientX: 100, clientY: 140 }, { clientX: 180, clientY: 150 }]);
  const s = w.dogrula();
  assert.equal(s.tamam, false, 'yatay cizgi dikme sayilmamali');
  assert.match(s.mesaj, /dik değil/, 'mesaj neyin yanlis oldugunu soylemeli');
  w.yokEt();
});

test('dikme modu isaretli noktadan gecen dik cizgiyi kabul eder', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'dikme', veri: {} });
  // Referans dogru y=144, isaret (160,144). Dikey cizgi oradan gecsin.
  suruklemeYap(dinleyiciler, [{ clientX: 160, clientY: 140 }, { clientX: 160, clientY: 60 }]);
  assert.equal(w.dogrula().tamam, true, 'noktadan gecen dikey cizgi dikmedir');
  w.yokEt();
});

test('dikme modu dik ama uzaktan gecen cizgiyi kabul etmez', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'dikme', veri: {} });
  suruklemeYap(dinleyiciler, [{ clientX: 40, clientY: 140 }, { clientX: 40, clientY: 60 }]);
  const s = w.dogrula();
  assert.equal(s.tamam, false, 'isaretli noktadan gecmeyen dikey cizgi gorev degil');
  assert.match(s.mesaj, /noktadan geçmiyor/, 'mesaj aciyi degil konumu suclamali');
  w.yokEt();
});

test('cokgen etiketi ile dogrulama ayni sayiyi verir', () => {
  const { canvas, dinleyiciler, baglam } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'cokgen', veri: {} });
  const basla = dinleyiciler.find(([a]) => a === 'pointerdown')[1];
  const bitir = dinleyiciler.find(([a]) => a === 'pointerup')[1];

  // Uc kenar ve bir KAZA DOKUNUSU (nokta). Etiket ile mesaj ayrilmamali.
  for (const [ax, ay, bx, by] of [[20, 20, 200, 20], [200, 20, 120, 180], [120, 180, 20, 20]]) {
    basla({ clientX: ax, clientY: ay });
    bitir({ clientX: bx, clientY: by });
  }
  basla({ clientX: 60, clientY: 60 });
  bitir({ clientX: 60, clientY: 60 });

  baglam.cagrilar.length = 0;
  w.ciz();
  const etiket = baglam.cagrilar.filter(([c]) => c === 'fillText').map(([, m]) => m)
    .find((m) => /kenar/.test(m));
  assert.equal(etiket, '3 kenar, 3 köşe',
    'tuvaldeki etiket kaza dokunusunu kenar saymamali');
  assert.match(w.dogrula().mesaj, /^3 kenarlı/, 'mesaj da ayni sayiyi vermeli');
  w.yokEt();
});

test('cember-ucgen tek tiklamayla gecmez', () => {
  const { canvas } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'cember-ucgen', veri: {} });
  w.ciz();
  assert.equal(w.dogrula().tamam, false, 'hicbir sey degistirmeden tamam olmamali');
  w.yokEt();
});

test('cember-ucgen olculer degisince ikinci ucgen turunu gorur', () => {
  const { canvas, dinleyiciler } = sahteKok();
  const w = WIDGETLER['geometri-tuval'](canvas, { mod: 'cember-ucgen', veri: {} });
  w.ciz();  // baslangic: 5-5-5 eskenar
  // m1 merkezini tutup disari surukle: merkezler arasi uzaklik buyur,
  // 5-5-9 ikizkenar olur.
  suruklemeYap(dinleyiciler, [
    { clientX: 137, clientY: 144 },
    { clientX: 200, clientY: 144 }
  ]);
  assert.equal(w.dogrula().tamam, true, 'iki farkli ucgen turu gorulmus olmali');
  w.yokEt();
});
