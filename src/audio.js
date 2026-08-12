// ═══════════════════════════════════════════════════════
//  audio.js — Build 162 channel mixer, combat SFX, and music
// ═══════════════════════════════════════════════════════

let _ctx = null;
let _masterGain = null;
let _musicGain = null;
let _sfxGain = null;
let _musicTimer = 0;
let _melodyIdx = 0;

const _legacySoundOn = localStorage.getItem('ifc_sound_enabled') !== '0';
const _legacyVolume = Math.max(0, Math.min(100, parseInt(localStorage.getItem('ifc_volume') || '100', 10))) / 100;
function _storedVolume(key, fallback) {
  const raw = localStorage.getItem(key);
  const value = raw == null ? fallback : Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}
let _musicEnabled = localStorage.getItem('lsc_music_enabled') == null
  ? (_legacySoundOn && localStorage.getItem('lsc_music') !== 'off')
  : localStorage.getItem('lsc_music_enabled') !== '0';
let _sfxEnabled = localStorage.getItem('lsc_sfx_enabled') == null
  ? (_legacySoundOn && localStorage.getItem('lsc_sound') !== 'off')
  : localStorage.getItem('lsc_sfx_enabled') !== '0';
let _musicVolume = _storedVolume('lsc_music_volume', Math.min(_legacyVolume, .6));
let _sfxVolume = _storedVolume('lsc_sfx_volume', Math.min(_legacyVolume, .85));

// Retained for older controllers that still inspect or call the master controls.
let _soundEnabled = _musicEnabled || _sfxEnabled;
let _masterVolume = 1;

const MELODIES = [
  [261.63, 293.66, 329.63, 392, 329.63, 440, 392, 293.66],
  [196, 220, 261.63, 329.63, 293.66, 261.63, 220, 196],
  [349.23, 392, 440, 523.25, 440, 392, 349.23, 329.63],
  [523.25, 493.88, 440, 392, 349.23, 392, 440, 493.88],
];

function _setGain(gainNode, value) {
  if (!gainNode || !_ctx) return;
  const now = _ctx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setTargetAtTime(Math.max(0, value), now, 0.015);
}

function _applyAudioGains() {
  _soundEnabled = _musicEnabled || _sfxEnabled;
  _setGain(_masterGain, _masterVolume);
  _setGain(_musicGain, _musicEnabled ? _musicVolume : 0);
  _setGain(_sfxGain, _sfxEnabled ? _sfxVolume : 0);
}

function ensureAudio() {
  if (!_ctx) {
    _ctx = new (window.AudioContext ?? window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _musicGain = _ctx.createGain();
    _sfxGain = _ctx.createGain();
    _musicGain.connect(_masterGain);
    _sfxGain.connect(_masterGain);
    _masterGain.connect(_ctx.destination);
    _applyAudioGains();
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
}

function audioDestination(channel) {
  if (!_ctx) return null;
  return channel === 'music' ? (_musicGain || _masterGain || _ctx.destination) : (_sfxGain || _masterGain || _ctx.destination);
}

function getAudioSettings() {
  return {
    musicEnabled: _musicEnabled,
    sfxEnabled: _sfxEnabled,
    musicVolume: _musicVolume,
    sfxVolume: _sfxVolume,
  };
}

function setMusicEnabled(on) {
  _musicEnabled = !!on;
  localStorage.setItem('lsc_music_enabled', _musicEnabled ? '1' : '0');
  localStorage.setItem('lsc_music', _musicEnabled ? 'on' : 'off');
  _applyAudioGains();
}

function setSfxEnabled(on) {
  _sfxEnabled = !!on;
  localStorage.setItem('lsc_sfx_enabled', _sfxEnabled ? '1' : '0');
  localStorage.setItem('lsc_sound', _sfxEnabled ? 'on' : 'off');
  _applyAudioGains();
}

function setMusicVolume(vol01) {
  _musicVolume = Math.max(0, Math.min(1, Number(vol01) || 0));
  localStorage.setItem('lsc_music_volume', String(_musicVolume));
  _applyAudioGains();
}

function setSfxVolume(vol01) {
  _sfxVolume = Math.max(0, Math.min(1, Number(vol01) || 0));
  localStorage.setItem('lsc_sfx_volume', String(_sfxVolume));
  _applyAudioGains();
}

function setMasterVolume(vol01) {
  const volume = Math.max(0, Math.min(1, Number(vol01) || 0));
  setMusicVolume(volume);
  setSfxVolume(volume);
  localStorage.setItem('ifc_volume', String(Math.round(volume * 100)));
}

function setSoundEnabled(on) {
  const enabled = !!on;
  setMusicEnabled(enabled);
  setSfxEnabled(enabled);
  localStorage.setItem('ifc_sound_enabled', enabled ? '1' : '0');
}

function suspendAudio() {
  if (_ctx && _ctx.state === 'running') _ctx.suspend().catch(() => {});
}

function resumeAudio() {
  if (_ctx && _ctx.state === 'suspended') _ctx.resume().catch(() => {});
}

function tone(freq, dur, type = 'sine', vol = 0.03, when = 0, channel = 'sfx') {
  if (!_ctx) return;
  if (channel === 'music' ? !_musicEnabled : !_sfxEnabled) return;
  const destination = audioDestination(channel);
  if (!destination) return;
  const oscillator = _ctx.createOscillator();
  const gain = _ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(destination);
  const start = _ctx.currentTime + when;
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  oscillator.start(start);
  oscillator.stop(start + dur + 0.025);
}

function noiseBurst(dur = 0.08, vol = 0.04, cutoff = 1200, when = 0) {
  if (!_ctx || !_sfxEnabled) return;
  const destination = audioDestination('sfx');
  if (!destination) return;
  const frames = Math.max(1, Math.floor(_ctx.sampleRate * dur));
  const buffer = _ctx.createBuffer(1, frames, _ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const source = _ctx.createBufferSource();
  const filter = _ctx.createBiquadFilter();
  const gain = _ctx.createGain();
  const start = _ctx.currentTime + when;
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  gain.gain.setValueAtTime(Math.max(0.0001, vol), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(start + dur + 0.015);
}

const SFX = {
  shoot: () => { noiseBurst(.045, .038, 2600); tone(155, .055, 'square', .034); },
  rifle: () => { noiseBurst(.05, .05, 3100); tone(128, .065, 'sawtooth', .04); },
  turret: () => { noiseBurst(.075, .07, 1150); tone(72, .11, 'square', .075); },
  heavy: () => { noiseBurst(.09, .065, 720); tone(92, .12, 'sawtooth', .085); },
  sniper: () => { noiseBurst(.045, .07, 4200); tone(980, .025, 'square', .06); tone(110, .14, 'sine', .045, .03); },
  grenade: () => { noiseBurst(.18, .11, 520, .04); tone(82, .22, 'square', .09); },
  heal: () => tone(660, .08, 'sine', .03),
  enemyDown: () => tone(105, .07, 'triangle', .026),
  bossDown: () => { noiseBurst(.28, .13, 500); tone(110, .35, 'sawtooth', .11); tone(330, .18, 'triangle', .07, .14); },
  impact: () => { noiseBurst(.06, .04, 900); tone(78, .1, 'square', .045); },
  barrierHit: () => { noiseBurst(.055, .045, 680); tone(92, .08, 'triangle', .035); },
  barrierBreak: () => { noiseBurst(.24, .13, 460); tone(62, .3, 'sawtooth', .1); },
  hqHit: () => { noiseBurst(.1, .075, 540); tone(55, .2, 'square', .085); },
  upgrade: () => { tone(440, .08, 'triangle', .045); tone(620, .12, 'triangle', .04, .06); },
  promotion: () => { tone(392, .08, 'triangle', .05); tone(523, .1, 'triangle', .05, .08); tone(784, .15, 'triangle', .045, .17); },
  deploy: () => tone(285, .06, 'square', .035),
  victory: () => { tone(392, .1, 'triangle', .055); tone(523, .12, 'triangle', .055, .09); tone(659, .16, 'triangle', .055, .18); },
  defeat: () => { tone(196, .16, 'sawtooth', .065); tone(147, .22, 'sawtooth', .06, .14); tone(98, .32, 'square', .055, .32); },
  alarm: () => { tone(218, .1, 'sawtooth', .05); tone(168, .1, 'sawtooth', .05, .12); },
  orbital: () => { noiseBurst(.34, .15, 430, .04); tone(108, .28, 'sawtooth', .11); tone(62, .34, 'square', .085, .06); },
  prestige: () => { tone(523, .1, 'triangle', .06); tone(659, .12, 'triangle', .06, .1); tone(784, .18, 'triangle', .06, .22); },
  bossAlarm: () => { tone(180, .18, 'sawtooth', .07); tone(140, .18, 'sawtooth', .07, .2); tone(110, .2, 'square', .06, .42); },
  event: () => { tone(440, .08, 'triangle', .04); tone(550, .1, 'triangle', .035, .08); },
  phase: () => { tone(260, .12, 'sine', .04); tone(320, .1, 'triangle', .03, .1); },
  rankUp: () => { tone(440, .08, 'triangle', .05); tone(554, .1, 'triangle', .045, .07); tone(659, .14, 'triangle', .04, .16); tone(880, .2, 'triangle', .035, .26); },
};

function playSfx(kind) {
  if (!_ctx || !_sfxEnabled) return;
  (SFX[kind] ?? (() => {}))();
}

function tickMusic(dt, isActive) {
  if (!_ctx || !isActive || !_musicEnabled) return;
  _musicTimer -= dt;
  if (_musicTimer <= 0) {
    const step = Math.floor(performance.now() / 556);
    if (step % 32 === 0) _melodyIdx = (_melodyIdx + 1) % MELODIES.length;
    const melody = MELODIES[_melodyIdx];
    const index = step % melody.length;
    const hot = isActive === 'hot';
    tone(melody[index], .22, 'triangle', hot ? .011 : .008, 0, 'music');
    tone(melody[(index + 3) % melody.length] / 2, .2, 'sine', hot ? .007 : .005, .03, 'music');
    if (hot) tone(melody[index] / 2, .1, 'square', .003, .01, 'music');
    _musicTimer = .42;
  }
}
