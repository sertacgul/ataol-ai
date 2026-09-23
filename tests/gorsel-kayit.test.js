import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GORSELLER, gorselKur, gorselVarMi } from '../src/ui/gorsel/index.js';
import { KONULAR } from '../src/data/konular/index.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';

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

/**
 * Ingilizce sozlugundeki cizim adlari, ikinci bir veri kaynagi.
 *
 * Bu dosya yazildiginda GORSELLER yalniz KONULAR'daki (matematik) anlatim
 * adimlarindan besleniyordu. Ingilizce kelime karti ayni kayit defterini
 * KULLANIR ama SOZLUK'ten beslenir ve ders etkinligi degildir - dokun ve
 * ipucu ZORUNLU DEGIL (bkz. gorsel-ingilizce.test.js). Asagidaki iki test
 * bu ikinci aileyi "olu kod" ya da "sozlesmeyi saglamiyor" diye
 * etiketlemesin diye bu adlari ayri tutuyoruz.
 */
const INGILIZCE_ADLARI = new Set(
  SOZLUK.filter((k) => k.gorsel.tip === 'cizim').map((k) => k.gorsel.ad)
);

test('kayit defterinde veride olmayan gorsel yok', () => {
  const veride = veridekiAdlar();
  for (const ad of Object.keys(GORSELLER)) {
    assert.ok(veride.has(ad) || INGILIZCE_ADLARI.has(ad),
      `"${ad}" kayitli ama hicbir anlatim adimi onu istemiyor; olu kod`);
  }
});

/** Cizim cagrilarini diziye yazan tuval; ne cizildigini karsilastirir. */
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
    if (!INGILIZCE_ADLARI.has(ad)) {
      assert.equal(typeof g.ipucu, 'string', `${ad}.ipucu yok`);
      assert.ok(g.ipucu.length > 0, `${ad}.ipucu bos`);
    }
    g.ciz();
    if (g.dokun) g.dokun({ x: 0.5, y: 0.5 });
  }
});

/**
 * Her gorselin dokunmaya bir yerde tepki vermesi sart.
 *
 * Tarayicida sabit noktalara dokunarak denedigimde sekizi tepkisiz
 * gorundu; 11x11 tarama hepsinin aslinda tepki verdigini, benim
 * dokunuslarimin bolgeyi iskaladigini gosterdi. Bu testin isi o
 * belirsizligi kalici olarak ortadan kaldirmak: tepkisiz bir gorsel
 * cocuk icin bozuk bir ekrandir ve elle denemeyle guvenilir sekilde
 * yakalanamaz.
 *
 * Ingilizce kelime karti gorselleri bu kurala tabi degil: ders
 * etkinligi degiller, kelime kartinin resmi - dokunmasi gerekmiyor.
 */
test('her gorsel bir yerde dokunmaya tepki verir', () => {
  const tepkisiz = [];

  for (const [ad, kur] of Object.entries(GORSELLER)) {
    if (INGILIZCE_ADLARI.has(ad)) continue;
    const kayit = [];
    const g = kur(izleyenKanvas(kayit), {});
    if (!g.dokun) { tepkisiz.push(`${ad}: dokun yok`); continue; }

    g.ciz();
    const ilk = kayit.join('|');
    let degisti = false;

    for (let i = 0; i <= 10 && !degisti; i++) {
      for (let j = 0; j <= 10 && !degisti; j++) {
        kayit.length = 0;
        g.dokun({ x: i / 10, y: j / 10 });
        g.ciz();
        if (kayit.join('|') !== ilk) degisti = true;
      }
    }
    if (!degisti) tepkisiz.push(`${ad}: hicbir dokunusa tepki vermiyor`);
  }

  assert.deepEqual(tepkisiz, [], tepkisiz.join(' ; '));
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
