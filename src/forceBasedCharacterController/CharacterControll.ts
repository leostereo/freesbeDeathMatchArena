import { CharacterAnimationContainer } from "@/shared/CharacterAnimationContainer";
import { HavokPlugin, KeyboardEventTypes, KeyboardInfo, Mesh, MeshBuilder, PhysicsAggregate, PhysicsEventType, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { CharacterState, State } from "./class/State";
import { AnimationManager } from "./class/AnimationManager";


export class CharacterControll {
    private scene: Scene;
    private AnimationContainer: CharacterAnimationContainer;
    private AnimationManager: AnimationManager;
    private State: State;
    private isBlockingKeyboard: false;
    public displayMesh: Mesh;
    private displayMeshAggregate: PhysicsAggregate;
    private onMobileGround: boolean = false;
    // animationhandler
    // eventbinder.
    private inputDirection: Vector3 = Vector3.Zero();
    private WALK_FORCE_MULTIPLIER = 500;
    private CHARACTER_MASS = 50;
    private CHARACTER_MATERIAL_FRICTION = 0.5 // 0 - 1 value;

    constructor(scene: Scene, animationContainer: CharacterAnimationContainer) {

        this.scene = scene;
        this.AnimationContainer = animationContainer;
        this.AnimationManager = new AnimationManager(this.AnimationContainer);
        this.State = new State();

        this.createAggregateForCharacter()

    }

    private createAggregateForCharacter() {

        this.displayMesh = MeshBuilder.CreateBox("CharacterDisplay",
            { width: 2, height: 4, depth: 2 },
            this.scene);

        this.displayMesh.position._y = 15;
        this.displayMesh.isVisible = false;

        this.displayMeshAggregate = new PhysicsAggregate(this.displayMesh, PhysicsShapeType.BOX, { mass: 10, restitution: 0 }, this.scene);
        this.displayMeshAggregate.body.setMassProperties({
            mass: this.CHARACTER_MASS,
            centerOfMass: new Vector3(0, 0, 0),
            inertia: new Vector3(0, 0, 0),
            inertiaOrientation: new Quaternion(0, 0, 0, 1)
        });
        this.displayMeshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this.displayMeshAggregate.shape.material = { friction: this.CHARACTER_MATERIAL_FRICTION }

        const physicsEngine = this.scene.getPhysicsEngine();
        const currentPlugin = physicsEngine?.getPhysicsPlugin() as HavokPlugin;
        currentPlugin.onTriggerCollisionObservable.add((ev) => {

            if (ev.type === PhysicsEventType.TRIGGER_ENTERED) {
                if (ev.collidedAgainst.transformNode.name === 'CharacterDisplay') {
                    this.onMobileGround = true;
                }
            }
            if (ev.type === PhysicsEventType.TRIGGER_EXITED) {
                if (ev.collidedAgainst.transformNode.name === 'CharacterDisplay') {
                    this.onMobileGround = false;
                }
            }
        })

    }

    bindEvents() {
        this.scene.onBeforeRenderObservable.add(() => this.onBeforeRender())
        this.scene.onAfterPhysicsObservable.add(() => this.onAfterPhysics())
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => {
            if (this.isBlockingKeyboard) {
                return
            }
            this.onKeyboard(kbInfo)
        })
    }

    onBeforeRender() {

        if (this.displayMesh.position.y < -40)
            // this.displayMesh.position.set(0, 10, 0);

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
    }

    onAfterPhysics() {

        const currentVelocity = this.displayMeshAggregate.body.getLinearVelocity();
        this.AnimationManager.updateAnimationFromVelocity(currentVelocity, this.inputDirection,
            this.AnimationContainer.getCurrentPlayingAnimation(), this.State.state)

        const desiredForce = this.State.getForceToApply(currentVelocity, this.inputDirection, this.onMobileGround);
        this.displayMeshAggregate.body.applyForce(desiredForce, this.displayMesh.absolutePosition)

        if (this.State.wantJump) {
            setTimeout(() => {
                this.displayMeshAggregate.body.applyImpulse(desiredForce, this.displayMesh.absolutePosition);
            }, 500)
            this.State.wantJump = false;

        }

    }

    onKeyboard(kbInfo: KeyboardInfo) {
        
        if (this.AnimationContainer.isAnyAnimationLatched()) {
            return;
        }
        
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
            case 'j':
                this.State.wantsThrowFreesbe = Boolean(muliplier);
                break;
            case 'Shift':
                this.State.wantRun = Boolean(muliplier);
                break;
            case ' ':
                if (this.State.state === CharacterState.IN_AIR) return;
                this.State.wantJump = true;
                break;
        }


        this.AnimationManager.updateAnimationFromKeyBoard(this.State.wantsThrowFreesbe,
            this.State.wantsCrossPunch, this.State.wantJump,
            this.AnimationContainer.getCurrentPlayingAnimation(),
        )

    }
}