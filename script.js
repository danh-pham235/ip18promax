// ====================================================
// iPhone 18 Pro Max — Unbox + Color Select
// Official finishes: Burgundy, Glacier, Silver, Black
// ====================================================

const RING = 2 * Math.PI * 68;
const HOLD_MS = 1800;

const COLORS = {
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy',
    select: 'assets/select-burgundy.png',
    back: 'assets/back-burgundy.png',
    swatch: 'assets/swatch-burgundy.jpg',
    frame: '#5a2432',
    frameLight: '#7a3a48',
    frameDark: '#2a1018',
    glow: '#c45c78',
    screen: '#3a1522',
    accent: '#e8a0b0',
  },
  glacier: {
    id: 'glacier',
    name: 'Glacier',
    select: 'assets/select-glacier.png',
    back: 'assets/back-glacier.png',
    swatch: 'assets/swatch-glacier.jpg',
    frame: '#9eb8c8',
    frameLight: '#c5d8e4',
    frameDark: '#5a7384',
    glow: '#a8d4e8',
    screen: '#1a2a34',
    accent: '#d8eef8',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    select: 'assets/select-silver.png',
    back: 'assets/back-silver.png',
    swatch: 'assets/swatch-silver.jpg',
    frame: '#c4c7ce',
    frameLight: '#e4e6ea',
    frameDark: '#7a7e86',
    glow: '#d0d4dc',
    screen: '#1c1e24',
    accent: '#f0f2f5',
  },
  black: {
    id: 'black',
    name: 'Black',
    select: 'assets/select-black.png',
    back: 'assets/back-black.png',
    swatch: 'assets/swatch-black.jpg',
    frame: '#2c2c30',
    frameLight: '#4a4a50',
    frameDark: '#121214',
    glow: '#6a6a72',
    screen: '#0a0a0c',
    accent: '#c8c8ce',
  },
};

const statusLabel = document.getElementById('statusLabel');
const statusDot = document.getElementById('statusDot');
const stepMetric = document.getElementById('stepMetric');
const progressMetric = document.getElementById('progressMetric');
const stateMetric = document.getElementById('stateMetric');
const stepCurrent = document.getElementById('stepCurrent');
const soundToggle = document.getElementById('soundToggle');
const soundIconSvg = document.getElementById('soundIconSvg');
const flashOverlay = document.getElementById('flashOverlay');
const accessories = document.getElementById('accessories');
const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');

const colorHeroImg = document.getElementById('colorHeroImg');
const colorTitle = document.getElementById('colorTitle');
const boxColorTag = document.getElementById('boxColorTag');
const helloSpec = document.getElementById('helloSpec');
const finishMsg = document.getElementById('finishMsg');

const phoneImgs = [
  document.getElementById('sleevePreview'),
  document.getElementById('lidPhoneImg'),
  document.getElementById('phoneLiftImg'),
  document.getElementById('flipBackImg'),
  document.getElementById('helloBackImg'),
];

const layers = [
  document.getElementById('layerColors'),
  document.getElementById('layerBox'),
  document.getElementById('layerSleeve'),
  document.getElementById('layerLid'),
  document.getElementById('layerLift'),
  document.getElementById('layerFlip'),
  document.getElementById('layerPeel'),
  document.getElementById('layerPower'),
  document.getElementById('layerHello'),
];

const STEP_COPY = [
  { label: 'CHỌN MÀU MÁY', progress: 0 },
  { label: 'HỘP ĐÃ NIÊM PHONG', progress: 11 },
  { label: 'THÁO VỎ NGOÀI', progress: 22 },
  { label: 'NÂNG NẮP HỘP', progress: 33 },
  { label: 'NHẤC MÁY KHỎI KHAY', progress: 44 },
  { label: 'LẬT MẶT TRƯỚC', progress: 55 },
  { label: 'BÓC FILM BẢO VỆ', progress: 66 },
  { label: 'KHỞI ĐỘNG MÁY', progress: 77 },
  { label: 'HELLO — HOÀN TẤT', progress: 100 },
];

let selectedColor = COLORS.burgundy;
let step = 0;
let soundEnabled = true;
let particles = [];
let shockwaves = [];
let lastFrameTime = performance.now();
let holdActive = false;
let holdProgress = 0;
let holdStart = 0;
let holdTrack = null;
let holdPad = null;
let holdOnComplete = null;
let audioCtx = null;
let chargeOsc = null;
let chargeGain = null;
let noiseNode = null;
let noiseGain = null;

function applyColor(colorId) {
  selectedColor = COLORS[colorId] || COLORS.burgundy;
  document.documentElement.style.setProperty('--color-name', selectedColor.name);
  document.documentElement.style.setProperty('--frame', selectedColor.frame);
  document.documentElement.style.setProperty('--frame-light', selectedColor.frameLight);
  document.documentElement.style.setProperty('--frame-dark', selectedColor.frameDark);
  document.documentElement.style.setProperty('--frame-glow', selectedColor.glow);
  document.documentElement.style.setProperty('--screen-tint', selectedColor.screen);
  document.documentElement.style.setProperty('--screen-accent', selectedColor.accent);
  document.body.dataset.color = selectedColor.id;

  colorTitle.textContent = selectedColor.name;
  boxColorTag.textContent = selectedColor.name;
  helloSpec.textContent = `${selectedColor.name} · A20 Pro · Ceramic Shield 2`;
  finishMsg.textContent = `Bạn vừa mở hộp iPhone 18 Pro Max màu ${selectedColor.name} — dành riêng cho My Uyen.`;
  stateMetric.textContent = selectedColor.name;

  colorHeroImg.classList.add('is-switching');
  setTimeout(() => {
    colorHeroImg.src = selectedColor.select;
    colorHeroImg.alt = `iPhone 18 Pro Max ${selectedColor.name}`;
    colorHeroImg.classList.remove('is-switching');
  }, 180);

  phoneImgs.forEach((img) => {
    if (img) {
      img.src = selectedColor.back;
      img.alt = `iPhone 18 Pro Max ${selectedColor.name}`;
    }
  });

  document.querySelectorAll('.swatch').forEach((btn) => {
    const active = btn.dataset.color === selectedColor.id;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

document.querySelectorAll('.swatch').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (step !== 0) return;
    initAudio();
    playChime(480 + Math.random() * 120);
    applyColor(btn.dataset.color);
  });
});

document.getElementById('startUnboxBtn').addEventListener('click', () => {
  if (step !== 0) return;
  initAudio();
  playChime(620);
  rumble(30);
  showStep(1);
});

// ---------- Audio ----------
function initAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = !soundEnabled;
  soundIconSvg.innerHTML = soundEnabled
    ? '<use href="#icon-sound-on"></use>'
    : '<use href="#icon-sound-off"></use>';
  if (!soundEnabled) stopHoldAudio(false);
});

function playChime(freq = 520, intensity = 1) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const base = Math.max(220, freq);
  const oscA = audioCtx.createOscillator();
  const oscB = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  oscA.type = 'triangle';
  oscA.frequency.setValueAtTime(base, now);
  oscA.frequency.exponentialRampToValueAtTime(base * 1.12, now + 0.28);

  oscB.type = 'sine';
  oscB.frequency.setValueAtTime(base * 1.5, now);
  oscB.frequency.exponentialRampToValueAtTime(base * 1.62, now + 0.25);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.exponentialRampToValueAtTime(3000, now + 0.34);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08 * intensity, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.46);
  oscB.stop(now + 0.46);
}

function playCardboard() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * 0.26;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    const noise = (Math.random() * 2 - 1) * (1 - t);
    data[i] = noise * 0.8 * Math.exp(-i / (bufferSize * 0.4));
  }

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  filter.Q.value = 0.5;

  const clickOsc = audioCtx.createOscillator();
  const clickGain = audioCtx.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(120, now);
  clickOsc.frequency.exponentialRampToValueAtTime(52, now + 0.12);
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  clickOsc.connect(clickGain);
  clickGain.connect(audioCtx.destination);

  src.start(now);
  clickOsc.start(now);
  src.stop(now + 0.32);
  clickOsc.stop(now + 0.14);
}

function startHoldAudio() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  chargeOsc = audioCtx.createOscillator();
  chargeGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  chargeOsc.type = 'triangle';
  chargeOsc.frequency.setValueAtTime(90, now);
  chargeOsc.frequency.exponentialRampToValueAtTime(360, now + HOLD_MS / 1000);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(480, now);
  filter.frequency.exponentialRampToValueAtTime(2600, now + HOLD_MS / 1000);

  chargeGain.gain.setValueAtTime(0.0001, now);
  chargeGain.gain.linearRampToValueAtTime(0.09, now + 0.22);
  chargeGain.gain.linearRampToValueAtTime(0.06, now + HOLD_MS / 1000);

  chargeOsc.connect(filter);
  filter.connect(chargeGain);
  chargeGain.connect(audioCtx.destination);
  chargeOsc.start();

  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const out = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    out[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2) * 0.4;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  const nf = audioCtx.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = 1800;
  nf.Q.value = 1.6;

  noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(0.03, now + HOLD_MS / 1000);

  noiseNode.connect(nf);
  nf.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noiseNode.start();
}

function stopHoldAudio(complete = false) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  if (chargeGain) {
    chargeGain.gain.cancelScheduledValues(now);
    chargeGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
  }
  if (chargeOsc) {
    try { chargeOsc.stop(now + 0.13); } catch (_) {}
    chargeOsc = null;
  }
  if (noiseGain) {
    noiseGain.gain.cancelScheduledValues(now);
    noiseGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
  }
  if (noiseNode) {
    try { noiseNode.stop(now + 0.13); } catch (_) {}
    noiseNode = null;
  }
  if (complete && soundEnabled) playPowerSfx();
}

function playPowerSfx() {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;

  const sub = audioCtx.createOscillator();
  const subG = audioCtx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(120, now);
  sub.frequency.exponentialRampToValueAtTime(52, now + 0.9);
  subG.gain.setValueAtTime(0.16, now);
  subG.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
  sub.connect(subG);
  subG.connect(audioCtx.destination);
  sub.start(now);
  sub.stop(now + 1.15);

  [392.0, 523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, now + i * 0.04);
    g.gain.setValueAtTime(0.0001, now + i * 0.04);
    g.gain.exponentialRampToValueAtTime(0.08, now + i * 0.04 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.75);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(now + i * 0.04);
    o.stop(now + i * 0.04 + 0.8);
  });
}

function playPeelSfx() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const peelOsc = audioCtx.createOscillator();
  const peelGain = audioCtx.createGain();
  peelOsc.type = 'triangle';
  peelOsc.frequency.setValueAtTime(180, now);
  peelOsc.frequency.exponentialRampToValueAtTime(86, now + 0.18);
  peelGain.gain.setValueAtTime(0.0001, now);
  peelGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  peelGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  peelOsc.connect(peelGain);
  peelGain.connect(audioCtx.destination);
  peelOsc.start(now);
  peelOsc.stop(now + 0.24);

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.32);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.65;
  }

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  src.start(now);
  src.stop(now + 0.34);
}

// ---------- HUD / steps ----------
function updateHud() {
  const copy = STEP_COPY[step];
  statusLabel.textContent = copy.label;
  stepMetric.textContent = `${Math.min(step + 1, layers.length)} / ${layers.length}`;
  progressMetric.textContent = `${copy.progress}%`;
  stepCurrent.textContent = String(Math.min(step + 1, layers.length)).padStart(2, '0');
  stateMetric.textContent = selectedColor.name;
  statusDot.classList.remove('warn', 'ok');
  if (step >= layers.length - 1) statusDot.classList.add('ok');
  else if (holdActive) statusDot.classList.add('warn');
}

function showStep(n) {
  step = n;
  layers.forEach((layer, i) => {
    if (!layer) return;
    layer.classList.toggle('hidden', i !== n);
  });
  updateHud();
  accessories.hidden = n < layers.length - 1;
}

function flash() {
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 280);
}

function rumble(pattern = [40]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 500);
}

function burstAt(el, count = 40, colors = ['#2997ff', '#64d2ff', '#ffffff', '#8a8f98']) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      gravity: 0.06,
    });
  }
}

function shockAt(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  shockwaves.push(
    { x: cx, y: cy, radius: 8, maxRadius: Math.max(canvas.width, canvas.height) * 0.55, alpha: 1, speed: 14, color: selectedColor.glow },
    { x: cx, y: cy, radius: 8, maxRadius: Math.max(canvas.width, canvas.height) * 0.7, alpha: 1, speed: 10, color: selectedColor.frameLight }
  );
}

// ---------- Hold engine ----------
function bindHold(pad, track, onComplete) {
  const start = (e) => {
    if (e) e.preventDefault();
    if (holdActive) return;
    initAudio();
    holdActive = true;
    holdPad = pad;
    holdTrack = track;
    holdOnComplete = onComplete;
    holdProgress = 0;
    holdStart = performance.now();
    pad.classList.add('charging');
    document.body.classList.add('is-holding');
    statusDot.classList.add('warn');
    if (e && e.pointerId != null) {
      try { pad.setPointerCapture(e.pointerId); } catch (_) {}
    }
    startHoldAudio();
    rumble(30);
  };

  const stop = (e) => {
    if (!holdActive || holdPad !== pad) return;
    holdActive = false;
    pad.classList.remove('charging');
    document.body.classList.remove('is-holding');
    if (e && e.pointerId != null) {
      try { pad.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    stopHoldAudio(false);
  };

  pad.addEventListener('pointerdown', start);
  pad.addEventListener('pointerup', stop);
  pad.addEventListener('pointercancel', stop);
  pad.addEventListener('lostpointercapture', () => {
    if (holdActive && holdPad === pad && holdProgress < 1) stop();
  });
  pad.addEventListener('contextmenu', (e) => e.preventDefault());
}

function resetHoldVisual(track) {
  if (track) track.style.strokeDashoffset = String(RING);
}

// ---------- Step 1: box ----------
const productBox = document.getElementById('productBox');
productBox.addEventListener('click', () => {
  if (step !== 1) return;
  initAudio();
  playChime(480);
  playCardboard();
  productBox.classList.add('opening');
  rumble([50, 30, 50]);
  burstAt(productBox, 28);
  setTimeout(() => showStep(2), 420);
});

// ---------- Step 2: sleeve ----------
const sleeve = document.getElementById('outerSleeve');
let sleeveDragging = false;
let sleeveStartX = 0;
let sleeveOffset = 0;

sleeve.addEventListener('pointerdown', (e) => {
  if (step !== 2) return;
  initAudio();
  sleeveDragging = true;
  sleeveStartX = e.clientX;
  sleeveOffset = 0;
  sleeve.classList.add('dragging');
  document.body.classList.add('is-dragging');
  sleeve.setPointerCapture(e.pointerId);
  e.preventDefault();
});

sleeve.addEventListener('pointermove', (e) => {
  if (!sleeveDragging || step !== 2) return;
  e.preventDefault();
  sleeveOffset = Math.min(0, e.clientX - sleeveStartX);
  sleeve.style.transform = `translateX(${sleeveOffset}px)`;
  const pct = Math.min(100, Math.abs(sleeveOffset) / (sleeve.offsetWidth * 0.55) * 100);
  progressMetric.textContent = `${Math.floor(22 + pct * 0.11)}%`;
  if (Math.abs(sleeveOffset) > sleeve.offsetWidth * 0.55) finishSleeve();
});

function endSleeveDrag() {
  if (!sleeveDragging) return;
  sleeveDragging = false;
  sleeve.classList.remove('dragging');
  document.body.classList.remove('is-dragging');
  if (step === 2 && Math.abs(sleeveOffset) < sleeve.offsetWidth * 0.55) {
    sleeve.style.transition = 'transform 0.35s ease';
    sleeve.style.transform = 'translateX(0)';
    setTimeout(() => { sleeve.style.transition = ''; }, 360);
  }
}

sleeve.addEventListener('pointerup', endSleeveDrag);
sleeve.addEventListener('pointercancel', endSleeveDrag);

function finishSleeve() {
  if (step !== 2) return;
  sleeveDragging = false;
  document.body.classList.remove('is-dragging');
  playCardboard();
  playChime(560);
  rumble([40, 20, 60]);
  sleeve.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease';
  sleeve.style.transform = `translateX(-${window.innerWidth}px)`;
  sleeve.style.opacity = '0';
  burstAt(sleeve, 36, ['#f4f5f7', '#c5c9d1', '#2997ff']);
  setTimeout(() => showStep(3), 480);
}

// ---------- Step 3: lid ----------
const boxLid = document.getElementById('boxLid');
const lidHoldBtn = document.getElementById('lidHoldBtn');
const lidProgress = document.getElementById('lidProgress');

bindHold(lidHoldBtn, lidProgress, () => {
  playCardboard();
  playChime(600);
  rumble([60, 40, 80]);
  boxLid.style.transform = 'rotateX(-118deg)';
  boxLid.classList.add('lifted');
  burstAt(boxLid, 30);
  flash();
  setTimeout(() => showStep(4), 700);
});

// ---------- Step 4: lift ----------
const phoneLiftBtn = document.getElementById('phoneLiftBtn');
phoneLiftBtn.addEventListener('click', () => {
  if (step !== 4) return;
  initAudio();
  playChime(640);
  rumble(50);
  phoneLiftBtn.classList.add('lifting');
  burstAt(phoneLiftBtn, 24, ['#8a8f98', '#c5c9d1', '#64d2ff']);
  setTimeout(() => showStep(5), 650);
});

// ---------- Step 5: flip ----------
const phoneFlip = document.getElementById('phoneFlip');
phoneFlip.addEventListener('click', () => {
  if (step !== 5) return;
  initAudio();
  playChime(700);
  rumble([30, 20, 40]);
  phoneFlip.classList.add('flipped');
  setTimeout(() => {
    burstAt(phoneFlip, 20);
    showStep(6);
  }, 900);
});

// ---------- Step 6: peel ----------
const peelFilm = document.getElementById('peelFilm');
const peelHoldBtn = document.getElementById('peelHoldBtn');
const peelProgress = document.getElementById('peelProgress');

bindHold(peelHoldBtn, peelProgress, () => {
  playPeelSfx();
  playChime(760);
  rumble([40, 30, 40]);
  peelFilm.classList.add('peeled');
  burstAt(peelFilm, 32, ['#ffffff', '#a8d4ff', '#c5c9d1']);
  setTimeout(() => showStep(7), 750);
});

// ---------- Step 7: power ----------
const phonePower = document.getElementById('phonePower');
const screenBoot = document.getElementById('screenBoot');
const sideButton = document.getElementById('sideButton');
const powerHoldBtn = document.getElementById('powerHoldBtn');
const powerProgress = document.getElementById('powerProgress');

function powerComplete() {
  document.body.classList.add('powered-on');
  sideButton.classList.add('active');
  rumble([80, 40, 80, 40, 200]);
  flash();
  shockAt(phonePower);
  burstAt(phonePower, 80, [
    selectedColor.glow,
    selectedColor.frameLight,
    selectedColor.accent,
    '#ffffff',
    '#30d158',
  ]);
  screenBoot.classList.add('show-logo');
  setTimeout(() => {
    document.body.classList.add('complete');
    showStep(8);
    accessories.hidden = false;
  }, 1400);
}

bindHold(powerHoldBtn, powerProgress, powerComplete);
bindHold(sideButton, powerProgress, powerComplete);

// ---------- Replay ----------
document.getElementById('replayBtn').addEventListener('click', () => {
  playChime(500);
  document.body.classList.remove('powered-on', 'complete');
  productBox.classList.remove('opening');
  productBox.style.cssText = '';
  sleeve.style.cssText = '';
  sleeve.classList.remove('dragging');
  boxLid.classList.remove('lifted');
  boxLid.style.transform = '';
  phoneLiftBtn.classList.remove('lifting');
  phoneFlip.classList.remove('flipped');
  peelFilm.classList.remove('peeled');
  peelFilm.style.transform = '';
  peelFilm.style.opacity = '';
  sideButton.classList.remove('active');
  screenBoot.classList.remove('show-logo');
  resetHoldVisual(lidProgress);
  resetHoldVisual(peelProgress);
  resetHoldVisual(powerProgress);
  holdProgress = 0;
  holdActive = false;
  document.body.classList.remove('is-holding', 'is-dragging');
  particles = [];
  shockwaves = [];
  accessories.hidden = true;
  showStep(0);
});

// ---------- Canvas FX ----------
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function preloadImages() {
  Object.values(COLORS).forEach((c) => {
    [c.select, c.back, c.swatch].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  });
}

function renderFrame(now) {
  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (holdActive && holdTrack) {
    const elapsed = now - holdStart;
    holdProgress = Math.min(1, elapsed / HOLD_MS);
    holdTrack.style.strokeDashoffset = String(RING * (1 - holdProgress));
    progressMetric.textContent = `${Math.floor(STEP_COPY[step].progress + holdProgress * 10)}%`;

    if (step === 3 && boxLid && !boxLid.classList.contains('lifted')) {
      boxLid.style.transform = `rotateX(${-holdProgress * 100}deg)`;
    }
    if (step === 6 && peelFilm && !peelFilm.classList.contains('peeled')) {
      peelFilm.style.transform = `translate(${holdProgress * 35}%, ${-holdProgress * 22}%) rotate(${holdProgress * 16}deg)`;
      peelFilm.style.opacity = String(1 - holdProgress * 0.35);
    }
    if (step === 7) {
      sideButton.classList.toggle('active', holdProgress > 0.15);
      if (holdProgress > 0.55) screenBoot.classList.add('show-logo');
    }

    if (holdPad && Math.random() > 0.35) {
      const r = holdPad.getBoundingClientRect();
      particles.push({
        x: r.left + r.width / 2 + (Math.random() - 0.5) * 60,
        y: r.top + r.height / 2 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 1,
        size: Math.random() * 3 + 1.5,
        color: selectedColor.glow,
        alpha: 1,
        decay: 0.045,
        gravity: 0.04,
      });
    }

    if (holdProgress >= 1) {
      holdActive = false;
      document.body.classList.remove('is-holding');
      if (holdPad) holdPad.classList.remove('charging');
      stopHoldAudio(step === 7);
      const done = holdOnComplete;
      holdOnComplete = null;
      if (done) done();
    }
  } else if (!holdActive && holdTrack && holdProgress > 0 && holdProgress < 1) {
    holdProgress = Math.max(0, holdProgress - dt * 1.4);
    holdTrack.style.strokeDashoffset = String(RING * (1 - holdProgress));
    if (step === 3 && boxLid && !boxLid.classList.contains('lifted')) {
      boxLid.style.transform = `rotateX(${-holdProgress * 100}deg)`;
    }
    if (step === 6 && peelFilm && !peelFilm.classList.contains('peeled')) {
      peelFilm.style.transform = `translate(${holdProgress * 35}%, ${-holdProgress * 22}%) rotate(${holdProgress * 16}deg)`;
      peelFilm.style.opacity = String(1 - holdProgress * 0.35);
    }
    if (step === 7 && holdProgress < 0.55) {
      screenBoot.classList.remove('show-logo');
      sideButton.classList.remove('active');
    }
  }

  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += sw.speed;
    sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 5 * sw.alpha;
    ctx.shadowColor = sw.color;
    ctx.shadowBlur = 16;
    ctx.globalAlpha = sw.alpha;
    ctx.stroke();
    ctx.restore();
    if (sw.alpha <= 0.01) shockwaves.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(renderFrame);
}

const stepTotalEl = document.getElementById('stepTotal');
if (stepTotalEl) stepTotalEl.textContent = String(layers.length).padStart(2, '0');

applyColor('burgundy');
preloadImages();
showStep(0);
requestAnimationFrame(renderFrame);
