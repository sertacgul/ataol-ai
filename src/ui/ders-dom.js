/**
 * Ders ekranlarinin DOM'u.
 *
 * Metin daima el() uzerinden textContent ile yazilir; HTML basilmaz.
 * Bu dosya model uretmez, yalnizca model cizer: karar veren kod
 * views/ders.js ve engines/ altindadir.
 */

import { el, mount } from './dom.js';

function asamaRozeti(ad, tamam, etiket) {
  return el('button', {
    className: `ders-asama ${tamam ? 'ders-asama--tamam' : ''}`,
    attrs: { type: 'button' },
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

/**
 * Anlatim ekrani.
 *
 * Metin buyuk ve seyrek yazilir; cocuk hem okuyup hem dinleyebilsin
 * diye. Adim sayaci ustte durur ki nerede oldugunu bilsin, bitmeyen
 * bir sey hissi vermesin.
 */
export function anlatimEkrani(kok, model, ceviri) {
  if (!model.aktif) {
    mount(kok, [el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })]);
    return;
  }

  const adim = model.aktif;

  const ust = el('div', { className: 'anlatim__ust' }, [
    el('button', {
      className: 'anlatim__kapat',
      text: ceviri('ders.close'),
      attrs: { type: 'button' },
      dataset: { dersAdim: 'kapat' }
    }),
    el('p', { className: 'anlatim__sayac', text: ceviri('ders.stepOf', { n: model.index + 1, t: model.toplam }) })
  ]);

  const govde = el('div', { className: 'anlatim__govde' }, [
    el('p', { className: 'anlatim__konu', text: adim.konuAd }),
    el('p', { className: 'anlatim__metin', text: adim.metin })
  ]);

  const dinle = el('button', {
    className: 'anlatim__dinle',
    attrs: { type: 'button' },
    dataset: { dersAdim: 'dinle' }
  }, [
    el('span', { className: 'material-symbols-rounded', text: 'volume_up' }),
    el('span', { text: ceviri('ders.listen') })
  ]);

  const alt = el('div', { className: 'anlatim__alt' }, [
    el('button', {
      className: 'anlatim__gez',
      text: ceviri('ders.back'),
      attrs: model.index === 0 ? { type: 'button', disabled: 'true' } : { type: 'button' },
      dataset: { dersAdim: 'geri' }
    }),
    el('button', {
      className: 'anlatim__gez anlatim__gez--vurgu',
      text: model.sonMu ? ceviri('ders.finishLesson') : ceviri('ders.forward'),
      attrs: { type: 'button' },
      dataset: { dersAdim: model.sonMu ? 'bitir' : 'ileri' }
    })
  ]);

  mount(kok, [ust, govde, dinle, alt]);
}

/**
 * Ornek cozum ekrani. Adimlar tek tek acilir.
 *
 * Cevap yalniz tum adimlar acildiktan sonra gorunur; once cevabi
 * gostermek cozum adimlarini okunmaz kilardi.
 */
export function ornekEkrani(kok, model, ceviri) {
  if (!model.ornek) {
    mount(kok, [el('p', { className: 'ders-kart__not', text: ceviri('ders.notReady') })]);
    return;
  }

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      el('button', {
        className: 'anlatim__kapat',
        text: ceviri('ders.close'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: 'kapat' }
      }),
      el('p', { className: 'anlatim__sayac', text: ceviri('ders.example') })
    ]),
    el('p', { className: 'ornek__konu', text: model.konuAd }),
    el('p', { className: 'ornek__soru', text: model.ornek.soru }),
    el('div', { className: 'ornek__adimlar' },
      model.acik.map((adim, i) =>
        el('p', { className: 'ornek__adim', text: `${i + 1}. ${adim}` })
      )
    ),
    model.bitti
      ? el('p', { className: 'ornek__cevap', text: ceviri('ders.answer', { c: model.ornek.cevap }) })
      : null,
    el('div', { className: 'etkilesim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.exampleSkip'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: 'gec' }
      }),
      el('button', {
        className: 'anlatim__gez anlatim__gez--vurgu',
        text: model.bitti ? ceviri('ders.exampleDone') : ceviri('ders.exampleShow'),
        attrs: { type: 'button' },
        dataset: { dersOrnek: model.bitti ? 'gec' : 'adim' }
      })
    ])
  ]);
}

/**
 * Soru ekrani. Alistirma, quiz ve sinav ayni ekrani kullanir.
 *
 * model: {
 *   baslik, ustBilgi, soru, secildi, dogruMu, cozumGoster,
 *   devamEtiketi, kapatVar
 * }
 *
 * secildi null ise henuz cevaplanmamistir. Secim isareti (--secili)
 * cozumGoster'dan BAGIMSIZDIR: cocuk dokunusunun kaydedildigini her
 * zaman gormeli, aksi halde geciktirilmis geri bildirimli sinav
 * modunda (cozumGoster: false) ekran tiklamaya tepkisiz gorunur.
 * Dogru/yanlis renklendirmesi ise yalniz cozumGoster true iken eklenir:
 * o an cevabin doğruluğu aciklaniyor demektir.
 */
export function soruEkrani(kok, model, ceviri) {
  const secenekler = model.soru.secenekler.map((metin, i) => {
    let sinif = 'soru__secenek';
    if (i === model.secildi) sinif += ' soru__secenek--secili';
    if (model.secildi !== null && model.cozumGoster) {
      if (i === model.soru.dogru) sinif += ' soru__secenek--dogru';
      else if (i === model.secildi) sinif += ' soru__secenek--yanlis';
    }
    return el('button', {
      className: sinif,
      text: metin,
      attrs: { type: 'button' },
      dataset: { dersSecenek: String(i) }
    });
  });

  const cozum = model.cozumGoster && model.secildi !== null
    ? el('div', { className: 'soru__cozum' }, [
        el('p', {
          className: model.dogruMu ? 'soru__geri soru__geri--dogru' : 'soru__geri soru__geri--yanlis',
          text: model.dogruMu ? ceviri('ders.correct') : ceviri('ders.wrong')
        }),
        ...model.soru.cozum.map((adim) => el('p', { className: 'soru__cozum-adim', text: adim }))
      ])
    : null;

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      model.kapatVar
        ? el('button', {
            className: 'anlatim__kapat',
            text: ceviri('ders.close'),
            attrs: { type: 'button' },
            dataset: { dersSoru: 'kapat' }
          })
        : null,
      el('p', { className: 'anlatim__sayac', text: model.ustBilgi })
    ]),
    el('p', { className: 'soru__baslik', text: model.baslik }),
    el('p', { className: 'soru__metin', text: model.soru.soru.tr }),
    el('div', { className: 'soru__secenekler' }, secenekler),
    cozum,
    model.secildi !== null
      ? el('button', {
          className: 'anlatim__gez anlatim__gez--vurgu',
          text: model.devamEtiketi,
          attrs: { type: 'button' },
          dataset: { dersSoru: 'devam' }
        })
      : null
  ]);
}

// 'serbest' modda geometri-tuval'in arac secimi icin donen bir arac
// dugmesi yok; cocuk nokta, dogru parcasi ve isin arasinda secim
// yapabilsin diye bu ekran ayri bir arac cubugu cizer. Diger modlarda
// (dikme, cokgen, cember, cember-ucgen) widget'in kendi varsayilan
// araci yeterlidir, bu yuzden cagiran yalniz 'serbest' modda gecer.
const ARACLAR = [
  ['nokta', 'ders.toolPoint'],
  ['dogru-parcasi', 'ders.toolSegment'],
  ['isin', 'ders.toolRay']
];

function aracCubugu(secili, ceviri) {
  return el('div', { className: 'etkilesim__araclar' },
    ARACLAR.map(([ad, anahtar]) =>
      el('button', {
        className: `etkilesim__arac ${ad === secili ? 'etkilesim__arac--aktif' : ''}`,
        text: ceviri(anahtar),
        attrs: { type: 'button' },
        dataset: { dersArac: ad }
      })
    )
  );
}

/**
 * "Kendin dene" ekrani. Widget'i canvas'a kurar; widget'in kendisini
 * kurmaz, o isi main.js yapar cunku yokEt cagrisinin sahibi odur.
 *
 * arac: 'serbest' moddaki secili arac id'si, diger modlarda null.
 * null ise arac cubugu hic cizilmez.
 *
 * Mesaj paragrafi mesaj bos olsa da hep cizilir ve sabit bir id tasir:
 * basarisiz "Kontrol et" sonrasi main.js tuvali ve widget'i yikip
 * yeniden kurmadan yalniz bu dugumun metnini degistirir. Aksi halde
 * cocugun cizdigi her sey basarisiz her denemede silinirdi.
 *
 * Doner: olusturulan canvas. Cagiran bunu widget'a verir.
 */
export function etkilesimEkrani(kok, { gorev, mesaj, arac = null }, ceviri) {
  const canvas = el('canvas', { className: 'etkilesim__tuval', attrs: { id: 'ders-tuval' } });

  mount(kok, [
    el('div', { className: 'anlatim__ust' }, [
      el('button', {
        className: 'anlatim__kapat',
        text: ceviri('ders.close'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'kapat' }
      }),
      el('p', { className: 'anlatim__sayac', text: ceviri('ders.tryIt') })
    ]),
    el('p', { className: 'etkilesim__gorev', text: gorev }),
    arac ? aracCubugu(arac, ceviri) : null,
    canvas,
    el('p', { className: 'etkilesim__mesaj', text: mesaj ?? '', attrs: { id: 'ders-etkilesim-mesaj' } }),
    el('div', { className: 'etkilesim__alt' }, [
      el('button', {
        className: 'anlatim__gez',
        text: ceviri('ders.clear'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'temizle' }
      }),
      el('button', {
        className: 'anlatim__gez anlatim__gez--vurgu',
        text: ceviri('ders.check'),
        attrs: { type: 'button' },
        dataset: { dersEtkilesim: 'kontrol' }
      })
    ])
  ]);

  return canvas;
}
