/**
 * Takvim kavramlari: gun, ay, mevsim.
 *
 * Mevsim sinirlari astronomiktir (21 Mart, 21 Haziran, 23 Eylul,
 * 21 Aralik), meteorolojik degil. Sebep: Turkiye'de okulda boyle
 * ogretiliyor ve uygulama ogretmenle celismemeli.
 *
 * Hafta pazartesi baslar, JavaScript'in pazar-baslangicli getDay()
 * degerinden farklidir.
 *
 * Saf modul: zaman disaridan gelir.
 */

export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const SEASONS = ['Kış', 'İlkbahar', 'Yaz', 'Sonbahar'];

const SEASON_STARTS = [
  { month: 12, day: 21, name: 'Kış' },
  { month: 9, day: 23, name: 'Sonbahar' },
  { month: 6, day: 21, name: 'Yaz' },
  { month: 3, day: 21, name: 'İlkbahar' }
];

export function dayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function dayName(date) {
  return DAYS[dayIndex(date)];
}

export function monthName(date) {
  return MONTHS[date.getMonth()];
}

export function nextDay(ad) {
  const i = DAYS.indexOf(ad);
  return i === -1 ? null : DAYS[(i + 1) % 7];
}

export function season(date) {
  const m = date.getMonth() + 1;
  const g = date.getDate();

  for (const s of SEASON_STARTS) {
    if (m > s.month || (m === s.month && g >= s.day)) return s.name;
  }
  return 'Kış';
}

export function describeDate(date) {
  return {
    dayName: dayName(date),
    dayIndex: dayIndex(date),
    dayOfMonth: date.getDate(),
    monthName: monthName(date),
    monthIndex: date.getMonth(),
    season: season(date),
    year: date.getFullYear()
  };
}
