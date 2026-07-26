import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedProfile, ROUTINE_TEMPLATES, DEFAULT_CARDS } from '../src/data/defaults.js';
import { validateProfile } from '../src/core/profile.js';
import { BLOCKS } from '../src/engines/routine.js';

const OLCULEBILIR = new Set(['sabah-takvim', 'ogle-matematik']);

test('uc sablon var: okuloncesi, ilkokul, ortaokul', () => {
  assert.deepEqual(
    ROUTINE_TEMPLATES.map((t) => t.id).sort(),
    ['ilkokul', 'okuloncesi', 'ortaokul']
  );
  for (const t of ROUTINE_TEMPLATES) {
    assert.ok(t.title && t.title.trim(), `${t.id} title bos`);
    assert.ok(t.aciklama && t.aciklama.trim(), `${t.id} aciklama bos`);
  }
});

// defaults.test.js'in DEFAULT_CARDS icin dogruladigi her kural, burada
// UC sablonun HEPSI icin genellestiriliyor. Bir sablon eklenince/degisince
// ayni guvenceler otomatik uygulanir.
for (const sablon of ['okuloncesi', 'ilkokul', 'ortaokul']) {
  const tohum = () => seedProfile({ childName: 'X', birthYear: 2016, sablon });

  test(`[${sablon}] tohum profil dogrulamadan gecer`, () => {
    const p = tohum();
    assert.equal(validateProfile(p).valid, true, validateProfile(p).errors?.join(' | '));
  });

  test(`[${sablon}] her rutin id karsiligi olan bir karta isaret eder`, () => {
    const p = tohum();
    const ids = new Set(p.cards.map((c) => c.id));
    for (const block of BLOCKS) {
      for (const id of p.routine[block]) assert.ok(ids.has(id), `${id} icin kart yok`);
    }
  });

  test(`[${sablon}] her kartin blogu rutin listesindeki blokla ayni`, () => {
    const p = tohum();
    const byId = new Map(p.cards.map((c) => [c.id, c]));
    for (const block of BLOCKS) {
      for (const id of p.routine[block]) {
        assert.equal(byId.get(id).block, block, `${id} yanlis blokta`);
      }
    }
  });

  test(`[${sablon}] her kart tam olarak bir rutin listesinde gecer`, () => {
    const p = tohum();
    const hepsi = BLOCKS.flatMap((b) => p.routine[b]);
    assert.equal(hepsi.length, new Set(hepsi).size, 'tekrarli id var');
    assert.equal(hepsi.length, p.cards.length, 'listelenmeyen kart var');
  });

  test(`[${sablon}] measured yalniz sabah-takvim ve ogle-matematik, gerisi approved`, () => {
    const p = tohum();
    for (const c of p.cards) {
      if (OLCULEBILIR.has(c.id)) {
        assert.equal(c.type, 'measured', `${c.id} measured olmali`);
      } else {
        assert.equal(c.type, 'approved', `${c.id} approved olmali (main.js baglamiyor)`);
      }
    }
  });

  test(`[${sablon}] yildiz ve dakika negatif degil, mukemmel gun tavana ulasir`, () => {
    const p = tohum();
    for (const c of p.cards) {
      assert.ok(c.stars >= 0, `${c.id} negatif yildiz`);
      assert.ok(c.minutes >= 0, `${c.id} negatif dakika`);
    }
    const toplam = p.cards.reduce((s, c) => s + c.minutes, 0);
    assert.ok(toplam >= p.settings.dailyMinuteCap, `${sablon} tavana ulasmiyor: ${toplam}`);
  });
}

test('sablon verilmezse ilkokul secilir (geriye uyum)', () => {
  const varsayilan = seedProfile({ childName: 'X', birthYear: 2016 });
  assert.deepEqual(varsayilan.cards.map((c) => c.id), DEFAULT_CARDS.map((c) => c.id));
});

test('bilinmeyen sablon ilkokula duser', () => {
  const p = seedProfile({ childName: 'X', birthYear: 2016, sablon: 'boyle-bir-sey-yok' });
  assert.deepEqual(p.cards.map((c) => c.id), DEFAULT_CARDS.map((c) => c.id));
});

test('okul oncesinde matematik seti (drill) yok, ortaokulda takvim yok', () => {
  const oo = seedProfile({ childName: 'X', birthYear: 2016, sablon: 'okuloncesi' });
  assert.ok(!oo.cards.some((c) => c.id === 'ogle-matematik'), 'okul oncesi drill icermemeli');

  const ort = seedProfile({ childName: 'X', birthYear: 2016, sablon: 'ortaokul' });
  assert.ok(!ort.cards.some((c) => c.id === 'sabah-takvim'), 'ortaokul takvim quiz icermemeli');
  assert.ok(ort.cards.some((c) => c.id === 'ogle-matematik'), 'ortaokul drill icermeli');
});

test('sablon klonlanir: seedProfile cagrilari birbirini etkilemez', () => {
  const a = seedProfile({ childName: 'X', birthYear: 2016, sablon: 'okuloncesi' });
  const b = seedProfile({ childName: 'X', birthYear: 2016, sablon: 'okuloncesi' });
  a.cards[0].stars = 999;
  assert.notEqual(b.cards[0].stars, 999);
});
