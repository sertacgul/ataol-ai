/**
 * Konu kayit defteri. Icerik dosyalari yazildikca buraya eklenir.
 *
 * Faz 1: Geometrik Sekiller unitesi (1-8. haftalar).
 * Faz 2-5'te kalan 12 konu eklenecek.
 */

import temelCizimler from './temel-cizimler.js';
import aciOlcme from './aci-olcme.js';
import cokgenlerCember from './cokgenler-cember.js';

export const KONULAR = {
  'temel-cizimler': temelCizimler,
  'aci-olcme': aciOlcme,
  'cokgenler-cember': cokgenlerCember
};
