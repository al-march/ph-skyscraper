import {Floor} from "../entities/Floor";
import {BLOCK_HEIGHT, BLOCK_WIDTH, GAME_HEIGHT, GAME_WIDTH} from "../constants/index";
import {Line} from "../entities/Line";
import {Block} from "../entities/Block";
import {Labels} from "../constants/labels";

type Pair = Phaser.Types.Physics.Matter.MatterCollisionPair;

export class MainScene extends Phaser.Scene {
  activeBlock?: Phaser.GameObjects.GameObject;
  activeBlockTween?: Phaser.Tweens.Tween;
  line?: Line;
  floor?: Floor;
  text?: Phaser.GameObjects.Text;

  count = 0;

  get distance() {
    return this.count * BLOCK_HEIGHT;
  }

  create() {
    this.count = 0;
    this.floor = new Floor(this, 0, GAME_HEIGHT / 2);
    this.cameras.main.centerOn(0, 0);

    this.line = new Line(this);

    this.createBlock({x: 0, y: GAME_HEIGHT / 2 - 150});
    this.text = this.add.text(this.cameras.main.width / 2, GAME_HEIGHT / 2, "0", {
      fontSize: 200,
      fontStyle: "bold",
      color: "gray",
    })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    setTimeout(() => {
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
    this.text?.setText(`${this.distance.toFixed()}m`);
  }

  createActiveBlock() {
    const block = this.createBlock({
      x: -GAME_WIDTH / 5,
      y: this.cameras.main.worldView.y + BLOCK_HEIGHT,
      onCollide: (pair) => {
        if (isFloor(pair)) {
          this.scene.restart();
        }

        if (!block.getData("fallen")) {
          block.setData("fallen", true);
          this.count += 1;

          const newZoom = GAME_HEIGHT / (GAME_HEIGHT + this.distance);

          this.createActiveBlock();
          this.tweens.add({
            targets: this.cameras.main,
            zoom: newZoom,
            duration: 150,
            scrollY: this.cameras.main.scrollY - BLOCK_HEIGHT / 2,
            ease: "cubicInOut",
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
    const block = new Block(
      this,
      config.x,
      config.y,
      BLOCK_WIDTH,
      BLOCK_HEIGHT,
      0xFFFFFF
    );

    this.matter.add.gameObject(block, {
      restitution: 0.5,
      density: 0.005,
      friction: 1,
      frictionStatic: 1,
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