const musicSources = [
  ["./Elijah Would Be Blue.mp3", "audio/mpeg"],
  ["./Elijah Would Be Blue.ogg", 'audio/ogg; codecs="vorbis"'],
];

const rainSources = [["./rain.mp3", "audio/mpeg"]];

const unlockEvents = ["pointerdown", "touchstart", "keydown"];

const debug = location.search.includes("debug");

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
  const track = { handle: null, ready: false, volume, src: null, error: null };

  track.start = () => {
    if (track.handle || !track.ready || !isUnlocked()) return;
    try {
      track.handle = k.play(name, { loop: true, volume: track.volume });
    } catch (err) {
      track.error = String(err);
    }
  };

  track.setVolume = (v) => {
    track.volume = v;
    if (track.handle) track.handle.volume = v;
  };

  pickSource(sources).then((src) => {
    track.src = src;
    if (!src) {
      track.error = "no playable source";
      return;
    }

    k.loadSound(name, src)
      .onLoad(() => {
        track.ready = true;
        track.start();
      })
      .onError((err) => {
        track.error = String(err);
      });
  });

  return track;
}

function showDebug(k, music, rain, unlocked) {
  const probe = document.createElement("audio");
  let el = document.getElementById("audio-debug");

  if (!el) {
    el = document.createElement("pre");
    el.id = "audio-debug";
    el.style.cssText =
      "position:absolute;top:0;left:0;z-index:9;margin:0;padding:8px;" +
      "background:rgba(0,0,0,0.8);color:#7f7;font:12px monospace;white-space:pre-wrap";
    document.body.appendChild(el);
  }

  el.textContent = [
    `ctx      ${k.audioCtx ? k.audioCtx.state : "missing"}`,
    `unlocked ${unlocked()}`,
    `mp3      "${probe.canPlayType("audio/mpeg")}"`,
    `ogg      "${probe.canPlayType('audio/ogg; codecs="vorbis"')}"`,
    `music    ${music.src} ready=${music.ready} playing=${!!music.handle}`,
    `rain     ${rain.src} ready=${rain.ready} playing=${!!rain.handle}`,
    `error    ${music.error || rain.error || "none"}`,
  ].join("\n");
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

    if (music.handle) {
      for (const event of unlockEvents) {
        window.removeEventListener(event, unlock);
      }
    }
  };

  for (const event of unlockEvents) {
    window.addEventListener(event, unlock);
  }

  if (debug) {
    setInterval(() => showDebug(k, music, rain, isUnlocked), 500);
  }

  return {
    setRainVolume(level) {
      rain.setVolume(level * 0.5);
    },
  };
}
