// ═══════════════════════════════════════════════════════
//  audio.js — tone engine, sfx, ambient music
// ═══════════════════════════════════════════════════════

let _ctx = null;
let _masterGain = null;   // master volume node — all sound routes through this
let _musicTimer = 0;
let _melodyIdx = 0;

// Global sound state — set by UI, read by engine
let _soundEnabled = true;
let _masterVolume = 1.0;   // 0.0–1.0, mapped from slider 0–100

const MELODIES = [
  [261.63, 293.66, 329.63, 392, 329.63, 440, 392, 293.66],
  [196, 220, 261.63, 329.63, 293.66, 261.63, 220, 196],
  [349.23, 392, 440, 523.25, 440, 392, 349.23, 329.63],
  [523.25, 493.88, 440, 392, 349.23, 392, 440, 493.88],
];

function ensureAudio() {
  if (!_ctx) {
    _ctx = new (window.AudioContext ?? window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.connect(_ctx.destination);
    _masterGain.gain.value = _soundEnabled ? _masterVolume : 0;
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
}

// Called by UI volume slider / toggle
function setMasterVolume(vol01) {
  _masterVolume = Math.max(0, Math.min(1, vol01));
  if (_masterGain) _masterGain.gain.value = _soundEnabled ? _masterVolume : 0;
}

function setSoundEnabled(on) {
  _soundEnabled = !!on;
  if (_masterGain) _masterGain.gain.value = _soundEnabled ? _masterVolume : 0;
}

// V42: explicit AudioContext suspend/resume for pause menu
// Pausing the context stops music ticks from producing sound even if tickMusic is called
function suspendAudio() {
  if (_ctx && _ctx.state === 'running') _ctx.suspend().catch(() => {});
}
function resumeAudio() {
  if (_ctx && _ctx.state === 'suspended') _ctx.resume().catch(() => {});
}

function tone(freq, dur, type = 'sine', vol = 0.03, when = 0) {
  if (!_ctx || !_masterGain || !_soundEnabled) return;
  const o = _ctx.createOscillator();
  const g = _ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(_masterGain);  // route through master gain
  const t = _ctx.currentTime + when;
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const SFX = {
  shoot:     () => tone(355, .05, 'square', .015),
  heavy:     () => tone(130, .08, 'sawtooth', .040),
  sniper:    () => { tone(200, .06, 'sawtooth', .033); tone(120, .1, 'sine', .019, .04); },
  grenade:   () => { tone(175, .07, 'triangle', .027); tone(108, .1, 'square', .017, .05); },
  heal:      () => tone(660, .05, 'sine', .017),
  enemyDown: () => tone(118, .08, 'triangle', .021),
  bossDown:  () => { tone(220, .16, 'sawtooth', .046); tone(330, .14, 'triangle', .026, .12); },
  impact:    () => tone(78, .12, 'square', .05),
  upgrade:   () => { tone(440, .08, 'triangle', .027); tone(620, .1, 'triangle', .021, .06); },
  deploy:    () => tone(285, .05, 'square', .017),
  victory:   () => { tone(392, .1, 'triangle', .027); tone(523, .12, 'triangle', .027, .09); tone(659, .14, 'triangle', .027, .18); },
  alarm:     () => { tone(218, .1, 'sawtooth', .027); tone(168, .1, 'sawtooth', .027, .12); },
  orbital:   () => { tone(108, .24, 'sawtooth', .056); tone(62, .28, 'square', .036, .06); },
  prestige:  () => { tone(523, .1, 'triangle', .036); tone(659, .12, 'triangle', .036, .1); tone(784, .18, 'triangle', .036, .22); },
  bossAlarm: () => { tone(180, .18, 'sawtooth', .038); tone(140, .18, 'sawtooth', .038, .2); tone(110, .2, 'square', .028, .42); },
  event:     () => { tone(440, .08, 'triangle', .024); tone(550, .1, 'triangle', .019, .08); },
  phase:     () => { tone(260, .12, 'sine', .022); tone(320, .10, 'triangle', .016, .1); },
  rankUp:    () => { tone(440, .08, 'triangle', .032); tone(554, .10, 'triangle', .028, .07); tone(659, .14, 'triangle', .024, .16); tone(880, .20, 'triangle', .018, .26); },
};

function playSfx(kind) {
  if (!_ctx || !_soundEnabled) return;
  (SFX[kind] ?? (() => {}))();
}

function tickMusic(dt, isActive) {
  if (!_ctx || !isActive || !_soundEnabled) return;
  _musicTimer -= dt;
  if (_musicTimer <= 0) {
    const step = Math.floor(performance.now() / 556); // ~1.8/sec equivalent
    if (step % 32 === 0) _melodyIdx = (_melodyIdx + 1) % MELODIES.length;
    const m = MELODIES[_melodyIdx];
    const i = step % m.length;
    const hot = isActive === 'hot';
    tone(m[i], .22, 'triangle', hot ? .011 : .008);
    tone(m[(i + 3) % m.length] / 2, .20, 'sine', hot ? .007 : .005, .03);
    if (hot) tone(m[i] / 2, .10, 'square', .003, .01);
    _musicTimer = 0.42;
  }
}

