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
  },
  {
    id: 'itfaiye', adKey: 'kur.m.itfaiye',
    parcalar: [
      { id: 'tekerlek', adKey: 'kur.p.tekerlek', ciz: (c) => {
        daire(c, 80, 180, 16, KOYU); daire(c, 215, 180, 16, KOYU);
      } },
      { id: 'kasa', adKey: 'kur.p.kasa', ciz: (c) => kutu(c, 35, 108, 185, 72, KIRMIZI) },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 218, 122, 48, 58, MOR); kutu(c, 227, 132, 22, 18, '#ffffff');
      } },
      { id: 'merdiven', adKey: 'kur.p.merdiven', ciz: (c) => {
        // Iki ray + aralarina basamaklar (uzun kenarlar boyunca).
        kalinCizgi(c, 55, 106, 200, 66, 4, ALTIN);
        kalinCizgi(c, 62, 118, 207, 78, 4, ALTIN);
        for (let i = 0; i <= 5; i++) {
          const t = i / 5;
          kalinCizgi(c, 55 + 145 * t, 106 - 40 * t, 62 + 145 * t, 118 - 40 * t, 2, ALTIN);
        }
      } }
    ]
  },
  {
    id: 'traktor', adKey: 'kur.m.traktor',
    parcalar: [
      { id: 'tekerlek', adKey: 'kur.p.tekerlek', ciz: (c) => {
        daire(c, 85, 172, 28, KOYU); daire(c, 215, 184, 15, KOYU);
      } },
      { id: 'kaput', adKey: 'kur.p.kaput', ciz: (c) => kutu(c, 140, 110, 90, 46, CYAN) },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 68, 82, 72, 74, MOR); kutu(c, 80, 94, 34, 26, '#ffffff');
      } },
      { id: 'baca', adKey: 'kur.p.baca', ciz: (c) => kutu(c, 150, 86, 11, 26, KOYU) }
    ]
  },
  {
    id: 'ucak', adKey: 'kur.m.ucak',
    parcalar: [
      { id: 'govde', adKey: 'kur.p.govde', ciz: (c) => {
        c.beginPath(); c.ellipse(150, 120, 110, 24, 0, 0, Math.PI * 2);
        c.fillStyle = CYAN; c.fill(); c.strokeStyle = KOYU; c.lineWidth = 2; c.stroke();
      } },
      { id: 'kanat', adKey: 'kur.p.kanat', ciz: (c) => {
        c.fillStyle = MOR; c.strokeStyle = KOYU; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(130, 128); c.lineTo(200, 128); c.lineTo(175, 165); c.lineTo(120, 165);
        c.closePath(); c.fill(); c.stroke();
      } },
      { id: 'kuyruk', adKey: 'kur.p.kuyruk', ciz: (c) => {
        c.fillStyle = ALTIN; c.strokeStyle = KOYU; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(45, 118); c.lineTo(75, 80); c.lineTo(85, 82); c.lineTo(70, 118);
        c.closePath(); c.fill(); c.stroke();
      } },
      { id: 'pervane', adKey: 'kur.p.pervane', ciz: (c) => {
        kalinCizgi(c, 258, 100, 258, 140, 4, KOYU);
        daire(c, 258, 120, 6, KIRMIZI);
      } }
    ]
  },
  {
    id: 'forklift', adKey: 'kur.m.forklift',
    parcalar: [
      { id: 'tekerlek', adKey: 'kur.p.tekerlek', ciz: (c) => {
        daire(c, 80, 175, 16, KOYU); daire(c, 160, 175, 16, KOYU);
      } },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 60, 90, 120, 72, CYAN); kutu(c, 74, 102, 34, 26, '#ffffff');
      } },
      { id: 'direk', adKey: 'kur.p.direk', ciz: (c) => kutu(c, 186, 58, 12, 116, MOR) },
      { id: 'catal', adKey: 'kur.p.catal', ciz: (c) => {
        kutu(c, 198, 150, 56, 8, ALTIN); kutu(c, 246, 120, 8, 38, ALTIN);
      } }
    ]
  },
  {
    id: 'gemi', adKey: 'kur.m.gemi',
    parcalar: [
      { id: 'govde', adKey: 'kur.p.govde', ciz: (c) => {
        c.fillStyle = MOR; c.strokeStyle = KOYU; c.lineWidth = 2;
        c.beginPath();
        c.moveTo(40, 150); c.lineTo(262, 150); c.lineTo(232, 186); c.lineTo(70, 186);
        c.closePath(); c.fill(); c.stroke();
      } },
      { id: 'kabin', adKey: 'kur.p.kabin', ciz: (c) => {
        kutu(c, 92, 104, 92, 46, CYAN); kutu(c, 104, 114, 20, 16, '#ffffff'); kutu(c, 138, 114, 20, 16, '#ffffff');
      } },
      { id: 'baca', adKey: 'kur.p.baca', ciz: (c) => kutu(c, 192, 108, 26, 42, KIRMIZI) },
      { id: 'direk', adKey: 'kur.p.direk', ciz: (c) => kutu(c, 116, 54, 6, 52, KOYU) }
    ]
  },
  {
    id: 'tren', adKey: 'kur.m.tren',
    parcalar: [
      { id: 'tekerlek', adKey: 'kur.p.tekerlek', ciz: (c) => {
        daire(c, 82, 180, 15, KOYU); daire(c, 140, 180, 15, KOYU); daire(c, 218, 180, 15, KOYU);
      } },
      { id: 'lokomotif', adKey: 'kur.p.lokomotif', ciz: (c) => {
        kutu(c, 58, 104, 118, 70, CYAN); kutu(c, 70, 116, 30, 26, '#ffffff');
      } },
      { id: 'baca', adKey: 'kur.p.baca', ciz: (c) => kutu(c, 82, 78, 20, 28, KOYU) },
      { id: 'vagon', adKey: 'kur.p.vagon', ciz: (c) => kutu(c, 192, 118, 72, 56, MOR) }
    ]
  }
];

export function makineById(id) {
  return MAKINELER.find((m) => m.id === id) ?? null;
}
