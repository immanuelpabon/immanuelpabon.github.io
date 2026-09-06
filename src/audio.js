const musicSources = [
  ["./Elijah Would Be Blue.ogg", 'audio/ogg; codecs="vorbis"'],
  ["./Elijah Would Be Blue.mp3", "audio/mpeg"],
];

const rainSources = [["./rain.mp3", "audio/mpeg"]];

const unlockEvents = ["pointerdown", "touchstart", "keydown"];

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
    k.loadSound(name, src).onLoad(() => {
      track.ready = true;
      track.start();
    });
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

    if (k.audioCtx && k.audioCtx.state !== "running") k.audioCtx.resume();

    music.start();
    rain.start();

    if (music.handle) {
      for (const event of unlockEvents) {
        window.removeEventListener(event, unlock);
      }
    }
  };

  for (const event of unlockEvents) {
    window.addEventListener(event, unlock);
  }

  return {
    setRainVolume(level) {
      rain.setVolume(level * 0.5);
    },
  };
}
