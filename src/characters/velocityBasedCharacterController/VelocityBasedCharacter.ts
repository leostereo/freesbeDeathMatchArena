import { AnimationGroup, ArcRotateCamera, CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, Color3, KeyboardEventTypes, LoadAssetContainerAsync, Matrix, Mesh, MeshBuilder, NodeRenderGraphBuildState, PhysicsAggregate, PhysicsBody, PhysicsCharacterController, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { CharacterControll } from "./class/CharacterControll";
import { CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";


export class VelocityBasedCharacter {

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
        root.position._y = -2;
        //root.position._z = 5;

        const material = new StandardMaterial("material", this.scene);
        material.diffuseColor = new Color3(1, 0, 0);
        root.material = material;
        root.getChildMeshes()[1].material = material
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)
        
        const cloneAnimationGroupArray: AnimationGroup[] = [];
        res.animationGroups.forEach((animationGroup) => {
            const clonedAG = animationGroup.clone(`player2_${animationGroup.name}`);
            cloneAnimationGroupArray.push(clonedAG);
        });
        
        res.addAllToScene()

        const animationContainer = new CharacterAnimationContainer(cloneAnimationGroupArray, 'player2', this.scene)
        const characterController = new CharacterControll(this.scene, animationContainer);

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