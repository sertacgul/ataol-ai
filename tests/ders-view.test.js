import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, TATILLER } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { adimKimligi, haftaKarti, ekranDurumu, gezinmeHedefleri, anlatimModeli, ornekModeli } from '../src/views/ders.js';

const SAHTE_KONULAR = {
  'temel-cizimler': {
    id: 'temel-cizimler',
    ad: { tr: 'Temel Geometrik Çizimler' },
    seviyeler: [
      { seviye: 1, baslik: 'Nokta ve doğru', anlatim: [{ id: 'a1', metin: '...' }, { id: 'a2', metin: '...' }] },
      { seviye: 2, baslik: 'Işın ve dikme', anlatim: [{ id: 'a1', metin: '...' }] }
    ]
  }
};

test('adimKimligi konu, seviye ve adimi birlestirir', () => {
  assert.equal(adimKimligi('temel-cizimler', 1, 'a1'), 'temel-cizimler-1-a1');
});

test('haftaKarti icerigi olan haftayi hazir isaretler', () => {
  const hafta = TAKVIM[0];
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Geometrik Şekiller', { haftalar: {} });
  assert.equal(k.no, 1);
  assert.equal(k.hazir, true);
  assert.equal(k.uniteAd, 'Geometrik Şekiller');
  assert.equal(k.dersler[0].konuAd, 'Temel Geometrik Çizimler');
  assert.equal(k.dersler[0].baslik, 'Nokta ve doğru');
});

test('haftaKarti adim kimliklerini konu ve seviyeyle niteler', () => {
  const k = haftaKarti(TAKVIM[0], SAHTE_KONULAR, 'Geometrik Şekiller', { haftalar: {} });
  assert.deepEqual(k.adimIdleri, ['temel-cizimler-1-a1', 'temel-cizimler-1-a2']);
});

test('haftaKarti icerigi olmayan haftayi hazir degil isaretler', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20); // kesir-gosterim, Faz 3
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Sayılar ve Nicelikler 2', { haftalar: {} });
  assert.equal(k.hazir, false);
  assert.deepEqual(k.adimIdleri, []);
});

test('haftaKarti iki derse bagli haftada iki dersi de listeler', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 14);
  const k = haftaKarti(hafta, SAHTE_KONULAR, 'Sayılar ve Nicelikler 1', { haftalar: {} });
  assert.equal(k.dersler.length, 2);
});

test('haftaKarti ilerlemeyi durum olarak tasir', () => {
  const ilerleme = {
    haftalar: { 1: { anlatim: ['temel-cizimler-1-a1', 'temel-cizimler-1-a2'], etkilesimBitti: true } }
  };
  const k = haftaKarti(TAKVIM[0], SAHTE_KONULAR, 'Geometrik Şekiller', ilerleme);
  assert.equal(k.durum.asamalar.anlatim.tamam, true);
  assert.equal(k.durum.yuzde, 50);
});

test('ekranDurumu ders gununde ders dondurur', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-09-16', null);
  assert.equal(e.tip, 'ders');
  assert.equal(e.hafta.hafta, 1);
});

test('ekranDurumu tatilde tatil dondurur', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-11-18', null);
  assert.equal(e.tip, 'tatil');
  assert.equal(e.ad, '1. Dönem Ara Tatili');
});

test('ekranDurumu yil baslamadan once once dondurur', () => {
  assert.equal(ekranDurumu(TAKVIM, TATILLER, '2026-08-01', null).tip, 'once');
});

test('ekranDurumu yil bittikten sonra sonra dondurur', () => {
  assert.equal(ekranDurumu(TAKVIM, TATILLER, '2027-08-01', null).tip, 'sonra');
});

test('ekranDurumu sabitHafta tatilde bile dersi gosterir', () => {
  const e = ekranDurumu(TAKVIM, TATILLER, '2026-11-18', 5);
  assert.equal(e.tip, 'ders');
  assert.equal(e.hafta.hafta, 5);
});

test('gezinmeHedefleri tatilde onceki ve sonraki ders haftasini bulur', () => {
  const durum = ekranDurumu(TAKVIM, TATILLER, '2026-11-18', null); // 1. Donem Ara Tatili
  const h = gezinmeHedefleri(TAKVIM, durum);
  assert.equal(h.geri, 9);
  assert.equal(h.ileri, 10);
});

test('gezinmeHedefleri ilk haftada geri hedefi yok', () => {
  const durum = ekranDurumu(TAKVIM, TATILLER, '2026-09-16', null); // 1. hafta
  const h = gezinmeHedefleri(TAKVIM, durum);
  assert.equal(h.geri, null);
  assert.equal(h.ileri, 2);
});

test('gezinmeHedefleri dersi olan son haftada ileri hedefi yok', () => {
  const durum = ekranDurumu(TAKVIM, TATILLER, '2027-06-16', null); // 36. hafta, 37. haftanin dersi yok
  const h = gezinmeHedefleri(TAKVIM, durum);
  assert.equal(h.geri, 35);
  assert.equal(h.ileri, null);
});

test('gezinmeHedefleri normal haftada iki komsu haftayi da dondurur', () => {
  const durum = ekranDurumu(TAKVIM, TATILLER, '2027-02-15', null); // 20. hafta
  const h = gezinmeHedefleri(TAKVIM, durum);
  assert.equal(h.geri, 19);
  assert.equal(h.ileri, 21);
});

const IKI_KONU = {
  ...SAHTE_KONULAR,
  'dikdortgen': {
    id: 'dikdortgen',
    ad: { tr: 'Dikdörtgen' },
    seviyeler: [{ seviye: 1, baslik: 'Çevre', anlatim: [{ id: 'a1', metin: 'Çevre...' }] }]
  }
};

test('anlatimModeli adimlari sirayla duzlestirir', () => {
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 0);
  assert.equal(m.toplam, 2);
  assert.equal(m.adimlar[0].kimlik, 'temel-cizimler-1-a1');
  assert.equal(m.adimlar[1].kimlik, 'temel-cizimler-1-a2');
  assert.equal(m.aktif.kimlik, 'temel-cizimler-1-a1');
  assert.equal(m.sonMu, false);
});

test('anlatimModeli iki konulu haftada iki konunun adimlarini birlestirir', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 14);
  const m = anlatimModeli(hafta, IKI_KONU, { haftalar: {} }, 0);
  // hafta 14: dort-islem-problem (yazilmamis) + dikdortgen seviye 1
  assert.equal(m.toplam, 1);
  assert.equal(m.adimlar[0].kimlik, 'dikdortgen-1-a1');
  assert.equal(m.adimlar[0].konuAd, 'Dikdörtgen');
});

test('anlatimModeli son adimi isaretler', () => {
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 1);
  assert.equal(m.sonMu, true);
});

test('anlatimModeli index sinirlari disina tasmaz', () => {
  const ust = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, 99);
  assert.equal(ust.index, 1, 'son adimda kirpilmali');
  const alt = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, { haftalar: {} }, -5);
  assert.equal(alt.index, 0, 'ilk adimda kirpilmali');
});

test('anlatimModeli tamamlanan adimlari isaretler', () => {
  const ilerleme = { haftalar: { 1: { anlatim: ['temel-cizimler-1-a1'] } } };
  const m = anlatimModeli(TAKVIM[0], SAHTE_KONULAR, ilerleme, 0);
  assert.deepEqual(m.tamamlanan, ['temel-cizimler-1-a1']);
});

test('anlatimModeli icerigi olmayan haftada bos doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  const m = anlatimModeli(hafta, SAHTE_KONULAR, { haftalar: {} }, 0);
  assert.equal(m.toplam, 0);
  assert.equal(m.aktif, null);
});

const HAFTA1 = TAKVIM[0];

test('ornekModeli haftanin ilk ornegini verir', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 0);
  assert.ok(m.ornek, 'ornek yok');
  assert.ok(m.ornek.soru.length > 15);
  assert.equal(m.konuAd, 'Temel Geometrik Çizimler');
  assert.ok(m.toplam >= 2, 'ornek en az iki adimli olmali');
});

test('acikAdim 0 iken hicbir cozum adimi gorunmez', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 0);
  assert.deepEqual(m.acik, []);
  assert.equal(m.bitti, false);
});

test('acikAdim arttikca adimlar sirayla acilir', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 2);
  assert.equal(m.acik.length, 2);
  assert.equal(m.acik[0], m.ornek.adimlar[0]);
  assert.equal(m.acik[1], m.ornek.adimlar[1]);
  assert.equal(m.bitti, false);
});

test('tum adimlar acilinca bitti olur', () => {
  const m = ornekModeli(HAFTA1, KONULAR, 99);
  assert.equal(m.acik.length, m.toplam);
  assert.equal(m.bitti, true);
});

test('negatif acikAdim sifira kirpilir', () => {
  assert.deepEqual(ornekModeli(HAFTA1, KONULAR, -5).acik, []);
});

test('icerigi olmayan haftada ornek null doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  assert.equal(ornekModeli(hafta, KONULAR, 0).ornek, null);
});
