// tests/ingilizce-cumle.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parcala, cumleKarti, dogruMu, cumleOturumu, cumleDurumu } from '../src/engines/ingilizce/cumle.js';
import { soyleBitir, cumleBitir, bosIngHafta, ingHaftaDurumu } from '../src/engines/ingilizce/ders.js';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { ING_HAFTALAR } from '../src/data/ingilizce/haftalar.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

test('cumle kelimelere bolunur, son noktalama AYRI tutulur', () => {
  // Nokta son kelimeye yapisik kalsaydi hangi kelimenin sona gidecegi
  // belli olurdu; soru kendini cozerdi.
  assert.deepEqual(parcala('My teacher is very kind.'),
    { parcalar: ['My', 'teacher', 'is', 'very', 'kind'], son: '.' });
  assert.deepEqual(parcala('Can I borrow your eraser?'),
    { parcalar: ['Can', 'I', 'borrow', 'your', 'eraser'], son: '?' });
  assert.deepEqual(parcala("Please don't run in the corridor."),
    { parcalar: ['Please', "don't", 'run', 'in', 'the', 'corridor'], son: '.' });
});

test('noktalamasiz cumle bos son ile doner', () => {
  assert.deepEqual(parcala('I go home'), { parcalar: ['I', 'go', 'home'], son: '' });
});

test('karisik sira HICBIR tohumda dogru siraya esit degil', () => {
  // "Please speak slowly" uc kelime: rastgele karistirma 1/6 ihtimalle
  // dogru sirayi verir, 200 tohumda bu mutlaka olur. Uzun cumlede
  // ihtimal cok dusuk kaldigi icin korumasi test edilemezdi.
  for (const id of ['speak', 'teacher']) {
    const kelime = SOZLUK.find((k) => k.id === id);
    for (let s = 0; s < 200; s++) {
      const k = cumleKarti(kelime, tohumluRng(s));
      assert.notDeepEqual(k.karisik.map((p) => p.metin), k.parcalar,
        `${id}, tohum ${s}: karisik sira zaten dogru, soru bedava`);
    }
  }
});

test('karisik parcalar dogru parcalarla AYNI coklu kume', () => {
  const kelime = SOZLUK.find((k) => k.id === 'chess-club');
  const k = cumleKarti(kelime, tohumluRng(3));
  assert.deepEqual(k.karisik.map((p) => p.metin).sort(), [...k.parcalar].sort());
  assert.equal(new Set(k.karisik.map((p) => p.id)).size, k.karisik.length,
    'ayni kelime iki kez geciyorsa bile her parcanin kendi id si olmali');
});

test('kart Turkce anlami ve ses kimligini tasir', () => {
  const kelime = SOZLUK.find((k) => k.id === 'library');
  const k = cumleKarti(kelime, tohumluRng(1));
  assert.equal(k.tr, kelime.ornek.tr);
  assert.equal(k.ses, 'en/library-ornek');
  assert.equal(k.tam, kelime.ornek.en);
});

test('dogruMu METNE bakar, parca kimligine degil', () => {
  // "We play chess in the chess club": iki "chess" yer degistirse de
  // cumle aynidir ve dogru sayilmalidir.
  const parcalar = ['We', 'play', 'chess', 'in', 'the', 'chess', 'club'];
  assert.equal(dogruMu(['We', 'play', 'chess', 'in', 'the', 'chess', 'club'], parcalar), true);
  assert.equal(dogruMu(['We', 'play', 'in', 'chess', 'the', 'chess', 'club'], parcalar), false);
  assert.equal(dogruMu(['We', 'play'], parcalar), false, 'eksik dizilim dogru sayilmamali');
});

test('oturum haftanin cumlelerinden istenen sayida ve TEKRARSIZ', () => {
  const h = ING_HAFTALAR[0];
  const o = cumleOturumu(h, SOZLUK, tohumluRng(4), 5);
  assert.equal(o.length, 5);
  assert.equal(new Set(o.map((k) => k.kelimeId)).size, 5);
  for (const k of o) assert.ok(h.kelimeler.includes(k.kelimeId));
});

test('tek kelimelik ornek cumle oturuma ALINMAZ', () => {
  // Dizilecek bir sey yoksa soru olmaz.
  const sahte = [{ id: 'x', ornek: { en: 'Hello.', tr: 'Merhaba.' } },
    { id: 'y', ornek: { en: 'I am here.', tr: 'Buradayim.' } }];
  const o = cumleOturumu({ kelimeler: ['x', 'y'] }, sahte, tohumluRng(1), 5);
  assert.deepEqual(o.map((k) => k.kelimeId), ['y']);
});

test('cumle durumu dizilen ve kalan parcalari ayirir', () => {
  const kart = cumleKarti(SOZLUK.find((k) => k.id === 'speak'), tohumluRng(2));
  const ilk = kart.karisik[0];
  const d = cumleDurumu(kart, [ilk.id]);
  assert.deepEqual(d.dizili, [ilk]);
  assert.equal(d.kalan.length, kart.parcalar.length - 1);
  assert.ok(!d.kalan.includes(ilk));
  assert.equal(d.tamam, false);
  assert.equal(d.dogru, false, 'eksik dizilim dogru sayilmamali');
});

test('dogru sirayla dizilince tamam ve dogru', () => {
  const kart = cumleKarti(SOZLUK.find((k) => k.id === 'speak'), tohumluRng(2));
  const sirali = kart.parcalar.map((m) => kart.karisik.find((p) => p.metin === m).id);
  const d = cumleDurumu(kart, sirali);
  assert.equal(d.tamam, true);
  assert.equal(d.dogru, true);
  const ters = [...sirali].reverse();
  assert.equal(cumleDurumu(kart, ters).dogru, false);
});

test('tekrarlanan ya da bilinmeyen id parcayi COGALTMAZ', () => {
  const kart = cumleKarti(SOZLUK.find((k) => k.id === 'speak'), tohumluRng(2));
  const id = kart.karisik[0].id;
  const d = cumleDurumu(kart, [id, id, 'yok']);
  assert.equal(d.dizili.length, 1);
  assert.equal(d.dizili.length + d.kalan.length, kart.parcalar.length);
});

test('soyle ve cumle bitisi yildiz VERMEZ ama asamayi tamamlar', () => {
  const s = soyleBitir(bosIngHafta());
  assert.equal(s.kazanilanYildiz, 0);
  assert.equal(s.kayit.soyleBitti, true);
  const c = cumleBitir(s.kayit);
  assert.equal(c.kazanilanYildiz, 0);
  assert.equal(c.kayit.cumleBitti, true);
  const d = ingHaftaDurumu(['a'], c.kayit);
  assert.equal(d.asamalar.soyle.tamam, true);
  assert.equal(d.asamalar.cumle.tamam, true);
  assert.deepEqual(c.kayit.yildizAlinan, [], 'odul defterine hicbir sey yazilmamali');
});
