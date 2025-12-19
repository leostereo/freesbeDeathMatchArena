import { Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShape, PhysicsShapeType, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { PlatformItem } from "../types/PlatformItemType";

export class PlatformClass {

    private backPlatformData: PlatformItem[] = [
        { name: 'backPlat1', depth: 20, height: 1, width: 5, pos_x:  -27,   pos_y: 15,  pos_z: -23, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'backPlat2', depth: 20, height: 1, width: 5, pos_x:  -27,   pos_y: 15,  pos_z: 23, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'backPlat3', depth: 20, height: 1, width: 5, pos_x:  -27,   pos_y: 5,   pos_z: -20, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'backPlat4', depth: 10, height: 1, width: 5, pos_x:  -27,   pos_y: 8,   pos_z: -5, ang_x: -Math.PI/6, ang_y: 0, ang_z: 0 },
        { name: 'backPlat4', depth: 10, height: 1, width: 5, pos_x:  -27,   pos_y: 8,   pos_z: 5, ang_x: Math.PI/6, ang_y: 0, ang_z: 0 },
        { name: 'backPlat7', depth: 20, height: 1, width: 5, pos_x:  -27,   pos_y: 5,   pos_z: 20, ang_x: 0, ang_y: 0, ang_z: 0 },
    ]

    private frontPlatformData: PlatformItem[] = [
        { name: 'frontPlat1', depth: 5, height: 1, width: 5, pos_x: 25, pos_y: 15,  pos_z: -37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'frontPlat2', depth: 25, height: 1, width: 5, pos_x:25, pos_y: 10,   pos_z: -23, ang_x: Math.PI/8, ang_y: 0, ang_z: 0 },
        { name: 'frontPlat3', depth: 25, height: 1, width: 5, pos_x:25, pos_y: 5,   pos_z: 0, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'frontPlat4', depth: 25, height: 1, width: 5, pos_x:25, pos_y: 10,   pos_z: 23, ang_x: -Math.PI/8, ang_y: 0, ang_z: 0 },
        { name: 'frontPlat5', depth: 5, height: 1, width: 5, pos_x:25, pos_y: 15,   pos_z: 37, ang_x: 0, ang_y: 0, ang_z: 0 },
    ]

    private leftSidePlatformData: PlatformItem[] = [
        { name: 'leftSidePlat1', depth: 5, height: 1, width: 10, pos_x:  8,   pos_y: 5,   pos_z: -37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'leftSidePlat2', depth: 5, height: 1, width: 10, pos_x:  -18,    pos_y: 5,   pos_z: -37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'leftSidePlat3', depth: 5, height: 1, width: 10, pos_x:  8,    pos_y: 15,  pos_z: -37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'leftSidePlat4', depth: 5, height: 1, width: 10, pos_x:  -18,  pos_y: 15,  pos_z: -37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'leftSidePlat5', depth: 5, height: 1, width: 20, pos_x:  -5,   pos_y: 10,  pos_z: -37, ang_x: 0, ang_y: 0, ang_z: Math.PI/5 },
    ]

    private rightSidePlatformData: PlatformItem[] = [
        { name: 'rightSidePlat1', depth: 5, height: 1, width: 15, pos_x: -15, pos_y: 5,  pos_z: 37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'rightSidePlat2', depth: 5, height: 1, width: 10, pos_x:  8,  pos_y: 5,  pos_z: 37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'rightSidePlat3', depth: 5, height: 1, width: 15, pos_x:  5,  pos_y: 15,  pos_z: 37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'rightSidePlat4', depth: 5, height: 1, width: 10, pos_x:  -18,  pos_y: 15,  pos_z: 37, ang_x: 0, ang_y: 0, ang_z: 0 },
        { name: 'rightSidePlat5', depth: 5, height: 1, width: 20, pos_x:  -5,  pos_y: 10,  pos_z: 37, ang_x: 0, ang_y: 0, ang_z: -Math.PI/5 },
    ]


    private ceilPlatformData: PlatformItem[];
    private scene: Scene;
    private platformMaterial: StandardMaterial;

    private resultingPlatform: Mesh

    constructor(scene: Scene) {
        this.scene = scene;
        this.platformMaterial = new StandardMaterial('platformMaterial', this.scene)
        this.platformMaterial.diffuseColor = Color3.Blue()
    }

    buildPlatforms() {

        const mergedMeshArray: Mesh[] = [];

        this.backPlatformData.forEach(platformItem => {
            const { name, depth, height, width } = platformItem;
            const newPlatformItem = MeshBuilder.CreateBox(name, { depth, height, width }, this.scene)
            const { pos_x, pos_y, pos_z } = platformItem;
            newPlatformItem.position = new Vector3(pos_x, pos_y, pos_z);
            const { ang_x, ang_y, ang_z } = platformItem;
            newPlatformItem.rotation = new Vector3(ang_x, ang_y, ang_z);
             newPlatformItem.material = this.platformMaterial;
            newPlatformItem.renderOutline = true;
            newPlatformItem.outlineColor = Color3.Blue();
            newPlatformItem.outlineWidth = 0.3;
            newPlatformItem.visibility = 0.3;
            const finalMeshAgg = new PhysicsAggregate(newPlatformItem, PhysicsShapeType.BOX, { mass: 0, friction: 0.9 });

        });
        this.frontPlatformData.forEach(platformItem => {
            const { name, depth, height, width } = platformItem;
            const newPlatformItem = MeshBuilder.CreateBox(name, { depth, height, width }, this.scene)
            const { pos_x, pos_y, pos_z } = platformItem;
            newPlatformItem.position = new Vector3(pos_x, pos_y, pos_z);
            const { ang_x, ang_y, ang_z } = platformItem;
            newPlatformItem.rotation = new Vector3(ang_x, ang_y, ang_z);
             newPlatformItem.material = this.platformMaterial;
            newPlatformItem.renderOutline = true;
            newPlatformItem.outlineColor = Color3.Blue();
            newPlatformItem.outlineWidth = 0.3;
            newPlatformItem.visibility = 0.3;
            const finalMeshAgg = new PhysicsAggregate(newPlatformItem, PhysicsShapeType.BOX, { mass: 0, friction: 0.9 });

        });

        this.leftSidePlatformData.forEach(platformItem => {
            const { name, depth, height, width } = platformItem;
            const newPlatformItem = MeshBuilder.CreateBox(name, { depth, height, width }, this.scene)
            const { pos_x, pos_y, pos_z } = platformItem;
            newPlatformItem.position = new Vector3(pos_x, pos_y, pos_z);
            const { ang_x, ang_y, ang_z } = platformItem;
            newPlatformItem.rotation = new Vector3(ang_x, ang_y, ang_z);
             newPlatformItem.material = this.platformMaterial;
            newPlatformItem.renderOutline = true;
            newPlatformItem.outlineColor = Color3.Blue();
            newPlatformItem.outlineWidth = 0.3;
            newPlatformItem.visibility = 0.3;
            const finalMeshAgg = new PhysicsAggregate(newPlatformItem, PhysicsShapeType.BOX, { mass: 0, friction: 0.9 });

        });

        this.rightSidePlatformData.forEach(platformItem => {
            const { name, depth, height, width } = platformItem;
            const newPlatformItem = MeshBuilder.CreateBox(name, { depth, height, width }, this.scene)
            const { pos_x, pos_y, pos_z } = platformItem;
            newPlatformItem.position = new Vector3(pos_x, pos_y, pos_z);
            const { ang_x, ang_y, ang_z } = platformItem;
            newPlatformItem.rotation = new Vector3(ang_x, ang_y, ang_z);
            newPlatformItem.material = this.platformMaterial;
            newPlatformItem.renderOutline = true;
            newPlatformItem.outlineColor = Color3.Blue();
            newPlatformItem.outlineWidth = 0.3;
            newPlatformItem.visibility = 0.3;
            const finalMeshAgg = new PhysicsAggregate(newPlatformItem, PhysicsShapeType.BOX, { mass: 0, friction: 0.9 });
        });



    }

    getResultingPlatform(): Mesh {
        return this.resultingPlatform;
    }
}