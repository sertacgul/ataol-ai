import {
  createDrill, selectDrillFact, recordDrillAnswer, formatQuestion,
  isLevelMastered, nextLevel
} from '../engines/drill.js';

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

function soruSec(drill, rng, haric = null) {
  const facts = drill.byLevel[drill.level];
  let key = selectDrillFact(facts, rng);

  if (key === haric) {
    const digerleri = Object.fromEntries(Object.entries(facts).filter(([k]) => k !== haric));
    key = selectDrillFact(digerleri, rng) ?? key;
  }

  if (!key) return null;
  const f = facts[key];
  return { key, text: formatQuestion(f), answer: f.answer };
}

export function startSession(drill, rng = Math.random) {
  return {
    drill,
    current: soruSec(drill, rng),
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

  const facts = recordDrillAnswer(session.drill.byLevel[session.drill.level], key, {
    correct: dogru,
    ms,
    thresholdMs: SPEED_THRESHOLD_MS
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
    current: finished ? null : soruSec(drill, rng, key),
    remaining,
    correctCount: session.correctCount + (dogru ? 1 : 0),
    lastCorrect: dogru,
    lastAnswer: answer,
    levelUp,
    finished
  };
}
