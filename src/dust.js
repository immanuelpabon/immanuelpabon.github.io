const puffLife = 0.45;
const puffSize = [4, 9];
const puffGrowth = 7;
const puffRise = [10, 24];
const puffSpread = [-13, 13];
const puffColor = [214, 198, 172];
const puffOpacity = 0.5;
const footOffset = 22;

export function initDust(k, player, onStep) {
  let puffs = [];
  let last = null;
  let lastFrame = null;
  let frameChanges = 0;
  const color = k.rgb(...puffColor);

  function spawn(pos) {
    puffs.push({
      x: pos.x + k.rand(puffSpread[0], puffSpread[1]),
      y: pos.y + footOffset,
      size: k.rand(puffSize[0], puffSize[1]),
      rise: k.rand(puffRise[0], puffRise[1]),
      t: 0,
    });
  }

  k.onUpdate(() => {
    const dt = Math.min(k.dt(), 0.05);
    const pos = player.worldPos();

    const anim = player.curAnim();
    const walking = last && pos.dist(last) > 0.5 && anim && anim.startsWith("walk");

    if (walking && player.frame !== lastFrame) {
      frameChanges++;
      if (frameChanges % 2 === 0) {
        spawn(pos);
        onStep();
      }
    }

    lastFrame = player.frame;
    last = pos;

    for (const puff of puffs) puff.t += dt;
    puffs = puffs.filter((puff) => puff.t < puffLife);
  });

  function draw() {
    for (const puff of puffs) {
      const t = puff.t / puffLife;
      const size = Math.max(4, Math.round((puff.size + t * puffGrowth) / 4) * 4);
      k.drawRect({
        width: size,
        height: size,
        pos: k.vec2(puff.x - size / 2, puff.y - t * puff.rise - size / 2),
        color,
        opacity: (1 - t) * puffOpacity,
      });
    }
  }

  k.add([k.pos(0, 0), k.z(550), { draw }]);
}
