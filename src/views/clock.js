import { dayKey, availableBlocks } from '../engines/routine.js';

/**
 * Ekranin yeniden cizilmesi gerekip gerekmedigini belirleyen saf imza.
 *
 * main.js bunu belirli araliklarla hesaplar ve degistiyse yeniden cizer.
 * Boylece blok acildiginda veya gun dondugunde ekran kendini gunceller;
 * degismediginde bosuna DOM uretilmez.
 */

export function renderSignature(profile, date) {
  const resetHour = profile.settings?.dayResetHour ?? 4;
  const gun = dayKey(date, resetHour);
  const acik = availableBlocks(date, profile.schedule, resetHour);
  return `${gun}|${acik.join(',')}`;
}
