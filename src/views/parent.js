/**
 * Ebeveyn gorunum modelleri.
 *
 * approvalSummary spec 3.3'un amacini tasir: cocuk haftalik ozette
 * kimin kac kez onay verdigini gorur. Annenin kisitlayan taraftan
 * cikip iyi seylerin kaynagi olmasi bu ekrana bagli.
 *
 * Bu modul de HTML uretmez, duz veri dondurur.
 */

export function approvalQueue(profile, dayProgress) {
  const byId = new Map(profile.cards.map((c) => [c.id, c]));

  return Object.entries(dayProgress.cards)
    .filter(([, v]) => v.state === 'awaiting_approval')
    .map(([id]) => byId.get(id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, title: c.title, icon: c.icon, stars: c.stars, minutes: c.minutes }));
}

export function approvalSummary(days, guardians, fromKey, toKey) {
  const counts = new Map(guardians.map((g) => [g.id, 0]));

  for (const [day, dp] of Object.entries(days)) {
    if (day < fromKey || day > toKey) continue;
    for (const a of dp.approvals ?? []) {
      if (counts.has(a.guardianId)) counts.set(a.guardianId, counts.get(a.guardianId) + 1);
    }
  }

  return guardians.map((g) => ({ id: g.id, name: g.name, label: g.label, count: counts.get(g.id) }));
}
