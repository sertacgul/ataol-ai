/**
 * Bakim veren ekleme ekraninin saf mantigi.
 *
 * Kapi kurali: profilde hic bakim veren yokken ekran aciktir (kurulum
 * durumu), en az bir tane varken yeni ekleme mevcut bir bakim verenin
 * PIN'ini ister. Aksi halde cocuk kendini bakim veren olarak ekleyip
 * kendi onayini verebilirdi.
 *
 * PIN iki kez istenir, cunku hash geri dondurulemez ve tek harflik bir
 * yazim hatasi ebeveyni kalici olarak onay veremez hale getirir.
 */

const PIN_MIN = 4;
const PIN_MAX = 8;

export function requiresExistingPin(profile) {
  return (profile.guardians?.length ?? 0) > 0;
}

export function guardianSummary(profile) {
  return (profile.guardians ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    label: g.label
  }));
}

export function validateGuardianInput({ name, label, pin, pinConfirm } = {}) {
  const errors = [];

  if (!String(name ?? '').trim()) errors.push('İsim boş olamaz.');
  if (!String(label ?? '').trim()) errors.push('Etiket boş olamaz.');

  const p = String(pin ?? '');
  if (!/^\d*$/.test(p)) errors.push('PIN sadece rakamlardan oluşmalı.');
  if (p.length < PIN_MIN || p.length > PIN_MAX) {
    errors.push(`PIN ${PIN_MIN} ile ${PIN_MAX} rakam arasında olmalı.`);
  }
  if (p !== String(pinConfirm ?? '')) errors.push('İki PIN aynı değil.');

  return { valid: errors.length === 0, errors };
}
