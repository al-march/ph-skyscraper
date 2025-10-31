import {Floor} from "../entities/Floor";
import {Labels} from "../constants/labels";
import {GAME_HEIGHT, GAME_WIDTH} from "../constants/index";
import {Line} from "../entities/Line";

type Pair = Phaser.Types.Physics.Matter.MatterCollisionPair;

export class MainScene extends Phaser.Scene {
  startBlock = {
    x: 0,
    y: -GAME_HEIGHT / 2 + 100
  };

  activeBlock?: Phaser.GameObjects.GameObject;
  activeBlockTween?: Phaser.Tweens.Tween;
  line?: Line;

  create() {
    this.cameras.main.centerOn(0, 0);

    new Floor(this);

    this.createActiveBlock();
    this.createBlock({x: 0, y: GAME_HEIGHT / 2 - 50});
    this.line = new Line(this);

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
      y: this.startBlock.y,
      onCollide: (pair) => {
        if (isFloor(pair)) {
          this.scene.restart();
        }
        if (!block.getData("fallen")) {
          block.setData("fallen", true);
          this.createActiveBlock();
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

    const obj = this.matter.add.gameObject(
      this.add.rectangle(config.x, config.y, width, height, 0xFFFFFF), {
        restitution: 0.9,
        mass: 2,
        label: Labels.block,
        onCollideCallback: (pair: Pair) => {
          config.onCollide?.(pair);
        }
      }
    );
    obj.setName(Labels.block);
    return obj;
  }
}

/**
 * Проверим что объект в паре коллизии MatterJS - пол
 */
function isFloor(pair: Pair) {
  return pair.bodyA.label === Floor.label || pair.bodyB.label === Floor.label;
}