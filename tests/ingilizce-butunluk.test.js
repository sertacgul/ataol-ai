import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';
import { ara, kelimeKimligi } from '../src/engines/ingilizce/sozluk.js';

test('her kelimenin temasi gercekten var', () => {
  const no = new Set(TEMALAR.map((t) => t.no));
  for (const k of SOZLUK) {
    assert.ok(no.has(k.tema), `${k.id} olmayan temaya bagli: ${k.tema}`);
  }
});

test('her kelime kendi Ingilizcesiyle aranabiliyor', () => {
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, k.en);
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} kendi Ingilizcesiyle ("${k.en}") bulunamiyor`);
  }
});

test('her kelime kendi Turkcesiyle aranabiliyor', () => {
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, k.tr);
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} kendi Turkcesiyle ("${k.tr}") bulunamiyor`);
  }
});

test('her kelime Turkcesinin DIAKRITIKSIZ hali ile de bulunuyor', () => {
  const duz = (m) => m.toLocaleLowerCase('tr')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, duz(k.tr));
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} diakritiksiz Turkcesiyle ("${duz(k.tr)}") bulunamiyor`);
  }
});

test('ses dosyasi adi uretim ve okuma tarafinda AYNI', () => {
  for (const k of SOZLUK) {
    assert.equal(`en/${k.id}`, `en/${kelimeKimligi(k.en)}`,
      `${k.en}: uretim ve okuma tarafi farkli ad uretiyor`);
  }
});

test('kapsam raporu', () => {
  const emoji = SOZLUK.filter((k) => k.gorsel.tip === 'emoji').length;
  const cizim = SOZLUK.length - emoji;
  const temalar = new Set(SOZLUK.map((k) => k.tema));
  console.log(`  kelime: ${SOZLUK.length} | emoji: ${emoji} | cizim: ${cizim} | tema: ${[...temalar].sort().join(',')}`);
  assert.ok(SOZLUK.length > 0);
});
