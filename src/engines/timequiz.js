import { DAYS, MONTHS, SEASONS, dayName, monthName, season, nextDay } from './calendar.js';
import { newBox, promote, demote } from './leitner.js';

/**
 * Takvim sorulari.
 *
 * Onemli fark: matematik motorunda yavas verilen dogru cevap kutuyu
 * yukseltmez, cunku orada hedef otomatikliktir. Burada hedef bilgidir;
 * cocuk dusunup dogru bulduysa ogrenmistir. Bu yuzden sure olculmez.
 *
 * Kart sinav degil maruz kalma araci: yanlis cevapta dogrusu gosterilip
 * soru tekrar sorulur. Bu davranis arayuz tarafinda uygulanir.
 */

export const QUESTION_KINDS = ['bugun-gun', 'yarin-gun', 'ay', 'mevsim'];

const PROMPTS = {
  'bugun-gun': 'Bugün ne günü?',
  'yarin-gun': 'Yarın ne günü?',
  'ay': 'Hangi aydayız?',
  'mevsim': 'Hangi mevsimdeyiz?'
};

export function createTimeFacts() {
  return Object.fromEntries(QUESTION_KINDS.map((k) => [k, newBox({ kind: k })]));
}

function secenekler(dogru, havuz, adet) {
  const digerleri = havuz.filter((x) => x !== dogru);
  const secilen = [dogru];
  const adim = Math.max(1, Math.floor(digerleri.length / (adet - 1)));

  for (let i = 0; secilen.length < adet && i < digerleri.length; i += adim) {
    secilen.push(digerleri[i]);
  }

  return secilen;
}

function karistir(liste, rng) {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

export function buildQuestion(kind, date, rng = Math.random) {
  if (!QUESTION_KINDS.includes(kind)) return null;

  let answer;
  let havuz;

  if (kind === 'bugun-gun') {
    answer = dayName(date);
    havuz = DAYS;
  } else if (kind === 'yarin-gun') {
    answer = nextDay(dayName(date));
    havuz = DAYS;
  } else if (kind === 'ay') {
    answer = monthName(date);
    havuz = MONTHS;
  } else {
    answer = season(date);
    havuz = SEASONS;
  }

  return {
    kind,
    prompt: PROMPTS[kind],
    answer,
    options: karistir(secenekler(answer, havuz, Math.min(4, havuz.length)), rng)
  };
}

export function recordTimeAnswer(facts, kind, correct, ms = null) {
  const kayit = facts[kind];
  if (!kayit) return facts;

  const guncel = correct ? promote(kayit) : demote(kayit);

  return {
    ...facts,
    [kind]: {
      ...guncel,
      seen: kayit.seen + 1,
      correct: kayit.correct + (correct ? 1 : 0),
      wrong: kayit.wrong + (correct ? 0 : 1),
      lastSeen: ms
    }
  };
}
