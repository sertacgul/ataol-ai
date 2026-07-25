import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_SIZE, SHIP_SIZES, createBoard, cellId, parseCell,
  fire, isDefeated, aiChoose, remainingShips
} from '../src/engines/battleship.js';

const sirali = () => { let i = 0; return () => ((i++ * 0.137) % 1); };

test('tahta dogru boyutta ve dogru gemilerle kurulur', () => {
  const b = createBoard(sirali());
  assert.equal(b.size, BOARD_SIZE);
  assert.equal(b.ships.length, SHIP_SIZES.length);
  for (let i = 0; i < SHIP_SIZES.length; i++) {
    assert.equal(b.ships[i].cells.length, SHIP_SIZES[i], `gemi ${i} yanlis boyutta`);
  }
});

test('gemiler cakismaz', () => {
  for (let n = 0; n < 50; n++) {
    const b = createBoard(() => (n * 0.019 + 0.001) % 1);
    const hepsi = b.ships.flatMap((s) => s.cells);
    assert.equal(hepsi.length, new Set(hepsi).size, 'cakisan gemi var');
  }
});

test('gemiler tahta disina tasmaz', () => {
  for (let n = 0; n < 50; n++) {
    const b = createBoard(() => (n * 0.019 + 0.001) % 1);
    for (const s of b.ships) {
      for (const c of s.cells) {
        const { x, y } = parseCell(c);
        assert.ok(x >= 0 && x < BOARD_SIZE, `${c} yatayda tasti`);
        assert.ok(y >= 0 && y < BOARD_SIZE, `${c} dikeyde tasti`);
      }
    }
  }
});

test('gemi kareleri bitisik ve tek yonlu', () => {
  const b = createBoard(sirali());
  for (const s of b.ships) {
    const p = s.cells.map(parseCell);
    const ayniSatir = p.every((c) => c.y === p[0].y);
    const ayniSutun = p.every((c) => c.x === p[0].x);
    assert.ok(ayniSatir || ayniSutun, 'gemi duz degil');
    const eksen = ayniSatir ? p.map((c) => c.x) : p.map((c) => c.y);
    eksen.sort((a, c) => a - c);
    for (let i = 1; i < eksen.length; i++) {
      assert.equal(eksen[i], eksen[i - 1] + 1, 'gemi kareleri bitisik degil');
    }
  }
});

test('cellId ve parseCell birbirinin tersi', () => {
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      assert.deepEqual(parseCell(cellId(x, y)), { x, y });
    }
  }
});

test('bos kareye atis iska', () => {
  const b = createBoard(sirali());
  const dolu = new Set(b.ships.flatMap((s) => s.cells));
  const bos = [...Array(BOARD_SIZE * BOARD_SIZE).keys()]
    .map((i) => cellId(i % BOARD_SIZE, Math.floor(i / BOARD_SIZE)))
    .find((c) => !dolu.has(c));
  const r = fire(b, bos);
  assert.equal(r.result, 'miss');
  assert.equal(r.board.shots[bos], 'miss');
});

test('gemi karesine atis isabet', () => {
  const b = createBoard(sirali());
  const hedef = b.ships[0].cells[0];
  const r = fire(b, hedef);
  assert.equal(r.result, 'hit');
  assert.equal(r.board.shots[hedef], 'hit');
});

test('geminin son karesi batirir', () => {
  let b = createBoard(sirali());
  const gemi = b.ships[0];
  let son = null;
  for (const c of gemi.cells) son = fire(b, c), b = son.board;
  assert.equal(son.result, 'sunk');
  assert.equal(son.shipId, gemi.id);
});

test('ayni kareye ikinci atis durumu degistirmez', () => {
  const b = createBoard(sirali());
  const hedef = b.ships[0].cells[0];
  const bir = fire(b, hedef);
  const iki = fire(bir.board, hedef);
  assert.equal(iki.result, 'already');
  assert.deepEqual(iki.board, bir.board);
});

test('tum gemiler batinca oyun biter', () => {
  let b = createBoard(sirali());
  assert.equal(isDefeated(b), false);
  for (const s of b.ships) for (const c of s.cells) b = fire(b, c).board;
  assert.equal(isDefeated(b), true);
});

test('remainingShips batmayan gemi sayisini verir', () => {
  let b = createBoard(sirali());
  assert.equal(remainingShips(b), SHIP_SIZES.length);
  for (const c of b.ships[0].cells) b = fire(b, c).board;
  assert.equal(remainingShips(b), SHIP_SIZES.length - 1);
});

test('aiChoose atilmamis kare secer', () => {
  let b = createBoard(sirali());
  const secilen = new Set();
  for (let i = 0; i < 30; i++) {
    const c = aiChoose(b, () => (i * 0.041 + 0.007) % 1);
    assert.ok(c, 'null dondu');
    assert.ok(!b.shots[c], `zaten atilmis kare secildi: ${c}`);
    secilen.add(c);
    b = fire(b, c).board;
  }
  assert.equal(secilen.size, 30, 'ayni kare iki kez secildi');
});

test('aiChoose isabetten sonra komsu kareye yonelir', () => {
  let b = createBoard(sirali());
  const gemi = b.ships.find((s) => s.cells.length >= 3);
  b = fire(b, gemi.cells[1]).board;
  const { x, y } = parseCell(gemi.cells[1]);
  const komsular = [cellId(x - 1, y), cellId(x + 1, y), cellId(x, y - 1), cellId(x, y + 1)];
  let komsuSecildi = 0;
  for (let i = 0; i < 20; i++) {
    const c = aiChoose(b, () => (i * 0.053 + 0.011) % 1);
    if (komsular.includes(c)) komsuSecildi++;
  }
  assert.ok(komsuSecildi > 0, 'isabetten sonra komsuya hic yonelmedi');
});

test('tahta JSON turuna dayanir', () => {
  const b = createBoard(sirali());
  const geri = JSON.parse(JSON.stringify(b));
  assert.deepEqual(geri, b, 'Set veya Map kullanilmis olabilir');
});

test('rakip isabetten sonra her zaman komsuya yonelmez', () => {
  let b = createBoard(() => 0.3);
  const gemi = b.ships.find((s) => s.cells.length >= 3);
  b = fire(b, gemi.cells[1]).board;

  const { x, y } = parseCell(gemi.cells[1]);
  const komsular = [cellId(x - 1, y), cellId(x + 1, y), cellId(x, y - 1), cellId(x, y + 1)];

  let komsu = 0;
  let uzak = 0;
  for (let i = 0; i < 400; i++) {
    const c = aiChoose(b, () => (i * 0.0073 + 0.0011) % 1);
    if (komsular.includes(c)) komsu++; else uzak++;
  }

  assert.ok(komsu > 0, 'hic komsuya yonelmedi, takip tamamen kapali');
  assert.ok(uzak > 0, 'her zaman komsuya yoneldi, cocuk surekli kaybeder');
});
