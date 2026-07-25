/**
 * Amiral Batti.
 *
 * 8x8 ve dort gemi: standart 10x10 / bes gemi, dikkat suresi kisa bir
 * cocuk icin fazla uzun surer.
 *
 * Rakip kasten cok iyi degil. Rastgele atar, isabet alirsa komsu
 * karelere yonelir; parite optimizasyonu yok. Surekli kaybeden cocuk
 * oynamayi birakir, kazanabilmesi gerekir.
 *
 * Durum JSON'a yazilabilir olmali (localStorage), o yuzden Set ve Map
 * kullanilmaz.
 *
 * Saf modul: rastgelelik disaridan gelir.
 */

export const BOARD_SIZE = 8;
export const SHIP_SIZES = [4, 3, 3, 2];

const HARFLER = 'ABCDEFGH';

export function cellId(x, y) {
  return `${HARFLER[x]}${y + 1}`;
}

export function parseCell(id) {
  return { x: HARFLER.indexOf(id[0]), y: Number(id.slice(1)) - 1 };
}

function yerlestir(boyut, dolu, rng) {
  for (let deneme = 0; deneme < 500; deneme++) {
    const yatay = rng() < 0.5;
    const x = Math.floor(rng() * (yatay ? BOARD_SIZE - boyut + 1 : BOARD_SIZE));
    const y = Math.floor(rng() * (yatay ? BOARD_SIZE : BOARD_SIZE - boyut + 1));

    const cells = [];
    for (let i = 0; i < boyut; i++) {
      cells.push(yatay ? cellId(x + i, y) : cellId(x, y + i));
    }

    if (cells.every((c) => !dolu.has(c))) return cells;
  }
  return null;
}

export function createBoard(rng = Math.random) {
  const dolu = new Set();
  const ships = [];

  SHIP_SIZES.forEach((boyut, i) => {
    const cells = yerlestir(boyut, dolu, rng);
    if (!cells) return;
    cells.forEach((c) => dolu.add(c));
    ships.push({ id: i, size: boyut, cells, hits: [] });
  });

  return { size: BOARD_SIZE, ships, shots: {} };
}

export function fire(board, cell) {
  if (board.shots[cell]) return { board, result: 'already', shipId: null };

  const gemi = board.ships.find((s) => s.cells.includes(cell));

  if (!gemi) {
    return { board: { ...board, shots: { ...board.shots, [cell]: 'miss' } }, result: 'miss', shipId: null };
  }

  const ships = board.ships.map((s) =>
    s.id === gemi.id ? { ...s, hits: [...s.hits, cell] } : s
  );
  const guncel = ships.find((s) => s.id === gemi.id);
  const batti = guncel.hits.length === guncel.cells.length;

  return {
    board: { ...board, ships, shots: { ...board.shots, [cell]: 'hit' } },
    result: batti ? 'sunk' : 'hit',
    shipId: gemi.id
  };
}

export function remainingShips(board) {
  return board.ships.filter((s) => s.hits.length < s.cells.length).length;
}

export function isDefeated(board) {
  return remainingShips(board) === 0;
}

function komsular(cell) {
  const { x, y } = parseCell(cell);
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    .filter(([a, b]) => a >= 0 && a < BOARD_SIZE && b >= 0 && b < BOARD_SIZE)
    .map(([a, b]) => cellId(a, b));
}

export function aiChoose(board, rng = Math.random) {
  const atilmamis = (c) => !board.shots[c];

  // Batmamis gemilerdeki isabetlerin komsulari once denenir.
  const acikIsabetler = board.ships
    .filter((s) => s.hits.length > 0 && s.hits.length < s.cells.length)
    .flatMap((s) => s.hits);

  const hedefler = [...new Set(acikIsabetler.flatMap(komsular))].filter(atilmamis);
  if (hedefler.length > 0) return hedefler[Math.floor(rng() * hedefler.length)];

  const bos = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const c = cellId(x, y);
      if (atilmamis(c)) bos.push(c);
    }
  }

  return bos.length === 0 ? null : bos[Math.floor(rng() * bos.length)];
}
