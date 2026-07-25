import { createDrill, LEVELS } from '../engines/drill.js';
import { normalizeDayProgress } from '../engines/routine.js';
import { emptyDiary } from '../engines/diary.js';
import { createTimeFacts } from '../engines/timequiz.js';
import { v1Oku, tasimaPlani } from '../engines/migrate.js';
import { SCHEMA_VERSION, validateProfile } from './profile.js';

const BOS_MIRAS = { stars: 0, badges: [], readHeroes: [], solvedRiddles: [], apiKey: '' };

// Hicbir seyin tasinmadigi plan. Sekli motorun kendisi belirlesin diye
// bos bir okuyucudan uretiliyor.
const bosPlan = () => tasimaPlani(v1Oku(() => null));

/**
 * Motorlar ile depolama arasindaki tek kopru.
 *
 * Motorlar saf kalir; bu modul onlarin urettigi nesneleri kaydeder ve
 * geri yukler. Uygulamanin baska hicbir yeri storage'i dogrudan cagirmaz.
 */

export function createAppState(storage) {
  const okuMiras = () => {
    const kayit = storage.get('legacy', null);
    if (!kayit || typeof kayit !== 'object') return { ...BOS_MIRAS };
    return { ...BOS_MIRAS, ...kayit };
  };

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
      const gunlerden = Object.values(storage.get('days', {}))
        .reduce((sum, d) => sum + (d.stars ?? 0), 0);
      const miras = okuMiras();
      return gunlerden + (Number.isFinite(miras.stars) ? miras.stars : 0);
    },

    loadLegacy() {
      return okuMiras();
    },

    /**
     * v1 verisini bir kez tasir. Isaret konulduktan sonra bir daha
     * calismaz; yoksa v1'de yildiz kazanmayi surduren bir cocuk her
     * acilista yildizini ikinci kez alir.
     *
     * v1 anahtarlari SILINMEZ, uzerine YAZILMAZ. v1 calismaya devam eder.
     */
    migrateOnce(getRaw) {
      if (storage.get('migrated', false) === true) {
        return { ...bosPlan(), zatenTasinmis: true };
      }
      const plan = tasimaPlani(v1Oku(getRaw));
      if (plan.tasinacakVarMi) {
        storage.set('legacy', {
          stars: plan.legacyStars,
          badges: plan.badges,
          readHeroes: plan.readHeroes,
          solvedRiddles: plan.solvedRiddles,
          apiKey: plan.apiKey
        });
      }
      storage.set('migrated', true);
      return { ...plan, zatenTasinmis: false };
    },

    loadDrill() {
      const kayit = storage.get('drill', null);
      const level = kayit?.level ?? LEVELS[0].id;
      const byLevel = kayit?.byLevel ?? {};
      return {
        level,
        byLevel: { ...byLevel, [level]: byLevel[level] ?? createDrill(level) }
      };
    },

    saveDrill(drill) {
      storage.set('drill', drill);
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
    },

    loadChess() {
      return storage.get('chess', null) ?? {};
    },

    saveChess(kartlar) {
      storage.set('chess', kartlar);
    },

    loadGame(id) {
      return storage.get(`game:${id}`, null);
    },

    saveGame(id, durum) {
      storage.set(`game:${id}`, durum);
    }
  };
}
