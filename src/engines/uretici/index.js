/**
 * Soru ureticilerinin kayit defteri.
 *
 * Her uretici uret(seviye, rng) imzasini tasir ve soru sozlesmesine
 * uyan bir nesne dondurur. rng disaridan gelir: motorlar saf kalir ve
 * testler tohumlu calisir.
 *
 * Uretici dosyalari Task 9-11'de gelecek; bu register bu gorevlerde
 * asama asama doldurulacak.
 *
 * Ortak yardimcilar ortak.js'tedir ve buradan yeniden disa aktarilir;
 * cagiranlar tek yerden import edebilsin diye.
 */

import { uret as temelCizimler } from './temel-cizimler.js';
import { uret as aciOlcme } from './aci-olcme.js';
import { uret as cokgenlerCember } from './cokgenler-cember.js';

export { BICIMLER, sec, karistir, secmeliKur } from './ortak.js';

// Uretici kayit defteri. Her uretici kendi gorevinde buraya eklenir:
// once import satiri, sonra bu nesneye bir giris.
export const URETICILER = {
  'temel-cizimler': temelCizimler,
  'aci-olcme': aciOlcme,
  'cokgenler-cember': cokgenlerCember
};

export function ureticiVarMi(id) {
  return typeof URETICILER[id] === 'function';
}

export function soruUret(id, seviye, rng) {
  const uret = URETICILER[id];
  return typeof uret === 'function' ? uret(seviye, rng) : null;
}
