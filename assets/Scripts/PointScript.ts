// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { eventTarget } from "./GameManager";
import { GAME, GAME_STATES } from "./GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PointScript extends cc.Component {
  @property(cc.Sprite)
  currSprite: cc.Sprite = null;

  protected start(): void {
    this.node.on(
      cc.Node.EventType.MOUSE_DOWN,
      (event) => {
        this.onTouchStart(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_ENTER,
      (event) => {
        this.onTouchStart(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_LEAVE,
      (event) => {
        this.onTouchStart(event);
      },
      this
    );
  }

  public changeColorNode(color: cc.Color) {
    this.node.color = color;
  }

  public onTouchStart(event: cc.Event.EventMouse) {
    switch (event.type) {
      case "mousedown":
        GAME.changeState(GAME_STATES.SELECTED);
        GAME.currentSelectedPoint = this.node;
        this.node.setScale(1.5, 1.5);
        break;
      case "mouseenter":
        if (GAME.getGameState() == GAME_STATES.SELECTED) {
          if (GAME.currentSelectedPoint == this.node) return;
          let xDist = Math.abs(GAME.currentSelectedPoint.x - this.node.x);
          let yDist = Math.abs(GAME.currentSelectedPoint.y - this.node.y);
          if ((xDist == 0 && yDist == 200) || (yDist == 0 && xDist == 200)) {
            this.node.setScale(1.5, 1.5);
            GAME.currentSecondarySelectedPoint = this.node;
            console.log("mouse entered the room!");
          }
          break;
        }
      case "mouseleave":
        if (GAME.getGameState() == GAME_STATES.SELECTED) {
          if (GAME.currentSelectedPoint != this.node) {
            GAME.currentSecondarySelectedPoint = null;
            this.node.setScale(1, 1);
          }
        }
        break;
    }
  }
}
