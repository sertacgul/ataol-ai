import { PIECES } from '../engines/chess.js';
import { DERSLER } from '../engines/chesspuzzle.js';
import { newBox, promote, demote, selectWeighted } from '../engines/leitner.js';

/**
 * Satranc ders ilerleyisi.
 *
 * On sekiz kart vardir: alti tas carpi uc ders. Kart basina Leitner
 * kutusu tutulur, cunku "at serbest" ogrenilmisken "at engelli" hala
 * tekrar edilmeye ihtiyac duyabilir; tasi tek kart saymak bu ayrimi
 * kaybederdi.
 *
 * Yeni tas, bir onceki tasin uc dersi de en az bir kez dogru
 * yapilmadan acilmaz. Olcut "kutu 4'e ulasti" degil "bir kez dogru
 * yapildi": burada hedef otomatiklesme degil kurali anlamak, ve kilit
 * ne kadar uzun surerse cocuk o kadar uzun sure ayni tasta kalir.
 *
 * Yanlis cevap ilerlemeyi geri almaz. Sadece kartin kutusunu dusurur,
 * yani o ders daha sik sorulur. Kural ogrenirken deneme hata degildir.
 *
 * Sure olculmez: bu modulde hiz hedefi yok, o yuzden avgMs de yok.
 * Durum JSON guvenlidir, dogrudan depoya yazilir.
 */

export const TOPLAM_KART = PIECES.length * DERSLER.length;

export function kartId(tas, ders) {
  return `${tas}:${ders}`;
}

export function bosDurum() {
  return {};
}

function kart(durum, tas, ders) {
  const k = durum?.[kartId(tas, ders)];
  return k && typeof k === 'object' ? k : newBox();
}

// Bir dersin "ogrenildi" olmasi icin bir kez dogru yapilmis olmasi
// yeter; sonradan yanlis yapmak bu isareti geri almaz.
function dersOgrenildi(durum, tas, ders) {
  return kart(durum, tas, ders).correct > 0;
}

function tasOgrenildi(durum, tas) {
  return DERSLER.every((d) => dersOgrenildi(durum, tas, d));
}

export function cevapla(durum, tas, ders, dogru) {
  const onceki = kart(durum, tas, ders);
  const kutulu = dogru ? promote(onceki) : demote(onceki);

  return {
    ...(durum ?? {}),
    [kartId(tas, ders)]: {
      ...kutulu,
      seen: onceki.seen + 1,
      correct: onceki.correct + (dogru ? 1 : 0),
      wrong: onceki.wrong + (dogru ? 0 : 1)
    }
  };
}

// Acik taslar her zaman ogretim sirasindaki ilk n tastir; sira
// atlanmaz. Ilk ogrenilmemis tasta durulur, o tas dahil edilir.
export function acikTaslar(durum) {
  const out = [];
  for (const p of PIECES) {
    out.push(p.kod);
    if (!tasOgrenildi(durum, p.kod)) break;
  }
  return out;
}

// Hangi ders sorulacak: kutusu dusuk olan daha agirlikli. Hic
// calisilmamis ders kutu 1'dedir, yani kendiliginden one gecer.
export function sonrakiDers(durum, tas, rng = Math.random) {
  const kartlar = Object.fromEntries(DERSLER.map((d) => [d, kart(durum, tas, d)]));
  return selectWeighted(kartlar, rng) ?? DERSLER[0];
}

export function chessViewModel(durum) {
  const acik = new Set(acikTaslar(durum));

  return {
    acikTaslar: [...acik],
    hepsiOgrenildi: PIECES.every((p) => tasOgrenildi(durum, p.kod)),
    taslar: PIECES.map((p) => ({
      kod: p.kod,
      ad: p.ad,
      anlat: p.anlat,
      acik: acik.has(p.kod),
      ogrenildi: tasOgrenildi(durum, p.kod),
      dersler: DERSLER.map((d) => ({
        tip: d,
        kutu: kart(durum, p.kod, d).box,
        ogrenildi: dersOgrenildi(durum, p.kod, d)
      }))
    }))
  };
}
