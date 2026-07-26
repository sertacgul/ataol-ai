import { randomId } from './crypto.js';

export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS = {
  dayResetHour: 4,
  dailyMinuteCap: 60,
  mathSpeedThresholdMs: 6000,
  language: 'tr',
  theme: 'default'
};

export const DEFAULT_SCHEDULE = {
  morning: { from: '06:30' },
  afternoon: { from: '15:00' },
  evening: { from: '19:00' }
};

export function createProfile({ childName, birthYear, avatar = null }) {
  return {
    id: randomId(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: null,
    child: { name: childName, birthYear, avatar },
    guardians: [],
    cards: [],
    routine: { morning: [], afternoon: [], evening: [] },
    schedule: structuredClone(DEFAULT_SCHEDULE),
    rewards: [],
    settings: structuredClone(DEFAULT_SETTINGS)
  };
}

export function addGuardian(profile, { name, label, color = null, pinHash, pinSalt }) {
  return {
    ...profile,
    guardians: [
      ...profile.guardians,
      { id: randomId(), name, label, color, pinHash, pinSalt }
    ]
  };
}

// Ebeveynin ekledigi kart DAIMA 'approved'. measured yalniz sabah-takvim
// ve ogle-matematik'e ozeldir (main.js quiz/drill'e onlari baglar); ebeveyn
// measured uretemez, yoksa dokununca hicbir sey olmaz.
export function addCard(profile, { title, block, stars, minutes, icon }) {
  const id = randomId();
  const card = { id, block, type: 'approved', title, icon, stars, minutes };
  return {
    ...profile,
    cards: [...profile.cards, card],
    routine: { ...profile.routine, [block]: [...profile.routine[block], id] }
  };
}

// Kart cards'tan VE tum routine bloklarindan cikar; ikisi tutarli kalmali,
// yoksa renderRoutine olmayan bir karti cizmeye calisir.
export function removeCard(profile, id) {
  const routine = {};
  for (const b of Object.keys(profile.routine)) {
    routine[b] = profile.routine[b].filter((x) => x !== id);
  }
  return {
    ...profile,
    cards: profile.cards.filter((c) => c.id !== id),
    routine
  };
}

export function addReward(profile, { name, emoji, target }) {
  return {
    ...profile,
    rewards: [...profile.rewards, { id: randomId(), name, emoji, target }]
  };
}

export function removeReward(profile, id) {
  return { ...profile, rewards: profile.rewards.filter((r) => r.id !== id) };
}

export function validateProfile(profile) {
  const errors = [];

  if (!profile.child?.name?.trim()) errors.push('child.name bos olamaz');
  if (!Number.isInteger(profile.child?.birthYear)) errors.push('child.birthYear tam sayi olmali');
  if (!Array.isArray(profile.guardians)) errors.push('guardians dizi olmali');
  if (profile.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion ${SCHEMA_VERSION} olmali`);
  }

  for (const g of profile.guardians ?? []) {
    if (!g.pinHash || !g.pinSalt) errors.push(`bakim veren ${g.name}: PIN eksik`);
  }

  return { valid: errors.length === 0, errors };
}
