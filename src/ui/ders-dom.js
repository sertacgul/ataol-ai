/**
 * Ders ekranlarinin DOM'u.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer: karar veren kod
 * views/ders.js ve engines/ altindadir.
 */

import { el, mount } from './dom.js';

function asamaRozeti(ad, tamam, etiket) {
  return el('div', {
    className: `ders-asama ${tamam ? 'ders-asama--tamam' : ''}`,
    dataset: { dersAsama: ad }
  }, [
    el('span', { className: 'material-symbols-rounded', text: tamam ? 'check_circle' : 'radio_button_unchecked' }),
    el('span', { className: 'ders-asama__etiket', text: etiket })
  ]);
}

function haftaKartiDom(kart, ceviri) {
  const ust = el('div', { className: 'ders-kart__ust' }, [
    el('p', { className: 'ders-kart__etiket', text: ceviri('ders.thisWeek') }),
    el('h2', { className: 'ders-kart__hafta', text: ceviri('ders.week', { n: kart.no }) }),
    el('p', { className: 'ders-kart__unite', text: `${ceviri('ders.unit')}: ${kart.uniteAd}` }),
    el('p', { className: 'ders-kart__tarih', text: ceviri('ders.dates', { bas: kart.bas, bit: kart.bit }) })
  ]);

  const konular = el('div', { className: 'ders-kart__konular' },
    kart.dersler.map((d) =>
      el('div', { className: 'ders-konu' }, [
        el('p', { className: 'ders-konu__ad', text: d.konuAd }),
        d.baslik ? el('p', { className: 'ders-konu__baslik', text: d.baslik }) : null
      ])
    )
  );

  if (!kart.hazir) {
    return el('div', { className: 'ders-kart ders-kart--bos' }, [
      ust, konular,
      el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })
    ]);
  }

  const asamalar = el('div', { className: 'ders-kart__asamalar' }, [
    asamaRozeti('anlatim', kart.durum.asamalar.anlatim.tamam, ceviri('ders.stage.anlatim')),
    asamaRozeti('etkilesim', kart.durum.asamalar.etkilesim.tamam, ceviri('ders.stage.etkilesim')),
    asamaRozeti('alistirma', kart.durum.asamalar.alistirma.tamam, ceviri('ders.stage.alistirma')),
    asamaRozeti('quiz', kart.durum.asamalar.quiz.tamam, ceviri('ders.stage.quiz'))
  ]);

  return el('div', { className: 'ders-kart' }, [
    ust,
    konular,
    asamalar,
    el('p', { className: 'ders-kart__ilerleme', text: ceviri('ders.progress', { n: kart.durum.yuzde }) }),
    el('button', {
      className: 'ders-kart__basla',
      text: kart.durum.yuzde > 0 ? ceviri('ders.continue') : ceviri('ders.start'),
      attrs: { type: 'button' },
      dataset: { dersBasla: String(kart.no) }
    })
  ]);
}

// hedefler: { geri, ileri } — views/ders.js#gezinmeHedefleri ciktisi.
// Hedefi null olan yon hic cizilmez: gidecek yeri olmayan bir dugme
// cocuk icin bos bir tiklamadir.
function gezinme(hedefler, ceviri) {
  const geri = hedefler.geri !== null
    ? el('button', {
        className: 'ders-gezinme__dugme',
        text: ceviri('ders.prev'),
        attrs: { type: 'button' },
        dataset: { dersGit: String(hedefler.geri) }
      })
    : null;

  const ileri = hedefler.ileri !== null
    ? el('button', {
        className: 'ders-gezinme__dugme',
        text: ceviri('ders.next'),
        attrs: { type: 'button' },
        dataset: { dersGit: String(hedefler.ileri) }
      })
    : null;

  return el('div', { className: 'ders-gezinme' }, [geri, ileri]);
}

function bilgiKarti(baslik, metin) {
  return el('div', { className: 'ders-kart ders-kart--bilgi' }, [
    el('h2', { className: 'ders-kart__hafta', text: baslik }),
    el('p', { className: 'ders-kart__not', text: metin })
  ]);
}

/**
 * Hafta ekranini cizer.
 *
 * model: { tip, kart?, ad?, hedefler, dilTr } — views/ders.js
 * ciktisindan main.js tarafindan hazirlanir.
 */
export function haftaEkrani(kok, model, ceviri) {
  const parcalar = [];

  if (model.dilTr === false) {
    parcalar.push(el('p', { className: 'ders-not-tr', text: ceviri('ders.trOnly') }));
  }

  if (model.tip === 'ders') {
    parcalar.push(haftaKartiDom(model.kart, ceviri));
    parcalar.push(gezinme(model.hedefler, ceviri));
  } else if (model.tip === 'tatil') {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.holidayNote', { ad: model.ad })));
    parcalar.push(gezinme(model.hedefler, ceviri));
  } else if (model.tip === 'once') {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.beforeStart')));
  } else {
    parcalar.push(bilgiKarti(ceviri('ders.holiday'), ceviri('ders.afterEnd')));
    parcalar.push(gezinme(model.hedefler, ceviri));
  }

  mount(kok, parcalar);
}
