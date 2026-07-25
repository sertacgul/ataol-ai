/**
 * Saf rutin motoru. Date.now() cagrilmaz, zaman disaridan gelir.
 *
 * Tasarim karari: bir blok, baslangic saati gectikten sonra gunun sonuna
 * kadar acik kalir. Kapanma yoktur. Sabah gorevini 10'da yapan bir cocuk
 * kilitlenmis hissetmemeli, bu direnc uretir.
 *
 * Gun modeli dayKey ile ayni: sifirlama saatinden onceki bir an hala
 * onceki gune aittir, bu yuzden bloklar o saatlerde de acik kalir.
 */

export const BLOCKS = ['morning', 'afternoon', 'evening'];

export function emptyDayProgress() {
  return { cards: {}, approvals: [], stars: 0, minutes: 0 };
}

export function normalizeDayProgress(raw) {
  const base = emptyDayProgress();
  if (!raw || typeof raw !== 'object') return base;

  return {
    cards: raw.cards && typeof raw.cards === 'object' && !Array.isArray(raw.cards) ? raw.cards : base.cards,
    approvals: Array.isArray(raw.approvals) ? raw.approvals : base.approvals,
    stars: Number.isFinite(raw.stars) ? raw.stars : base.stars,
    minutes: Number.isFinite(raw.minutes) ? raw.minutes : base.minutes
  };
}

export function dayKey(date, resetHour = 4) {
  const shifted = new Date(date.getTime() - resetHour * 3600 * 1000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const d = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function parseTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function availableBlocks(date, schedule, resetHour = 4) {
  let now = minutesOfDay(date);
  if (date.getHours() < resetHour) now += 24 * 60;

  return BLOCKS.filter((b) => {
    const from = schedule[b]?.from;
    if (typeof from !== 'string') return false;
    const start = parseTime(from);
    return Number.isFinite(start) && now >= start;
  });
}

export function cardStates(profile, dayProgress, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const open = new Set(availableBlocks(date, profile.schedule, resetHour));
  const byId = new Map(profile.cards.map((c) => [c.id, c]));
  const out = [];

  for (const block of BLOCKS) {
    const ids = profile.routine[block] ?? [];
    let previousClosed = true;

    for (const id of ids) {
      const stored = dayProgress.cards[id];
      let state;

      if (stored) {
        state = stored.state;
      } else if (!open.has(block) || !previousClosed) {
        state = 'locked';
      } else {
        state = 'available';
      }

      out.push({ cardId: id, block, state, card: byId.get(id) ?? null });
      previousClosed = state === 'done' || state === 'awaiting_approval';
    }
  }

  return out;
}

export function completeCard(profile, dayProgress, cardId, date) {
  const entry = cardStates(profile, dayProgress, date).find((s) => s.cardId === cardId);
  if (!entry || entry.state !== 'available' || !entry.card) return dayProgress;

  const card = entry.card;
  const needsApproval = card.type === 'approved';
  const state = needsApproval ? 'awaiting_approval' : 'done';

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [cardId]: { state } },
    stars: dayProgress.stars + (needsApproval ? 0 : card.stars),
    minutes: dayProgress.minutes + (needsApproval ? 0 : card.minutes)
  };
}

export function approveCard(dayProgress, card, guardianId, timestamp) {
  const stored = dayProgress.cards[card.id];
  if (!stored || stored.state !== 'awaiting_approval') return dayProgress;

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [card.id]: { state: 'done' } },
    approvals: [...dayProgress.approvals, { cardId: card.id, guardianId, timestamp }],
    stars: dayProgress.stars + card.stars,
    minutes: dayProgress.minutes + card.minutes
  };
}
