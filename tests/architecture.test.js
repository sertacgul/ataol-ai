import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function jsFiles(dir) {
  const out = [];
  for (const isim of readdirSync(dir)) {
    const tam = path.join(dir, isim);
    if (statSync(tam).isDirectory()) out.push(...jsFiles(tam));
    else if (isim.endsWith('.js')) out.push(tam);
  }
  return out;
}

const TUM = jsFiles(SRC).map((f) => ({
  yol: path.relative(SRC, f).replace(/\\/g, '/'),
  src: readFileSync(f, 'utf8')
}));

// Yasak belirtecler parcali yaziliyor ki bu dosyanin kendisi guvenlik
// tarayicilarina takilmasin ve tarama kapsami genislerse kendini
// eslesmesin.
const SINKLER = ['inner' + 'HTML', 'outer' + 'HTML', 'insertAdjacent' + 'HTML', 'document.' + 'write', 'eval' + '(', 'new ' + 'Function', 'src' + 'doc'];
const AG = ['fetch' + '(', 'XMLHttp' + 'Request', 'send' + 'Beacon', 'Web' + 'Socket'];

test('kaynak agacinda dosya bulundu', () => {
  assert.ok(TUM.length >= 10, `beklenenden az dosya: ${TUM.length}`);
});

test('hicbir dosya HTML enjeksiyon sinki icermez', () => {
  for (const { yol, src } of TUM) {
    for (const y of SINKLER) {
      assert.ok(!src.includes(y), `${yol} icinde "${y}" var`);
    }
  }
});

test('views core ve engines DOM api si icermez', () => {
  for (const { yol, src } of TUM) {
    if (!/^(views|core|engines)\//.test(yol)) continue;
    for (const y of ['document', 'window.', 'addEventListener']) {
      assert.ok(!src.includes(y), `${yol} icinde "${y}" olmamali`);
    }
  }
});

test('engines saf kalir, saat okumaz', () => {
  for (const { yol, src } of TUM) {
    if (!yol.startsWith('engines/')) continue;
    assert.ok(!/new Date\(\s*\)/.test(src), `${yol} argumansiz new Date() kullaniyor`);
    assert.ok(!src.includes('Date.now()'), `${yol} Date.now() kullaniyor`);
    assert.ok(!src.includes('Math.random()'), `${yol} dogrudan Math.random() cagiriyor`);
  }
});

test('core ve engines icinde kisi adi sabit yazili degil', () => {
  for (const { yol, src } of TUM) {
    if (!/^(core|engines)\//.test(yol)) continue;
    for (const isim of ['Deha', 'Feride', 'Sertaç', 'Sertac']) {
      assert.ok(!src.includes(isim), `${yol} icinde "${isim}" gecmemeli`);
    }
  }
});

test('gunluk modulu ag cagrisi icermez', () => {
  const diary = TUM.find(({ yol }) => yol === 'engines/diary.js');
  assert.ok(diary, 'engines/diary.js bulunamadi');
  for (const y of AG) {
    assert.ok(!diary.src.includes(y), `diary.js icinde "${y}" olmamali`);
  }
});

test('DOM sadece main.js ve ui altinda kullanilir', () => {
  for (const { yol, src } of TUM) {
    if (!src.includes('document')) continue;
    assert.ok(
      yol === 'main.js' || yol.startsWith('ui/'),
      `${yol} DOM kullanamaz; DOM yalniz main.js ve ui/ altinda yasar`
    );
  }
});

/**
 * Bagimlilik yonu. Hicbir test bunu olcmuyordu; yalnizca DOM kullanimi
 * ve motor safligi olculuyordu. Bu yuzden views/ders.js'in ui/ altindan
 * ithal etmesi sessizce gecti.
 *
 * Kural "views -> engines -> core" diye ozetlenir ama gercek degismez
 * bu degil: core/state.js dort ayri motordan ithal ediyor ve etmeli de,
 * cunku varsayilan durum sekillerini motor fabrikalarindan kuruyor.
 * Motorlar saf oldugu icin bu bagimlilik hicbir seyi kirmiyor.
 *
 * Asil onemli olan TERS yon: hicbir katman kendinden DISARIDAKI
 * (DOM'lu) katmandan ithal etmemeli. Test edilebilirligi koruyan sey bu.
 */
test('hicbir saf katman ui veya views icinden ithal etmez', () => {
  const YASAK = {
    core: ['views/', 'ui/'],
    engines: ['views/', 'ui/'],
    views: ['ui/']
  };

  for (const { yol, src } of TUM) {
    const katman = yol.split('/')[0];
    const yasaklar = YASAK[katman];
    if (!yasaklar) continue;

    for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
      const hedef = m[1];
      for (const y of yasaklar) {
        assert.ok(
          !hedef.includes(`/${y}`) && !hedef.startsWith(y),
          `${yol} -> ${hedef}: ${katman}/ katmani ${y} icinden ithal edemez`
        );
      }
    }
  }
});

/**
 * Tuvale yazilan Turkce metin diakritiklerini korur.
 *
 * ASCII kurali yorumlar ve tanimlayicilar icin; cocugun GORDUGU metin
 * tam Turkce yazilir. Bu ayrimi bu dalda uc kez karistirdim ve ucunde de
 * ancak ekran goruntusune bakinca fark ettim: tuvale "cember kenarlarini
 * surukle" yazmisim. Hicbir test gormuyordu cunku dizgi teknik olarak
 * gecerli.
 *
 * Kontrol kelime bazli ve kasten dar: listedeki her kelimenin Turkcesi
 * diakritiksiz YAZILAMAZ, yani eslesme kesin hatadir. "Kenarlar: 5 cm"
 * gibi zaten diakritiksiz mesru metinler etkilenmez.
 */
test('tuval metinleri diakritiksiz Turkce icermez', () => {
  const HATALI = [
    'cember', 'cizgi', 'cizim', 'kose', 'olcu', 'olcer', 'aciolcer',
    'yaricap', 'ucgen', 'cokgen', 'buyuk', 'kucuk', 'baslangic',
    'surukle', 'sec ', 'gor ', 'gorursun', 'dogru parcasi', 'isin ',
    'uzunlugu', 'degistir', 'icin '
  ];

  for (const { yol, src } of TUM) {
    if (!yol.startsWith('ui/')) continue;

    // Yalniz kullaniciya gorunen metin: tuvale yazilanlar ve ipucu.
    const metinler = [
      ...src.matchAll(/(?:altYazi|etiket|yaziCiz)\([^)]*?'([^']+)'/g),
      ...src.matchAll(/ipucu:\s*'([^']+)'/g),
      ...src.matchAll(/mesaj:\s*'([^']+)'/g)
    ].map((m) => m[1]);

    for (const metin of metinler) {
      const kucuk = metin.toLowerCase();
      for (const kelime of HATALI) {
        assert.ok(
          !kucuk.includes(kelime),
          `${yol}: cocugun gordugu metinde diakritiksiz "${kelime.trim()}" var -> "${metin}"`
        );
      }
    }
  }
});
