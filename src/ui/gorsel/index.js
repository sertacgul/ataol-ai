/**
 * Anlatim gorseli kayit defteri.
 *
 * Veri katmanindaki her anlatim adiminin bir `gorsel` adi var
 * (src/data/konular/*). Burasi o adi bir cizim fonksiyonuna baglar.
 *
 * Sozlesme widget'lardakiyle ayni bicimde:
 *   create(canvas, { ses }) -> { ciz, dokun, ipucu, yokEt? }
 *
 * Bilinmeyen ad null doner ve ekran gorselsiz cizilir. Boylece yeni
 * bir anlatim adimi yazildiginda gorseli hazir olmasa bile ders
 * calisir; eksik gorsel metni gizlemez.
 */

import {
  gorselNokta, gorselDogru, gorselIsin, gorselDogruParcasi
} from './temel.js';

export const GORSELLER = {
  'nokta': gorselNokta,
  'dogru': gorselDogru,
  'isin': gorselIsin,
  'dogru-parcasi': gorselDogruParcasi
};

export function gorselKur(ad, canvas, secenekler = {}) {
  const kur = GORSELLER[ad];
  return typeof kur === 'function' ? kur(canvas, secenekler) : null;
}

/** Bir adimin gorseli cizilebiliyor mu. Ekran bunu sorup karar verir. */
export function gorselVarMi(ad) {
  return typeof GORSELLER[ad] === 'function';
}
