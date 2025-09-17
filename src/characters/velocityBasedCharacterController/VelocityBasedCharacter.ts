import { AnimationGroup, ArcRotateCamera, CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, Color3, KeyboardEventTypes, LoadAssetContainerAsync, Matrix, Mesh, MeshBuilder, NodeRenderGraphBuildState, PhysicsAggregate, PhysicsBody, PhysicsCharacterController, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { CharacterControll } from "./class/CharacterControll";
import { CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";
import { IPlayerData } from "@/shared/class/PlayerData";
import { EventContainer } from "@/shared/class/EventContainer";
import { GameEvent } from "@/shared/types/CharacterTypes";


export class VelocityBasedCharacter {

    private scene: Scene;
    private characterControll: CharacterControll;

    constructor(scene: Scene, playerData: IPlayerData, eventContainer: EventContainer) {
        this.scene = scene;
        this.create_character(playerData, eventContainer);
    }


    async create_character(playerData: IPlayerData, eventContainer: EventContainer) {

        const res = await LoadAssetContainerAsync("./model/ybotV5.glb",
            this.scene, { pluginOptions: { gltf: { animationStartMode: 0 } } })
        const root = res.meshes[0]
        root.scaling.scaleInPlace(2)
        root.position._y = -1.6;

        const material = new StandardMaterial("material", this.scene);
        material.diffuseColor = playerData.color;
        root.material = material;
        root.getChildMeshes()[1].material = material
        root.rotate(new Vector3(0, 1, 0), Math.PI / 2, Space.WORLD)

        const cloneAnimationGroupArray: AnimationGroup[] = [];
        res.animationGroups.forEach((animationGroup) => {
            const clonedAG = animationGroup.clone(`${playerData.name}_${animationGroup.name}`);
            cloneAnimationGroupArray.push(clonedAG);
        });

        res.addAllToScene()

        const animationContainer = new CharacterAnimationContainer( playerData.name, this.scene,cloneAnimationGroupArray)
        this.characterControll = new CharacterControll(this.scene, animationContainer, playerData, eventContainer);

        root.parent = this.characterControll.displayMesh;

        //const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        //camera.lockedTarget = characterController.displayMesh;
        this.characterControll.bindEvents(playerData);

        res.animationGroups.find((animationGroud) => animationGroud.name === 'idle')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'walking')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'slow running')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'fast running')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'fresbe throw')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'falling idle')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'falling impact')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'falling flat impact')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'cross punch')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'jump up')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'running and jump')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'landing')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'baseball pitch')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'sprinting roll')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'death from back headshoot')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'head hit')?.dispose();
        res.animationGroups.find((animationGroud) => animationGroud.name === 'dying')?.dispose();
    }

    public informGameEvent(gameEvent: GameEvent) {
        this.characterControll.setGameEventState(gameEvent)
    }

}