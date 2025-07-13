import { CharacterAnimationContainer } from "@/shared/CharacterAnimationContainer";
import { ArcRotateCamera, CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, KeyboardEventTypes, LoadAssetContainerAsync, Matrix, Mesh, MeshBuilder, NodeRenderGraphBuildState, PhysicsAggregate, PhysicsBody, PhysicsCharacterController, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Space, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { CharacterControll } from "./CharacterControll";


export class ForceBasedCharacter {

    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.create_character();
    }


    async create_character() {

        const res = await LoadAssetContainerAsync("./model/ybotVer2.glb",
            this.scene, { pluginOptions: { gltf: { animationStartMode: 0 } } })
        const root = res.meshes[0]
        root.scaling.scaleInPlace(2)
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)
        root.position = Vector3.Zero();
        res.addAllToScene()

        const animationConteiner = new CharacterAnimationContainer(res.animationGroups, this.scene)
        const characterController = new CharacterControll(this.scene, animationConteiner);

        root.parent = characterController.displayMesh;

        const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        camera.lockedTarget = characterController.displayMesh;
        characterController.bindEvents();
    }

}