import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM, UNITELER } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { uniteSinaviDurumu } from '../src/views/ders.js';

const bosIlerleme = { haftalar: {}, sinavlar: {} };

// 1-8. haftalarin quizini gecmis bir ilerleme uretir.
function quizleriGec(haftalar) {
  const out = { haftalar: {}, sinavlar: {} };
  for (const h of haftalar) {
    out.haftalar[String(h)] = {
      anlatim: [], etkilesimBitti: true, alistirma: {}, alistirmaDogru: 10,
      quiz: { enIyi: 80, denemeler: 1 }, yildizAlinan: ['anlatim', 'etkilesim', 'quiz']
    };
  }
  return out;
}

test('hicbir hafta bitmemisken unite sinavi kapalidir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', bosIlerleme, KONULAR);
  assert.equal(d.acik, false);
  assert.ok(d.sebep.length > 0, 'neden kapali oldugu soylenmelidir');
});

test('bazi haftalar bitmisken hala kapalidir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', quizleriGec([1, 2, 3]), KONULAR);
  assert.equal(d.acik, false);
});

test('unitenin tum haftalarinin quizi gecilince acilir', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', quizleriGec([1, 2, 3, 4, 5, 6, 7, 8]), KONULAR);
  assert.equal(d.acik, true);
  assert.equal(d.sinavId, 'unite-geometrik-sekiller');
});

test('daha once girilmis sinavin puani dondurulur', () => {
  const ilerleme = quizleriGec([1, 2, 3, 4, 5, 6, 7, 8]);
  ilerleme.sinavlar['unite-geometrik-sekiller'] = { puan: 84, gecti: true, tip: 'unite', yildizAlindi: true };
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'geometrik-sekiller', ilerleme, KONULAR);
  assert.equal(d.puan, 84);
  assert.equal(d.gecti, true);
});

test('icerigi yazilmamis unite icin sinav acilmaz', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'sayilar-2', quizleriGec([19, 20, 21, 22, 23, 24, 25]), KONULAR);
  assert.equal(d.acik, false);
});

test('bilinmeyen unite kimliginde kapali doner, atmaz', () => {
  const d = uniteSinaviDurumu(TAKVIM, UNITELER, 'boyle-bir-unite-yok', bosIlerleme, KONULAR);
  assert.equal(d.acik, false);
});
