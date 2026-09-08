const musicSources = [
  ["./Elijah Would Be Blue.mp3", "audio/mpeg"],
  ["./Elijah Would Be Blue.ogg", 'audio/ogg; codecs="vorbis"'],
];

const rainSources = [["./rain.mp3", "audio/mpeg"]];

const unlockEvents = ["pointerdown", "touchstart", "touchend", "click", "keydown"];

const noiseLength = 6;
const thunderVolume = 0.35;
const stepVolume = 0.018;
const musicVolume = 1.8;
const rainVolume = 0.4;
const reloadAfterHidden = 1000;

let noiseBuffer = null;
let unlocked = false;
let hiddenAt = 0;

function getNoise(ctx) {
  if (noiseBuffer) return noiseBuffer;

  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseLength, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return noiseBuffer;
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

async function pickSource(sources) {
  const probe = document.createElement("audio");

  for (const [src, type] of sources) {
    if (!probe.canPlayType(type)) continue;
    const res = await fetch(src, { method: "HEAD" }).catch(() => null);
    if (res && res.ok) return src;
  }

  return null;
}

function loadTrack(k, name, sources, volume) {
  const track = {
    handle: null,
    ready: false,
    volume,
    start() {
      if (track.handle || !track.ready || !unlocked) return;
      track.handle = k.play(name, { loop: true, volume: track.volume });
    },
    setVolume(v) {
      track.volume = v;
      if (track.handle) track.handle.volume = v;
    },
  };

  pickSource(sources).then((src) => {
    if (!src) return;

    k.loadSound(name, src)
      .onLoad(() => {
        track.ready = true;
        track.start();
      })
      .onError((err) => console.error(name, err));
  });

  return track;
}

function playThunder(ctx, level) {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = getNoise(ctx);
  source.playbackRate.value = 0.8 + Math.random() * 0.4;

  const rolls = 1 + Math.floor(Math.random() * (1 + (1 - level) * 2.5));

  let at = now;
  let peak = thunderVolume * level;

  gain.gain.setValueAtTime(0, now);

  for (let i = 0; i < rolls; i++) {
    const attack = i === 0 ? 0.05 + 0.2 * (1 - level) : 0.08 + Math.random() * 0.15;
    const hold = 0.15 + Math.random() * 0.3;

    gain.gain.linearRampToValueAtTime(peak, at + attack);
    at += attack + hold;
    gain.gain.linearRampToValueAtTime(peak * 0.3, at);
    peak *= 0.7;
  }

  gain.gain.exponentialRampToValueAtTime(0.001, at + 1.2);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(200 + 400 * level, now);
  filter.frequency.exponentialRampToValueAtTime(80, at + 1.2);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now, Math.random() * 1.5);
  source.stop(at + 1.3);
}

function playStep(ctx) {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = getNoise(ctx);
  source.playbackRate.value = 0.9 + Math.random() * 0.3;

  filter.type = "bandpass";
  filter.frequency.value = 650 + Math.random() * 550;
  filter.Q.value = 0.7;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(stepVolume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now, Math.random() * 3);
  source.stop(now + 0.09);
}

function unlockContext(ctx) {
  ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = ctx.createBuffer(1, 1, 22050);
  source.connect(ctx.destination);
  source.start(0);
}

export function initAudio(k) {
  const music = loadTrack(k, "backgroundMusic", musicSources, 0);
  const rain = loadTrack(k, "rainAmbience", rainSources, 0);

  function unlock() {
    unlocked = true;

    const ctx = k.audioCtx;
    if (ctx && ctx.state !== "running") unlockContext(ctx);

    music.start();
    rain.start();
  }

  for (const event of unlockEvents) {
    window.addEventListener(event, unlock);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      hiddenAt = Date.now();
      return;
    }

    if (!unlocked || !hiddenAt || !isTouchDevice()) return;
    if (Date.now() - hiddenAt < reloadAfterHidden) return;

    location.reload();
  });

  return {
    thunder(level) {
      if (k.audioCtx && k.audioCtx.state === "running") playThunder(k.audioCtx, level);
    },
    step() {
      if (k.audioCtx && k.audioCtx.state === "running") playStep(k.audioCtx);
    },
    setMusicVolume(level) {
      music.setVolume(level * musicVolume);
    },
    setRainVolume(level) {
      rain.setVolume(level * rainVolume);
    },
  };
}
