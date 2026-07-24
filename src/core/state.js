import { createFactSet } from '../engines/math.js';
import { emptyDayProgress } from '../engines/routine.js';
import { emptyDiary } from '../engines/diary.js';
import { DEFAULT_MATH_TABLES } from '../data/defaults.js';

/**
 * Motorlar ile depolama arasindaki tek kopru.
 *
 * Motorlar saf kalir; bu modul onlarin urettigi nesneleri kaydeder ve
 * geri yukler. Uygulamanin baska hicbir yeri storage'i dogrudan cagirmaz.
 */

export function createAppState(storage) {
  return {
    loadProfile() {
      return storage.get('profile', null);
    },

    saveProfile(profile) {
      storage.set('profile', profile);
    },

    loadDayProgress(dayKey) {
      return storage.get('days', {})[dayKey] ?? emptyDayProgress();
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
    }
  };
}
