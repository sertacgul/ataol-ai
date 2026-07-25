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
    { ad: 'otobüs', bulunma: 'otobüste', yonelme: 'otobüse', birimler: ['yolcu'], enCok: 50 },
    { ad: 'taksi', bulunma: 'takside', yonelme: 'taksiye', birimler: ['yolcu'], enCok: 4 },
    { ad: 'minibüs', bulunma: 'minibüste', yonelme: 'minibüse', birimler: ['yolcu'], enCok: 15 }
  ]
};

export const THEMES = [VEHICLE_THEME];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) ?? null;
}
