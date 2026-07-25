/**
 * Leitner kutulu aralikli tekrar.
 *
 * Yavas verilen dogru cevap kutuyu yukseltmez. Carpim tablosunda hedef
 * dogruluk degil otomatikliktir; parmak sayarak bulunan dogru cevap
 * ogrenilmis sayilmaz.
 */

import { newBox, promote, demote, selectWeighted, isMastered, MAX_BOX, MASTERY_BOX } from './leitner.js';

export { MAX_BOX, MASTERY_BOX };

export function createFactSet(tables) {
  const facts = {};
  for (const t of tables) {
    for (let i = 1; i <= 10; i++) {
      facts[`${t}x${i}`] = newBox({ table: t });
    }
  }
  return facts;
}

export function recordAnswer(facts, key, { correct, ms, thresholdMs, timestamp = null }) {
  const fact = facts[key];
  if (!fact) return facts;

  let guncel = fact;
  if (!correct) guncel = demote(fact);
  else if (ms <= thresholdMs) guncel = promote(fact);

  const seen = fact.seen + 1;

  return {
    ...facts,
    [key]: {
      ...guncel,
      seen,
      correct: fact.correct + (correct ? 1 : 0),
      wrong: fact.wrong + (correct ? 0 : 1),
      avgMs: Math.round((fact.avgMs * fact.seen + ms) / seen),
      lastSeen: timestamp
    }
  };
}

export function selectFact(facts, rng = Math.random) {
  return selectWeighted(facts, rng);
}

export function isTableMastered(facts, table) {
  const keys = Object.keys(facts).filter((k) => facts[k].table === table);
  if (keys.length === 0) return false;
  return keys.every((k) => isMastered(facts[k]));
}

export function nextTable(facts, tables) {
  for (const t of tables) {
    if (!isTableMastered(facts, t)) return t;
  }
  return null;
}
