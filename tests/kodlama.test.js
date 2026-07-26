import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calistir, SEVIYELER, YON_DELTA, KOMUTLAR } from '../src/engines/kodlama.js';

// Bir seviyenin cozulebilir olup olmadigini durum uzayinda BFS ile arar.
// Durum: x,y,yon. Cozulmez seviye gondermeyelim diye test.
function cozulebilir(seviye) {
  const engel = new Set((seviye.engeller ?? []).map((e) => `${e.x},${e.y}`));
  const bas = seviye.baslangic;
  const anahtar = (s) => `${s.x},${s.y},${s.yon}`;
  const kuyruk = [{ x: bas.x, y: bas.y, yon: bas.yon }];
  const gorulen = new Set([anahtar(kuyruk[0])]);
  while (kuyruk.length) {
    const s = kuyruk.shift();
    if (s.x === seviye.hedef.x && s.y === seviye.hedef.y) return true;
    const komsular = [
      { x: s.x, y: s.y, yon: (s.yon + 1) % 4 },
      { x: s.x, y: s.y, yon: (s.yon + 3) % 4 }
    ];
    const nx = s.x + YON_DELTA[s.yon][0];
    const ny = s.y + YON_DELTA[s.yon][1];
    const disari = nx < 0 || ny < 0 || nx >= seviye.en || ny >= seviye.boy;
    if (!disari && !engel.has(`${nx},${ny}`)) komsular.push({ x: nx, y: ny, yon: s.yon });
    for (const k of komsular) {
      if (!gorulen.has(anahtar(k))) { gorulen.add(anahtar(k)); kuyruk.push(k); }
    }
  }
  return false;
}

test('duz cizgi: ileri x4 hedefe ulasir', () => {
  const s = SEVIYELER[0];
  const sonuc = calistir(s, ['ileri', 'ileri', 'ileri', 'ileri']);
  assert.equal(sonuc.basarili, true);
  assert.equal(sonuc.carpma, false);
});

test('izgara disina cikis carpma sayilir, orada durur', () => {
  const s = SEVIYELER[0];
  const sonuc = calistir(s, ['ileri', 'ileri', 'ileri', 'ileri', 'ileri']);
  assert.equal(sonuc.carpma, true);
  assert.equal(sonuc.basarili, false);
  // Carpmadan onceki son gecerli kare hedefte kalir.
  assert.equal(sonuc.son.x, 4);
});

test('engele ileri gitmek carpmadir', () => {
  const s = SEVIYELER[2];
  // s3: (2,4) yukari bakar, onunde (2,3) bos, (2,2) engel.
  const sonuc = calistir(s, ['ileri', 'ileri']);
  assert.equal(sonuc.carpma, true);
});

test('donme kareyi degistirmez, yonu degistirir', () => {
  const s = SEVIYELER[0];
  const sonuc = calistir(s, ['sag']);
  assert.equal(sonuc.son.x, s.baslangic.x);
  assert.equal(sonuc.son.y, s.baslangic.y);
  assert.equal(sonuc.son.yon, (s.baslangic.yon + 1) % 4);
});

test('sol donme saga gore ters yon', () => {
  const s = SEVIYELER[0];
  assert.equal(calistir(s, ['sol']).son.yon, (s.baslangic.yon + 3) % 4);
});

test('adimlar baslangicla baslar ve her komut bir adim ekler', () => {
  const s = SEVIYELER[0];
  const sonuc = calistir(s, ['sag', 'sol', 'ileri']);
  assert.equal(sonuc.adimlar[0].tur, 'baslangic');
  assert.equal(sonuc.adimlar.length, 4);
});

test('seviye idleri benzersiz, hedef baslangic/engel degil', () => {
  const ids = SEVIYELER.map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const s of SEVIYELER) {
    assert.ok(!(s.hedef.x === s.baslangic.x && s.hedef.y === s.baslangic.y), `${s.id} hedef=baslangic`);
    for (const e of s.engeller) {
      assert.ok(!(e.x === s.hedef.x && e.y === s.hedef.y), `${s.id} hedef engelde`);
      assert.ok(!(e.x === s.baslangic.x && e.y === s.baslangic.y), `${s.id} baslangic engelde`);
    }
  }
});

test('her seviye cozulebilir (BFS)', () => {
  for (const s of SEVIYELER) assert.ok(cozulebilir(s), `${s.id} cozulemez`);
});

test('KOMUTLAR beklenen kume', () => {
  assert.deepEqual([...KOMUTLAR].sort(), ['ileri', 'sag', 'sol']);
});
