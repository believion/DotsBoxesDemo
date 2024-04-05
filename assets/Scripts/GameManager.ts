// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameState, { GAME, GAME_STATES, SCREEN } from "./GameState";
import PointScript from "./PointScript";

const { ccclass, property } = cc._decorator;

export const eventTarget = new cc.EventTarget();

@ccclass
export default class GameManager extends cc.Component {
  private gameStateInstance: GameState = null;
  @property({ type: cc.Node })
  public gameScreen: cc.Node = null;

  @property({ type: cc.Node })
  public startScreen: cc.Node = null;

  @property({ type: cc.EditBox })
  public rowsBox: cc.EditBox = null;

  @property({ type: cc.EditBox })
  public columnsBox: cc.EditBox = null;

  @property(cc.Integer)
  public gridSpacing: number = 200;

  public rows: number = 0;
  public columns: number = 0;

  public dots: cc.Node[][] = [];
  public lines: cc.Node[][] = [];

  @property({ type: cc.Prefab })
  dotPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  linePrefab: cc.Prefab = null;

  @property(cc.Prefab)
  movingLinePrefab: cc.Prefab = null;

  @property(cc.Node)
  pointsPos: cc.Node = null;

  @property(cc.Node)
  linesPos: cc.Node = null;

  @property(cc.Node)
  movingLineParent: cc.Node = null;

  private movingLineInstance: cc.Node = null;
  private lock: boolean = false;

  protected start(): void {
    this.init();
    this.gameScreen.active = false;
    this.startScreen.active = true;
  }

  private init() {
    this.node.on(
      cc.Node.EventType.MOUSE_DOWN,
      (event) => {
        this.mouseEventsHandler(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_UP,
      (event) => {
        this.mouseEventsHandler(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_MOVE,
      (event) => {
        this.mouseEventsHandler(event);
      },
      this
    );
    this.gameStateInstance = GAME;
  }

  public onStartGame() {
    this.createGrid();
    this.startScreen.active = false;
    this.gameScreen.active = true;
    this.gameStateInstance.changeScreen(SCREEN.GAMESCREEN);
  }

  public createGrid() {
    this.rows = parseInt(this.rowsBox.string);
    this.columns = parseInt(this.columnsBox.string);

    for (let x = 0; x < this.columns; x++) {
      this.dots[x] = [];
      for (let y = 0; y < this.rows; y++) {
        let dot = cc.instantiate(this.dotPrefab);
        this.pointsPos.addChild(dot);
        dot.setPosition(x * 200, -y * 200);
        this.dots[x][y] = dot;
      }
    }

    // generating horizontal lines
    for (let x = 0; x < this.columns - 1; x++) {
      for (let y = 0; y < this.rows; y++) {
        let line1 = cc.instantiate(this.linePrefab);
        this.linesPos.addChild(line1);
        line1.setPosition(x * 200, -y * 200);
      }
    }

    // generating vertical lines
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows - 1; y++) {
        let line2 = cc.instantiate(this.linePrefab);
        this.linesPos.addChild(line2);
        line2.angle = -90;
        line2.setPosition(x * 200, -y * 200);
      }
    }

    console.log(
      `Grid Created Successfully of size ${this.rows} by ${this.columns}`
    );
  }

  public mouseEventsHandler(event: cc.Event.EventMouse) {
    if (this.gameStateInstance.getScreen() == SCREEN.STARTSCREEN) return;
    switch (event.type) {
      case "mousedown":
        if (GAME.getGameState() != GAME_STATES.SELECTED) return;
        if (this.lock == true) return;
        this.lock = true;
        const location = event.getLocation();
        const localLocation = this.node.convertToNodeSpaceAR(location);
        let movingLine1 = cc.instantiate(this.movingLinePrefab);
        this.movingLineParent.addChild(movingLine1);
        movingLine1.setPosition(localLocation);
        this.movingLineInstance = movingLine1;
        break;
      case "mousemove":
        if (
          this.movingLineInstance == null ||
          GAME.getGameState() != GAME_STATES.SELECTED
        )
          return;
        const movingLocation = event.getLocation();
        const localMovingLocation =
          this.node.convertToNodeSpaceAR(movingLocation);
        let xDist = localMovingLocation.x - this.movingLineInstance.x;
        let yDist = localMovingLocation.y - this.movingLineInstance.y;
        let diff = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
        let movingAngle = Math.atan2(yDist, xDist);
        let movingAngleDeg = cc.misc.radiansToDegrees(movingAngle);
        this.movingLineInstance.angle = movingAngleDeg;
        this.movingLineInstance.width = diff;
        break;
      case "mouseup":
        if (this.movingLineInstance == null) return;
        this.lock = false;
        if (
          GAME.getGameState() == GAME_STATES.SELECTED &&
          GAME.currentSecondarySelectedPoint != null
        ) {
          GAME.currentSelectedPoint
            .getComponent(PointScript)
            .changeColorNode(cc.Color.MAGENTA);
          GAME.currentSecondarySelectedPoint
            .getComponent(PointScript)
            .changeColorNode(cc.Color.MAGENTA);

          let connectionLine = cc.instantiate(this.movingLinePrefab);
          this.linesPos.addChild(connectionLine);
          connectionLine.setPosition(GAME.currentSelectedPoint.position);
          let xDist =
            GAME.currentSecondarySelectedPoint.x - GAME.currentSelectedPoint.x;
          let yDist =
            GAME.currentSecondarySelectedPoint.y - GAME.currentSelectedPoint.y;
          let diff = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
          let movingAngle = Math.atan2(yDist, xDist);
          let movingAngleDeg = cc.misc.radiansToDegrees(movingAngle);
          connectionLine.angle = movingAngleDeg;
          cc.tween(connectionLine)
            .to(0.2, { width: diff }, { easing: "linear" })
            .call(() => {
              GAME.currentSecondarySelectedPoint.setScale(1.2, 1.2);
              GAME.currentSecondarySelectedPoint = null;
            })
            .start();
        }
        this.movingLineInstance.destroy();
        GAME.currentSelectedPoint.setScale(1.2, 1.2);
        GAME.currentSelectedPoint = null;
        console.log("object deleted successfully");
        this.movingLineInstance = null;
        GAME.changeState(GAME_STATES.IDLE);
        break;
    }
  }
}
