const dropDensity = 750;
const dropAngle = -14;
const dropSpeed = [900, 1500];
const dropLength = [14, 30];
const dropWidth = 1.4;
const dropOpacity = [0.18, 0.5];
const dropColor = [174, 204, 255];
const tintColor = [40, 60, 110];
const tintOpacity = 0.16;
const splashChance = 0.55;
const cycleTime = 45;
const fadeTime = 3;
const strikeGap = [11, 26];
const flashFade = 0.16;

export function initRain(k, { onWeather, onIntensity, onThunder }) {
  const rad = k.deg2rad(dropAngle + 90);
  const dir = k.vec2(Math.cos(rad), Math.sin(rad));
  const color = k.rgb(...dropColor);
  const tint = k.rgb(...tintColor);

  let raining = k.chance(0.5);
  let intensity = raining ? 1 : 0;
  let timer = 0;
  let drops = [];
  let splashes = [];
  let flash = 0;
  let strikeTimer = 0;
  let nextStrike = k.rand(strikeGap[0], strikeGap[1]);

  function spawn(drop, seeded) {
    const drift = Math.abs(dir.x) * k.height();
    drop.x = k.rand(-drift, k.width() + drift);
    drop.y = seeded ? k.rand(-k.height(), k.height()) : k.rand(-k.height() * 0.4, -10);
    drop.speed = k.rand(dropSpeed[0], dropSpeed[1]);
    drop.len = k.rand(dropLength[0], dropLength[1]);
    drop.opacity = k.rand(dropOpacity[0], dropOpacity[1]);
    const depth = 0.7 + 0.3 * ((drop.opacity - dropOpacity[0]) / (dropOpacity[1] - dropOpacity[0]));
    drop.speed *= depth;
    drop.len *= depth;
    drop.floor = k.rand(k.height() * 0.35, k.height() + 20);
    return drop;
  }

  function strike() {
    const near = k.rand(0.3, 1);

    flash = near;
    k.wait(0.11, () => {
      flash = Math.max(flash, near * 0.6);
    });
    k.wait(k.rand(0.5, 1) + (1 - near) * 3.5, () => onThunder(near));
  }

  function reset() {
    const count = Math.round(dropDensity * Math.max((k.width() * k.height()) / 1000000, 0.35));
    drops = [];
    for (let i = 0; i < count; i++) drops.push(spawn({}, true));
  }

  reset();
  k.onResize(reset);
  onWeather(raining);

  k.onUpdate(() => {
    const dt = Math.min(k.dt(), 0.05);

    timer += dt;
    if (timer >= cycleTime) {
      timer -= cycleTime;
      raining = !raining;
      if (raining) reset();
      onWeather(raining);
    }

    const target = raining ? 1 : 0;
    const step = dt / fadeTime;
    intensity = target > intensity
      ? Math.min(target, intensity + step)
      : Math.max(target, intensity - step);

    onIntensity(intensity);

    flash = Math.max(0, flash - dt / flashFade);

    if (raining) {
      strikeTimer += dt;
      if (strikeTimer >= nextStrike) {
        strikeTimer = 0;
        nextStrike = k.rand(strikeGap[0], strikeGap[1]);
        strike();
      }
    }

    if (intensity <= 0) {
      splashes = [];
      return;
    }

    for (const drop of drops) {
      drop.x += dir.x * drop.speed * dt;
      drop.y += dir.y * drop.speed * dt;

      if (drop.y < drop.floor) continue;

      if (k.chance(splashChance * intensity)) {
        const at = k.toWorld(k.vec2(drop.x, drop.floor));
        splashes.push({ x: at.x, y: at.y, t: 0, life: k.rand(0.18, 0.3) });
      }

      spawn(drop, false);
    }

    for (const splash of splashes) splash.t += dt;
    splashes = splashes.filter((splash) => splash.t < splash.life);
  });

  function draw() {
    if (intensity <= 0) return;

    k.drawRect({
      width: k.width(),
      height: k.height(),
      pos: k.vec2(0, 0),
      color: tint,
      opacity: tintOpacity * intensity,
      fixed: true,
    });

    for (const drop of drops) {
      k.drawLine({
        p1: k.vec2(drop.x, drop.y),
        p2: k.vec2(drop.x - dir.x * drop.len, drop.y - dir.y * drop.len),
        width: dropWidth,
        color,
        opacity: drop.opacity * intensity,
        fixed: true,
      });
    }

    if (flash > 0) {
      k.drawRect({
        width: k.width(),
        height: k.height(),
        pos: k.vec2(0, 0),
        color: k.rgb(255, 255, 255),
        opacity: flash * 0.5 * intensity,
        fixed: true,
      });
    }

    const zoom = k.camScale().x;

    for (const splash of splashes) {
      const t = splash.t / splash.life;
      for (const side of [-1, 1]) {
        k.drawLine({
          p1: k.vec2(splash.x, splash.y),
          p2: k.vec2(
            splash.x + (side * (1 + t * 5)) / zoom,
            splash.y - ((1 - t) * 3) / zoom
          ),
          width: 1 / zoom,
          color,
          opacity: (1 - t) * 0.45 * intensity,
        });
      }
    }
  }

  k.add([k.pos(0, 0), k.z(1000), { draw }]);
}
