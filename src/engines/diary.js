/**
 * Ebeveyn gunlugu.
 *
 * SERT KURAL: bu veri cihazi terk etmez. Bulut yok, yedek yok, telemetri
 * yok. Gerekce: resit olmayan bireye ait saglik verisi, KVKK m.6 ozel
 * nitelikli kisisel veri kapsamina girer. Tek cikis yolu kullanicinin
 * kendi urettigi PDF.
 *
 * Bu modulde ag cagrisi bulunmasi bir testle engellenmistir.
 */

export const DIARY_TAGS = [
  'uyku',
  'kasima',
  'ofke',
  'yemek',
  'ekran',
  'olumlu',
  'tetikleyici'
];

export function emptyDiary() {
  return {};
}

export function addEntry(diary, dayKey, { tag, note = '', time = null }) {
  if (!DIARY_TAGS.includes(tag)) {
    throw new Error(`gecersiz etiket: ${tag}`);
  }

  return {
    ...diary,
    [dayKey]: [...(diary[dayKey] ?? []), { tag, note, time }]
  };
}

export function summarize(diary, fromKey, toKey) {
  const tagCounts = Object.fromEntries(DIARY_TAGS.map((t) => [t, 0]));
  let daysWithEntries = 0;

  for (const [day, entries] of Object.entries(diary)) {
    if (day < fromKey || day > toKey) continue;
    if (entries.length > 0) daysWithEntries++;
    for (const e of entries) {
      tagCounts[e.tag] = (tagCounts[e.tag] ?? 0) + 1;
    }
  }

  return { from: fromKey, to: toKey, tagCounts, daysWithEntries };
}
