import { ArcRotateCamera, AxesViewer, CharacterSupportedState, FreeCamera, KeyboardEventTypes, LoadAssetContainerAsync, MeshBuilder, PhysicsCharacterController, Quaternion, Scene, Space, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ThirdPersonCharacterController } from "./classes/ThirdPersonCharacterController";


export class Character {

    constructor(private scene: Scene) {
        this.loadCharacter();
    }

    async loadCharacter() {
        // PhysicsCharacter
        let characterPosition = new Vector3(5.0, 32.0, -5.0);
        const TPCC = new ThirdPersonCharacterController(this.scene, characterPosition);
        TPCC.bindEvents();
        // nose for PhysicsCharacter
        // const nose = MeshBuilder.CreateBox("nose", {
        //     height: 0.4,
        //     width: 1.4,
        //     depth: 0.4,
        // }, this.scene)
        // nose.position = new Vector3(0.68, 0.36, 0)
        // nose.parent = TPCC.displayCapsule

        const characterAxes = new AxesViewer(this.scene, 1);
        characterAxes.xAxis.parent = TPCC.displayCapsule;   //red
        characterAxes.zAxis.parent = TPCC.displayCapsule;   // blue

        // camera follow Capsule of PhysicsCharacter
        const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        camera.lockedTarget = TPCC.lookTarget;

        const res = await LoadAssetContainerAsync("./model/ybot.glb",
            this.scene, { pluginOptions: { gltf: { animationStartMode: 0 } } })
        const root = res.meshes[0]
        root.scaling.scaleInPlace(2)
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)
        res.addAllToScene()
        root.parent = TPCC.displayCapsule;
        TPCC.displayCapsule.visibility = 0


        this.scene.onBeforeRenderObservable.add(()=>{
            //console.log(TPCC)
        })
        
    };
}