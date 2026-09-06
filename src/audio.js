const musicSources = [
  ["./Elijah Would Be Blue.mp3", "audio/mpeg"],
  ["./Elijah Would Be Blue.ogg", 'audio/ogg; codecs="vorbis"'],
];

const rainSources = [["./rain.mp3", "audio/mpeg"]];

const unlockEvents = [
  "pointerdown",
  "pointerup",
  "touchstart",
  "touchend",
  "mouseup",
  "click",
  "keydown",
];

async function pickSource(sources) {
  const probe = document.createElement("audio");

  for (const [src, type] of sources) {
    if (!probe.canPlayType(type)) continue;
    const res = await fetch(src, { method: "HEAD" }).catch(() => null);
    if (res && res.ok) return src;
  }

  return null;
}

function loadTrack(k, name, sources, volume, isUnlocked) {
  const track = { handle: null, ready: false, volume };

  track.start = () => {
    if (track.handle || !track.ready || !isUnlocked()) return;
    track.handle = k.play(name, { loop: true, volume: track.volume });
  };

  track.setVolume = (v) => {
    track.volume = v;
    if (track.handle) track.handle.volume = v;
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

export function initAudio(k) {
  let unlocked = false;
  const isUnlocked = () => unlocked;

  const music = loadTrack(k, "backgroundMusic", musicSources, 0.5, isUnlocked);
  const rain = loadTrack(k, "rainAmbience", rainSources, 0, isUnlocked);

  const unlock = () => {
    unlocked = true;

    const ctx = k.audioCtx;
    if (ctx) {
      if (ctx.state !== "running") ctx.resume();
      // iOS keeps the context silent until a buffer actually plays in the gesture
      const source = ctx.createBufferSource();
      source.buffer = ctx.createBuffer(1, 1, 22050);
      source.connect(ctx.destination);
      source.start(0);
    }

    music.start();
    rain.start();

    // Safari can refuse the first attempts, so keep listening until it takes
    if (ctx && ctx.state === "running" && music.handle) {
      for (const event of unlockEvents) {
        window.removeEventListener(event, unlock, true);
      }
    }
  };

  // Capture phase, so we see the touch before kaboom calls preventDefault on it
  for (const event of unlockEvents) {
    window.addEventListener(event, unlock, true);
  }

  return {
    setRainVolume(level) {
      rain.setVolume(level * 0.5);
    },
  };
}
