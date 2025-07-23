import { CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";
import { AnimationGroup, ArcRotateCamera, CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, KeyboardEventTypes, LoadAssetContainerAsync, Matrix, Mesh, MeshBuilder, NodeRenderGraphBuildState, PhysicsAggregate, PhysicsBody, PhysicsCharacterController, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Space, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { CharacterControll } from "./class/CharacterControll";


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
        root.position._y = -1.6;
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)
        //root.position = Vector3.Zero();
        
        const cloneAnimationGroupArray: AnimationGroup[] = [];
        res.animationGroups.forEach((animationGroup) => {
            const clonedAG = animationGroup.clone(`player1_${animationGroup.name}`);
            cloneAnimationGroupArray.push(clonedAG);
        });

        res.addAllToScene()
        
        const animationConteiner = new CharacterAnimationContainer(res.animationGroups, 'player1', this.scene)
        const characterController = new CharacterControll(this.scene, animationConteiner);

        root.parent = characterController.displayMesh;

        const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        camera.lockedTarget = characterController.displayMesh;
        characterController.bindEvents();

        res.animationGroups.find((animationGroud)=>animationGroud.name === 'idle')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'walking')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'slow running')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'fast running')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'fresbe throw')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'falling idle')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'falling impact')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'falling flat impact')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'cross punch')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'jump up')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'running and jump')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'landing')?.dispose(); 
        res.animationGroups.find((animationGroud)=>animationGroud.name === 'baseball pitch')?.dispose(); 

    }

}