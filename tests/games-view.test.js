import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as gamesModule from '../src/views/games.js';
import { GAMES } from '../src/views/games.js';

const kaynak = readFileSync(new URL('../src/views/games.js', import.meta.url), 'utf8');

test('oyunlar listede ve kimlikleri sabit', () => {
  // main.js oyunu id ile aciyor; id degisirse dugme calismaz.
  assert.deepEqual(GAMES.map((g) => g.id).sort(), ['amiral', 'atolye', 'geometri', 'kahramanlar', 'kodlama', 'kurucu', 'matematik', 'muhendislik', 'rozetler', 'satranc', 'satranc-oyun']);
  assert.ok(GAMES.every((g) => g.title && g.icon));
});

test('oyunlar serbesttir: kilit mantigi geri gelmemeli', () => {
  // Kilit kaldirildi. Yeniden eklenirse bu modul rutini yeniden
  // import etmek zorunda kalir; yapisal olarak yakalanan sey bu.
  assert.ok(!kaynak.includes('routine.js'), 'games.js rutine bagimli olmamali');
  assert.ok(!kaynak.includes('unlocked'), 'kilit alani geri gelmis');
  assert.ok(!('gamesViewModel' in gamesModule), 'kilit gorunum modeli geri gelmis');
});

test('gorunum modulu DOM api si icermez', () => {
  for (const y of ['document', 'window.', 'addEventListener']) {
    assert.ok(!kaynak.includes(y), `games.js icinde "${y}" olmamali`);
  }
});
