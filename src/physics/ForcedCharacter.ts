import { ArcRotateCamera, CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, KeyboardEventTypes, Matrix, Mesh, MeshBuilder, NodeRenderGraphBuildState, PhysicsAggregate, PhysicsBody, PhysicsCharacterController, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Vector3 } from "@babylonjs/core";

export class ForcedPhysicCharacter {

    private scene: Scene;

    private displayMesh: Mesh;
    private displayMeshAggregate: PhysicsAggregate;
    private inputDirection: Vector3 = Vector3.Zero();

    private jump: boolean = false;
    private nose: Mesh;

    //CHARACTER EXPERIENCE CONTROLLING PARAMS
    private WALK_FORCE_MULTIPLIER = 500;
    private CHARACTER_MASS = 50;
    private CHARACTER_MATERIAL_FRICTION = 0.5 // 0 - 1 value;


    constructor(scene: Scene) {

        this.scene = scene;
        this.create_character();
        this.lock_camera();
        this.bind_observables();

    }


    create_character() {

        this.displayMesh = MeshBuilder.CreateBox("CharacterDisplay",
            { width: 2, height: 4, depth: 2 },
            this.scene);

        this.displayMesh.position._y = 5;

        this.displayMeshAggregate = new PhysicsAggregate(this.displayMesh, PhysicsShapeType.BOX, { mass: 10, restitution: 0 }, this.scene);
        this.displayMeshAggregate.body.setMassProperties({
            mass: this.CHARACTER_MASS,
            centerOfMass: new Vector3(0, 0, 0),
            inertia: new Vector3(0, 0, 0),
            inertiaOrientation: new Quaternion(0, 0, 0, 1)
        });
        this.displayMeshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this.displayMeshAggregate.shape.material = { friction: this.CHARACTER_MATERIAL_FRICTION }

        //nose
        this.nose = MeshBuilder.CreateCylinder("nose", {
            diameterBottom: 2,
            diameterTop: 1,
            height: 4
        }, this.scene)
        this.nose.position = new Vector3(3.4, 5.8, 0)
        this.nose.rotation._z = - Math.PI / 2;
        this.nose.parent = this.displayMesh
        this.nose.isVisible = true;
    }

    lock_camera() {
        const camera = this.scene.getCameraById('camera') as ArcRotateCamera;
        camera.lockedTarget = this.displayMesh;
    }

    bind_observables() {

        this.scene.onBeforeRenderObservable.add((_) => {


            this.displayMeshAggregate.body.disablePreStep = true;
            let x = this.inputDirection.x;
            let z = this.inputDirection.z;
            if (x !== 0 || z !== 0) {
                if (!this.displayMesh.rotationQuaternion) {
                    this.displayMesh.rotationQuaternion = this.displayMesh.rotation.toQuaternion();
                }

                const targetAngle = Math.atan2(-this.inputDirection.z, this.inputDirection.x);
                const targetQuaternion = Quaternion.RotationYawPitchRoll(targetAngle, 0, 0);
                this.displayMesh.rotationQuaternion = Quaternion.Slerp(
                    this.displayMesh.rotationQuaternion,
                    targetQuaternion,
                    0.2,
                );

                this.displayMeshAggregate.body.disablePreStep = false;
            }
        })



        this.scene.onAfterPhysicsObservable.add((_) => {

            if (this.jump && this.displayMeshAggregate.body.getLinearVelocity()._y === 0) {
                this.displayMeshAggregate.body.applyImpulse(new Vector3(0, 800, 0), this.displayMesh.absolutePosition)
            }
            this.jump = false;

            const newForceVector = this.inputDirection.scale(this.WALK_FORCE_MULTIPLIER);
            this.displayMeshAggregate.body.applyForce(newForceVector, this.displayMesh.absolutePosition)

        });

        this.scene.onKeyboardObservable.add((kbInfo) => {
            const muliplier = (kbInfo.type == KeyboardEventTypes.KEYDOWN) ? 1 : 0;
            switch (kbInfo.event.key) {
                case 'ArrowUp':
                    this.inputDirection.x = -muliplier;
                    break;
                case 'ArrowDown':
                    this.inputDirection.x = muliplier;
                    break;
                case 'ArrowLeft':
                    this.inputDirection.z = -muliplier;
                    break;
                case 'ArrowRight':
                    this.inputDirection.z = muliplier;
                    break;
                case ' ':
                    this.jump = true;
                    break;
            }
        });
    }
}