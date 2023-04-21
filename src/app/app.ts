import { GameScene } from './scene';

export class App {
  constructor() {
    let gameScene = new  GameScene(document.getElementById('main-canvas') as HTMLCanvasElement)
    gameScene.startAnimation();
  }
}
