

/*
will load everything needed to complete the scene 
and render after all is loaded
*/

import { AbstractMesh, ArcRotateCamera, AssetsManager, HemisphericLight, MeshAssetTask, RichTypeString, Scene, Vector3 } from "@babylonjs/core";
import { Ground } from "./ground";

export class AssetsControll {

    private scene: Scene;
    private assetsManager: AssetsManager;
    public playerMesh:MeshAssetTask;

    constructor(scene: Scene, assetsManager:AssetsManager) {

        this.scene = scene;
        this.assetsManager = assetsManager;


        this.loadAssets();
        //
        //this.createEnvironment();
        //this.setSceneLightAndCamera();
        this.createGround();
        //
        //this.assetsManager.load();
    }

    loadAssets() {

        const playerModelTask = this.assetsManager.addMeshTask("playerModelTask", "", "./model/", "ybotV7.glb");

        playerModelTask.onSuccess = (task) => {
            task.loadedAnimationGroups.map((anim)=>anim.stop())
            this.playerMesh = task;
        }
    }

    getPlayerMesh():MeshAssetTask{
        return this.playerMesh;
    }

    setSceneLightAndCamera() {
        const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 60, new Vector3(0, 0, 0), this.scene);
        // const camera = new ArcRotateCamera("camera", 0, Math.PI / 2, 30, new Vector3(0, 0, 0), this.scene);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.5;
    }

    createEnvironment() {
        this.scene.createDefaultEnvironment({ createGround: false, createSkybox: false });
    }

    createGround() {
        new Ground(this.scene);
    }

}