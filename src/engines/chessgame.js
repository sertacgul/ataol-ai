/**
 * Satranc OYUN motoru. Ogretme modundan (chess.js) ayridir: burada renk,
 * sira, sah tehdidi, mat ve pat vardir. chess.js "bu tas nereye gider"
 * sorusunu ogretir; bu modul gercek oyunu oynatir.
 *
 * Kapsam (baba karari): alti tasin tam hareketi, yasal hamle uretimi
 * (sahini acikta birakan hamle elenir), sah/mat/pat, piyon terfisi
 * (otomatik vezir). Rok ve gecerken alma YOK; cocuk icin kapsam disi.
 *
 * Tas kodu: renk + tip. renk 'b' (beyaz) ya da 's' (siyah). tip
 * chess.js ile ayni harfler: K Kale, A At, F Fil, V Vezir, S Sah,
 * P Piyon. Ornek 'bV' beyaz vezir, 'sP' siyah piyon.
 *
 * Beyaz asagida (sira 1-2), yukari dogru (artan sira) ilerler. Siyah
 * yukarida (sira 7-8), asagi ilerler. Beyaz once oynar.
 *
 * Durum: { tahta: { kare: tasKodu }, sira: 'b' | 's' }. Duz nesne, JSON'a
 * yazilabilir; Set/Map/fonksiyon TUTMAZ (localStorage'a gider).
 *
 * Saf modul: rastgelelik (AI'nin esit hamleler arasindaki secimi)
 * disaridan gelir; Date/Math.random/DOM yok.
 */

import { kareId, kareCoz, TAHTA_BOYU } from './chess.js';

// Materyal degerleri. Sah 0: sah alinmaz, degeri mat ile ayrica islenir.
export const DEGERLER = { P: 1, A: 3, F: 3, K: 5, V: 9, S: 0 };

const DUZ = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const CAPRAZ = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const KAYAN = { K: DUZ, F: CAPRAZ, V: [...DUZ, ...CAPRAZ] };
const AT_HAMLE = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const SAH_HAMLE = [...DUZ, ...CAPRAZ];

function icerde(x, y) {
  return x >= 0 && x < TAHTA_BOYU && y >= 0 && y < TAHTA_BOYU;
}

export function renkOf(tas) {
  return tas ? tas[0] : null;
}

export function tipOf(tas) {
  return tas ? tas[1] : null;
}

function rakip(renk) {
  return renk === 'b' ? 's' : 'b';
}

export function baslangicTahtasi() {
  const tahta = {};
  const arka = ['K', 'A', 'F', 'V', 'S', 'F', 'A', 'K'];
  for (let x = 0; x < TAHTA_BOYU; x++) {
    tahta[kareId(x, 0)] = 'b' + arka[x];
    tahta[kareId(x, 1)] = 'bP';
    tahta[kareId(x, 6)] = 'sP';
    tahta[kareId(x, 7)] = 's' + arka[x];
  }
  return { tahta, sira: 'b' };
}

// renk'in TEHDIT ettigi kareler. Sah kontrolu icin kullanilir, o yuzden
// hamle degil tehdit: piyon yalniz caprazi tehdit eder (ilerledigi kareyi
// degil). Donen Set icseldir, durumda saklanmaz.
function tehditKareler(tahta, renk) {
  const out = new Set();
  for (const kare in tahta) {
    const tas = tahta[kare];
    if (renkOf(tas) !== renk) continue;
    const tip = tipOf(tas);
    const { x, y } = kareCoz(kare);

    if (tip === 'P') {
      const dy = renk === 'b' ? 1 : -1;
      for (const dx of [-1, 1]) {
        if (icerde(x + dx, y + dy)) out.add(kareId(x + dx, y + dy));
      }
    } else if (tip === 'A' || tip === 'S') {
      const yonler = tip === 'A' ? AT_HAMLE : SAH_HAMLE;
      for (const [dx, dy] of yonler) {
        if (icerde(x + dx, y + dy)) out.add(kareId(x + dx, y + dy));
      }
    } else {
      for (const [dx, dy] of KAYAN[tip]) {
        let cx = x + dx;
        let cy = y + dy;
        while (icerde(cx, cy)) {
          const k = kareId(cx, cy);
          out.add(k);
          if (tahta[k]) break;
          cx += dx;
          cy += dy;
        }
      }
    }
  }
  return out;
}

export function sahKaresi(tahta, renk) {
  for (const kare in tahta) {
    if (tahta[kare] === renk + 'S') return kare;
  }
  return null;
}

export function sahTehditAltinda(tahta, renk) {
  const kare = sahKaresi(tahta, renk);
  if (!kare) return false;
  return tehditKareler(tahta, rakip(renk)).has(kare);
}

// Yasal olup olmadigina BAKMADAN uretilen hamleler (sah acilabilir).
function psodoHamleler(tahta, renk) {
  const out = [];
  for (const kare in tahta) {
    const tas = tahta[kare];
    if (renkOf(tas) !== renk) continue;
    const tip = tipOf(tas);
    const { x, y } = kareCoz(kare);

    if (tip === 'P') {
      const dy = renk === 'b' ? 1 : -1;
      const basY = renk === 'b' ? 1 : 6;
      if (icerde(x, y + dy)) {
        const on1 = kareId(x, y + dy);
        if (!tahta[on1]) {
          out.push({ from: kare, to: on1 });
          const on2 = kareId(x, y + 2 * dy);
          if (y === basY && !tahta[on2]) out.push({ from: kare, to: on2 });
        }
      }
      for (const dx of [-1, 1]) {
        if (!icerde(x + dx, y + dy)) continue;
        const c = kareId(x + dx, y + dy);
        if (tahta[c] && renkOf(tahta[c]) !== renk) out.push({ from: kare, to: c });
      }
    } else if (tip === 'A' || tip === 'S') {
      const yonler = tip === 'A' ? AT_HAMLE : SAH_HAMLE;
      for (const [dx, dy] of yonler) {
        if (!icerde(x + dx, y + dy)) continue;
        const c = kareId(x + dx, y + dy);
        if (!tahta[c] || renkOf(tahta[c]) !== renk) out.push({ from: kare, to: c });
      }
    } else {
      for (const [dx, dy] of KAYAN[tip]) {
        let cx = x + dx;
        let cy = y + dy;
        while (icerde(cx, cy)) {
          const c = kareId(cx, cy);
          if (!tahta[c]) {
            out.push({ from: kare, to: c });
          } else {
            if (renkOf(tahta[c]) !== renk) out.push({ from: kare, to: c });
            break;
          }
          cx += dx;
          cy += dy;
        }
      }
    }
  }
  return out;
}

// Hamleyi ham tahtaya uygular (sira cevirmez). Piyon son sira: otomatik
// vezir. Rok/gecerken alma olmadigi icin baska ozel durum yok.
function tahtaUygula(tahta, hamle) {
  const t = { ...tahta };
  const tas = t[hamle.from];
  delete t[hamle.from];

  let yeni = tas;
  if (tipOf(tas) === 'P') {
    const { y } = kareCoz(hamle.to);
    if ((renkOf(tas) === 'b' && y === TAHTA_BOYU - 1) || (renkOf(tas) === 's' && y === 0)) {
      yeni = renkOf(tas) + 'V';
    }
  }
  t[hamle.to] = yeni;
  return t;
}

export function yasalHamleler(durum) {
  const renk = durum.sira;
  return psodoHamleler(durum.tahta, renk).filter((h) => {
    const t2 = tahtaUygula(durum.tahta, h);
    return !sahTehditAltinda(t2, renk);
  });
}

export function hamleUygula(durum, hamle) {
  return { tahta: tahtaUygula(durum.tahta, hamle), sira: rakip(durum.sira) };
}

export function oyunDurumu(durum) {
  if (yasalHamleler(durum).length > 0) return 'devam';
  return sahTehditAltinda(durum.tahta, durum.sira) ? 'mat' : 'pat';
}

function materyal(tahta) {
  let toplam = 0;
  for (const kare in tahta) {
    const tas = tahta[kare];
    const deger = DEGERLER[tipOf(tas)];
    toplam += renkOf(tas) === 'b' ? deger : -deger;
  }
  return toplam;
}

// Negamax + alfa-beta. Skor daima "sira kimdeyse onun" bakisiyla. Mat:
// sira kimdeyse o kaybetti, cok buyuk eksi. Yaprakta materyal.
const MAT_SKOR = 100000;

function ara(durum, derinlik, alfa, beta) {
  if (derinlik === 0) {
    return (durum.sira === 'b' ? 1 : -1) * materyal(durum.tahta);
  }
  const yasal = yasalHamleler(durum);
  if (yasal.length === 0) {
    return sahTehditAltinda(durum.tahta, durum.sira) ? -MAT_SKOR : 0;
  }
  let en = -Infinity;
  for (const h of yasal) {
    const skor = -ara(hamleUygula(durum, h), derinlik - 1, -beta, -alfa);
    if (skor > en) en = skor;
    if (en > alfa) alfa = en;
    if (alfa >= beta) break;
  }
  return en;
}

/**
 * AI'nin hamlesi. Cok iyi degil (Amiral Batti gibi): cocuk kazanabilmeli.
 * derinlik 2 materyal degerlendirmesi bunu saglar; bedava tas alir, mati
 * gorur ama derin plan kurmaz. Esit en iyi hamleler arasinda rastgele
 * secer, o yuzden ayni konumda hep ayni oyunu oynamaz.
 */
export function enIyiHamle(durum, derinlik = 2, rng = Math.random) {
  const yasal = yasalHamleler(durum);
  if (yasal.length === 0) return null;

  let enSkor = -Infinity;
  let enler = [];
  for (const h of yasal) {
    const skor = -ara(hamleUygula(durum, h), derinlik - 1, -Infinity, Infinity);
    if (skor > enSkor) {
      enSkor = skor;
      enler = [h];
    } else if (skor === enSkor) {
      enler.push(h);
    }
  }
  return enler[Math.floor(rng() * enler.length)];
}
