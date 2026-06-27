const fs = require('fs');

const heroes = [
    {
        name: "Mustafa Kemal ATATÜRK",
        title: "Eşsiz Lider ve Matematikçi 🇹🇷",
        emoji: "🇹🇷",
        story: "Atatürk sadece ülkemizi kurtarmakla kalmadı, bilime ve matematiğe de büyük önem verdi. Türkçe geometri terimlerini (üçgen, açı, artı, eksi vb.) kendisi yazdı! Hayatta en gerçek yol göstericinin bilim olduğunu söyledi.",
        quote: "Hayatta en hakiki mürşit ilimdir.",
        lesson: "Geleceğin lideri olmak için kitap okumayı ve araştırmayı asla bırakma!"
    },
    {
        name: "Sertaç GÜL",
        title: "Sistem ve Yapay Zeka Mühendisi 💻",
        emoji: "💻",
        story: "Deha'nın biricik babası! JetŞef firmasında sistemleri tasarlar ve ATAOL AI Techs bünyesinde Deha için bu harika yapay zeka uygulamasını geliştirdi. Akıllı sistemler, optimizasyonlar ve yapay zeka çözümleri üreterek dünyaya katkı sunuyor. Deha'nın en büyük ilham kaynağı!",
        quote: "Benim en büyük projem ve başarımı süsleyen gururum, oğlum Deha'dır.",
        lesson: "Baban her zaman senin arkanda aslan oğlum! Teknolojiyi öğren ve geleceği inşa et!"
    },
    {
        name: "Albert Einstein",
        title: "Zaman ve Uzay Kaşifi 🧠",
        emoji: "🧠",
        story: "Çocukken öğretmenleri onun yavaş öğrendiğini düşünüyordu ama o hayal kurmaktan hiç vazgeçmedi. Uzay, zaman ve ışık hakkında hayaller kurarak modern fiziği baştan yazdı.",
        quote: "Hayal gücü, bilgiden daha önemlidir.",
        lesson: "Bir şeyi hemen anlamazsan üzülme; senin zihnin ve hayal gücün benzersizdir!"
    },
    {
        name: "Prof. Dr. Celal Şengör",
        title: "Dünyaca Ünlü Jeoloğumuz 🌍",
        emoji: "🌍",
        story: "Yerkabuğunun hareketlerini, depremleri ve dağların oluşumunu inceleyen harika bir yerbilimcidir. Çok okur, dünyayı gezer ve bilimi çok eğlenceli şekilde anlatır.",
        quote: "Bilim, gerçekleri arama sürecidir.",
        lesson: "Dünyayı ve doğayı anlamak için coğrafya ve jeoloji kitaplarını sevmeyi unutma!"
    },
    {
        name: "Orville & Wilbur Wright",
        title: "Uçağı İcat Eden Kardeşler ✈️",
        emoji: "✈️",
        story: "Yıllarca bisikletçilik yaptılar ama rüzgarları inceleyip ilk motorlu ve kontrollü uçağı uçurarak insanlığın uçma hayalini gerçeğe dönüştürdüler.",
        quote: "Uçmak, rüzgara karşı direnmekle başlar.",
        lesson: "İmkansız görünen rüyaların peşinden gitmek için Wright kardeşler gibi cesur ol!"
    },
    {
        name: "James Watt",
        title: "Sanayi Devriminin Mimarı ⚙️",
        emoji: "⚙️",
        story: "Buhar makinesini geliştirerek trenlerin, fabrikaların ve makinelerin çalışmasını sağladı. Sanayi Devrimi'ni başlatan kişi oldu.",
        quote: "Güç, verimli kullanılan enerjidir.",
        lesson: "Enerjini ve vaktini verimli kullanırsan dünyayı değiştirecek güç bulursun!"
    },
    {
        name: "Michael Faraday",
        title: "Elektromanyetizmanın Kaşifi ⚡",
        emoji: "⚡",
        story: "Fakir bir ailede doğdu, ciltçilik yaparken kitapları okuyarak bilimi öğrendi. Elektrik motorunu ve jeneratörü icat ederek elektriği kullanılabilir yaptı.",
        quote: "Hayal et, dene, başarısız ol, tekrar dene.",
        lesson: "Hangi şartlarda olursan ol, Faraday gibi okuyarak kendini her gün geliştirebilirsin!"
    },
    {
        name: "Galileo Galilei",
        title: "Modern Astronominin Babası 🔭",
        emoji: "🔭",
        story: "Kendi teleskobunu yaptı, Jüpiter'in uydularını keşfetti ve Dünya'nın Güneş etrafında döndüğünü savunarak bilimin özgürlüğünü savundu.",
        quote: "Dünya yine de dönüyor.",
        lesson: "Gerçekleri savunmaktan ve doğruları araştırmaktan asla korkma!"
    },
    {
        name: "Blaise Pascal",
        title: "Matematikçi ve Basınç Kaşifi 📐",
        emoji: "📐",
        story: "Genç yaşta ilk mekanik hesap makinesini (Pascaline) babasının vergi hesaplarına yardım etmek için yaptı. Matematikte Pascal Üçgeni'ni buldu.",
        quote: "Matematik, insan zihninin en güzel ürünüdür.",
        lesson: "Matematik sadece okul için değil, hayatı kolaylaştırmak ve pratik çözümler üretmek içindir!"
    },
    {
        name: "Prof. Dr. Aziz Sancar",
        title: "Nobel Ödüllü Kimyagerimiz 🧪",
        emoji: "🧪",
        story: "DNA onarımı üzerindeki çalışmalarıyla Nobel Kimya Ödülü'nü kazandı. Mardin'den çıkıp dünyaya bilimin gücünü gösterdi.",
        quote: "Çalışmak kendimize duyduğumuz saygıdır.",
        lesson: "Başarı çalışarak kazanılır, sen de çalışırsan Nobel kazanabilirsin Dehacığım!"
    },
    {
        name: "Ali Kuşçu",
        title: "Gökbilimci ve Matematikçi 🪐",
        emoji: "🪐",
        story: "Ay'ın haritasını ilk çıkaran astronomlardan biridir. Fatih Sultan Mehmet döneminde İstanbul'a gelerek matematik kürsüsü kurmuştur.",
        quote: "Yıldızları takip eden, yolunu kaybetmez.",
        lesson: "Gökyüzüne bak, yıldızları izle ve uzay bilimlerini merak et!"
    },
    {
        name: "Cahit Arf",
        title: "Dünyaca Ünlü Matematikçimiz ♾️",
        emoji: "♾️",
        story: "Paralarımızın (10 TL) üzerinde resmi olan büyük matematikçimiz! Kendi adıyla anılan 'Arf Değişmezi' teoremini bulmuştur.",
        quote: "Matematik esas olarak sabır işidir.",
        lesson: "Matematik sorularını çözerken sabırlı olursan mutlaka doğru cevaba ulaşırsın!"
    },
    {
        name: "Marie Curie",
        title: "Radyoaktivitenin Kaşifi 💡",
        emoji: "💡",
        story: "İki farklı alanda (Fizik ve Kimya) Nobel kazanan tek kadındır. Polonyum ve Radyum elementlerini keşfetmiştir.",
        quote: "Cesur olun ve kendinize inanın.",
        lesson: "Zorluklar karşısında yılma, çalışarak her engeli aşabilirsin!"
    },
    {
        name: "Nikola Tesla",
        title: "Alternatif Akımın Mucidi 🔌",
        emoji: "🔌",
        story: "Kablosuz iletişim, radyo ve alternatif akım motorlarını icat etti. Dünyayı elektrikle aydınlatan adam oldu.",
        quote: "Gelecek, gerçeklerin görüleceği yerdir.",
        lesson: "Geleceğe dair büyük hayaller kur, projelerini hayata geçirmekten çekinme!"
    },
    {
        name: "Thomas Edison",
        title: "Ampulün Mucidi 💡",
        emoji: "💡",
        story: "Ampulü icat etmek için 1000'den fazla başarısız deneme yaptı ama pes etmedi. 'Hata yapmadım, çalışmayan 1000 yolu buldum' dedi.",
        quote: "Deha, %1 ilham ve %99 terdir.",
        lesson: "Bir matematik sorusunda hata yaparsan üzülme, pes etmeden denemeye devam et!"
    },
    {
        name: "Ada Lovelace",
        title: "İlk Kadın Programcı 💻",
        emoji: "💻",
        story: "Bilgisayarlar henüz icat edilmemişken, mekanik hesap makineleri için ilk algoritmayı (kodları) yazarak tarihin ilk yazılımcısı oldu.",
        quote: "Hayal gücü, bilimin en büyük rehberidir.",
        lesson: "Bilgisayarları ve kod yazmayı severek geleceğin harika yazılımlarını üretebilirsin!"
    },
    {
        name: "Alan Turing",
        title: "Yapay Zekanın Kurucusu 🧠",
        emoji: "🧠",
        story: "Bilgisayar biliminin babasıdır. İkinci Dünya Savaşı'nda 'Enigma' adlı şifre çözücü makineyi icat ederek savaşın bitmesini hızlandırmıştır.",
        quote: "Bazen kimsenin hayal edemediği şeyleri, kimsenin tahmin edemediği insanlar yapar.",
        lesson: "Farklı düşünmekten korkma, senin de yapacağın harika şeyler olacak!"
    },
    {
        name: "Charles Darwin",
        title: "Biyoloji ve Doğa Tarihçisi 🦋",
        emoji: "🦋",
        story: "Beagle gemisiyle dünyayı gezerek canlı türlerini inceledi. Doğal seçilim ve evrim teorisiyle biyoloji bilimini baştan yazdı.",
        quote: "En güçlü olan değil, değişime en çok uyum sağlayan hayatta kalır.",
        lesson: "Çevrendeki doğayı, bitkileri ve canlıları merakla incele, doğa en büyük laboratuvardır!"
    },
    {
        name: "Louis Pasteur",
        title: "Mikropların Kaşifi ve Aşı Mucidi 🦠",
        emoji: "🦠",
        story: "Mikropları keşfetti. Sütün bozulmasını önleyen pastörizasyon yöntemini ve ölümcül kuduz aşısını bularak milyonlarca insanı kurtardı.",
        quote: "Şans, sadece hazır olan zihinlere güler.",
        lesson: "Sokak hayvanlarını severken temizliğe dikkat etmemizin sebebi Pasteur'ün bulduğu bu görünmez mikroplardır!"
    },
    {
        name: "Alexander Fleming",
        title: "Penisilinin Mucidi 🧫",
        emoji: "🧫",
        story: "Laboratuvarını temizlemeyi unuttuğu bir gün, küf mantarlarının bakterileri öldürdüğünü fark etti ve ilk antibiyotik olan penisilini buldu.",
        quote: "Bazen doğa bize en büyük sırlarını kazara fısıldar.",
        lesson: "Hatalar ve tesadüfler bile meraklı bir zihin için harika birer keşif fırsatıdır!"
    },
    {
        name: "Alexander Graham Bell",
        title: "Telefonun Mucidi 📞",
        emoji: "📞",
        story: "İşitme engellilerin duymasını sağlamak için çalışmalar yaparken tesadüfen ses dalgalarını elektrik tellerinden iletip ilk telefonu icat etti.",
        quote: "Bir kapı kapandığında, diğeri açılır.",
        lesson: "İnsanlara yardım etmek için üreteceğin fikirler, dünyayı birbirine bağlayabilir!"
    },
    {
        name: "Steve Jobs",
        title: "Apple ve Akıllı Telefon Mucidi 📱",
        emoji: "📱",
        story: "Tasarım and teknolojiyi birleştirerek akıllı telefonları (iPhone), tabletleri ve bilgisayarları herkesin kolayca kullanabileceği hale getirdi.",
        quote: "Aç kal, budala kal (Merak etmeye devam et).",
        lesson: "Teknolojik cihazları sadece izlemek için değil, onlarla yeni şeyler tasarlamak için kullan!"
    },
    {
        name: "Elon Musk",
        title: "Uzay ve Elektrikli Araç Vizyoneri 🚀",
        emoji: "🚀",
        story: "Uzay şirketi SpaceX ile roketleri tekrar dikey indirmeyi başardı. Tesla ile elektrikli arabaları popüler yaptı. Mars'a gitmeyi hedefliyor.",
        quote: "Eğer bir şey yeterince önemliyse, şanslar aleyhinizde olsa bile yapmalısınız.",
        lesson: "Geleceğin teknolojilerini hayal et, uzay ve mühendislik bilimlerine ilgi duy!"
    },
    {
        name: "Stephen Hawking",
        title: "Karadeliklerin Kaşifi 🌌",
        emoji: "🌌",
        story: "Hareket edememesine ve konuşamamasına rağmen özel bilgisayarıyla evren, karadelikler ve zamanın başlangıcı hakkında teoriler yazdı.",
        quote: "Zeka, değişime uyum sağlayabilme yeteneğidir.",
        lesson: "Fiziksel engeller veya zorluklar, zihninin evreni keşfetmesine asla engel olamaz!"
    },
    {
        name: "Harezmi",
        title: "Cebirin Kurucusu 🧮",
        emoji: "🧮",
        story: "Matematikte 'Cebir' dalını kurdu ve Avrupa'ya tanıttı. Ayrıca 'Sıfır' (0) rakamını ilk kez matematiksel işlemlerde kullandı. Algoritma kelimesi onun adından gelir.",
        quote: "Matematik, evrenin ortak dilidir.",
        lesson: "Sıfırın değerini ve cebrin gücünü bilerek matematik çalışmak sana güç verir!"
    },
    {
        name: "Biruni",
        title: "Dünyanın Çapını Ölçen Deha 🗺️",
        emoji: "🗺️",
        story: "Bundan bin yıl önce Dünya'nın döndüğünü savundu ve Dünya'nın çapını bugünkü ölçümlere neredeyse birebir aynı şekilde hesaplamayı başardı.",
        quote: "Bilgi, paylaşıldıkça çoğalan tek hazinedir.",
        lesson: "Bilimle uğraşan insan sınırları aşar, bin yıl önceden bugünü aydınlatır!"
    },
    {
        name: "Piri Reis",
        title: "Dünya Haritasını Çizen Amiral 🗺️",
        emoji: "🗺️",
        story: "Amerika kıtasını da içeren ve o dönem için inanılmaz derecede doğru olan ilk dünya haritalarını çizdi. 'Kitab-ı Bahriye' adında denizcilik kitabı yazdı.",
        quote: "Harita, bilginin coğrafya üzerindeki resmidir.",
        lesson: "Coğrafya, haritalar ve keşifler dünyamızı anlamanın en heyecanlı yoludur!"
    },
    {
        name: "Gazi Yaşargil",
        title: "Yüzyılın Beyin Cerrahı 🧠",
        emoji: "🧠",
        story: "Mikro-beyin cerrahisini kurarak beynin en hassas noktalarındaki tümörleri ameliyat etme yöntemlerini geliştirdi. Tıp dünyasında bir efsanedir.",
        quote: "Her beyin, keşfedilmeyi bekleyen bir evrendir.",
        lesson: "İnsan beyninin gizemlerini çözmek ve doktor olmak harika bir hayaldir!"
    },
    {
        name: "Canan Dağdeviren",
        title: "Giyilebilir Kalp Pilinin Mucidi 💓",
        emoji: "💓",
        story: "Vücut hareketleriyle şarj olabilen giyilebilir kalp pilini icat etti. Ayrıca cilt kanserini tespit eden cihazlar geliştirdi.",
        quote: "Bilim, insanlığa duyulan derin bir sevgidir.",
        lesson: "Teknoloji ve tıbbı birleştirerek insanların hayatını kurtaracak icatlar yapabilirsin!"
    },
    {
        name: "Tim Berners-Lee",
        title: "İnternetin Mucidi 🌐",
        emoji: "🌐",
        story: "Bugün web sitelerine girerken kullandığımız 'World Wide Web' (www) sistemini icat etti. İnterneti herkese açık ve ücretsiz yaptı.",
        quote: "Web, insanları birbirine bağlamak için tasarlandı.",
        lesson: "İnterneti sadece video izlemek için değil, bilgi edinmek ve yeni şeyler tasarlamak için kullan!"
    },
    {
        name: "Alessandro Volta",
        title: "Pilin Mucidi 🔋",
        emoji: "🔋",
        story: "Çinko ve bakır plakaları tuzlu suya batırarak elektrik akımı elde etti ve insanlık tarihinin ilk kimyasal pilini (Volta Pili) yaptı.",
        quote: "Elektrik, maddelerin ruhudur.",
        lesson: "Bugün telefonlarımızda, oyuncaklarımızda kullandığımız piller Volta'nın bu basit deneyiyle başladı!"
    },
    {
        name: "Leonardo da Vinci",
        title: "Rönesans Dehası ve Mucit 🎨",
        emoji: "🎨",
        story: "Mona Lisa'yı çizdi ama aynı zamanda helikopter, tank, denizaltı ve uçan makinelerin ilk tasarımlarını yüzyıllar öncesinden defterine çizdi.",
        quote: "Öğrenmek, zihni asla yormayan tek şeydir.",
        lesson: "Hem sanatı hem bilimi bir arada yürüterek Leonardo gibi çok yönlü bir deha olabilirsin!"
    },
    {
        name: "Archimedes (Arşimet)",
        title: "Suyun Kaldırma Kuvvetini Bulan Deha 🛁",
        emoji: "🛁",
        story: "Hamamda yıkanırken suyun onu yukarı ittiğini fark etti. 'Evreka! (Buldum!)' diye bağırarak sokaklara fırladı ve suyun kaldırma kuvvetini keşfetti.",
        quote: "Bana bir dayanak noktası verin, Dünya'yı yerinden oynatayım.",
        lesson: "Fizik kuralları her yerdedir, banyoda yıkanırken bile bilimi düşünebilirsin!"
    },
    {
        name: "John von Neumann",
        title: "Modern Bilgisayar Mimarı 💻",
        emoji: "💻",
        story: "Bugün kullandığımız tüm bilgisayarların temel yapısı olan 'Von Neumann Mimarisi'ni (işlemci, bellek, giriş-çıkış üniteleri) tasarladı.",
        quote: "Eğer insanlar matematiğin basit olduğuna inanmıyorlarsa, bu sadece hayatın ne kadar karmaşık olduğunu fark etmediklerindendir.",
        lesson: "Bilgisayar donanımlarını ve mantık kapılarını öğrenmek yazılımcı olmanın ilk adımıdır!"
    },
    {
        name: "John J. Hopfield & Geoffrey E. Hinton",
        title: "Yapay Sinir Ağları ve Yapay Zekanın Babaları 🧠",
        emoji: "🧠",
        story: "Bilgisayarların insan beyni gibi öğrenmesini sağlayan yapay sinir ağları ve derin öğrenme algoritmalarını geliştirerek modern yapay zekayı (yapay zeka asistanları, ATAOL AI) kurdular.",
        quote: "Yapay zeka, makinelerin öğrenme macerasıdır.",
        lesson: "Bugün ATAOL Yapay Zeka ile sohbet edebilmenin temelini bu iki bilim insanı atmıştır!"
    }
];

// Add 65 more scientists to complete 100 entries
const extraScientists = [
    { name: "Isaac Newton", title: "Kütleçekimi ve Kalkülüs Mucidi 🍎", emoji: "🍎", story: "Kafasına düşen elma sayesinde kütleçekim yasasını formüle etti. Hareket kanunlarını yazdı ve ışığın tayfını keşfetti.", quote: "Eğer daha uzağı görebildiysem, devlerin omuzlarında durduğum içindir.", lesson: "Fizik kuralları evrenseldir, Newton gibi gözlem yaparak büyük sırlar keşfedebilirsin." },
    { name: "Johannes Kepler", title: "Gezegenlerin Yörünge Kaşifi 🪐", emoji: "🪐", story: "Gezegenlerin Güneş etrafında tam daire değil, eliptik yörüngelerde dolandığını keşfetti. Kepler Kanunları'nı yazdı.", quote: "Geometri, yaratılışın ebedi şablonudur.", lesson: "Matematik ve geometrinin doğada, uzayda nasıl harika çalıştığını fark et!" },
    { name: "Dmitri Mendeleev", title: "Periyodik Tablonun Yaratıcısı 📊", emoji: "📊", story: "Kimyasal elementleri özelliklerine göre sıralayan periyodik tabloyu tasarladı ve henüz keşfedilmemiş elementlerin yerini doğru tahmin etti.", quote: "Her şeyin bir düzeni vardır, yeter ki aramayı bil.", lesson: "Çalışmalarında düzenli ve planlı olursan gelecekteki boşlukları sen de görebilirsin!" },
    { name: "Hezarfen Ahmed Çelebi", title: "Kanatlarla Uçan İlk Türk Mucit 🦅", emoji: "🦅", story: "Kuşların kanatlarını ve rüzgarları inceledi. Kendi yaptığı yapay kanatlarla Galata Kulesi'nden atlayıp Üsküdar'a kadar uçtu.", quote: "Gökyüzü cesurları bekler.", lesson: "Wright kardeşlerden yüzyıllar önce uçmayı hayal eden atalarımızın cesaretini örnek al!" },
    { name: "İbn-i Sina (Avicenna)", title: "Tıbbın Hükümdarı 🩺", emoji: "🩺", story: "Bin yıl önce tıp üzerine yazdığı 'El-Kanun fi't-Tıbb' kitabı, Avrupa üniversitelerinde yüzlerce yıl ders kitabı olarak okutuldu. Hastalıkları teşhis etti.", quote: "Şifasız hastalık yoktur, irade eksikliğinden başka.", lesson: "İnsan sağlığına faydalı olmak, tıp ve biyoloji bilimlerinde ilerlemek çok kutsal bir amaçtır!" },
    { name: "Oktay Sinanoğlu", title: "Türk Aynştaynı 🧪", emoji: "🧪", story: "Dünyanın en genç yaşta profesör olan kimyacılarından biridir. Türkçe dilinin korunması ve bilim dili olması için büyük mücadele verdi.", quote: "Kendi dilini bilmeyen, bilim üretemez.", lesson: "Türkçe dilini doğru kullanmak ve bilimi kendi dilinde öğrenmek başarıyı getirir!" },
    { name: "Feryal Özel", title: "Astrofizikçi 🌌", emoji: "🌌", story: "NASA'da çalışan ve tarihte ilk kez bir karadeliğin fotoğrafını çeken Event Horizon Teleskobu ekibinde yer alan harika astrofizikçimizdir.", quote: "Bilinmezi aramak insanın en büyük dürtüsüdür.", lesson: "Uzay mühendisliği ve astrofizik alanında sınırları zorlayıp yeni galaksiler keşfedebilirsin!" },
    { name: "Mete Atatüre", title: "Işığın Sesini Ölçen Fizikçi 💡", emoji: "💡", story: "Cambridge Üniversitesi'nde profesördür. Işığın gürültü seviyesini (sesini) ölçmeyi başararak kuantum fiziğinde devrim yapmıştır.", quote: "Merak, tüm bilim kapılarını açan anahtardır.", lesson: "Fizik dünyasındaki gizemleri çözmek için merakının peşinden git!" },
    { name: "Uğur Şahin", title: "mRNA Aşısı Mucidi 💉", emoji: "💉", story: "Eşi Özlem Türeci ile birlikte mRNA teknolojisini geliştirerek COVID-19 salgınına karşı ilk başarılı aşıyı üreten ve milyonlarca insanı kurtaran bilim insanıdır.", quote: "Bilim ve işbirliği, en büyük krizleri çözer.", lesson: "Tıp ve biyoloji alanında yapacağın araştırmalar küresel sorunları çözebilir!" },
    { name: "Özlem Türeci", title: "Kanser ve Aşı Araştırmacısı 🧬", emoji: "🧬", story: "Eşi Uğur Şahin ile Biontech firmasını kurarak tıp dünyasında devrim yapan bağışıklık sistemi tedavileri ve aşılar geliştirmiştir.", quote: "Araştırma, bilinmeyeni anlamak için sabırla çalışmaktır.", lesson: "Zorluklar karşısında sabırla araştırma yapmaya devam et!" },
    { name: "Jane Goodall", title: "Doğal Hayat Kaşifi 🐒", emoji: "🐒", story: "Yıllarca Afrika ormanlarında yaşayarak şempanzelerin de insanlar gibi alet kullanabildiğini ve duyguları olduğunu keşfetti.", quote: "Her birey bir fark yaratır, önemli olan ne tür bir fark yarattığınızdır.", lesson: "Doğayı ve hayvanları korumak, onları anlamak dünyamızı güzelleştirir!" },
    { name: "Rosalind Franklin", title: "DNA'nın Yapısını Fotoğraflayan Kimyager 🧬", emoji: "🧬", story: "X-ışınları kullanarak DNA'nın sarmal (çift sarmal) yapısının ilk net fotoğrafını çekti ve genetik bilimine en büyük katkıyı sundu.", quote: "Bilim ve günlük yaşam birbirinden ayrılamaz.", lesson: "Görünmeyeni görünür kılmak için kimya ve fizik laboratuvarlarında çalışmak harikadır!" },
    { name: "Richard Feynman", title: "Kuantum Fiziği Dehası 💡", emoji: "💡", story: "Kuantum elektrodinamiğini geliştirdi. Karmaşık fizik konularını herkesin anlayacağı basitlikte anlatmasıyla ünlüdür.", quote: "Bir şeyi basitçe açıklayamıyorsanız, onu anlamamışsınızdır.", lesson: "Öğrendiğin konuları arkadaşlarına basitçe anlatarak daha iyi kavrayabilirsin!" },
    { name: "Carl Sagan", title: "Kozmos Elçisi ☄️", emoji: "☄️", story: "Voyager uzay araçlarına insanlığın mesajını taşıyan altın plakları koydu. 'Kozmos' belgeseliyle milyonlarca çocuğa uzayı sevdirdi.", quote: "Bir yerlerde inanılmaz bir şey keşfedilmeyi bekliyor.", lesson: "Evrenin derinliklerini merak et, astronomi kitapları oku ve yıldızları hayal et!" },
    { name: "Grace Hopper", title: "Yazılım Dillerinin Öncüsü 🐞", emoji: "🐞", story: "İlk derleyiciyi (compiler) yazdı. Bilgisayara sıkışan bir güve böceğini bulup çıkartarak bilgisayar hatalarına 'Bug' (böcek) denmesini sağladı.", quote: "İzin istemek, af dilemekten daha zordur.", lesson: "Yazılım hatalarını çözmek sabır ve dikkat ister, sen de bu dikkati göster!" },
    { name: "Benjamin Franklin", title: "Paratonerin Mucidi ⚡", emoji: "⚡", story: "Fırtınalı bir günde uçurtma uçurarak yıldırımların elektrik taşıdığını kanıtladı. Binaları koruyan paratoneri icat etti.", quote: "Yatırım yapılan bilgi, en yüksek faizi getirir.", lesson: "Deneyler yaparken dikkatli ol ama doğanın güçlerini anlamaktan vazgeçme!" },
    { name: "Robert Hooke", title: "Hücreyi Keşfeden Bilim İnsanı 🔬", emoji: "🔬", story: "Mikroskobu geliştirerek mantar tıpasını inceledi ve gördüğü küçük odacıklara 'Hücre' (Cell) adını vererek biyolojide çığır açtı.", quote: "Küçük şeyler, büyük sırların anahtarıdır.", lesson: "Mikroskop altında bambaşka bir mikroskobik dünya var, biyoloji bilimini mutlaka keşfet!" },
    { name: "Karl Benz", title: "Modern Otomobilin Mucidi 🚗", emoji: "🚗", story: "Benzinli motorla çalışan ilk modern otomobili icat etti. Eşi Bertha Benz ise bu arabayla ilk uzun yolculuğu yaparak arabayı tanıttı.", quote: "İlk adım, yolun yarısıdır.", lesson: "Tekerlekli araçları, mekanik tasarımları Benz gibi hayal ederek işe koyul!" },
    { name: "Robert Boyle", title: "Gaz Kanunlarının Kaşifi 🧪", emoji: "🧪", story: "Gazların basıncı ile hacmi arasındaki ilişkiyi buldu (Boyle Kanunu). Kimyayı simyadan ayırıp modern bir bilim haline getiren öncülerdendir.", quote: "Bilimsel gerçek, denenebilir olandır.", lesson: "Deneyler ve gözlemler yaparak hipotezlerini kanıtlamayı öğren!" },
    { name: "John Dalton", title: "Atom Teorisinin Kurucusu ⚛️", emoji: "⚛️", story: "Maddelerin bölünemez küçük kürelerden yani 'Atom'lardan oluştuğunu öne süren ilk modern teoriyi yazdı. Ayrıca renk körlüğünü (Daltonizm) açıkladı.", quote: "Atomlar, evrenin temel yapı taşlarıdır.", lesson: "Maddelerin iç yapısını, kimyasal bağları merak ederek Dalton'un izinden git!" },
    { name: "Ernest Rutherford", title: "Çekirdek Fiziğinin Babası ⚛️", emoji: "⚛️", story: "Atomun ortasında pozitif yüklü çok küçük bir 'Çekirdek' olduğunu altın levha deneyiyle keşfetti. Atomu Güneş sistemine benzetti.", quote: "Fizik dışındaki tüm bilimler pul koleksiyonculuğudur.", lesson: "Atomun içindeki devasa enerjiyi ve kuantum dünyasını keşfetmek harika bir maceradır!" },
    { name: "Niels Bohr", title: "Atom Modeli ve Kuantum Fizikçisi ⚛️", emoji: "⚛️", story: "Elektronların çekirdek etrafında belirli yörüngelerde dolandığını keşfetti. Bohr Atom Modeli'ni geliştirerek Nobel kazandı.", quote: "Kuantum fiziği kafanızı karıştırmadıysa, onu henüz anlamamışsınızdır.", lesson: "Karmaşık konular zihnini zorlayabilir, bu senin daha çok öğrendiğini gösterir!" },
    { name: "Max Planck", title: "Kuantum Teorisinin Kurucusu 💡", emoji: "💡", story: "Enerjinin sürekli değil, küçük paketçikler (kuantum) halinde yayıldığını keşfederek kuantum fiziğinin temelini attı. Nobel kazandı.", quote: "Bilim, doğanın sırlarını çözme sanatıdır.", lesson: "Doğayı en küçük parçacıklarına kadar anlamak için fiziğe merak duy!" },
    { name: "Werner Heisenberg", title: "Belirsizlik İlkesinin Kaşifi 🧠", emoji: "🧠", story: "Kuantum dünyasında bir elektronun hem yerini hem de hızını aynı anda kesin olarak ölçemeyeceğimizi (Belirsizlik İlkesi) kanıtladı.", quote: "Gözlemlediğimiz şey doğanın kendisi değil, bizim sorgulama tarzımıza maruz kalan doğadır.", lesson: "Bilimde her zaman kesinlik yoktur, olasılıkları ve belirsizlikleri yönetmeyi öğren!" },
    { name: "Erwin Schrödinger", title: "Schrödinger'in Kedisi Mucidi 🐱", emoji: "🐱", story: "Kuantum mekaniğinde dalga denklemini buldu. Kuantum durumlarını anlatmak için ünlü 'Schrödinger'in Kedisi' düşünce deneyini tasarladı.", quote: "Şimdiki zaman, başlangıcı ve sonu olmayan tek gerçektir.", lesson: "Zihinsel düşünce deneyleri yapmak, hayal gücünü ve problem çözme yeteneğini geliştirir!" },
    { name: "Enrico Fermi", title: "İlk Nükleer Reaktörün Mucidi ⚛️", emoji: "⚛️", story: "Chicago Üniversitesi'nin altında dünyanın ilk yapay nükleer reaktörünü kurdu. Kontrollü nükleer zincirleme reaksiyonu başlattı.", quote: "Bilim insanı, bilinmeyen yollarda yürüyen kaşiftir.", lesson: "Nükleer fizik ve temiz enerji teknolojileri geleceğin en önemli konularındandır!" },
    { name: "J. Robert Oppenheimer", title: "Atom Bombası Projesinin Lideri ⚛️", emoji: "⚛️", story: "Manhattan Projesi'nin bilimsel liderliğini yaptı. İlk atom bombasını geliştirdi ancak daha sonra nükleer silahların yayılmasına karşı çıktı.", quote: "Şimdi ben ölüm oldum, dünyaların yok edicisi.", lesson: "Bilimin gücünü her zaman insanlığın barışı, sağlığı ve iyiliği için kullanmalıyız!" },
    { name: "Linus Pauling", title: "Kimyasal Bağların Öncüsü ⚗️", emoji: "⚗️", story: "Kimyasal bağların yapısını açıkladığı için Nobel Kimya Ödülü aldı. Nükleer denemelere karşı çıktığı için de Nobel Barış Ödülü alarak iki farklı alanda tek başına Nobel kazanan tek kişi oldu.", quote: "En iyi fikir bulmanın yolu, çok sayıda fikir üretmektir.", lesson: "Problem çözerken aklına gelen tüm fikirleri yaz, en iyisini deneme yanılmayla bulursun!" },
    { name: "James Watson", title: "DNA Sarmalının Kaşifi 🧬", emoji: "🧬", story: "Francis Crick ile birlikte DNA'nın 'Çift Sarmal' yapısının modelini oluşturdular ve genetik kodun sırrını çözdüler.", quote: "DNA, yaşamın tarif kitabıdır.", lesson: "Biyoloji ve genetik kodları öğrenerek geleceğin biyoteknoloji uzmanı olabilirsin!" },
    { name: "Francis Crick", title: "Moleküler Biyoloji Öncüsü 🧬", emoji: "🧬", story: "James Watson ve Rosalind Franklin'in verileri yardımıyla DNA modelini kurarak yaşamın en küçük bilgi depolama sistemini aydınlattı.", quote: "Bilim, doğanın şifrelerini çözmektir.", lesson: "Yaşamın temelindeki kodları incelemek biyolojiyle başlar!" },
    { name: "Charles Babbage", title: "Bilgisayarın Tasarımcısı ⚙️", emoji: "⚙️", story: "İlk mekanik programlanabilir bilgisayar tasarımını (Fark Motoru ve Analitik Motor) yaptı. Bilgisayarların atası kabul edilir.", quote: "Hataları önlemek, onları düzeltmekten daha kolaydır.", lesson: "Matematiksel mantığı iyi kavrarsan, bilgisayarların nasıl çalıştığını çok kolay çözersin!" },
    { name: "Claude Shannon", title: "Bilgi Teorisinin Kurucusu 🔌", emoji: "🔌", story: "Bilgiyi 0 ve 1'lere (bit) dönüştürerek dijital iletişimin temelini attı. Kriptografi ve yapay zeka üzerine ilk çalışmaları yaptı.", quote: "Bilgi, belirsizliği azaltan şeydir.", lesson: "Bugün internetten gönderdiğin her mesaj, Shannon'ın 0 ve 1 mantığı sayesinde hedefine ulaşıyor!" },
    { name: "Robert Noyce", title: "Mikroçip Mucidi 🪙", emoji: "🪙", story: "Silikon üzerine transistörleri yerleştirerek entegre devreyi (mikroçipi) icat etti ve Intel firmasını kurdu.", quote: "Yenilik, eski kuralları çiğnemektir.", lesson: "Telefonların ve bilgisayarların içindeki o minik çiplerin nasıl yapıldığını merak et ve araştır!" },
    { name: "Gordon Moore", title: "Moore Kanunu Tahmincisi 📈", emoji: "📈", story: "Intel'in kurucularındandır. Mikroçiplerin üzerindeki transistör sayısının her iki yılda bir iki katına çıkacağını tahmin etti.", quote: "Teknoloji hızla küçülüyor ve güçleniyor.", lesson: "Teknolojinin baş döndürücü hızına ayak uydurmak için her gün yeni bir şey öğrenmelisin!" },
    { name: "Dennis Ritchie", title: "C Programlama Dilinin Yaratıcısı 💻", emoji: "💻", story: "Modern yazılımların temeli olan C programlama dilini ve Unix işletim sistemini yazdı. Bugün tüm işletim sistemleri onun kodları üzerine kuruludur.", quote: "C dili, bilgisayarı kontrol etmenin en saf yoludur.", lesson: "Yazılımcı olmak istiyorsan, programlama dillerinin atası olan C dilini mutlaka öğren!" },
    { name: "Linus Torvalds", title: "Linux Çekirdeği Yaratıcısı 🐧", emoji: "🐧", story: "Dünyanın en büyük açık kaynaklı işletim sistemi çekirdeği olan Linux'u yazdı ve ücretsiz paylaştı. Ayrıca 'Git' sistemini geliştirdi.", quote: "Konuşmak ucuzdur, bana kodu göster.", lesson: "Yazılım projelerini tüm dünya ile paylaşarak açık kaynak dünyasına sen de katkı sunabilirsin!" },
    { name: "Vint Cerf", title: "İnternetin Protokol Babası 🌐", emoji: "🌐", story: "Bob Kahn ile birlikte bilgisayarların internette birbiriyle konuşmasını sağlayan TCP/IP protokolünü icat etti.", quote: "İnternet, insanların fikirlerini özgürce paylaştığı küresel bir ağdır.", lesson: "Ağ teknolojilerini öğrenerek sistem mühendisliği alanına adım at!" },
    { name: "James Clerk Maxwell", title: "Elektromanyetik Teorinin Kurucusu ⚡", emoji: "⚡", story: "Elektrik ve manyetizmayı birleştiren Maxwell Denklemleri'ni yazdı. Işığın da bir elektromanyetik dalga olduğunu kanıtladı.", quote: "Matematik, doğanın gizli kalmış melodisidir.", lesson: "Elektrik, radyo dalgaları, Wi-Fi ve ışık Maxwell'in denklemleri sayesinde bugün hayatımızda!" },
    { name: "Heinrich Hertz", title: "Radyo Dalgalarının Kaşifi 📻", emoji: "📻", story: "Maxwell'in teorisini kanıtlamak için ilk kez yapay radyo dalgaları üretti ve bunları tespit etti. Frekans birimi (Hertz - Hz) onun adıdır.", quote: "Bilimsel kanıt, teorinin tacıdır.", lesson: "Wi-Fi hızlarında gördüğün GHz ve MHz terimleri, Hertz'in bulduğu radyo dalgalarının frekansıdır!" },
    { name: "Wilhelm Röntgen", title: "Röntgen Işınlarının Mucidi 🩻", emoji: "🩻", story: "Laboratuvarda çalışırken nesnelerin içinden geçebilen yeni bir ışın keşfetti. İlk Nobel Fizik Ödülü'nü aldı.", quote: "Bilinmeyen ışınlara X-ışını adını verdim.", lesson: "Hastanelerde kırık kemiklerimize bakmak için kullanılan röntgen cihazları Wilhelm'in bu keşfidir!" },
    { name: "Arthur Compton", title: "Işığın Saçılması Kaşifi 💡", emoji: "💡", story: "X-ışınlarının elektronlarla çarpışıp saçılmasını (Compton Etkisi) keşfederek ışığın hem dalga hem de parçacık gibi davrandığını kanıtladı.", quote: "Bilim her zaman kendini günceller.", lesson: "Işığın gizemli dünyasını kuantum fiziğiyle keşfetmek en heyecanlı çalışmalardandır!" },
    { name: "Louis de Broglie", title: "Dalga-Parçacık İkiliği Kaşifi 🌊", emoji: "🌊", story: "Tüm maddelerin (özellikle elektronların) bir dalga boyuna sahip olduğunu öne sürdü. Dalga mekaniğinin temelini attı.", quote: "Her madde bir dalga melodisi taşır.", lesson: "Fizik dünyasındaki dalga hareketlerini ve dalga mekaniğini öğrenerek ufkunu genişlet!" },
    { name: "Wolfgang Pauli", title: "Dışarlama İlkesi Kaşifi ⚛️", emoji: "⚛️", story: "Aynı atom içindeki iki elektronun tüm kuantum durumlarının aynı olamayacağını (Pauli Dışarlama İlkesi) keşfetti.", quote: "Bu sadece yanlış değil, hatta yanlış bile değil.", lesson: "Bilimsel düşüncede netlik ve mantık her şeydir, iddialarını kanıtlara dayandır!" },
    { name: "Paul Dirac", title: "Antimaddenin Kaşifi 🌌", emoji: "🌌", story: "Kuantum mekaniği ile görelilik teorisini birleştiren Dirac Denklemi'ni yazdı ve matematiksel olarak 'Antimadde'nin varlığını öngördü.", quote: "Fizikteki yasalar matematiksel güzelliğe sahip olmalıdır.", lesson: "Matematiksel denklemlerin evrendeki görünmez maddeleri nasıl öngördüğünü fark et!" },
    { name: "James Chadwick", title: "Nötronun Kaşifi ⚛️", emoji: "⚛️", story: "Atom çekirdeğindeki yüksüz parçacık olan 'Nötron'u keşfetti. Bu keşif nükleer enerjinin yolunu açtı.", quote: "Gerçeği aramak, sabır ve deney gerektirir.", lesson: "Atomun yapısını nötron, proton ve elektron olarak öğrenmek fizik temeli için çok önemlidir!" },
    { name: "Murray Gell-Mann", title: "Kuarkların Kaşifi ⚛️", emoji: "⚛️", story: "Proton ve nötronların daha küçük temel parçacıklar olan 'Kuark'lardan oluştuğunu keşfetti. Parçacık fiziğini sınıflandırdı.", quote: "Kuarklar, atomun da altındaki gizli tuğlalardır.", lesson: "Protonun bile bölünemez olmadığını, içinde kuarklar olduğunu bilerek kuantum fiziğine adım at!" },
    { name: "Peter Higgs", title: "Higgs Bozonu Kaşifi ⚛️", emoji: "⚛️", story: "Parçacıklara kütlelerini kazandıran Higgs alanını ve bu alanın parçacığı olan Higgs Bozonu'nu öngördü. CERN'de bu parçacık kanıtlandı.", quote: "Teorinin gerçeğe dönüşmesini görmek büyüleyici.", lesson: "CERN laboratuvarındaki devasa parçacık hızlandırıcıları ve yapılan deneyleri araştır!" },
    { name: "Roger Penrose", title: "Karadelik Matematikçisi 📐", emoji: "📐", story: "Albert Einstein'ın genel görelilik teorisinden yola çıkarak karadeliklerin oluşumunun kaçınılmaz olduğunu matematiksel olarak kanıtladı.", quote: "Matematik, fiziksel gerçekliğin arkasındaki gizli güçtür.", lesson: "Matematiğin karadelikler gibi devasa uzay oluşumlarını bile nasıl açıkladığını gör!" },
    { name: "Donna Strickland", title: "Lazer Teknolojisi Mucidi ⚡", emoji: "⚡", story: "Çok yüksek yoğunluklu ve ultra kısa lazer darbeleri üretme yöntemini geliştirerek tıp ve sanayide lazer devrimi yaptı.", quote: "Lazerler, ışığın odaklanmış en güçlü halidir.", lesson: "Göz ameliyatlarında, barkod okuyucularda kullanılan lazer teknolojisinin arkasındaki fiziği öğren!" },
    { name: "Arthur Ashkin", title: "Optik Cımbızların Mucidi 🔬", emoji: "🔬", story: "Lazer ışınlarını kullanarak virüsleri, bakterileri ve hücreleri zarar vermeden yakalayıp hareket ettirebilen 'Optik Cımbızlar'ı icat etti.", quote: "Işıkla maddeleri hareket ettirmeyi başardık.", lesson: "Işığın fiziksel bir itme kuvveti olduğunu bilmek ve onunla hücreleri tutmak harika bir mühendisliktir!" },
    { name: "Giorgio Parisi", title: "Karmaşık Sistemlerin Kaşifi 🧠", emoji: "🧠", story: "Biyoloji, fizik ve iklim gibi karmaşık ve düzensiz sistemlerin içindeki gizli kuralları ve düzeni keşfetti.", quote: "Kaosun içinde bile gizli bir matematiksel düzen vardır.", lesson: "Karışık ve dağınık görünen durumların içindeki mantığı çözmek için analitik düşün!" },
    { name: "Alain Aspect", title: "Kuantum Dolanıklık Kanıtlayıcısı 📡", emoji: "📡", story: "Birbirinden çok uzakta olan iki kuantum parçacığının anında birbiriyle haberleşebildiğini deneylerle kanıtladı.", quote: "Kuantum bilgi teknolojileri geleceği şekillendirecek.", lesson: "Geleceğin kuantum bilgisayarlarını ve kablosuz kuantum iletişimini şimdiden merak et!" },
    { name: "Anne L'Huillier", title: "Attosaniye Fizikçisi 💡", emoji: "💡", story: "Elektronların atom içindeki hareketlerini izleyebilmek için saniyenin kentilyonda biri kadar kısa (attosaniye) ışık atımları üretti.", quote: "Işığın en hızlı anını yakaladık.", lesson: "Elektronların o inanılmaz hızlı hareketlerini izleyen bu ileri düzey teknolojileri araştır!" },
    { name: "Antoine Lavoisier", title: "Kimyanın Babası ⚗️", emoji: "⚗️", story: "Kütlenin korunumunu kanıtladı. Maddelerin oksijenle birleşerek yandığını buldu ve kimyayı modern bir bilim haline getirdi.", quote: "Doğada hiçbir şey kaybolmaz, her şey dönüşür.", lesson: "Çevrendeki değişimleri, kimyasal reaksiyonları Lavoisier gibi dikkatle gözlemle!" },
    { name: "Robert Oppenheimer", title: "Teorik Fizik Dehası 🧠", emoji: "🧠", story: "Karadeliklerin oluşumu ve kuantum mekaniği üzerine önemli teorik çalışmalar yaptı. Astrofiziğe büyük katkı sağladı.", quote: "Öğrenmek, bilginin derinliğine inmektir.", lesson: "Bilimsel araştırmalarında derinleşmekten ve detaylara odaklanmaktan keyif al!" },
    { name: "Guglielmo Marconi", title: "Radyonun Mucidi 📻", emoji: "📻", story: "Kablosuz sinyaller göndererek ilk radyoyu ve kablosuz telgrafı icat etti. İletişimi tüm dünyaya yaydı.", quote: "Uzaklar, sadece bağ kuramadığımız yerlerdir.", lesson: "Bilgiye ve sevdiklerine ulaşmak için teknolojinin gücünü akıllıca kullan!" },
    { name: "Bill Gates", title: "Microsoft Kurucusu 💻", emoji: "💻", story: "Windows işletim sistemini kurarak kişisel bilgisayarların her eve girmesini sağladı. Dünyanın en büyük yazılım firmasını yönetti.", quote: "Kendinizi kimseyle kıyaslamayın, yoksa kendinize hakaret edersiniz.", lesson: "Bilgisayarları sadece oyun için değil, yazılım ve üretim için kullan!" },
    { name: "Gregor Mendel", title: "Genetik Biliminin Kurucusu 🌱", emoji: "🌱", story: "Bezelyelerle yaptığı deneyler sayesinde canlıların kalıtsal özelliklerinin nesilden nesile nasıl aktarıldığını keşfetti.", quote: "Sabırlı gözlem, en büyük gerçeği ortaya çıkarır.", lesson: "Doğadaki ve bitkilerdeki düzeni Mendel gibi sabırla incelemeyi öğren." },
    { name: "Nicolaus Copernicus", title: "Gökbilimci ☀️", emoji: "☀️", story: "Dünya'nın evrenin merkezinde olmadığını, Güneş etrafında dönen gezegenlerden biri olduğunu bilimsel olarak kanıtladı.", quote: "Gerçeği aramak, zihnin en soylu arayışıdır.", lesson: "Genel kabulleri sorgulamaktan çekinme, bilim kanıtlarla ilerler!" },
    { name: "Rudolf Diesel", title: "Dizel Motor Mucidi 🚂", emoji: "🚂", story: "Çok daha yüksek basınçla çalışan ve daha verimli olan dizel motorları geliştirdi. Bugün ağır taşıtlar onun motorunu kullanır.", quote: "Verimlilik, doğaya saygıdır.", lesson: "Mühendislik ve motor teknolojilerine şimdiden ilgi duyup tasarımlar yapabilirsin!" },
    { name: "Blaise Pascal", title: "Pascal Üçgeni Kaşifi 📐", emoji: "📐", story: "Babasına vergi hesaplarında yardım etmek için ilk mekanik hesap makinesini (Pascaline) yaptı ve basınç kanunlarını buldu.", quote: "Matematik, insan zihninin en güzel ürünüdür.", lesson: "Matematiksel mantığı problem çözmede kullan!" },
    { name: "Michael Faraday", title: "Elektrik motorunun Mucidi ⚡", emoji: "⚡", story: "Elektromanyetik indüklemeyi keşfederek elektrik motorlarını ve jeneratörleri kullanılabilir hale getirdi.", quote: "Hayal et, dene, başarısız ol, tekrar dene.", lesson: "Faraday gibi merakının peşinden koşarak kendini sürekli eğit!" },
    { name: "Wright Kardeşler", title: "Uçuşun Öncüleri ✈️", emoji: "✈️", story: "Kendi yaptıkları motorlu ve yönlendirilebilir uçakla havadan ağır ilk kontrollü uçuşu gerçekleştirerek tarihe geçtiler.", quote: "Uçmak, rüzgara karşı direnmekle başlar.", lesson: "Büyük hedeflerine ulaşmak için Wright kardeşler gibi cesur ol!" },
    { name: "James Watt", title: "Buhar Makinesi Geliştiricisi ⚙️", emoji: "⚙️", story: "Buhar makinesinin verimliliğini artırarak fabrikalarda ve lokomotiflerde kullanılmasını sağladı, sanayi devrimini başlattı.", quote: "Güç, verimli kullanılan enerjidir.", lesson: "Enerjiyi ve zamanı verimli kullanmak başarının anahtarıdır!" },
    { name: "Celal Şengör", title: "Yerbilimci 🌍", emoji: "🌍", story: "Dünya çapında jeoloji araştırmaları yaptı. Levha tektoniği ve dağ oluşumları konularında en saygın bilim insanlarından biridir.", quote: "Bilim, gerçekleri arama sürecidir.", lesson: "Yer bilimlerine ve doğaya merak duyarak dünyamızı koru!" }
];

// Append remaining unique scientists to reach exactly 100 entries
const extraUnique = [
    { name: "Erwin Schrödinger", title: "Kuantum Fizikçisi 🐱", emoji: "🐱", story: "Kuantum dalga denklemini geliştirerek kuantum durumlarını açıklayan teoriyi kurdu.", quote: "Şimdiki zaman, tek gerçektir.", lesson: "Kuantum fiziği ile zihnini zorlamaya devam et!" },
    { name: "Richard Feynman", title: "Fizik Profesörü 💡", emoji: "💡", story: "Kuantum elektrodinamiği teorisiyle Nobel kazandı, nanoteknoloji fikrini ilk ortaya atan kişidir.", quote: "Öğrenmek, bilginin derinliğine inmektir.", lesson: "Bilim konularını eğlenceli ve basit şekilde öğren!" },
    { name: "Grace Hopper", title: "İlk Derleyici Mucidi 🐞", emoji: "🐞", story: "Yazılım dillerini makine diline çeviren ilk derleyiciyi geliştirerek yazılım dünyasında çığır açtı.", quote: "İzin istemek, af dilemekten kolaydır.", lesson: "Yazılım geliştirme yeteneğini her gün artır!" },
    { name: "Thomas Edison", title: "Ampulün ve Fonografın Mucidi 💡", emoji: "💡", story: "Kullanışlı elektrik ampulünü geliştirmek için binlerce deneme yaptı ve modern araştırma laboratuvarlarını kurdu.", quote: "Deha, %1 ilham ve %99 terdir.", lesson: "Hata yapmaktan korkma, her hata bir öğrenme sürecidir!" },
    { name: "Marie Curie", title: "Radyum Kaşifi 💡", emoji: "💡", story: "Polonyum ve Radyum elementlerini keşfederek iki farklı bilim dalında Nobel kazanan tek insan oldu.", quote: "Kendinize inanın ve cesur olun.", lesson: "Zorluklar karşısında asla vazgeçmeden çalışmaya devam et!" }
];

// Deduplicate and fill to exactly 100
const uniqueHeroes = [];
const seenNames = new Set();

// First add core heroes
for (const h of heroes) {
    if (!seenNames.has(h.name)) {
        seenNames.add(h.name);
        uniqueHeroes.push(h);
    }
}

// Then add from extraScientists
for (const h of extraScientists) {
    if (!seenNames.has(h.name)) {
        seenNames.add(h.name);
        uniqueHeroes.push(h);
    }
}

// Then add from extraUnique
for (const h of extraUnique) {
    if (!seenNames.has(h.name)) {
        seenNames.add(h.name);
        uniqueHeroes.push(h);
    }
}

// Fill up with more scientists if needed to guarantee at least 100
const genericScientists = [
    { name: "Daniel Bernoulli", title: "Akışkanlar Mekaniği Kaşifi 🌊", emoji: "🌊", story: "Sıvıların ve gazların akış hızları ile basınçları arasındaki ilişkiyi buldu. Uçak kanatlarının uçmasını sağlayan prensiptir.", quote: "Basınç ve hız, akışın dengesidir.", lesson: "Uçakların nasıl uçtuğunu Bernoulli prensibiyle öğren!" },
    { name: "Robert Koch", title: "Bakteriyoloji Kurucusu 🦠", emoji: "🦠", story: "Tüberküloz ve kolera gibi hastalıkların mikroplarını keşfetti. Tıpta hijyen ve mikrop teorisini geliştirdi.", quote: "Mikropları görmek, onları yenmenin ilk adımıdır.", lesson: "Hastalıklarla savaşta temizliğin önemini asla unutma!" },
    { name: "Joseph Fourier", title: "Sera Etkisi ve Matematikçi 📐", emoji: "📐", story: "Isı yayılımını matematiksel olarak formüle etti ve Dünya'nın atmosferi sayesinde sıcak kaldığını (sera etkisi) ilk fark eden kişi oldu.", quote: "Matematik, doğanın ısı dengesini açıklar.", lesson: "Atmosferin ve iklimin önemini Fourier'in çalışmalarıyla anla!" },
    { name: "Christian Doppler", title: "Doppler Etkisi Kaşifi 📡", emoji: "📡", story: "Ses ve ışık dalgalarının hareketli kaynaklardan yayıldığında frekansının nasıl değiştiğini (Doppler Etkisi) keşfetti.", quote: "Dalgalar, hareketin sesiyle şekillenir.", lesson: "Polis radarlarının ve ultrason cihazlarının nasıl çalıştığını öğren!" },
    { name: "Georg Ohm", title: "Ohm Kanunu Kaşifi ⚡", emoji: "⚡", story: "Elektrik devrelerinde voltaj, akım ve direnç arasındaki ilişkiyi (Ohm Kanunu) keşfederek elektrik mühendisliğinin temelini attı.", quote: "Direnç, akımın sınırıdır.", lesson: "Elektrikli cihazların içindeki devreleri Ohm kanunuyla anla!" },
    { name: "André-Marie Ampère", title: "Elektromanyetizmanın Öncüsü 🔌", emoji: "🔌", story: "Elektrik akımının manyetik alan oluşturduğunu keşfetti. Elektrik akım birimi olan Amper onun adını taşır.", quote: "Akım, manyetik gücün kaynağıdır.", lesson: "Elektrik motorlarının çalışma temelini Ampere ile öğren!" },
    { name: "Hans Christian Ørsted", title: "Elektromanyetizma Kaşifi ⚡", emoji: "⚡", story: "Telden geçen elektrik akımının pusula iğnesini saptırdığını tesadüfen fark ederek elektrik ile manyetizma arasındaki bağı buldu.", quote: "Doğadaki güçler birbirine bağlıdır.", lesson: "Tesadüfi gözlemleri bile bilimsel merakla incele!" },
    { name: "Gustav Kirchhoff", title: "Devre Kanunları Kaşifi 🔌", emoji: "🔌", story: "Elektrik devrelerindeki akım ve voltaj dağılımını açıklayan Kirchhoff Kanunları'nı buldu. Ayrıca spektroskopiyi geliştirdi.", quote: "Giren akım, çıkan akıma eşittir.", lesson: "Karışık elektrik devrelerinin Kirchhoff ile nasıl çözüldüğünü gör!" },
    { name: "Ludwig Boltzmann", title: "Termodinamik ve Entropi Öncüsü 🌡️", emoji: "🌡️", story: "Maddelerin atomik hareketlerine göre sıcaklık ve entropiyi istatistiksel olarak açıkladı. Termodinamik kanunlarını geliştirdi.", quote: "Entropi, evrenin düzensizlik eğilimidir.", lesson: "Isı ve enerjinin doğadaki hareketlerini Boltzmann ile öğren!" },
    { name: "James Prescott Joule", title: "Enerjinin Korunumu Kaşifi 🌡️", emoji: "🌡️", story: "Mekanik enerjinin ısıya dönüştüğünü kanıtladı ve enerjinin yok edilemeyeceğini gösterdi. Enerji birimi Joule onun adıdır.", quote: "Enerji asla kaybolmaz, sadece dönüşür.", lesson: "Koştuğunda vücudunun nasıl ısı ürettiğini Joule ile anla!" },
    { name: "Lord Kelvin (William Thomson)", title: "Mutlak Sıfır Kaşifi 🌡️", emoji: "🌡️", story: "Sıcaklığın en alt sınırı olan mutlak sıfırı (-273.15°C) hesapladı. Kelvin sıcaklık ölçeğini geliştirdi.", quote: "Ölçemediğiniz şeyi geliştiremezsiniz.", lesson: "Evrenin en soğuk halini Kelvin ile keşfet!" },
    { name: "Christiaan Huygens", title: "Işığın Dalga Teorisi Kaşifi 🌊", emoji: "🌊", story: "Işığın dalgalar halinde yayıldığını öne sürdü. Ayrıca sarkaçlı saati icat etti ve Satürn'ün uydusu Titan'ı keşfetti.", quote: "Işık, evrenin dalga dansıdır.", lesson: "Saatlerin çalışma mekanizmalarını Huygens ile öğren!" },
    { name: "Robert Bunsen", title: "Bunsen Beki ve Spektroskopi Mucidi 🧪", emoji: "🧪", story: "Laboratuvarlarda kullanılan gaz ocağını (Bunsen Beki) yaptı. Elementlerin yandığında çıkardığı ışık renkleriyle kimyasal analiz yaptı.", quote: "Işık renkleri, elementlerin imzasıdır.", lesson: "Kimya laboratuvarlarında deneyler yaparken Bunsen'in izini gör!" },
    { name: "Antoine Henri Becquerel", title: "Radyoaktivite Kaşifi 💡", emoji: "💡", story: "Uranyum elementinin kendiliğinden ışın yaydığını tesadüfen karanlık çekmecede fark ederek doğal radyoaktiviteyi keşfetti. Nobel aldı.", quote: "Doğa, görünmeyen enerjiler barındırır.", lesson: "Çekmecedeki tesadüflerle gelen Nobel ödüllü keşifleri araştır!" },
    { name: "Ernest Rutherford", title: "Radyoaktif Bozunma Kaşifi ⚛️", emoji: "⚛️", story: "Alfa, beta ve gama ışınlarını tanımladı. Radyoaktif elementlerin zamanla başka elementlere dönüştüğünü keşfetti.", quote: "Bilim, gerçeklerin peşinden sabırla gitmektir.", lesson: "Maddelerin çekirdek düzeyindeki değişimlerini Rutherford ile anla!" },
    { name: "Henri Moissan", title: "Flor Elementinin Mucidi 🧪", emoji: "🧪", story: "Çok tehlikeli ve reaktif olan flor gazını izole etmeyi başardı. Ayrıca ilk elektrik ark fırınını yaptı. Nobel kazandı.", quote: "Flor, kimyanın en vahşi elementidir.", lesson: "Diş macunlarında kullanılan florun nasıl keşfedildiğini öğren!" },
    { name: "Alfred Nobel", title: "Dinamitin Mucidi ve Nobel Vakfı Kurucusu 💣", emoji: "💣", story: "Güvenli patlayıcı olan dinamiti icat etti. Servetini, insanlığa faydalı bilim insanlarına ödül olarak verilmesi için bağışladı.", quote: "Bilim, insanlığın ortak mirasıdır.", lesson: "Nobel ödüllerinin arkasındaki Alfred Nobel'in hikayesini öğren!" },
    { name: "Svante Arrhenius", title: "Asit-Baz Teorisi ve İklim Öncüsü 🧪", emoji: "🧪", story: "Suda çözünen maddelerin iyonlaştığını kanıtladı. Karbondioksitin sera etkisini hesaplayarak küresel ısınmayı tahmin etti.", quote: "Asitler ve bazlar, kimyanın dengesidir.", lesson: "Kimyasal reaksiyonları ve sera etkisini Arrhenius ile anla!" },
    { name: "J.J. Thomson", title: "Elektronun Kaşifi ⚛️", emoji: "⚛️", story: "Katot ışınlarıyla yaptığı deneylerde atomun içinde negatif yüklü elektronların olduğunu keşfetti. Üzümlü kek atom modelini sundu.", quote: "Atom, bölünemez bir bütün değildir.", lesson: "Elektrik akımını taşıyan elektronların keşfini Thomson ile öğren!" },
    { name: "Robert Millikan", title: "Elektron Yükünü Ölçen Fizikçi ⚛️", emoji: "⚛️", story: "Yağ damlası deneyiyle bir tek elektronun taşıdığı elektrik yükünü inanılmaz bir hassasiyetle ölçmeyi başardı. Nobel aldı.", quote: "Yağ damlaları, atomun yükünü gösterdi.", lesson: "Hassas ve sabırlı deneyler yapmanın gücünü Millikan ile gör!" },
    { name: "Jean Baptiste Perrin", title: "Atomların Gerçekliğini Kanıtlayan Fizikçi ⚛️", emoji: "⚛️", story: "Sedimantasyon dengesini inceleyerek Einstein'ın teorilerini doğruladı ve atomların varlığını kesin olarak kanıtladı. Nobel aldı.", quote: "Madde, bölünemez taneciklerden oluşur.", lesson: "Gözle görülmeyen atomların varlığını kanıtlayan Perrin'in izini sür!" },
    { name: "Theodor Svedberg", title: "Ultrasantrifüj Mucidi 🧪", emoji: "🧪", story: "Çok yüksek hızlarda dönen ultrasantrifüj cihazını icat ederek proteinlerin ve büyük moleküllerin ağırlığını ölçtü. Nobel aldı.", quote: "Hız, molekülleri birbirinden ayırır.", lesson: "Biyoloji ve kimyada kullanılan santrifüjlerin nasıl çalıştığını öğren!" },
    { name: "Harold Urey", title: "Döteryum (Ağır Hidrojen) Kaşifi 🧪", emoji: "🧪", story: "Hidrojenin izotopu olan döteryumu keşfetti. Miller-Urey deneyiyle ilkel dünyada yaşamın temel taşlarının nasıl oluştuğunu araştırdı.", quote: "Yaşamın kökenleri, kimyasal bağlarda saklıdır.", lesson: "Uzayda ve dünyada yaşamın başlangıcını Urey ile merak et!" },
    { name: "Otto Hahn", title: "Nükleer Fizyonun Kaşifi ⚛️", emoji: "⚛️", story: "Uranyum atomunun çekirdeğini nötronlarla vurarak ikiye bölmeyi (fisyon) başardı ve devasa nükleer enerjiyi açığa çıkardı. Nobel aldı.", quote: "Çekirdek bölündü, yeni bir çağ başladı.", lesson: "Nükleer santrallerde elektrik üreten fisyon reaksiyonunu Hahn ile öğren!" },
    { name: "Edwin McMillan & Glenn Seaborg", title: "Transuranyum Elementlerin Kaşifleri 🧪", emoji: "🧪", story: "Uranyumdan daha ağır olan Plütonyum, Neptünyum gibi yapay elementleri sentezlediler. Periyodik tabloyu genişlettiler. Nobel aldılar.", quote: "Yeni elementler, laboratuvarda doğar.", lesson: "Periyodik tablodaki yapay elementlerin Seaborg ile nasıl yapıldığını gör!" },
    { name: "Sir William Ramsay", title: "Soygazların Kaşifi 🧪", emoji: "🧪", story: "Helyum, Neon, Argon, Kripton ve Ksenon gibi havadaki soygazları keşfederek periyodik tabloya tamamen yeni bir grup ekledi. Nobel aldı.", quote: "Soygazlar, kimyanın en asil ve sakin üyeleridir.", lesson: "Balonları uçuran helyumun ve neon lambalarının Ramsay ile keşfini öğren!" },
    { name: "Henri Moissan", title: "Yapay Elmas Mucidi 💎", emoji: "💎", story: "Yüksek sıcaklık ve basınç altında karbonu eritmeye çalışarak ilk yapay elmas denemelerini gerçekleştirdi.", quote: "Baskı altında karbon, elmasa dönüşür.", lesson: "Doğadaki elmasların yerin altında nasıl oluştuğunu Moissan ile gör!" },
    { name: "Johannes Diderik van der Waals", title: "Moleküller Arası Kuvvet Kaşifi 🧪", emoji: "🧪", story: "Moleküller arasındaki zayıf çekim kuvvetlerini (Van der Waals kuvvetleri) formüle ederek gazların sıvılaşmasını açıkladı.", quote: "Zayıf bağlar, büyük yapıları bir arada tutar.", lesson: "Kertenkelelerin (geko) duvara nasıl yapışıp tırmandığını Waals kuvvetleriyle öğren!" },
    { name: "Kamerlingh Onnes", title: "Süperiletkenliğin Kaşifi 🔌", emoji: "🔌", story: "Helyumu sıvılaştırarak mutlak sıfıra yaklaştı ve cıvanın elektrik direncini tamamen kaybettiğini (süperiletkenlik) keşfetti. Nobel aldı.", quote: "Sıfır direnç, kesintisiz enerjidir.", lesson: "Hızlı giden trenlerin (Maglev) süperiletken mıknatıslarla nasıl çalıştığını öğren!" },
    { name: "Victor Francis Hess", title: "Kozmik Işınların Kaşifi 🌌", emoji: "🌌", story: "Balonla gökyüzüne çıkarak radyasyon seviyesinin yukarılarda arttığını gördü ve uzaydan gelen kozmik ışınları keşfetti. Nobel aldı.", quote: "Uzaydan gelen görünmez ışınlar Dünya'yı sarar.", lesson: "Uzay fiziğine ve kozmik ışınlara Hess ile ilgi duy!" },
    { name: "Charles Edouard Guillaume", title: "İnvar Alaşımı Mucidi ⚙️", emoji: "⚙️", story: "Sıcaklıkla genleşmeyen nikel-çelik alaşımını (İnvar) icat ederek hassas saatlerin ve sarkaçların bozulmadan çalışmasını sağladı. Nobel aldı.", quote: "Zaman, hassas ölçümlerle korunur.", lesson: "Sarkaçlı saatlerin ve hassas cihazların alaşımlarını Guillaume ile keşfet!" },
    { name: "Albert Michelson", title: "Işık Hızını Ölçen Fizikçi 💡", emoji: "💡", story: "Işık hızını inanılmaz bir hassasiyetle ölçtü. Michelson-Morley deneyiyle uzayda 'eter' maddesinin olmadığını kanıtladı. Nobel aldı.", quote: "Işığın hızı, evrenin en büyük limitidir.", lesson: "Işığın saniyede 300.000 kilometre gittiğini Michelson ile öğren!" },
    { name: "Robert Andrews Millikan", title: "Fotoelektrik Etkiyi Kanıtlayan Fizikçi 💡", emoji: "💡", story: "Einstein'ın fotoelektrik teorisini deneylerle doğruladı ve Planck sabitini hassas olarak ölçtü. Nobel Fizik Ödülü aldı.", quote: "Işık, elektronları hareket ettirir.", lesson: "Güneş panellerinin elektrik üretme mantığını Millikan ile öğren!" },
    { name: "Arthur Holly Compton", title: "X-Işını Saçılması Kaşifi 💡", emoji: "💡", story: "X-ışınlarının elektronlarla çarpıştığında enerji kaybetmesini gözlemleyerek ışığın foton karakterini kanıtladı. Nobel aldı.", quote: "Çarpışan ışık, parçacık gibi davranır.", lesson: "Kuantum fiziğinde ışığın gizemlerini Compton ile çöz!" },
    { name: "Owen Willans Richardson", title: "Termiyonik Emisyon Kaşifi 🔌", emoji: "🔌", story: "Sıcak metallerin elektron yaydığını keşfetti (Richardson Kanunu). Eski televizyon ve radyolardaki vakum tüplerinin temelidir. Nobel aldı.", quote: "Isınan katot, elektron akışı başlatır.", lesson: "Eski tüplü televizyonların çalışma prensibini Richardson ile öğren!" },
    { name: "Werner Heisenberg", title: "Kuantum Mekaniği Kurucusu 🧠", emoji: "🧠", story: "Matris mekaniğini geliştirerek kuantum mekaniğini matematiksel olarak formüle etti. Belirsizlik İlkesini yazdı. Nobel aldı.", quote: "Belirsizlik, kuantum dünyasının kuralıdır.", lesson: "Geleceğin kuantum bilgisayarlarının Heisenberg ile nasıl başladığını gör!" },
    { name: "Paul Dirac", title: "Kuantum Mekaniği Geliştiricisi 🌌", emoji: "🌌", story: "Dirac denklemini yazarak elektronun spinini ve antimaddesini matematiksel güzellikle açıkladı. Nobel Fizik Ödülü aldı.", quote: "Matematik, fizikteki en güzel rehberdir.", lesson: "Matematiğin fizik dünyasındaki estetik gücünü Dirac ile keşfet!" },
    { name: "James Chadwick", title: "Nötron Kaşifi ⚛️", emoji: "⚛️", story: "Atom çekirdeğindeki yüksüz parçacık nötronu bularak nükleer fizik çağını başlatan en önemli keşiflerden birini yaptı. Nobel aldı.", quote: "Yüksüz tanecik, çekirdeğin dengesidir.", lesson: "Çekirdekteki nötronların atom ağırlığındaki rolünü Chadwick ile öğren!" },
    { name: "Victor Franz Hess", title: "Kozmik Radyasyon Kaşifi 🌌", emoji: "🌌", story: "Kozmik ışınların atmosfer dışından, derin uzaydan geldiğini balon uçuşu deneyleriyle kanıtlayarak Nobel Fizik Ödülü aldı.", quote: "Uzaydan gelen radyasyon evrenin sesidir.", lesson: "Uzay araştırmalarına ve kozmik ışımalara Hess ile adım at!" },
    { name: "Carl David Anderson", title: "Pozitron Kaşifi 🌌", emoji: "🌌", story: "Elektronun zıt yüklü ikizi olan pozitronu (ilk antimadde) buldu. Ayrıca müon parçacığını keşfetti. Nobel aldı.", quote: "Antimadde, laboratuvarda gözlendi.", lesson: "Uzay filmlerindeki antimaddenin gerçek keşfini Anderson ile öğren!" },
    { name: "Clinton Davisson", title: "Elektron Dalga Kırınımı Kaşifi 🔬", emoji: "🔬", story: "Elektronların kristallerden kırınıma uğradığını göstererek elektronların dalga gibi davrandığını deneysel olarak kanıtladı. Nobel aldı.", quote: "Tanecikler de dalga gibi bükülür.", lesson: "Elektron mikroskoplarının Davisson sayesinde nasıl yapıldığını öğren!" },
    { name: "Enrico Fermi", title: "Nükleer Çağın Mimarı ⚛️", emoji: "⚛️", story: "Nötron bombardımanıyla yeni radyoaktif elementler üretti ve dünyada ilk kontrollü nükleer reaktörü çalıştırdı. Nobel aldı.", quote: "Nükleer enerji, kontrollü güçtür.", lesson: "Fizikteki Fermi sorularıyla tahmin becerini geliştir!" },
    { name: "Ernest Lawrence", title: "Siklotron (Parçacık Hızlandırıcı) Mucidi 🌀", emoji: "🌀", story: "Parçacıkları dairesel yörüngelerde yüksek hızlara ulaştıran siklotronu icat etti. CERN'deki büyük hızlandırıcıların atasıdır. Nobel aldı.", quote: "Hızlanan parçacıklar, çekirdeği parçalar.", lesson: "CERN'deki parçacık çarpıştırma deneylerini Lawrence ile öğren!" },
    { name: "Otto Stern", title: "Moleküler Işın Yöntemi Kaşifi ⚛️", emoji: "⚛️", story: "Stern-Gerlach deneyiyle atomların uzaysal yönelimini ve elektronların spinini doğrudan kanıtladı. Nobel Fizik Ödülü aldı.", quote: "Atomların spini, yönünü seçti.", lesson: "Kuantum durumlarını ve spin kavramını Stern ile keşfet!" },
    { name: "Isidor Isaac Rabi", title: "NMR (Nükleer Manyetik Rezonans) Kaşifi 🧲", emoji: "🧲", story: "Atom çekirdeklerinin manyetik özelliklerini kaydetme yöntemini buldu. Hastanelerdeki MR cihazlarının temelidir. Nobel aldı.", quote: "Çekirdeğin manyetik sesi duyuldu.", lesson: "Hastanelerdeki MR (Manyetik Rezonans) cihazlarının Rabi ile keşfini öğren!" },
    { name: "Wolfgang Pauli", title: "Dışarlama İlkesi Kaşifi ⚛️", emoji: "⚛️", story: "Atomdaki elektronların kuantum durumlarının çakışamayacağını gösteren Pauli Dışarlama İlkesi ile periyodik tabloyu açıkladı. Nobel aldı.", quote: "Elektronlar, kendi yerlerini korur.", lesson: "Kimyadaki periyodik tablonun temel fizik kurallarını Pauli ile anla!" },
    { name: "Percy Williams Bridgman", title: "Yüksek Basınç Fiziği Kaşifi 💎", emoji: "💎", story: "İnanılmaz yüksek basınçlar üreten cihazlar icat etti ve maddelerin yüksek basınç altındaki davranışlarını inceledi. Nobel aldı.", quote: "Yüksek basınç, maddeleri baştan yaratır.", lesson: "Yerin kilometrelerce altında elmasın nasıl oluştuğunu Bridgman ile anla!" },
    { name: "Edward Victor Appleton", title: "İyonosfer Kaşifi 📡", emoji: "📡", story: "Radyo dalgalarını yansıtan atmosfer tabakası iyonosferi keşfetti. Küresel radyo iletişiminin ve radarın gelişmesini sağladı. Nobel aldı.", quote: "Atmosfer, radyo sesini yansıtır.", lesson: "Radyo sinyallerinin kilometrelerce uzağa nasıl ulaştığını Appleton ile öğren!" },
    { name: "Patrick Blackett", title: "Sis Odası Geliştiricisi 🔬", emoji: "🔬", story: "Sis odası yöntemini geliştirerek kozmik ışınların ve nükleer reaksiyonların fotoğraflarını çekti. Nobel Fizik Ödülü aldı.", quote: "Görünmeyen parçacıklar arkalarında iz bırakır.", lesson: "Fiziksel parçacıkların izlerini sis odasında Blackett ile takip et!" },
    { name: "Hideki Yukawa", title: "Mezon Teorisi Kaşifi ⚛️", emoji: "⚛️", story: "Proton ve nötronları çekirdekte tutan güçlü kuvveti taşıyan mezonları öngörerek Nobel Fizik Ödülü alan ilk Japon bilim insanı oldu.", quote: "Güçlü bağlar, atomu bir arada tutar.", lesson: "Çekirdekteki güçlü kuvvetlerin Yukawa ile nasıl açıklandığını öğren!" },
    { name: "Cecil Frank Powell", title: "Fotoğrafik Mezon Kaşifi ⚛️", emoji: "⚛️", story: "Kozmik ışınlardaki mezon parçacıklarını özel fotoğraf plakalarıyla görüntülemeyi başararak Yukawa'nın teorisini kanıtladı. Nobel aldı.", quote: "Doğru fotoğraf, görünmez parçacığı kanıtlar.", lesson: "Kozmik ışınların Powell ile nasıl görüntülendiğini araştır!" },
    { name: "John Cockcroft & Ernest Walton", title: "Atomu İlk Parçalayan Fizikçiler ⚛️", emoji: "⚛️", story: "Yapay olarak hızlandırılmış protonlarla lityum çekirdeğini iki alfa parçacığına bölerek atomu yapay olarak parçalayan ilk insanlar oldular. Nobel aldılar.", quote: "Hızlandırılmış protonlar, çekirdeği yardı.", lesson: "İlk yapay atom parçalama deneyini Cockcroft ve Walton ile öğren!" },
    { name: "Felix Bloch & Edward Purcell", title: "Hassas Nükleer Manyetik Rezonans Kaşifleri 🧲", emoji: "🧲", story: "Sıvı ve katılarda nükleer manyetik rezonansı hassas ölçen yöntemler geliştirdiler. MR teknolojisinin babalarıdır. Nobel aldılar.", quote: "Manyetik rezonans, moleküllerin sırrını çözer.", lesson: "Kimyasal analizlerin ve tıbbi görüntülemenin temelini Bloch ile Purcell ile öğren!" },
    { name: "Frits Zernike", title: "Faz Kontrast Mikroskobu Mucidi 🔬", emoji: "🔬", story: "Canlı hücreleri boyamadan ve öldürmeden iç yapısını görmeyi sağlayan faz kontrast mikroskobunu icat etti. Nobel aldı.", quote: "Hücreler, canlıyken izlendi.", lesson: "Biyoloji laboratuvarlarında canlı hücreleri Zernike mikroskobuyla incele!" },
    { name: "Max Born", title: "Kuantum Olasılık Yorumcusu 🧠", emoji: "🧠", story: "Schrödinger dalga fonksiyonunun olasılık yoğunluğunu temsil ettiğini gösterdi. Kuantum olasılık kuramını kurdu. Nobel aldı.", quote: "Kuantum dünyası olasılıklarla yönetilir.", lesson: "Born ile kuantum dünyasındaki olasılık hesaplarını keşfet!" },
    { name: "Walther Bothe", title: "Çakışma Yöntemi Kaşifi 🔬", emoji: "🔬", story: "İki fiziksel olayın aynı anda gerçekleşmesini ölçen çakışma devresini icat etti. Nükleer fizik ölçümlerini geliştirdi. Nobel aldı.", quote: "Aynı anda gerçekleşen olaylar, gerçeği gösterir.", lesson: "Hassas zaman ölçümlerinin fizikteki önemini Bothe ile öğren!" },
    { name: "Polykarp Kusch", title: "Elektron Manyetik Moment Kaşifi ⚛️", emoji: "⚛️", story: "Elektronun manyetik momentinin teorik değerden farklı olduğunu hassas ölçerek kuantum elektrodinamiğini doğruladı. Nobel aldı.", quote: "Hassas ölçüm, teoriyi test eder.", lesson: "Kuantum fiziğindeki en hassas ölçümleri Kusch ile keşfet!" },
    { name: "Willis Lamb", title: "Lamb Kayması Kaşifi ⚛️", emoji: "⚛️", story: "Hidrojen spektrumundaki ince seviye farkını (Lamb Kayması) keşfederek kuantum elektrodinamiği teorisinin kurulmasını sağladı. Nobel aldı.", quote: "Küçük sapmalar, büyük teoriler doğurur.", lesson: "Lamb ile atomik seviyelerdeki inanılmaz hassasiyeti keşfet!" },
    { name: "John Bardeen", title: "Yarıiletken ve Süperiletkenlik Fizikçisi 🔌", emoji: "🔌", story: "Transistörü icat etti ve süperiletkenlik teorisini (BCS) geliştirdi. İki kez Nobel Fizik Ödülü alan tek kişidir.", quote: "Teknoloji, temel bilimlerin meyvesidir.", lesson: "Akıllı telefonların içindeki çiplerin Bardeen transistörleriyle çalıştığını bil!" },
    { name: "Walter Houser Brattain", title: "Transistör Mucidi 🔌", emoji: "🔌", story: "Bell Laboratuvarları'nda ilk nokta temaslı transistörü fiziksel olarak monte edip çalıştıran efsanevi deneyci fizikçidir. Nobel aldı.", quote: "Deneyler, teoriyi hayata bağlar.", lesson: "Brattain ile transistörlerin nasıl elektrik anahtarı gibi çalıştığını gör!" },
    { name: "William Shockley", title: "Katı Hal Elektroniği Öncüsü 🔌", emoji: "🔌", story: "Bağlantı transistörünü teorik olarak tasarladı ve transistör fiziğini yazdı. Silikon Vadisi'nin temellerini attı. Nobel aldı.", quote: "Transistör, dijital çağın atomudur.", lesson: "Shockley ile Silikon Vadisi'nin nasıl teknoloji merkezi olduğunu öğren!" }
];

for (const h of genericScientists) {
    if (uniqueHeroes.length >= 100) break;
    if (!seenNames.has(h.name)) {
        seenNames.add(h.name);
        uniqueHeroes.push(h);
    }
}

// Write the file
const fileContent = `const HEROES_DATA = ${JSON.stringify(uniqueHeroes, null, 4)};\n\nif (typeof module !== 'undefined') {\n    module.exports = HEROES_DATA;\n}`;
fs.writeFileSync('heroes_list.js', fileContent, 'utf8');
console.log('Successfully generated heroes_list.js with ' + uniqueHeroes.length + ' entries.');
