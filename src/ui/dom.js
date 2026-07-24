/**
 * Kucuk DOM kurucu. Metin daima textContent ile yazilir, HTML dogrudan
 * hicbir yerde basilmaz. Enjeksiyon bu sayede yapisal olarak imkansiz.
 */

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, text, dataset, attrs } = options;

  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);

  for (const [k, v] of Object.entries(dataset ?? {})) node.dataset[k] = v;
  for (const [k, v] of Object.entries(attrs ?? {})) node.setAttribute(k, v);

  for (const child of children) {
    if (child) node.appendChild(child);
  }

  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(node, children) {
  clear(node);
  for (const child of children) {
    if (child) node.appendChild(child);
  }
}
