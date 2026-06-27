const HEROES_DATA = [
    {
        "name": "Mustafa Kemal ATATÜRK",
        "title": "Eşsiz Lider ve Matematikçi 🇹🇷",
        "emoji": "🇹🇷",
        "story": "Atatürk sadece ülkemizi kurtarmakla kalmadı, bilime ve matematiğe de büyük önem verdi. Türkçe geometri terimlerini (üçgen, açı, artı, eksi vb.) kendisi yazdı! Hayatta en gerçek yol göstericinin bilim olduğunu söyledi.",
        "quote": "Hayatta en hakiki mürşit ilimdir.",
        "lesson": "Geleceğin lideri olmak için kitap okumayı ve araştırmayı asla bırakma!"
    },
    {
        "name": "Sertaç GÜL",
        "title": "Sistem & Yapay Zeka Mühendisi | Yönetim Danışmanı 💻",
        "emoji": "💻",
        "story": "Deha'nın biricik babası! Sistem ve Yapay Zeka Mühendisi, Yönetim Danışmanı ve doktora adayıdır. Havacılık ve havalimanı işletmeciliği gibi yüksek teknolojili sektörlerde 18 yılı aşkın tecrübeye sahiptir. JetŞef firmasında Chief Operating Officer (COO) olarak sistemlerin tasarlanması, süreçlerin optimize edilmesi ve teknolojik büyüme adımlarına liderlik etmiştir. ATAOL AI Techs kurucusu olarak Deha için bu harika yapay zeka uygulamasını geliştirdi. Ayrıca ActLedger ve ShiftZen gibi akıllı kurumsal çözümleri tasarlayarak dünyaya katkı sunuyor. Deha'nın en büyük gururu ve ilham kaynağı!",
        "quote": "Benim en büyük projem ve başarımı süsleyen gururum, oğlum Deha'dır.",
        "lesson": "Baban her zaman senin arkanda aslan oğlum! Teknolojiyi öğren, analitik düşün ve geleceği inşa et!"
    },
    {
        "name": "Albert Einstein",
        "title": "Zaman ve Uzay Kaşifi 🧠",
        "emoji": "🧠",
        "story": "Çocukken öğretmenleri onun yavaş öğrendiğini düşünüyordu ama o hayal kurmaktan hiç vazgeçmedi. Uzay, zaman ve ışık hakkında hayaller kurarak modern fiziği baştan yazdı.",
        "quote": "Hayal gücü, bilgiden daha önemlidir.",
        "lesson": "Bir şeyi hemen anlamazsan üzülme; senin zihnin ve hayal gücün benzersizdir!"
    },
    {
        "name": "Prof. Dr. Celal Şengör",
        "title": "Dünyaca Ünlü Jeoloğumuz 🌍",
        "emoji": "🌍",
        "story": "Yerkabuğunun hareketlerini, depremleri ve dağların oluşumunu inceleyen harika bir yerbilimcidir. Çok okur, dünyayı gezer ve bilimi çok eğlenceli şekilde anlatır.",
        "quote": "Bilim, gerçekleri arama sürecidir.",
        "lesson": "Dünyayı ve doğayı anlamak için coğrafya ve jeoloji kitaplarını sevmeyi unutma!"
    },
    {
        "name": "Orville & Wilbur Wright",
        "title": "Uçağı İcat Eden Kardeşler ✈️",
        "emoji": "✈️",
        "story": "Yıllarca bisikletçilik yaptılar ama rüzgarları inceleyip ilk motorlu ve kontrollü uçağı uçurarak insanlığın uçma hayalini gerçeğe dönüştürdüler.",
        "quote": "Uçmak, rüzgara karşı direnmekle başlar.",
        "lesson": "İmkansız görünen rüyaların peşinden gitmek için Wright kardeşler gibi cesur ol!"
    },
    {
        "name": "James Watt",
        "title": "Sanayi Devriminin Mimarı ⚙️",
        "emoji": "⚙️",
        "story": "Buhar makinesini geliştirerek trenlerin, fabrikaların ve makinelerin çalışmasını sağladı. Sanayi Devrimi'ni başlatan kişi oldu.",
        "quote": "Güç, verimli kullanılan enerjidir.",
        "lesson": "Enerjini ve vaktini verimli kullanırsan dünyayı değiştirecek güç bulursun!"
    },
    {
        "name": "Michael Faraday",
        "title": "Elektromanyetizmanın Kaşifi ⚡",
        "emoji": "⚡",
        "story": "Fakir bir ailede doğdu, ciltçilik yaparken kitapları okuyarak bilimi öğrendi. Elektrik motorunu ve jeneratörü icat ederek elektriği kullanılabilir yaptı.",
        "quote": "Hayal et, dene, başarısız ol, tekrar dene.",
        "lesson": "Hangi şartlarda olursan ol, Faraday gibi okuyarak kendini her gün geliştirebilirsin!"
    },
    {
        "name": "Galileo Galilei",
        "title": "Modern Astronominin Babası 🔭",
        "emoji": "🔭",
        "story": "Kendi teleskobunu yaptı, Jüpiter'in uydularını keşfetti ve Dünya'nın Güneş etrafında döndüğünü savunarak bilimin özgürlüğünü savundu.",
        "quote": "Dünya yine de dönüyor.",
        "lesson": "Gerçekleri savunmaktan ve doğruları araştırmaktan asla korkma!"
    },
    {
        "name": "Blaise Pascal",
        "title": "Matematikçi ve Basınç Kaşifi 📐",
        "emoji": "📐",
        "story": "Genç yaşta ilk mekanik hesap makinesini (Pascaline) babasının vergi hesaplarına yardım etmek için yaptı. Matematikte Pascal Üçgeni'ni buldu.",
        "quote": "Matematik, insan zihninin en güzel ürünüdür.",
        "lesson": "Matematik sadece okul için değil, hayatı kolaylaştırmak ve pratik çözümler üretmek içindir!"
    },
    {
        "name": "Prof. Dr. Aziz Sancar",
        "title": "Nobel Ödüllü Kimyagerimiz 🧪",
        "emoji": "🧪",
        "story": "DNA onarımı üzerindeki çalışmalarıyla Nobel Kimya Ödülü'nü kazandı. Mardin'den çıkıp dünyaya bilimin gücünü gösterdi.",
        "quote": "Çalışmak kendimize duyduğumuz saygıdır.",
        "lesson": "Başarı çalışarak kazanılır, sen de çalışırsan Nobel kazanabilirsin Dehacığım!"
    },
    {
        "name": "Ali Kuşçu",
        "title": "Gökbilimci ve Matematikçi 🪐",
        "emoji": "🪐",
        "story": "Ay'ın haritasını ilk çıkaran astronomlardan biridir. Fatih Sultan Mehmet döneminde İstanbul'a gelerek matematik kürsüsü kurmuştur.",
        "quote": "Yıldızları takip eden, yolunu kaybetmez.",
        "lesson": "Gökyüzüne bak, yıldızları izle ve uzay bilimlerini merak et!"
    },
    {
        "name": "Cahit Arf",
        "title": "Dünyaca Ünlü Matematikçimiz ♾️",
        "emoji": "♾️",
        "story": "Paralarımızın (10 TL) üzerinde resmi olan büyük matematikçimiz! Kendi adıyla anılan 'Arf Değişmezi' teoremini bulmuştur.",
        "quote": "Matematik esas olarak sabır işidir.",
        "lesson": "Matematik sorularını çözerken sabırlı olursan mutlaka doğru cevaba ulaşırsın!"
    },
    {
        "name": "Marie Curie",
        "title": "Radyoaktivitenin Kaşifi 💡",
        "emoji": "💡",
        "story": "İki farklı alanda (Fizik ve Kimya) Nobel kazanan tek kadındır. Polonyum ve Radyum elementlerini keşfetmiştir.",
        "quote": "Cesur olun ve kendinize inanın.",
        "lesson": "Zorluklar karşısında yılma, çalışarak her engeli aşabilirsin!"
    },
    {
        "name": "Nikola Tesla",
        "title": "Alternatif Akımın Mucidi 🔌",
        "emoji": "🔌",
        "story": "Kablosuz iletişim, radyo ve alternatif akım motorlarını icat etti. Dünyayı elektrikle aydınlatan adam oldu.",
        "quote": "Gelecek, gerçeklerin görüleceği yerdir.",
        "lesson": "Geleceğe dair büyük hayaller kur, projelerini hayata geçirmekten çekinme!"
    },
    {
        "name": "Thomas Edison",
        "title": "Ampulün Mucidi 💡",
        "emoji": "💡",
        "story": "Ampulü icat etmek için 1000'den fazla başarısız deneme yaptı ama pes etmedi. 'Hata yapmadım, çalışmayan 1000 yolu buldum' dedi.",
        "quote": "Deha, %1 ilham ve %99 terdir.",
        "lesson": "Bir matematik sorusunda hata yaparsan üzülme, pes etmeden denemeye devam et!"
    },
    {
        "name": "Ada Lovelace",
        "title": "İlk Kadın Programcı 💻",
        "emoji": "💻",
        "story": "Bilgisayarlar henüz icat edilmemişken, mekanik hesap makineleri için ilk algoritmayı (kodları) yazarak tarihin ilk yazılımcısı oldu.",
        "quote": "Hayal gücü, bilimin en büyük rehberidir.",
        "lesson": "Bilgisayarları ve kod yazmayı severek geleceğin harika yazılımlarını üretebilirsin!"
    },
    {
        "name": "Alan Turing",
        "title": "Yapay Zekanın Kurucusu 🧠",
        "emoji": "🧠",
        "story": "Bilgisayar biliminin babasıdır. İkinci Dünya Savaşı'nda 'Enigma' adlı şifre çözücü makineyi icat ederek savaşın bitmesini hızlandırmıştır.",
        "quote": "Bazen kimsenin hayal edemediği şeyleri, kimsenin tahmin edemediği insanlar yapar.",
        "lesson": "Farklı düşünmekten korkma, senin de yapacağın harika şeyler olacak!"
    },
    {
        "name": "Charles Darwin",
        "title": "Biyoloji ve Doğa Tarihçisi 🦋",
        "emoji": "🦋",
        "story": "Beagle gemisiyle dünyayı gezerek canlı türlerini inceledi. Doğal seçilim ve evrim teorisiyle biyoloji bilimini baştan yazdı.",
        "quote": "En güçlü olan değil, değişime en çok uyum sağlayan hayatta kalır.",
        "lesson": "Çevrendeki doğayı, bitkileri ve canlıları merakla incele, doğa en büyük laboratuvardır!"
    },
    {
        "name": "Louis Pasteur",
        "title": "Mikropların Kaşifi ve Aşı Mucidi 🦠",
        "emoji": "🦠",
        "story": "Mikropları keşfetti. Sütün bozulmasını önleyen pastörizasyon yöntemini ve ölümcül kuduz aşısını bularak milyonlarca insanı kurtardı.",
        "quote": "Şans, sadece hazır olan zihinlere güler.",
        "lesson": "Sokak hayvanlarını severken temizliğe dikkat etmemizin sebebi Pasteur'ün bulduğu bu görünmez mikroplardır!"
    },
    {
        "name": "Alexander Fleming",
        "title": "Penisilinin Mucidi 🧫",
        "emoji": "🧫",
        "story": "Laboratuvarını temizlemeyi unuttuğu bir gün, küf mantarlarının bakterileri öldürdüğünü fark etti ve ilk antibiyotik olan penisilini buldu.",
        "quote": "Bazen doğa bize en büyük sırlarını kazara fısıldar.",
        "lesson": "Hatalar ve tesadüfler bile meraklı bir zihin için harika birer keşif fırsatıdır!"
    },
    {
        "name": "Alexander Graham Bell",
        "title": "Telefonun Mucidi 📞",
        "emoji": "📞",
        "story": "İşitme engellilerin duymasını sağlamak için çalışmalar yaparken tesadüfen ses dalgalarını elektrik tellerinden iletip ilk telefonu icat etti.",
        "quote": "Bir kapı kapandığında, diğeri açılır.",
        "lesson": "İnsanlara yardım etmek için üreteceğin fikirler, dünyayı birbirine bağlayabilir!"
    },
    {
        "name": "Steve Jobs",
        "title": "Apple ve Akıllı Telefon Mucidi 📱",
        "emoji": "📱",
        "story": "Tasarım and teknolojiyi birleştirerek akıllı telefonları (iPhone), tabletleri ve bilgisayarları herkesin kolayca kullanabileceği hale getirdi.",
        "quote": "Aç kal, budala kal (Merak etmeye devam et).",
        "lesson": "Teknolojik cihazları sadece izlemek için değil, onlarla yeni şeyler tasarlamak için kullan!"
    },
    {
        "name": "Elon Musk",
        "title": "Uzay ve Elektrikli Araç Vizyoneri 🚀",
        "emoji": "🚀",
        "story": "Uzay şirketi SpaceX ile roketleri tekrar dikey indirmeyi başardı. Tesla ile elektrikli arabaları popüler yaptı. Mars'a gitmeyi hedefliyor.",
        "quote": "Eğer bir şey yeterince önemliyse, şanslar aleyhinizde olsa bile yapmalısınız.",
        "lesson": "Geleceğin teknolojilerini hayal et, uzay ve mühendislik bilimlerine ilgi duy!"
    },
    {
        "name": "Stephen Hawking",
        "title": "Karadeliklerin Kaşifi 🌌",
        "emoji": "🌌",
        "story": "Hareket edememesine ve konuşamamasına rağmen özel bilgisayarıyla evren, karadelikler ve zamanın başlangıcı hakkında teoriler yazdı.",
        "quote": "Zeka, değişime uyum sağlayabilme yeteneğidir.",
        "lesson": "Fiziksel engeller veya zorluklar, zihninin evreni keşfetmesine asla engel olamaz!"
    },
    {
        "name": "Harezmi",
        "title": "Cebirin Kurucusu 🧮",
        "emoji": "🧮",
        "story": "Matematikte 'Cebir' dalını kurdu ve Avrupa'ya tanıttı. Ayrıca 'Sıfır' (0) rakamını ilk kez matematiksel işlemlerde kullandı. Algoritma kelimesi onun adından gelir.",
        "quote": "Matematik, evrenin ortak dilidir.",
        "lesson": "Sıfırın değerini ve cebrin gücünü bilerek matematik çalışmak sana güç verir!"
    },
    {
        "name": "Biruni",
        "title": "Dünyanın Çapını Ölçen Deha 🗺️",
        "emoji": "🗺️",
        "story": "Bundan bin yıl önce Dünya'nın döndüğünü savundu ve Dünya'nın çapını bugünkü ölçümlere neredeyse birebir aynı şekilde hesaplamayı başardı.",
        "quote": "Bilgi, paylaşıldıkça çoğalan tek hazinedir.",
        "lesson": "Bilimle uğraşan insan sınırları aşar, bin yıl önceden bugünü aydınlatır!"
    },
    {
        "name": "Piri Reis",
        "title": "Dünya Haritasını Çizen Amiral 🗺️",
        "emoji": "🗺️",
        "story": "Amerika kıtasını da içeren ve o dönem için inanılmaz derecede doğru olan ilk dünya haritalarını çizdi. 'Kitab-ı Bahriye' adında denizcilik kitabı yazdı.",
        "quote": "Harita, bilginin coğrafya üzerindeki resmidir.",
        "lesson": "Coğrafya, haritalar ve keşifler dünyamızı anlamanın en heyecanlı yoludur!"
    },
    {
        "name": "Gazi Yaşargil",
        "title": "Yüzyılın Beyin Cerrahı 🧠",
        "emoji": "🧠",
        "story": "Mikro-beyin cerrahisini kurarak beynin en hassas noktalarındaki tümörleri ameliyat etme yöntemlerini geliştirdi. Tıp dünyasında bir efsanedir.",
        "quote": "Her beyin, keşfedilmeyi bekleyen bir evrendir.",
        "lesson": "İnsan beyninin gizemlerini çözmek ve doktor olmak harika bir hayaldir!"
    },
    {
        "name": "Canan Dağdeviren",
        "title": "Giyilebilir Kalp Pilinin Mucidi 💓",
        "emoji": "💓",
        "story": "Vücut hareketleriyle şarj olabilen giyilebilir kalp pilini icat etti. Ayrıca cilt kanserini tespit eden cihazlar geliştirdi.",
        "quote": "Bilim, insanlığa duyulan derin bir sevgidir.",
        "lesson": "Teknoloji ve tıbbı birleştirerek insanların hayatını kurtaracak icatlar yapabilirsin!"
    },
    {
        "name": "Tim Berners-Lee",
        "title": "İnternetin Mucidi 🌐",
        "emoji": "🌐",
        "story": "Bugün web sitelerine girerken kullandığımız 'World Wide Web' (www) sistemini icat etti. İnterneti herkese açık ve ücretsiz yaptı.",
        "quote": "Web, insanları birbirine bağlamak için tasarlandı.",
        "lesson": "İnterneti sadece video izlemek için değil, bilgi edinmek ve yeni şeyler tasarlamak için kullan!"
    },
    {
        "name": "Alessandro Volta",
        "title": "Pilin Mucidi 🔋",
        "emoji": "🔋",
        "story": "Çinko ve bakır plakaları tuzlu suya batırarak elektrik akımı elde etti ve insanlık tarihinin ilk kimyasal pilini (Volta Pili) yaptı.",
        "quote": "Elektrik, maddelerin ruhudur.",
        "lesson": "Bugün telefonlarımızda, oyuncaklarımızda kullandığımız piller Volta'nın bu basit deneyiyle başladı!"
    },
    {
        "name": "Leonardo da Vinci",
        "title": "Rönesans Dehası ve Mucit 🎨",
        "emoji": "🎨",
        "story": "Mona Lisa'yı çizdi ama aynı zamanda helikopter, tank, denizaltı ve uçan makinelerin ilk tasarımlarını yüzyıllar öncesinden defterine çizdi.",
        "quote": "Öğrenmek, zihni asla yormayan tek şeydir.",
        "lesson": "Hem sanatı hem bilimi bir arada yürüterek Leonardo gibi çok yönlü bir deha olabilirsin!"
    },
    {
        "name": "Archimedes (Arşimet)",
        "title": "Suyun Kaldırma Kuvvetini Bulan Deha 🛁",
        "emoji": "🛁",
        "story": "Hamamda yıkanırken suyun onu yukarı ittiğini fark etti. 'Evreka! (Buldum!)' diye bağırarak sokaklara fırladı ve suyun kaldırma kuvvetini keşfetti.",
        "quote": "Bana bir dayanak noktası verin, Dünya'yı yerinden oynatayım.",
        "lesson": "Fizik kuralları her yerdedir, banyoda yıkanırken bile bilimi düşünebilirsin!"
    },
    {
        "name": "John von Neumann",
        "title": "Modern Bilgisayar Mimarı 💻",
        "emoji": "💻",
        "story": "Bugün kullandığımız tüm bilgisayarların temel yapısı olan 'Von Neumann Mimarisi'ni (işlemci, bellek, giriş-çıkış üniteleri) tasarladı.",
        "quote": "Eğer insanlar matematiğin basit olduğuna inanmıyorlarsa, bu sadece hayatın ne kadar karmaşık olduğunu fark etmediklerindendir.",
        "lesson": "Bilgisayar donanımlarını ve mantık kapılarını öğrenmek yazılımcı olmanın ilk adımıdır!"
    },
    {
        "name": "John J. Hopfield & Geoffrey E. Hinton",
        "title": "Yapay Sinir Ağları ve Yapay Zekanın Babaları 🧠",
        "emoji": "🧠",
        "story": "Bilgisayarların insan beyni gibi öğrenmesini sağlayan yapay sinir ağları ve derin öğrenme algoritmalarını geliştirerek modern yapay zekayı (yapay zeka asistanları, ATAOL AI) kurdular.",
        "quote": "Yapay zeka, makinelerin öğrenme macerasıdır.",
        "lesson": "Bugün ATAOL Yapay Zeka ile sohbet edebilmenin temelini bu iki bilim insanı atmıştır!"
    },
    {
        "name": "Isaac Newton",
        "title": "Kütleçekimi ve Kalkülüs Mucidi 🍎",
        "emoji": "🍎",
        "story": "Kafasına düşen elma sayesinde kütleçekim yasasını formüle etti. Hareket kanunlarını yazdı ve ışığın tayfını keşfetti.",
        "quote": "Eğer daha uzağı görebildiysem, devlerin omuzlarında durduğum içindir.",
        "lesson": "Fizik kuralları evrenseldir, Newton gibi gözlem yaparak büyük sırlar keşfedebilirsin."
    },
    {
        "name": "Johannes Kepler",
        "title": "Gezegenlerin Yörünge Kaşifi 🪐",
        "emoji": "🪐",
        "story": "Gezegenlerin Güneş etrafında tam daire değil, eliptik yörüngelerde dolandığını keşfetti. Kepler Kanunları'nı yazdı.",
        "quote": "Geometri, yaratılışın ebedi şablonudur.",
        "lesson": "Matematik ve geometrinin doğada, uzayda nasıl harika çalıştığını fark et!"
    },
    {
        "name": "Dmitri Mendeleev",
        "title": "Periyodik Tablonun Yaratıcısı 📊",
        "emoji": "📊",
        "story": "Kimyasal elementleri özelliklerine göre sıralayan periyodik tabloyu tasarladı ve henüz keşfedilmemiş elementlerin yerini doğru tahmin etti.",
        "quote": "Her şeyin bir düzeni vardır, yeter ki aramayı bil.",
        "lesson": "Çalışmalarında düzenli ve planlı olursan gelecekteki boşlukları sen de görebilirsin!"
    },
    {
        "name": "Hezarfen Ahmed Çelebi",
        "title": "Kanatlarla Uçan İlk Türk Mucit 🦅",
        "emoji": "🦅",
        "story": "Kuşların kanatlarını ve rüzgarları inceledi. Kendi yaptığı yapay kanatlarla Galata Kulesi'nden atlayıp Üsküdar'a kadar uçtu.",
        "quote": "Gökyüzü cesurları bekler.",
        "lesson": "Wright kardeşlerden yüzyıllar önce uçmayı hayal eden atalarımızın cesaretini örnek al!"
    },
    {
        "name": "İbn-i Sina (Avicenna)",
        "title": "Tıbbın Hükümdarı 🩺",
        "emoji": "🩺",
        "story": "Bin yıl önce tıp üzerine yazdığı 'El-Kanun fi't-Tıbb' kitabı, Avrupa üniversitelerinde yüzlerce yıl ders kitabı olarak okutuldu. Hastalıkları teşhis etti.",
        "quote": "Şifasız hastalık yoktur, irade eksikliğinden başka.",
        "lesson": "İnsan sağlığına faydalı olmak, tıp ve biyoloji bilimlerinde ilerlemek çok kutsal bir amaçtır!"
    },
    {
        "name": "Oktay Sinanoğlu",
        "title": "Türk Aynştaynı 🧪",
        "emoji": "🧪",
        "story": "Dünyanın en genç yaşta profesör olan kimyacılarından biridir. Türkçe dilinin korunması ve bilim dili olması için büyük mücadele verdi.",
        "quote": "Kendi dilini bilmeyen, bilim üretemez.",
        "lesson": "Türkçe dilini doğru kullanmak ve bilimi kendi dilinde öğrenmek başarıyı getirir!"
    },
    {
        "name": "Feryal Özel",
        "title": "Astrofizikçi 🌌",
        "emoji": "🌌",
        "story": "NASA'da çalışan ve tarihte ilk kez bir karadeliğin fotoğrafını çeken Event Horizon Teleskobu ekibinde yer alan harika astrofizikçimizdir.",
        "quote": "Bilinmezi aramak insanın en büyük dürtüsüdür.",
        "lesson": "Uzay mühendisliği ve astrofizik alanında sınırları zorlayıp yeni galaksiler keşfedebilirsin!"
    },
    {
        "name": "Mete Atatüre",
        "title": "Işığın Sesini Ölçen Fizikçi 💡",
        "emoji": "💡",
        "story": "Cambridge Üniversitesi'nde profesördür. Işığın gürültü seviyesini (sesini) ölçmeyi başararak kuantum fiziğinde devrim yapmıştır.",
        "quote": "Merak, tüm bilim kapılarını açan anahtardır.",
        "lesson": "Fizik dünyasındaki gizemleri çözmek için merakının peşinden git!"
    },
    {
        "name": "Uğur Şahin",
        "title": "mRNA Aşısı Mucidi 💉",
        "emoji": "💉",
        "story": "Eşi Özlem Türeci ile birlikte mRNA teknolojisini geliştirerek COVID-19 salgınına karşı ilk başarılı aşıyı üreten ve milyonlarca insanı kurtaran bilim insanıdır.",
        "quote": "Bilim ve işbirliği, en büyük krizleri çözer.",
        "lesson": "Tıp ve biyoloji alanında yapacağın araştırmalar küresel sorunları çözebilir!"
    },
    {
        "name": "Özlem Türeci",
        "title": "Kanser ve Aşı Araştırmacısı 🧬",
        "emoji": "🧬",
        "story": "Eşi Uğur Şahin ile Biontech firmasını kurarak tıp dünyasında devrim yapan bağışıklık sistemi tedavileri ve aşılar geliştirmiştir.",
        "quote": "Araştırma, bilinmeyeni anlamak için sabırla çalışmaktır.",
        "lesson": "Zorluklar karşısında sabırla araştırma yapmaya devam et!"
    },
    {
        "name": "Jane Goodall",
        "title": "Doğal Hayat Kaşifi 🐒",
        "emoji": "🐒",
        "story": "Yıllarca Afrika ormanlarında yaşayarak şempanzelerin de insanlar gibi alet kullanabildiğini ve duyguları olduğunu keşfetti.",
        "quote": "Her birey bir fark yaratır, önemli olan ne tür bir fark yarattığınızdır.",
        "lesson": "Doğayı ve hayvanları korumak, onları anlamak dünyamızı güzelleştirir!"
    },
    {
        "name": "Rosalind Franklin",
        "title": "DNA'nın Yapısını Fotoğraflayan Kimyager 🧬",
        "emoji": "🧬",
        "story": "X-ışınları kullanarak DNA'nın sarmal (çift sarmal) yapısının ilk net fotoğrafını çekti ve genetik bilimine en büyük katkıyı sundu.",
        "quote": "Bilim ve günlük yaşam birbirinden ayrılamaz.",
        "lesson": "Görünmeyeni görünür kılmak için kimya ve fizik laboratuvarlarında çalışmak harikadır!"
    },
    {
        "name": "Richard Feynman",
        "title": "Kuantum Fiziği Dehası 💡",
        "emoji": "💡",
        "story": "Kuantum elektrodinamiğini geliştirdi. Karmaşık fizik konularını herkesin anlayacağı basitlikte anlatmasıyla ünlüdür.",
        "quote": "Bir şeyi basitçe açıklayamıyorsanız, onu anlamamışsınızdır.",
        "lesson": "Öğrendiğin konuları arkadaşlarına basitçe anlatarak daha iyi kavrayabilirsin!"
    },
    {
        "name": "Carl Sagan",
        "title": "Kozmos Elçisi ☄️",
        "emoji": "☄️",
        "story": "Voyager uzay araçlarına insanlığın mesajını taşıyan altın plakları koydu. 'Kozmos' belgeseliyle milyonlarca çocuğa uzayı sevdirdi.",
        "quote": "Bir yerlerde inanılmaz bir şey keşfedilmeyi bekliyor.",
        "lesson": "Evrenin derinliklerini merak et, astronomi kitapları oku ve yıldızları hayal et!"
    },
    {
        "name": "Grace Hopper",
        "title": "Yazılım Dillerinin Öncüsü 🐞",
        "emoji": "🐞",
        "story": "İlk derleyiciyi (compiler) yazdı. Bilgisayara sıkışan bir güve böceğini bulup çıkartarak bilgisayar hatalarına 'Bug' (böcek) denmesini sağladı.",
        "quote": "İzin istemek, af dilemekten daha zordur.",
        "lesson": "Yazılım hatalarını çözmek sabır ve dikkat ister, sen de bu dikkati göster!"
    },
    {
        "name": "Benjamin Franklin",
        "title": "Paratonerin Mucidi ⚡",
        "emoji": "⚡",
        "story": "Fırtınalı bir günde uçurtma uçurarak yıldırımların elektrik taşıdığını kanıtladı. Binaları koruyan paratoneri icat etti.",
        "quote": "Yatırım yapılan bilgi, en yüksek faizi getirir.",
        "lesson": "Deneyler yaparken dikkatli ol ama doğanın güçlerini anlamaktan vazgeçme!"
    },
    {
        "name": "Robert Hooke",
        "title": "Hücreyi Keşfeden Bilim İnsanı 🔬",
        "emoji": "🔬",
        "story": "Mikroskobu geliştirerek mantar tıpasını inceledi ve gördüğü küçük odacıklara 'Hücre' (Cell) adını vererek biyolojide çığır açtı.",
        "quote": "Küçük şeyler, büyük sırların anahtarıdır.",
        "lesson": "Mikroskop altında bambaşka bir mikroskobik dünya var, biyoloji bilimini mutlaka keşfet!"
    },
    {
        "name": "Karl Benz",
        "title": "Modern Otomobilin Mucidi 🚗",
        "emoji": "🚗",
        "story": "Benzinli motorla çalışan ilk modern otomobili icat etti. Eşi Bertha Benz ise bu arabayla ilk uzun yolculuğu yaparak arabayı tanıttı.",
        "quote": "İlk adım, yolun yarısıdır.",
        "lesson": "Tekerlekli araçları, mekanik tasarımları Benz gibi hayal ederek işe koyul!"
    },
    {
        "name": "Robert Boyle",
        "title": "Gaz Kanunlarının Kaşifi 🧪",
        "emoji": "🧪",
        "story": "Gazların basıncı ile hacmi arasındaki ilişkiyi buldu (Boyle Kanunu). Kimyayı simyadan ayırıp modern bir bilim haline getiren öncülerdendir.",
        "quote": "Bilimsel gerçek, denenebilir olandır.",
        "lesson": "Deneyler ve gözlemler yaparak hipotezlerini kanıtlamayı öğren!"
    },
    {
        "name": "John Dalton",
        "title": "Atom Teorisinin Kurucusu ⚛️",
        "emoji": "⚛️",
        "story": "Maddelerin bölünemez küçük kürelerden yani 'Atom'lardan oluştuğunu öne süren ilk modern teoriyi yazdı. Ayrıca renk körlüğünü (Daltonizm) açıkladı.",
        "quote": "Atomlar, evrenin temel yapı taşlarıdır.",
        "lesson": "Maddelerin iç yapısını, kimyasal bağları merak ederek Dalton'un izinden git!"
    },
    {
        "name": "Ernest Rutherford",
        "title": "Çekirdek Fiziğinin Babası ⚛️",
        "emoji": "⚛️",
        "story": "Atomun ortasında pozitif yüklü çok küçük bir 'Çekirdek' olduğunu altın levha deneyiyle keşfetti. Atomu Güneş sistemine benzetti.",
        "quote": "Fizik dışındaki tüm bilimler pul koleksiyonculuğudur.",
        "lesson": "Atomun içindeki devasa enerjiyi ve kuantum dünyasını keşfetmek harika bir maceradır!"
    },
    {
        "name": "Niels Bohr",
        "title": "Atom Modeli ve Kuantum Fizikçisi ⚛️",
        "emoji": "⚛️",
        "story": "Elektronların çekirdek etrafında belirli yörüngelerde dolandığını keşfetti. Bohr Atom Modeli'ni geliştirerek Nobel kazandı.",
        "quote": "Kuantum fiziği kafanızı karıştırmadıysa, onu henüz anlamamışsınızdır.",
        "lesson": "Karmaşık konular zihnini zorlayabilir, bu senin daha çok öğrendiğini gösterir!"
    },
    {
        "name": "Max Planck",
        "title": "Kuantum Teorisinin Kurucusu 💡",
        "emoji": "💡",
        "story": "Enerjinin sürekli değil, küçük paketçikler (kuantum) halinde yayıldığını keşfederek kuantum fiziğinin temelini attı. Nobel kazandı.",
        "quote": "Bilim, doğanın sırlarını çözme sanatıdır.",
        "lesson": "Doğayı en küçük parçacıklarına kadar anlamak için fiziğe merak duy!"
    },
    {
        "name": "Werner Heisenberg",
        "title": "Belirsizlik İlkesinin Kaşifi 🧠",
        "emoji": "🧠",
        "story": "Kuantum dünyasında bir elektronun hem yerini hem de hızını aynı anda kesin olarak ölçemeyeceğimizi (Belirsizlik İlkesi) kanıtladı.",
        "quote": "Gözlemlediğimiz şey doğanın kendisi değil, bizim sorgulama tarzımıza maruz kalan doğadır.",
        "lesson": "Bilimde her zaman kesinlik yoktur, olasılıkları ve belirsizlikleri yönetmeyi öğren!"
    },
    {
        "name": "Erwin Schrödinger",
        "title": "Schrödinger'in Kedisi Mucidi 🐱",
        "emoji": "🐱",
        "story": "Kuantum mekaniğinde dalga denklemini buldu. Kuantum durumlarını anlatmak için ünlü 'Schrödinger'in Kedisi' düşünce deneyini tasarladı.",
        "quote": "Şimdiki zaman, başlangıcı ve sonu olmayan tek gerçektir.",
        "lesson": "Zihinsel düşünce deneyleri yapmak, hayal gücünü ve problem çözme yeteneğini geliştirir!"
    },
    {
        "name": "Enrico Fermi",
        "title": "İlk Nükleer Reaktörün Mucidi ⚛️",
        "emoji": "⚛️",
        "story": "Chicago Üniversitesi'nin altında dünyanın ilk yapay nükleer reaktörünü kurdu. Kontrollü nükleer zincirleme reaksiyonu başlattı.",
        "quote": "Bilim insanı, bilinmeyen yollarda yürüyen kaşiftir.",
        "lesson": "Nükleer fizik ve temiz enerji teknolojileri geleceğin en önemli konularındandır!"
    },
    {
        "name": "J. Robert Oppenheimer",
        "title": "Atom Bombası Projesinin Lideri ⚛️",
        "emoji": "⚛️",
        "story": "Manhattan Projesi'nin bilimsel liderliğini yaptı. İlk atom bombasını geliştirdi ancak daha sonra nükleer silahların yayılmasına karşı çıktı.",
        "quote": "Şimdi ben ölüm oldum, dünyaların yok edicisi.",
        "lesson": "Bilimin gücünü her zaman insanlığın barışı, sağlığı ve iyiliği için kullanmalıyız!"
    },
    {
        "name": "Linus Pauling",
        "title": "Kimyasal Bağların Öncüsü ⚗️",
        "emoji": "⚗️",
        "story": "Kimyasal bağların yapısını açıkladığı için Nobel Kimya Ödülü aldı. Nükleer denemelere karşı çıktığı için de Nobel Barış Ödülü alarak iki farklı alanda tek başına Nobel kazanan tek kişi oldu.",
        "quote": "En iyi fikir bulmanın yolu, çok sayıda fikir üretmektir.",
        "lesson": "Problem çözerken aklına gelen tüm fikirleri yaz, en iyisini deneme yanılmayla bulursun!"
    },
    {
        "name": "James Watson",
        "title": "DNA Sarmalının Kaşifi 🧬",
        "emoji": "🧬",
        "story": "Francis Crick ile birlikte DNA'nın 'Çift Sarmal' yapısının modelini oluşturdular ve genetik kodun sırrını çözdüler.",
        "quote": "DNA, yaşamın tarif kitabıdır.",
        "lesson": "Biyoloji ve genetik kodları öğrenerek geleceğin biyoteknoloji uzmanı olabilirsin!"
    },
    {
        "name": "Francis Crick",
        "title": "Moleküler Biyoloji Öncüsü 🧬",
        "emoji": "🧬",
        "story": "James Watson ve Rosalind Franklin'in verileri yardımıyla DNA modelini kurarak yaşamın en küçük bilgi depolama sistemini aydınlattı.",
        "quote": "Bilim, doğanın şifrelerini çözmektir.",
        "lesson": "Yaşamın temelindeki kodları incelemek biyolojiyle başlar!"
    },
    {
        "name": "Charles Babbage",
        "title": "Bilgisayarın Tasarımcısı ⚙️",
        "emoji": "⚙️",
        "story": "İlk mekanik programlanabilir bilgisayar tasarımını (Fark Motoru ve Analitik Motor) yaptı. Bilgisayarların atası kabul edilir.",
        "quote": "Hataları önlemek, onları düzeltmekten daha kolaydır.",
        "lesson": "Matematiksel mantığı iyi kavrarsan, bilgisayarların nasıl çalıştığını çok kolay çözersin!"
    },
    {
        "name": "Claude Shannon",
        "title": "Bilgi Teorisinin Kurucusu 🔌",
        "emoji": "🔌",
        "story": "Bilgiyi 0 ve 1'lere (bit) dönüştürerek dijital iletişimin temelini attı. Kriptografi ve yapay zeka üzerine ilk çalışmaları yaptı.",
        "quote": "Bilgi, belirsizliği azaltan şeydir.",
        "lesson": "Bugün internetten gönderdiğin her mesaj, Shannon'ın 0 ve 1 mantığı sayesinde hedefine ulaşıyor!"
    },
    {
        "name": "Robert Noyce",
        "title": "Mikroçip Mucidi 🪙",
        "emoji": "🪙",
        "story": "Silikon üzerine transistörleri yerleştirerek entegre devreyi (mikroçipi) icat etti ve Intel firmasını kurdu.",
        "quote": "Yenilik, eski kuralları çiğnemektir.",
        "lesson": "Telefonların ve bilgisayarların içindeki o minik çiplerin nasıl yapıldığını merak et ve araştır!"
    },
    {
        "name": "Gordon Moore",
        "title": "Moore Kanunu Tahmincisi 📈",
        "emoji": "📈",
        "story": "Intel'in kurucularındandır. Mikroçiplerin üzerindeki transistör sayısının her iki yılda bir iki katına çıkacağını tahmin etti.",
        "quote": "Teknoloji hızla küçülüyor ve güçleniyor.",
        "lesson": "Teknolojinin baş döndürücü hızına ayak uydurmak için her gün yeni bir şey öğrenmelisin!"
    },
    {
        "name": "Dennis Ritchie",
        "title": "C Programlama Dilinin Yaratıcısı 💻",
        "emoji": "💻",
        "story": "Modern yazılımların temeli olan C programlama dilini ve Unix işletim sistemini yazdı. Bugün tüm işletim sistemleri onun kodları üzerine kuruludur.",
        "quote": "C dili, bilgisayarı kontrol etmenin en saf yoludur.",
        "lesson": "Yazılımcı olmak istiyorsan, programlama dillerinin atası olan C dilini mutlaka öğren!"
    },
    {
        "name": "Linus Torvalds",
        "title": "Linux Çekirdeği Yaratıcısı 🐧",
        "emoji": "🐧",
        "story": "Dünyanın en büyük açık kaynaklı işletim sistemi çekirdeği olan Linux'u yazdı ve ücretsiz paylaştı. Ayrıca 'Git' sistemini geliştirdi.",
        "quote": "Konuşmak ucuzdur, bana kodu göster.",
        "lesson": "Yazılım projelerini tüm dünya ile paylaşarak açık kaynak dünyasına sen de katkı sunabilirsin!"
    },
    {
        "name": "Vint Cerf",
        "title": "İnternetin Protokol Babası 🌐",
        "emoji": "🌐",
        "story": "Bob Kahn ile birlikte bilgisayarların internette birbiriyle konuşmasını sağlayan TCP/IP protokolünü icat etti.",
        "quote": "İnternet, insanların fikirlerini özgürce paylaştığı küresel bir ağdır.",
        "lesson": "Ağ teknolojilerini öğrenerek sistem mühendisliği alanına adım at!"
    },
    {
        "name": "James Clerk Maxwell",
        "title": "Elektromanyetik Teorinin Kurucusu ⚡",
        "emoji": "⚡",
        "story": "Elektrik ve manyetizmayı birleştiren Maxwell Denklemleri'ni yazdı. Işığın da bir elektromanyetik dalga olduğunu kanıtladı.",
        "quote": "Matematik, doğanın gizli kalmış melodisidir.",
        "lesson": "Elektrik, radyo dalgaları, Wi-Fi ve ışık Maxwell'in denklemleri sayesinde bugün hayatımızda!"
    },
    {
        "name": "Heinrich Hertz",
        "title": "Radyo Dalgalarının Kaşifi 📻",
        "emoji": "📻",
        "story": "Maxwell'in teorisini kanıtlamak için ilk kez yapay radyo dalgaları üretti ve bunları tespit etti. Frekans birimi (Hertz - Hz) onun adıdır.",
        "quote": "Bilimsel kanıt, teorinin tacıdır.",
        "lesson": "Wi-Fi hızlarında gördüğün GHz ve MHz terimleri, Hertz'in bulduğu radyo dalgalarının frekansıdır!"
    },
    {
        "name": "Wilhelm Röntgen",
        "title": "Röntgen Işınlarının Mucidi 🩻",
        "emoji": "🩻",
        "story": "Laboratuvarda çalışırken nesnelerin içinden geçebilen yeni bir ışın keşfetti. İlk Nobel Fizik Ödülü'nü aldı.",
        "quote": "Bilinmeyen ışınlara X-ışını adını verdim.",
        "lesson": "Hastanelerde kırık kemiklerimize bakmak için kullanılan röntgen cihazları Wilhelm'in bu keşfidir!"
    },
    {
        "name": "Arthur Compton",
        "title": "Işığın Saçılması Kaşifi 💡",
        "emoji": "💡",
        "story": "X-ışınlarının elektronlarla çarpışıp saçılmasını (Compton Etkisi) keşfederek ışığın hem dalga hem de parçacık gibi davrandığını kanıtladı.",
        "quote": "Bilim her zaman kendini günceller.",
        "lesson": "Işığın gizemli dünyasını kuantum fiziğiyle keşfetmek en heyecanlı çalışmalardandır!"
    },
    {
        "name": "Louis de Broglie",
        "title": "Dalga-Parçacık İkiliği Kaşifi 🌊",
        "emoji": "🌊",
        "story": "Tüm maddelerin (özellikle elektronların) bir dalga boyuna sahip olduğunu öne sürdü. Dalga mekaniğinin temelini attı.",
        "quote": "Her madde bir dalga melodisi taşır.",
        "lesson": "Fizik dünyasındaki dalga hareketlerini ve dalga mekaniğini öğrenerek ufkunu genişlet!"
    },
    {
        "name": "Wolfgang Pauli",
        "title": "Dışarlama İlkesi Kaşifi ⚛️",
        "emoji": "⚛️",
        "story": "Aynı atom içindeki iki elektronun tüm kuantum durumlarının aynı olamayacağını (Pauli Dışarlama İlkesi) keşfetti.",
        "quote": "Bu sadece yanlış değil, hatta yanlış bile değil.",
        "lesson": "Bilimsel düşüncede netlik ve mantık her şeydir, iddialarını kanıtlara dayandır!"
    },
    {
        "name": "Paul Dirac",
        "title": "Antimaddenin Kaşifi 🌌",
        "emoji": "🌌",
        "story": "Kuantum mekaniği ile görelilik teorisini birleştiren Dirac Denklemi'ni yazdı ve matematiksel olarak 'Antimadde'nin varlığını öngördü.",
        "quote": "Fizikteki yasalar matematiksel güzelliğe sahip olmalıdır.",
        "lesson": "Matematiksel denklemlerin evrendeki görünmez maddeleri nasıl öngördüğünü fark et!"
    },
    {
        "name": "James Chadwick",
        "title": "Nötronun Kaşifi ⚛️",
        "emoji": "⚛️",
        "story": "Atom çekirdeğindeki yüksüz parçacık olan 'Nötron'u keşfetti. Bu keşif nükleer enerjinin yolunu açtı.",
        "quote": "Gerçeği aramak, sabır ve deney gerektirir.",
        "lesson": "Atomun yapısını nötron, proton ve elektron olarak öğrenmek fizik temeli için çok önemlidir!"
    },
    {
        "name": "Murray Gell-Mann",
        "title": "Kuarkların Kaşifi ⚛️",
        "emoji": "⚛️",
        "story": "Proton ve nötronların daha küçük temel parçacıklar olan 'Kuark'lardan oluştuğunu keşfetti. Parçacık fiziğini sınıflandırdı.",
        "quote": "Kuarklar, atomun da altındaki gizli tuğlalardır.",
        "lesson": "Protonun bile bölünemez olmadığını, içinde kuarklar olduğunu bilerek kuantum fiziğine adım at!"
    },
    {
        "name": "Peter Higgs",
        "title": "Higgs Bozonu Kaşifi ⚛️",
        "emoji": "⚛️",
        "story": "Parçacıklara kütlelerini kazandıran Higgs alanını ve bu alanın parçacığı olan Higgs Bozonu'nu öngördü. CERN'de bu parçacık kanıtlandı.",
        "quote": "Teorinin gerçeğe dönüşmesini görmek büyüleyici.",
        "lesson": "CERN laboratuvarındaki devasa parçacık hızlandırıcıları ve yapılan deneyleri araştır!"
    },
    {
        "name": "Roger Penrose",
        "title": "Karadelik Matematikçisi 📐",
        "emoji": "📐",
        "story": "Albert Einstein'ın genel görelilik teorisinden yola çıkarak karadeliklerin oluşumunun kaçınılmaz olduğunu matematiksel olarak kanıtladı.",
        "quote": "Matematik, fiziksel gerçekliğin arkasındaki gizli güçtür.",
        "lesson": "Matematiğin karadelikler gibi devasa uzay oluşumlarını bile nasıl açıkladığını gör!"
    },
    {
        "name": "Donna Strickland",
        "title": "Lazer Teknolojisi Mucidi ⚡",
        "emoji": "⚡",
        "story": "Çok yüksek yoğunluklu ve ultra kısa lazer darbeleri üretme yöntemini geliştirerek tıp ve sanayide lazer devrimi yaptı.",
        "quote": "Lazerler, ışığın odaklanmış en güçlü halidir.",
        "lesson": "Göz ameliyatlarında, barkod okuyucularda kullanılan lazer teknolojisinin arkasındaki fiziği öğren!"
    },
    {
        "name": "Arthur Ashkin",
        "title": "Optik Cımbızların Mucidi 🔬",
        "emoji": "🔬",
        "story": "Lazer ışınlarını kullanarak virüsleri, bakterileri ve hücreleri zarar vermeden yakalayıp hareket ettirebilen 'Optik Cımbızlar'ı icat etti.",
        "quote": "Işıkla maddeleri hareket ettirmeyi başardık.",
        "lesson": "Işığın fiziksel bir itme kuvveti olduğunu bilmek ve onunla hücreleri tutmak harika bir mühendisliktir!"
    },
    {
        "name": "Giorgio Parisi",
        "title": "Karmaşık Sistemlerin Kaşifi 🧠",
        "emoji": "🧠",
        "story": "Biyoloji, fizik ve iklim gibi karmaşık ve düzensiz sistemlerin içindeki gizli kuralları ve düzeni keşfetti.",
        "quote": "Kaosun içinde bile gizli bir matematiksel düzen vardır.",
        "lesson": "Karışık ve dağınık görünen durumların içindeki mantığı çözmek için analitik düşün!"
    },
    {
        "name": "Alain Aspect",
        "title": "Kuantum Dolanıklık Kanıtlayıcısı 📡",
        "emoji": "📡",
        "story": "Birbirinden çok uzakta olan iki kuantum parçacığının anında birbiriyle haberleşebildiğini deneylerle kanıtladı.",
        "quote": "Kuantum bilgi teknolojileri geleceği şekillendirecek.",
        "lesson": "Geleceğin kuantum bilgisayarlarını ve kablosuz kuantum iletişimini şimdiden merak et!"
    },
    {
        "name": "Anne L'Huillier",
        "title": "Attosaniye Fizikçisi 💡",
        "emoji": "💡",
        "story": "Elektronların atom içindeki hareketlerini izleyebilmek için saniyenin kentilyonda biri kadar kısa (attosaniye) ışık atımları üretti.",
        "quote": "Işığın en hızlı anını yakaladık.",
        "lesson": "Elektronların o inanılmaz hızlı hareketlerini izleyen bu ileri düzey teknolojileri araştır!"
    },
    {
        "name": "Antoine Lavoisier",
        "title": "Kimyanın Babası ⚗️",
        "emoji": "⚗️",
        "story": "Kütlenin korunumunu kanıtladı. Maddelerin oksijenle birleşerek yandığını buldu ve kimyayı modern bir bilim haline getirdi.",
        "quote": "Doğada hiçbir şey kaybolmaz, her şey dönüşür.",
        "lesson": "Çevrendeki değişimleri, kimyasal reaksiyonları Lavoisier gibi dikkatle gözlemle!"
    },
    {
        "name": "Robert Oppenheimer",
        "title": "Teorik Fizik Dehası 🧠",
        "emoji": "🧠",
        "story": "Karadeliklerin oluşumu ve kuantum mekaniği üzerine önemli teorik çalışmalar yaptı. Astrofiziğe büyük katkı sağladı.",
        "quote": "Öğrenmek, bilginin derinliğine inmektir.",
        "lesson": "Bilimsel araştırmalarında derinleşmekten ve detaylara odaklanmaktan keyif al!"
    },
    {
        "name": "Guglielmo Marconi",
        "title": "Radyonun Mucidi 📻",
        "emoji": "📻",
        "story": "Kablosuz sinyaller göndererek ilk radyoyu ve kablosuz telgrafı icat etti. İletişimi tüm dünyaya yaydı.",
        "quote": "Uzaklar, sadece bağ kuramadığımız yerlerdir.",
        "lesson": "Bilgiye ve sevdiklerine ulaşmak için teknolojinin gücünü akıllıca kullan!"
    },
    {
        "name": "Bill Gates",
        "title": "Microsoft Kurucusu 💻",
        "emoji": "💻",
        "story": "Windows işletim sistemini kurarak kişisel bilgisayarların her eve girmesini sağladı. Dünyanın en büyük yazılım firmasını yönetti.",
        "quote": "Kendinizi kimseyle kıyaslamayın, yoksa kendinize hakaret edersiniz.",
        "lesson": "Bilgisayarları sadece oyun için değil, yazılım ve üretim için kullan!"
    },
    {
        "name": "Gregor Mendel",
        "title": "Genetik Biliminin Kurucusu 🌱",
        "emoji": "🌱",
        "story": "Bezelyelerle yaptığı deneyler sayesinde canlıların kalıtsal özelliklerinin nesilden nesile nasıl aktarıldığını keşfetti.",
        "quote": "Sabırlı gözlem, en büyük gerçeği ortaya çıkarır.",
        "lesson": "Doğadaki ve bitkilerdeki düzeni Mendel gibi sabırla incelemeyi öğren."
    },
    {
        "name": "Nicolaus Copernicus",
        "title": "Gökbilimci ☀️",
        "emoji": "☀️",
        "story": "Dünya'nın evrenin merkezinde olmadığını, Güneş etrafında dönen gezegenlerden biri olduğunu bilimsel olarak kanıtladı.",
        "quote": "Gerçeği aramak, zihnin en soylu arayışıdır.",
        "lesson": "Genel kabulleri sorgulamaktan çekinme, bilim kanıtlarla ilerler!"
    },
    {
        "name": "Rudolf Diesel",
        "title": "Dizel Motor Mucidi 🚂",
        "emoji": "🚂",
        "story": "Çok daha yüksek basınçla çalışan ve daha verimli olan dizel motorları geliştirdi. Bugün ağır taşıtlar onun motorunu kullanır.",
        "quote": "Verimlilik, doğaya saygıdır.",
        "lesson": "Mühendislik ve motor teknolojilerine şimdiden ilgi duyup tasarımlar yapabilirsin!"
    },
    {
        "name": "Wright Kardeşler",
        "title": "Uçuşun Öncüleri ✈️",
        "emoji": "✈️",
        "story": "Kendi yaptıkları motorlu ve yönlendirilebilir uçakla havadan ağır ilk kontrollü uçuşu gerçekleştirerek tarihe geçtiler.",
        "quote": "Uçmak, rüzgara karşı direnmekle başlar.",
        "lesson": "Büyük hedeflerine ulaşmak için Wright kardeşler gibi cesur ol!"
    },
    {
        "name": "Celal Şengör",
        "title": "Yerbilimci 🌍",
        "emoji": "🌍",
        "story": "Dünya çapında jeoloji araştırmaları yaptı. Levha tektoniği ve dağ oluşumları konularında en saygın bilim insanlarından biridir.",
        "quote": "Bilim, gerçekleri arama sürecidir.",
        "lesson": "Yer bilimlerine ve doğaya merak duyarak dünyamızı koru!"
    },
    {
        "name": "Daniel Bernoulli",
        "title": "Akışkanlar Mekaniği Kaşifi 🌊",
        "emoji": "🌊",
        "story": "Sıvıların ve gazların akış hızları ile basınçları arasındaki ilişkiyi buldu. Uçak kanatlarının uçmasını sağlayan prensiptir.",
        "quote": "Basınç ve hız, akışın dengesidir.",
        "lesson": "Uçakların nasıl uçtuğunu Bernoulli prensibiyle öğren!"
    },
    {
        "name": "Robert Koch",
        "title": "Bakteriyoloji Kurucusu 🦠",
        "emoji": "🦠",
        "story": "Tüberküloz ve kolera gibi hastalıkların mikroplarını keşfetti. Tıpta hijyen ve mikrop teorisini geliştirdi.",
        "quote": "Mikropları görmek, onları yenmenin ilk adımıdır.",
        "lesson": "Hastalıklarla savaşta temizliğin önemini asla unutma!"
    },
    {
        "name": "Joseph Fourier",
        "title": "Sera Etkisi ve Matematikçi 📐",
        "emoji": "📐",
        "story": "Isı yayılımını matematiksel olarak formüle etti ve Dünya'nın atmosferi sayesinde sıcak kaldığını (sera etkisi) ilk fark eden kişi oldu.",
        "quote": "Matematik, doğanın ısı dengesini açıklar.",
        "lesson": "Atmosferin ve iklimin önemini Fourier'in çalışmalarıyla anla!"
    }
];

if (typeof module !== 'undefined') {
    module.exports = HEROES_DATA;
}