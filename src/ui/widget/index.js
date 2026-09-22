/**
 * Widget kayit defteri. Ekran kodu hangi widget oldugunu bilmek
 * zorunda kalmasin diye hepsi ayni sozlesmeyi saglar:
 *   create(kok, secenekler) -> { ciz, dogrula, yokEt }
 */

import { aciolcer } from './aciolcer.js';
import { geometriTuval } from './geometri-tuval.js';

export const WIDGETLER = {
  'aciolcer': aciolcer,
  'geometri-tuval': geometriTuval
};

export function widgetKur(ad, kok, secenekler) {
  const kur = WIDGETLER[ad];
  return typeof kur === 'function' ? kur(kok, secenekler) : null;
}
