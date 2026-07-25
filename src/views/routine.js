import { BLOCKS, cardStates } from '../engines/routine.js';
import { cappedMinutes } from '../engines/rewards.js';

/**
 * Rutin gorunum modeli.
 *
 * Bu modul HTML uretmez ve DOM'a dokunmaz. Duz veri dondurur; DOM'u
 * main.js createElement ve textContent ile kurar. Boylece enjeksiyon
 * yapisal olarak imkansiz olur, kacis disiplinine bagli kalmaz.
 */

const BLOCK_TITLES = {
  morning: 'Sabah',
  afternoon: 'Okul Sonrası',
  evening: 'Akşam'
};

export function routineViewModel(profile, dayProgress, date) {
  const states = cardStates(profile, dayProgress, date);

  const blocks = BLOCKS.map((id) => ({
    id,
    title: BLOCK_TITLES[id],
    from: profile.schedule?.[id]?.from ?? '',
    cards: states
      .filter((s) => s.block === id)
      .map((s) => ({
        id: s.cardId,
        state: s.state,
        title: s.card?.title ?? '',
        icon: s.card?.icon ?? 'help',
        stars: s.card?.stars ?? 0,
        minutes: s.card?.minutes ?? 0
      }))
  }));

  return {
    childName: profile.child.name,
    blocks,
    stars: dayProgress.stars,
    minutes: cappedMinutes(dayProgress.minutes, profile.settings.dailyMinuteCap),
    minuteCap: profile.settings.dailyMinuteCap,
    awaitingApproval: states.filter((s) => s.state === 'awaiting_approval').length
  };
}
