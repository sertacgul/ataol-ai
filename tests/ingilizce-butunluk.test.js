import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SOZLUK } from '../src/data/ingilizce/sozluk/index.js';
import { TEMALAR } from '../src/data/ingilizce/temalar.js';
import { ara, kelimeKimligi, normalize } from '../src/engines/ingilizce/sozluk.js';

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
  // Diakritik katlama burada kendi .replace zincirini tutmaz: motorun
  // normalize()'i kullanilir. Ayri bir kopya, motordaki DUZ tablosu
  // degisince (harf eklenince/cikinca) buradan habersiz kalip sessizce
  // yanlis pozitif/negatif uretirdi - DUZ_DESEN'in tablodan turetilmesiyle
  // bu dalda zaten bir kez duzeltilen ikinci kaynak sorunu.
  for (const k of SOZLUK) {
    const s = ara(SOZLUK, normalize(k.tr));
    assert.ok(s.some((x) => x.kelime.id === k.id),
      `${k.id} diakritiksiz Turkcesiyle ("${normalize(k.tr)}") bulunamiyor`);
  }
});

test('ses dosyasi adi uretim ve okuma tarafinda AYNI', () => {
  for (const k of SOZLUK) {
    assert.equal(`en/${k.id}`, `en/${kelimeKimligi(k.en)}`,
      `${k.en}: uretim ve okuma tarafi farkli ad uretiyor`);
  }
});

test('her kelimenin mp3 dosyalari gercekten diskte var', () => {
  // Yukaridaki isim testi ayni gercegi iki tarafa yapistirip karsilastirir,
  // uretici (tools/ses-uret.js) ile tuketiciyi (src/main.js) hic gormez.
  // Ikisinden biri degisip ad uretimi kayarsa bu test yesil kalirdi ve
  // Dinle dugmesi sessizce cihaz TTS'ine duserdi. Burada gercek dosyanin
  // diskte olup olmadigina bakilir.
  for (const k of SOZLUK) {
    const kelimeYolu = new URL(`../sesler/en/${k.id}.mp3`, import.meta.url);
    const ornekYolu = new URL(`../sesler/en/${k.id}-ornek.mp3`, import.meta.url);
    assert.ok(existsSync(kelimeYolu), `${k.id}: sesler/en/${k.id}.mp3 yok`);
    assert.ok(existsSync(ornekYolu), `${k.id}: sesler/en/${k.id}-ornek.mp3 yok`);
  }
});

test('kapsam raporu', () => {
  const emoji = SOZLUK.filter((k) => k.gorsel.tip === 'emoji').length;
  const cizim = SOZLUK.length - emoji;
  const temalar = new Set(SOZLUK.map((k) => k.tema));
  console.log(`  kelime: ${SOZLUK.length} | emoji: ${emoji} | cizim: ${cizim} | tema: ${[...temalar].sort().join(',')}`);
  assert.ok(SOZLUK.length > 0);
});
