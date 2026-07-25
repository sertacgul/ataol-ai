import { createFactSet } from '../engines/math.js';
import { normalizeDayProgress } from '../engines/routine.js';
import { emptyDiary } from '../engines/diary.js';
import { createTimeFacts } from '../engines/timequiz.js';
import { DEFAULT_MATH_TABLES } from '../data/defaults.js';
import { SCHEMA_VERSION, validateProfile } from './profile.js';

/**
 * Motorlar ile depolama arasindaki tek kopru.
 *
 * Motorlar saf kalir; bu modul onlarin urettigi nesneleri kaydeder ve
 * geri yukler. Uygulamanin baska hicbir yeri storage'i dogrudan cagirmaz.
 */

export function createAppState(storage) {
  return {
    loadProfile() {
      const raw = storage.get('profile', null);
      if (!raw || typeof raw !== 'object') return null;
      if (raw.schemaVersion !== SCHEMA_VERSION) return null;
      if (!validateProfile(raw).valid) return null;
      return raw;
    },

    saveProfile(profile) {
      storage.set('profile', profile);
    },

    loadDayProgress(dayKey) {
      return normalizeDayProgress(storage.get('days', {})[dayKey]);
    },

    saveDayProgress(dayKey, dayProgress) {
      storage.set('days', { ...storage.get('days', {}), [dayKey]: dayProgress });
    },

    allDays() {
      return storage.get('days', {});
    },

    totalStars() {
      return Object.values(storage.get('days', {}))
        .reduce((sum, d) => sum + (d.stars ?? 0), 0);
    },

    loadFacts() {
      return storage.get('facts', null) ?? createFactSet(DEFAULT_MATH_TABLES);
    },

    saveFacts(facts) {
      storage.set('facts', facts);
    },

    loadDiary() {
      return storage.get('diary', null) ?? emptyDiary();
    },

    saveDiary(diary) {
      storage.set('diary', diary);
    },

    loadTimeFacts() {
      return storage.get('timefacts', null) ?? createTimeFacts();
    },

    saveTimeFacts(facts) {
      storage.set('timefacts', facts);
    }
  };
}
