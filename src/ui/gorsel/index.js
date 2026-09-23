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
  gorselNokta, gorselDogru, gorselIsin, gorselDogruParcasi,
  gorselAraclar, gorselCemberAciDikme, gorselGosterimDogruParcasi,
  gorselGosterimIsin, gorselUcSayilari, gorselDikme, gorselDikKesisim,
  gorselKapiCercevesi
} from './temel.js';
import {
  gorselAciKoseKol, gorselAciBuyuklugu, gorselAciolcer, gorselAciolcerOlcme,
  gorselAciolcerSkala, gorselAciTurleri, gorselButunler, gorselButunlerHesap,
  gorselTumler, gorselKesisimDortAci, gorselTersAcilar, gorselUcDogru
} from './aci.js';
import {
  gorselCokgenOlusum, gorselCokgenKenar, gorselCokgenAdlari, gorselCokgenDegil,
  gorselCokgenGunluk, gorselKenarKose, gorselIcAcilar, gorselDuzgunCokgen,
  gorselKareDortgen, gorselFayans, gorselCember, gorselYaricap, gorselCap,
  gorselPergel, gorselIkiCember, gorselCemberUcgen, gorselUcgenKenarlari,
  gorselUcgenNeden, gorselEsitYaricap, gorselKesisimKosulu, gorselUcgenTurleri
} from './cokgen.js';

export const GORSELLER = {
  // temel-cizimler
  'nokta': gorselNokta,
  'dogru': gorselDogru,
  'isin': gorselIsin,
  'dogru-parcasi': gorselDogruParcasi,
  'araclar': gorselAraclar,
  'cember-aci-dikme': gorselCemberAciDikme,
  'gosterim-dogru-parcasi': gorselGosterimDogruParcasi,
  'gosterim-isin': gorselGosterimIsin,
  'uc-sayilari': gorselUcSayilari,
  'dikme': gorselDikme,
  'dik-kesisim': gorselDikKesisim,
  'kapi-cercevesi': gorselKapiCercevesi,

  // aci-olcme
  'aci-kose-kol': gorselAciKoseKol,
  'aci-buyuklugu': gorselAciBuyuklugu,
  'aciolcer': gorselAciolcer,
  'aciolcer-olcme': gorselAciolcerOlcme,
  'aciolcer-skala': gorselAciolcerSkala,
  'aci-turleri': gorselAciTurleri,
  'butunler': gorselButunler,
  'butunler-hesap': gorselButunlerHesap,
  'tumler': gorselTumler,
  'kesisim-dort-aci': gorselKesisimDortAci,
  'ters-acilar': gorselTersAcilar,
  'uc-dogru': gorselUcDogru,

  // cokgenler-cember
  'cokgen-olusum': gorselCokgenOlusum,
  'cokgen-kenar': gorselCokgenKenar,
  'cokgen-adlari': gorselCokgenAdlari,
  'cokgen-degil': gorselCokgenDegil,
  'cokgen-gunluk': gorselCokgenGunluk,
  'kenar-kose': gorselKenarKose,
  'ic-acilar': gorselIcAcilar,
  'duzgun-cokgen': gorselDuzgunCokgen,
  'kare-dortgen': gorselKareDortgen,
  'fayans': gorselFayans,
  'cember': gorselCember,
  'yaricap': gorselYaricap,
  'cap': gorselCap,
  'pergel': gorselPergel,
  'iki-cember': gorselIkiCember,
  'cember-ucgen': gorselCemberUcgen,
  'ucgen-kenarlari': gorselUcgenKenarlari,
  'ucgen-neden': gorselUcgenNeden,
  'esit-yaricap': gorselEsitYaricap,
  'kesisim-kosulu': gorselKesisimKosulu,
  'ucgen-turleri': gorselUcgenTurleri
};

export function gorselKur(ad, canvas, secenekler = {}) {
  const kur = GORSELLER[ad];
  return typeof kur === 'function' ? kur(canvas, secenekler) : null;
}

/** Bir adimin gorseli cizilebiliyor mu. Ekran bunu sorup karar verir. */
export function gorselVarMi(ad) {
  return typeof GORSELLER[ad] === 'function';
}
