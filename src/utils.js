import { k } from "./kaboomCtx";

const typeSpeed = 30;
const blipVolume = 0.1;
const blipAttack = 0.025;

function voicePitch(speaker) {
  let sum = 0;
  for (const ch of speaker) sum += ch.charCodeAt(0);
  return 260 + (sum % 8) * 35;
}

function blip(pitch) {
  const ctx = k.audioCtx;
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.value = pitch;

  filter.type = "lowpass";
  filter.frequency.value = pitch * 2.5;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(blipVolume, now + blipAttack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

export function displayDialogue(text, onDisplayEnd, speaker = "") {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close");
  const pitch = voicePitch(speaker);

  dialogueUI.style.display = "block";
  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index >= text.length) {
      clearInterval(intervalRef);
      return;
    }

    if (text[index] === "<" && text.indexOf(">", index) !== -1) {
      const end = text.indexOf(">", index);
      currentText += text.slice(index, end + 1);
      index = end + 1;
    } else {
      if (text[index] !== " ") blip(pitch);
      currentText += text[index];
      index++;
    }

    dialogue.innerHTML = currentText;
  }, typeSpeed);

  function onKeyPress(key) {
    if (key.code === "Enter") {
      closeBtn.click();
    }
  }

  function onCloseBtnClick() {
    if (index < text.length) {
      clearInterval(intervalRef);
      currentText = text;
      dialogue.innerHTML = text;
      index = text.length;
      return;
    }

    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
    window.removeEventListener("keypress", onKeyPress);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
  window.addEventListener("keypress", onKeyPress);
}

export function setCamScale() {
  const resizeFactor = k.width() / k.height();
  const scale = resizeFactor < 1 ? 1 : 1.5;
  k.camScale(k.vec2(scale));
  return scale;
}
