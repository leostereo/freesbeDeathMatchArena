import { ArcRotateCamera, AxesViewer, CharacterSupportedState, FreeCamera, KeyboardEventTypes, LoadAssetContainerAsync, MeshBuilder, PhysicsCharacterController, Quaternion, Scene, Space, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ThirdPersonCharacterController } from "./classes/ThirdPersonCharacterController";

/**
 * Represents a character.
 * 
 * Creates a TPCC.
 * Load character meshes and animation groups.
 * Parent the TPCC to root.mesh.
 */

export class Character {

    constructor(private scene: Scene) {
        this.loadCharacter();
    }

    async loadCharacter() {

        const res = await LoadAssetContainerAsync("./model/ybot.glb",
            this.scene, { pluginOptions: { gltf: { animationStartMode: 0 } } })
        const root = res.meshes[0]
        root.scaling.scaleInPlace(2)
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)
        res.addAllToScene()

        // camera follow Capsule of PhysicsCharacter
        const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        camera.lockedTarget = root;

        //Axes
        const characterAxes = new AxesViewer(this.scene, 1);
        //characterAxes.xAxis.parent = root;   //red
        //characterAxes.zAxis.parent = root;   // blue

        // PhysicsCharacter
        let characterPosition = new Vector3(5.0, 32.0, -5.0);
        const TPCC = new ThirdPersonCharacterController(this.scene, characterPosition);

       
        TPCC.bindEvents();

        //bind character mesh to displaycapsule
        root.parent = TPCC.displayCapsule;
        TPCC.displayCapsule.visibility = 0

    };
}