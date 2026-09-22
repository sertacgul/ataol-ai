/**
 * 2026-2027 egitim yili 5. sinif matematik cerceve yillik plani.
 *
 * Bu bir VERI dosyasidir, motor degildir. Yalnizca ESLEME tasir: hangi
 * hafta hangi konunun kacinci seviyesini aciyor. Ders metni ve sorular
 * burada durmaz; onlar data/konular/ altindadir.
 *
 * Kaynak: MEB Talim Terbiye Kurulu 07.08.2026 tarih 70 sayili karar eki
 * Matematik Dersi Ogretim Programi, "MATEMATIK 5. Sinif Cerceve Yillik
 * Plan" calisma takvimi.
 *
 * Alti hafta (14, 22, 29, 30, 32, 35) iki konuya birden dusuyor; planin
 * kendisi o haftalarda ders saatini boluyor (3+2, 2+3, 4+1 gibi).
 * "(2)*" ile isaretli okul temelli planlama suresi dersSaati'ne dahil
 * DEGILDIR.
 *
 * Tarihler 'YYYY-MM-DD' metnidir, Date degil: motorlar saf kalsin ve
 * saat dilimi kaymasi yasanmasin diye.
 */

export const KONU_IDLERI = [
  'temel-cizimler',
  'aci-olcme',
  'cokgenler-cember',
  'cok-basamakli-sayilar',
  'dort-islem-problem',
  'dikdortgen',
  'kesir-gosterim',
  'kesir-karsilastirma',
  'kategorik-veri',
  'veri-yorumlama',
  'esitlik-islem-ozellikleri',
  'islem-onceligi',
  'oruntuler',
  'algoritma',
  'olasilik'
];

export const UNITELER = [
  { id: 'geometrik-sekiller',   ad: 'Geometrik Şekiller',                ilk: 1,  son: 8 },
  { id: 'sayilar-1',            ad: 'Sayılar ve Nicelikler 1',           ilk: 9,  son: 14 },
  { id: 'geometrik-nicelikler', ad: 'Geometrik Nicelikler',              ilk: 15, son: 18 },
  { id: 'sayilar-2',            ad: 'Sayılar ve Nicelikler 2',           ilk: 19, son: 25 },
  { id: 'istatistik',           ad: 'İstatistiksel Araştırma Süreci',    ilk: 26, son: 30 },
  { id: 'cebir',                ad: 'İşlemlerle Cebirsel Düşünme',       ilk: 31, son: 35 },
  { id: 'olasilik',             ad: 'Veriden Olasılığa',                 ilk: 36, son: 36 }
];

const d = (konu, seviye) => ({ konu, seviye });

export const TAKVIM = [
  { hafta: 1,  bas: '2026-09-14', bit: '2026-09-18', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('temel-cizimler', 1)] },
  { hafta: 2,  bas: '2026-09-21', bit: '2026-09-25', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('temel-cizimler', 2)] },
  { hafta: 3,  bas: '2026-09-28', bit: '2026-10-02', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('aci-olcme', 1)] },
  { hafta: 4,  bas: '2026-10-05', bit: '2026-10-09', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('aci-olcme', 2)] },
  { hafta: 5,  bas: '2026-10-12', bit: '2026-10-16', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 1)] },
  { hafta: 6,  bas: '2026-10-19', bit: '2026-10-23', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 2)] },
  { hafta: 7,  bas: '2026-10-26', bit: '2026-10-30', dersSaati: 3, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 3)] },
  { hafta: 8,  bas: '2026-11-02', bit: '2026-11-06', dersSaati: 5, unite: 'geometrik-sekiller',   dersler: [d('cokgenler-cember', 4)] },
  { hafta: 9,  bas: '2026-11-09', bit: '2026-11-13', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('cok-basamakli-sayilar', 1)] },
  { hafta: 10, bas: '2026-11-23', bit: '2026-11-27', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('cok-basamakli-sayilar', 2)] },
  { hafta: 11, bas: '2026-11-30', bit: '2026-12-04', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 1)] },
  { hafta: 12, bas: '2026-12-07', bit: '2026-12-11', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 2)] },
  { hafta: 13, bas: '2026-12-14', bit: '2026-12-18', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 3)] },
  { hafta: 14, bas: '2026-12-21', bit: '2026-12-25', dersSaati: 5, unite: 'sayilar-1',            dersler: [d('dort-islem-problem', 4), d('dikdortgen', 1)] },
  { hafta: 15, bas: '2026-12-28', bit: '2026-12-31', dersSaati: 3, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 2)] },
  { hafta: 16, bas: '2027-01-04', bit: '2027-01-08', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 3)] },
  { hafta: 17, bas: '2027-01-11', bit: '2027-01-15', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 4)] },
  { hafta: 18, bas: '2027-01-18', bit: '2027-01-22', dersSaati: 5, unite: 'geometrik-nicelikler', dersler: [d('dikdortgen', 5)] },
  { hafta: 19, bas: '2027-02-08', bit: '2027-02-12', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 1)] },
  { hafta: 20, bas: '2027-02-15', bit: '2027-02-19', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 2)] },
  { hafta: 21, bas: '2027-02-22', bit: '2027-02-26', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 3)] },
  { hafta: 22, bas: '2027-03-01', bit: '2027-03-05', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-gosterim', 4), d('kesir-karsilastirma', 1)] },
  { hafta: 23, bas: '2027-03-15', bit: '2027-03-19', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 2)] },
  { hafta: 24, bas: '2027-03-22', bit: '2027-03-26', dersSaati: 5, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 3)] },
  { hafta: 25, bas: '2027-03-29', bit: '2027-04-02', dersSaati: 3, unite: 'sayilar-2',            dersler: [d('kesir-karsilastirma', 4)] },
  { hafta: 26, bas: '2027-04-05', bit: '2027-04-09', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 1)] },
  { hafta: 27, bas: '2027-04-12', bit: '2027-04-16', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 2)] },
  { hafta: 28, bas: '2027-04-19', bit: '2027-04-23', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 3)] },
  { hafta: 29, bas: '2027-04-26', bit: '2027-04-30', dersSaati: 5, unite: 'istatistik',           dersler: [d('kategorik-veri', 4), d('veri-yorumlama', 1)] },
  { hafta: 30, bas: '2027-05-03', bit: '2027-05-07', dersSaati: 5, unite: 'istatistik',           dersler: [d('veri-yorumlama', 2), d('esitlik-islem-ozellikleri', 1)] },
  { hafta: 31, bas: '2027-05-10', bit: '2027-05-14', dersSaati: 5, unite: 'cebir',                dersler: [d('esitlik-islem-ozellikleri', 2)] },
  { hafta: 32, bas: '2027-05-20', bit: '2027-05-21', dersSaati: 5, unite: 'cebir',                dersler: [d('islem-onceligi', 1), d('oruntuler', 1)] },
  { hafta: 33, bas: '2027-05-24', bit: '2027-05-28', dersSaati: 5, unite: 'cebir',                dersler: [d('oruntuler', 2)] },
  { hafta: 34, bas: '2027-05-31', bit: '2027-06-04', dersSaati: 3, unite: 'cebir',                dersler: [d('algoritma', 1)] },
  { hafta: 35, bas: '2027-06-07', bit: '2027-06-11', dersSaati: 5, unite: 'cebir',                dersler: [d('algoritma', 2), d('olasilik', 1)] },
  { hafta: 36, bas: '2027-06-14', bit: '2027-06-18', dersSaati: 5, unite: 'olasilik',             dersler: [d('olasilik', 2)] },
  // Sosyal etkinlik haftasi: ders yok, unite yok. unite null olmali,
  // yoksa "unite sinirlari takvimle tutarlidir" testi olasilik unitesinin
  // son haftasini 37 sanip patlar.
  { hafta: 37, bas: '2027-06-21', bit: '2027-06-25', dersSaati: 5, unite: null,                   dersler: [] }
];

export const TATILLER = [
  { ad: '1. Dönem Ara Tatili',         bas: '2026-11-16', bit: '2026-11-20' },
  { ad: 'Yarıyıl Tatili',              bas: '2027-01-25', bit: '2027-02-05' },
  { ad: 'Ara Tatil - Ramazan Bayramı', bas: '2027-03-08', bit: '2027-03-12' },
  { ad: 'Kurban Bayramı ve 19 Mayıs',  bas: '2027-05-15', bit: '2027-05-19' }
];
