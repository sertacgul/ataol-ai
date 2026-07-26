import { createStorage } from './core/storage.js';
import { createAppState } from './core/state.js';
import { verifyPin, hashPin } from './core/crypto.js';
import { addGuardian, addCard, removeCard, addReward, removeReward } from './core/profile.js';
import { seedProfile, ROUTINE_TEMPLATES } from './data/defaults.js';
import { t, DILLER } from './core/i18n.js';
import { dayKey, completeCard, approveCard } from './engines/routine.js';
import { routineViewModel } from './views/routine.js';
import { approvalQueue } from './views/parent.js';
import { guardianSummary, validateGuardianInput, requiresExistingPin } from './views/settings.js';
import { validateCardInput, validateRewardInput, ICON_OPTIONS, EMOJI_OPTIONS } from './views/content.js';
import { renderSignature } from './views/clock.js';
import { el, mount } from './ui/dom.js';
import { buildQuestion, recordTimeAnswer, QUESTION_KINDS } from './engines/timequiz.js';
import { selectWeighted } from './engines/leitner.js';
import { startSession, answerCurrent, SESSION_LENGTH } from './views/drill.js';
import { levelById } from './engines/drill.js';
import { GAMES } from './views/games.js';
import { BOARD_SIZE, createBoard, cellId, fire, isDefeated, remainingShips, aiChoose } from './engines/battleship.js';
import { chessViewModel, cevapla as satrancCevapla, sonrakiDers } from './views/chess.js';
import { soruUret } from './engines/chesspuzzle.js';
import { kareId, kareCoz, TAHTA_BOYU } from './engines/chess.js';
import { sistemIstemi, istekGovdesi, yanitAyikla } from './engines/ai.js';
import {
  baslangicTahtasi,
  yasalHamleler as satrancYasalHamleler,
  hamleUygula as satrancHamleUygula,
  oyunDurumu as satrancOyunDurumu,
  sahTehditAltinda,
  enIyiHamle,
  renkOf,
  tipOf
} from './engines/chessgame.js';

let state;
let profile;
let tasimaSonucu = null;
// Acilis hata verirse (catch) kurtarma ekrani gosterilir; o durumda
// onboarding'e girilmez.
let kurtarma = false;

// Sohbet. Gecmis cihazda saklanir, v1'den TASINMAZ (aile hatasi icerebilir).
// Bildirim: acilis try'i (asagida) sohbetGecmis'e yaziyor, bu yuzden
// tanim ORADAN once gelmeli; yoksa let'in TDZ'sine takilir.
let sohbetGecmis = [];
let sohbetBekliyor = false;

// Icerik kisisellestirme modallarinda secili simge/emoji.
let seciliGorevSimge = null;
let seciliOdulEmoji = null;

function showRecovery() {
  const app = document.getElementById('app');
  mount(app, [
    el('div', { className: 'v2-recovery' }, [
      // ceviri/dil bu noktada henuz tanimlanmadi (TDZ); t dogrudan cagrilir.
      // Profil yok, dil bilinmiyor: TR gosterilir.
      el('p', { text: t('tr', 'recovery.text') }),
      el('button', {
        text: t('tr', 'recovery.reset'),
        attrs: { type: 'button' },
        dataset: { recover: 'reset' }
      })
    ])
  ]);
  app.addEventListener('click', (e) => {
    if (e.target.closest('[data-recover]')) {
      window.localStorage.clear();
      window.location.reload();
    }
  });
}

try {
  state = createAppState(createStorage(window.localStorage, 'ataol2'));
  profile = state.loadProfile();
  // Profil yoksa artik Deha tohumlanmaz; ilk kurulum (onboarding) calisir.
  // Deha'nin (ve her mevcut kullanicinin) profili zaten var, buraya dusmez.
  if (profile) {
    // Tasima ilk cizimden once calisir: yildiz toplami rutin basligina
    // yaziliyor, sonra calissa cocuk once eksik toplami gorurdu.
    tasimaSonucu = state.migrateOnce((anahtar) => window.localStorage.getItem(anahtar));
    sohbetGecmis = state.loadSohbet();
  }
} catch (err) {
  profile = null;
  kurtarma = true;
  showRecovery();
}

const now = () => new Date();
const today = () => dayKey(now(), profile.settings.dayResetHour);

// Aktif dil. Profil yoksa (onboarding) TR.
const dil = () => profile?.settings?.language ?? 'tr';

// Kisa ceviri kancasi: t(anahtar, params) aktif dille.
const ceviri = (anahtar, params) => t(dil(), anahtar, params);

// Kart basligi: sablon kartlarinda titleKey var -> cevrilir; ebeveynin
// ekledigi kartta yok -> yazildigi gibi (o dilde) gosterilir.
const kartBaslik = (card) => (card.titleKey ? ceviri(card.titleKey) : card.title);

// data-i18n / data-i18n-ph tasiyan statik ogeleri aktif dile cevirir.
// Acilis, her render ve dil degisiminde cagrilir.
function uygulaDil() {
  const d = dil();
  for (const eleman of document.querySelectorAll('[data-i18n]')) {
    eleman.textContent = t(d, eleman.dataset.i18n);
  }
  for (const eleman of document.querySelectorAll('[data-i18n-ph]')) {
    eleman.setAttribute('placeholder', t(d, eleman.dataset.i18nPh));
  }
  document.documentElement.lang = d;
}

let pendingCardId = null;
let lastSignature = null;

const QUIZ_SORU_SAYISI = 3;
let quizKalan = 0;
let aktifSoru = null;
let quizSonuclari = [];

let drillSession = null;
let drillTyped = '';
let drillShownAt = 0;

let amiralDurum = null;

// Oneri baloncuklari. Cocugun dokunup gonderdigi hazir cumleler.
// Icinde isim GECMEZ: "${ad}'ya" gibi Turkce sevgi/durum eki kodla
// uretilemez (ses uyumu bozulur), bu yuzden ada bagli oneri yok.
// Metin degil ANAHTAR tutulur; aktif dile gore cizim aninda cevrilir.
const SOHBET_ONERI_ANAHTARLARI = ['chat.s1', 'chat.s2', 'chat.s3', 'chat.s4'];

// v1 ile ayni uc nokta ve model.
const SOHBET_MODEL = 'gemini-2.5-flash';

function cardNode(card) {
  return el('li', {
    className: `routine-card card--${card.state}`,
    dataset: { cardId: card.id }
  }, [
    el('span', { className: 'material-symbols-rounded routine-card__icon', text: card.icon }),
    el('span', { className: 'routine-card__title', text: kartBaslik(card) }),
    el('span', { className: 'routine-card__reward', text: `${card.stars}★ · ${card.minutes} ${ceviri('unit.min')}` })
  ]);
}

function blockNode(block) {
  return el('section', { className: 'routine-block', dataset: { block: block.id } }, [
    el('h2', { className: 'routine-block__title' }, [
      el('span', { text: ceviri('block.' + block.id) }),
      el('span', { className: 'routine-block__time', text: block.from })
    ]),
    el('ul', { className: 'routine-block__cards' }, block.cards.map(cardNode))
  ]);
}

function renderRoutine() {
  const vm = routineViewModel(profile, state.loadDayProgress(today()), now());
  mount(document.getElementById('view-routine'), [
    el('header', { className: 'routine-header' }, [
      el('p', { className: 'routine-header__greeting', text: ceviri('routine.greeting', { ad: vm.childName }) }),
      el('p', { className: 'routine-header__date', text: `${ceviri('cal.day.' + vm.today.dayIndex)} · ${vm.today.dayOfMonth} ${ceviri('cal.month.' + vm.today.monthIndex)} · ${ceviri('cal.season.' + vm.today.seasonIndex)}` }),
      el('p', { className: 'routine-header__totals', text: `${vm.stars}★ · ${vm.minutes}/${vm.minuteCap} ${ceviri('unit.min')}` }),
      // Gunun yildizi yukaridaki satirda; bu satir biriken toplam.
      // v1'den tasinan yildizlar da buraya girer, yoksa karsilama
      // ekrani kapandigi anda cocuk emeginin silindigini sanar.
      el('p', { className: 'routine-header__birikim', text: ceviri('routine.total', { n: state.totalStars() }) })
    ]),
    ...vm.blocks.map(blockNode)
  ]);
}

function renderParent() {
  const queue = approvalQueue(profile, state.loadDayProgress(today()));
  const guardians = guardianSummary(profile);
  const target = document.getElementById('view-parent');

  const bolumler = [
    el('section', { className: 'parent-guardians' }, [
      el('h2', { className: 'parent-guardians__title', text: ceviri('parent.guardians') }),
      guardians.length === 0
        ? el('p', { className: 'parent-empty', text: ceviri('parent.guardiansEmpty') })
        : el('ul', { className: 'parent-guardians__list' }, guardians.map((g) =>
            el('li', { className: 'parent-guardians__item', text: g.label })
          )),
      el('button', {
        className: 'parent-guardians__add',
        text: ceviri('parent.addGuardian'),
        attrs: { type: 'button' },
        dataset: { addGuardian: 'yes' }
      })
    ]),
    queue.length === 0
      ? el('p', { className: 'parent-empty', text: ceviri('parent.queueEmpty') })
      : el('ul', { className: 'parent-queue' }, queue.map((c) =>
          el('li', { className: 'parent-queue__item' }, [
            el('span', { className: 'material-symbols-rounded', text: c.icon }),
            el('span', { className: 'parent-queue__title', text: kartBaslik(c) }),
            el('span', { className: 'parent-queue__reward', text: `${c.stars}★` }),
            el('button', {
              className: 'parent-queue__approve',
              text: ceviri('parent.approve'),
              attrs: { type: 'button' },
              dataset: { approveCard: c.id }
            })
          ])
        )),

    gorevlerBolumu(),
    odullerBolumu(),
    sohbetAyarBolumu(),
    dilBolumu()
  ];

  mount(target, bolumler);
}

// Ebeveyn gorevleri bloklara gore listeler, siler, yenisini ekler.
function gorevlerBolumu() {
  const byId = new Map(profile.cards.map((c) => [c.id, c]));

  const bloklar = ['morning', 'afternoon', 'evening'].map((b) =>
    el('div', { className: 'parent-gorev-blok' }, [
      el('p', { className: 'parent-gorev-blok__ad', text: ceviri('block.' + b) }),
      el('ul', { className: 'parent-gorev-liste' }, profile.routine[b].map((id) => {
        const c = byId.get(id);
        return el('li', { className: 'parent-gorev' }, [
          el('span', { className: 'material-symbols-rounded parent-gorev__ikon', text: c.icon }),
          el('span', { className: 'parent-gorev__ad', text: kartBaslik(c) }),
          el('span', { className: 'parent-gorev__odul', text: `${c.stars}★ · ${c.minutes} ${ceviri('unit.min')}` }),
          el('button', {
            className: 'parent-gorev__sil',
            text: '×',
            attrs: { type: 'button', 'aria-label': ceviri('parent.delete') },
            dataset: { cardSil: id }
          })
        ]);
      }))
    ])
  );

  return el('section', { className: 'parent-guardians' }, [
    el('h2', { className: 'parent-guardians__title', text: ceviri('parent.tasks') }),
    ...bloklar,
    el('button', {
      className: 'parent-guardians__add',
      text: ceviri('parent.addTask'),
      attrs: { type: 'button' },
      dataset: { gorevEkle: 'yes' }
    })
  ]);
}

function odullerBolumu() {
  return el('section', { className: 'parent-guardians' }, [
    el('h2', { className: 'parent-guardians__title', text: ceviri('parent.rewards') }),
    el('ul', { className: 'parent-gorev-liste' }, profile.rewards.map((r) =>
      el('li', { className: 'parent-gorev' }, [
        el('span', { className: 'parent-gorev__emoji', text: r.emoji }),
        el('span', { className: 'parent-gorev__ad', text: r.name }),
        el('span', { className: 'parent-gorev__odul', text: `${r.target} ${ceviri('unit.min')}` }),
        el('button', {
          className: 'parent-gorev__sil',
          text: '×',
          attrs: { type: 'button', 'aria-label': ceviri('parent.delete') },
          dataset: { rewardSil: r.id }
        })
      ])
    )),
    el('button', {
      className: 'parent-guardians__add',
      text: ceviri('parent.addReward'),
      attrs: { type: 'button' },
      dataset: { odulEkle: 'yes' }
    })
  ]);
}

// --- Gorev ve odul ekleme modallari ---
function cizGorevSimgeler() {
  mount(document.getElementById('gorev-simgeler'), ICON_OPTIONS.map((ikon) =>
    el('button', {
      className: ikon === seciliGorevSimge ? 'secim-hucre secim-hucre--secili' : 'secim-hucre',
      attrs: { type: 'button' },
      dataset: { gorevSimge: ikon }
    }, [el('span', { className: 'material-symbols-rounded', text: ikon })])
  ));
}

function acGorevModal() {
  document.getElementById('gorev-baslik').value = '';
  document.getElementById('gorev-yildiz').value = '';
  document.getElementById('gorev-dakika').value = '';
  document.querySelector('input[name="gorev-blok"][value="morning"]').checked = true;
  seciliGorevSimge = null;
  cizGorevSimgeler();
  document.getElementById('gorev-hata').hidden = true;
  document.getElementById('gorev-modal').hidden = false;
}

function kapatGorevModal() {
  document.getElementById('gorev-modal').hidden = true;
}

function kaydetGorev() {
  const girdi = {
    title: document.getElementById('gorev-baslik').value,
    block: document.querySelector('input[name="gorev-blok"]:checked')?.value,
    stars: document.getElementById('gorev-yildiz').value,
    minutes: document.getElementById('gorev-dakika').value,
    icon: seciliGorevSimge
  };

  const sonuc = validateCardInput(girdi);
  if (!sonuc.valid) {
    const h = document.getElementById('gorev-hata');
    h.textContent = sonuc.errors[0];
    h.hidden = false;
    return;
  }

  profile = addCard(profile, {
    title: girdi.title.trim(),
    block: girdi.block,
    stars: Number(girdi.stars),
    minutes: Number(girdi.minutes),
    icon: girdi.icon
  });
  state.saveProfile(profile);
  kapatGorevModal();
  render();
}

function silGorev(id) {
  profile = removeCard(profile, id);
  state.saveProfile(profile);
  render();
}

function cizOdulEmojiler() {
  mount(document.getElementById('odul-emojiler'), EMOJI_OPTIONS.map((em) =>
    el('button', {
      className: em === seciliOdulEmoji ? 'secim-hucre secim-hucre--secili' : 'secim-hucre',
      attrs: { type: 'button' },
      dataset: { odulEmoji: em }
    }, [el('span', { className: 'secim-emoji', text: em })])
  ));
}

function acOdulModal() {
  document.getElementById('odul-ad').value = '';
  document.getElementById('odul-hedef').value = '';
  seciliOdulEmoji = null;
  cizOdulEmojiler();
  document.getElementById('odul-hata').hidden = true;
  document.getElementById('odul-modal').hidden = false;
}

function kapatOdulModal() {
  document.getElementById('odul-modal').hidden = true;
}

function kaydetOdul() {
  const girdi = {
    name: document.getElementById('odul-ad').value,
    emoji: seciliOdulEmoji,
    target: document.getElementById('odul-hedef').value
  };

  const sonuc = validateRewardInput(girdi);
  if (!sonuc.valid) {
    const h = document.getElementById('odul-hata');
    h.textContent = sonuc.errors[0];
    h.hidden = false;
    return;
  }

  profile = addReward(profile, {
    name: girdi.name.trim(),
    emoji: girdi.emoji,
    target: Number(girdi.target)
  });
  state.saveProfile(profile);
  kapatOdulModal();
  render();
}

function silOdul(id) {
  profile = removeReward(profile, id);
  state.saveProfile(profile);
  render();
}

// Sohbetin ebeveyn ayarlari: API anahtari ve sohbette anilan es adi.
// Cocuk ekraninda degil ebeveyn sekmesinde durur.
function sohbetAyarBolumu() {
  const anahtarVar = Boolean(state.loadApiKey());
  const esAdi = state.loadSohbetEs();

  return el('section', { className: 'parent-sohbet' }, [
    el('h2', { className: 'parent-guardians__title', text: ceviri('parent.chatSettings') }),

    el('label', { className: 'parent-sohbet__label', text: ceviri('parent.apiKey') }),
    el('input', {
      className: 'parent-sohbet__input',
      attrs: {
        type: 'password',
        id: 'sohbet-apikey',
        placeholder: anahtarVar ? ceviri('parent.apiKeySaved') : ceviri('parent.apiKeyEmpty')
      }
    }),

    el('label', { className: 'parent-sohbet__label', text: ceviri('parent.partnerName') }),
    el('input', {
      className: 'parent-sohbet__input',
      attrs: { type: 'text', id: 'sohbet-esadi', value: esAdi, placeholder: 'örn. Feride Mama' }
    }),
    el('p', {
      className: 'parent-sohbet__not',
      text: ceviri('parent.partnerNote')
    }),

    el('button', {
      className: 'parent-sohbet__kaydet',
      text: ceviri('parent.save'),
      attrs: { type: 'button' },
      dataset: { sohbetAyarKaydet: 'yes' }
    })
  ]);
}

// Dil secici (ebeveyn). TR/EN dugmeleri; secilince profile.settings.language
// guncellenir, kaydedilir ve tum ekran yeniden cizilir.
function dilBolumu() {
  return el('section', { className: 'parent-guardians' }, [
    el('h2', { className: 'parent-guardians__title', text: ceviri('parent.language') }),
    el('div', { className: 'dil-secici' }, DILLER.map((d) =>
      el('button', {
        className: d === dil() ? 'dil-dugme dil-dugme--secili' : 'dil-dugme',
        text: d.toUpperCase(),
        attrs: { type: 'button' },
        dataset: { dilSec: d }
      })
    ))
  ]);
}

function dilSec(d) {
  if (!DILLER.includes(d) || d === dil()) return;
  profile = { ...profile, settings: { ...profile.settings, language: d } };
  state.saveProfile(profile);
  uygulaDil();
  render();
}

function renderGames() {
  const target = document.getElementById('view-games');

  const OYUN_ANAHTAR = { amiral: 'games.amiral', satranc: 'games.satrancLearn', 'satranc-oyun': 'games.satranc' };

  mount(target, GAMES.map((g) =>
    el('button', {
      className: 'games-card games-card--available',
      attrs: { type: 'button' },
      dataset: { game: g.id }
    }, [
      el('span', { className: 'material-symbols-rounded games-card__icon', text: g.icon }),
      el('span', { className: 'games-card__title', text: ceviri(OYUN_ANAHTAR[g.id]) })
    ])
  ));
}

function render() {
  uygulaDil();
  lastSignature = renderSignature(profile, now());
  renderRoutine();
  renderParent();
  renderGames();
  renderSohbet();
}

// v1'den tasinan emegin tek seferlik karsilamasi.
//
// Kosul bilerek "tasinacak bir sey var mi" degil, "yildiz var mi".
// Yalniz API anahtari tasinan bir kullanicida ekran "0 yildizin burada"
// derdi; bu hem anlamsiz hem moral bozucu. Tasima yine de calisir,
// yalnizca ekran cikmaz.
//
// Ekran migrateOnce'in bu acilista gercekten calismis olmasina bagli:
// sayfa yenilendiginde isaret konmus olur, plan bos doner, karsilama
// bir daha cikmaz. Yildiz sayisi plandan degil kayitli mirastan
// okunur, cunku ekranda yazan sayi ile toplamda sayilan sayi ayni
// kaynaktan gelmelidir.
function karsilamayiGosterGerekirse() {
  if (!tasimaSonucu || tasimaSonucu.zatenTasinmis) return;

  const yildiz = state.loadLegacy().stars;
  if (!(yildiz > 0)) return;

  mount(document.getElementById('migrate-box'), [
    el('p', { className: 'migrate__yildiz', text: '⭐' }),
    el('p', {
      className: 'migrate__metin',
      text: ceviri('migrate.text', { n: yildiz })
    }),
    el('button', {
      className: 'migrate__dugme',
      text: ceviri('migrate.start'),
      attrs: { type: 'button' },
      dataset: { migrateOk: 'yes' }
    })
  ]);

  document.getElementById('migrate-modal').hidden = false;
}

function karsilamayiKapat() {
  document.getElementById('migrate-modal').hidden = true;
}

// --- Onboarding (ilk kurulum) ---
//
// Yalniz profil YOKKEN gosterilir. Ebeveyn cocugun adini/yasini, ilk
// bakim vereni (ad, etiket, PIN) ve bir rutin sablonu girer. Bittiginde
// profil olusturulur ve uygulama baslar. Mevcut kullanici (Deha) buraya
// hic dusmez.
function onboardingHata(mesaj) {
  const k = document.getElementById('ob-hata');
  k.textContent = mesaj;
  k.hidden = false;
}

function onboardingiGoster() {
  uygulaDil();
  // Sablon secenekleri ROUTINE_TEMPLATES'ten cizilir; ilkokul secili gelir.
  // Baslik/aciklama i18n anahtariyla cevrilir (template.<id>.title/.desc).
  mount(document.getElementById('ob-sablonlar'), ROUTINE_TEMPLATES.map((sb) =>
    el('label', { className: 'onboarding__sablon' }, [
      el('input', {
        attrs: { type: 'radio', name: 'ob-sablon', value: sb.id, ...(sb.id === 'ilkokul' ? { checked: 'checked' } : {}) }
      }),
      el('span', {}, [
        el('span', { className: 'onboarding__sablon-ad', text: ceviri('template.' + sb.id + '.title') }),
        el('span', { className: 'onboarding__sablon-aciklama', text: ceviri('template.' + sb.id + '.desc') })
      ])
    ])
  ));
  document.getElementById('onboarding').hidden = false;
}

async function onboardingBasla() {
  const ad = document.getElementById('ob-ad').value.trim();
  const yas = Number(document.getElementById('ob-yas').value.trim());
  const verenAd = document.getElementById('ob-veren-ad').value;
  const etiket = document.getElementById('ob-veren-etiket').value;
  const pin = document.getElementById('ob-pin').value;
  const pin2 = document.getElementById('ob-pin2').value;
  const sablon = document.querySelector('input[name="ob-sablon"]:checked')?.value;

  if (!ad) return onboardingHata(ceviri('onboarding.errName'));
  if (!Number.isInteger(yas) || yas < 3 || yas > 16) return onboardingHata(ceviri('onboarding.errAge'));

  const dogrulama = validateGuardianInput({ name: verenAd, label: etiket, pin, pinConfirm: pin2 });
  if (!dogrulama.valid) return onboardingHata(dogrulama.errors[0]);
  if (!sablon) return onboardingHata(ceviri('onboarding.errTemplate'));

  const { hash, salt } = await hashPin(pin);
  profile = seedProfile({
    childName: ad,
    birthYear: now().getFullYear() - yas,
    guardians: [{ name: verenAd.trim(), label: etiket.trim(), pinHash: hash, pinSalt: salt }],
    sablon
  });
  state.saveProfile(profile);
  tasimaSonucu = state.migrateOnce((anahtar) => window.localStorage.getItem(anahtar));
  sohbetGecmis = state.loadSohbet();

  document.getElementById('onboarding').hidden = true;
  uygulamayiBaslat();
}

function renderIfStale() {
  if (document.getElementById('pin-modal').hidden === false) return;
  if (document.getElementById('guardian-modal').hidden === false) return;
  if (document.getElementById('timequiz-modal').hidden === false) return;
  if (document.getElementById('drill-modal').hidden === false) return;
  if (document.getElementById('amiral-modal').hidden === false) return;
  if (document.getElementById('satranc-modal').hidden === false) return;
  if (document.getElementById('satranc-oyun-modal').hidden === false) return;
  if (document.getElementById('gorev-modal').hidden === false) return;
  if (document.getElementById('odul-modal').hidden === false) return;
  if (renderSignature(profile, now()) !== lastSignature) render();
}

function sonrakiSoru() {
  const facts = state.loadTimeFacts();
  const secilebilir = Object.fromEntries(
    Object.entries(facts).filter(([k]) => k !== aktifSoru?.kind || QUESTION_KINDS.length === 1)
  );
  const kind = selectWeighted(secilebilir) ?? QUESTION_KINDS[0];

  aktifSoru = buildQuestion(kind, now());
  cizQuiz();
}

function cizQuiz() {
  document.getElementById('timequiz-progress').textContent =
    `${QUIZ_SORU_SAYISI - quizKalan + 1} / ${QUIZ_SORU_SAYISI}`;
  document.getElementById('timequiz-prompt').textContent = aktifSoru.prompt;
  document.getElementById('timequiz-feedback').hidden = true;

  mount(document.getElementById('timequiz-options'), aktifSoru.options.map((o) =>
    el('button', {
      className: 'timequiz__option',
      text: o,
      attrs: { type: 'button' },
      dataset: { quizOption: o }
    })
  ));
}

function cevapla(secim) {
  const dogru = secim === aktifSoru.answer;
  quizSonuclari.push({ kind: aktifSoru.kind, correct: dogru });

  if (!dogru) {
    const geri = document.getElementById('timequiz-feedback');
    geri.textContent = `Doğrusu: ${aktifSoru.answer}. Bir daha deneyelim.`;
    geri.hidden = false;
    return;
  }

  quizKalan -= 1;

  if (quizKalan > 0) {
    sonrakiSoru();
    return;
  }

  let facts = state.loadTimeFacts();
  for (const s of quizSonuclari) facts = recordTimeAnswer(facts, s.kind, s.correct);
  state.saveTimeFacts(facts);

  const dp = state.loadDayProgress(today());
  state.saveDayProgress(today(), completeCard(profile, dp, 'sabah-takvim', now()));

  kapatQuiz();
  render();
}

function acQuiz() {
  quizKalan = QUIZ_SORU_SAYISI;
  quizSonuclari = [];
  document.getElementById('timequiz-modal').hidden = false;
  sonrakiSoru();
}

function kapatQuiz() {
  document.getElementById('timequiz-modal').hidden = true;
  aktifSoru = null;
  quizSonuclari = [];
}

const DRILL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'sil', '0', 'tamam'];

function cizDrillPad() {
  mount(document.getElementById('drill-pad'), DRILL_KEYS.map((k) =>
    el('button', {
      className: 'drill__key',
      text: k === 'sil' ? 'Sil' : k === 'tamam' ? 'Tamam' : k,
      attrs: { type: 'button' },
      dataset: { drillKey: k }
    })
  ));
}

function cizDrill() {
  const s = drillSession;
  document.getElementById('drill-progress').textContent =
    `${SESSION_LENGTH - s.remaining + 1} / ${SESSION_LENGTH}`;
  const soruEl = document.getElementById('drill-question');
  soruEl.textContent = s.current ? s.current.text : '';
  soruEl.className = s.current?.kind === 'problem' ? 'drill__question drill__question--problem' : 'drill__question';
  document.getElementById('drill-input').textContent = drillTyped;
}

function drillTusla(tus) {
  if (!drillSession || drillSession.finished) return;

  if (tus === 'sil') {
    drillTyped = drillTyped.slice(0, -1);
    document.getElementById('drill-input').textContent = drillTyped;
    return;
  }

  if (tus === 'tamam') {
    drillOnayla();
    return;
  }

  if (drillTyped.length >= 3) return;
  drillTyped += tus;
  document.getElementById('drill-input').textContent = drillTyped;
}

// Alistirma ekranini normal haline dondurur. Hem acilista hem kapanista
// cagrilir, yoksa kutlama duzeni bir sonraki oturuma sizar.
function drillNormalGorunum() {
  document.getElementById('drill-question').hidden = false;
  document.getElementById('drill-input').hidden = false;
  document.getElementById('drill-pad').hidden = false;
  document.getElementById('drill-feedback').hidden = true;
  document.getElementById('drill-celebrate').hidden = true;

  const kapat = document.getElementById('drill-cancel');
  kapat.textContent = 'Kapat';
  kapat.classList.remove('is-primary');
}

// Seviye atlandiginda ekran kendiliginden kapanmaz. Bir seviyeyi bitirmek
// haftalar suruyor; cocuk bunu gormeden pencere kaybolursa emeginin tek
// gorunur karsiligi da kaybolur. Kapatma karari cocugun olsun diye
// zamanlayici degil dugme kullaniliyor.
//
// Kutlama .drill__feedback kutusunu kullanmaz: o kutu yanlis cevap
// bildirimi, yani cocugun hata olarak tanidigi bicim ve renk.
function drillKutlama() {
  document.getElementById('drill-question').hidden = true;
  document.getElementById('drill-input').hidden = true;
  document.getElementById('drill-pad').hidden = true;
  document.getElementById('drill-feedback').hidden = true;
  document.getElementById('drill-progress').textContent = '';

  document.getElementById('drill-celebrate-level').textContent =
    levelById(drillSession.drill.level)?.title ?? '';
  document.getElementById('drill-celebrate').hidden = false;

  const kapat = document.getElementById('drill-cancel');
  kapat.textContent = 'Devam';
  kapat.classList.add('is-primary');
}

function drillOnayla() {
  if (drillTyped === '') return;

  const gecenMs = performance.now() - drillShownAt;
  const sonraki = answerCurrent(drillSession, drillTyped, gecenMs);
  const dogru = sonraki.lastCorrect;
  const dogruCevap = sonraki.lastAnswer;
  drillSession = sonraki;
  drillTyped = '';
  drillShownAt = performance.now();

  const geri = document.getElementById('drill-feedback');
  geri.textContent = dogru ? 'Doğru!' : `Doğrusu: ${dogruCevap}`;
  geri.hidden = false;

  if (sonraki.finished) {
    state.saveDrill(sonraki.drill);
    const dp = state.loadDayProgress(today());
    state.saveDayProgress(today(), completeCard(profile, dp, 'ogle-matematik', now()));

    if (sonraki.levelUp) drillKutlama();
    else kapatDrill();
    return;
  }

  cizDrill();
}

function acDrill() {
  drillSession = startSession(state.loadDrill());
  drillTyped = '';
  drillShownAt = performance.now();
  cizDrillPad();
  cizDrill();
  drillNormalGorunum();
  document.getElementById('drill-modal').hidden = false;
}

function kapatDrill() {
  const bitmisti = drillSession?.finished === true;

  document.getElementById('drill-modal').hidden = true;
  drillNormalGorunum();
  drillSession = null;
  drillTyped = '';

  if (bitmisti) render();
}

function amiralBitti(durum) {
  return isDefeated(durum.enemy) || isDefeated(durum.own);
}

function amiralHucreSinifi(board, cell) {
  const atis = board.shots[cell];
  if (!atis) return 'amiral__kare';
  if (atis === 'miss') return 'amiral__kare amiral__kare--iska';

  const gemi = board.ships.find((s) => s.cells.includes(cell));
  const batik = gemi && gemi.hits.length === gemi.cells.length;
  return batik ? 'amiral__kare amiral__kare--batik' : 'amiral__kare amiral__kare--isabet';
}

function amiralKareNode(board, x, y, bitti) {
  const cell = cellId(x, y);
  const atildi = Boolean(board.shots[cell]);
  return el('button', {
    className: amiralHucreSinifi(board, cell),
    attrs: { type: 'button', ...((atildi || bitti) ? { disabled: 'disabled' } : {}) },
    dataset: { amiralCell: cell }
  });
}

// Senin filon: gemiler HER ZAMAN gorunur (cocuk kendi denizini gorsun),
// uzerine rakibin atislari islenir. Tiklanmaz, yalniz gosterim; bu yuzden
// buton degil div.
function amiralKendiSinifi(board, cell) {
  const gemi = board.ships.find((s) => s.cells.includes(cell));
  const atis = board.shots[cell];
  if (gemi) {
    if (!atis) return 'amiral__kare amiral__kare--gemi';
    const batik = gemi.hits.length === gemi.cells.length;
    return batik ? 'amiral__kare amiral__kare--batik' : 'amiral__kare amiral__kare--isabet';
  }
  return atis === 'miss' ? 'amiral__kare amiral__kare--iska' : 'amiral__kare';
}

function amiralKendiNode(board, x, y) {
  return el('div', { className: amiralKendiSinifi(board, cellId(x, y)) });
}

// Etiketli 8x8 izgarayi cizer. Kare dugumunu cagiran belirler: rakip
// tahtasi tiklanabilir buton, senin filon gosterim amacli div.
function cizTahta(board, hedefId, kareNodeFn) {
  const cocuklar = [el('span', { className: 'amiral__etiket' })];

  for (let x = 0; x < BOARD_SIZE; x++) {
    cocuklar.push(el('span', { className: 'amiral__etiket', text: cellId(x, 0)[0] }));
  }

  for (let y = 0; y < BOARD_SIZE; y++) {
    cocuklar.push(el('span', { className: 'amiral__etiket', text: String(y + 1) }));
    for (let x = 0; x < BOARD_SIZE; x++) {
      cocuklar.push(kareNodeFn(board, x, y));
    }
  }

  mount(document.getElementById(hedefId), cocuklar);
}

function cizAmiralDurum() {
  document.getElementById('amiral-durum').textContent =
    ceviri('amiral.status', { r: remainingShips(amiralDurum.enemy), s: remainingShips(amiralDurum.own) });
}

function amiralMesajGoster(metin) {
  const kutu = document.getElementById('amiral-mesaj');
  kutu.textContent = metin;
  kutu.hidden = false;
}

function amiralMesajGizle() {
  const kutu = document.getElementById('amiral-mesaj');
  kutu.textContent = '';
  kutu.hidden = true;
}

function cizAmiral() {
  const bitti = amiralBitti(amiralDurum);
  cizTahta(amiralDurum.enemy, 'amiral-tahta', (b, x, y) => amiralKareNode(b, x, y, bitti));
  cizTahta(amiralDurum.own, 'amiral-kendi', amiralKendiNode);
  cizAmiralDurum();
}

function acAmiral() {
  let durum = state.loadGame('amiral');
  if (!durum) {
    durum = { own: createBoard(), enemy: createBoard() };
    state.saveGame('amiral', durum);
  }
  amiralDurum = durum;

  cizAmiral();
  if (isDefeated(amiralDurum.enemy)) amiralMesajGoster(ceviri('amiral.win'));
  else if (isDefeated(amiralDurum.own)) amiralMesajGoster(ceviri('amiral.lose'));
  else amiralMesajGizle();

  document.getElementById('amiral-modal').hidden = false;
}

function kapatAmiral() {
  document.getElementById('amiral-modal').hidden = true;
}

function yeniAmiralOyunu() {
  amiralDurum = { own: createBoard(), enemy: createBoard() };
  state.saveGame('amiral', amiralDurum);
  amiralMesajGizle();
  cizAmiral();
}

// Cocuk her tur once ates eder; denge (bkz. engines/battleship.js) bu
// sirayla olculdu, degistirilirse bozulur.
function amiralAtis(cell) {
  if (!amiralDurum || amiralBitti(amiralDurum)) return;
  if (amiralDurum.enemy.shots[cell]) return;

  const mesajlar = [];

  const cocukAtis = fire(amiralDurum.enemy, cell);
  amiralDurum = { ...amiralDurum, enemy: cocukAtis.board };
  if (cocukAtis.result === 'sunk') mesajlar.push(ceviri('amiral.sunkEnemy'));

  if (isDefeated(amiralDurum.enemy)) {
    state.saveGame('amiral', amiralDurum);
    cizAmiral();
    amiralMesajGoster(ceviri('amiral.win'));
    return;
  }

  const hedef = aiChoose(amiralDurum.own);
  if (hedef) {
    const rakipAtis = fire(amiralDurum.own, hedef);
    amiralDurum = { ...amiralDurum, own: rakipAtis.board };
    if (rakipAtis.result === 'sunk') mesajlar.push(ceviri('amiral.sunkYours'));
  }

  state.saveGame('amiral', amiralDurum);
  cizAmiral();

  if (isDefeated(amiralDurum.own)) {
    amiralMesajGoster(ceviri('amiral.lose'));
    return;
  }

  if (mesajlar.length > 0) amiralMesajGoster(mesajlar.join(' '));
  else amiralMesajGizle();
}

// Unicode satranc karakterleri. Resim dosyasi yok: tek bir yazi tipi
// karakteri her ekranda keskin cikar ve indirilecek bir sey kalmaz.
const SATRANC_GLIF = { K: '♜', F: '♝', V: '♛', S: '♚', A: '♞', P: '♟' };

const SATRANC_GOREV = {
  serbest: (ad) => `${ad} nereye gidebilir? Gidebileceği bir kareye dokun.`,
  engelli: (ad) => `Yolda taşlar var. ${ad} şimdi nereye gidebilir? Bir kareye dokun.`,
  alma: (ad) => `${ad} hangi taşı alabilir? O taşın karesine dokun.`
};

// Geri bildirim ders tipine gore degisir, cunku yesilin anlami degisir.
// serbest/engelli derste yesil "gidebilecegi kareler" demektir; alma
// dersinde yalnizca "alabilecegi tas" demektir. Ayni cumleyi ucunde de
// kullanmak cocuga yanlis kural ogretiyordu: alma dersinde tas yesil
// degil diye oraya gidemeyecegini sanirdi. Kural ogreten bir ekranda
// yanlis cumle, eksik cumleden kotudur.
// serbest ve engelli derste yesil ayni seyi anlatir: gidebilecegi
// karelerin tamami. Bu yuzden ayni cumleyi paylasirlar. alma dersinde
// yesilin anlami degistigi icin o ayri yazilir.
const gidebilirGeri = (ad, dogru) =>
  dogru
    ? `Doğru! ${ad} yeşil karelerin hepsine gidebilir.`
    : `${ad} oraya gidemez. Gidebileceği kareler yeşil.`;

const SATRANC_GERI = {
  serbest: gidebilirGeri,
  engelli: gidebilirGeri,
  alma: (ad, dogru, kareDolu) => {
    if (dogru) return `Doğru! ${ad} o taşı alabilir.`;
    return kareDolu
      ? `${ad} o taşı alamaz. Alabileceği taş yeşil.`
      : `Orada alınacak taş yok. Alabileceği taş yeşil.`;
  }
};

let satrancKartlar = {};
let satrancTas = null;
let satrancSoru = null;
let satrancIsaret = {};
let satrancCevaplandi = false;

function satrancTasBilgi(kod) {
  return chessViewModel(satrancKartlar).taslar.find((t) => t.kod === kod);
}

function satrancTasNode(t) {
  const dersler = el('span', { className: 'satranc__tas-dersler' },
    t.dersler.map((d) => el('span', {
      className: d.ogrenildi ? 'satranc__nokta satranc__nokta--tamam' : 'satranc__nokta'
    })));

  return el('button', {
    className: t.acik ? 'satranc__tas' : 'satranc__tas satranc__tas--kilitli',
    attrs: { type: 'button', ...(t.acik ? {} : { disabled: 'disabled' }) },
    dataset: { satrancTas: t.kod }
  }, [
    el('span', { className: 'satranc__glif', text: SATRANC_GLIF[t.kod] }),
    el('span', { className: 'satranc__tas-ad', text: t.ad }),
    t.acik
      ? dersler
      : el('span', { className: 'material-symbols-rounded satranc__kilit', text: 'lock' })
  ]);
}

function cizSatrancTaslar() {
  mount(document.getElementById('satranc-taslar'),
    chessViewModel(satrancKartlar).taslar.map(satrancTasNode));
}

function satrancKareNode(x, y) {
  const kare = kareId(x, y);
  const kendi = kare === satrancSoru.kare;
  const tasKod = kendi ? satrancSoru.tas : satrancSoru.tahta[kare];

  // Damali tahta sart: filin dersi "basladigi karenin rengini
  // degistirmez" ancak kareler gozle ayirt edilebilirse anlam tasir.
  const siniflar = ['satranc__kare', (x + y) % 2 === 0 ? 'satranc__kare--koyu' : 'satranc__kare--acik'];
  if (kendi) siniflar.push('satranc__kare--aktif');
  else if (tasKod) siniflar.push('satranc__kare--hedef');
  if (satrancIsaret[kare]) siniflar.push(`satranc__kare--${satrancIsaret[kare]}`);

  return el('button', {
    className: siniflar.join(' '),
    text: tasKod ? SATRANC_GLIF[tasKod] : '',
    attrs: { type: 'button', 'aria-label': kare },
    dataset: { satrancKare: kare }
  });
}

function cizSatrancTahta() {
  const kareler = [];
  for (let y = TAHTA_BOYU - 1; y >= 0; y--) {
    for (let x = 0; x < TAHTA_BOYU; x++) kareler.push(satrancKareNode(x, y));
  }
  mount(document.getElementById('satranc-tahta'), kareler);
}

function satrancYeniSoru() {
  const ders = sonrakiDers(satrancKartlar, satrancTas);
  satrancSoru = soruUret(satrancTas, ders, Math.random);
  satrancIsaret = {};
  satrancCevaplandi = false;

  document.getElementById('satranc-kural').textContent = satrancSoru.anlat;
  document.getElementById('satranc-gorev').textContent =
    SATRANC_GOREV[ders](satrancTasBilgi(satrancTas).ad);
  document.getElementById('satranc-geribildirim').hidden = true;
  cizSatrancTahta();
}

function satrancKareTikla(kare) {
  if (!satrancSoru || satrancCevaplandi) return;
  if (kare === satrancSoru.kare) return;

  const dogru = satrancSoru.dogruKareler.includes(kare);
  satrancCevaplandi = true;

  // Dogru kareler her iki durumda da gosterilir: yanlis yapan cocuk
  // cevabi gorur, dogru yapan da tasin gidebilecegi butun kareleri.
  satrancIsaret = {};
  for (const k of satrancSoru.dogruKareler) satrancIsaret[k] = 'cevap';
  satrancIsaret[kare] = dogru ? 'dogru' : 'yanlis';

  const oncekiAcik = chessViewModel(satrancKartlar).acikTaslar.length;
  satrancKartlar = satrancCevapla(satrancKartlar, satrancSoru.tas, satrancSoru.tip, dogru);
  state.saveChess(satrancKartlar);
  const vm = chessViewModel(satrancKartlar);

  const geri = document.getElementById('satranc-geribildirim');
  geri.textContent = SATRANC_GERI[satrancSoru.tip](
    satrancTasBilgi(satrancSoru.tas).ad,
    dogru,
    Boolean(satrancSoru.tahta[kare])
  );
  geri.className = dogru
    ? 'satranc__geribildirim satranc__geribildirim--dogru'
    : 'satranc__geribildirim satranc__geribildirim--yanlis';
  geri.hidden = false;

  if (vm.acikTaslar.length > oncekiAcik) {
    const yeni = vm.taslar.find((t) => t.kod === vm.acikTaslar[vm.acikTaslar.length - 1]);
    satrancMujde(`${satrancTasBilgi(satrancTas).ad} tamam! Yeni taş açıldı: ${yeni.ad}`);
  }

  cizSatrancTahta();
  cizSatrancTaslar();
}

function satrancMujde(metin) {
  const kutu = document.getElementById('satranc-mujde');
  kutu.textContent = metin;
  kutu.hidden = metin === '';
}

function satrancTasSec(kod) {
  if (!chessViewModel(satrancKartlar).acikTaslar.includes(kod)) return;
  satrancTas = kod;
  document.getElementById('satranc-secim').hidden = true;
  document.getElementById('satranc-soru').hidden = false;
  satrancYeniSoru();
}

function satrancTaslaraDon() {
  satrancTas = null;
  satrancSoru = null;
  document.getElementById('satranc-soru').hidden = true;
  document.getElementById('satranc-secim').hidden = false;
  cizSatrancTaslar();
}

function acSatranc() {
  satrancKartlar = state.loadChess();
  satrancMujde('');
  satrancTaslaraDon();
  document.getElementById('satranc-modal').hidden = false;
}

function kapatSatranc() {
  document.getElementById('satranc-modal').hidden = true;
  satrancTaslaraDon();
  satrancMujde('');
}

// --- Satranc oyunu (gercek oyun, AI'ya karsi) ---
//
// Cocuk beyaz oynar (altta), AI siyah. Ogretme modundan (yukaridaki
// satranc*) ayridir: o alti tasin hareketini ogretir, bu gercek oyunu
// oynatir. Kurallar engines/chessgame.js'te; burada yalniz ekran ve sira.
//
// Taslar Unicode ile cizilir (resim yok). Beyaz/siyah ayrimini glif degil
// RENK yapar: ikisi de dolu glif, CSS beyazi acik, siyahi koyu boyar.
const SOYUN_GLIF = { K: '♜', A: '♞', F: '♝', V: '♛', S: '♚', P: '♟' };

let soyunDurum = null;
let soyunSecili = null;       // secili karenin adi, ya da null
let soyunYasal = [];          // secili tasin gidebilecegi kareler (to listesi)

function soyunKareNode(kare, tasKod) {
  const { x, y } = kareCoz(kare);
  const siniflar = ['soyun__kare', (x + y) % 2 === 0 ? 'soyun__kare--koyu' : 'soyun__kare--acik'];
  if (kare === soyunSecili) siniflar.push('soyun__kare--secili');
  if (soyunYasal.includes(kare)) {
    siniflar.push(tasKod ? 'soyun__kare--alinabilir' : 'soyun__kare--gidilebilir');
  }

  const cocuklar = tasKod
    ? [el('span', {
        className: renkOf(tasKod) === 'b' ? 'soyun__tas soyun__tas--beyaz' : 'soyun__tas soyun__tas--siyah',
        text: SOYUN_GLIF[tipOf(tasKod)]
      })]
    : [];

  return el('button', {
    className: siniflar.join(' '),
    attrs: { type: 'button', 'aria-label': kare },
    dataset: { soyunKare: kare }
  }, cocuklar);
}

function cizSoyunDurum() {
  const dEl = document.getElementById('satranc-oyun-durum');
  if (soyunDurum.sira === 'b') {
    dEl.textContent = sahTehditAltinda(soyunDurum.tahta, 'b')
      ? ceviri('chessGame.inCheck')
      : ceviri('chessGame.yourTurn');
  } else {
    dEl.textContent = ceviri('chessGame.thinking');
  }
}

function cizSoyun() {
  const kareler = [];
  for (let y = TAHTA_BOYU - 1; y >= 0; y--) {
    for (let x = 0; x < TAHTA_BOYU; x++) {
      const kare = kareId(x, y);
      kareler.push(soyunKareNode(kare, soyunDurum.tahta[kare]));
    }
  }
  mount(document.getElementById('satranc-oyun-tahta'), kareler);
  cizSoyunDurum();
}

// mat/pat ekrani. durumu 'mat' ise sira kimdeyse o kaybetti: sira siyahsa
// (AI) cocuk kazandi.
function soyunBitir(durumu) {
  const mesaj = document.getElementById('satranc-oyun-mesaj');
  if (durumu === 'pat') {
    mesaj.textContent = ceviri('chessGame.stalemate');
  } else {
    mesaj.textContent = soyunDurum.sira === 's'
      ? ceviri('chessGame.youMate')
      : ceviri('chessGame.youLose');
  }
  mesaj.hidden = false;
  document.getElementById('satranc-oyun-durum').textContent = '';
}

function soyunAiOyna() {
  if (!soyunDurum || soyunDurum.sira !== 's') return;

  const hamle = enIyiHamle(soyunDurum, 2);
  if (!hamle) return;

  soyunDurum = satrancHamleUygula(soyunDurum, hamle);
  state.saveGame('satranc-oyun', soyunDurum);
  cizSoyun();

  const durumu = satrancOyunDurumu(soyunDurum);
  if (durumu !== 'devam') soyunBitir(durumu);
}

function soyunOyna(hamle) {
  soyunDurum = satrancHamleUygula(soyunDurum, hamle);
  soyunSecili = null;
  soyunYasal = [];
  state.saveGame('satranc-oyun', soyunDurum);
  cizSoyun();

  const durumu = satrancOyunDurumu(soyunDurum);
  if (durumu !== 'devam') {
    soyunBitir(durumu);
    return;
  }

  // Kisa gecikme: cocuk once kendi hamlesini oturmus gorsun, sonra rakip.
  setTimeout(soyunAiOyna, 300);
}

function soyunKareTikla(kare) {
  if (!soyunDurum || soyunDurum.sira !== 'b') return;
  if (satrancOyunDurumu(soyunDurum) !== 'devam') return;

  // Secili tasin yasal hedefi: oyna.
  if (soyunSecili && soyunYasal.includes(kare)) {
    soyunOyna({ from: soyunSecili, to: kare });
    return;
  }

  // Kendi tasina dokundu: sec ve gidebilecegi kareleri goster.
  const tas = soyunDurum.tahta[kare];
  if (tas && renkOf(tas) === 'b') {
    soyunSecili = kare;
    soyunYasal = satrancYasalHamleler(soyunDurum)
      .filter((h) => h.from === kare)
      .map((h) => h.to);
    cizSoyun();
    return;
  }

  // Bosluga ya da rakibe dokundu: secimi birak.
  soyunSecili = null;
  soyunYasal = [];
  cizSoyun();
}

function acSoyun() {
  soyunDurum = state.loadGame('satranc-oyun') || baslangicTahtasi();
  soyunSecili = null;
  soyunYasal = [];
  document.getElementById('satranc-oyun-mesaj').hidden = true;
  cizSoyun();

  const durumu = satrancOyunDurumu(soyunDurum);
  if (durumu !== 'devam') soyunBitir(durumu);
  else if (soyunDurum.sira === 's') setTimeout(soyunAiOyna, 300);

  document.getElementById('satranc-oyun-modal').hidden = false;
}

function kapatSoyun() {
  document.getElementById('satranc-oyun-modal').hidden = true;
}

function yeniSoyun() {
  soyunDurum = baslangicTahtasi();
  soyunSecili = null;
  soyunYasal = [];
  state.saveGame('satranc-oyun', soyunDurum);
  document.getElementById('satranc-oyun-mesaj').hidden = true;
  cizSoyun();
}

// --- Sohbet ---

// Karsilama gecmise YAZILMAZ: yalniz gecmis bosken gosterilir. Kayitli
// olsaydi her istekte modele sahte bir "ai" turu olarak geri gonderilirdi.
function sohbetKarsilama() {
  const vm = routineViewModel(profile, state.loadDayProgress(today()), now());
  return ceviri('chat.welcome', { ad: vm.childName });
}

function sohbetBaloncuk(m) {
  return el('div', {
    className: m.rol === 'cocuk'
      ? 'sohbet__mesaj sohbet__mesaj--cocuk'
      : 'sohbet__mesaj sohbet__mesaj--ai',
    text: m.metin
  });
}

function renderSohbet() {
  const liste = document.getElementById('sohbet-liste');
  if (!liste) return;

  const balonlar = sohbetGecmis.length === 0
    ? [el('div', { className: 'sohbet__mesaj sohbet__mesaj--ai', text: sohbetKarsilama() })]
    : sohbetGecmis.map(sohbetBaloncuk);

  if (sohbetBekliyor) {
    balonlar.push(el('div', {
      className: 'sohbet__mesaj sohbet__mesaj--ai sohbet__mesaj--bekliyor',
      text: '•••'
    }));
  }

  mount(liste, balonlar);
  liste.scrollTop = liste.scrollHeight;

  mount(document.getElementById('sohbet-oneriler'), SOHBET_ONERI_ANAHTARLARI.map((anahtar) => {
    const metin = ceviri(anahtar);
    return el('button', {
      className: 'sohbet__oneri',
      text: metin,
      attrs: { type: 'button' },
      dataset: { sohbetOneri: metin }
    });
  }));

  document.getElementById('sohbet-gonder').disabled = sohbetBekliyor;
}

// Agli tek yer. Motorlar (engines/) aga cikmaz; istek govdesini onlar
// kurar, gonderme isi burada. v1 ile ayni Gemini uc noktasi.
async function sohbetIste(anahtar, govde) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${SOHBET_MODEL}:generateContent?key=${encodeURIComponent(anahtar)}`;
  const cevap = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde)
  });
  if (!cevap.ok) throw new Error(`API ${cevap.status}`);
  return cevap.json();
}

async function sohbetGonder(metin) {
  const temiz = String(metin ?? '').trim();
  if (!temiz || sohbetBekliyor) return;

  sohbetGecmis = [...sohbetGecmis, { rol: 'cocuk', metin: temiz }];
  state.saveSohbet(sohbetGecmis);
  document.getElementById('sohbet-metin').value = '';

  // Anahtar yoksa cocuga teknik hata degil, sakin bir mesaj.
  const anahtar = state.loadApiKey();
  if (!anahtar) {
    sohbetGecmis = [...sohbetGecmis, { rol: 'ai', metin: ceviri('chat.noKey') }];
    state.saveSohbet(sohbetGecmis);
    renderSohbet();
    return;
  }

  sohbetBekliyor = true;
  renderSohbet();

  try {
    const vm = routineViewModel(profile, state.loadDayProgress(today()), now());
    const baglam = {
      dil: dil(),
      cocukAdi: vm.childName,
      bakimVerenAdi: state.loadSohbetEs(),
      seviyeAdi: levelById(state.loadDrill().level)?.title ?? '',
      // Takvim baglami da aktif dilde: EN sohbette "Sunday, July" gecsin.
      gun: ceviri('cal.day.' + vm.today.dayIndex),
      ay: ceviri('cal.month.' + vm.today.monthIndex),
      mevsim: ceviri('cal.season.' + vm.today.seasonIndex)
    };
    // Son mesaj gecmisten cikarilir; istekGovdesi onu ayrica ekliyor.
    const govde = istekGovdesi(sistemIstemi(baglam), sohbetGecmis.slice(0, -1), temiz);
    const yanit = yanitAyikla(await sohbetIste(anahtar, govde)) ?? ceviri('chat.empty');
    sohbetGecmis = [...sohbetGecmis, { rol: 'ai', metin: yanit }];
  } catch (err) {
    sohbetGecmis = [...sohbetGecmis, { rol: 'ai', metin: ceviri('chat.error') }];
  } finally {
    sohbetBekliyor = false;
    state.saveSohbet(sohbetGecmis);
    renderSohbet();
  }
}

function kaydetSohbetAyar() {
  const anahtar = document.getElementById('sohbet-apikey').value.trim();
  // Bos birakilan anahtar mevcut (tasinan ya da kayitli) anahtari SILMEZ.
  if (anahtar) state.saveApiKey(anahtar);
  state.saveSohbetEs(document.getElementById('sohbet-esadi').value.trim());
  renderParent();
}

function openPinModal(cardId) {
  pendingCardId = cardId;

  mount(document.getElementById('pin-guardians'), profile.guardians.map((g, i) =>
    el('label', {}, [
      el('input', { attrs: { type: 'radio', name: 'guardian', value: g.id, ...(i === 0 ? { checked: 'checked' } : {}) } }),
      el('span', { text: g.label })
    ])
  ));

  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').hidden = true;
  document.getElementById('pin-modal').hidden = false;
}

function closePinModal() {
  document.getElementById('pin-modal').hidden = true;
  document.getElementById('pin-input').value = '';
  pendingCardId = null;
}

async function submitPin() {
  const selected = document.querySelector('input[name="guardian"]:checked');
  const guardian = profile.guardians.find((g) => g.id === selected?.value);
  const pin = document.getElementById('pin-input').value;

  if (!guardian || !(await verifyPin(pin, guardian.pinHash, guardian.pinSalt))) {
    document.getElementById('pin-error').hidden = false;
    return;
  }

  const card = profile.cards.find((c) => c.id === pendingCardId);
  const dp = state.loadDayProgress(today());
  state.saveDayProgress(today(), approveCard(dp, card, guardian.id, now().toISOString()));

  closePinModal();
  render();
}

function openGuardianModal() {
  const kapiGerekli = requiresExistingPin(profile);

  for (const id of ['guardian-name', 'guardian-label', 'guardian-pin', 'guardian-pin2', 'guardian-gate-pin']) {
    document.getElementById(id).value = '';
  }

  document.getElementById('guardian-gate').hidden = !kapiGerekli;

  if (kapiGerekli) {
    mount(document.getElementById('guardian-gate-list'), guardianSummary(profile).map((g, i) =>
      el('label', {}, [
        el('input', { attrs: { type: 'radio', name: 'gate-guardian', value: g.id, ...(i === 0 ? { checked: 'checked' } : {}) } }),
        el('span', { text: g.label })
      ])
    ));
  }

  document.getElementById('guardian-error').hidden = true;
  document.getElementById('guardian-modal').hidden = false;
}

function closeGuardianModal() {
  for (const id of ['guardian-name', 'guardian-label', 'guardian-pin', 'guardian-pin2', 'guardian-gate-pin']) {
    document.getElementById(id).value = '';
  }
  document.getElementById('guardian-modal').hidden = true;
}

function showGuardianError(mesaj) {
  const kutu = document.getElementById('guardian-error');
  kutu.textContent = mesaj;
  kutu.hidden = false;
}

async function submitGuardian() {
  const girdi = {
    name: document.getElementById('guardian-name').value,
    label: document.getElementById('guardian-label').value,
    pin: document.getElementById('guardian-pin').value,
    pinConfirm: document.getElementById('guardian-pin2').value
  };

  const sonuc = validateGuardianInput(girdi);
  if (!sonuc.valid) {
    showGuardianError(sonuc.errors[0]);
    return;
  }

  if (requiresExistingPin(profile)) {
    const secili = document.querySelector('input[name="gate-guardian"]:checked');
    const mevcut = profile.guardians.find((g) => g.id === secili?.value);
    const gatePin = document.getElementById('guardian-gate-pin').value;

    if (!mevcut || !(await verifyPin(gatePin, mevcut.pinHash, mevcut.pinSalt))) {
      showGuardianError('Mevcut PIN yanlış.');
      return;
    }
  }

  const { hash, salt } = await hashPin(girdi.pin);
  profile = addGuardian(profile, {
    name: girdi.name.trim(),
    label: girdi.label.trim(),
    pinHash: hash,
    pinSalt: salt
  });
  state.saveProfile(profile);

  closeGuardianModal();
  render();
}

document.getElementById('app').addEventListener('click', (e) => {
  const karsilama = e.target.closest('[data-migrate-ok]');
  if (karsilama) {
    karsilamayiKapat();
    return;
  }

  const card = e.target.closest('[data-card-id]');
  if (card?.classList.contains('card--available')) {
    if (card.dataset.cardId === 'sabah-takvim') {
      acQuiz();
      return;
    }

    if (card.dataset.cardId === 'ogle-matematik') {
      acDrill();
      return;
    }

    const dp = state.loadDayProgress(today());
    const next = completeCard(profile, dp, card.dataset.cardId, now());
    if (next !== dp) {
      state.saveDayProgress(today(), next);
      render();
    }
    return;
  }

  const secenek = e.target.closest('[data-quiz-option]');
  if (secenek) {
    cevapla(secenek.dataset.quizOption);
    return;
  }

  const tus = e.target.closest('[data-drill-key]');
  if (tus) {
    drillTusla(tus.dataset.drillKey);
    return;
  }

  const approve = e.target.closest('[data-approve-card]');
  if (approve) {
    openPinModal(approve.dataset.approveCard);
    return;
  }

  const ekle = e.target.closest('[data-add-guardian]');
  if (ekle) {
    openGuardianModal();
    return;
  }

  const gorevEkle = e.target.closest('[data-gorev-ekle]');
  if (gorevEkle) {
    acGorevModal();
    return;
  }

  const odulEkle = e.target.closest('[data-odul-ekle]');
  if (odulEkle) {
    acOdulModal();
    return;
  }

  const cardSil = e.target.closest('[data-card-sil]');
  if (cardSil) {
    silGorev(cardSil.dataset.cardSil);
    return;
  }

  const rewardSil = e.target.closest('[data-reward-sil]');
  if (rewardSil) {
    silOdul(rewardSil.dataset.rewardSil);
    return;
  }

  const gorevSimge = e.target.closest('[data-gorev-simge]');
  if (gorevSimge) {
    seciliGorevSimge = gorevSimge.dataset.gorevSimge;
    cizGorevSimgeler();
    return;
  }

  const odulEmoji = e.target.closest('[data-odul-emoji]');
  if (odulEmoji) {
    seciliOdulEmoji = odulEmoji.dataset.odulEmoji;
    cizOdulEmojiler();
    return;
  }

  const oyunKart = e.target.closest('[data-game]');
  if (oyunKart) {
    if (oyunKart.dataset.game === 'amiral') acAmiral();
    if (oyunKart.dataset.game === 'satranc') acSatranc();
    if (oyunKart.dataset.game === 'satranc-oyun') acSoyun();
    return;
  }

  const amiralKare = e.target.closest('[data-amiral-cell]');
  if (amiralKare) {
    amiralAtis(amiralKare.dataset.amiralCell);
    return;
  }

  const satrancTasDugme = e.target.closest('[data-satranc-tas]');
  if (satrancTasDugme) {
    satrancTasSec(satrancTasDugme.dataset.satrancTas);
    return;
  }

  const satrancKare = e.target.closest('[data-satranc-kare]');
  if (satrancKare) {
    satrancKareTikla(satrancKare.dataset.satrancKare);
    return;
  }

  const soyunKare = e.target.closest('[data-soyun-kare]');
  if (soyunKare) {
    soyunKareTikla(soyunKare.dataset.soyunKare);
    return;
  }

  const oneri = e.target.closest('[data-sohbet-oneri]');
  if (oneri) {
    sohbetGonder(oneri.dataset.sohbetOneri);
    return;
  }

  const ayarKaydet = e.target.closest('[data-sohbet-ayar-kaydet]');
  if (ayarKaydet) {
    kaydetSohbetAyar();
    return;
  }

  const dilDugme = e.target.closest('[data-dil-sec]');
  if (dilDugme) {
    dilSec(dilDugme.dataset.dilSec);
    return;
  }

  const nav = e.target.closest('[data-nav]');
  if (nav) {
    for (const v of document.querySelectorAll('.v2-view')) v.classList.remove('active');
    for (const b of document.querySelectorAll('[data-nav]')) b.classList.remove('active');
    document.getElementById(`view-${nav.dataset.nav}`).classList.add('active');
    nav.classList.add('active');
  }
});

document.getElementById('pin-submit').addEventListener('click', submitPin);
document.getElementById('pin-cancel').addEventListener('click', closePinModal);
document.getElementById('guardian-submit').addEventListener('click', submitGuardian);
document.getElementById('gorev-kaydet').addEventListener('click', kaydetGorev);
document.getElementById('gorev-vazgec').addEventListener('click', kapatGorevModal);
document.getElementById('odul-kaydet').addEventListener('click', kaydetOdul);
document.getElementById('odul-vazgec').addEventListener('click', kapatOdulModal);
document.getElementById('guardian-cancel').addEventListener('click', closeGuardianModal);
document.getElementById('timequiz-cancel').addEventListener('click', kapatQuiz);
document.getElementById('drill-cancel').addEventListener('click', kapatDrill);
document.getElementById('amiral-yeni').addEventListener('click', yeniAmiralOyunu);
document.getElementById('amiral-kapat').addEventListener('click', kapatAmiral);
document.getElementById('satranc-devam').addEventListener('click', satrancYeniSoru);
document.getElementById('satranc-taslara').addEventListener('click', satrancTaslaraDon);
document.getElementById('satranc-kapat').addEventListener('click', kapatSatranc);
document.getElementById('satranc-oyun-yeni').addEventListener('click', yeniSoyun);
document.getElementById('satranc-oyun-kapat').addEventListener('click', kapatSoyun);

document.getElementById('sohbet-form').addEventListener('submit', (e) => {
  e.preventDefault();
  sohbetGonder(document.getElementById('sohbet-metin').value);
});

document.getElementById('ob-basla').addEventListener('click', onboardingBasla);

// Profil hazir olduktan sonra (mevcut kullanici ya da onboarding biter
// bitmez) uygulamayi baslatir. Iki yol da ayni baslangici kullansin diye
// ayri fonksiyon.
function uygulamayiBaslat() {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderIfStale();
  });
  window.addEventListener('pageshow', renderIfStale);
  setInterval(renderIfStale, 30000);
  render();
  karsilamayiGosterGerekirse();
}

if (profile) {
  uygulamayiBaslat();
} else if (state && !kurtarma) {
  // Profil yok, hata da yok: ilk kurulum.
  onboardingiGoster();
}
