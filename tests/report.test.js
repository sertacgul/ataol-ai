import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ilerlemeSerisi, ilerlemeOzeti } from '../src/views/report.js';

const days = {
  '2026-07-24': { stars: 10, minutes: 40, cards: { a: { state: 'done' }, b: { state: 'done' }, c: { state: 'awaiting_approval' } } },
  '2026-07-25': { stars: 0, minutes: 0, cards: {} },
  '2026-07-26': { stars: 22, minutes: 60, cards: { a: { state: 'done' } } }
};
const anahtarlar = ['2026-07-24', '2026-07-25', '2026-07-26'];

test('seri her gun icin yildiz/dakika/tamamlanan verir, sirayi korur', () => {
  const seri = ilerlemeSerisi(days, anahtarlar);
  assert.deepEqual(seri.map((g) => g.key), anahtarlar);
  assert.equal(seri[0].stars, 10);
  assert.equal(seri[0].tamamlanan, 2, "'done' kartlar sayilir, 'awaiting_approval' sayilmaz");
  assert.equal(seri[2].dakika, 60);
});

test('veri olmayan gun sifir sayilir', () => {
  const seri = ilerlemeSerisi(days, ['2026-07-20', '2026-07-26']);
  assert.equal(seri[0].stars, 0);
  assert.equal(seri[0].tamamlanan, 0);
  assert.equal(seri[1].stars, 22);
});

test('ozet toplam, aktif gun ve en yuksegi hesaplar', () => {
  const ozet = ilerlemeOzeti(ilerlemeSerisi(days, anahtarlar));
  assert.equal(ozet.toplamYildiz, 32);
  assert.equal(ozet.aktifGun, 2, 'yildizi 0 olan gun aktif degil');
  assert.equal(ozet.enYuksek, 22);
  assert.equal(ozet.gunSayisi, 3);
});

test('bos seride cokmez', () => {
  const ozet = ilerlemeOzeti(ilerlemeSerisi({}, []));
  assert.deepEqual(ozet, { toplamYildiz: 0, aktifGun: 0, enYuksek: 0, gunSayisi: 0 });
});
