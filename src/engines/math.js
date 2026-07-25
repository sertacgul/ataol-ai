/**
 * Leitner kutulu aralikli tekrar.
 *
 * Yavas verilen dogru cevap kutuyu yukseltmez. Carpim tablosunda hedef
 * dogruluk degil otomatikliktir; parmak sayarak bulunan dogru cevap
 * ogrenilmis sayilmaz.
 */

export const MAX_BOX = 5;
export const MASTERY_BOX = 4;

const BOX_WEIGHTS = { 1: 16, 2: 8, 3: 4, 4: 2, 5: 1 };

export function createFactSet(tables) {
  const facts = {};
  for (const t of tables) {
    for (let i = 1; i <= 10; i++) {
      facts[`${t}x${i}`] = {
        table: t,
        box: 1,
        seen: 0,
        correct: 0,
        wrong: 0,
        avgMs: 0,
        lastSeen: null
      };
    }
  }
  return facts;
}

export function recordAnswer(facts, key, { correct, ms, thresholdMs, timestamp = null }) {
  const fact = facts[key];
  if (!fact) return facts;

  let box = fact.box;
  if (!correct) {
    box = 1;
  } else if (ms <= thresholdMs) {
    box = Math.min(MAX_BOX, box + 1);
  }

  const seen = fact.seen + 1;

  return {
    ...facts,
    [key]: {
      ...fact,
      box,
      seen,
      correct: fact.correct + (correct ? 1 : 0),
      wrong: fact.wrong + (correct ? 0 : 1),
      avgMs: Math.round((fact.avgMs * fact.seen + ms) / seen),
      lastSeen: timestamp
    }
  };
}

export function selectFact(facts, rng = Math.random) {
  const keys = Object.keys(facts);
  if (keys.length === 0) return null;

  const weights = keys.map((k) => BOX_WEIGHTS[facts[k].box] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);

  let ticket = rng() * total;
  for (let i = 0; i < keys.length; i++) {
    ticket -= weights[i];
    if (ticket < 0) return keys[i];
  }
  return keys[keys.length - 1];
}

export function isTableMastered(facts, table) {
  const keys = Object.keys(facts).filter((k) => facts[k].table === table);
  if (keys.length === 0) return false;
  return keys.every((k) => facts[k].box >= MASTERY_BOX);
}

export function nextTable(facts, tables) {
  for (const t of tables) {
    if (!isTableMastered(facts, t)) return t;
  }
  return null;
}
