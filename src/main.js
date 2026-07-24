import { createStorage } from './core/storage.js';
import { createAppState } from './core/state.js';
import { verifyPin } from './core/crypto.js';
import { seedProfile } from './data/defaults.js';
import { dayKey, completeCard, approveCard } from './engines/routine.js';
import { routineViewModel } from './views/routine.js';
import { approvalQueue } from './views/parent.js';
import { renderSignature } from './views/clock.js';
import { el, mount } from './ui/dom.js';

const state = createAppState(createStorage(window.localStorage, 'ataol2'));

let profile = state.loadProfile();
if (!profile) {
  profile = seedProfile({ childName: 'Deha', birthYear: 2016, guardians: [] });
  state.saveProfile(profile);
}

const now = () => new Date();
const today = () => dayKey(now(), profile.settings.dayResetHour);

let pendingCardId = null;
let lastSignature = null;

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
      el('p', { className: 'routine-header__totals', text: `${vm.stars}★ · ${vm.minutes}/${vm.minuteCap} dk` })
    ]),
    ...vm.blocks.map(blockNode)
  ]);
}

function renderParent() {
  const queue = approvalQueue(profile, state.loadDayProgress(today()));
  const target = document.getElementById('view-parent');

  if (queue.length === 0) {
    mount(target, [el('p', { className: 'parent-empty', text: 'Onay bekleyen görev yok.' })]);
    return;
  }

  mount(target, [
    el('ul', { className: 'parent-queue' }, queue.map((c) =>
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
  ]);
}

function render() {
  lastSignature = renderSignature(profile, now());
  renderRoutine();
  renderParent();
}

function renderIfStale() {
  if (document.getElementById('pin-modal').hidden === false) return;
  if (renderSignature(profile, now()) !== lastSignature) render();
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

document.getElementById('app').addEventListener('click', (e) => {
  const card = e.target.closest('[data-card-id]');
  if (card?.classList.contains('card--available')) {
    const dp = state.loadDayProgress(today());
    const next = completeCard(profile, dp, card.dataset.cardId, now());
    if (next !== dp) {
      state.saveDayProgress(today(), next);
      render();
    }
    return;
  }

  const approve = e.target.closest('[data-approve-card]');
  if (approve) {
    openPinModal(approve.dataset.approveCard);
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

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderIfStale();
});
window.addEventListener('pageshow', renderIfStale);
setInterval(renderIfStale, 30000);

render();
