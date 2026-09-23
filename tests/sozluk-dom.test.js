import { test } from 'node:test';
import assert from 'node:assert/strict';

// src/ui/dom.js:16 icindeki el() document.createElement cagiriyor ve
// Node'da document yok. tests/dom.test.js bu sorunu zaten cozmus: once
// global document kurulur, SONRA modul DINAMIK ithal edilir. Ikinci bir
// cozum icat etmek yerine ayni kalip kullaniliyor.
function sahteDocument() {
  return {
    createElement(etiket) {
      return {
        tagName: etiket.toUpperCase(),
        className: '', textContent: '', dataset: {}, attributes: {},
        cocuklar: [],
        setAttribute(k, v) { this.attributes[k] = String(v); },
        appendChild(c) { this.cocuklar.push(c); return c; },
        removeChild(c) { this.cocuklar = this.cocuklar.filter((x) => x !== c); },
        get firstChild() { return this.cocuklar[0] ?? null; },
        addEventListener() {}
      };
    }
  };
}

globalThis.document = sahteDocument();
const { sozlukEkrani } = await import('../src/ui/sozluk-dom.js');

function sahteDugum() {
  return globalThis.document.createElement('div');
}

// Tum agaci duz metne cevirir; ne yazildigini kontrol etmek icin.
function metinler(d) {
  const c = d.textContent ? [d.textContent] : [];
  for (const k of d.cocuklar ?? []) c.push(...metinler(k));
  return c;
}

const ceviri = (k, p = {}) => (p.n !== undefined ? `${k}:${p.n}` : k);

const MODEL_DOLU = {
  sorgu: 'bag', bos: false, mesajAnahtari: null,
  sonuclar: [{
    id: 'bag', en: 'bag', tr: 'çanta', tur: 'isim', yon: 'en-tr',
    gorsel: { tip: 'emoji', deger: '👜' },
    ornek: { en: 'A bag.', tr: 'Bir çanta.' }
  }]
};

test('sonuclar ekrana Ingilizce ve Turkce karsilikla yazilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('bag'), 'Ingilizce kelime yazilmali');
  assert.ok(m.includes('çanta'), 'Turkce karsilik yazilmali');
});

test('ornek cumle iki dilde de gorunur', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('A bag.'), 'Ingilizce ornek yazilmali');
  assert.ok(m.includes('Bir çanta.'), 'Turkce ornek yazilmali');
});

test('emoji gorsel ekrana basilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  assert.ok(metinler(kok).includes('👜'), 'emoji basilmali');
});

test('bos sorguda ipucu mesaji gorunur, sonuc listesi degil', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, { sorgu: '', bos: true, mesajAnahtari: 'sozluk.ipucu', sonuclar: [] }, ceviri);
  const m = metinler(kok);
  assert.ok(m.includes('sozluk.ipucu'), 'ipucu mesaji gorunmeli');
  assert.ok(!m.includes('bag'), 'sonuc gorunmemeli');
});

test('bulunamadi mesaji gorunur', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, { sorgu: 'zzz', bos: true, mesajAnahtari: 'sozluk.bulunamadi', sonuclar: [] }, ceviri);
  assert.ok(metinler(kok).includes('sozluk.bulunamadi'));
});

test('sonuc sayisi gosterilir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  assert.ok(metinler(kok).some((x) => x.startsWith('sozluk.sonucSayisi:1')));
});

test('her sonucun dinle dugmesi kelime id sini tasir', () => {
  const kok = sahteDugum();
  sozlukEkrani(kok, MODEL_DOLU, ceviri);
  const bul = (d) => {
    if (d.dataset && d.dataset.sozlukDinle) return d.dataset.sozlukDinle;
    for (const k of d.cocuklar ?? []) { const r = bul(k); if (r) return r; }
    return null;
  };
  assert.equal(bul(kok), 'bag', 'dinle dugmesi kelime id tasimali');
});
