import { test } from 'node:test';
import assert from 'node:assert/strict';
import { v1Oku, tasimaPlani } from '../src/engines/migrate.js';

const sahteDepo = (veri) => (anahtar) => (anahtar in veri ? veri[anahtar] : null);

test('yildiz ve rozet tasinir', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_stars: '42',
    ataol_unlocked_badges: '["ilk_adim","matematikci"]'
  }));
  const p = tasimaPlani(v1);
  assert.strictEqual(p.legacyStars, 42);
  assert.deepStrictEqual(p.badges, ['ilk_adim', 'matematikci']);
  assert.strictEqual(p.tasinacakVarMi, true);
});

test('carpim tablosu ilerlemesi TASINMAZ', () => {
  const v1 = v1Oku(sahteDepo({ ataol_completed_math_tables: '[2,3,4,5]' }));
  const p = tasimaPlani(v1);
  assert.ok(!('completedMathTables' in p), 'yetenek devralinmaz, yeniden olculur');
  assert.ok(!JSON.stringify(p).includes('2,3,4,5'), 'tablo verisi plana hicbir sekilde sizmamali');
});

test('sohbet gecmisi TASINMAZ', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_messages: '[{"role":"user","text":"annen Feris"}]'
  }));
  const p = tasimaPlani(v1);
  assert.ok(!JSON.stringify(p).toLowerCase().includes('feris'),
    'eski sohbet ve icindeki aile hatasi gelecege tasinmamali');
});

test('bos depoda tasinacak bir sey yoktur', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({})));
  assert.strictEqual(p.tasinacakVarMi, false);
  assert.strictEqual(p.legacyStars, 0);
});

test('sadece sifir yildiz varsa tasinacak sey yok sayilir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_stars: '0' })));
  assert.strictEqual(p.tasinacakVarMi, false, 'sifir yildiz tasima ekrani acmamali');
});

test('bozuk JSON cokertmez', () => {
  const v1 = v1Oku(sahteDepo({
    ataol_unlocked_badges: '{bozuk',
    ataol_read_heroes: 'null',
    ataol_stars: 'abc'
  }));
  const p = tasimaPlani(v1);
  assert.strictEqual(p.legacyStars, 0);
  assert.deepStrictEqual(p.badges, []);
  assert.deepStrictEqual(p.readHeroes, []);
});

test('plan JSON guvenlidir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_stars: '5' })));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(p)), p);
});

// --- Yukaridakiler plandaki testler. Asagisi bos gecmeyi engelleyen ek olculer. ---

test('v1Oku yasakli anahtarlara hic dokunmaz', () => {
  const sorulan = [];
  const veri = {
    ataol_stars: '7',
    ataol_completed_math_tables: '[2,3]',
    ataol_messages: '[{"text":"x"}]',
    ataol_correct_answers: '99',
    ataol_week: '3'
  };
  v1Oku((anahtar) => {
    sorulan.push(anahtar);
    return anahtar in veri ? veri[anahtar] : null;
  });

  // Once okuyucunun gercekten calistigini kanitla, sonra neyi okumadigini.
  assert.ok(sorulan.length > 0, 'okuyucu hic cagrilmadi, bu test bos geciyor olurdu');
  assert.ok(sorulan.includes('ataol_stars'), 'yildiz anahtari hic sorulmadi');
  for (const yasak of ['ataol_completed_math_tables', 'ataol_messages',
    'ataol_correct_answers', 'ataol_week']) {
    assert.ok(!sorulan.includes(yasak), `${yasak} okunmamaliydi`);
  }
});

test('api anahtari tasinir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_api_key: '  sk-abc  ' })));
  assert.strictEqual(p.apiKey, 'sk-abc');
  assert.strictEqual(p.tasinacakVarMi, true, 'sohbet anahtari tek basina da tasinmali');
});

test('bos api anahtari tasinacak sey sayilmaz', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_api_key: '   ' })));
  assert.strictEqual(p.apiKey, '');
  assert.strictEqual(p.tasinacakVarMi, false);
});

test('negatif yildiz sifira duser', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_stars: '-5' })));
  assert.strictEqual(p.legacyStars, 0);
  assert.strictEqual(p.tasinacakVarMi, false);
});

test('metin olmayan ham deger cokertmez', () => {
  const p = tasimaPlani(v1Oku(() => undefined));
  assert.strictEqual(p.legacyStars, 0);
  assert.deepStrictEqual(p.badges, []);
  assert.strictEqual(p.apiKey, '');
  assert.strictEqual(p.tasinacakVarMi, false);
});

test('plan alanlari v1 dizilerinden bagimsizdir', () => {
  const v1 = v1Oku(sahteDepo({ ataol_read_heroes: '["ataturk"]' }));
  const p = tasimaPlani(v1);
  p.readHeroes.push('sizinti');
  assert.deepStrictEqual(v1.readHeroes, ['ataturk'], 'plan v1 nesnesini degistirmemeli');
});

test('sadece okunan rozet varken tasinacak vardir', () => {
  const p = tasimaPlani(v1Oku(sahteDepo({ ataol_solved_riddles: '["bilmece1"]' })));
  assert.deepStrictEqual(p.solvedRiddles, ['bilmece1']);
  assert.strictEqual(p.legacyStars, 0);
  assert.strictEqual(p.tasinacakVarMi, true);
});
