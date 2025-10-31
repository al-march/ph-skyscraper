import {GAME_HEIGHT, GAME_WIDTH} from "../constants";

export class Floor extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, GAME_HEIGHT / 2, GAME_WIDTH, 10, 0xdedede);

    this.scene.add.existing(this);

    this.scene.matter.add.gameObject(this, {
        label: Floor.label,
        isStatic: true
      }
    );
  }

  static label = "Floor";
}