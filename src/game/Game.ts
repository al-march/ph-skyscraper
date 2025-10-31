import Phaser from "phaser";
import {GAME_HEIGHT, GAME_WIDTH} from "./constants/index";
import {MainScene} from "./scenes/MainScene";

export class Game {
  constructor(element: HTMLElement) {
    new Phaser.Game({
      parent: element,
      scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      },
      physics: {
        default: "matter",
        matter: {
          debug: false
        }
      },
      scene: [MainScene]
    });
  }
}