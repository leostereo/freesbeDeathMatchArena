import { CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";
import { HavokPlugin, IPhysicsCollisionEvent, KeyboardEventTypes, KeyboardInfo, Mesh, MeshBuilder, PhysicsAggregate, PhysicsEventType, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { CharacterState, State } from "./State";
import { AnimationManager } from "./AnimationManager";
import { AnimationEvents } from "./AnimationEvents";


export class CharacterControll {
    //Clases
    private scene: Scene;
    private AnimationContainer: CharacterAnimationContainer;
    private AnimationManager: AnimationManager;
    private State: State;
    private AnimationEvents: AnimationEvents;

    //CharacterControll properties
    public displayMesh: Mesh;
    private displayMeshAggregate: PhysicsAggregate;
    private onMobileGround: boolean = false;
    private isBlockingKeyboard: false;

    //Behaviour Parameters
    private inputDirection: Vector3 = Vector3.Zero();
    private WALK_FORCE_MULTIPLIER = 500;
    private CHARACTER_MASS = 50;
    private CHARACTER_MATERIAL_FRICTION = 0.5 // 0 - 1 value;

    constructor(scene: Scene, animationContainer: CharacterAnimationContainer) {

        this.scene = scene;
        this.AnimationContainer = animationContainer;
        this.AnimationManager = new AnimationManager(this.AnimationContainer);
        this.State = new State();
        this.AnimationEvents = new AnimationEvents(this.scene, this.AnimationContainer)

        this.createAggregateForCharacter()

    }

    private createAggregateForCharacter() {

        // this.displayMesh = MeshBuilder.CreateBox("CharacterDisplay",
        //     { width: 2, height: 4, depth: 2 },
        //     this.scene);

        this.displayMesh = MeshBuilder.CreateCapsule("CharacterDisplay",
            { radius: 0.6, height: 3 },
            this.scene);

        this.displayMesh.position._y = 15;
        this.displayMesh.isVisible = false;

        this.displayMeshAggregate = new PhysicsAggregate(this.displayMesh, PhysicsShapeType.CAPSULE, { mass: 10, restitution: 0 }, this.scene);
        this.displayMeshAggregate.body.setMassProperties({
            mass: this.CHARACTER_MASS,
            centerOfMass: new Vector3(0, 0, 0),
            inertia: new Vector3(0, 0, 0),
            inertiaOrientation: new Quaternion(0, 0, 0, 1)
        });
        this.displayMeshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        //this.displayMeshAggregate.body.setCollisionCallbackEnabled(true)
        //this.displayMeshAggregate.body.getCollisionObservable().add(this.bodyCollideCB);

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

    // bodyCollideCB = (collision: IPhysicsCollisionEvent) => {
    //     console.log(
    //         collision.type,
    //         collision.normal,
    //         collision.collidedAgainst.transformNode.getChildMeshes()
    //     )
    //     collision.collidedAgainst.transformNode.name;
    // }

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

        //Update character rotation. 
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


            //update AnimationEvents
            const currentPosition = this.displayMesh.position;
            this.AnimationEvents.updateCharacterInfo({
                pointingVector: new Vector3(1, 0, 0).applyRotationQuaternion(this.displayMesh.rotationQuaternion).normalize(),
                position: currentPosition
            })

            //Avoid falling from ground
            if (currentPosition.y < -40)
                currentPosition.set(0, 10, 0);

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
        const muliplier = (kbInfo.type == KeyboardEventTypes.KEYDOWN) ? 1 : 0;

        if (this.AnimationContainer.isAnyAnimationLatched() && muliplier === 1) {
            return;
        }

        switch (kbInfo.event.key) {
            case 'w':
                this.inputDirection.x = -muliplier;
                break;
            case 's':
                this.inputDirection.x = muliplier;
                break;
            case 'a':
                this.inputDirection.z = -muliplier;
                break;
            case 'd':
                this.inputDirection.z = muliplier;
                break;
            case 'n':
                this.State.wantsThrowFreesbe = Boolean(muliplier);
                break;
            case 'v':
                this.State.wantsCrossPunch = Boolean(muliplier);
                break;
            case 'b':
                this.State.wantRun = Boolean(muliplier);
                break;
            case 'm':
                if (this.State.state === CharacterState.IN_AIR) return;
                this.State.wantJump = Boolean(muliplier);
                break;
        }


        this.AnimationManager.updateAnimationFromKeyBoard(this.State.wantsThrowFreesbe,
            this.State.wantsCrossPunch, this.State.wantJump,
            this.AnimationContainer.getCurrentPlayingAnimation(),
            this.State.state
        )

    }

    // onKeyboard(kbInfo: KeyboardInfo) {
    //     // Input to direction
    //     // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space

    //     switch (kbInfo.type) {
    //         case KeyboardEventTypes.KEYDOWN:
    //             if (this.AnimationContainer.isAnyAnimationLatched()) return;
    //             // this.isKeyDown = true
    //             if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
    //                 this.inputDirection.x = -1
    //             } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
    //                 this.inputDirection.x = 1
    //             } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
    //                 this.inputDirection.z = -1
    //             } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
    //                 this.inputDirection.z = 1
    //             } else if (kbInfo.event.key == ' ') {
    //             if (this.State.state === CharacterState.IN_AIR) return;
    //             this.State.wantJump = true;

    //             } else if (kbInfo.event.key == 'h') {
    //                 this.State.wantsThrowFreesbe = true;
    //             } else if (kbInfo.event.key == 'j') {
    //                 this.State.wantsCrossPunch = true;
    //             } if (kbInfo.event.shiftKey) {
    //                 this.State.wantRun = true
    //             }
    //             break
    //         case KeyboardEventTypes.KEYUP:
    //             // this.isKeyDown = false
    //             this.State.wantRun = false
    //             if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
    //                 this.inputDirection.x = 0
    //             }
    //             if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
    //                 this.inputDirection.z = 0
    //             } else if (kbInfo.event.key == ' ') {
    //                 this.State.wantJump = false
    //             } else if (kbInfo.event.key === 'h') {
    //                 this.State.wantsThrowFreesbe = false;
    //             } else if (kbInfo.event.key === 'j') {
    //                 this.State.wantsCrossPunch = false;
    //             }
    //             break
    //     }

    //     this.AnimationManager.updateAnimationFromKeyBoard(
    //         this.State.wantsThrowFreesbe,
    //         this.State.wantsCrossPunch, this.State.wantJump,
    //         this.AnimationContainer.getCurrentPlayingAnimation(),
    //     )

    // }


}