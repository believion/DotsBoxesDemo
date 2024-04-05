// Script to manage global game state

export enum GAME_STATES {
  IDLE,
  SELECTED,
  CONNECTED,
}

export enum SCREEN {
  GAMESCREEN,
  STARTSCREEN,
}

const { ccclass, property } = cc._decorator;

export default class GameState {
  private gameState: GAME_STATES = GAME_STATES.IDLE;
  private screenState: SCREEN = SCREEN.STARTSCREEN;
  public currentSelectedPoint: cc.Node = null;
  public currentSecondarySelectedPoint: cc.Node = null;
  public static instance: GameState = null;

  private constructor() {}
  public static getInstance() {
    if (this.instance == null) {
      this.instance = new GameState();
    }
    return this.instance;
  }

  public changeState(state: GAME_STATES) {
    this.gameState = state;
  }

  public getGameState() {
    return this.gameState;
  }

  public changeScreen(screen: SCREEN) {
    this.screenState = screen;
  }

  public getScreen() {
    return this.screenState;
  }
}

export const GAME = GameState.getInstance();
