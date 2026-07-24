/**
 * Odul ve para birimi mantigi.
 *
 * Ceza yoktur: hicbir fonksiyon negatif deger uretmez. Kotu gun puan
 * kaybettirmez, sadece o gunun kazanci olmaz.
 */

const MAX_LADDER_RATIO = 2;

export function cappedMinutes(minutes, cap) {
  if (minutes < 0) return 0;
  return Math.min(minutes, cap);
}

export function totalStars(days) {
  return Object.values(days).reduce((sum, d) => sum + (d.stars ?? 0), 0);
}

export function rewardProgress(stars, rewards) {
  return rewards.map((r) => ({
    ...r,
    progress: r.target > 0 ? Math.min(1, stars / r.target) : 1,
    unlocked: stars >= r.target
  }));
}

export function validateRewardLadder(rewards) {
  const warnings = [];
  const sorted = [...rewards].sort((a, b) => a.target - b.target);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].target;
    const curr = sorted[i].target;
    if (prev > 0 && curr / prev > MAX_LADDER_RATIO) {
      warnings.push(
        `${prev} ile ${curr} arasindaki sicrama ${MAX_LADDER_RATIO} katini asiyor, ara odul eklenmeli`
      );
    }
  }

  return { valid: warnings.length === 0, warnings };
}
