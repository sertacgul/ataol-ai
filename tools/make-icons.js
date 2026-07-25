// PWA ikonlarini sifir bagimlilikla uretir.
// Kullanim: node tools/make-icons.js
// Cikti: icons/icon-192.png, icons/icon-512.png,
//        icons/icon-maskable-512.png, icons/apple-touch-icon.png

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const KOK = fileURLToPath(new URL('..', import.meta.url));
const CIKTI = path.join(KOK, 'icons');

// ---------------------------------------------------------------- PNG kodlayici

const CRC_TABLO = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLO[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tip, veri) {
  const uzunluk = Buffer.alloc(4);
  uzunluk.writeUInt32BE(veri.length, 0);
  const govde = Buffer.concat([Buffer.from(tip, 'latin1'), veri]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(govde), 0);
  return Buffer.concat([uzunluk, govde, crc]);
}

// piksel: Uint8Array, kanal sayisi kadar bayt/piksel (RGB veya RGBA)
function pngKodla(genislik, yukseklik, piksel, alfaVar) {
  const kanal = alfaVar ? 4 : 3;
  const renkTipi = alfaVar ? 6 : 2;
  const satirBayt = genislik * kanal;

  // Her satirin basina filtre baytini (0 = None) koy.
  const ham = Buffer.alloc((satirBayt + 1) * yukseklik);
  for (let y = 0; y < yukseklik; y++) {
    ham[y * (satirBayt + 1)] = 0;
    Buffer.from(piksel.buffer, piksel.byteOffset + y * satirBayt, satirBayt)
      .copy(ham, y * (satirBayt + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(genislik, 0);
  ihdr.writeUInt32BE(yukseklik, 4);
  ihdr[8] = 8;          // bit derinligi
  ihdr[9] = renkTipi;   // 2 = RGB, 6 = RGBA
  ihdr[10] = 0;         // sikistirma: deflate
  ihdr[11] = 0;         // filtre yontemi
  ihdr[12] = 0;         // interlace yok

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(ham, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ---------------------------------------------------------------- geometri

const MOR = [0x6c, 0x5c, 0xe7];
const BEYAZ = [0xff, 0xff, 0xff];

// Bes koseli yildizin 10 kosesi (ucu yukari bakar).
function yildizKoseleri(cx, cy, disR) {
  const icR = disR * Math.sin(Math.PI / 10) / Math.sin((7 * Math.PI) / 10);
  const noktalar = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? disR : icR;
    const aci = -Math.PI / 2 + (i * Math.PI) / 5;
    noktalar.push([cx + r * Math.cos(aci), cy + r * Math.sin(aci)]);
  }
  return noktalar;
}

function poligonIcinde(x, y, kose) {
  let icinde = false;
  for (let i = 0, j = kose.length - 1; i < kose.length; j = i++) {
    const [xi, yi] = kose[i];
    const [xj, yj] = kose[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) icinde = !icinde;
  }
  return icinde;
}

function yuvarlakKareIcinde(x, y, boyut, yaricap) {
  const dx = Math.max(yaricap - x, x - (boyut - yaricap), 0);
  const dy = Math.max(yaricap - y, y - (boyut - yaricap), 0);
  return dx * dx + dy * dy <= yaricap * yaricap;
}

// ---------------------------------------------------------------- cizim

const SS = 4; // super ornekleme: piksel basina 4x4 alt ornek

function ikonCiz({ boyut, alfaVar, yildizOran, koseOran }) {
  const kanal = alfaVar ? 4 : 3;
  const piksel = new Uint8Array(boyut * boyut * kanal);
  const kose = yildizKoseleri(boyut / 2, boyut / 2 * 1.03, boyut * yildizOran);
  const koseYaricap = boyut * koseOran;
  const altToplam = SS * SS;

  for (let y = 0; y < boyut; y++) {
    for (let x = 0; x < boyut; x++) {
      let zeminSay = 0;
      let yildizSay = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          const zeminde = alfaVar ? yuvarlakKareIcinde(px, py, boyut, koseYaricap) : true;
          if (zeminde) zeminSay++;
          if (zeminde && poligonIcinde(px, py, kose)) yildizSay++;
        }
      }
      const zeminKapsam = zeminSay / altToplam;
      const yildizKapsam = yildizSay / altToplam;
      const i = (y * boyut + x) * kanal;
      for (let k = 0; k < 3; k++) {
        piksel[i + k] = Math.round(MOR[k] + (BEYAZ[k] - MOR[k]) * yildizKapsam);
      }
      if (alfaVar) piksel[i + 3] = Math.round(zeminKapsam * 255);
    }
  }
  return pngKodla(boyut, boyut, piksel, alfaVar);
}

// ---------------------------------------------------------------- uretim

const ISLER = [
  // Normal ikonlar: alfa var, yuvarlak kose, buyuk yildiz.
  { dosya: 'icon-192.png', boyut: 192, alfaVar: true, yildizOran: 0.40, koseOran: 0.20 },
  { dosya: 'icon-512.png', boyut: 512, alfaVar: true, yildizOran: 0.40, koseOran: 0.20 },
  // Maskable: opak, tam kare zemin, yildiz merkezdeki %80 daire icinde.
  // Dis yaricap 0.29 * 512 = 148.5 px, guvenli yaricap 204.8 px.
  { dosya: 'icon-maskable-512.png', boyut: 512, alfaVar: false, yildizOran: 0.29, koseOran: 0 },
  // iOS: opak, kose yuvarlamasi YOK (iOS kendisi yuvarlar).
  { dosya: 'apple-touch-icon.png', boyut: 180, alfaVar: false, yildizOran: 0.38, koseOran: 0 }
];

mkdirSync(CIKTI, { recursive: true });
for (const is of ISLER) {
  const png = ikonCiz(is);
  const yol = path.join(CIKTI, is.dosya);
  writeFileSync(yol, png);
  console.log(`${is.dosya}  ${is.boyut}x${is.boyut}  ${is.alfaVar ? 'RGBA' : 'RGB'}  ${png.length} bayt`);
}
