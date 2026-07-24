/**
 * PIN hash. Tehdit modeli: devtools acmayi ogrenen bir cocuk.
 * Kararli bir saldirgan hedeflenmiyor, caydiricilik yeterli.
 */

const ITERATIONS = 100000;

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(pin, saltBytes) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPin(pin, saltHex) {
  const saltBytes = saltHex
    ? fromHex(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, saltBytes);
  return { hash, salt: toHex(saltBytes) };
}

export async function verifyPin(pin, hash, salt) {
  const result = await derive(pin, fromHex(salt));
  return result === hash;
}

export function randomId() {
  return crypto.randomUUID();
}
