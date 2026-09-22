import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSes } from '../src/ui/ses.js';

function sahteTts() {
  const soylenen = [];
  return {
    soylenen,
    speaking: false,
    speak(u) { soylenen.push(u); if (u.onend) u.onend(); },
    cancel() { soylenen.length = 0; }
  };
}

// calabilir=false ise error olayini tetikler, yani dosya yok demektir.
function sahteAudioSinifi(calabilir) {
  const kurulan = [];
  class SahteAudio {
    constructor(src) {
      this.src = src;
      kurulan.push(src);
      this._olaylar = {};
    }
    addEventListener(ad, fn) { this._olaylar[ad] = fn; }
    play() {
      if (calabilir) {
        if (this._olaylar.ended) setTimeout(() => this._olaylar.ended(), 0);
        return Promise.resolve();
      }
      if (this._olaylar.error) setTimeout(() => this._olaylar.error(), 0);
      return Promise.reject(new Error('calinamadi'));
    }
    pause() { this.duraklatildi = true; }
  }
  SahteAudio.kurulan = kurulan;
  return SahteAudio;
}

function sahteAudioContext() {
  const baglananlar = [];
  class SahteOsc {
    constructor() { this.frequency = { setValueAtTime() {} }; }
    connect(x) { baglananlar.push('osc->' + x.ad); return x; }
    start() { this.basladi = true; }
    stop() { this.durdu = true; }
  }
  class SahteCtx {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = { ad: 'dest' };
      this.olusanOsc = [];
    }
    resume() { this.state = 'running'; return Promise.resolve(); }
    createOscillator() { const o = new SahteOsc(); this.olusanOsc.push(o); return o; }
    createGain() {
      return {
        ad: 'gain',
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
        connect(x) { baglananlar.push('gain->' + x.ad); return x; }
      };
    }
  }
  SahteCtx.baglananlar = baglananlar;
  return SahteCtx;
}

test('ses dosyasi varsa dosya calinir, TTS kullanilmaz', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  assert.equal(sonuc, 'dosya');
  assert.equal(Audio.kurulan[0], 'sesler/temel-cizimler-1-a1.mp3');
  assert.equal(tts.soylenen.length, 0);
});

test('ses dosyasi yoksa TTS ile okunur', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(false);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'yok-boyle-bir-dosya' });

  assert.equal(sonuc, 'tts');
  assert.equal(tts.soylenen.length, 1);
  assert.equal(tts.soylenen[0].text, 'Merhaba');
  assert.equal(tts.soylenen[0].lang, 'tr-TR');
});

test('ses alani hic yoksa dogrudan TTS kullanilir, dosya denenmez', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });

  const sonuc = await ses.oku({ metin: 'Sadece metin' });

  assert.equal(sonuc, 'tts');
  assert.equal(Audio.kurulan.length, 0);
});

test('ses kapaliyken hicbir sey calinmaz', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });
  ses.ayarla({ sesAcik: false });

  const sonuc = await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  assert.equal(sonuc, 'kapali');
  assert.equal(Audio.kurulan.length, 0);
  assert.equal(tts.soylenen.length, 0);
});

test('hazirla AudioContext i resume eder (iOS kilidi)', async () => {
  const Ctx = sahteAudioContext();
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: Ctx, Audio: sahteAudioSinifi(true) });

  await ses.hazirla();

  assert.equal(ses.ctxDurumu(), 'running');
});

test('efekt osilator olusturur ve calistirir', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();

  ses.efekt('dogru');

  assert.equal(ses.sonEfekt(), 'dogru');
});

test('bilinmeyen efekt adi sessizce yok sayilir', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();

  ses.efekt('boyle-bir-efekt-yok');

  assert.equal(ses.sonEfekt(), null);
});

test('ses kapaliyken efekt calmaz', async () => {
  const ses = createSes({ speechSynthesis: sahteTts(), AudioContext: sahteAudioContext(), Audio: sahteAudioSinifi(true) });
  await ses.hazirla();
  ses.ayarla({ sesAcik: false });

  ses.efekt('dogru');

  assert.equal(ses.sonEfekt(), null);
});

test('dur calan dosyayi duraklatir ve TTS i iptal eder', async () => {
  const tts = sahteTts();
  const Audio = sahteAudioSinifi(true);
  const ses = createSes({ speechSynthesis: tts, AudioContext: sahteAudioContext(), Audio });
  await ses.oku({ metin: 'Merhaba', ses: 'temel-cizimler-1-a1' });

  ses.dur();

  assert.equal(tts.soylenen.length, 0);
});

test('tarayici yetenekleri yoksa cokmez', async () => {
  const ses = createSes({});
  assert.equal(await ses.oku({ metin: 'Merhaba' }), 'kapali');
  ses.efekt('dogru');
  ses.dur();
  await ses.hazirla();
});
