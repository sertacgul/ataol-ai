import { createStorage } from './core/storage.js';
import { createAppState } from './core/state.js';
import { verifyPin, hashPin } from './core/crypto.js';
import { addGuardian } from './core/profile.js';
import { seedProfile } from './data/defaults.js';
import { dayKey, completeCard, approveCard } from './engines/routine.js';
import { routineViewModel } from './views/routine.js';
import { approvalQueue } from './views/parent.js';
import { guardianSummary, validateGuardianInput, requiresExistingPin } from './views/settings.js';
import { renderSignature } from './views/clock.js';
import { el, mount } from './ui/dom.js';
import { buildQuestion, recordTimeAnswer, QUESTION_KINDS } from './engines/timequiz.js';
import { selectWeighted } from './engines/leitner.js';

let state;
let profile;

function showRecovery() {
  const app = document.getElementById('app');
  mount(app, [
    el('div', { className: 'v2-recovery' }, [
      el('p', { text: 'Uygulama açılamadı.' }),
      el('button', {
        text: 'Sıfırla ve yeniden başla',
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
  if (!profile) {
    profile = seedProfile({ childName: 'Deha', birthYear: 2016, guardians: [] });
    state.saveProfile(profile);
  }
} catch (err) {
  profile = null;
  showRecovery();
}

const now = () => new Date();
const today = () => dayKey(now(), profile.settings.dayResetHour);

let pendingCardId = null;
let lastSignature = null;

const QUIZ_SORU_SAYISI = 3;
let quizKalan = 0;
let aktifSoru = null;
let quizSonuclari = [];

function cardNode(card) {
  return el('li', {
    className: `routine-card card--${card.state}`,
    dataset: { cardId: card.id }
  }, [
    el('span', { className: 'material-symbols-rounded routine-card__icon', text: card.icon }),
    el('span', { className: 'routine-card__title', text: card.title }),
    el('span', { className: 'routine-card__reward', text: `${card.stars}★ · ${card.minutes}dk` })
  ]);
}

function blockNode(block) {
  return el('section', { className: 'routine-block', dataset: { block: block.id } }, [
    el('h2', { className: 'routine-block__title' }, [
      el('span', { text: block.title }),
      el('span', { className: 'routine-block__time', text: block.from })
    ]),
    el('ul', { className: 'routine-block__cards' }, block.cards.map(cardNode))
  ]);
}

function renderRoutine() {
  const vm = routineViewModel(profile, state.loadDayProgress(today()), now());
  mount(document.getElementById('view-routine'), [
    el('header', { className: 'routine-header' }, [
      el('p', { className: 'routine-header__greeting', text: `Merhaba ${vm.childName}` }),
      el('p', { className: 'routine-header__date', text: `${vm.today.dayName} · ${vm.today.dayOfMonth} ${vm.today.monthName} · ${vm.today.season}` }),
      el('p', { className: 'routine-header__totals', text: `${vm.stars}★ · ${vm.minutes}/${vm.minuteCap} dk` })
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
      el('h2', { className: 'parent-guardians__title', text: 'Bakım verenler' }),
      guardians.length === 0
        ? el('p', { className: 'parent-empty', text: 'Henüz bakım veren yok. Onay verebilmek için önce kendinizi ekleyin.' })
        : el('ul', { className: 'parent-guardians__list' }, guardians.map((g) =>
            el('li', { className: 'parent-guardians__item', text: g.label })
          )),
      el('button', {
        className: 'parent-guardians__add',
        text: 'Bakım veren ekle',
        attrs: { type: 'button' },
        dataset: { addGuardian: 'yes' }
      })
    ]),
    queue.length === 0
      ? el('p', { className: 'parent-empty', text: 'Onay bekleyen görev yok.' })
      : el('ul', { className: 'parent-queue' }, queue.map((c) =>
          el('li', { className: 'parent-queue__item' }, [
            el('span', { className: 'material-symbols-rounded', text: c.icon }),
            el('span', { className: 'parent-queue__title', text: c.title }),
            el('span', { className: 'parent-queue__reward', text: `${c.stars}★` }),
            el('button', {
              className: 'parent-queue__approve',
              text: 'Onayla',
              attrs: { type: 'button' },
              dataset: { approveCard: c.id }
            })
          ])
        ))
  ];

  mount(target, bolumler);
}

function render() {
  lastSignature = renderSignature(profile, now());
  renderRoutine();
  renderParent();
}

function renderIfStale() {
  if (document.getElementById('pin-modal').hidden === false) return;
  if (document.getElementById('guardian-modal').hidden === false) return;
  if (document.getElementById('timequiz-modal').hidden === false) return;
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
  const card = e.target.closest('[data-card-id]');
  if (card?.classList.contains('card--available')) {
    if (card.dataset.cardId === 'sabah-takvim') {
      acQuiz();
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
document.getElementById('guardian-cancel').addEventListener('click', closeGuardianModal);
document.getElementById('timequiz-cancel').addEventListener('click', kapatQuiz);

if (profile) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderIfStale();
  });
  window.addEventListener('pageshow', renderIfStale);
  setInterval(renderIfStale, 30000);
  render();
}
