import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gorselAciKoseKol, gorselAciBuyuklugu, gorselAciolcer, gorselAciolcerOlcme,
  gorselAciolcerSkala, gorselAciTurleri, gorselButunler, gorselButunlerHesap,
  gorselTumler, gorselKesisimDortAci, gorselTersAcilar, gorselUcDogru
} from '../src/ui/gorsel/aci.js';
import { RAD, birim } from '../src/ui/gorsel/cizim.js';
import {
  aciTuru, ACI_TURU_ADI, butunler, tumler, tersAci, komsuAci, dogrultularArasiAci
} from '../src/engines/widgets/aci.js';

// node'da DOM yok; fillText/lineTo/arc gibi cagrilari kaydeden en kucuk sahte.
function sahteBaglam() {
  const cagrilar = [];
  const yut = (ad) => (...a) => cagrilar.push([ad, ...a]);
  return {
    cagrilar,
    beginPath: yut('beginPath'), closePath: yut('closePath'),
    moveTo: yut('moveTo'), lineTo: yut('lineTo'), arc: yut('arc'),
    stroke: yut('stroke'), fill: yut('fill'), clearRect: yut('clearRect'),
    fillText: yut('fillText'),
    set strokeStyle(v) {}, set fillStyle(v) {}, set lineWidth(v) {},
    set font(v) {}, set textAlign(v) {}, set textBaseline(v) {}, set lineCap(v) {}
  };
}

const W = 400;
const H = 248; // 400 * 0.62, gercek tuval oranini yansitir

function sahteKok() {
  const baglam = sahteBaglam();
  const canvas = { width: W, height: H, getContext: () => baglam };
  return { canvas, baglam };
}

// --- kaynaktaki (aci.js) yerel geometriyi ayna gibi tekrar eder ------
// Bu fonksiyonlar disari export edilmiyor, o yuzden testte kucuk birer
// kopyasi var; kaynak formulu bozulursa asagidaki testler kirmiziya doner.
function kolUcuPx(canvas, kose, theta, r) {
  const b = birim(canvas);
  return {
    x: kose.x * canvas.width + r * b * Math.cos(theta * RAD),
    y: kose.y * canvas.height - r * b * Math.sin(theta * RAD)
  };
}
function dokunAcisi(canvas, kose, p) {
  const dx = (p.x - kose.x) * canvas.width;
  const dy = (kose.y - p.y) * canvas.height;
  return Math.atan2(dy, dx) / RAD;
}
function sinirla(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function tam360(theta) { return ((theta % 360) + 360) % 360; }
function deriyaz(v) { return `${Math.round(v)} derece`; }

/** kose'ye gore tam theta acisinda bir dokunma noktasi uretir (W/H farkini telafi eder). */
function pAcida(canvas, kose, theta, r = 80) {
  return {
    x: kose.x + (r * Math.cos(theta * RAD)) / canvas.width,
    y: kose.y - (r * Math.sin(theta * RAD)) / canvas.height
  };
}

function metinler(baglam) {
  return baglam.cagrilar.filter(([c]) => c === 'fillText').map(([, m]) => m);
}
function lineTolar(baglam) {
  return baglam.cagrilar.filter(([c]) => c === 'lineTo').map(([, x, y]) => ({ x, y }));
}
function arclar(baglam) {
  return baglam.cagrilar.filter(([c]) => c === 'arc').map(([, x, y, r]) => ({ x, y, r }));
}
function yakin(a, b, tol = 0.01) { return Math.abs(a - b) < tol; }

const TUM_GORSELLER = {
  'aci-kose-kol': gorselAciKoseKol,
  'aci-buyuklugu': gorselAciBuyuklugu,
  'aciolcer': gorselAciolcer,
  'aciolcer-olcme': gorselAciolcerOlcme,
  'aciolcer-skala': gorselAciolcerSkala,
  'aci-turleri': gorselAciTurleri,
  'butunler': gorselButunler,
  'butunler-hesap': gorselButunlerHesap,
  'tumler': gorselTumler,
  'kesisim-dort-aci': gorselKesisimDortAci,
  'ters-acilar': gorselTersAcilar,
  'uc-dogru': gorselUcDogru
};

// --- 1. ciz() dokunmadan once cokmeden bir sey cizer -------------------

test('12 gorselin hepsi: ciz() dokunmadan once cokmez ve bir sey cizer', () => {
  for (const [ad, kur] of Object.entries(TUM_GORSELLER)) {
    const { canvas, baglam } = sahteKok();
    const w = kur(canvas, {});
    w.ciz();
    assert.ok(baglam.cagrilar.some(([c]) => c === 'clearRect'), `${ad}: clearRect yok`);
    assert.ok(baglam.cagrilar.length > 3, `${ad}: neredeyse hicbir sey cizilmedi`);
  }
});

// --- 4. ipucu her zaman dolu ve Turkce ----------------------------------

test('12 gorselin hepsi: ipucu dolu bir Turkce cumle', () => {
  const TR_HARF = /[çğıöşüÇĞİÖŞÜ]/;
  for (const [ad, kur] of Object.entries(TUM_GORSELLER)) {
    const { canvas } = sahteKok();
    const w = kur(canvas, {});
    assert.equal(typeof w.ipucu, 'string', `${ad}: ipucu string degil`);
    assert.ok(w.ipucu.length > 5, `${ad}: ipucu cok kisa`);
    assert.match(w.ipucu, TR_HARF, `${ad}: ipucu Turkce ozel harf icermiyor`);
  }
});

// --- Seviye 1 -------------------------------------------------------------

test('aci-kose-kol: kolu surukleyince ucu degisir, kose sabit kalir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.68 };
  const w = gorselAciKoseKol(canvas, {});

  w.ciz();
  const kosePixelOnce = arclar(baglam).find((a) => yakin(a.r, 6));
  const yelkovanOnce = lineTolar(baglam)[1];
  assert.ok(kosePixelOnce, 'kose noktasi cizilmedi');
  assert.ok(metinler(baglam).includes('köşe'), 'köşe etiketi yok');
  assert.ok(metinler(baglam).includes('kol'), 'kol etiketi yok');

  baglam.cagrilar.length = 0;
  const hedefTheta = 150;
  w.dokun(pAcida(canvas, kose, hedefTheta));
  const kosePixelSonra = arclar(baglam).find((a) => yakin(a.r, 6));
  const yelkovanSonra = lineTolar(baglam)[1];

  const beklenenUc = kolUcuPx(canvas, kose, hedefTheta, 7.5);
  assert.ok(yakin(yelkovanSonra.x, beklenenUc.x) && yakin(yelkovanSonra.y, beklenenUc.y),
    'surukleme sonrasi kol ucu beklenen aciya gitmedi');
  assert.ok(!yakin(yelkovanOnce.x, yelkovanSonra.x) || !yakin(yelkovanOnce.y, yelkovanSonra.y),
    'kol ucu dokunmadan once ve sonra ayni yerde kaldi');
  assert.ok(yakin(kosePixelOnce.x, kosePixelSonra.x) && yakin(kosePixelOnce.y, kosePixelSonra.y),
    'kose dokunma sonrasi yerinden oynadi, ders bunu anlatmiyor olmali');
});

test('aci-buyuklugu: kol boyu degisir ama aci sayisi motor ile ayni kalir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.68 };
  const w = gorselAciBuyuklugu(canvas, {});

  w.ciz();
  const uclarOnce = lineTolar(baglam).slice(0, 2);
  const uzunlukOnce = Math.hypot(
    uclarOnce[0].x - kose.x * canvas.width, uclarOnce[0].y - kose.y * canvas.height
  );
  const metinOnce = metinler(baglam).find((m) => /derece/.test(m));

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0, y: 0 }); // bu gorselde dokunma konumu onemsiz, sadece kol boyu degisir
  const uclarSonra = lineTolar(baglam).slice(0, 2);
  const uzunlukSonra = Math.hypot(
    uclarSonra[0].x - kose.x * canvas.width, uclarSonra[0].y - kose.y * canvas.height
  );
  const metinSonra = metinler(baglam).find((m) => /derece/.test(m));

  assert.ok(!yakin(uzunlukOnce, uzunlukSonra, 1), 'kol uzunlugu dokunma sonrasi degismedi');
  assert.equal(metinOnce, metinSonra, 'kol uzunlugu degisince aci sayisi da degisti, degismemeliydi');

  const v1 = { x: uclarSonra[0].x - kose.x * canvas.width, y: uclarSonra[0].y - kose.y * canvas.height };
  const v2 = { x: uclarSonra[1].x - kose.x * canvas.width, y: uclarSonra[1].y - kose.y * canvas.height };
  const beklenen = dogrultularArasiAci(v1.x, v1.y, v2.x, v2.y);
  assert.equal(metinSonra, deriyaz(beklenen), 'gosterilen sayi motorun dogrultularArasiAci sonucuyla uyusmuyor');
});

test('aciolcer: dokundukca aracin parcalari sirayla ortaya cikar', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselAciolcer(canvas, {});

  w.ciz();
  assert.ok(!metinler(baglam).includes('merkez'), 'dokunmadan once merkez zaten vurgulanmis');
  assert.ok(!metinler(baglam).some((m) => m === 'sıfır çizgisi'), 'dokunmadan once sifir cizgisi zaten vurgulanmis');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.ok(metinler(baglam).includes('merkez'), 'ilk dokunustan sonra merkez vurgulanmadi');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.ok(metinler(baglam).includes('sıfır çizgisi'), 'ikinci dokunustan sonra sifir cizgisi vurgulanmadi');
  assert.ok(!metinler(baglam).includes('merkez'), 'ikinci dokunustan sonra hala merkez vurgulaniyor, sira degismedi');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.ok(metinler(baglam).includes('40'), 'ucuncu dokunustan sonra dis sira sayisi yok');
  assert.ok(metinler(baglam).includes(String(Math.round(butunler(40)))),
    'ic sira sayisi motorun butunler() sonucuyla uyusmuyor');
});

test('aciolcer-olcme: kolu surukleyince okunan sayi degisir ve cizilenle tutarlidir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.8 };
  const w = gorselAciolcerOlcme(canvas, {});

  // ipucu: tuvalde 0,30,60,90,120,150,180 sabit referans sayilari da yazili,
  // o yuzden okunan sayi (ucdaki etiket) onlarin SONUNCUSU olarak aliniyor.
  w.ciz();
  const metinOnce = metinler(baglam).filter((m) => /^\d+$/.test(m)).pop();

  baglam.cagrilar.length = 0;
  const hedefTheta = 115; // sabit referanslarla (30'un katlari) cakismasin diye
  w.dokun(pAcida(canvas, kose, hedefTheta));
  const metinSonra = metinler(baglam).filter((m) => /^\d+$/.test(m)).pop();
  assert.notEqual(metinOnce, metinSonra, 'surukleme sonrasi okunan sayi degismedi');
  assert.equal(metinSonra, String(hedefTheta), 'okunan sayi surukledigin aciyla uyusmuyor');
  assert.ok(metinler(baglam).some((m) => m.includes(deriyaz(hedefTheta))), 'alt yazidaki derece de ayni sayiyi soylemiyor');
});

test('aciolcer-skala: iki aday sayi da gorunur ve ic sira motorun butunler formuluyle uretilir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.8 };
  const w = gorselAciolcerSkala(canvas, {});

  // ipucu: sabit tik sayilari da her zaman ekranda (0,30,...,180 ve onlarin
  // butunler'i), o yuzden "surukleme etkisi" ucdaki SON iki digit-etikete
  // bakilarak kontrol ediliyor - onlar tik degil, gercek okuma.
  w.ciz();
  const ucOnce = metinler(baglam).filter((m) => /^\d+$/.test(m)).slice(-2);
  assert.deepEqual(ucOnce, ['60', String(Math.round(butunler(60)))],
    'baslangicta uctaki iki aday sayi beklenen degil');

  baglam.cagrilar.length = 0;
  const hedefTheta = 110;
  w.dokun(pAcida(canvas, kose, hedefTheta));
  const ucSonra = metinler(baglam).filter((m) => /^\d+$/.test(m)).slice(-2);
  const icBeklenen = Math.round(butunler(hedefTheta));
  assert.deepEqual(ucSonra, [String(hedefTheta), String(icBeklenen)],
    'surukleme sonrasi uctaki iki aday sayi motorun butunler() sonucuyla uyusmuyor');
  assert.notDeepEqual(ucOnce, ucSonra, 'surukleme sonrasi uctaki sayilar degismedi');
});

test('aci-turleri: surukledikce siniflandirma motor kuraliyla birlikte degisir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.8 };
  const w = gorselAciTurleri(canvas, {});

  // alt yazi "X derece: <tur>" bicimindeki tek cumle, o yuzden tam esitlik
  // degil "iceriyor mu" ile kontrol ediliyor.
  w.ciz(); // varsayilan 45 derece -> dar
  assert.ok(metinler(baglam).some((m) => m.includes(ACI_TURU_ADI[aciTuru(45)])), 'baslangicta dar aci etiketi yok');

  baglam.cagrilar.length = 0;
  w.dokun(pAcida(canvas, kose, 130)); // genis
  assert.ok(metinler(baglam).some((m) => m.includes(ACI_TURU_ADI['genis'])), 'genis aciya surukleyince etiket degismedi');
  assert.ok(!metinler(baglam).some((m) => m.includes(ACI_TURU_ADI['dar'])), 'eski dar aci etiketi hala goruluyor');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 }); // tam ustunde, dx=0 -> theta=90
  assert.ok(metinler(baglam).some((m) => m.includes(ACI_TURU_ADI['dik'])), 'tam 90 derecede dik aci etiketi yok');
  const kareCizgileri = lineTolar(baglam);
  assert.ok(kareCizgileri.length >= 2, 'dik acida kucuk kare isareti (dikIsaret) cizilmedi');
});

// --- Seviye 2 -------------------------------------------------------------

test('butunler: kolu surukledikce iki aci de degisir, toplam motor formuluyle 180', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.55 };
  const w = gorselButunler(canvas, {});

  w.ciz();
  const metinOnce = metinler(baglam);
  assert.ok(metinOnce.includes(deriyaz(70)), 'baslangic acisi (70) gorunmuyor');
  assert.ok(metinOnce.includes(deriyaz(butunler(70))), 'baslangicta butunler acisi motor sonucuyla uyusmuyor');

  baglam.cagrilar.length = 0;
  const hedefA = 40;
  w.dokun(pAcida(canvas, kose, hedefA));
  const metinSonra = metinler(baglam);
  assert.ok(metinSonra.includes(deriyaz(hedefA)), 'surukleme sonrasi ilk aci degismedi');
  assert.ok(metinSonra.includes(deriyaz(butunler(hedefA))),
    'surukleme sonrasi ikinci aci motorun butunler() sonucuyla uyusmuyor');
  assert.ok(metinSonra.includes(`${deriyaz(hedefA)} + ${deriyaz(butunler(hedefA))} = 180 derece`),
    'toplam cumlesi 180 formulunu dogru yazmiyor');
});

test('butunler-hesap: cikarma islemi surukledikce motor formuluyle guncellenir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.35, y: 0.55 };
  const w = gorselButunlerHesap(canvas, {});

  w.ciz();
  const hesapOnce = metinler(baglam).find((m) => m.startsWith('180 -'));
  assert.equal(hesapOnce, `180 - 100 = ${Math.round(butunler(100))}`, 'baslangic hesap cumlesi yanlis');

  baglam.cagrilar.length = 0;
  const hedefA = 55;
  w.dokun(pAcida(canvas, kose, hedefA));
  const hesapSonra = metinler(baglam).find((m) => m.startsWith('180 -'));
  assert.equal(hesapSonra, `180 - ${hedefA} = ${Math.round(butunler(hedefA))}`,
    'surukleme sonrasi hesap cumlesi motorun butunler() sonucuyla uyusmuyor');
  assert.notEqual(hesapOnce, hesapSonra, 'sokagi surukleyince hesap cumlesi degismedi');
});

test('tumler: kolu surukledikce iki aci de degisir, toplam motor formuluyle 90', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.75 };
  const w = gorselTumler(canvas, {});

  w.ciz();
  assert.ok(metinler(baglam).includes(`${deriyaz(35)} + ${deriyaz(tumler(35))} = 90 derece`),
    'baslangic tumler cumlesi yanlis');

  baglam.cagrilar.length = 0;
  const hedefA = 60;
  w.dokun(pAcida(canvas, kose, hedefA));
  const metinSonra = metinler(baglam);
  assert.ok(metinSonra.includes(`${deriyaz(hedefA)} + ${deriyaz(tumler(hedefA))} = 90 derece`),
    'surukleme sonrasi tumler cumlesi motorun tumler() sonucuyla uyusmuyor');
  assert.ok(!metinSonra.includes(deriyaz(35)), 'eski aci hala ekranda');
});

test('kesisim-dort-aci: dokunulan bolgeye gore komsu sayi gorunur, ters acida sayi gizli kalir', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.5 };
  const taban = 55;
  const w = gorselKesisimDortAci(canvas, {});

  w.ciz();
  assert.ok(!metinler(baglam).some((m) => /^(Bu açı|Komşu|Ters açı)/.test(m)),
    'dokunmadan once bir bolge zaten secilmis');

  baglam.cagrilar.length = 0;
  w.dokun(pAcida(canvas, kose, 20)); // [0,55) -> 'bu aci'
  assert.ok(metinler(baglam).includes(`Bu açı: ${deriyaz(taban)}`), 'bu aci etiketi/sayisi yanlis');

  baglam.cagrilar.length = 0;
  w.dokun(pAcida(canvas, kose, 100)); // [55,180) -> komsu
  assert.ok(metinler(baglam).includes(`Komşu: ${deriyaz(komsuAci(taban))}`),
    'komsu aci sayisi motorun komsuAci() sonucuyla uyusmuyor');

  baglam.cagrilar.length = 0;
  w.dokun(pAcida(canvas, kose, 200)); // [180,235) -> ters, SAYI YOK
  const tersMetin = metinler(baglam).find((m) => /^Ters açı/.test(m));
  assert.equal(tersMetin, 'Ters açı', 'ters aci adiminda sayi sizdirilmamali, esitlik bir sonraki derste ispatlaniyor');
});

test('ters-acilar: dogruyu surukleyince karsidaki aci hep esit kalir (motor: tersAci)', () => {
  const { canvas, baglam } = sahteKok();
  const kose = { x: 0.5, y: 0.5 };
  const w = gorselTersAcilar(canvas, {});

  w.ciz();
  const metinOnce = metinler(baglam);
  assert.ok(metinOnce.includes(deriyaz(48)) && metinOnce.filter((m) => m === deriyaz(48)).length === 2,
    'baslangicta iki taraf da 48 derece gosterilmeli');

  baglam.cagrilar.length = 0;
  const hedefA = 130;
  w.dokun(pAcida(canvas, kose, hedefA));
  const metinSonra = metinler(baglam);
  const beklenenTers = tersAci(hedefA);
  assert.equal(beklenenTers, hedefA, 'motorun tersAci() sonucu artik esitligi temsil etmiyor');
  assert.equal(metinSonra.filter((m) => m === deriyaz(hedefA)).length, 2,
    'surukleme sonrasi iki taraf da ayni (motor tersAci) sayiyi gostermiyor');
  assert.ok(!metinSonra.includes(deriyaz(48)), 'eski deger hala ekranda');
});

test('uc-dogru: en yakin koseye dokununca o kosenin komsu acisi motor formuluyle gorunur', () => {
  const { canvas, baglam } = sahteKok();
  const koseler = [
    { x: 0.3, y: 0.35, taban: 50 },
    { x: 0.72, y: 0.35, taban: 65 },
    { x: 0.5, y: 0.82, taban: 42 }
  ];
  const w = gorselUcDogru(canvas, {});

  w.ciz();
  assert.ok(!metinler(baglam).some((m) => /^(Komşu:|Ters açı|\d+ derece)$/.test(m)),
    'dokunmadan once bir kose zaten secilmis');

  baglam.cagrilar.length = 0;
  // ikinci kose (0.72, 0.35) civarinda, onun komsu bolgesinde bir nokta
  w.dokun(pAcida(canvas, koseler[1], 100, 40));
  assert.ok(metinler(baglam).includes(`Komşu: ${deriyaz(komsuAci(65))}`),
    'ikinci kosenin komsu sayisi motorun komsuAci() sonucuyla uyusmuyor');

  baglam.cagrilar.length = 0;
  const hedef3 = pAcida(canvas, koseler[2], 10, 30);
  w.dokun(hedef3);
  assert.ok(metinler(baglam).includes(deriyaz(42)), 'ucuncu kosenin kendi acisi (42) gorunmuyor');
});
