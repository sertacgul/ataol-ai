import {
  createDrill, selectDrillFact, recordDrillAnswer, formatQuestion,
  isLevelMastered, nextLevel
} from '../engines/drill.js';
import { buildProblem } from '../engines/problems.js';
import { themeFor } from '../data/themes.js';

/**
 * Alistirma oturumu.
 *
 * Yanlis cevapta ayni soru hemen tekrar sorulmaz: az once ekranda
 * gosterilen dogru cevabi kopyalamak ogrenme degildir. Leitner kutusu
 * 1'e duser ve soru zaten yakinda geri gelir. Takvim quizinde kural
 * tersidir, cunku orada hedef maruz kalmaktir.
 *
 * Bu modul HTML uretmez ve DOM'a dokunmaz.
 */

export const SESSION_LENGTH = 10;
const SPEED_THRESHOLD_MS = 6000;
const PROBLEM_COUNT = 2;

// dil: sozel problemler o dilin sablon+temasiyla uretilir (problems.js /
// themes.js). Saf aritmetik zaten dilden bagimsiz.
function soruSec(drill, rng, kalan, haric = null, dil = 'tr') {
  const facts = drill.byLevel[drill.level];
  let key = selectDrillFact(facts, rng);

  if (key === haric) {
    const digerleri = Object.fromEntries(Object.entries(facts).filter(([k]) => k !== haric));
    key = selectDrillFact(digerleri, rng) ?? key;
  }

  if (!key) return null;
  const f = { ...facts[key], key };

  if (kalan <= PROBLEM_COUNT) {
    const p = buildProblem(f, themeFor(dil), rng, dil);
    if (p) return { key, kind: 'problem', text: p.text, answer: p.answer };
  }

  return { key, kind: 'fact', text: formatQuestion(f), answer: f.answer };
}

export function startSession(drill, rng = Math.random, dil = 'tr') {
  return {
    drill,
    dil,
    current: soruSec(drill, rng, SESSION_LENGTH, null, dil),
    remaining: SESSION_LENGTH,
    correctCount: 0,
    lastCorrect: null,
    lastAnswer: null,
    levelUp: false,
    finished: false
  };
}

export function answerCurrent(session, verilen, ms, rng = Math.random) {
  if (session.finished || !session.current) return session;

  const { key, answer } = session.current;
  const dogru = Number(verilen) === answer;
  const esik = session.current.kind === 'problem' ? Infinity : SPEED_THRESHOLD_MS;

  const facts = recordDrillAnswer(session.drill.byLevel[session.drill.level], key, {
    correct: dogru,
    ms,
    thresholdMs: esik
  });

  let drill = {
    ...session.drill,
    byLevel: { ...session.drill.byLevel, [session.drill.level]: facts }
  };

  const remaining = session.remaining - 1;
  const finished = remaining === 0;
  let levelUp = false;

  if (finished && isLevelMastered(facts)) {
    const sonraki = nextLevel(drill.level);
    if (sonraki) {
      levelUp = true;
      drill = {
        level: sonraki,
        byLevel: { ...drill.byLevel, [sonraki]: drill.byLevel[sonraki] ?? createDrill(sonraki) }
      };
    }
  }

  return {
    drill,
    current: finished ? null : soruSec(drill, rng, remaining, key, session.dil),
    remaining,
    correctCount: session.correctCount + (dogru ? 1 : 0),
    lastCorrect: dogru,
    lastAnswer: answer,
    levelUp,
    finished
  };
}
