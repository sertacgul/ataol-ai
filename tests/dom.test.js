import { test } from 'node:test';
import assert from 'node:assert/strict';

function fakeDocument() {
  return {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        className: '',
        textContent: '',
        dataset: {},
        attributes: {},
        children: [],
        setAttribute(k, v) { this.attributes[k] = String(v); },
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) { this.children = this.children.filter((x) => x !== c); },
        get firstChild() { return this.children[0] ?? null; }
      };
    }
  };
}

globalThis.document = fakeDocument();
const { el, mount, clear } = await import('../src/ui/dom.js');

test('metin textContent olarak yazilir, yorumlanmaz', () => {
  const node = el('p', { text: '<img src=x onerror=alert(1)>' });
  assert.equal(node.textContent, '<img src=x onerror=alert(1)>');
  assert.deepEqual(node.attributes, {});
});

test('sayi ve sifir metne cevrilir', () => {
  assert.equal(el('p', { text: 0 }).textContent, '0');
});

test('izin verilen oznitelik yazilir', () => {
  const node = el('button', { attrs: { type: 'button' } });
  assert.equal(node.attributes.type, 'button');
});

test('olay ozniteligi reddedilir', () => {
  assert.throws(() => el('img', { attrs: { onerror: 'alert(1)' } }), /izin verilmeyen oznitelik/);
});

test('calistirilabilir oznitelikler reddedilir', () => {
  assert.throws(() => el('a', { attrs: { href: 'javascript:alert(1)' } }), /izin verilmeyen oznitelik/);
  assert.throws(() => el('div', { attrs: { style: 'x' } }), /izin verilmeyen oznitelik/);
});

test('aria oznitelikleri kabul edilir', () => {
  const node = el('button', { attrs: { 'aria-label': 'Onayla' } });
  assert.equal(node.attributes['aria-label'], 'Onayla');
});

test('dataset degerleri yazilir', () => {
  const node = el('li', { dataset: { cardId: 'abc' } });
  assert.equal(node.dataset.cardId, 'abc');
});

test('cocuklar eklenir, null atlanir', () => {
  const node = el('ul', {}, [el('li', { text: 'a' }), null, el('li', { text: 'b' })]);
  assert.equal(node.children.length, 2);
});

test('mount hedefi once temizler', () => {
  const hedef = el('div', {}, [el('span', { text: 'eski' })]);
  mount(hedef, [el('span', { text: 'yeni' })]);
  assert.equal(hedef.children.length, 1);
  assert.equal(hedef.children[0].textContent, 'yeni');
});

test('clear tum cocuklari siler', () => {
  const hedef = el('div', {}, [el('span', {}), el('span', {})]);
  clear(hedef);
  assert.equal(hedef.children.length, 0);
});
