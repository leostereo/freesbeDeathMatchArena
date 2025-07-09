import { CharacterShapeOptions, CharacterSupportedState, CharacterSurfaceInfo, KeyboardEventTypes, Mesh, MeshBuilder, PhysicsCharacterController, Quaternion, Scene, Vector3 } from "@babylonjs/core";

export class PhysicCharacter {
    private PCC: PhysicsCharacterController
    private scene: Scene;
    private characterGravity: Vector3 = new Vector3(0, -25, 0)
    private characterOrientation = Quaternion.Identity();
    private displayMesh: Mesh;
    protected inputVelocity: Vector3;
    protected linearVelocity: Vector3;
    protected jump: boolean = false;
    private inAirSpeed = 8.0;
    private forwardLocalSpace = new Vector3(0, 0, 1);


    constructor(scene: Scene) {

        this.scene = scene;

        const PCCOptions: CharacterShapeOptions = {
            capsuleHeight: 10,
            capsuleRadius: 2,
        }

        this.displayMesh = MeshBuilder.CreateCapsule("CharacterDisplay",
            { height: PCCOptions.capsuleHeight, radius: PCCOptions.capsuleRadius },
            this.scene);

        this.PCC = new PhysicsCharacterController(new Vector3(1, 20, 1), PCCOptions, scene);
        this.bind_observables()

        this.inputVelocity = new Vector3(0, 0, 0);
        this.linearVelocity = new Vector3(0, 0, 0);
    }


    getDesiredVelocity(dt: number, support: CharacterSurfaceInfo, characterCurrentOrientation, characterCurrentVelocity) {

        let upWorld = this.characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = this.forwardLocalSpace.applyRotationQuaternion(characterCurrentOrientation);


        if (support.supportedState == CharacterSupportedState.UNSUPPORTED) {

            let desiredVelocity = this.inputVelocity.scale(this.inAirSpeed)
            let outputVelocity = this.PCC.calculateMovement(dt, forwardWorld, support.averageSurfaceNormal, characterCurrentVelocity, support.averageSurfaceVelocity, desiredVelocity, upWorld)

            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(characterCurrentVelocity.dot(upWorld)));
            // Add gravity
            outputVelocity.addInPlace(this.characterGravity.scale(dt));
            return outputVelocity;

        }
        if (support.supportedState == CharacterSupportedState.SUPPORTED) {

            if (support.averageSurfaceVelocity.y !== 0) {

                let desiredVelocity = this.inputVelocity;
                let outputVelocity = desiredVelocity.addInPlace(support.averageSurfaceVelocity);
                return desiredVelocity;
            }


        }
        return null;

    }

    bind_observables() {

        this.scene.onAfterPhysicsObservable.add((_) => {
            if (this.scene.deltaTime == undefined) return;

            let dt = this.scene.deltaTime / 1000.0;
            if (dt == 0) return;


            let down = new Vector3(0, -1, 0);
            let support = this.PCC.checkSupport(dt, down);

            const desiredLinearVelocity = this.getDesiredVelocity(dt, support, this.characterOrientation, this.PCC.getVelocity());

            if (desiredLinearVelocity) {

                this.PCC.setVelocity(desiredLinearVelocity);
            }

            this.PCC.integrate(dt, support, this.characterGravity);

            const newPosition = this.PCC.getPosition();

            this.displayMesh.position = newPosition;

        });

        this.scene.onKeyboardObservable.add((kbInfo) => {
            const muliplier = (kbInfo.type == KeyboardEventTypes.KEYDOWN) ? 2 : 0;
            switch (kbInfo.event.key) {
                case 'ArrowUp':
                    this.inputVelocity.x = -muliplier;
                    break;
                case 'ArrowDown':
                    this.inputVelocity.x = muliplier;
                    break;
                case 'ArrowLeft':
                    this.inputVelocity.z = -muliplier;
                    break;
                case 'ArrowRight':
                    this.inputVelocity.z = muliplier;
                    break;
                case ' ':
                    this.jump = true;
                    break;
            }
        });
    }
}