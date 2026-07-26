/**
 * Is makinesi kurucu: makineleri parcalardan olusturur, cocuk her parcayi
 * adiyla ogrenir.
 *
 * Her parca kendini bir 2D baglama (ctx) cizer; DOM'a dokunmaz, o yuzden
 * bu modul saftir (ctx disaridan gelir). Cizim mantiksal 300x220 alanda;
 * cagiran olcegi ayarlar.
 *
 * adKey: parca/makine adinin i18n anahtari. Renkler marka paletinden;
 * her parca ayri renk, birlesim gorunur olsun.
 */

const MOR = '#5F27CD';
const CYAN = '#00CEC9';
const ALTIN = '#FFD25E';
const KIRMIZI = '#FF7675';
const KOYU = '#2D3436';

function kutu(c, x, y, w, h, renk) {
  c.fillStyle = renk;
  c.fillRect(x, y, w, h);
  c.strokeStyle = KOYU;
  c.lineWidth = 2;
  c.strokeRect(x, y, w, h);
}

function daire(c, x, y, r, renk) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = renk;
  c.fill();
  c.strokeStyle = KOYU;
  c.lineWidth = 2;
  c.stroke();
}

function kalinCizgi(c, x1, y1, x2, y2, kalinlik, renk) {
  c.strokeStyle = renk;
  c.lineWidth = kalinlik;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

export const MAKINELER = [
  {
    id: 'ekskavator', adKey: 'kur.m.ekskavator',
    parcalar: [
      { id: 'palet', adKey: 'kur.p.palet', ciz: (c) => {
        kutu(c, 40, 172, 220, 30, MOR);
        for (const x of [70, 120, 170, 220]) daire(c, x, 187, 9, KOYU);
      } },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 55, 108, 105, 62, CYAN);
        kutu(c, 68, 120, 34, 28, '#ffffff'); // cam
      } },
      { id: 'bom', adKey: 'kur.p.bom', ciz: (c) => {
        kalinCizgi(c, 150, 140, 250, 78, 14, ALTIN);
      } },
      { id: 'kova', adKey: 'kur.p.kova', ciz: (c) => {
        c.fillStyle = KIRMIZI; c.strokeStyle = KOYU; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(240, 70); c.lineTo(272, 74); c.lineTo(266, 100); c.lineTo(244, 92);
        c.closePath(); c.fill(); c.stroke();
      } }
    ]
  },
  {
    id: 'vinc', adKey: 'kur.m.vinc',
    parcalar: [
      { id: 'taban', adKey: 'kur.p.taban', ciz: (c) => kutu(c, 95, 178, 110, 26, MOR) },
      { id: 'kule', adKey: 'kur.p.kule', ciz: (c) => kutu(c, 135, 52, 30, 128, CYAN) },
      { id: 'kol', adKey: 'kur.p.kol', ciz: (c) => kutu(c, 55, 50, 205, 15, ALTIN) },
      { id: 'kanca', adKey: 'kur.p.kanca', ciz: (c) => {
        kalinCizgi(c, 238, 65, 238, 104, 3, KOYU);
        c.strokeStyle = KOYU; c.lineWidth = 3;
        c.beginPath(); c.arc(233, 106, 6, -0.4, Math.PI); c.stroke();
      } }
    ]
  },
  {
    id: 'kamyon', adKey: 'kur.m.kamyon',
    parcalar: [
      { id: 'tekerlek', adKey: 'kur.p.tekerlek', ciz: (c) => {
        daire(c, 95, 176, 18, KOYU); daire(c, 210, 176, 18, KOYU);
      } },
      { id: 'kasa', adKey: 'kur.p.kasa', ciz: (c) => kutu(c, 50, 96, 150, 66, CYAN) },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 205, 112, 55, 50, MOR);
        kutu(c, 214, 122, 24, 20, '#ffffff'); // cam
      } }
    ]
  }
];

export function makineById(id) {
  return MAKINELER.find((m) => m.id === id) ?? null;
}
