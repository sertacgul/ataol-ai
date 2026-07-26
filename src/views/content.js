/**
 * Icerik kisisellestirme ekraninin saf mantigi: gorev ve odul girdisinin
 * dogrulanmasi + ebeveyne sunulan hazir simge/emoji secenekleri.
 *
 * Simge ve emoji SECILIR, serbest yazilmaz: ebeveyn gecersiz bir Material
 * Symbols adi yazarsa ekranda bos kutu cikar. Hazir liste bunu onler.
 */

export const BLOCK_LABELS = {
  morning: 'Sabah',
  afternoon: 'Öğle',
  evening: 'Akşam'
};

// Hepsi Material Symbols Rounded'da bulunan, cocuk gorevlerine uygun
// simgeler.
export const ICON_OPTIONS = [
  'star', 'favorite', 'sports_soccer', 'brush', 'menu_book', 'pets',
  'music_note', 'directions_run', 'restaurant', 'bed', 'wash',
  'cleaning_services', 'edit_note', 'backpack', 'toys', 'palette'
];

export const EMOJI_OPTIONS = ['🍦', '🎬', '🥮', '🍜', '🚲', '🎮', '🍕', '🎨', '⚽', '🎁', '🧩', '🏊'];

export function validateCardInput({ title, block, stars, minutes, icon } = {}) {
  const errors = [];

  if (!String(title ?? '').trim()) errors.push('Görev adı boş olamaz.');
  if (!Object.keys(BLOCK_LABELS).includes(block)) errors.push('Zaman dilimi seç.');

  const s = Number(stars);
  if (!Number.isInteger(s) || s < 0 || s > 20) errors.push('Yıldız 0 ile 20 arasında olmalı.');

  const m = Number(minutes);
  if (!Number.isInteger(m) || m < 0 || m > 60) errors.push('Dakika 0 ile 60 arasında olmalı.');

  if (!ICON_OPTIONS.includes(icon)) errors.push('Bir simge seç.');

  return { valid: errors.length === 0, errors };
}

export function validateRewardInput({ name, emoji, target } = {}) {
  const errors = [];

  if (!String(name ?? '').trim()) errors.push('Ödül adı boş olamaz.');
  if (!EMOJI_OPTIONS.includes(emoji)) errors.push('Bir emoji seç.');

  const t = Number(target);
  if (!Number.isInteger(t) || t < 1) errors.push('Hedef dakika 1 veya daha fazla olmalı.');

  return { valid: errors.length === 0, errors };
}
