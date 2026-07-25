/**
 * Tek yan etkili modul. Motorlar bu modulu import etmez.
 * Backend enjekte edilebilir: testte memoryBackend, tarayicida localStorage.
 */

export function memoryBackend() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; }
  };
}

export function createStorage(backend, prefix = 'ataol') {
  const full = (key) => `${prefix}:${key}`;

  return {
    get(key, fallback = null) {
      const raw = backend.getItem(full(key));
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      backend.setItem(full(key), JSON.stringify(value));
    },

    remove(key) {
      backend.removeItem(full(key));
    },

    keys() {
      const out = [];
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith(`${prefix}:`)) out.push(k.slice(prefix.length + 1));
      }
      return out;
    }
  };
}
