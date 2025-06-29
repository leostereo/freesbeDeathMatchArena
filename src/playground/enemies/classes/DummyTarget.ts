import { MeshBuilder, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, Quaternion, Scene, Vector3 } from "@babylonjs/core";

export class DummyTarget {
    protected scene: Scene;
    protected position: Vector3;

    constructor(scene: Scene, position: Vector3,index:number) {
        this.scene = scene;
        this.position = position;

        this.spawnDummyTarget(index)
    }

    private spawnDummyTarget(index:number) {

        var box = MeshBuilder.CreateBox("root_"+index, {
            width: 2,
            height: 8,
            depth: 2,
        });
        box.position = this.position;

        var boxShape = new PhysicsShapeBox(
            new Vector3(0, 0, 0),
            Quaternion.Identity(),
            new Vector3(1, 4, 1),
            this.scene
        );

        var body = new PhysicsBody(
            box,
            PhysicsMotionType.DYNAMIC,
            false,
            this.scene
        );

        body.shape = boxShape;
        body.setMassProperties({ centerOfMass: new Vector3(0,0,0), mass:100 });
    }
}