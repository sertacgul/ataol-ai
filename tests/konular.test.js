import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KONULAR } from '../src/data/konular/index.js';
import { TAKVIM } from '../src/data/mufredat.js';
import { ureticiVarMi, soruUret } from '../src/engines/uretici/index.js';
import { tohumluRng } from './yardim/soru-sozlesmesi.js';

const FAZ1 = ['temel-cizimler', 'aci-olcme', 'cokgenler-cember'];

test('Faz 1 konularinin hepsi kayitlidir', () => {
  for (const id of FAZ1) {
    assert.ok(KONULAR[id], `${id} kayitli degil`);
    assert.equal(KONULAR[id].id, id, 'id kendi anahtariyla uyusmuyor');
  }
});

test('her konunun Turkce adi ve kazanimlari vardir', () => {
  for (const id of FAZ1) {
    const k = KONULAR[id];
    assert.ok(k.ad?.tr?.length > 3, `${id}: ad yok`);
    assert.ok(Array.isArray(k.kazanimlar) && k.kazanimlar.length >= 1, `${id}: kazanim yok`);
    for (const kz of k.kazanimlar) {
      assert.match(kz.kod, /^MAT\.5\.\d\.\d$/, `${id}: gecersiz kazanim kodu ${kz.kod}`);
      assert.ok(kz.metin.length > 20, `${id}: kazanim metni fazla kisa`);
    }
  }
});

test('takvimin istedigi her seviye yazilmistir', () => {
  for (const hafta of TAKVIM) {
    for (const ders of hafta.dersler) {
      if (!FAZ1.includes(ders.konu)) continue;
      const sev = KONULAR[ders.konu].seviyeler.find((s) => s.seviye === ders.seviye);
      assert.ok(sev, `hafta ${hafta.hafta}: ${ders.konu} seviye ${ders.seviye} yazilmamis`);
    }
  }
});

test('seviye numaralari 1den bosluksuz artar', () => {
  for (const id of FAZ1) {
    KONULAR[id].seviyeler.forEach((s, i) => {
      assert.equal(s.seviye, i + 1, `${id}: seviye sirasi bozuk`);
    });
  }
});

test('her seviyede 4 ile 6 arasi anlatim adimi vardir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.anlatim.length >= 4 && s.anlatim.length <= 6,
        `${id} seviye ${s.seviye}: ${s.anlatim.length} adim`);
    }
  }
});

test('adim kimlikleri a1den bosluksuz artar', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      s.anlatim.forEach((a, i) => {
        assert.equal(a.id, `a${i + 1}`, `${id} seviye ${s.seviye}: adim kimligi ${a.id}`);
      });
    }
  }
});

test('adim metinleri okunabilir uzunluktadir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        const n = a.metin.trim().length;
        assert.ok(n >= 120 && n <= 420,
          `${id} seviye ${s.seviye} ${a.id}: ${n} karakter (120-420 bekleniyor)`);
      }
    }
  }
});

test('anlatim adimlarinda ses alani YOKTUR, kimlikten turetilir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        assert.equal(a.ses, undefined,
          `${id} seviye ${s.seviye} ${a.id}: ses alani elle yazilmamali`);
      }
    }
  }
});

test('metinlerde TTS nin okuyamayacagi sembol yoktur', () => {
  const yasak = ['∠', '°', '≅', '⊥', '∥', '→', '|'];
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      for (const a of s.anlatim) {
        for (const sembol of yasak) {
          assert.ok(!a.metin.includes(sembol),
            `${id} ${a.id}: "${sembol}" sembolu TTS tarafindan okunamaz`);
        }
      }
    }
  }
});

test('her seviyede en az bir ornek ve her ornekte en az iki adim vardir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.ornekler.length >= 1, `${id} seviye ${s.seviye}: ornek yok`);
      for (const o of s.ornekler) {
        assert.ok(o.soru.length > 15, `${id} seviye ${s.seviye}: ornek sorusu kisa`);
        assert.ok(o.adimlar.length >= 2, `${id} seviye ${s.seviye}: ornek cozumu tek adim`);
        assert.ok(String(o.cevap).length > 0, `${id} seviye ${s.seviye}: ornek cevabi yok`);
      }
    }
  }
});

test('her seviyede etkilesim, uretici ve quiz tanimlidir', () => {
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(s.etkilesim?.widget, `${id} seviye ${s.seviye}: widget yok`);
      assert.ok(s.etkilesim?.gorev?.length > 10, `${id} seviye ${s.seviye}: gorev metni yok`);
      assert.equal(s.uretici, id, `${id} seviye ${s.seviye}: uretici kimligi yanlis`);
      assert.ok(ureticiVarMi(s.uretici), `${id}: uretici kayitli degil`);
      assert.equal(s.quiz.soruSayisi, 10, `${id} seviye ${s.seviye}: quiz soru sayisi`);
      assert.equal(s.quiz.gecmeNotu, 70, `${id} seviye ${s.seviye}: quiz gecme notu`);
    }
  }
});

test('seviye basliklari benzersizdir', () => {
  for (const id of FAZ1) {
    const basliklar = KONULAR[id].seviyeler.map((s) => s.baslik);
    assert.equal(new Set(basliklar).size, basliklar.length, `${id}: tekrar eden baslik`);
    for (const b of basliklar) assert.ok(b.length > 4, `${id}: baslik fazla kisa`);
  }
});

test('kullanilan widget kimlikleri Faz 1 de var olanlardir', () => {
  const mevcut = ['geometri-tuval', 'aciolcer'];
  for (const id of FAZ1) {
    for (const s of KONULAR[id].seviyeler) {
      assert.ok(mevcut.includes(s.etkilesim.widget),
        `${id} seviye ${s.seviye}: "${s.etkilesim.widget}" Faz 1 de yok`);
    }
  }
});

// --- Ders metni ile soru ureticisinin eslesmesi ---------------------
//
// Bu testin varlik nedeni: bir uretici tablosuna yeni bir kavram
// eklendiginde (ornegin VARLIKLAR'a yeni bir sekil) ders metni sessizce
// geride kalir ve cocuk hic ogretilmemis bir seyden sinava girer.
// Baska hicbir test bunu yakalamaz.
//
// Yalniz KATEGORIK cevaplar aranir. Sayisal cevaplar ("115", "7")
// disarida birakilir, cunku bir sayinin ders metninde harfiyen gecmesi
// beklenmez; sayisal sorularda ogretilmesi gereken sey kuraldir ve o
// kural zaten kategorik terimlerle anlatilir.
//
// Arama KUMULATIFTIR: 6. hafta 5. haftanin metnine yaslanabilir.

const KUCUK = (s) => String(s).toLocaleLowerCase('tr');

const sayisalMi = (cevap) => /^[0-9]+$/.test(String(cevap).trim());

function seviyeMetni(seviye) {
  const parcalar = [seviye.baslik];
  for (const a of seviye.anlatim) parcalar.push(a.metin);
  for (const o of seviye.ornekler) {
    parcalar.push(o.soru, String(o.cevap), ...o.adimlar);
  }
  return KUCUK(parcalar.join(' '));
}

function kategorikCevaplar(konuId, seviyeNo, tur = 300) {
  const cevaplar = new Set();
  for (let tohum = 1; tohum <= tur; tohum++) {
    const soru = soruUret(konuId, seviyeNo, tohumluRng(tohum));
    const cevap = soru.bicim === 'secmeli' ? soru.secenekler[soru.dogru] : soru.cevap;
    if (!sayisalMi(cevap)) cevaplar.add(String(cevap).trim());
  }
  return cevaplar;
}

test('uretici cevaplari o haftaya kadarki ders metninde gecer', () => {
  for (const id of FAZ1) {
    let birikmis = '';
    for (const s of KONULAR[id].seviyeler) {
      birikmis += ' ' + seviyeMetni(s);
      for (const cevap of kategorikCevaplar(id, s.seviye)) {
        assert.ok(birikmis.includes(KUCUK(cevap)),
          `${id} seviye ${s.seviye}: uretici "${cevap}" cevabini soruyor ` +
          'ama bu terim o haftaya kadarki ders metninde hic gecmiyor');
      }
    }
  }
});

// --- Sayisal cevapli seviyelerin kural sozlugu ----------------------
//
// Yukaridaki kategorik denetim, dogru cevabi sayi olan seviyelerde
// hicbir sey dogrulamaz: aci-olcme seviye 2 ile cokgenler-cember
// seviye 2'de butun cevaplar sayidir. Oysa o seviyelerde ogretilmesi
// gereken sey kuralin ADIDIR. Bu harita o adlari ariyor.
//
// Deger olarak bos dizi yazmak "bu tip icin ek terim gerekmiyor"
// demektir ve gerekcesi yorumda durur; cogu tipte kategorik denetim
// zaten dogru cevabin kendisini terim olarak zorunlu kiliyor.
//
// Haritada olmayan bir tip testi kirar. Boylece bir ureticiye yeni
// soru tipi eklendiginde birinin oturup "bu tipin ogretilmesi gereken
// terimi var mi" diye dusunmesi zorunlu olur; harita da boylece
// curumez.
const TIP_TERIMLERI = {
  // Cevaplari sekil ve arac adlari; kategorik denetim kapsiyor.
  'temel-cizimler-arac': [],
  'temel-cizimler-tanim': [],
  'temel-cizimler-gosterim': [],
  // Cevabi uc sayisi, yani sayi. Ama uc sayisi sorulan sekillerin
  // adlari ayni seviyenin gosterim sorusunda kategorik olarak zaten
  // isteniyor; ek terim aranmiyor.
  'temel-cizimler-uc': [],
  // Cevaplari aci turlerinin adlari; kategorik denetim kapsiyor.
  'aci-olcme-tur': [],
  // Cevabi derece, yani sayi; bu tip icin kategorik denetim de bir sey
  // dogrulamiyor. "aciolcer" terimini zorunlu kilmak dusunulebilir ama
  // simdilik istenmedi, bkz. rapor.
  'aci-olcme-okuma': [],
  // Bundan sonrasi seviye 2: cevaplarin hepsi sayi, kategorik denetim
  // bu seviyede hicbir sey dogrulamiyor. Kural adlari burada zorunlu.
  'aci-olcme-butunler': ['bütünler'],
  'aci-olcme-tumler': ['tümler'],
  'aci-olcme-ters': ['ters'],
  // Cevabi cokgen adi; kategorik denetim kapsiyor.
  'cokgen-olusum': [],
  // Cevaplari alti cokgen adi. Bunlari seviye 1'in kategorik denetimi
  // zaten birikimli olarak zorunlu kiliyor; burada tekrar istemek
  // koruma eklemez, yalniz tekrar olurdu.
  'cokgen-ad': [],
  // Cevabi kose sayisi, yani sayi. Kelimenin kendisi aranir.
  'cokgen-kenar-kose': ['köşe'],
  // Cevaplari ucgen turlerinin adlari; kategorik denetim kapsiyor.
  'cember-ucgen-tur': [],
  // Cevabi yaricap uzunlugu, yani sayi; bu tip icin kategorik denetim
  // de bir sey dogrulamiyor. "yaricap" terimini zorunlu kilmak
  // dusunulebilir ama simdilik istenmedi, bkz. rapor.
  'cember-yaricap': []
};

function uretilenTipler(konuId, seviyeNo, tur = 300) {
  const tipler = new Set();
  for (let tohum = 1; tohum <= tur; tohum++) {
    tipler.add(soruUret(konuId, seviyeNo, tohumluRng(tohum)).tip);
  }
  return tipler;
}

test('her soru tipinin gerektirdigi kural adi ders metninde gecer', () => {
  for (const id of FAZ1) {
    let birikmis = '';
    for (const s of KONULAR[id].seviyeler) {
      birikmis += ' ' + seviyeMetni(s);
      for (const tip of uretilenTipler(id, s.seviye)) {
        const terimler = TIP_TERIMLERI[tip];
        assert.ok(Array.isArray(terimler),
          `${id} seviye ${s.seviye}: "${tip}" soru tipi TIP_TERIMLERI haritasinda yok. ` +
          'Bu tipin ogretilmesi gereken terimlerini haritaya ekle; ' +
          'gerekmiyorsa gerekcesini yazip bos dizi koy.');
        for (const terim of terimler) {
          assert.ok(birikmis.includes(KUCUK(terim)),
            `${id} seviye ${s.seviye} (${tip}): "${terim}" terimi ` +
            'o haftaya kadarki ders metninde hic gecmiyor');
        }
      }
    }
  }
});
