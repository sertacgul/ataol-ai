import { cardStates, availableBlocks } from '../engines/routine.js';

/**
 * Oyun sekmesinin kilit kurali.
 *
 * Oyunlar kazanilir, bedava acilmaz. Cocugun asil sorunu ekran
 * bagimliligi; sinirsiz oynanabilir bir oyun, rutin kartlariyla
 * rekabet eder ve uygulamanin kendi amacini baltalar.
 *
 * Kilit gun boyu degil blok basina: tum gunun kartlari sart kosulsa
 * aksam blogu acilana kadar oyun olmaz, yani sabahi bitirmenin odulu
 * gelmez. O an acik olan bloklarin kartlari bitince acilir.
 *
 * Onay bekleyen kart tamamlanmis sayilir: cocuk ustune duseni
 * yaptiysa, ebeveyn onaylayana kadar oyunsuz kalmasi onu baskasinin
 * gecikmesiyle cezalandirmak olur.
 */

export const GAMES = [
  { id: 'amiral', title: 'Amiral Battı', icon: 'sailing' }
];

const BITMIS = new Set(['done', 'awaiting_approval']);

export function gamesViewModel(profile, dayProgress, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const acikBloklar = new Set(availableBlocks(date, profile.schedule, resetHour));

  const acikKartlar = cardStates(profile, dayProgress, date)
    .filter((s) => acikBloklar.has(s.block));

  const kalan = acikKartlar.filter((s) => !BITMIS.has(s.state)).length;

  return {
    unlocked: acikBloklar.size > 0 && kalan === 0,
    remaining: kalan,
    games: GAMES
  };
}
