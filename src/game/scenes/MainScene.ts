import {Floor} from "../entities/Floor";
import {GAME_HEIGHT, GAME_WIDTH} from "../constants/index";
import {Line} from "../entities/Line";
import {Block} from "../entities/Block";
import {Labels} from "../constants/labels";

type Pair = Phaser.Types.Physics.Matter.MatterCollisionPair;

const CAMERA_OFFSET = GAME_HEIGHT / 2;

export class MainScene extends Phaser.Scene {
  activeBlock?: Phaser.GameObjects.GameObject;
  activeBlockTween?: Phaser.Tweens.Tween;
  line?: Line;
  floor?: Floor;

  create() {
    this.floor = new Floor(this);
    this.cameras.main.startFollow(this.floor, true, 0, 0, 0, CAMERA_OFFSET);

    new Floor(this);

    this.line = new Line(this);

    this.createBlock({x: 0, y: GAME_HEIGHT / 2 - 150});

    this.cameras.main.once("followupdate", () => {
      this.createActiveBlock();
    });

    const onClick = () => {
      const body = this.activeBlock?.body;
      const tween = this.activeBlockTween;
      if (body) {
        tween?.destroy();
        this.matter.body.setStatic(body as MatterJS.BodyType, false);
      }
    };

    this.input.on("pointerdown", onClick);

    this.events.on("destroy", () => {
      this.input.off("pointerdown", onClick);
      this.activeBlockTween?.destroy();
      this.activeBlock?.destroy(true);
    });
  }

  update() {
    if (
      this.activeBlock
      && this.activeBlockTween?.isActive()
      && this.activeBlock instanceof Phaser.GameObjects.Rectangle
      && this.line
    ) {
      const startX = this.activeBlock.x;
      const startY = this.activeBlock.y;

      this.line.draw(startX, startY);
    }

    this.line?.setVisible(!!this.activeBlockTween?.isActive());
  }

  createActiveBlock() {
    const block = this.createBlock({
      x: -GAME_WIDTH / 5,
      y: this.cameras.main.worldView.y + 50,
      onCollide: (pair) => {
        if (isFloor(pair)) {
          this.scene.restart();
        }
        if (!block.getData("fallen")) {
          block.setData("fallen", true);

          const cam = this.cameras.main;
          const oldZoom = cam.zoom;
          const newZoom = oldZoom * (cam.height / (cam.height + block.height));

          this.tweens.add({
            targets: this.cameras.main,
            zoom: newZoom,
            scrollY: cam.scrollY - block.height / 2,
            duration: 300,
            ease: "cubicInOut",
            onComplete: () => {
              this.createActiveBlock();
            }
          });
        }
      }
    });

    if (block.body) {
      this.matter.body.setStatic(block.body as MatterJS.BodyType, true);
    }

    this.activeBlockTween = this.tweens.add({
      targets: block,
      x: [-GAME_WIDTH / 5, GAME_WIDTH / 5],
      repeat: -1,
      yoyo: true,
      duration: 1000
    });
    this.activeBlock = block;
  }

  createBlock(config: { x: number, y: number, onCollide?: (pair: Pair) => void }) {
    const width = Phaser.Math.FloatBetween(120, 220);
    const height = Phaser.Math.FloatBetween(30, 60);

    const block = new Block(this, config.x, config.y, width, height, 0xFFFFFF);
    this.matter.add.gameObject(block, {
      restitution: 0.7,
      mass: 1,
      label: Labels.block,
      onCollideCallback: (pair: Pair) => {
        config.onCollide?.(pair);
      }
    });
    return block;
  }
}

/**
 * Проверим что объект в паре коллизии MatterJS - пол
 */
function isFloor(pair: Pair) {
  return pair.bodyA.label === Floor.label || pair.bodyB.label === Floor.label;
}