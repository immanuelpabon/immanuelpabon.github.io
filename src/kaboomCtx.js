import kaboom from "kaplay";
import { scaleFactor } from "./constants";

export const k = kaboom({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: false,
});
