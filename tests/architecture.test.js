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
  const domlu = TUM.filter(({ src }) => src.includes('document')).map(({ yol }) => yol).sort();
  assert.deepEqual(domlu, ['main.js', 'ui/dom.js']);
});
