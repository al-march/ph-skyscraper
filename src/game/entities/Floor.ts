import {GAME_WIDTH} from "../constants";
import {Labels} from "../constants/labels";

export class Floor extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, GAME_WIDTH, 10, 0xdedede);

    this.scene.add.existing(this);
    this.setName(Labels.floor);

    this.scene.matter.add.gameObject(this, {
        label: Floor.label,
        isStatic: true
      }
    );
  }

  static label = "Floor";
}