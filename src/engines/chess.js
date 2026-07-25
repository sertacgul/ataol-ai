/**
 * Satranc tas hareket kurallari.
 *
 * Bu modul satranc OYNATMAZ. Sira, renk, sah tehdidi, mat, rok,
 * gecerken alma yoktur. Tek sorusu vardir: su kareye konan su tas
 * hangi karelere gidebilir. Satranci hic bilmeyen bir cocuga alti
 * tasin hareketini tek tek ogretmek icin bu kadari yeter.
 *
 * Renk yok. Tahtadaki her tas "alinabilir hedef" sayilir. Bu, oyun
 * satrancinda yanlis olurdu ama burada dogru: cocuk once "hangi
 * karelere ulasabilirim" sorusunu ogreniyor, kimin tasi oldugunu
 * degil.
 *
 * Tahta gosterimi: { [kare]: tasKod } duz nesne, ornek { d6: 'P' }.
 * Kare 'e4' bicimindedir. Donen deger her zaman string dizisidir;
 * Set/Map/fonksiyon donmez, cunku bu veri localStorage'a yazilabilir
 * olmali.
 */

const HARFLER = 'abcdefgh';

export const TAHTA_BOYU = 8;

export function kareId(x, y) {
  return `${HARFLER[x]}${y + 1}`;
}

export function kareCoz(kare) {
  return { x: HARFLER.indexOf(kare[0]), y: Number(kare.slice(1)) - 1 };
}

export const TUM_KARELER = (() => {
  const out = [];
  for (let y = 0; y < TAHTA_BOYU; y++) {
    for (let x = 0; x < TAHTA_BOYU; x++) out.push(kareId(x, y));
  }
  return out;
})();

const DUZ = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const CAPRAZ = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

// Kayan taslar: yon boyunca ilerler, ilk tasa kadar gider.
const KAYAN = {
  K: DUZ,
  F: CAPRAZ,
  V: [...DUZ, ...CAPRAZ]
};

// Sicrayan taslar: tek adim, aradaki kareler onemsiz.
const SICRAYAN = {
  S: [...DUZ, ...CAPRAZ],
  A: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
};

function icerde(x, y) {
  return x >= 0 && x < TAHTA_BOYU && y >= 0 && y < TAHTA_BOYU;
}

// Piyon tek istisnali tastir: ilerledigi kareyi ALAMAZ, aldigi kareye
// ise ilerleyemez. Ogretilecek sey tam olarak budur.
// Renk olmadigi icin piyon her zaman yukari (artan sira) gider.
function piyonKareleri(x, y, tahta) {
  const out = [];
  const on = icerde(x, y + 1) ? kareId(x, y + 1) : null;
  if (on && !tahta[on]) out.push(on);

  for (const dx of [-1, 1]) {
    if (!icerde(x + dx, y + 1)) continue;
    const capraz = kareId(x + dx, y + 1);
    if (tahta[capraz]) out.push(capraz);
  }
  return out;
}

export function hedefKareler(tasKod, kare, tahta = {}) {
  const { x, y } = kareCoz(kare);
  if (!icerde(x, y)) return [];

  if (tasKod === 'P') return piyonKareleri(x, y, tahta);

  const kayan = KAYAN[tasKod];
  if (kayan) {
    const out = [];
    for (const [dx, dy] of kayan) {
      let cx = x + dx;
      let cy = y + dy;
      while (icerde(cx, cy)) {
        const k = kareId(cx, cy);
        out.push(k);
        if (tahta[k]) break;
        cx += dx;
        cy += dy;
      }
    }
    return out;
  }

  const sicrayan = SICRAYAN[tasKod];
  if (sicrayan) {
    return sicrayan
      .filter(([dx, dy]) => icerde(x + dx, y + dy))
      .map(([dx, dy]) => kareId(x + dx, y + dy));
  }

  return [];
}

// Ogretim sirasi sistem mantigina gore: kale, fil, vezir, sah, at,
// piyon. Vezir ucuncudur cunku kale ile filin birlesimidir; cocuk yeni
// bir kural degil, bildigi iki kuralin toplandigini gorur. Piyon
// sondadir cunku tek istisnali tastir; istisna, kural oturduktan sonra
// ogrenilir.
export const PIECES = [
  {
    kod: 'K',
    ad: 'Kale',
    anlat: 'Kale düz gider. Yukarı, aşağı, sağa, sola. Önüne çıkan taşta durur, o taşı alabilir.'
  },
  {
    kod: 'F',
    ad: 'Fil',
    anlat: 'Fil çapraz gider. Başladığı karenin rengini hiç değiştirmez.'
  },
  {
    kod: 'V',
    ad: 'Vezir',
    anlat: 'Vezir hem düz hem çapraz gider. Yani kale ile filin toplamıdır.'
  },
  {
    kod: 'S',
    ad: 'Şah',
    anlat: 'Şah her yöne gider ama sadece bir kare.'
  },
  {
    kod: 'A',
    ad: 'At',
    anlat: 'At iki kare düz, sonra bir kare yana gider. Yolundaki taşların üstünden atlar.'
  },
  {
    kod: 'P',
    ad: 'Piyon',
    anlat: 'Piyon bir kare ileri gider. Önündeki taşı alamaz, sadece çaprazındaki taşı alır.'
  }
];
