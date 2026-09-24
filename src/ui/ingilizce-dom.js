/**
 * Ingilizce ders ekranlarinin DOM'u.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer: karar veren kod
 * views/ingilizce.js ve engines/ingilizce/ altindadir.
 *
 * Gorsel tuvaller (kelime karti ve dinle-sec secenekleri) SABIT id'lerle
 * cizilir; ders-dom.js'teki anlatimEkrani/dersAnlatimGorseliKur ikilisiyle
 * ayni sozlesme - tuvali burasi kurar, icini cizmek (gorselKur) ve yasam
 * dongusunu yonetmek (R26) main.js'in isidir.
 */

import { el, mount } from './dom.js';
import { ING_ASAMALAR } from '../engines/ingilizce/ders.js';

export const DINLE_GORSEL_ID = (i) => `ing-secenek-gorsel-${i}`;
export const KART_TUVAL_ID = 'ing-kart-tuval';

function asamaRozeti(ad, tamam, etiket, tiklanabilir) {
  return el('button', {
    className: `ders-asama ${tamam ? 'ders-asama--tamam' : ''}`,
    attrs: tiklanabilir ? { type: 'button' } : { type: 'button', disabled: 'true' },
    dataset: { ingAsama: ad }
  }, [
    el('span', { className: 'material-symbols-rounded', text: tamam ? 'check_circle' : 'radio_button_unchecked' }),
    el('span', { className: 'ders-asama__etiket', text: etiket })
  ]);
}

const TIKLANABILIR = ['kelime', 'dinle', 'quiz'];

/**
 * Tema sinavi kutusu. sinav: temaSinaviDurumu() ciktisi. Matematikteki
 * unite sinavi kutusuyla ayni siniflar (bkz. ders-dom.js haftaEkrani).
 */
function temaSinaviKutusu(sinav, ceviri) {
  return el('div', { className: 'ders-sinav' }, [
    el('p', {
      className: 'ders-sinav__baslik',
      text: sinav.sonPuan > 0
        ? ceviri('ing.themeExamScore', { n: sinav.sonPuan })
        : ceviri('ing.themeExam')
    }),
    sinav.acik
      ? el('button', {
          className: 'ders-sinav__gir',
          text: ceviri('ing.themeExamStart'),
          attrs: { type: 'button' },
          dataset: { ingTemaSinav: sinav.sinavId }
        })
      : el('p', { className: 'ders-kart__not', text: ceviri('ing.themeExamLocked') })
  ]);
}

/**
 * Hafta karti. model: ingHaftaKarti() ciktisi, main.js'in ekledigi
 * sinav alaniyla (temaSinaviDurumu).
 *
 * 'kelime', 'dinle' ve 'quiz' tiklanabilir: bunlarin gercek bir ekrani
 * var. 'soyle' ve 'cumle' rozetleri durumu gosterir ama devre disidir -
 * Faz 2b'ye kadar ekranlari yok.
 */
export function ingHaftaEkrani(kok, model, ceviri) {
  const ust = el('div', { className: 'ders-kart__ust' }, [
    el('p', { className: 'ders-kart__etiket', text: ceviri('ing.theme') }),
    el('h2', { className: 'ders-kart__hafta', text: ceviri('ing.week', { n: model.no }) }),
    el('p', { className: 'ders-kart__unite', text: model.baslik.tr })
  ]);

  const asamalar = el('div', { className: 'ders-kart__asamalar' },
    ING_ASAMALAR.map((ad) =>
      asamaRozeti(ad, model.durum.asamalar[ad].tamam, ceviri(`ing.stage.${ad}`), TIKLANABILIR.includes(ad))
    )
  );

  mount(kok, [
    el('div', { className: 'ders-kart' }, [
      ust,
      asamalar,
      el('p', { className: 'ders-kart__ilerleme', text: `${model.durum.yuzde}%` })
    ]),
    model.sinav ? temaSinaviKutusu(model.sinav, ceviri) : null
  ]);
}

function ustBar(kapatDataset, sayacMetni, ceviri) {
  return el('div', { className: 'anlatim__ust' }, [
    el('button', {
      className: 'anlatim__kapat',
      text: ceviri('ing.close'),
      attrs: { type: 'button' },
      dataset: kapatDataset
    }),
    el('p', { className: 'anlatim__sayac', text: sayacMetni })
  ]);
}

function gorselDugum(gorsel, { emojiClass, tuvalClass, tuvalId }) {
  if (gorsel.tip === 'emoji') {
    return el('span', { className: emojiClass, text: gorsel.deger });
  }
  return el('canvas', { className: tuvalClass, attrs: { id: tuvalId } });
}

/**
 * Kelime kartlarindan once gelen anlatim. model: ingAnlatimModeli()
 * ciktisi. Matematikteki anlatimEkrani ile ayni siniflar.
 *
 * "Kelimelere gec" HER adimda var: anlatim yildiz vermez ve cocuk onu
 * ikinci kez dinlemek zorunda kalmamali. Son adimda tek ileri dugmesi
 * de odur.
 */
export function ingAnlatimEkrani(kok, model, ceviri) {
  const dinleDugmesi = (eylem, etiket) => el('button', {
    className: 'anlatim__dinle',
    attrs: { type: 'button' },
    dataset: { ingAnlatim: eylem }
  }, [
    el('span', { className: 'material-symbols-rounded', text: 'volume_up' }),
    el('span', { text: etiket })
  ]);

  const gec = el('button', {
    className: model.sonMu ? 'anlatim__gez anlatim__gez--vurgu' : 'anlatim__gez ing-anlatim__atla',
    text: ceviri('ing.toCards'),
    attrs: { type: 'button' },
    dataset: { ingAnlatim: 'gec' }
  });

  mount(kok, [
    ustBar({ ingAnlatim: 'kapat' }, ceviri('ing.cardOf', { n: model.index + 1, t: model.toplam }), ceviri),
    el('div', { className: 'anlatim__govde' }, [
      el('p', { className: 'anlatim__konu', text: ceviri('ing.intro') }),
      el('p', { className: 'anlatim__metin', text: model.adim.tr }),
      el('p', { className: 'ing-anlatim__ornek', text: model.adim.en })
    ]),
    dinleDugmesi('dinle', ceviri('ing.listen')),
    dinleDugmesi('ornek', ceviri('ing.listenExample')),
    el('div', { className: 'anlatim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ing.back'),
        attrs: model.index === 0 ? { type: 'button', disabled: 'true' } : { type: 'button' },
        dataset: { ingAnlatim: 'geri' }
      }),
      model.sonMu
        ? gec
        : el('button', {
            className: 'anlatim__gez anlatim__gez--vurgu',
            text: ceviri('ing.next'),
            attrs: { type: 'button' },
            dataset: { ingAnlatim: 'ileri' }
          })
    ]),
    model.sonMu ? null : gec
  ]);
}

/**
 * Kelime karti. model: kartModeli() ciktisi.
 *
 * Gorsel tuvali SABIT id tasir (KART_TUVAL_ID); main.js her karti
 * gosterirken bu id'yi arayip gorselKur cagirir (bkz. dosya basi notu).
 */
export function kartEkrani(kok, model, ceviri) {
  const k = model.kelime;

  const gorsel = gorselDugum(k.gorsel, {
    emojiClass: 'ing-kart__gorsel',
    tuvalClass: 'ing-kart__tuval',
    tuvalId: KART_TUVAL_ID
  });

  const govde = el('div', { className: 'anlatim__govde' }, [
    gorsel,
    el('p', { className: 'ing-kart__en', text: k.en }),
    el('p', { className: 'ing-kart__tr', text: k.tr }),
    el('p', { className: 'ing-kart__ornek-en', text: k.ornek.en }),
    el('p', { className: 'ing-kart__ornek-tr', text: k.ornek.tr })
  ]);

  const dinle = el('button', {
    className: 'anlatim__dinle',
    attrs: { type: 'button' },
    dataset: { ingKart: 'dinle' }
  }, [
    el('span', { className: 'material-symbols-rounded', text: 'volume_up' }),
    el('span', { text: ceviri('ing.listen') })
  ]);

  const alt = el('div', { className: 'anlatim__alt' }, [
    el('button', {
      className: 'anlatim__gez',
      text: ceviri('ing.back'),
      attrs: model.index === 0 ? { type: 'button', disabled: 'true' } : { type: 'button' },
      dataset: { ingKart: 'geri' }
    }),
    el('button', {
      className: 'anlatim__gez anlatim__gez--vurgu',
      text: model.sonMu ? ceviri('ing.finishCards') : ceviri('ing.next'),
      attrs: { type: 'button' },
      dataset: { ingKart: model.sonMu ? 'bitir' : 'ileri' }
    })
  ]);

  mount(kok, [
    ustBar({ ingKart: 'kapat' }, ceviri('ing.cardOf', { n: model.index + 1, t: model.toplam }), ceviri),
    govde,
    dinle,
    alt
  ]);
}

/**
 * Dinle-sec secenek dugmeleri. secildi null ise henuz cevaplanmadi.
 * cozumGoster true olunca dogru/yanlis renklendirilir - soru__secenek
 * kaliplariyla ayni siniflar kullanilir (bkz. ders-dom.js secenekListesi).
 */
function dinleSecenekleri(model) {
  return model.secenekler.map((secenek, i) => {
    let sinif = 'soru__secenek ing-secenek';
    if (i === model.secildi) sinif += ' soru__secenek--secili';
    if (model.secildi !== null && model.cozumGoster) {
      if (i === model.dogru) sinif += ' soru__secenek--dogru';
      else if (i === model.secildi) sinif += ' soru__secenek--yanlis';
    }

    const dugmeOzellik = { type: 'button' };
    const dugme = el('button', {
      className: sinif,
      attrs: dugmeOzellik,
      dataset: { ingSecenek: String(i) }
    }, model.bicim === 'gorsel'
      ? [gorselDugum(secenek.gorsel, {
          emojiClass: 'ing-secenek__gorsel',
          tuvalClass: 'ing-secenek__tuval',
          tuvalId: DINLE_GORSEL_ID(i)
        })]
      : [el('span', { className: 'ing-secenek__metin', text: secenek.metin })]);

    return dugme;
  });
}

/**
 * Dinle-sec ekrani.
 *
 * model: {
 *   ustBilgi, kelime (sorulan tam sozluk kaydi), bicim, secenekler,
 *   dogru, secildi, cozumGoster
 * } - main.js dinleSecModeli() ciktisini bu sekle sarar (bkz. orada).
 */
export function dinleSecEkrani(kok, model, ceviri) {
  const secenekler = el('div', {
    className: model.bicim === 'gorsel' ? 'ing-secenekler ing-secenekler--gorsel' : 'ing-secenekler'
  }, dinleSecenekleri(model));

  const dogruMu = model.secildi === model.dogru;
  const cozum = model.cozumGoster && model.secildi !== null
    ? el('div', { className: 'soru__cozum' }, [
        el('p', {
          className: dogruMu ? 'soru__geri soru__geri--dogru' : 'soru__geri soru__geri--yanlis',
          text: dogruMu ? ceviri('ing.correct') : `${ceviri('ing.wrong')} ${model.kelime.en}`
        })
      ])
    : null;

  const dinle = el('button', {
    className: 'anlatim__dinle',
    attrs: { type: 'button' },
    dataset: { ingDinle: 'dinle' }
  }, [
    el('span', { className: 'material-symbols-rounded', text: 'volume_up' }),
    el('span', { text: ceviri('ing.listen') })
  ]);

  mount(kok, [
    ustBar({ ingDinle: 'kapat' }, model.ustBilgi, ceviri),
    el('p', { className: 'soru__baslik', text: ceviri('ing.pickHeard') }),
    dinle,
    secenekler,
    cozum,
    model.secildi !== null
      ? el('button', {
          className: 'anlatim__gez anlatim__gez--vurgu',
          text: ceviri('ing.next'),
          attrs: { type: 'button' },
          dataset: { ingDinle: 'devam' }
        })
      : null
  ]);
}

/**
 * Kelime karti bitisi ya da dinle-sec oturumu sonucu.
 *
 * model: { baslik, dogru?, toplam?, yildiz } - dogru/toplam yalniz
 * dinle-sec sonucunda dolu gelir; kart bitisinde tamamlanma pass/fail
 * tasimadigi icin bos birakilir.
 */
export function ingSonucEkrani(kok, model, ceviri) {
  const parcalar = [
    el('p', { className: 'sonuc__baslik', text: model.baslik })
  ];

  if (Number.isFinite(model.dogru) && Number.isFinite(model.toplam)) {
    parcalar.push(el('p', { className: 'sonuc__puan', text: ceviri('ing.quizResult', { n: model.dogru, t: model.toplam }) }));
  }

  if (model.yildiz > 0) {
    parcalar.push(el('p', { className: 'sonuc__durum sonuc__durum--gecti', text: ceviri('ing.starsEarned', { n: model.yildiz }) }));
  }

  parcalar.push(el('button', {
    className: 'anlatim__gez anlatim__gez--vurgu',
    text: ceviri('ing.close'),
    attrs: { type: 'button' },
    dataset: { ingSonuc: 'kapat' }
  }));

  mount(kok, parcalar);
}
