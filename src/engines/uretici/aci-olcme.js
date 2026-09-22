/**
 * Aci olcme soru ureticisi.
 * Kazanimlar: MAT.5.3.3 (olcme araci), MAT.5.3.4 (kesisen dogrularin
 * olusturdugu acilar).
 *
 * Gercekten parametriktir: once derece secilir, sonra cevap o dereceden
 * HESAPLANIR. Celdiriciler cocugun gercekten yaptigi hatalardir:
 *   - butunler yerine tumler almak (180 yerine 90'dan cikarmak)
 *   - aciyi oldugu gibi birakmak
 *   - komsu ile ters aciyi karistirmak
 *   - toplama/cikarmada on birlik hesap hatasi yapmak
 * Yanlis secildiginde cozum adimlari hangi hatanin yapildigini gosterir.
 *
 * NOT: butunlerSorusu ve tersSorusu icin celdirici listesi asagida
 * (4 aday, taban listedeki 3'un ustune) taban brief'teki 3 adaydan
 * bilerek genis tutuldu. d = 90 ciktiginda taban 3 adayin ikisi (d'nin
 * kendisi ve butunler/tumler'in dejenere sonucu) dogru cevaba esit ya
 * da negatif/sifir oluyor ve tek celdirici kaliyor; secmeliKur en az 2
 * ister. dogru-10 / d-10 gibi gercek bir onluk hesap hatasi eklemek bu
 * bosluk icin de en az iki aday birakiyor, digerini rastgele bir
 * sayiyla degil baska bir gercek hatayla dolduruyor.
 */

import { secmeliKur, karistir, sec } from './ortak.js';
import { aciTuru, ACI_TURU_ADI, butunler, tumler } from '../widgets/aci.js';

// Beste bir katlari: aciolcerle gercekten okunabilir degerler. 1 derece
// hassasiyetinde soru sormak cocuga olcmeyi degil goz karariyla tahmini
// ogretirdi.
const derece = (rng, en, encok) => {
  const adim = 5;
  const kac = Math.floor(((encok - en) / adim) + 1);
  return en + adim * Math.floor(rng() * kac);
};

function turSorusu(rng) {
  // Dik ve dogru aciyi da ara sira sor: yalniz rastgele deger secersek
  // tam 90 ve 180 neredeyse hic cikmaz.
  const ozel = [90, 180];
  const d = rng() < 0.25 ? sec(ozel, rng) : derece(rng, 10, 175);
  const tur = aciTuru(d);
  const celdiriciler = Object.keys(ACI_TURU_ADI)
    .filter((k) => k !== tur && k !== 'tam')
    .map((k) => ACI_TURU_ADI[k]);

  return secmeliKur({
    tip: 'aci-olcme-tur',
    soru: `Ölçüsü ${d} derece olan açı hangi türdendir?`,
    dogruCevap: ACI_TURU_ADI[tur],
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      '90 dereceden küçük açı dardır, 90 derece diktir, 90 ile 180 arası geniştir, 180 derece doğru açıdır.',
      `${d} derece bu kurala göre ${ACI_TURU_ADI[tur].toLocaleLowerCase('tr')}dır.`
    ],
    gorsel: { widget: 'aciolcer', derece: d, mod: 'goster' }
  }, rng);
}

function okumaSorusu(rng) {
  const d = derece(rng, 15, 165);
  // Celdiriciler aciolcerin ters skalasini okuma hatasi (180 - d) ve
  // bir buyuk/kucuk bolme kaymasi.
  const celdiriciler = [180 - d, d + 10, d - 10]
    .filter((x) => x > 0 && x < 180 && x !== d)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-okuma',
    soru: 'Açıölçerde gösterilen açı kaç derecedir?',
    dogruCevap: String(d),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Açıölçerin merkezini açının köşesine, sıfır çizgisini bir kenarına koy.',
      'Diğer kenarın geçtiği sayıyı, sıfırın başladığı skaladan oku.',
      `Bu açı ${d} derecedir.`
    ],
    gorsel: { widget: 'aciolcer', derece: d, mod: 'olc' }
  }, rng);
}

function butunlerSorusu(rng) {
  const d = derece(rng, 15, 165);
  const dogru = butunler(d);
  // dogru - 10: cocugun 180 - d'yi dogru kurup da cikarma isleminde
  // onluk kaydirmasi. d = 90 oldugunda tumler(d) 0'a, d ise dogruya
  // esit olup elendiginden, bu aday tek basina eleme sonrasi ikinci
  // celdiriciyi garanti ediyor.
  const celdiriciler = [tumler(d), d, dogru + 10, dogru - 10]
    .filter((x) => x > 0 && x !== dogru)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-butunler',
    soru: `Bir doğru üzerinde açılardan biri ${d} derece ise, komşusu kaç derecedir?`,
    dogruCevap: String(dogru),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Bir doğru üzerindeki komşu açılar bütünlerdir, toplamları 180 derecedir.',
      `180 - ${d} = ${dogru}`,
      'Dikkat: 90 değil 180 kullanılır. 90 kullanırsan tümler açıyı bulursun.'
    ]
  }, rng);
}

function tumlerSorusu(rng) {
  const d = derece(rng, 15, 75);
  const dogru = tumler(d);
  const celdiriciler = [butunler(d), d, dogru + 10]
    .filter((x) => x > 0 && x !== dogru)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-tumler',
    soru: `Bir dik açı ${d} derece ve başka bir açıya bölünmüş. Diğer açı kaç derecedir?`,
    dogruCevap: String(dogru),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'Dik açı 90 derecedir, iki parçanın toplamı 90 eder.',
      `90 - ${d} = ${dogru}`,
      'Dikkat: 180 kullanırsan bütünler açıyı bulursun, burada 90 kullanılır.'
    ]
  }, rng);
}

function tersSorusu(rng) {
  const d = derece(rng, 25, 155);
  // d - 10: d + 10 ile ayni turden bir onluk cikarma hatasi, sadece
  // ters yonde. d = 90 oldugunda butunler(d) ve 90 ikisi de d'ye esit
  // olup elendiginden, bu aday tek basina eleme sonrasi ikinci
  // celdiriciyi garanti ediyor.
  const celdiriciler = [butunler(d), 90, d + 10, d - 10]
    .filter((x) => x > 0 && x !== d)
    .map(String);

  return secmeliKur({
    tip: 'aci-olcme-ters',
    soru: `İki doğru kesişiyor. Oluşan açılardan biri ${d} derece ise, karşısındaki (ters) açı kaç derecedir?`,
    dogruCevap: String(d),
    celdiriciler: karistir(celdiriciler, rng),
    cozum: [
      'İki doğru kesiştiğinde karşılıklı duran açılar birbirine eşittir.',
      `Bu yüzden ters açı da ${d} derecedir.`,
      `Komşu açı olsaydı 180 - ${d} = ${butunler(d)} olurdu; ters açı farklıdır.`
    ]
  }, rng);
}

export function uret(seviye, rng) {
  if (seviye === 1) {
    return rng() < 0.5 ? turSorusu(rng) : okumaSorusu(rng);
  }
  const p = rng();
  if (p < 0.34) return butunlerSorusu(rng);
  if (p < 0.67) return tumlerSorusu(rng);
  return tersSorusu(rng);
}
