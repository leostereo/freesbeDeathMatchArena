import { Player1Data, Player2Data } from "@/shared/class/PlayerData";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { EventContainer } from "@/shared/class/EventContainer";
import { AssetsManager, MeshAssetTask } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { AssetsControll } from "./assetsControll";
import { Scene } from "@babylonjs/core/scene";
import * as GUI from '@babylonjs/gui'
import "@babylonjs/loaders/glTF";
import { Hud } from "./hud";
import { CharacterControll } from "@/characters/stateBasedCharacter/CharacterControll";


export default class MainScene {

  private assetsManager: AssetsManager;
  private assetsControll: AssetsControll;


  private advancedDynamicTexture: GUI.AdvancedDynamicTexture
  private hud: Hud;
  private eventContainer: EventContainer;
  private player1: CharacterControll;


  private player1Health = '';
  private player2Health = '';


  constructor(private scene: Scene, private canvas: HTMLCanvasElement, private engine: Engine | WebGPUEngine) {

    this.eventContainer = new EventContainer();
    this.advancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    this.hud = new Hud(this.advancedDynamicTexture);

    this.assetsManager = new AssetsManager(this.scene);
    this.assetsControll = new AssetsControll(this.scene, this.assetsManager);

    this.bindObservables();

  }

  bindObservables() {

    this.assetsManager.onTasksDoneObservable.add(() => {

      this.init_game()
      this.loadPlayersAndEnemies(this.assetsControll.getPlayerMesh());
      this.scene.onBeforeRenderObservable.add(() => this.mainLoopTasks())

      this.engine.runRenderLoop(() => {
        this.scene.render();
      })
    })
  }


  init_game() {
    this.player1Health = 'xxxxxx';
    this.player2Health = 'xxxxxx';
    this.hud.updatePlayer1Hud(this.player1Health)
    this.hud.updatePlayer2Hud(this.player2Health)
  }

  async loadPlayersAndEnemies(playerMeshAssetTask: MeshAssetTask): Promise<void> {
    this.player1 = new CharacterControll(this.scene, playerMeshAssetTask, new Player1Data(), this.eventContainer);   // linear velocity propelhed
  }

  displayRestartMessage() {
    const restartButton = GUI.Button.CreateSimpleButton("but1", "restart");
    restartButton.width = "150px"
    restartButton.height = "40px";
    restartButton.top = "-250px"
    restartButton.color = "white";
    restartButton.cornerRadius = 20;
    restartButton.background = "blue";

    restartButton.onPointerUpObservable.add(() => {
      window.location.reload();
    });

    setTimeout(() => {
      this.advancedDynamicTexture.addControl(restartButton);
    }, 3000)
  }

  mainLoopTasks() {
    const lastEvent = this.eventContainer.getLastEvent();
    if (lastEvent) {
      if (lastEvent.eventType === 'freesbehit') {
        if (lastEvent.eventData?.target === 'player1') {
          this.player1.informGameEvent(lastEvent)
          this.player1Health = this.player1Health.slice(0, -1);
          this.hud.updatePlayer1Hud(this.player1Health);
          if (this.player1Health === '') {
            this.player1.informGameEvent({ eventType: "hasLoosed", eventData: null })
            //this.player2.informGameEvent({ eventType: "hasWon", eventData: null })
            this.displayRestartMessage();
          }
        }
        if (lastEvent.eventData?.target === 'player2') {
          //this.player2.informGameEvent(lastEvent)
          this.player2Health = this.player2Health.slice(0, -1);
          this.hud.updatePlayer2Hud(this.player2Health);
          if (this.player2Health === '') {
            //this.player2.informGameEvent({ eventType: "hasLoosed", eventData: null })
            this.player1.informGameEvent({ eventType: "hasWon", eventData: null })
            this.displayRestartMessage();
          }
        }
      }
    }
  }
}
