import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAKVIM } from '../src/data/mufredat.js';
import { KONULAR } from '../src/data/konular/index.js';
import { alistirmaSorusu } from '../src/views/ders.js';
import { bosHafta, alistirmaCevap } from '../src/engines/ders.js';
import { sozlesmeyiDogrula, tohumluRng } from './yardim/soru-sozlesmesi.js';

const HAFTA1 = TAKVIM[0];

test('alistirmaSorusu gecerli bir soru uretir', () => {
  for (let t = 1; t <= 100; t++) {
    const s = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(t));
    assert.ok(s, 'soru uretilmedi');
    sozlesmeyiDogrula(s.soru, `alistirma tohum ${t}`);
    assert.equal(s.ureticiId, 'temel-cizimler');
    assert.equal(s.seviye, 1);
  }
});

test('alistirmaSorusu icerigi olmayan haftada null doner', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 20);
  assert.equal(alistirmaSorusu(hafta, KONULAR, bosHafta(), tohumluRng(1)), null);
});

// Not: brief'teki orijinal ad "iki konulu haftada iki konudan da soru
// gelir" yaniltici, cunku 8. hafta tek konuya (cokgenler-cember)
// baglidir. Gercek iki konulu durum dikdortgen'e bagli ve Faz 2 icerigi,
// simdi test edilemez. Bu test tek konulu bir haftanin sorularinin o
// tek konudan geldigini dogrular.
test('tek konulu haftada sorular o konudan gelir', () => {
  const hafta = TAKVIM.find((h) => h.hafta === 8);
  const ureticiler = new Set();
  for (let t = 1; t <= 100; t++) {
    ureticiler.add(alistirmaSorusu(hafta, KONULAR, bosHafta(), tohumluRng(t)).ureticiId);
  }
  assert.ok(ureticiler.size >= 1);
  for (const u of ureticiler) assert.ok(['cokgenler-cember'].includes(u), u);
});

test('zayif kutudaki tip daha sik gelir', () => {
  // 'temel-cizimler-arac' tipini 1. kutuya, digerlerini 5. kutuya koy.
  let kayit = bosHafta();
  kayit = alistirmaCevap(kayit, 'temel-cizimler-arac', { box: 1 }, false).kayit;
  kayit = alistirmaCevap(kayit, 'temel-cizimler-tanim', { box: 5 }, true).kayit;

  let zayifSayisi = 0;
  for (let t = 1; t <= 400; t++) {
    const s = alistirmaSorusu(HAFTA1, KONULAR, kayit, tohumluRng(t));
    if (s.soru.tip === 'temel-cizimler-arac') zayifSayisi++;
  }
  assert.ok(zayifSayisi > 200,
    `zayif tip 400 denemede yalniz ${zayifSayisi} kez geldi, Leitner agirligi calismiyor`);
});

test('ayni tohum ayni soruyu uretir', () => {
  const a = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(7));
  const b = alistirmaSorusu(HAFTA1, KONULAR, bosHafta(), tohumluRng(7));
  assert.deepEqual(a, b);
});
