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

export function validateProfile(profile) {
  const errors = [];

  if (!profile.child?.name?.trim()) errors.push('child.name bos olamaz');
  if (!Number.isInteger(profile.child?.birthYear)) errors.push('child.birthYear tam sayi olmali');
  if (!Array.isArray(profile.guardians) || profile.guardians.length === 0) {
    errors.push('en az bir bakim veren gerekli');
  }
  if (profile.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion ${SCHEMA_VERSION} olmali`);
  }

  for (const g of profile.guardians ?? []) {
    if (!g.pinHash || !g.pinSalt) errors.push(`bakim veren ${g.name}: PIN eksik`);
  }

  return { valid: errors.length === 0, errors };
}
