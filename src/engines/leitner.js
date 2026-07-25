/**
 * Alana bagimsiz Leitner kutu mantigi.
 *
 * Hem carpim tablosu hem takvim sorulari hem de Faz 1D'deki dort islem
 * ayni kutu mantigini kullanir. Ayni mantigi uc kez kopyalamamak icin
 * burada tek yerde durur.
 *
 * Bu modul saf: zaman ve rastgelelik disaridan gelir.
 */

export const MAX_BOX = 5;
export const MASTERY_BOX = 4;

const BOX_WEIGHTS = { 1: 16, 2: 8, 3: 4, 4: 2, 5: 1 };

export function newBox(extra = {}) {
  return { box: 1, seen: 0, correct: 0, wrong: 0, avgMs: 0, lastSeen: null, ...extra };
}

export function promote(kayit) {
  return { ...kayit, box: Math.min(MAX_BOX, kayit.box + 1) };
}

export function demote(kayit) {
  return { ...kayit, box: 1 };
}

export function isMastered(kayit) {
  return kayit.box >= MASTERY_BOX;
}

export function selectWeighted(kayitlar, rng = Math.random) {
  const keys = Object.keys(kayitlar);
  if (keys.length === 0) return null;

  const weights = keys.map((k) => BOX_WEIGHTS[kayitlar[k].box] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);

  let ticket = rng() * total;
  for (let i = 0; i < keys.length; i++) {
    ticket -= weights[i];
    if (ticket < 0) return keys[i];
  }
  return keys[keys.length - 1];
}
