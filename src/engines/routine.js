/**
 * Saf rutin motoru. Date.now() cagrilmaz, zaman disaridan gelir.
 *
 * Tasarim karari: bir blok, baslangic saati gectikten sonra gunun sonuna
 * kadar acik kalir. Kapanma yoktur. Sabah gorevini 10'da yapan bir cocuk
 * kilitlenmis hissetmemeli, bu direnc uretir.
 */

export const BLOCKS = ['morning', 'afternoon', 'evening'];

export function emptyDayProgress() {
  return { cards: {}, approvals: [], stars: 0, minutes: 0 };
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

export function availableBlocks(date, schedule) {
  const now = minutesOfDay(date);
  return BLOCKS.filter((b) => schedule[b] && now >= parseTime(schedule[b].from));
}

export function cardStates(profile, dayProgress, date) {
  const open = new Set(availableBlocks(date, profile.schedule));
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

export function completeCard(dayProgress, card) {
  if (dayProgress.cards[card.id]) return dayProgress;

  const needsApproval = card.type === 'approved';
  const state = needsApproval ? 'awaiting_approval' : 'done';

  return {
    ...dayProgress,
    cards: { ...dayProgress.cards, [card.id]: { state } },
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
