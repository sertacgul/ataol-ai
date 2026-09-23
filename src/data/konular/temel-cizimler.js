/**
 * Temel Geometrik Cizimler. Haftalar 1-2.
 * Kazanimlar: MAT.5.3.1, MAT.5.3.2.
 *
 * Bu bir VERI dosyasidir. Ders metni Turkcedir ve cocuga dogrudan
 * okunur; ses dosyasi adi konuId-seviye-adimId kalibindan TURETILIR,
 * burada elle yazilmaz.
 */

export default {
  id: 'temel-cizimler',
  ad: { tr: 'Temel Geometrik Çizimler' },
  kazanimlar: [
    { kod: 'MAT.5.3.1', metin: 'Temel geometrik çizimler için matematiksel araç ve teknolojiden yararlanabilme' },
    { kod: 'MAT.5.3.2', metin: 'Temel geometrik çizimlere dayalı deneyimlerini yansıtabilme' }
  ],
  seviyeler: [
    {
      seviye: 1,
      baslik: 'Nokta, doğru ve araçlar',
      anlatim: [
        {
          id: 'a1',
          metin: 'Geometrinin en küçük parçası noktadır. Nokta bir yeri gösterir ama eni, boyu, kalınlığı yoktur. Kalemini kâğıda bir kez değdirdiğinde bıraktığın iz bir noktadır. Noktalara isim vermek için büyük harf kullanırız: A noktası, B noktası gibi.',
          gorsel: 'nokta'
        },
        {
          id: 'a2',
          metin: 'İki noktayı birleştirip iki yönde de durmadan uzatırsan doğru elde edersin. Doğrunun başı da sonu da yoktur, sonsuza kadar gider. Defterinin çizgileri aslında birer doğru parçasıdır, çünkü sayfanın kenarında biterler.',
          gorsel: 'dogru'
        },
        {
          id: 'a3',
          metin: 'Doğruyu bir yerinden kesersen ışın olur. Işının bir başlangıç noktası vardır, diğer yönde sonsuza gider. Güneşten çıkan ışık tam olarak böyledir: bir yerden başlar ve gittikçe uzaklaşır. Bu yüzden adı ışındır.',
          gorsel: 'isin'
        },
        {
          id: 'a4',
          metin: 'İki ucu da belli olan parçaya doğru parçası denir. Uzunluğunu cetvelle ölçebilirsin, çünkü nerede başlayıp nerede bittiği bellidir. Bir kitabın kenarı, bir masanın kenarı birer doğru parçasıdır.',
          gorsel: 'dogru-parcasi'
        },
        {
          id: 'a5',
          metin: 'Her şeklin kendi aracı vardır. Nokta, doğru, ışın ve doğru parçası için cetvel yeterlidir. Çember çizmek için pergel gerekir, çünkü pergel merkeze olan uzaklığı sabit tutar. Açı çizmek ve ölçmek için açıölçer, dikme çizmek için gönye kullanılır.',
          gorsel: 'araclar'
        },
        {
          id: 'a6',
          metin: 'Bu derste üç şeklin daha adını duyacaksın. Çember, bir noktaya eşit uzaklıktaki noktaların oluşturduğu kapalı eğridir. Açı, başlangıç noktaları aynı olan iki ışının oluşturduğu şekildir. Dikme ise bir doğruya 90 derecelik açıyla çizilen doğrudur. Bunları önümüzdeki haftalarda ayrıntısıyla öğreneceksin.',
          gorsel: 'cember-aci-dikme'
        }
      ],
      ornekler: [
        {
          soru: 'Elinde cetvel, pergel, açıölçer ve gönye var. Bir çember çizmen isteniyor. Hangisini seçersin ve neden?',
          adimlar: [
            'Çemberin her noktası merkeze eşit uzaklıktadır.',
            'Bu eşit uzaklığı sabit tutabilen tek araç pergeldir.',
            'Pergelin açıklığını istediğin yarıçap kadar ayarlar, sivri ucunu merkeze basarsın.'
          ],
          cevap: 'Pergel'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'serbest',
        gorev: 'Tuvale bir nokta, bir doğru parçası ve bir ışın çiz. Her birini çizdiğinde uygulama ne çizdiğini sana söyleyecek.'
      },
      uretici: 'temel-cizimler',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 2,
      baslik: 'Gösterimler ve dikme',
      anlatim: [
        {
          id: 'a1',
          metin: 'Matematikte şekilleri kısaca yazmanın bir yolu vardır. Köşeli parantez, o taraftaki ucun belli olduğunu anlatır. Uçları A ve B olan bir doğru parçasını [AB] biçiminde yazarsın. İki tarafta da parantez vardır, çünkü şeklin iki ucu da bellidir.',
          gorsel: 'gosterim-dogru-parcasi'
        },
        {
          id: 'a2',
          metin: 'Işını yazarken parantezi yalnız başlangıç tarafına koyarsın, yani [AB diye yazarsın. Parantezsiz kalan taraf şeklin o yönde sonsuza gittiğini gösterir. Doğruda ise hiç parantez yoktur, onu AB doğrusu diye yazarsın, çünkü iki yönde de hiç bitmez.',
          gorsel: 'gosterim-isin'
        },
        {
          id: 'a3',
          metin: 'Bu üç şekli ayırt etmenin en kolay yolu uçlarını saymaktır. Doğru parçasının 2 ucu vardır. Işının 1 ucu vardır. Doğrunun hiç ucu yoktur, yani uç sayısı sıfırdır, çünkü iki yönde de sonsuza gider. Nokta ise tek başına bir yerdir, onun da ucu yoktur.',
          gorsel: 'uc-sayilari'
        },
        {
          id: 'a4',
          metin: 'Bir doğruya 90 derecelik açıyla çizilen doğruya dikme denir. Dikme de bir doğru olduğu için onun da ucu yoktur. Dikme çizmek için gönye kullanırsın, çünkü gönyenin köşesi tam 90 derecedir. Gönyenin bir kenarını doğruya yaslar, diğer kenarı boyunca kalemini çekersin.',
          gorsel: 'dikme'
        },
        {
          id: 'a5',
          metin: 'Dik kesişen iki doğru, kesiştikleri yerde dört tane açı oluşturur ve bu dört açının dördü de 90 derecedir. Gönyeni dört köşeye de sırayla yaslarsan dördünde de boşluk kalmadığını görürsün. Bunun neden böyle olduğunu 4. haftada, kesişen doğruların açılarını öğrenirken göreceksin.',
          gorsel: 'dik-kesisim'
        },
        {
          id: 'a6',
          metin: 'Dikliği çevrende çok görürsün. Kapı çerçevesinin dik kenarı ile eşiği diktir. Duvar ile zemin diktir. Defterinin köşesi de diktir. Bir köşenin dik olup olmadığını merak edersen defterinin köşesini oraya yaslarsın; boşluk kalmadan oturuyorsa o açı 90 derecedir.',
          gorsel: 'kapi-cercevesi'
        }
      ],
      ornekler: [
        {
          soru: 'Tahtada [AB] ve [AB yazıyor. Bu ikisi aynı şekil midir? Değilse her birinin kaç ucu vardır?',
          adimlar: [
            'Köşeli parantez, o taraftaki ucun belli olduğunu gösterir.',
            '[AB] yazılışında iki tarafta da parantez var, demek ki iki uç da belli: bu bir doğru parçasıdır ve 2 ucu vardır.',
            '[AB yazılışında parantez yalnız başta var, B tarafı açık kalmış: bu bir ışındır ve 1 ucu vardır.'
          ],
          cevap: 'Aynı değildir: [AB] 2 uçlu doğru parçası, [AB 1 uçlu ışındır'
        },
        {
          soru: 'Bir doğruya, üzerindeki bir noktadan dikme çizdin. Oluşan dört açıdan birini gönyeyle ölçtün ve 90 derece buldun. Diğer üç açı kaç derecedir?',
          adimlar: [
            'Dikme, çizildiği doğruyla 90 derecelik açı yapan doğrudur.',
            'Bir doğru üzerinde yan yana duran iki açının ölçüleri toplandığında 180 derece eder, çünkü doğrunun kendisi düz bir çizgidir.',
            'Ölçtüğün açının yanındaki açı için 180 eksi 90, yani 90 derece bulursun.',
            'Doğrunun öbür tarafında da aynı hesap geçerlidir, bu yüzden kalan iki açı da 90 derecedir.'
          ],
          cevap: '90 derece'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'dikme',
        gorev: 'Verilen doğruya, üzerindeki noktadan bir dikme çiz. Açının 90 derece olduğunu gönyeyle kontrol et.'
      },
      uretici: 'temel-cizimler',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    }
  ]
};
