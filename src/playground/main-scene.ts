import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { Ground } from "./ground";
import { Character } from "./character/Character"
import { Camera } from "@babylonjs/core";

export default class MainScene {
  private camera: ArcRotateCamera;

  constructor(private scene: Scene, private canvas: HTMLCanvasElement, private engine: Engine | WebGPUEngine) {
    this._setCamera(scene);
    this._setLight(scene);
    //  this._setEnvironment(scene);
    this.loadComponents();
  }

  _setCamera(scene: Scene): void {
    // Creates, angles, distances and targets the camera
    var camera = new ArcRotateCamera("camera", 0, Math.PI/3, 50, new Vector3(0, 0, 0), scene);

    // This positions the camera
    //camera.setPosition(new Vector3(0, 0, -10));
  }

  _setLight(scene: Scene): void {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.5;
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
    // Load your files in order
    new Ground(this.scene);
    new Character(this.scene);
  }
}
