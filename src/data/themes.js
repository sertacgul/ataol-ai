/**
 * Problem temalari. Bu bir VERI dosyasidir.
 *
 * Turkce ekler burada elle yazilir, kodda uretilmez. "tir" -> "tirda",
 * "otobus" -> "otobuste", "vinc" -> "vincte": unlu uyumu ve unsuz
 * benzesmesi algoritmayla dogru uretilemez, denenirse bozuk Turkce cikar.
 *
 * Her aracin kendi birimi vardir. "Takside 8 palet vardi" sacmadir ve
 * zorlanan bir cocukta yalnizca kafa karisikligi uretir.
 *
 * enCok: yolcu araclarinin gercekci kapasitesi. Bir takside 17 yolcu
 * olmaz; cocuk araclara merakli ve bunu bilir, bildigi bir gercekle
 * celisen cumle dikkatini aritmetikten koparir.
 */

export const VEHICLE_THEME = {
  id: 'araclar',
  ad: 'Araçlar',
  nesneler: [
    { ad: 'tır', bulunma: 'tırda', yonelme: 'tıra', birimler: ['kasa', 'palet', 'koli'] },
    { ad: 'kamyon', bulunma: 'kamyonda', yonelme: 'kamyona', birimler: ['kasa', 'çuval', 'koli'] },
    { ad: 'kamyonet', bulunma: 'kamyonette', yonelme: 'kamyonete', birimler: ['koli', 'sandık'] },
    { ad: 'vinç', bulunma: 'vinçte', yonelme: 'vince', birimler: ['blok', 'boru'] },
    { ad: 'traktör', bulunma: 'traktörde', yonelme: 'traktöre', birimler: ['çuval', 'balya'] },
    { ad: 'otobüs', bulunma: 'otobüste', yonelme: 'otobüse', birimler: ['yolcu'], yolcu: true, enCok: 50, inisYeri: 'Durakta' },
    { ad: 'taksi', bulunma: 'takside', yonelme: 'taksiye', birimler: ['yolcu'], yolcu: true, enCok: 4, inisYeri: 'Köşede' },
    { ad: 'minibüs', bulunma: 'minibüste', yonelme: 'minibüse', birimler: ['yolcu'], yolcu: true, enCok: 15, inisYeri: 'Durakta' }
  ]
};

// Ingilizce tema. Turkce ekler yerine edat obekleri: "on a truck",
// "at the stop". coklu: filo/paylastirma problemlerinde cogul ("trucks").
// yolcu bayragi dil-bagimsiz: yolcu araci mi yuk araci mi ayrimi bununla
// yapilir (birimin adiyla degil).
export const VEHICLE_THEME_EN = {
  id: 'araclar',
  ad: 'Vehicles',
  nesneler: [
    { ad: 'truck', coklu: 'trucks', bulunma: 'on a truck', birimler: ['crates', 'pallets', 'boxes'] },
    { ad: 'lorry', coklu: 'lorries', bulunma: 'on a lorry', birimler: ['crates', 'sacks', 'boxes'] },
    { ad: 'van', coklu: 'vans', bulunma: 'in a van', birimler: ['boxes', 'crates'] },
    { ad: 'crane', coklu: 'cranes', bulunma: 'on a crane', birimler: ['blocks', 'pipes'] },
    { ad: 'tractor', coklu: 'tractors', bulunma: 'on a tractor', birimler: ['sacks', 'bales'] },
    { ad: 'bus', coklu: 'buses', bulunma: 'on a bus', birimler: ['passengers'], yolcu: true, enCok: 50, inisYeri: 'At the stop' },
    { ad: 'taxi', coklu: 'taxis', bulunma: 'in a taxi', birimler: ['passengers'], yolcu: true, enCok: 4, inisYeri: 'At the corner' },
    { ad: 'minibus', coklu: 'minibuses', bulunma: 'on a minibus', birimler: ['passengers'], yolcu: true, enCok: 15, inisYeri: 'At the stop' }
  ]
};

export const THEMES = [VEHICLE_THEME];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) ?? null;
}

export function themeFor(dil) {
  return dil === 'en' ? VEHICLE_THEME_EN : VEHICLE_THEME;
}
