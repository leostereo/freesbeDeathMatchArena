import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { Ground } from "./ground";
import { Character } from "../characters/BBjsProposedCharacter/Character"
import { Camera, GlowLayer } from "@babylonjs/core";
import { EnemySpawnClass } from "./enemies/EnemySpawnClass";
import { VelocityBasedCharacter } from "@/characters/velocityBasedCharacterController/VelocityBasedCharacter";
import { Player1Data, Player2Data } from "@/shared/class/PlayerData";
import { EventContainer } from "@/shared/class/EventContainer";
import { Hud } from "./hud";

export default class MainScene {

  private camera: ArcRotateCamera;
  private eventContainer: EventContainer;
  private player1: VelocityBasedCharacter;
  private player2: VelocityBasedCharacter;
  private hud : Hud;

  private player1Health = 'xxxxx';
  private player2Health = 'xxxxx';

  constructor(private scene: Scene, private canvas: HTMLCanvasElement, private engine: Engine | WebGPUEngine) {
    this._setCamera(scene);
    this._setLight(scene);
    this.turnGlow();
    this.eventContainer = new EventContainer();
    this.loadComponents();
    this.hud = new Hud();
    this.hud.updatePlayer1Hud(this.player1Health)
    this.hud.updatePlayer2Hud(this.player2Health)

    this.scene.onBeforeRenderObservable.add(() => this.mainLoopTasks())

  }

  _setCamera(scene: Scene): void {
    // Creates, angles, distances and targets the camera
    var camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 70, new Vector3(0, 0, 0), scene);

    // This positions the camera
    //camera.setPosition(new Vector3(0, 0, -10));
  }

  _setLight(scene: Scene): void {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.5;
  }

  turnGlow(){
    const gl = new GlowLayer("glow", this.scene);
    gl.intensity = 0.5;
  }

  _setEnvironment(scene: Scene) {
    scene.createDefaultEnvironment({ createGround: false, createSkybox: false });
  }

  _setPipeLine(): void {
    const pipeline = new DefaultRenderingPipeline("default-pipeline", false, this.scene, [this.scene.activeCamera!]);
    pipeline.fxaaEnabled = true;
    pipeline.samples = 4;
  }

  async loadComponents(): Promise<void> {
    new Ground(this.scene);
    this.player1 = new VelocityBasedCharacter(this.scene, new Player1Data(), this.eventContainer);   // linear velocity propelhed
    this.player2 = new VelocityBasedCharacter(this.scene, new Player2Data(), this.eventContainer);   // linear velocity propelhed
    //new EnemySpawnClass(this.scene);
  }

  mainLoopTasks() {
    const lastEvent = this.eventContainer.getLastEvent();
    if (lastEvent) {
      if (lastEvent.eventType === 'freesbehit') {
        if (lastEvent.eventData?.target === 'player1') {
          this.player1.informGameEvent(lastEvent)
          this.player1Health = this.player1Health.slice(0,-1);
          this.hud.updatePlayer1Hud(this.player1Health);
          if(this.player1Health === ''){
            this.player1.informGameEvent({eventType:"hasLoosed",eventData:null})
            this.player2.informGameEvent({eventType:"hasWon",eventData:null})
          }
        }
        if (lastEvent.eventData?.target === 'player2') {
          this.player2.informGameEvent(lastEvent)
          this.player2Health = this.player2Health.slice(0,-1);
          this.hud.updatePlayer2Hud(this.player2Health);
          if(this.player2Health === ''){
            this.player2.informGameEvent({eventType:"hasLoosed",eventData:null})
            this.player1.informGameEvent({eventType:"hasWon",eventData:null})
          }
        }
      }
    }
  }
}
