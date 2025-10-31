import {Game} from "./game/Game";
import "./style.css";

const root = document.querySelector("#app");

if (root instanceof HTMLElement) {
  new Game(root);
}