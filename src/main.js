import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

// Load sprites
k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    "fire-idle": { from: 752, to: 755, loop: true, speed: 8 },
    "sign-idle": { from: 713, to: 716, loop: true, speed: 6 },
    "sparkle_1": { from: 876, to: 879, loop: true, speed: 6 },
    "sparkle_2": { from: 879, to: 882, loop: true, speed: 6 },
    "sparkle_3": { from: 915, to: 918, loop: true, speed: 6 },
    "koner-idle": { from: 792, to: 795, loop: true, speed: 6 },
    "brush-idle": { from: 410, to: 413, loop: true, speed: 6 },
    "son-idle": { from: 870, to: 872, loop: true, speed: 6 },
    "kid-idle": { from: 831, to: 832, loop: true, speed: 6 },
    "spy-idle": { from: 181, to: 182, loop: true, speed: 3 },
    "omori-idle": { from: 214, to: 217, loop: true, speed: 6 },
    "chert-idle": { from: 218, to: 221, loop: true, speed: 6 },
    "june-idle": { from: 837, to: 839, loop: true, speed: 1 }
  },
});

k.loadSprite("map", "./map.png");
k.loadSprite("background", "./backgroundTrees.png");

// Load the music using k.loadSound()
k.loadSound("backgroundMusic", "./Elijah Would Be Blue.ogg");

// Function to create a tiled background
function createTiledBackground(mapWidth, mapHeight, tileWidth, tileHeight) {
  const scaledTileWidth = tileWidth * scaleFactor;
  const scaledTileHeight = tileHeight * scaleFactor;
  const numTilesX = Math.ceil((mapWidth + k.width()) / scaledTileWidth);
  const numTilesY = Math.ceil((mapHeight + k.height()) / scaledTileHeight);

  for (let x = -numTilesX; x < numTilesX; x++) {
    for (let y = -numTilesY; y < numTilesY; y++) {
      k.add([
        k.sprite("background"),
        k.pos(x * scaledTileWidth, y * scaledTileHeight),
        k.scale(scaleFactor),
        k.anchor("topleft"),
        "background",
      ]);
    }
  }
}

// Set background color (optional, as we now use a tiled image)
k.setBackground(k.Color.fromHex("#311047"));

// Dialogue index for sign
let signDialogueIndex = 0;

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  // Call the function to create the tiled background
  const mapWidth = 656 * scaleFactor;
  const mapHeight = 528 * scaleFactor;
  createTiledBackground(mapWidth, mapHeight, 160, 160);

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const fire = k.add([
    k.sprite("spritesheet", { anim: "fire-idle" }),
    k.anchor("center"),
    k.pos(1314, 980), // Setting a default position for the fire
    k.scale(scaleFactor),
    "fire",
  ]);

  const june = k.add([
    k.sprite("spritesheet", { anim: "june-idle" }),
    k.anchor("center"),
    k.pos(1510, 1110),
    k.scale(scaleFactor),
    "june",
  ]);

  const koner = k.add([
    k.sprite("spritesheet", { anim: "koner-idle" }),
    k.anchor("center"),
    k.pos(480, 1760),
    k.scale(scaleFactor),
    "koner",
  ]);

  const brush = k.add([
    k.sprite("spritesheet", { anim: "brush-idle" }),
    k.anchor("center"),
    k.pos(150, 800),
    k.scale(scaleFactor),
    "brush",
  ]);

  const son = k.add([
    k.sprite("spritesheet", { anim: "son-idle" }),
    k.anchor("center"),
    k.pos(1800, 640),
    k.scale(scaleFactor),
    "son",
  ]);

  const kid = k.add([
    k.sprite("spritesheet", { anim: "kid-idle" }),
    k.anchor("center"),
    k.pos(800, 100),
    k.scale(scaleFactor),
    "kid",
  ]);

  const spy = k.add([
    k.sprite("spritesheet", { anim: "spy-idle" }),
    k.anchor("center"),
    k.pos(2460, 470),
    k.scale(scaleFactor),
    "spy",
  ]);

  const chert = k.add([
    k.sprite("spritesheet", { anim: "chert-idle" }),
    k.anchor("center"),
    k.pos(2550, 430),
    k.scale(scaleFactor),
    "chert",
  ]);

  const omori = k.add([
    k.sprite("spritesheet", { anim: "omori-idle" }),
    k.anchor("center"),
    k.pos(2390, 430),
    k.scale(scaleFactor),
    "omori",
  ]);

   const sparkle1 = k.add([
    k.sprite("spritesheet", { anim: "sparkle_1" }),
    k.anchor("center"),
    k.pos(2575, 1730),
    k.scale(scaleFactor),
    "sparkle_1",
  ]);
  const sparkle2 = k.add([
    k.sprite("spritesheet", { anim: "sparkle_2" }),
    k.anchor("center"),
    k.pos(2510, 1760),
    k.scale(scaleFactor),
    "sparkle_2",
  ]);
  const sparkle3 = k.add([
    k.sprite("spritesheet", { anim: "sparkle_3" }),
    k.anchor("center"),
    k.pos(2580, 1810),
    k.scale(scaleFactor),
    "sparkle_3",
  ]);

  const sign = k.add([
    k.sprite("spritesheet", { anim: "sign-idle" }),
    k.anchor("center"),
    k.pos(1315, 895),
    k.scale(scaleFactor),
    "sign",
  ]);

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(), // Initial position will be set based on spawn point
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            if (boundary.name === "sign") {
              player.isInDialogue = true;
              displayDialogue(
                dialogueData["sign"][signDialogueIndex],
                () => {
                  player.isInDialogue = false;
                  signDialogueIndex = (signDialogueIndex + 1) % dialogueData["sign"].length;
                }
              );
            } else {
              player.isInDialogue = true;
              displayDialogue(
                dialogueData[boundary.name],
                () => (player.isInDialogue = false)
              );
            }
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          // Calculate the correct position based on the map and scale factors
          const playerPosX = (entity.x * scaleFactor);
          const playerPosY = (entity.y * scaleFactor);
          player.pos = k.vec2(playerPosX, playerPosY);
          continue;
        }
      }
    }

    // Define a variable to hold the music instance
    let music;

    // Function to start playing music
    const startMusic = () => {
      if (!music || !music.isPlaying()) {
        music = k.play("backgroundMusic", {
          loop: true,
          volume: 0.5, // Adjust volume here (0.5 means 50% volume)
        });
      }
    };

    // Handle user interaction to start/resume the audio context
    const resumeAudioContext = () => {
      if (k.audioContext && k.audioContext.state === "suspended") {
        k.audioContext.resume().then(startMusic);
      } else {
        startMusic();
      }
    };

    // Attach event listeners to user interactions
    window.addEventListener("click", resumeAudioContext);
    window.addEventListener("keydown", resumeAudioContext);
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });

  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });

  setCamScale(k);
});

k.go("main");
