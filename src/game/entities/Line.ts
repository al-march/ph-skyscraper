import {GAME_HEIGHT} from "../constants/index";

export class Line extends Phaser.GameObjects.Line {
  constructor(scene: Phaser.Scene) {
    super(scene);

    this.scene.add.existing(this);
    this.setOrigin(0, 0)
      .setName("line")
      .setStrokeStyle(4, 0xffffff, 0.5);
  }

  draw(x: number, y: number) {
    this.setTo(x, y, x, GAME_HEIGHT);
  }
}