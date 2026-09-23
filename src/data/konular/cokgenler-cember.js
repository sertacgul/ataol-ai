/**
 * Cokgenler ve Cember. Haftalar 5-8.
 * Kazanimlar: MAT.5.3.5, MAT.5.3.6, MAT.5.3.7.
 *
 * Bu bir VERI dosyasidir. Ders metni Turkcedir ve cocuga dogrudan
 * okunur; ses dosyasi adi konuId-seviye-adimId kalibindan TURETILIR,
 * burada elle yazilmaz.
 */

export default {
  id: 'cokgenler-cember',
  ad: { tr: 'Çokgenler ve Çember' },
  kazanimlar: [
    { kod: 'MAT.5.3.5', metin: 'Çokgenleri düzlemde ardışık olarak kesişen doğruların oluşturduğu kapalı şekiller olarak yorumlayabilme' },
    { kod: 'MAT.5.3.6', metin: 'Çokgenlerin özellikleri ile ilgili edindiği deneyimleri yansıtabilme' },
    { kod: 'MAT.5.3.7', metin: 'Matematiksel araç ve teknoloji yardımıyla düzlemde iki noktada kesişen çember çiftinin merkezleri ve kesişim noktalarından biri ile inşa edilen üçgenlerin kenar özelliklerine yönelik çıkarım yapabilme' }
  ],
  seviyeler: [
    {
      seviye: 1,
      baslik: 'Çokgen nasıl oluşur',
      anlatim: [
        {
          id: 'a1',
          metin: 'Düzlemde en az üç doğru alır ve bunları ardışık olarak kesiştirirsin: birinci ikinciyi keser, ikinci üçüncüyü keser. Sonuncu doğru da dönüp ilkini keserse yol kapanır ve ortada kapalı bir şekil kalır. İşte bu kapalı şekle çokgen denir.',
          gorsel: 'cokgen-olusum'
        },
        {
          id: 'a2',
          metin: 'Kaç doğru kullandıysan o kadar kenar oluşur. Üç doğru kesiştirirsen üç kenar, beş doğru kesiştirirsen beş kenar çıkar. Kenarlar doğrunun tamamı değildir; iki kesişme noktası arasında kalan doğru parçalarıdır, çünkü doğrunun geri kalanı şeklin dışında kalır.',
          gorsel: 'cokgen-kenar'
        },
        {
          id: 'a3',
          metin: 'Çokgenin adı kenar sayısını söyler. Üç kenarlı olana üçgen, dört kenarlı olana dörtgen, beş kenarlı olana beşgen, altı kenarlı olana altıgen, yedi kenarlı olana yedigen, sekiz kenarlı olana sekizgen denir.',
          gorsel: 'cokgen-adlari'
        },
        {
          id: 'a4',
          metin: 'Şekil kapanmazsa çokgen olmaz. Sonuncu doğru ilkiyle kesişmezse arada açık bir ağız kalır ve içerisi ile dışarısı birbirinden ayrılmamış olur. Kenarları eğri olan şekiller de çokgen değildir, çünkü her kenarın bir doğru parçası olması gerekir.',
          gorsel: 'cokgen-degil'
        },
        {
          id: 'a5',
          metin: 'Çokgenler çevrende her yerde. Dur levhası sekizgendir, sekiz kenarı vardır. Yön gösteren levhaların çoğu dörtgendir. Arıların yaptığı peteğin her gözü ise altıgendir; altıgenler yan yana dizildiğinde aralarında hiç boşluk kalmaz.',
          gorsel: 'cokgen-gunluk'
        }
      ],
      ornekler: [
        {
          soru: 'Düzlemde 5 doğru, sonuncusu ilkiyle kesişecek biçimde ardışık olarak kesişiyor. Oluşan kapalı şeklin adı nedir?',
          adimlar: [
            'Ardışık kesişen doğrular, sonuncusu ilkiyle de kesiştiğinde kapalı bir şekil oluşturur.',
            'Kaç doğru varsa o kadar kenar oluşur, yani 5 doğru 5 kenar demektir.',
            '5 kenarlı çokgenin adı beşgendir.'
          ],
          cevap: 'Beşgen'
        },
        {
          soru: 'Bir arı peteğinin her gözü altıgendir. Bu gözün kaç kenarı vardır?',
          adimlar: [
            'Çokgenin adı kaç kenarı olduğunu söyler.',
            'Altıgen adındaki altı sayısı kenar sayısıdır.'
          ],
          cevap: '6'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'cokgen',
        gorev: 'Dört doğru çiz, sonuncusu ilkiyle kesişsin. Oluşan çokgenin kaç kenarı ve kaç köşesi olduğunu say.'
      },
      uretici: 'cokgenler-cember',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 2,
      baslik: 'Kenar, köşe ve açı',
      anlatim: [
        {
          id: 'a1',
          metin: 'Bir çokgende iki komşu kenar birleşerek bir köşe yapar. Her kenarın iki ucu vardır ve her uç bir köşede başka bir kenarla buluşur. Bu yüzden köşe sayısı kenar sayısına her zaman eşittir. Beş kenarlı bir çokgenin beş köşesi olur.',
          gorsel: 'kenar-kose'
        },
        {
          id: 'a2',
          metin: 'Her köşede iki kenar birbiriyle bir açı yapar. Bu açıya çokgenin iç açısı denir. Her köşede tek bir iç açı oluştuğu için açı sayısı da köşe sayısına, dolayısıyla kenar sayısına eşittir. Altıgende altı kenar, altı köşe ve altı iç açı bulunur.',
          gorsel: 'ic-acilar'
        },
        {
          id: 'a3',
          metin: 'Bütün kenarları eşit uzunlukta ve bütün iç açıları eşit ölçüde olan çokgenlere düzgün çokgen denir. Düzgün dörtgen karedir, düzgün üçgen ise eşkenar üçgendir. Kenarlardan yalnızca biri bile farklıysa o çokgen düzgün değildir.',
          gorsel: 'duzgun-cokgen'
        },
        {
          id: 'a4',
          metin: 'Kare bir dörtgendir, çünkü dört kenarı vardır. Ama her dörtgen kare değildir: kenarları 3, 3, 5 ve 5 santimetre olan bir şekil de dörtgendir, oysa kare değildir. Bir gruba ait olmak, o grubun en özel üyesi olmak demek değildir.',
          gorsel: 'kare-dortgen'
        },
        {
          id: 'a5',
          metin: 'Yere döşenen fayanslara bakarsan bunu kendin görürsün. Kare fayanslar yan yana geldiğinde aralarında boşluk kalmaz, çünkü her birleşme yerinde dört tane dik açı buluşur ve tam bir dönüş tamamlanır. Altıgen fayanslar da boşluksuz döşenir; arılar peteğini bu yüzden altıgen yapar.',
          gorsel: 'fayans'
        }
      ],
      ornekler: [
        {
          soru: 'Bir çokgenin 7 kenarı var. Kaç köşesi ve kaç iç açısı vardır?',
          adimlar: [
            'Her köşede iki komşu kenar birleşir, bu yüzden köşe sayısı kenar sayısına eşittir.',
            '7 kenar varsa 7 köşe de vardır.',
            'Her köşede bir tane iç açı oluştuğu için iç açı sayısı da 7 olur.'
          ],
          cevap: '7 köşe ve 7 iç açı'
        },
        {
          soru: 'Kenar uzunlukları 4, 4, 6 ve 6 santimetre olan bir dörtgen düzgün çokgen midir?',
          adimlar: [
            'Düzgün çokgende bütün kenarların uzunluğu eşit olmalıdır.',
            'Burada 4 ile 6 birbirine eşit değildir.',
            'Kenarlardan biri bile farklı olduğu için bu dörtgen düzgün çokgen değildir.'
          ],
          cevap: 'Hayır, düzgün çokgen değildir'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'cokgen',
        gorev: 'Farklı kenar sayılarında çokgenler kur ve kenar ile köşe sayısının her zaman eşit olduğunu kendin gör.'
      },
      uretici: 'cokgenler-cember',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 3,
      baslik: 'Çember ve yarıçap',
      anlatim: [
        {
          id: 'a1',
          metin: 'Bir nokta seçip ona merkez dersin. Sonra bu merkeze uzaklığı hep aynı olan bütün noktaları işaretlersin. Ortaya kapalı ve yuvarlak bir eğri çıkar, buna çember denir. Bisiklet tekerleğinin dış kenarı böyledir: her noktası göbeğe eşit uzaklıktadır.',
          gorsel: 'cember'
        },
        {
          id: 'a2',
          metin: 'Merkezden çember üzerindeki herhangi bir noktaya çizilen doğru parçasına yarıçap denir. Merkez M, çember üzerindeki nokta K ise bu uzunluğu [MK] diye yazarsın. Hangi noktayı seçersen seç yarıçap aynı kalır, çünkü çemberin tanımı bunu gerektirir.',
          gorsel: 'yaricap'
        },
        {
          id: 'a3',
          metin: 'Merkezden geçip çemberi iki yerden kesen doğru parçasına çap denir. Çap aslında uç uca eklenmiş iki yarıçaptır, bu yüzden çap her zaman yarıçapın iki katıdır. Yarıçap 6 santimetre ise çap 12 santimetre olur. Saat kadranının bir kenarından tam karşı kenarına olan uzaklık çaptır.',
          gorsel: 'cap'
        },
        {
          id: 'a4',
          metin: 'Çemberi pergelle çizersin. Önce pergelin açıklığını cetvel üstünde istediğin yarıçap kadar ayarlarsın. Sonra sivri ucunu merkeze bastırıp kalemli ucunu bir tur döndürürsün. Pergel açıklığı sabit tuttuğu için kalem merkeze hep aynı uzaklıkta kalır ve çember çıkar.',
          gorsel: 'pergel'
        },
        {
          id: 'a5',
          metin: 'İki çemberi biraz üst üste binecek biçimde çizersen birbirlerini iki noktada keserler. İki merkezi ve kesişim noktalarından birini doğru parçalarıyla birleştirirsen bir üçgen elde edersin. Bu üçgenin kenarları iki yarıçap ile merkezler arası uzaklıktır; şimdi bunu birlikte kullanacaksın.',
          gorsel: 'iki-cember'
        },
        {
          id: 'a6',
          metin: 'Üçgenlerin türünü kenar uzunluklarını karşılaştırarak söylersin. Üç kenar da birbirine eşitse eşkenar üçgen olur. Yalnızca ikisi eşitse ikizkenar üçgen olur. Üçü de birbirinden farklıysa çeşitkenar üçgen olur. Kesişen çemberlerden çıkan üçgenlerde de bu adları kullanacaksın.',
          gorsel: 'ucgen-turleri'
        }
      ],
      ornekler: [
        {
          soru: 'Merkezi M olan bir çemberin yarıçapı 7 santimetre. Çember üzerindeki K noktası için [MK] uzunluğu kaç santimetredir?',
          adimlar: [
            'Çemberin merkezi ile üzerindeki her noktanın arasındaki uzaklık eşittir.',
            'Bu eşit uzunluğun adı yarıçaptır.',
            'K noktası çemberin üzerinde olduğu için [MK] de yarıçap kadardır.'
          ],
          cevap: '7 santimetre'
        },
        {
          soru: 'Pergelin açıklığını 5 santimetreye ayarlayıp bir çember çizdin. Bu çemberin çapı kaç santimetredir?',
          adimlar: [
            'Pergel, açıklığı kadar yarıçapı olan bir çember çizer, yani yarıçap 5 santimetredir.',
            'Çap merkezden geçer ve uç uca eklenmiş iki yarıçaptan oluşur.',
            '5 artı 5, 10 eder.'
          ],
          cevap: '10 santimetre'
        },
        {
          soru: 'Yarıçapları 6 santimetre ve 6 santimetre olan iki çemberi, merkezleri arası 6 santimetre olacak biçimde çizdin. Merkezler ile bir kesişim noktasının kurduğu üçgen hangi türdendir?',
          adimlar: [
            'Üçgenin kenarları iki yarıçap ile merkezler arası uzaklıktır.',
            'Yani kenarlar 6, 6 ve 6 santimetredir.',
            'Üç kenar da birbirine eşit olduğu için bu bir eşkenar üçgendir.'
          ],
          cevap: 'Eşkenar üçgen'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'cember',
        gorev: 'Pergel aracıyla farklı yarıçaplarda çemberler çiz. Yarıçapı iki katına çıkardığında çembere ne oluyor?'
      },
      uretici: 'cokgenler-cember',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    },
    {
      seviye: 4,
      baslik: 'Kesişen çemberlerden üçgen',
      anlatim: [
        {
          id: 'a1',
          metin: 'İki çember her zaman kesişmez. Merkezleri birbirinden çok uzaksa çemberler birbirine hiç değmez. Merkezler çok yakınsa küçük çember büyüğün içinde kalır ve yine kesişmez. Merkezler arası uzaklık iki yarıçapın toplamından küçük, farkından büyük olduğunda ise çemberler tam iki noktada kesişir.',
          gorsel: 'kesisim-kosulu'
        },
        {
          id: 'a2',
          metin: 'İki tabağı masanın üstünde biraz üst üste bindirdiğinde kenarlarının iki yerde çakıştığını görürsün. İşte o iki yer kesişim noktalarıdır. Birinci merkezi, ikinci merkezi ve bu kesişim noktalarından birini doğru parçalarıyla birleştirirsen ortaya bir üçgen çıkar.',
          gorsel: 'cember-ucgen'
        },
        {
          id: 'a3',
          metin: 'Bu üçgenin kenarları tam olarak şu üç uzunluktur: birinci çemberin yarıçapı, ikinci çemberin yarıçapı ve merkezler arası uzaklık. Başka hiçbir şey ölçmene gerek kalmaz, çünkü üç kenarın üçü de zaten elinde hazır durur.',
          gorsel: 'ucgen-kenarlari'
        },
        {
          id: 'a4',
          metin: 'Nedenini birlikte görelim. Kesişim noktası birinci çemberin üzerindedir, bu yüzden birinci merkeze uzaklığı birinci yarıçap kadardır. Aynı nokta ikinci çemberin de üzerindedir, bu yüzden ikinci merkeze uzaklığı ikinci yarıçap kadardır. Üçüncü kenar ise iki merkezin arasıdır.',
          gorsel: 'ucgen-neden'
        },
        {
          id: 'a5',
          metin: 'Üçgenin türünü bu üç uzunluğu karşılaştırarak bulursun. Üçü de birbirine eşitse eşkenar üçgen olur. Yalnızca ikisi eşitse ikizkenar üçgen olur. Üçü de birbirinden farklıysa çeşitkenar üçgen olur.',
          gorsel: 'ucgen-turleri'
        },
        {
          id: 'a6',
          metin: 'Bunu kendin de denersin. İki çemberin yarıçapını eşit seçersen üçgenin iki kenarı zaten eşit olur, yani en az ikizkenar çıkar. Merkezler arası uzaklığı da aynı sayıya ayarlarsan üç kenar birden eşitlenir ve karşına eşkenar üçgen çıkar.',
          gorsel: 'esit-yaricap'
        }
      ],
      ornekler: [
        {
          soru: 'Yarıçapları 5 santimetre ve 5 santimetre olan iki çemberin merkezleri arası 8 santimetre ve çemberler iki noktada kesişiyor. Merkezler ile bir kesişim noktasının kurduğu üçgen hangi türdendir?',
          adimlar: [
            'Üçgenin kenarları birinci yarıçap, ikinci yarıçap ve merkezler arası uzaklıktır.',
            'Yani kenarlar 5, 5 ve 8 santimetredir.',
            'İki kenar eşit, üçüncüsü farklı olduğu için bu bir ikizkenar üçgendir.'
          ],
          cevap: 'İkizkenar üçgen'
        },
        {
          soru: 'Yarıçapları 4 santimetre ve 6 santimetre olan iki çemberin merkezleri arası 9 santimetre. Çemberler iki noktada kesişiyor. Kurulan üçgen hangi türdendir?',
          adimlar: [
            'Üçgenin kenarları birinci yarıçap, ikinci yarıçap ve merkezler arası uzaklıktır.',
            'Yani kenarlar 4, 6 ve 9 santimetredir.',
            'Üç kenar da birbirinden farklı olduğu için bu bir çeşitkenar üçgendir.'
          ],
          cevap: 'Çeşitkenar üçgen'
        }
      ],
      etkilesim: {
        widget: 'geometri-tuval',
        mod: 'cember-ucgen',
        gorev: 'İki çemberin yarıçaplarını ve merkezler arası uzaklığı değiştir. Oluşan üçgenin türünü tahmin et, sonra kontrol et.'
      },
      uretici: 'cokgenler-cember',
      quiz: { soruSayisi: 10, gecmeNotu: 70 }
    }
  ]
};
