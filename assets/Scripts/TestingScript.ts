// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestingScript extends cc.Component {
  @property({ type: cc.Prefab })
  public movingLinePrefab: cc.Prefab = null;

  private movingLineInstance: cc.Node = null;

  protected onEnable(): void {
    this.node.on(
      cc.Node.EventType.MOUSE_DOWN,
      (event) => {
        this.onMouseEvent(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_MOVE,
      (event) => {
        this.onMouseEvent(event);
      },
      this
    );
    this.node.on(
      cc.Node.EventType.MOUSE_UP,
      (event) => {
        this.onMouseEvent(event);
      },
      this
    );
  }

  public onMouseEvent(event: cc.Event.EventMouse) {
    switch (event.type) {
      case "mousedown":
        const location = event.getLocation();
        const localLocation = this.node.convertToNodeSpaceAR(location);
        let movingLine1 = cc.instantiate(this.movingLinePrefab);
        this.node.addChild(movingLine1);
        movingLine1.setPosition(localLocation);
        this.movingLineInstance = movingLine1;
        break;
      case "mousemove":
        if (this.movingLineInstance == null) return;
        const movingLocation = event.getLocation();
        const localMovingLocation =
          this.node.convertToNodeSpaceAR(movingLocation);
        let xDist = localMovingLocation.x - this.movingLineInstance.x;
        let yDist = localMovingLocation.y - this.movingLineInstance.y;
        let diff = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
        let movingAngle = Math.atan2(yDist,xDist);
        let movingAngleDeg = cc.misc.radiansToDegrees(movingAngle);
        this.movingLineInstance.rotation = -movingAngleDeg;
        this.movingLineInstance.width = diff;
        break;
      case "mouseup":
        this.movingLineInstance.destroy();
        console.log("object deleted successfully");
        this.movingLineInstance = null;
        break;
    }
  }
}
