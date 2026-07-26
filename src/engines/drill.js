import { newBox, promote, demote, selectWeighted, isMastered } from './leitner.js';

/**
 * Dort islem alistirma motoru.
 *
 * Hedef otomatiklik: yavas verilen dogru cevap kutuyu yukseltmez,
 * cunku parmak sayarak bulunan sonuc ogrenilmis sayilmaz. Bu kural
 * takvim quizinde gecerli degildir; orada hedef bilgidir.
 *
 * Seviye kendini ayarlar: cocuk en bastan baslar, biliyorsa kutular
 * hizla dolar ve gecer. Seviyesini tahmin etmek yerine motor bulur.
 *
 * Saf modul: zaman ve rastgelelik disaridan gelir.
 */

const SIGNS = { '+': '+', '-': '−', 'x': '×', '/': '÷' };

export const LEVELS = [
  { id: 'topla-10', title: "Toplama, 10'a kadar" },
  { id: 'cikar-10', title: "Çıkarma, 10'a kadar" },
  { id: 'topla-20', title: "Toplama, 20'ye kadar" },
  { id: 'cikar-20', title: "Çıkarma, 20'ye kadar" },
  { id: 'carp-2-5', title: 'Çarpma: 2, 3, 4, 5' },
  { id: 'carp-6-10', title: 'Çarpma: 6, 7, 8, 9, 10' },
  { id: 'bol', title: 'Bölme' },
  { id: 'kareler', title: 'Kare sayılar' },
  { id: 'karisik', title: 'Karışık dört işlem' }
];

export function factKey(op, a, b) {
  return `${a}${op}${b}`;
}

export function formatQuestion({ op, a, b }) {
  return `${a} ${SIGNS[op]} ${b}`;
}

function ekle(hedef, op, a, b, answer) {
  hedef[factKey(op, a, b)] = newBox({ op, a, b, answer });
}

function uret(levelId, hedef) {
  // 20 seviyeleri sadece YENI olgulari icerir: 10 seviyesinde gecilenler
  // burada tekrar sorulmaz. Boylece her seviye makul surede bitirilebilir
  // ve cocuk zaten bildigi soruyu bastan ogrenmek zorunda kalmaz.
  if (levelId === 'topla-10') {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; a + b <= 10; b++) ekle(hedef, '+', a, b, a + b);
    }
    return;
  }

  if (levelId === 'topla-20') {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        if (a + b >= 11 && a + b <= 20) ekle(hedef, '+', a, b, a + b);
      }
    }
    return;
  }

  if (levelId === 'cikar-10') {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= a; b++) ekle(hedef, '-', a, b, a - b);
    }
    return;
  }

  if (levelId === 'cikar-20') {
    for (let a = 11; a <= 20; a++) {
      for (let b = 1; b <= 10; b++) {
        const d = a - b;
        if (d >= 1 && d <= 10) ekle(hedef, '-', a, b, d);
      }
    }
    return;
  }

  if (levelId === 'carp-2-5' || levelId === 'carp-6-10') {
    const tablolar = levelId === 'carp-2-5' ? [2, 3, 4, 5] : [6, 7, 8, 9, 10];
    // b=1 (herhangi bir sayinin 1 ile carpimi) alistirma gerektirmez, disarida birakilir.
    for (const a of tablolar) {
      for (let b = 2; b <= 10; b++) ekle(hedef, 'x', a, b, a * b);
    }
    return;
  }

  if (levelId === 'bol') {
    for (let b = 2; b <= 10; b++) {
      for (let q = 1; q <= 10; q++) ekle(hedef, '/', b * q, b, q);
    }
    return;
  }

  if (levelId === 'kareler') {
    // Kare sayilar: 2x2 .. 10x10. Kucuk ve ustesinden gelinebilir bir kume,
    // cocuk carpim tablosunu pekistirsin diye ayri bir basamak.
    for (let a = 2; a <= 10; a++) ekle(hedef, 'x', a, a, a * a);
  }
}

export function createDrill(levelId) {
  const hedef = {};

  if (levelId === 'karisik') {
    for (const id of ['topla-20', 'cikar-20', 'carp-6-10', 'bol']) uret(id, hedef);
    return hedef;
  }

  uret(levelId, hedef);
  return hedef;
}

export function recordDrillAnswer(facts, key, { correct, ms, thresholdMs, timestamp = null }) {
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

export function selectDrillFact(facts, rng = Math.random) {
  return selectWeighted(facts, rng);
}

export function isLevelMastered(facts) {
  const keys = Object.keys(facts);
  return keys.length > 0 && keys.every((k) => isMastered(facts[k]));
}

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) ?? null;
}

export function nextLevel(id) {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i === -1 || i === LEVELS.length - 1 ? null : LEVELS[i + 1].id;
}
