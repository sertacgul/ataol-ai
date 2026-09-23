/**
 * Sozluk ekrani.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer.
 */

import { el, mount } from './dom.js';

/**
 * Faz 1'de yalniz emoji gorseller ciziliyor. gorsel.tip === 'cizim' olan
 * kelimeler (in/on/under, timetable gibi soyut olanlar) gecici olarak
 * notr bir kitap simgesi gosteriyor.
 *
 * Bu BILINCLI bir eksiklik, unutulmus degil: tuval cizimleri Faz 2'de
 * src/ui/gorsel/ingilizce.js altina yazilacak ve buradaki dal oraya
 * baglanacak. Yedek simge konmasaydi kartin sol tarafi bos kalir ve
 * cocuk kartin yarisinin yuklenmedigini sanirdi.
 */
function sonucKarti(k, ceviri) {
  const gorsel = k.gorsel.tip === 'emoji'
    ? el('span', { className: 'sozluk__emoji', text: k.gorsel.deger })
    : el('span', { className: 'sozluk__emoji', text: '🖼️' });

  return el('div', { className: 'sozluk__kart' }, [
    gorsel,
    el('div', { className: 'sozluk__govde' }, [
      el('p', { className: 'sozluk__en', text: k.en }),
      el('p', { className: 'sozluk__tr', text: k.tr }),
      el('p', { className: 'sozluk__tur', text: ceviri(`sozluk.tur.${k.tur}`) }),
      el('p', { className: 'sozluk__ornek-en', text: k.ornek.en }),
      el('p', { className: 'sozluk__ornek-tr', text: k.ornek.tr })
    ]),
    el('button', {
      className: 'sozluk__dinle',
      text: ceviri('sozluk.dinle'),
      attrs: { type: 'button' },
      dataset: { sozlukDinle: k.id }
    })
  ]);
}

export function sozlukEkrani(kok, model, ceviri) {
  const parcalar = [
    el('h2', { className: 'sozluk__baslik', text: ceviri('sozluk.baslik') })
  ];

  if (model.bos) {
    parcalar.push(el('p', { className: 'sozluk__mesaj', text: ceviri(model.mesajAnahtari) }));
  } else {
    parcalar.push(el('p', {
      className: 'sozluk__sayi',
      text: ceviri('sozluk.sonucSayisi', { n: model.sonuclar.length })
    }));
    parcalar.push(el('div', { className: 'sozluk__liste' },
      model.sonuclar.map((k) => sonucKarti(k, ceviri))));
  }

  mount(kok, parcalar);
}
