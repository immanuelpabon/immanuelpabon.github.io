const leafFrames = [476, 477, 478, 479];
const leafCount = 4;
const leafSpeed = [28, 64];
const leafDrift = [-25, -8];
const leafScale = [2.4, 3.7];
const leafOpacity = [0.55, 1];
const swayRate = [1.2, 2.6];
const swayWidth = [7, 23];
const tumbleRate = [3, 7];
const margin = 60;

export function initLeaves(k) {
  let leaves = [];
  let density = 1;

  function view() {
    const cam = k.camPos();
    const scale = k.camScale();
    return {
      x: cam.x,
      y: cam.y,
      halfW: k.width() / 2 / scale.x,
      halfH: k.height() / 2 / scale.y,
    };
  }

  function spawn(leaf, seeded) {
    const v = view();
    leaf.x = k.rand(v.x - v.halfW - margin, v.x + v.halfW + margin);
    leaf.y = seeded
      ? k.rand(v.y - v.halfH, v.y + v.halfH)
      : k.rand(v.y - v.halfH - 140, v.y - v.halfH - 20);
    leaf.speed = k.rand(leafSpeed[0], leafSpeed[1]);
    leaf.drift = k.rand(leafDrift[0], leafDrift[1]);
    leaf.scale = k.rand(leafScale[0], leafScale[1]);
    leaf.opacity = k.rand(leafOpacity[0], leafOpacity[1]);
    leaf.sway = k.rand(swayRate[0], swayRate[1]);
    leaf.swayWidth = k.rand(swayWidth[0], swayWidth[1]);
    leaf.tumble = k.rand(tumbleRate[0], tumbleRate[1]);
    leaf.phase = k.rand(0, Math.PI * 2);
    leaf.frame = k.rand(0, leafFrames.length);
    return leaf;
  }

  function reset() {
    leaves = [];
    for (let i = 0; i < leafCount; i++) leaves.push(spawn({}, true));
  }

  reset();
  k.onResize(reset);

  k.onUpdate(() => {
    if (density <= 0) return;
    const dt = Math.min(k.dt(), 0.05);
    const v = view();

    for (const leaf of leaves) {
      leaf.phase += leaf.sway * dt;
      leaf.frame = (leaf.frame + leaf.tumble * dt) % leafFrames.length;
      leaf.y += leaf.speed * dt;
      leaf.x += (leaf.drift + Math.cos(leaf.phase) * leaf.swayWidth) * dt;

      const gone =
        leaf.y > v.y + v.halfH + margin ||
        leaf.x < v.x - v.halfW - margin * 3 ||
        leaf.x > v.x + v.halfW + margin * 3;

      if (gone) spawn(leaf, false);
    }
  });

  function draw() {
    if (density <= 0) return;

    for (const leaf of leaves) {
      k.drawSprite({
        sprite: "spritesheet",
        frame: leafFrames[Math.floor(leaf.frame)],
        pos: k.vec2(leaf.x, leaf.y),
        anchor: "center",
        scale: leaf.scale,
        flipX: Math.cos(leaf.phase) < 0,
        opacity: leaf.opacity * density,
      });
    }
  }

  k.add([k.pos(0, 0), k.z(900), { draw }]);

  return {
    setDensity(v) {
      density = v;
    },
  };
}
