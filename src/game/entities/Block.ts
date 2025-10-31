import {Labels} from "../constants/labels";

export class Block extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, fillColor = 0xffffff) {
    super(scene, x, y, width, height, fillColor);

    this.setName(Labels.block);
    scene.add.existing(this);
  }
}