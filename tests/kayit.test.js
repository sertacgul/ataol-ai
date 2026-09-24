// tests/kayit.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKayit } from '../src/ui/kayit.js';

function sahteOrtam({ izinVer = true } = {}) {
  const olaylar = [];
  const iz = { stop: () => olaylar.push('iz-durdu') };
  const akis = { getTracks: () => [iz] };
  class SahteKaydedici {
    constructor(a) { this.akis = a; this.ondataavailable = null; this.onstop = null; }
    start() { olaylar.push('basla'); }
    stop() {
      olaylar.push('dur');
      this.ondataavailable?.({ data: 'parca' });
      this.onstop?.();
    }
  }
  return {
    olaylar,
    ortam: {
      navigator: {
        mediaDevices: {
          getUserMedia: async () => {
            olaylar.push('izin-istendi');
            if (!izinVer) throw new Error('NotAllowedError');
            return akis;
          }
        }
      },
      MediaRecorder: SahteKaydedici,
      Blob: class { constructor(p) { this.p = p; } },
      URL: { createObjectURL: () => 'blob:1', revokeObjectURL: (u) => olaylar.push('iptal:' + u) },
      zamanla: (fn) => fn()
    }
  };
}

test('MediaRecorder ya da getUserMedia yoksa destek YOK', () => {
  assert.equal(createKayit({}).destekli(), false);
  assert.equal(createKayit({ MediaRecorder: class {}, navigator: {} }).destekli(), false);
  assert.equal(createKayit(sahteOrtam().ortam).destekli(), true);
});

test('kayit sure dolunca durur ve calinabilir adres verir', async () => {
  const { ortam, olaylar } = sahteOrtam();
  const k = createKayit(ortam);
  const adres = await k.kaydet(3000);
  assert.equal(adres, 'blob:1');
  assert.deepEqual(olaylar.slice(0, 3), ['izin-istendi', 'basla', 'dur']);
});

test('izin reddedilirse hata ATAR, cagiran asamayi sadelestirir', async () => {
  const { ortam } = sahteOrtam({ izinVer: false });
  await assert.rejects(createKayit(ortam).kaydet(3000));
});

test('birak mikrofonu KAPATIR ve eski kaydi siler', async () => {
  // iPhone mikrofon acik kaldikca ekranda turuncu nokta gosterir; ekran
  // kapaninca mikrofon birakilmali, kayit da hafizada kalmamali.
  const { ortam, olaylar } = sahteOrtam();
  const k = createKayit(ortam);
  await k.kaydet(3000);
  k.birak();
  assert.ok(olaylar.includes('iz-durdu'), 'mikrofon izi durdurulmadi');
  assert.ok(olaylar.includes('iptal:blob:1'), 'kayit adresi serbest birakilmadi');
});

test('sustur calani durdurur ama mikrofonu BIRAKMAZ', async () => {
  const { ortam, olaylar } = sahteOrtam();
  ortam.Audio = class {
    constructor() { this.dinleyici = {}; }
    addEventListener() {}
    play() { olaylar.push('cal'); return Promise.resolve(); }
    pause() { olaylar.push('duraklat'); }
  };
  const k = createKayit(ortam);
  await k.kaydet(3000);
  k.cal();
  k.sustur();
  assert.ok(olaylar.includes('duraklat'), 'calan kayit durmadi');
  assert.ok(!olaylar.includes('iz-durdu'), 'mikrofon birakildi; izin her kelimede tekrar sorulurdu');
  await k.kaydet(3000);
  assert.equal(olaylar.filter((o) => o === 'izin-istendi').length, 1);
});

test('ikinci kayit ilk kaydin adresini serbest birakir', async () => {
  const { ortam, olaylar } = sahteOrtam();
  const k = createKayit(ortam);
  await k.kaydet(3000);
  await k.kaydet(3000);
  assert.ok(olaylar.includes('iptal:blob:1'));
  assert.equal(olaylar.filter((o) => o === 'izin-istendi').length, 1,
    'izin her kayitta tekrar istenmemeli');
});
