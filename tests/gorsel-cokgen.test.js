import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gorselCokgenOlusum, gorselCokgenKenar, gorselCokgenAdlari, gorselCokgenDegil, gorselCokgenGunluk,
  gorselKenarKose, gorselIcAcilar, gorselDuzgunCokgen, gorselKareDortgen, gorselFayans,
  gorselCember, gorselYaricap, gorselCap, gorselPergel, gorselIkiCember, gorselUcgenTurleri,
  gorselKesisimKosulu, gorselCemberUcgen, gorselUcgenKenarlari, gorselUcgenNeden, gorselEsitYaricap
} from '../src/ui/gorsel/cokgen.js';
import { RENK } from '../src/ui/gorsel/cizim.js';
import { ucgenTuru, UCGEN_TURU_ADI, kesisirMi, COKGENLER } from '../src/engines/uretici/cokgenler-cember.js';

// node'da DOM yok; her cagriyi argumanlariyla birlikte yutan sahte baglam.
// widget-arayuz.test.js'deki sahteBaglam'a benzer ama kendi kopyamiz -
// oradan import etmiyoruz, ayrica arc/fillStyle/strokeStyle argumanlarini
// da tutuyoruz cunku geometri dogrulugunu bunlardan okuyoruz.
function sahteBaglam() {
  const cagrilar = [];
  const yut = (ad) => (...a) => cagrilar.push([ad, ...a]);
  return {
    cagrilar,
    beginPath: yut('beginPath'), closePath: yut('closePath'),
    moveTo: yut('moveTo'), lineTo: yut('lineTo'), arc: yut('arc'),
    quadraticCurveTo: yut('quadraticCurveTo'),
    stroke: yut('stroke'), fill: yut('fill'), clearRect: yut('clearRect'),
    fillText: yut('fillText'), save: yut('save'), restore: yut('restore'),
    translate: yut('translate'), rotate: yut('rotate'), setTransform: yut('setTransform'),
    set strokeStyle(v) { cagrilar.push(['set:strokeStyle', v]); },
    set fillStyle(v) { cagrilar.push(['set:fillStyle', v]); },
    set lineWidth(v) {}, set font(v) {}, set textAlign(v) {},
    set textBaseline(v) {}, set lineCap(v) {}
  };
}

// Gercek uygulama tuvali 1 : 0.62 oraninda; sahte tuval de ayni orani kullanir.
function sahteKok(genislik = 320, yukseklik = 198.4) {
  const baglam = sahteBaglam();
  const canvas = { width: genislik, height: yukseklik, getContext: () => baglam };
  return { canvas, baglam };
}

function fillTextler(cagrilar) {
  return cagrilar.filter(([ad]) => ad === 'fillText').map(([, metin]) => metin);
}

function sonAltYazi(cagrilar) {
  const t = fillTextler(cagrilar);
  return t[t.length - 1];
}

function sayac(cagrilar, ad) {
  return cagrilar.filter(([a]) => a === ad).length;
}

function arcCagrilari(cagrilar) {
  return cagrilar.filter(([ad]) => ad === 'arc').map(([, x, y, r, bas, bit]) => ({ x, y, r, bas, bit }));
}

function fillStyleGecmisi(cagrilar, deger) {
  return cagrilar.filter(([ad, v]) => ad === 'set:fillStyle' && v === deger).length;
}

// gorsel/cokgen.js'deki birimNokta / cokgenNoktalari ile AYNI formul.
// Duzenli cokgen kosesi ya da kenar ortasi gibi dokunma hedeflerini
// elle hesaplamak yerine (hata riski), gercek geometriyi burada da
// uretiyoruz - kaynak formul degisirse dokunuslar hedefi kacirir ve
// test kendiliginden kirilir.
function birimNoktaTest(canvas, merkez, rBirim, aciDerece) {
  const b = Math.min(canvas.width, canvas.height) / 20;
  const mx = merkez.x * canvas.width;
  const my = merkez.y * canvas.height;
  const rad = (aciDerece * Math.PI) / 180;
  return {
    x: (mx + rBirim * b * Math.cos(rad)) / canvas.width,
    y: (my + rBirim * b * Math.sin(rad)) / canvas.height
  };
}

function cokgenNoktalariTest(canvas, merkez, r, n, baslangicDerece = -90) {
  const noktalar = [];
  for (let i = 0; i < n; i++) {
    noktalar.push(birimNoktaTest(canvas, merkez, r, baslangicDerece + (360 / n) * i));
  }
  return noktalar;
}

const TUMU = {
  'cokgen-olusum': gorselCokgenOlusum,
  'cokgen-kenar': gorselCokgenKenar,
  'cokgen-adlari': gorselCokgenAdlari,
  'cokgen-degil': gorselCokgenDegil,
  'cokgen-gunluk': gorselCokgenGunluk,
  'kenar-kose': gorselKenarKose,
  'ic-acilar': gorselIcAcilar,
  'duzgun-cokgen': gorselDuzgunCokgen,
  'kare-dortgen': gorselKareDortgen,
  'fayans': gorselFayans,
  'cember': gorselCember,
  'yaricap': gorselYaricap,
  'cap': gorselCap,
  'pergel': gorselPergel,
  'iki-cember': gorselIkiCember,
  'ucgen-turleri': gorselUcgenTurleri,
  'kesisim-kosulu': gorselKesisimKosulu,
  'cember-ucgen': gorselCemberUcgen,
  'ucgen-kenarlari': gorselUcgenKenarlari,
  'ucgen-neden': gorselUcgenNeden,
  'esit-yaricap': gorselEsitYaricap
};

// --- 1) Ortak sozlesme, hepsi icin -----------------------------------

test('21 gorselin hepsi: ciz() dokunmadan once atmaz, bir sey cizer, ipucu turkce dolu bir cumle', () => {
  assert.equal(Object.keys(TUMU).length, 21, 'gorsel sayisi 21 olmali');
  for (const [ad, kur] of Object.entries(TUMU)) {
    const { canvas, baglam } = sahteKok();
    const w = kur(canvas, {});
    assert.equal(typeof w.ciz, 'function', `${ad}: ciz yok`);
    assert.equal(typeof w.dokun, 'function', `${ad}: dokun yok`);
    assert.equal(typeof w.ipucu, 'string', `${ad}: ipucu yok`);
    assert.ok(w.ipucu.length > 0, `${ad}: ipucu bos`);
    assert.match(w.ipucu, /[çÇğĞıİöÖşŞüÜ]/, `${ad}: ipucu turkce gorunmuyor`);
    w.ciz();
    assert.ok(baglam.cagrilar.length > 1, `${ad}: hicbir sey cizilmedi`);
  }
});

test('21 gorselin hepsi: ciz() iki kez cagrilinca cokmez', () => {
  for (const [ad, kur] of Object.entries(TUMU)) {
    const { canvas } = sahteKok();
    const w = kur(canvas, {});
    w.ciz();
    w.ciz();
    assert.ok(true, ad);
  }
});

// --- 2) Her gorsel icin: dokunma neyi degistiriyor, ozel olarak -------
//
// Her satir once-durum ile sonra-durumu karsilastirir ve FARKIN dersin
// anlattigi seyle ayni oldugunu kontrol eder (sadece cagri sayisi degil).

const DAVRANIS = [];
function ekle(ad, calistir) { DAVRANIS.push({ ad, calistir }); }

ekle('cokgen-olusum', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCokgenOlusum(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Sırayla nokta koy, doğrular birbirini kessin');

  w.dokun({ x: 0.2, y: 0.2 });
  w.dokun({ x: 0.6, y: 0.2 });
  w.dokun({ x: 0.6, y: 0.6 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'İlk noktaya dokunursan şekil kapanır',
    'ucuncu noktadan sonra hala acik olmali');

  w.dokun({ x: 0.19, y: 0.19 }); // ilk noktaya yakin: kapanmali
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kapandı: 3 kenarlı bir çokgen oldu',
    'ilk noktaya donunce kapanmali ve kenar sayisini soylemeli');
});

ekle('cokgen-kenar', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCokgenKenar(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kenarlara dokun: 0 / 5');

  const merkez = { x: 0.5, y: 0.46 };
  const noktalar = cokgenNoktalariTest(canvas, merkez, 4, 5);
  for (let i = 0; i < 5; i++) {
    const a = noktalar[i];
    const b = noktalar[(i + 1) % 5];
    w.dokun({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  assert.equal(sonAltYazi(baglam.cagrilar), '5 kenar buldun: doğrunun tamamı değil, sadece bu parça',
    'bes kenara da dokununca hepsi sayilmali');
});

ekle('cokgen-adlari', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCokgenAdlari(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), `${COKGENLER[0].kenar} kenar: ${COKGENLER[0].ad}`);

  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), `${COKGENLER[1].kenar} kenar: ${COKGENLER[1].ad}`,
    'dokununca bir sonraki cokgene gecmeli (isim COKGENLER motorundan)');
});

ekle('cokgen-degil', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCokgenDegil(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Son doğru ilkiyle kesişmiyor: kapanmadı, çokgen değil');
  assert.equal(sayac(baglam.cagrilar, 'quadraticCurveTo'), 0, 'acik durumda egri kenar olmamali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Bu kenar eğri: kenarlar doğru parçası olmalı, çokgen değil');
  assert.ok(sayac(baglam.cagrilar, 'quadraticCurveTo') > 0, 'bu durumda gercekten egri bir kenar cizilmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Şimdi kapalı ve kenarları doğru parçası: bu bir çokgen');
  assert.equal(sayac(baglam.cagrilar, 'quadraticCurveTo'), 0, 'kapali cokgende egri kenar olmamali');
});

ekle('cokgen-gunluk', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCokgenGunluk(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Dur levhası sekizgendir: sekiz kenarı var');
  assert.equal(sayac(baglam.cagrilar, 'stroke'), 8, 'sekizgenin 8 kenari cizilmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Yön levhaları çoğunlukla dörtgendir');
  assert.equal(sayac(baglam.cagrilar, 'stroke'), 4, 'dortgenin 4 kenari cizilmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Arı peteği altıgen: yan yana boşluksuz dizilir');
  assert.equal(sayac(baglam.cagrilar, 'stroke'), 18, 'uc altigenin toplam 18 kenari cizilmeli');
});

ekle('kenar-kose', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselKenarKose(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Köşeleri say: 0 / 5');

  const merkez = { x: 0.5, y: 0.46 };
  const noktalar = cokgenNoktalariTest(canvas, merkez, 4, 5);
  for (const n of noktalar) w.dokun(n);
  assert.equal(sonAltYazi(baglam.cagrilar), '5 köşe de var: kenar sayısına eşit çıktı');
});

ekle('ic-acilar', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselIcAcilar(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Köşelere dokun, açıları gör: 0 / 6');
  assert.equal(sayac(baglam.cagrilar, 'fill'), 0, 'hic kose dokunulmadan aci yayi olmamali');

  const merkez = { x: 0.5, y: 0.46 };
  const noktalar = cokgenNoktalariTest(canvas, merkez, 4, 6);
  for (let i = 0; i < noktalar.length; i++) {
    baglam.cagrilar.length = 0;
    w.dokun(noktalar[i]);
    assert.equal(sayac(baglam.cagrilar, 'fill'), i + 1,
      `${i + 1}. koseye dokununca tam ${i + 1} aci yayi cizili olmali`);
  }
  assert.equal(sonAltYazi(baglam.cagrilar), '6 iç açı da var: köşe sayısına eşit');
});

ekle('duzgun-cokgen', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselDuzgunCokgen(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Bütün kenarlar ve açılar eşit: düzgün çokgen');
  const oncekiStroke = sayac(baglam.cagrilar, 'stroke'); // 5 kenar + 5 tik

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Bir köşe öne çıktı: iki kenar artık farklı, düzgün değil');
  const sonrakiStroke = sayac(baglam.cagrilar, 'stroke'); // 5 kenar + 3 tik
  assert.ok(sonrakiStroke < oncekiStroke,
    'bozulunca esitlik tik isareti sayisi azalmali (once 10, sonra 8)');
  assert.equal(oncekiStroke, 10);
  assert.equal(sonrakiStroke, 8);
});

ekle('kare-dortgen', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselKareDortgen(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kare: dört kenarı da eşit, hem dörtgen hem kare');
  const oncekiEtiketler = fillTextler(baglam.cagrilar).filter((m) => /cm$/.test(m));
  assert.equal(oncekiEtiketler.length, 4);
  assert.equal(new Set(oncekiEtiketler).size, 1, 'karede dort kenar etiketi de ayni olmali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Bu da dörtgen ama kenarları eşit değil: kare değil');
  const sonrakiEtiketler = fillTextler(baglam.cagrilar).filter((m) => /cm$/.test(m));
  assert.equal(sonrakiEtiketler.length, 4);
  assert.ok(new Set(sonrakiEtiketler).size > 1, 'kare olmayan dortgende kenar uzunluklari ayni olmamali');
});

ekle('fayans', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselFayans(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Dokun, Kare fayansları birleştir');

  for (let i = 0; i < 5; i++) w.dokun({ x: 0.5, y: 0.5 }); // 4 tas + tamamlama kontrolu
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kare döşenince boşluk kalmıyor');
  assert.equal(fillStyleGecmisi(baglam.cagrilar, RENK.silik), 0, 'karede bosluk dilimi cizilmemeli');

  baglam.cagrilar.length = 0;
  for (let i = 0; i < 5; i++) w.dokun({ x: 0.5, y: 0.5 }); // gecis + 3 tas + tamamlama
  assert.equal(sonAltYazi(baglam.cagrilar), 'Altıgen döşenince boşluk kalmıyor');
  assert.equal(fillStyleGecmisi(baglam.cagrilar, RENK.silik), 0, 'altigende de bosluk dilimi cizilmemeli');

  baglam.cagrilar.length = 0;
  for (let i = 0; i < 5; i++) w.dokun({ x: 0.5, y: 0.5 }); // gecis + 3 tas + tamamlama
  assert.equal(sonAltYazi(baglam.cagrilar), 'Beşgen döşenince boşluk kalıyor');
  assert.ok(fillStyleGecmisi(baglam.cagrilar, RENK.silik) > 0,
    'besgende gercek bir bosluk dilimi cizilmeli - besgen duzlemi doseyemez');
});

ekle('cember', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCember(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Merkeze aynı uzaklıkta noktalar koy');

  const merkezPx = { x: 0.5 * canvas.width, y: 0.48 * canvas.height };
  const rPx = 5 * (Math.min(canvas.width, canvas.height) / 20);
  const dokunuslar = [
    { x: 0.7, y: 0.48 }, { x: 0.5, y: 0.68 }, { x: 0.3, y: 0.48 }, { x: 0.5, y: 0.28 }
  ];
  for (const p of dokunuslar.slice(0, -1)) w.dokun(p);
  baglam.cagrilar.length = 0; // ciz() her seferinde TUMUNU yeniden cizer; son dokunustan
  w.dokun(dokunuslar[dokunuslar.length - 1]); // sonraki tek cizimi izole ediyoruz.
  assert.equal(sonAltYazi(baglam.cagrilar), 'Bütün bu noktalar merkeze eşit uzaklıkta: çember budur');

  const noktaCagrilari = arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5);
  assert.equal(noktaCagrilari.length, 4, 'dort nokta konulmus olmali');
  for (const n of noktaCagrilari) {
    const uzaklik = Math.hypot(n.x - merkezPx.x, n.y - merkezPx.y);
    assert.ok(Math.abs(uzaklik - rPx) < 0.6,
      `konulan nokta merkeze yaricap kadar uzak olmali (${uzaklik} vs ${rPx})`);
  }
});

ekle('yaricap', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselYaricap(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Çember üzerinde bir nokta seç, yarıçapı gör');

  const merkezPx = { x: 0.5 * canvas.width, y: 0.48 * canvas.height };
  const rPx = 5 * (Math.min(canvas.width, canvas.height) / 20);
  w.dokun({ x: 0.7, y: 0.48 });
  baglam.cagrilar.length = 0; // sadece son (tam) cizimi izole et
  w.dokun({ x: 0.5, y: 0.68 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Hangi noktayı seçersen seç [MK] hep aynı uzunlukta');

  const kNoktalari = arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5);
  assert.equal(kNoktalari.length, 2, 'iki K noktasi da cizili tutulmali');
  for (const k of kNoktalari) {
    const uzaklik = Math.hypot(k.x - merkezPx.x, k.y - merkezPx.y);
    assert.ok(Math.abs(uzaklik - rPx) < 0.6, 'her K noktasi merkeze yaricap kadar uzak olmali');
  }
});

ekle('cap', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCap(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Çember üzerinde bir nokta seç, çapı gör');
  assert.equal(arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5).length, 0,
    'hic dokunmadan cap ucu olmamali');

  w.dokun({ x: 0.7, y: 0.48 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Çap merkezden geçer: uç uca eklenmiş iki yarıçaptır');

  const merkezPx = { x: 0.5 * canvas.width, y: 0.48 * canvas.height };
  const rPx = 5 * (Math.min(canvas.width, canvas.height) / 20);
  const uclar = arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5);
  assert.equal(uclar.length, 2, 'capin iki ucu da cizilmeli');
  const [u1, u2] = uclar;
  const ortaX = (u1.x + u2.x) / 2;
  const ortaY = (u1.y + u2.y) / 2;
  assert.ok(Math.hypot(ortaX - merkezPx.x, ortaY - merkezPx.y) < 0.6,
    'capin iki ucunun ortasi merkez olmali');
  assert.ok(Math.abs(Math.hypot(u1.x - u2.x, u1.y - u2.y) - 2 * rPx) < 1,
    'cap uzunlugu iki yaricapa esit olmali');
});

ekle('pergel', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselPergel(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Pergelin sivri ucunu bastır: merkezi seç');
  assert.equal(sayac(baglam.cagrilar, 'arc'), 0, 'merkez secilmeden hicbir sey cizilmemeli');

  w.dokun({ x: 0.4, y: 0.4 }); // merkez
  assert.equal(sonAltYazi(baglam.cagrilar), 'Şimdi açıklığı belirleyecek noktayı seç');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.6, y: 0.5 }); // kalem ucu, aciklik belirlenir
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kalemli ucu bir tur döndür');
  // r > 10 filtresi kucuk nokta isaretcilerini (r=4,5px) disarida birakir,
  // sadece gercek yay/cember cizimlerini birakir.
  let acilar = arcCagrilari(baglam.cagrilar).filter((a) => a.r > 10).map((a) => Math.abs(a.bit - a.bas));
  assert.ok(acilar.length > 0, 'aciklik belirlenince bir yay cizilmeli');
  assert.ok(acilar.every((s) => s < 6), 'tur tamamlanmadan once tam cember (2*pi) cizilmemeli');
  assert.ok(acilar.some((s) => s > 5), 'aciklik belirlenince genis bir yay gorunmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 }); // tamamla
  assert.equal(sonAltYazi(baglam.cagrilar), 'Pergel açıklığı sabit kaldı: tam bir çember çıktı');
  acilar = arcCagrilari(baglam.cagrilar).filter((a) => a.r > 10).map((a) => Math.abs(a.bit - a.bas));
  assert.ok(acilar.some((s) => s > 6.2), 'tamamlaninca gercek bir tam cember cizilmeli');
});

ekle('iki-cember', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselIkiCember(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'İki çemberi üst üste bindirdik: iki noktada kesişiyorlar');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 0, 'sadece cemberler varken cizgi olmamali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Merkezleri birleştirdik');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 1, 'merkezler birlesince tek bir cizgi olmali');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Kesişim noktasını da birleştirince üçgen ortaya çıktı');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 3, 'ucgenin uc kenari da cizilmeli');
});

ekle('cember-ucgen', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselCemberUcgen(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'İki tabağı üst üste bindirince kenarları iki yerde çakışıyor');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 0);

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'İşte iki kesişim noktası');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 0,
    'bu asamada sadece iki nokta gorunur, henuz cizgi yok - iki-cember\'den farki bu');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Merkezler ve bir kesişim noktasıyla üçgen kuruluyor');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 3);
});

ekle('ucgen-kenarlari', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselUcgenKenarlari(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'Dokun, kenarların hangi uzunluk olduğunu gör');
  assert.equal(fillTextler(baglam.cagrilar).filter((m) => m === 'yarıçap').length, 0);

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(fillTextler(baglam.cagrilar).filter((m) => m === 'yarıçap').length, 1);

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(fillTextler(baglam.cagrilar).filter((m) => m === 'yarıçap').length, 2);

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), 'Üçgenin üç kenarı: iki yarıçap ve merkezler arası uzaklık');
  assert.equal(fillTextler(baglam.cagrilar).filter((m) => m === 'merkezler arası').length, 1);
});

ekle('ucgen-neden', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselUcgenNeden(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), 'K noktası her iki çemberin de üzerinde');
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 0, 'once hicbir kenar cizilmemeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.match(sonAltYazi(baglam.cagrilar), /M1K birinci yarıçap kadar/);
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 1, 'sadece M1K cizilmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.match(sonAltYazi(baglam.cagrilar), /M2K ikinci yarıçap kadar/);
  assert.equal(sayac(baglam.cagrilar, 'lineTo'), 2, 'artik hem M1K hem M2K cizilmeli');
});

ekle('esit-yaricap', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselEsitYaricap(canvas, {});
  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), `Şu anki üçgen: ${UCGEN_TURU_ADI[ucgenTuru(4, 7, 8)]}`,
    'baslangic durumu motordaki ucgenTuru ile eslesmeli');
  assert.equal(ucgenTuru(4, 7, 8), 'cesitkenar');

  w.dokun({ x: 0.5, y: 0.5 }); // r2 = r1 olur
  assert.equal(sonAltYazi(baglam.cagrilar), `Şu anki üçgen: ${UCGEN_TURU_ADI[ucgenTuru(4, 4, 8)]}`);
  assert.equal(ucgenTuru(4, 4, 8), 'ikizkenar');

  w.dokun({ x: 0.5, y: 0.5 }); // d = r1 de olur
  assert.equal(sonAltYazi(baglam.cagrilar), `Şu anki üçgen: ${UCGEN_TURU_ADI[ucgenTuru(4, 4, 4)]}`);
  assert.equal(ucgenTuru(4, 4, 4), 'eskenar');
});

ekle('kesisim-kosulu', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselKesisimKosulu(canvas, {});
  w.ciz();
  assert.equal(kesisirMi(5, 3, 12), false, 'oracle: 12 uzakliginda kesismemeli');
  assert.equal(sonAltYazi(baglam.cagrilar), 'Merkezler çok uzak: çemberler değmiyor');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(kesisirMi(5, 3, 5), true, 'oracle: 5 uzakliginda kesismeli');
  assert.equal(sonAltYazi(baglam.cagrilar), 'Merkezler arası uzaklık uygun: iki noktada kesişiyorlar');
  assert.equal(arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5).length, 2,
    'kesisince iki kesisim noktasi da cizilmeli');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(kesisirMi(5, 3, 1), false, 'oracle: 1 uzakliginda (ic ice) kesismemeli');
  assert.equal(sonAltYazi(baglam.cagrilar), 'Küçük çember büyüğün içinde kaldı: yine kesişmiyor');
  assert.equal(arcCagrilari(baglam.cagrilar).filter((a) => a.r === 5).length, 0,
    'ic ice durumda kesisim noktasi olmamali');
});

ekle('ucgen-turleri', () => {
  const { canvas, baglam } = sahteKok();
  const w = gorselUcgenTurleri(canvas, {});

  w.ciz();
  assert.equal(sonAltYazi(baglam.cagrilar), UCGEN_TURU_ADI[ucgenTuru(5, 5, 5)]);
  assert.equal(ucgenTuru(5, 5, 5), 'eskenar');

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), UCGEN_TURU_ADI[ucgenTuru(5, 5, 7)]);
  assert.equal(ucgenTuru(5, 5, 7), 'ikizkenar');
  const tikSayisiIkizkenar = sayac(baglam.cagrilar, 'stroke') - 3; // 3 kenar + tikler

  baglam.cagrilar.length = 0;
  w.dokun({ x: 0.5, y: 0.5 });
  assert.equal(sonAltYazi(baglam.cagrilar), UCGEN_TURU_ADI[ucgenTuru(4, 6, 7)]);
  assert.equal(ucgenTuru(4, 6, 7), 'cesitkenar');
  const tikSayisiCesitkenar = sayac(baglam.cagrilar, 'stroke') - 3;

  assert.equal(tikSayisiCesitkenar, 0, 'ucu de farkli kenarda tik isareti olmamali');
  assert.ok(tikSayisiIkizkenar > tikSayisiCesitkenar, 'ikizkenarda esit kenarlar tikle isaretlenmeli');
});

for (const { ad, calistir } of DAVRANIS) {
  test(`davranis: ${ad}`, calistir);
}

test('davranis satirlari 21 gorselin tumunu kapsiyor', () => {
  const kapsanan = new Set(DAVRANIS.map((d) => d.ad));
  for (const ad of Object.keys(TUMU)) {
    assert.ok(kapsanan.has(ad), `${ad} icin davranis satiri eksik`);
  }
});
