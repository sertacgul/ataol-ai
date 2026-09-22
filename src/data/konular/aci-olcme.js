/**
 * Aci Olcme. Haftalar 3-4.
 * Kazanimlar: MAT.5.3.3, MAT.5.3.4.
 *
 * Bu bir VERI dosyasidir. Ders metni Turkcedir ve cocuga dogrudan
 * okunur; ses dosyasi adi konuId-seviye-adimId kalibindan TURETILIR,
 * burada elle yazilmaz.
 */

export default {
  id: 'aci-olcme',
  ad: { tr: 'Açı Ölçme' },
  kazanimlar: [
    { kod: 'MAT.5.3.3', metin: 'Açıları ölçmek için matematiksel araç ve teknolojiden yararlanabilme' },
    { kod: 'MAT.5.3.4', metin: 'Düzlemde iki veya üç doğrunun birbirine göre durumuna bağlı olarak oluşabilecek açılara dair çıkarım yapabilme' }
  ],
  seviyeler: [
    {
      seviye: 1,
      baslik: 'Açı nedir, nasıl ölçülür',
      anlatim: [
        {
          id: 'a1',
          metin: 'Başlangıç noktaları aynı olan iki ışın bir açı oluşturur. Işınların birleştiği ortak noktaya köşe, ışınların kendisine kol denir. Saate bakarsan akrep ile yelkovan iki kol gibidir; ikisinin de çıktığı orta nokta ise köşedir.',
          gorsel: 'aci-kose-kol'
        },
        {
          id: 'a2',
          metin: 'Bir açının ölçüsü, kolların birbirinden ne kadar açıldığını söyler ve derece ile yazılır. Kolları uzatıp kısaltman ölçüyü değiştirmez. Saatin yelkovanı akrepten uzundur ama aralarındaki açının kaç derece olduğu bu uzunlukla ilgili değildir.',
          gorsel: 'aci-buyuklugu'
        },
        {
          id: 'a3',
          metin: 'Açıyı ölçen araca açıölçer denir. Düz kenarının tam ortasındaki küçük işarete merkez denir. Merkezden geçen düz çizgiye sıfır çizgisi denir. Yuvarlak kenarındaki sayılar iki sıra hâlinde yazılıdır: bir sıra soldan, diğer sıra sağdan başlar.',
          gorsel: 'aciolcer'
        },
        {
          id: 'a4',
          metin: 'Ölçerken önce açıölçerin merkezini açının köşesine tam oturtursun. Sonra sıfır çizgisini açının bir kolunun üstüne yatırırsın. En son diğer kolun hangi sayının üzerinden geçtiğine bakarsın. İşte o sayı açının kaç derece olduğunu söyler.',
          gorsel: 'aciolcer-olcme'
        },
        {
          id: 'a5',
          metin: 'İki sıra sayıdan hangisini okuyacağını şöyle bulursun: kolun üstüne yatırdığın tarafta sıfır hangi sıradaysa, o sırayı okursun. En sık yapılan hata yanlış sırayı okumaktır. 50 derecelik bir açıyı 130 derece sanmak hep bu yüzden olur.',
          gorsel: 'aciolcer-skala'
        },
        {
          id: 'a6',
          metin: 'Açılar ölçülerine göre isim alır. 90 dereceden küçük açıya dar açı denir. Tam 90 derece olan açıya dik açı denir. 90 ile 180 arasındaki açıya geniş açı denir. Tam 180 derece olan, yani iki kolun düz bir çizgi oluşturduğu açıya doğru açı denir.',
          gorsel: 'aci-turleri'
        }
      ],
      ornekler: [
        {
          soru: 'Açıölçerin merkezini köşeye koydun, bir kol sıfır çizgisinin üstünde duruyor. Diğer kolun geçtiği yerde hem 50 hem 130 yazıyor. Açı kaç derecedir?',
          adimlar: [
            'Kolun yattığı tarafta sıfır hangi sırada başlıyorsa o sırayı okursun.',
            'Sıfırdan başlayıp diğer kola doğru sayarken o sıra 10, 20, 30 diye ilerler ve 50 sayısına ulaşır.',
            'Öteki sıra ters yönden saydığı için 130 yazar, ama o sıranın sıfırı senin kolunun bulunduğu tarafta değildir.'
          ],
          cevap: '50 derece'
        },
        {
          soru: 'Ölçüsü 125 derece olan bir açı hangi türdendir?',
          adimlar: [
            '125 sayısı 90\'dan büyüktür, bu yüzden bu açı dar açı da dik açı da olamaz.',
            '125 sayısı 180\'den küçüktür, bu yüzden doğru açı da değildir.',
            '90 ile 180 arasında kalan açılara geniş açı denir.'
          ],
          cevap: 'Geniş açı'
        }
      ],
      etkilesim: {
        widget: 'aciolcer',
        mod: 'olc',
        gorev: 'Ekrandaki açıyı açıölçeri sürükleyerek ölç ve kaç derece olduğunu yaz.'
      },
      uretici: 'aci-olcme',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 2,
      baslik: 'Kesişen doğruların açıları',
      anlatim: [
        {
          id: 'a1',
          metin: 'Düz bir doğrunun üstünde bir nokta seçip oradan yukarı bir ışın çizersen doğru iki açıya ayrılır. Yan yana duran bu iki açıya bütünler açılar denir ve ölçüleri toplandığında her zaman 180 derece eder, çünkü düz doğrunun kendisi 180 derecelik bir doğru açıdır.',
          gorsel: 'butunler'
        },
        {
          id: 'a2',
          metin: 'Birini bilirsen diğerini çıkarma yaparak bulursun. Komşu açılardan biri 65 derece ise diğeri 180 eksi 65, yani 115 derecedir. Düz giden bir yoldan sağa bir sokak ayrılıyorsa, sokağın yolla yaptığı iki açı işte böyle bütünlerdir.',
          gorsel: 'butunler-hesap'
        },
        {
          id: 'a3',
          metin: 'Bir dik açıyı bir ışınla ikiye bölersen ortaya çıkan iki açıya tümler açılar denir ve toplamları 90 derecedir. Burada 180 değil 90 kullanılır. En sık yapılan hata ikisini karıştırmaktır: bütünlerde 180\'den, tümlerde 90\'dan çıkarırsın.',
          gorsel: 'tumler'
        },
        {
          id: 'a4',
          metin: 'İki doğru kesiştiğinde kesişme noktasında dört açı oluşur. Yan yana duran açılar komşudur ve bütünlerdir. Karşılıklı duran açılara ters açılar denir. Bir makası açtığında ağızların arasındaki açı ile kolların arasındaki açı işte böyle ters iki açıdır.',
          gorsel: 'kesisim-dort-aci'
        },
        {
          id: 'a5',
          metin: 'Ters açılar her zaman birbirine eşittir. Nedenini şöyle görürsün: iki ters açının da aynı komşusu vardır ve ikisi de o komşuyu 180 dereceye tamamlar. Aynı sayıya tamamlanan iki açının da birbirine eşit olması gerekir.',
          gorsel: 'ters-acilar'
        },
        {
          id: 'a6',
          metin: 'Üç doğru birbirini ayrı noktalarda keserse üç tane kesişme noktası oluşur. Her kesişme noktasında dört açı bulunur, yani hepsi birlikte 12 açı sayarsın. Her noktada ters açılar kendi aralarında eşit, komşu açılar ise bütünlerdir. Ortada üçgen bir ada bırakacak biçimde kesişen üç caddeyi düşünürsen, adanın üç köşesinde de aynı düzeni görürsün.',
          gorsel: 'uc-dogru'
        }
      ],
      ornekler: [
        {
          soru: 'Bir doğru üzerinde yan yana duran iki açıdan biri 65 derece. Diğeri kaç derecedir?',
          adimlar: [
            'Bir doğru üzerindeki komşu açılar bütünlerdir, toplamları 180 derecedir.',
            'Bilinmeyen açıyı bulmak için 180\'den 65\'i çıkarırsın.',
            '180 eksi 65, 115 eder.'
          ],
          cevap: '115 derece'
        },
        {
          soru: 'Bir dik açı bir ışınla ikiye bölünmüş. Parçalardan biri 25 derece ise diğeri kaç derecedir?',
          adimlar: [
            'Dik açı 90 derecedir, iki parçanın toplamı 90 eder.',
            'Burada 180 değil 90 kullanılır, çünkü bölünen şey bir doğru değil bir dik açıdır.',
            '90 eksi 25, 65 eder.'
          ],
          cevap: '65 derece'
        },
        {
          soru: 'İki doğru kesişiyor. Oluşan açılardan biri 40 derece. Karşısındaki ters açı ile yanındaki komşu açı kaç derecedir?',
          adimlar: [
            'Ters açılar birbirine eşittir, bu yüzden karşıdaki açı da 40 derecedir.',
            'Komşu açı ise bütünlerdir, onu bulmak için 180\'den 40\'ı çıkarırsın.',
            '180 eksi 40, 140 eder.'
          ],
          cevap: 'Ters açı 40 derece, komşu açı 140 derece'
        }
      ],
      etkilesim: {
        widget: 'aciolcer',
        mod: 'kesisim',
        gorev: 'İki doğruyu kesiştir. Bir açıyı değiştirdiğinde diğerlerine ne oluyor, gözle ve kuralı bul.'
      },
      uretici: 'aci-olcme',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    }
  ]
};
