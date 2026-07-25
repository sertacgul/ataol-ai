/**
 * v1 -> v2 tek yonlu, tek seferlik veri donusturucu.
 *
 * Saf kalir: hicbir sey yazmaz, silmez, depolamayi dogrudan okumaz.
 * Ham okuyucu disaridan enjekte edilir.
 *
 * Emek tasinir, yetenek tasinmaz. Carpim tablosu ilerlemesi ve sohbet
 * gecmisi bilerek okunmaz bile; boylece plana sizmalari mumkun degildir.
 */

const V1_STARS = 'ataol_stars';
const V1_BADGES = 'ataol_unlocked_badges';
const V1_HEROES = 'ataol_read_heroes';
const V1_RIDDLES = 'ataol_solved_riddles';
const V1_API_KEY = 'ataol_api_key';

function hamMetin(getRaw, anahtar) {
  const ham = getRaw(anahtar);
  return typeof ham === 'string' ? ham : null;
}

function sayiCoz(ham) {
  if (ham === null) return 0;
  const n = Number.parseInt(ham, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function metinDizisiCoz(ham) {
  if (ham === null) return [];
  let cozulen;
  try {
    cozulen = JSON.parse(ham);
  } catch {
    return [];
  }
  if (!Array.isArray(cozulen)) return [];
  return cozulen
    .filter((e) => typeof e === 'string' || typeof e === 'number')
    .map((e) => String(e));
}

function metinCoz(ham) {
  return ham === null ? '' : ham.trim();
}

/**
 * v1 depolamasini duz, JSON guvenli bir nesneye cevirir.
 * getRaw(anahtar) bulunamayan anahtar icin null dondurmelidir.
 */
export function v1Oku(getRaw) {
  return {
    stars: sayiCoz(hamMetin(getRaw, V1_STARS)),
    badges: metinDizisiCoz(hamMetin(getRaw, V1_BADGES)),
    readHeroes: metinDizisiCoz(hamMetin(getRaw, V1_HEROES)),
    solvedRiddles: metinDizisiCoz(hamMetin(getRaw, V1_RIDDLES)),
    apiKey: metinCoz(hamMetin(getRaw, V1_API_KEY))
  };
}

/**
 * v1Oku ciktisindan tasima planini uretir.
 * tasinacakVarMi false ise ortada tasinacak bir emek yoktur.
 */
export function tasimaPlani(v1) {
  const legacyStars = v1.stars;
  const badges = [...v1.badges];
  const readHeroes = [...v1.readHeroes];
  const solvedRiddles = [...v1.solvedRiddles];
  const apiKey = v1.apiKey;

  const tasinacakVarMi =
    legacyStars > 0 ||
    badges.length > 0 ||
    readHeroes.length > 0 ||
    solvedRiddles.length > 0 ||
    apiKey.length > 0;

  return { legacyStars, badges, readHeroes, solvedRiddles, apiKey, tasinacakVarMi };
}
