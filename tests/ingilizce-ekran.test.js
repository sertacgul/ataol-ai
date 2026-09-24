import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingHaftaKarti, kartModeli, dinleSecModeli } from '../src/views/ingilizce.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

const H4 = ING_HAFTALAR[0];

test('hafta karti bes asamayi ve ilerlemeyi tasir', () => {
  const k = ingHaftaKarti(H4, SOZLUK, { haftalar: {} });
  assert.equal(k.no, 4);
  assert.equal(k.kelimeSayisi, H4.kelimeler.length);
  assert.equal(Object.keys(k.durum.asamalar).length, 5);
  assert.equal(k.durum.yuzde, 0);
});

test('kart modeli sozlukten TUM alanlari getirir', () => {
  const m = kartModeli(H4, SOZLUK, 0);
  for (const alan of ['id', 'en', 'tr', 'gorsel', 'ornek']) {
    assert.ok(alan in m.kelime, `kartta ${alan} yok`);
  }
  assert.equal(m.index, 0);
  assert.equal(m.toplam, H4.kelimeler.length);
  assert.equal(m.sonMu, false);
});

test('kart indexi sinirlarin disina tasmaz', () => {
  assert.equal(kartModeli(H4, SOZLUK, -5).index, 0);
  assert.equal(kartModeli(H4, SOZLUK, 999).index, H4.kelimeler.length - 1);
  assert.equal(kartModeli(H4, SOZLUK, 999).sonMu, true);
});

test('dinle-sec gorselli kelimede GORSEL secenek verir', () => {
  const gorselli = H4.kelimeler.find((id) => SOZLUK.find((k) => k.id === id).tur === 'isim');
  const m = dinleSecModeli(H4, SOZLUK, tohumluRng(1), gorselli);
  assert.equal(m.bicim, 'gorsel');
  assert.equal(m.secenekler.length, 4);
  for (const s of m.secenekler) assert.ok(s.gorsel, 'gorsel secenek gorsel tasimali');
});

test('dinle-sec fiil ve ifadede METIN secenek verir', () => {
  // 46 kelimenin 40'i isim, 6'si fiil/ifade. Fiil icin dort RESIM
  // gostermek zayif bir soru olurdu; bicim ture gore degisiyor.
  //
  // Fiiller 6. haftada. Bu testi 4. haftayla yazip "fiil yoksa atla"
  // demek, testin hicbir zaman calismamasi demekti - planin olcume
  // dayanan tek kararini korumasiz birakirdi.
  const fiilHaftasi = ING_HAFTALAR.find((h) =>
    h.kelimeler.some((id) => SOZLUK.find((k) => k.id === id).tur !== 'isim'));
  assert.ok(fiilHaftasi,
    'hicbir haftada fiil/ifade yok; bicim ayrimi test edilemez hale gelmis');

  const fiilId = fiilHaftasi.kelimeler.find((id) =>
    SOZLUK.find((k) => k.id === id).tur !== 'isim');
  const m = dinleSecModeli(fiilHaftasi, SOZLUK, tohumluRng(1), fiilId);

  assert.equal(m.bicim, 'metin', `${fiilId} icin metin secenek beklenirdi`);
  for (const s of m.secenekler) assert.ok(s.metin, 'metin secenek metin tasimali');
});

test('dinle-sec bicimi TUM kelimelerde ture uyuyor', () => {
  // Tek bir kelimeyi degil, kurali pinler.
  for (const h of ING_HAFTALAR) {
    for (const id of h.kelimeler) {
      const kelime = SOZLUK.find((k) => k.id === id);
      const m = dinleSecModeli(h, SOZLUK, tohumluRng(3), id);
      const beklenen = kelime.tur === 'isim' ? 'gorsel' : 'metin';
      assert.equal(m.bicim, beklenen, `${id} (${kelime.tur}) -> ${m.bicim}`);
    }
  }
});

test('dinle-sec dogru secenek GERCEKTEN dogru', () => {
  for (let s = 0; s < 50; s++) {
    for (const id of H4.kelimeler) {
      const m = dinleSecModeli(H4, SOZLUK, tohumluRng(s), id);
      assert.equal(m.secenekler[m.dogru].id, id, `tohum ${s}, kelime ${id}`);
      assert.equal(new Set(m.secenekler.map((x) => x.id)).size, 4, 'secenek tekrari');
    }
  }
});
