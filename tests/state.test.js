import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage, memoryBackend } from '../src/core/storage.js';
import { createAppState } from '../src/core/state.js';
import { seedProfile } from '../src/data/defaults.js';

function kur() {
  const storage = createStorage(memoryBackend(), 'ataol2');
  const state = createAppState(storage);
  const profile = seedProfile({
    childName: 'X',
    birthYear: 2016,
    guardians: [{ name: 'A', label: 'Baba', pinHash: 'h', pinSalt: 's' }]
  });
  state.saveProfile(profile);
  return { storage, state, profile };
}

test('profil kaydedilip geri okunur', () => {
  const { state, profile } = kur();
  assert.equal(state.loadProfile().child.name, profile.child.name);
});

test('profil yoksa null doner', () => {
  const state = createAppState(createStorage(memoryBackend(), 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('gun ilerlemesi gune gore ayri tutulur', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.loadDayProgress('2026-07-24').stars, 5);
  assert.equal(state.loadDayProgress('2026-07-25').stars, 9);
});

test('kaydedilmemis gun bos ilerleme dondurur', () => {
  const { state } = kur();
  const dp = state.loadDayProgress('2026-01-01');
  assert.equal(dp.stars, 0);
  assert.deepEqual(dp.cards, {});
});

test('gun kaydetmek diger gunleri silmez', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(Object.keys(state.allDays()).length, 2);
});

test('toplam yildiz tum gunleri toplar', () => {
  const { state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  state.saveDayProgress('2026-07-25', { cards: {}, approvals: [], stars: 9, minutes: 9 });
  assert.equal(state.totalStars(), 14);
});

test('alistirma ilk seviyeyle baslar', () => {
  const { state } = kur();
  const d = state.loadDrill();
  assert.equal(d.level, 'topla-10');
  assert.ok(Object.keys(d.byLevel['topla-10']).length > 0);
});

test('alistirma kaydedilip geri okunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  const k = Object.keys(d.byLevel[d.level])[0];
  d.byLevel[d.level][k] = { ...d.byLevel[d.level][k], box: 4 };
  state.saveDrill(d);
  assert.equal(state.loadDrill().byLevel['topla-10'][k].box, 4);
});

test('seviye atlaninca onceki seviyenin kutulari korunur', () => {
  const { state } = kur();
  const d = state.loadDrill();
  d.level = 'cikar-10';
  state.saveDrill(d);
  const yeni = state.loadDrill();
  assert.ok(yeni.byLevel['topla-10'], 'eski seviye silinmis');
  assert.ok(yeni.byLevel['cikar-10'], 'yeni seviye acilmamis');
});

test('gunluk kaydedilip geri okunur, varsayilani bostur', () => {
  const { state } = kur();
  assert.deepEqual(state.loadDiary(), {});
  state.saveDiary({ '2026-07-24': [{ tag: 'uyku', note: '', time: null }] });
  assert.equal(state.loadDiary()['2026-07-24'].length, 1);
});

test('depolama sadece bilinen anahtarlari kullanir', () => {
  const { storage, state } = kur();
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 1, minutes: 1 });
  state.saveDrill(state.loadDrill());
  state.saveDiary({});
  state.saveTimeFacts({});
  state.saveGame('amiral', { x: 1 });
  state.saveChess({});
  state.migrateOnce(() => null);
  const bilinen = ['profile', 'days', 'drill', 'diary', 'timefacts', 'chess', 'legacy', 'migrated'];
  for (const k of storage.keys()) {
    assert.ok(bilinen.includes(k) || k.startsWith('game:'), `beklenmeyen anahtar: ${k}`);
  }
});

test('oyun durumu kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(state.loadGame('amiral'), null);
  state.saveGame('amiral', { tur: 3 });
  assert.equal(state.loadGame('amiral').tur, 3);
});

test('takvim olgulari kaydedilip geri okunur', () => {
  const { state } = kur();
  assert.equal(Object.keys(state.loadTimeFacts()).length, 4);
  state.saveTimeFacts({ ay: { kind: 'ay', box: 3, seen: 1, correct: 1, wrong: 0, avgMs: 0, lastSeen: null } });
  assert.equal(state.loadTimeFacts().ay.box, 3);
});

test('satranc ilerlemesi kaydedilip geri okunur, varsayilani bostur', () => {
  const { state } = kur();
  assert.deepEqual(state.loadChess(), {});
  state.saveChess({ 'K:serbest': { box: 2, seen: 1, correct: 1, wrong: 0 } });
  assert.equal(state.loadChess()['K:serbest'].box, 2);
});

test('bozuk profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', '{}');
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('yanlis sema surumlu profil null olarak okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:profile', JSON.stringify({ schemaVersion: 99, child: { name: 'X', birthYear: 2016 } }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.loadProfile(), null);
});

test('bozuk gun kaydi normalize edilerek okunur', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:days', JSON.stringify({ '2026-07-24': {} }));
  const state = createAppState(createStorage(backend, 'ataol2'));
  const dp = state.loadDayProgress('2026-07-24');
  assert.deepEqual(dp.cards, {});
  assert.equal(dp.stars, 0);
});

// --- v1 -> v2 tasima ---

// v1 anahtarlari on ek ALMAZ; v2 depolamasi 'ataol2:' on ekiyle calisir.
// Ikisi ayni backend'de yan yana durur, tam tarayicidaki gibi.
function v1Kurulu(v1Veri) {
  const backend = memoryBackend();
  for (const [k, v] of Object.entries(v1Veri)) backend.setItem(k, v);
  const state = createAppState(createStorage(backend, 'ataol2'));
  const okumalar = [];
  const getRaw = (anahtar) => {
    okumalar.push(anahtar);
    return backend.getItem(anahtar);
  };
  return { backend, state, getRaw, okumalar };
}

test('toplam yildiz miras yildizi gunlerin ustune ekler', () => {
  const { state, getRaw } = v1Kurulu({ ataol_stars: '42' });
  state.saveDayProgress('2026-07-24', { cards: {}, approvals: [], stars: 5, minutes: 5 });
  assert.equal(state.totalStars(), 5, 'tasimadan once sadece gunun yildizi olmali');

  state.migrateOnce(getRaw);
  assert.equal(state.totalStars(), 47, '5 gunluk + 42 miras');

  // Miras yildiz gun raporlarini bozmamali.
  assert.equal(Object.keys(state.allDays()).length, 1, 'tasima sahte gun uydurmus');
  assert.equal(state.loadDayProgress('2026-07-24').stars, 5);
});

test('migrateOnce iki kez cagrilinca yildiz IKI KEZ EKLENMEZ', () => {
  const { state, getRaw, okumalar } = v1Kurulu({ ataol_stars: '42' });

  // 1) Baslangic durumu: ortada hic yildiz yok.
  assert.equal(state.totalStars(), 0);

  // 2) Ilk cagri GERCEKTEN yildiz ekliyor mu? Eklemiyorsa bu testin
  //    tamami bos gecerdi.
  const ilk = state.migrateOnce(getRaw);
  assert.equal(ilk.zatenTasinmis, false, 'ilk cagri tasima yapmis olmali');
  assert.equal(ilk.legacyStars, 42);
  assert.equal(ilk.tasinacakVarMi, true);
  assert.equal(state.totalStars(), 42, 'ilk cagri yildizi eklemedi, test anlamsiz olurdu');
  const ilkOkumaSayisi = okumalar.length;
  assert.ok(ilkOkumaSayisi > 0, 'ilk cagri v1 depolamasini hic okumamis');

  // 3) Ikinci cagri GERCEKTEN yapiliyor mu? Donen deger bunu kanitlar.
  const ikinci = state.migrateOnce(getRaw);
  assert.equal(ikinci.zatenTasinmis, true, 'ikinci cagri koruma dalina girmeliydi');

  // 4) Ikinci cagri v1'i tekrar okumadi bile.
  assert.equal(okumalar.length, ilkOkumaSayisi, 'ikinci cagri v1 depolamasini yeniden okumus');

  // 5) Ve yildiz iki katina cikmadi.
  assert.equal(state.totalStars(), 42, 'yildiz ikinci kez eklenmis');

  // 6) Ucuncu cagri da guvenli.
  state.migrateOnce(getRaw);
  assert.equal(state.totalStars(), 42);
});

test('tasima arasinda v1 yildizi artarsa ikinci kez alinmaz', () => {
  const { backend, state, getRaw } = v1Kurulu({ ataol_stars: '42' });
  state.migrateOnce(getRaw);
  assert.equal(state.totalStars(), 42);

  // Cocuk yarin yine v1'i acip yildiz kazanirsa v2 bunu tekrar toplamamali.
  backend.setItem('ataol_stars', '50');
  assert.equal(backend.getItem('ataol_stars'), '50', 'kurulum adimi tutmadi');
  state.migrateOnce(getRaw);
  assert.equal(state.totalStars(), 42, 'v1 yeniden okunmus ve yildiz sisirilmis');
});

test('tasimadan sonra v1 anahtarlari hala yerinde', () => {
  const v1Veri = {
    ataol_stars: '42',
    ataol_unlocked_badges: '["ilk_adim"]',
    ataol_read_heroes: '["ataturk"]',
    ataol_solved_riddles: '["bilmece1"]',
    ataol_api_key: 'sk-abc',
    ataol_completed_math_tables: '[2,3,4,5]',
    ataol_messages: '[{"role":"user","text":"selam"}]',
    ataol_correct_answers: '99',
    ataol_week: '3'
  };
  const { backend, state, getRaw } = v1Kurulu(v1Veri);
  const sonuc = state.migrateOnce(getRaw);
  assert.equal(sonuc.tasinacakVarMi, true, 'tasima gercekten calismadiysa bu test bos gecer');

  for (const [k, v] of Object.entries(v1Veri)) {
    assert.equal(backend.getItem(k), v, `${k} silinmis ya da uzerine yazilmis`);
  }
});

test('tasima carpim tablosu ilerlemesini ve sohbeti depoya yazmaz', () => {
  const { backend, state, getRaw } = v1Kurulu({
    ataol_stars: '42',
    ataol_completed_math_tables: '[2,3,4,5]',
    ataol_messages: '[{"role":"user","text":"annen Feris"}]'
  });
  state.migrateOnce(getRaw);

  const v2Icerik = [];
  for (let i = 0; i < backend.length; i++) {
    const k = backend.key(i);
    if (k && k.startsWith('ataol2:')) v2Icerik.push(`${k}=${backend.getItem(k)}`);
  }
  const hepsi = v2Icerik.join('\n');
  assert.ok(hepsi.includes('42'), 'v2 tarafina hic yazilmamis, test bos geciyor');
  assert.ok(!hepsi.includes('2,3,4,5'), 'carpim tablosu v2 depolamasina sizmis');
  assert.ok(!hepsi.toLowerCase().includes('feris'), 'sohbet v2 depolamasina sizmis');
});

test('miras rozet ve api anahtari okunabilir kalir', () => {
  const { state, getRaw } = v1Kurulu({
    ataol_stars: '3',
    ataol_unlocked_badges: '["ilk_adim","matematikci"]',
    ataol_api_key: 'sk-abc'
  });
  state.migrateOnce(getRaw);
  const miras = state.loadLegacy();
  assert.deepEqual(miras.badges, ['ilk_adim', 'matematikci']);
  assert.equal(miras.apiKey, 'sk-abc');
  assert.equal(miras.stars, 3);
});

test('tasinacak veri yoksa miras bos kalir', () => {
  const { state, getRaw } = v1Kurulu({});
  const sonuc = state.migrateOnce(getRaw);
  assert.equal(sonuc.tasinacakVarMi, false);
  assert.equal(state.totalStars(), 0);
  assert.deepEqual(state.loadLegacy(), {
    stars: 0, badges: [], readHeroes: [], solvedRiddles: [], apiKey: ''
  });
});

test('miras kaydi bozuksa toplam yildiz cokmez', () => {
  const backend = memoryBackend();
  backend.setItem('ataol2:legacy', '"bozuk"');
  const state = createAppState(createStorage(backend, 'ataol2'));
  assert.equal(state.totalStars(), 0);
  assert.deepEqual(state.loadLegacy().badges, []);
});

test('bakim vereni olmayan tohum profil gecerli sayilir', () => {
  const backend = memoryBackend();
  const s = createAppState(createStorage(backend, 'ataol2'));
  s.saveProfile(seedProfile({ childName: 'X', birthYear: 2016, guardians: [] }));
  assert.ok(s.loadProfile(), 'bakim veren yoklugu profili gecersiz yapmamali');
});
