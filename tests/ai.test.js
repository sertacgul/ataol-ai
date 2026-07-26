import test from 'node:test';
import assert from 'node:assert/strict';
import { duzMetin, sistemIstemi, istekGovdesi, yanitAyikla } from '../src/engines/ai.js';

// Plandaki baglam + bakimVerenAdi.
// Bakim verenin adi motorun icine yazilamaz: tests/architecture.test.js
// "core ve engines icinde kisi adi sabit yazili degil" testi src/engines
// altinda "Feride" gecmesini yasakliyor. Bu yuzden ad baglamdan gelir.
const baglam = {
  cocukAdi: 'Deha',
  bakimVerenAdi: 'Feride Mama',
  seviyeAdi: '2-5 arası çarpım',
  gun: 'Pazar',
  ay: 'Temmuz',
  mevsim: 'Yaz'
};

test('markdown temizlenir', () => {
  assert.equal(duzMetin('**kalin** ve *egik*'), 'kalin ve egik');
  assert.equal(duzMetin('# Baslik\nmetin'), 'Baslik\nmetin');
  assert.equal(duzMetin('`kod`'), 'kod');
  assert.equal(duzMetin('- madde'), '• madde');
});

test('carpma isareti bozulmaz', () => {
  // Tek yildiz kalibinin cevresinde bosluk arar; carpma ifadesi korunmali.
  assert.equal(duzMetin('6 * 8 = 48'), '6 * 8 = 48');
});

test('istem aile gercegini icerir ve yasakli ifadeleri icermez', () => {
  const s = sistemIstemi(baglam);
  assert.ok(s.includes('Feride Mama'));
  for (const y of ['annen', 'annecigin', 'Feride maman']) {
    assert.ok(!s.includes(`"${y}"`) || s.includes('ASLA'), `${y} yasak baglaminda gecmeli`);
  }
  assert.ok(/ANNES[İI] DE[ĞG][İI]LD[İI]R/i.test(s), 'aile gercegi acikca yazilmali');
});

test('istem yildiz vaadini YASAKLAR', () => {
  const s = sistemIstemi(baglam);
  assert.ok(/y[ıi]ld[ıi]z/i.test(s), 'yildiz konusu gecmeli');
  assert.ok(/vaat etme|s[öo]z verme|veremezsin|yasak/i.test(s),
    'yildiz vaadi acikca yasaklanmali; v1 bunu yapmiyordu ve cocuk sohbetten yildiz topluyordu');
});

test('istem marka adi icermez', () => {
  const s = sistemIstemi(baglam);
  for (const marka of ['Gemini', 'OpenAI', 'ChatGPT', 'Anthropic', 'Claude']) {
    // Yalnizca "bu isimleri kullanma" talimati olarak gecebilir.
    if (s.includes(marka)) {
      assert.ok(/ge[çc]memelidir|kullanma|asla/i.test(s), `${marka} yalniz yasak listesinde gecebilir`);
    }
  }
  assert.ok(s.includes('ATAOL AI Techs'));
});

test('istem cocugun GERCEK seviyesini tasir', () => {
  const s = sistemIstemi(baglam);
  assert.ok(s.includes('2-5 arası çarpım'), 'uydurma mufredat degil gercek seviye');
});

test('istek govdesi gecmisi sirasiyla tasir', () => {
  const g = istekGovdesi('SISTEM', [{ rol: 'cocuk', metin: 'merhaba' }], 'nasilsin');
  const json = JSON.stringify(g);
  assert.ok(json.indexOf('merhaba') < json.indexOf('nasilsin'), 'gecmis once gelmeli');
  assert.deepEqual(JSON.parse(json), g, 'govde JSON guvenli olmali');
});

test('istek govdesi dusunmeyi kapatir (yanit yarida kesilmesin)', () => {
  // 2.5-flash dusunme jetonlari maxOutputTokens'a sayilir; acik kalirsa
  // gorunur cumle yarida kesiliyordu. Bu kapali kalmali.
  const g = istekGovdesi('SISTEM', [], 'selam');
  assert.equal(g.generationConfig.thinkingConfig.thinkingBudget, 0);
});

test('yanit ayiklama bozuk cevapta cokmez', () => {
  assert.equal(yanitAyikla(null), null);
  assert.equal(yanitAyikla({}), null);
  assert.equal(yanitAyikla({ candidates: [] }), null);
  assert.equal(
    yanitAyikla({ candidates: [{ content: { parts: [{ text: '**selam**' }] } }] }),
    'selam',
    'ayiklama duzMetin sonucunu dondurmeli'
  );
});

// --- Plandaki testlerin bos gecmesini engelleyen ek olcumler ---
// Bu projede daha once dongusu donmeyen / dali calismayan testler yesil
// gorunmustu. Asagidakiler ayni dallari, dalin gercekten calistigini
// olcerek tekrar sinar.

test('marka yasagi testinin dali gercekten calisir', () => {
  const s = sistemIstemi(baglam);
  let gorulen = 0;
  for (const marka of ['Gemini', 'OpenAI', 'ChatGPT']) {
    if (s.includes(marka)) gorulen++;
  }
  assert.ok(gorulen >= 3, `marka adlari yasak listesinde gecmeli, gorulen: ${gorulen}`);
  // Yasak, marka adlarinin gectigi cumlenin kendisinde olmali.
  const markaliCumle = cumleler(s).find((c) => c.includes('Gemini'));
  assert.ok(markaliCumle, 'Gemini yasak cumlesi bulunamadi');
  assert.ok(/ge[çc]memelidir|kullanma|ASLA/i.test(markaliCumle),
    `marka adi yasak baglami disinda geciyor: ${markaliCumle}`);
});

test('yildiz yasagi ayni cumlede acikca yazilir', () => {
  const s = sistemIstemi(baglam);
  const yasakCumlesi = cumleler(s).find(
    (c) => /y[ıi]ld[ıi]z/i.test(c) && /vaat etme|s[öo]z verme|veremezsin|YASAK/i.test(c)
  );
  assert.ok(yasakCumlesi, 'yildiz ve yasak ayni cumlede gecmeli, dagitik kelimeler yetmez');
  assert.ok(/ASLA|YASAK/.test(s), 'yasak buyuk harfle vurgulanmali');
});

test('istem kisisel veri istemeyi yasaklar', () => {
  const s = sistemIstemi(baglam);
  for (const alan of ['adres', 'okul ad', 'sağlık']) {
    assert.ok(s.includes(alan), `kisisel veri yasaginda "${alan}" gecmeli`);
  }
});

test('istem kisaligi ve duz metni sart kosar', () => {
  const s = sistemIstemi(baglam);
  assert.ok(/1-2 c[üu]mle/i.test(s), 'kisalik kurali yazili olmali');
  assert.ok(/D[ÜU]Z MET[İI]N/i.test(s), 'duz metin kurali yazili olmali');
  assert.ok(s.includes('ATAOL API Anahtarı'), 'anahtar adi ATAOL olmali');
});

test('istem gun ay mevsimi baglamdan alir, kendi hesaplamaz', () => {
  const s = sistemIstemi(baglam);
  assert.ok(s.includes('Pazar') && s.includes('Temmuz') && s.includes('Yaz'));
  const baska = sistemIstemi({ ...baglam, gun: 'Salı', ay: 'Ocak', mevsim: 'Kış' });
  assert.ok(baska.includes('Salı') && baska.includes('Ocak') && baska.includes('Kış'));
  assert.ok(!baska.includes('Temmuz'), 'tarih sabit yazilmamali');
});

test('istem cocugun adini baglamdan alir', () => {
  const s = sistemIstemi({ ...baglam, cocukAdi: 'Zeynep' });
  assert.ok(s.includes('Zeynep'));
  assert.ok(!s.includes('Deha'), 'cocuk adi sabit yazilmamali');
});

test('gecmis rolleri API rollerine cevrilir', () => {
  const g = istekGovdesi('S', [
    { rol: 'cocuk', metin: 'a' },
    { rol: 'ai', metin: 'b' }
  ], 'c');
  assert.deepEqual(g.contents.map((c) => c.role), ['user', 'model', 'user']);
  assert.deepEqual(g.contents.map((c) => c.parts[0].text), ['a', 'b', 'c']);
  assert.equal(g.systemInstruction.parts[0].text, 'S');
});

test('duzMetin bos girdide bos doner', () => {
  assert.equal(duzMetin(''), '');
  assert.equal(duzMetin(null), '');
  assert.equal(duzMetin(undefined), '');
});

test('yanit ayiklama sadece bosluk iceren cevapta null doner', () => {
  assert.equal(yanitAyikla({ candidates: [{ content: { parts: [{ text: '   ' }] } }] }), null);
});

function cumleler(metin) {
  return metin.split(/(?<=[.!?:])\s+|\n/).filter((c) => c.trim().length > 0);
}

test('turkce sevgi eki kodla uretilmez', () => {
  // "${ad}cigim" Deha icin dogru cikar ama ek ses uyumuna tabidir:
  // Ali > Aliciğim, Zeynep > Zeynepçiğim. Kodla uretirsek uygulama
  // baska cocuklara acildiginda isimlerin cogunda Turkce bozulur.
  for (const ad of ['Ali', 'Zeynep', 'Ömer', 'Elif']) {
    const s = sistemIstemi({ ...baglam, cocukAdi: ad });
    assert.ok(s.includes(ad), `test anlamsiz: ${ad} isteme hic girmemis`);
    assert.ok(!s.includes(`${ad}cığım`), `${ad}cığım yanlis Turkce, ek kodla uretilmis`);
  }
});
