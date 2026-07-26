import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  baslangicTahtasi,
  yasalHamleler,
  hamleUygula,
  sahTehditAltinda,
  sahKaresi,
  oyunDurumu,
  enIyiHamle,
  renkOf,
  tipOf,
  DEGERLER
} from '../src/engines/chessgame.js';

// Bir hamlenin listede olup olmadigini sorar.
function icerir(hamleler, from, to) {
  return hamleler.some((h) => h.from === from && h.to === to);
}

function hedefler(hamleler, from) {
  return hamleler.filter((h) => h.from === from).map((h) => h.to).sort();
}

test('baslangic tahtasi 32 tas, dogru dizilim, beyaz oynar', () => {
  const d = baslangicTahtasi();
  assert.equal(Object.keys(d.tahta).length, 32);
  assert.equal(d.sira, 'b');
  assert.equal(d.tahta.a1, 'bK');
  assert.equal(d.tahta.d1, 'bV');
  assert.equal(d.tahta.e1, 'bS');
  assert.equal(d.tahta.e8, 'sS');
  assert.equal(d.tahta.d8, 'sV');
  assert.equal(d.tahta.e2, 'bP');
  assert.equal(d.tahta.e7, 'sP');
});

test('baslangicta beyazin 20 yasal hamlesi var', () => {
  // 16 piyon hamlesi (8 piyon x tek/cift) + 4 at hamlesi.
  const yasal = yasalHamleler(baslangicTahtasi());
  assert.equal(yasal.length, 20);
});

test('piyon tek ve cift ilerler, ama onu kapaliysa ilerlemez', () => {
  const yasal = yasalHamleler(baslangicTahtasi());
  assert.deepEqual(hedefler(yasal, 'e2'), ['e3', 'e4']);

  // Onunde tas varsa piyon hic ilerleyemez.
  const kapali = { tahta: { e1: 'bS', e8: 'sS', e2: 'bP', e3: 'sP' }, sira: 'b' };
  assert.deepEqual(hedefler(yasalHamleler(kapali), 'e2'), []);
});

test('piyon capraz dusman tasi alir, dumduz alamaz', () => {
  const d = { tahta: { e1: 'bS', a8: 'sS', d4: 'bP', d5: 'sP', e5: 'sP', c5: 'sP' }, sira: 'b' };
  const h = yasalHamleler(d);
  // d5 onunde dusman -> ilerleyemez; c5 ve e5 caprazda dusman -> alir.
  assert.ok(!icerir(h, 'd4', 'd5'), 'onundeki tasi alamamali');
  assert.ok(icerir(h, 'd4', 'c5'), 'sol caprazi almali');
  assert.ok(icerir(h, 'd4', 'e5'), 'sag caprazi almali');
});

test('piyon son siraya varinca otomatik vezir olur', () => {
  const d = { tahta: { e1: 'bS', a8: 'sS', b7: 'bP' }, sira: 'b' };
  const sonra = hamleUygula(d, { from: 'b7', to: 'b8' });
  assert.equal(sonra.tahta.b8, 'bV');
});

test('at L hareket eder, kendi tasina inemez, ustunden atlar', () => {
  const yasal = yasalHamleler(baslangicTahtasi());
  // b1 ati: a3 ve c3 (d2/b2 piyonlarinin ustunden). Kendi piyonuna inmez.
  assert.deepEqual(hedefler(yasal, 'b1'), ['a3', 'c3']);
});

test('kayan tas kendi tasinda durur, dusmani alip durur', () => {
  const d = { tahta: { e1: 'bS', e8: 'sS', a1: 'bK', a4: 'bP', d1: 'sP' }, sira: 'b' };
  const h = yasalHamleler(d);
  // Kale a1: yukari a2,a3 (a4 kendi piyonu -> durur, a4 dahil degil).
  // Sagda b1,c1,d1 (d1 dusman -> alir ve durur, e1 kendi sahi degil cunku alindi).
  assert.deepEqual(hedefler(h, 'a1'), ['a2', 'a3', 'b1', 'c1', 'd1']);
});

test('kendi tasini alamaz', () => {
  const d = { tahta: { e1: 'bS', e8: 'sS', a1: 'bK', a2: 'bP' }, sira: 'b' };
  assert.ok(!icerir(yasalHamleler(d), 'a1', 'a2'), 'kale kendi piyonunu alamaz');
});

test('sah tehdidini tanir', () => {
  // Siyah kale beyaz sahin dosyasinda, arasi bos -> sah var.
  const tahta = { e1: 'bS', e8: 'sK' };
  assert.equal(sahTehditAltinda(tahta, 'b'), true);
  assert.equal(sahTehditAltinda(tahta, 's'), false);
});

test('sahini acikta birakan hamle yasal degil (baglama)', () => {
  // Beyaz fil d2, sahi e1, siyah kale e8 dosyada. Fil kimildarsa sah acilir.
  const d = { tahta: { e1: 'bS', e2: 'bF', e8: 'sK' }, sira: 'b' };
  const h = yasalHamleler(d);
  // e2 fili yalniz e dosyasinda kalan hamle yapamaz; caprazlari sahi acar.
  const filHamleleri = h.filter((m) => m.from === 'e2');
  for (const m of filHamleleri) {
    const sonra = hamleUygula(d, m);
    assert.equal(sahTehditAltinda(sonra.tahta, 'b'), false, `${m.to} sahi acik birakiyor`);
  }
  // Fil e dosyasindan cikamaz (hepsi capraz), yani hic yasal fil hamlesi yok.
  assert.equal(filHamleleri.length, 0);
});

test('sahtayken yalniz sahi kurtaran hamleler yasal', () => {
  // Siyah kale a1'de beyaz sahi tehdit ediyor; beyazin baska tasi da var.
  const d = { tahta: { e1: 'bS', a1: 'sK', h2: 'bP', e8: 'sS' }, sira: 'b' };
  assert.equal(sahTehditAltinda(d.tahta, 'b'), true);
  const h = yasalHamleler(d);
  // h2 piyonu oynamak sahi kurtarmaz -> listede olmamali.
  assert.ok(!h.some((m) => m.from === 'h2'), 'sahi kurtarmayan piyon hamlesi elenmeli');
  // Her yasal hamle sahi kaldirmali.
  for (const m of h) {
    assert.equal(sahTehditAltinda(hamleUygula(d, m).tahta, 'b'), false);
  }
  assert.ok(h.length > 0, 'sahin kacacak karesi var');
});

test('mat: sira kimdeyse yasal hamlesi yok ve sahta', () => {
  // Siyah sah g8, onu koruyan piyonlar, beyaz kale e8 -> 8. sira mati.
  const d = { tahta: { g8: 'sS', f7: 'sP', g7: 'sP', h7: 'sP', e8: 'bK', a1: 'bS' }, sira: 's' };
  assert.equal(sahTehditAltinda(d.tahta, 's'), true);
  assert.equal(yasalHamleler(d).length, 0);
  assert.equal(oyunDurumu(d), 'mat');
});

test('pat: sira kimdeyse yasal hamlesi yok ama sahta degil', () => {
  const d = { tahta: { a8: 'sS', b6: 'bV', c6: 'bS' }, sira: 's' };
  assert.equal(sahTehditAltinda(d.tahta, 's'), false);
  assert.equal(yasalHamleler(d).length, 0);
  assert.equal(oyunDurumu(d), 'pat');
});

test('acilista oyun devam ediyor', () => {
  assert.equal(oyunDurumu(baslangicTahtasi()), 'devam');
});

test('hamle uygulaninca sira degisir ve durum JSON guvenli', () => {
  const d = baslangicTahtasi();
  const sonra = hamleUygula(d, { from: 'e2', to: 'e4' });
  assert.equal(sonra.sira, 's');
  assert.equal(sonra.tahta.e4, 'bP');
  assert.equal(sonra.tahta.e2, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(sonra)), sonra);
  // Kaynak durum degismedi (saf).
  assert.equal(d.tahta.e2, 'bP');
});

test('AI bedava veziri alir', () => {
  // Beyazin ati c3, siyah vezir d5 bedava duruyor; en iyi hamle onu almak.
  const d = { tahta: { e1: 'bS', e8: 'sS', c3: 'bA', d5: 'sV' }, sira: 'b' };
  const hamle = enIyiHamle(d, 2, () => 0);
  assert.deepEqual(hamle, { from: 'c3', to: 'd5' });
});

test('AI yasal hamle dondurur, mat konumunda null', () => {
  const acilis = enIyiHamle(baslangicTahtasi(), 2, () => 0);
  assert.ok(icerir(yasalHamleler(baslangicTahtasi()), acilis.from, acilis.to));

  const mat = { tahta: { g8: 'sS', f7: 'sP', g7: 'sP', h7: 'sP', e8: 'bK', a1: 'bS' }, sira: 's' };
  assert.equal(enIyiHamle(mat, 2, () => 0), null);
});

test('AI belirlenimci: ayni rng ayni hamle', () => {
  const d = baslangicTahtasi();
  const a = enIyiHamle(d, 2, () => 0.5);
  const b = enIyiHamle(d, 2, () => 0.5);
  assert.deepEqual(a, b);
});

test('yardimcilar: renk, tip, degerler', () => {
  assert.equal(renkOf('bV'), 'b');
  assert.equal(tipOf('sP'), 'P');
  assert.equal(DEGERLER.V, 9);
  assert.equal(DEGERLER.S, 0);
});
