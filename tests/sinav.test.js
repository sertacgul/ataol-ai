import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sinavKur, cevapla, puanla, agirlikHesapla } from '../src/engines/sinav.js';
import { TAKVIM } from '../src/data/mufredat.js';
import { sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

const KAYNAK = [
  { ureticiId: 'temel-cizimler', seviye: 1, agirlik: 1 },
  { ureticiId: 'aci-olcme', seviye: 1, agirlik: 1 }
];

const kur = (ust = {}) => sinavKur({
  kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70, aninda: true, ...ust
}, tohumluRng(1));

test('sinavKur istenen sayida soru uretir', () => {
  assert.equal(kur().sorular.length, 10);
  assert.equal(kur({ soruSayisi: 20 }).sorular.length, 20);
});

test('uretilen tum sorular sozlesmeye uyar', () => {
  for (let t = 1; t <= 50; t++) {
    const s = sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(t));
    s.sorular.forEach((soru, i) => sozlesmeyiDogrula(soru, `tohum ${t} soru ${i}`));
  }
});

test('sinav basladiginda cevaplar bostur', () => {
  const s = kur();
  assert.equal(s.cevaplar.length, 10);
  assert.ok(s.cevaplar.every((c) => c === null));
  assert.equal(s.bitti, false);
});

test('cevapla yalniz ilgili indeksi degistirir', () => {
  const s = cevapla(kur(), 3, 2);
  assert.equal(s.cevaplar[3], 2);
  assert.equal(s.cevaplar[0], null);
});

test('cevapla girdiyi degistirmez', () => {
  const s = kur();
  cevapla(s, 0, 1);
  assert.equal(s.cevaplar[0], null);
});

test('cevapla sinir disi indeksi yok sayar', () => {
  const s = kur();
  assert.deepEqual(cevapla(s, 99, 1).cevaplar, s.cevaplar);
  assert.deepEqual(cevapla(s, -1, 1).cevaplar, s.cevaplar);
});

test('cevap degistirilebilir', () => {
  let s = cevapla(kur(), 0, 1);
  s = cevapla(s, 0, 3);
  assert.equal(s.cevaplar[0], 3);
});

test('hepsi dogru cevaplaninca 100 alinir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, soru.dogru); });
  const p = puanla(s);
  assert.equal(p.dogru, 10);
  assert.equal(p.yuzde, 100);
  assert.equal(p.gecti, true);
});

test('hic cevaplanmayinca 0 alinir ve gecilemez', () => {
  const p = puanla(kur());
  assert.equal(p.dogru, 0);
  assert.equal(p.yuzde, 0);
  assert.equal(p.gecti, false);
});

test('yuzde gecme notuyla karsilastirilir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, i < 7 ? soru.dogru : (soru.dogru + 1) % soru.secenekler.length); });
  const p = puanla(s);
  assert.equal(p.yuzde, 70);
  assert.equal(p.gecti, true, 'gecme notuna esit puan gecer');
});

test('gecme notunun bir altinda gecilemez', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, i < 6 ? soru.dogru : (soru.dogru + 1) % soru.secenekler.length); });
  assert.equal(puanla(s).gecti, false);
});

test('konu bazli kirilim her kaynak icin sayi verir', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => { s = cevapla(s, i, soru.dogru); });
  const p = puanla(s);
  const toplam = Object.values(p.konuBazli).reduce((n, k) => n + k.toplam, 0);
  assert.equal(toplam, 10);
  for (const k of Object.values(p.konuBazli)) {
    assert.equal(k.dogru, k.toplam, 'hepsi dogruyken kirilim da tam olmali');
  }
});

// Uniform (hepsi dogru) bir cevap deseni yanlis atfetmeyi gizleyebilir:
// her sey tek bir yanlis anahtar altinda toplansa bile toplamlar yine
// dogru cikardi. Bu yuzden burada kaynaklari BAGIMSIZ bir isaretten
// (soru.tip onekinden, sinavin kendi soruKaynagi'ndan degil) ayirt edip
// ASIMETRIK cevapliyoruz: bir kaynak hep dogru, digeri hep yanlis. Yanlis
// atfetme (orn. her soruyu ilk kaynaga yazmak) bu deseni cignetir.
test('konu bazli kirilim her soruyu gercek kaynagina atfeder', () => {
  let s = kur();
  s.sorular.forEach((soru, i) => {
    const gercekKaynak = soru.tip.startsWith('temel-cizimler') ? 'temel-cizimler' : 'aci-olcme';
    const cevap = gercekKaynak === 'temel-cizimler'
      ? soru.dogru
      : (soru.dogru + 1) % soru.secenekler.length;
    s = cevapla(s, i, cevap);
  });

  const p = puanla(s);
  const tc = p.konuBazli['temel-cizimler'];
  const ao = p.konuBazli['aci-olcme'];

  assert.ok(tc && tc.toplam > 0, 'temel-cizimler hic soru almamis');
  assert.ok(ao && ao.toplam > 0, 'aci-olcme hic soru almamis');
  assert.equal(tc.toplam + ao.toplam, 10, 'iki kaynagin toplami soru sayisina esit olmali');
  assert.equal(tc.dogru, tc.toplam, 'temel-cizimler sorularinin hepsi dogru cevaplandi, kirilim bunu gostermeli');
  assert.equal(ao.dogru, 0, 'aci-olcme sorularinin hepsi yanlis cevaplandi, kirilim bunu gostermeli');
});

test('agirlikli kaynak daha cok soru alir', () => {
  const s = sinavKur({
    kaynaklar: [
      { ureticiId: 'temel-cizimler', seviye: 1, agirlik: 4 },
      { ureticiId: 'aci-olcme', seviye: 1, agirlik: 1 }
    ],
    soruSayisi: 20, gecmeNotu: 60
  }, tohumluRng(3));

  const sayim = {};
  for (const soru of s.sorular) {
    const k = soru.tip.startsWith('temel-cizimler') ? 'tc' : 'ao';
    sayim[k] = (sayim[k] ?? 0) + 1;
  }
  assert.ok(sayim.tc > sayim.ao, `agirlikli kaynak az soru aldi: ${JSON.stringify(sayim)}`);
  assert.ok(sayim.ao >= 1, 'dusuk agirlikli kaynak hic soru almamis');
});

test('agirlikHesapla unitenin konu seviyelerini sayar', () => {
  const k = agirlikHesapla(TAKVIM, 'geometrik-sekiller');
  const toplamAgirlik = k.reduce((n, x) => n + x.agirlik, 0);
  assert.equal(toplamAgirlik, 8, 'unite 1 de 8 konu-seviye var');
  assert.equal(k.filter((x) => x.ureticiId === 'cokgenler-cember').length, 4);
  assert.equal(k.filter((x) => x.ureticiId === 'temel-cizimler').length, 2);
});

test('ayni tohum ayni sinavi kurar', () => {
  assert.deepEqual(
    sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(9)),
    sinavKur({ kaynaklar: KAYNAK, soruSayisi: 10, gecmeNotu: 70 }, tohumluRng(9))
  );
});
