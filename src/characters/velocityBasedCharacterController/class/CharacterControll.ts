import { CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";
import { Color3, HavokPlugin, IPhysicsCollisionEvent, KeyboardEventTypes, KeyboardInfo, Mesh, MeshBuilder, PhysicsAggregate, PhysicsEventType, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, Scene, ShapeCastResult, StandardMaterial, Vector3 } from "@babylonjs/core";
import { CharacterState, State } from "./State";
import { AnimationManager } from "./AnimationManager";
import { AnimationEvents } from "./AnimationEvents";
import { IPlayerData } from "@/shared/class/PlayerData";
import { EventContainer } from "@/shared/class/EventContainer";
import { GameEvent } from "@/shared/types/CharacterTypes";


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
    private sphereHitWorld: Mesh;

    //Behaviour Parameters
    private inputDirection: Vector3 = Vector3.Zero();
    private WALK_FORCE_MULTIPLIER = 500;
    private CHARACTER_MASS = 50;
    private CHARACTER_MATERIAL_FRICTION = 0.5 // 0 - 1 value;

    private currentPlugin: HavokPlugin;

    constructor(scene: Scene, animationContainer: CharacterAnimationContainer,
        playerData: IPlayerData, eventContainer: EventContainer) {

        this.scene = scene;
        this.AnimationContainer = animationContainer;
        this.AnimationManager = new AnimationManager(this.AnimationContainer);
        this.State = new State();
        this.AnimationEvents = new AnimationEvents(this.scene, this.AnimationContainer, playerData, eventContainer)

        this.createAggregateForCharacter(playerData)
        this.createDebugSphere();
    }

    public setGameEventState(gameEvent: GameEvent) {
        if(gameEvent.eventType === 'freesbehit'){
            this.State.state = CharacterState.WAS_SHOOT;
        }
    }

    private createDebugSphere() {
        // debug red sphere that will be placed where the shape cast detects the casting collision point
        this.sphereHitWorld = MeshBuilder.CreateSphere("s", { diameter: 0.15 });
        const sphereHitWorldMaterial = new StandardMaterial("sm");
        sphereHitWorldMaterial.diffuseColor = new Color3(1, 0, 0);
        this.sphereHitWorld.material = sphereHitWorldMaterial;
    }

    private createAggregateForCharacter(playerData: IPlayerData) {

        this.displayMesh = MeshBuilder.CreateCapsule(playerData.name,
            { radius: 0.6, height: 3 },
            this.scene);

        this.displayMesh.position._x = playerData.initPosition._x;
        this.displayMesh.position._y = playerData.initPosition._y;
        this.displayMesh.position._z = playerData.initPosition._z;

        this.displayMesh.isVisible = false;

        this.displayMeshAggregate = new PhysicsAggregate(this.displayMesh, PhysicsShapeType.CAPSULE, { mass: 10, restitution: 0 }, this.scene);
        this.displayMeshAggregate.body.setMassProperties({
            mass: this.CHARACTER_MASS,
            centerOfMass: new Vector3(0, 0, 0),
            inertia: new Vector3(0, 0, 0),
            inertiaOrientation: new Quaternion(0, 0, 0, 1)
        });
        this.displayMeshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

        this.displayMeshAggregate.shape.material = { friction: this.CHARACTER_MATERIAL_FRICTION }

        const physicsEngine = this.scene.getPhysicsEngine();
        this.currentPlugin = physicsEngine?.getPhysicsPlugin() as HavokPlugin;

    }

    bindEvents(playerData: IPlayerData) {
        this.scene.onBeforeRenderObservable.add(() => this.onBeforeRender())
        this.scene.onAfterPhysicsObservable.add(() => this.onAfterPhysics())
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => this.onKeyboard(kbInfo, playerData))
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => this.onDebugKeyboard(kbInfo))
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

        const rayOrigin = this.displayMesh.position.clone();
        rayOrigin.y -= 1.5; // Slightly above the character to ensure it's not inside the mesh
        const rayDirection = Vector3.Down();
        const ray = new Ray(rayOrigin, rayDirection, 50); // rayLength defines how far down the ray extends
        const pickInfo = this.scene.pickWithRay(ray);
        const downDistance = pickInfo?.distance!;

        const currentVelocity = this.displayMeshAggregate.body.getLinearVelocity().clone();

        this.AnimationManager.updateAnimationFromVelocity(currentVelocity, this.inputDirection,
            this.AnimationContainer.getCurrentPlayingAnimation(), this.State.state)

        const desiredForce = this.State.getForceToApply(currentVelocity, downDistance);

        this.displayMeshAggregate.body.applyForce(desiredForce, this.displayMesh.absolutePosition)

        if (this.State.wantJump) {
            desiredForce._x = currentVelocity._x * 80
            desiredForce._z = currentVelocity._z * 80
            setTimeout(() => {
                this.displayMeshAggregate.body.applyImpulse(desiredForce, this.displayMesh.absolutePosition);
            }, 300)
            this.State.wantJump = false;
        }

        if (this.State.state === CharacterState.ON_GROUND) {

            const desiredVelocity = this.State.getVelocityToApply(currentVelocity, this.inputDirection, downDistance)
            if (!this.AnimationContainer.isAnyAnimationLatched()) {
                currentVelocity._x = desiredVelocity._x;
                currentVelocity._z = desiredVelocity._z;
                this.displayMeshAggregate.body.setLinearVelocity(currentVelocity)
            }

            if (this.State.wantsToToll) {
                if (currentVelocity._x !== 0 || currentVelocity._z !== 0) {
                    setTimeout(() => {
                        this.displayMeshAggregate.body.applyImpulse(desiredForce, this.displayMesh.absolutePosition);
                    }, 100)
                }
                this.State.wantsToToll = false;
            }
        }
    }

    onKeyboard(kbInfo: KeyboardInfo, playerData: IPlayerData) {
        const muliplier = (kbInfo.type == KeyboardEventTypes.KEYDOWN) ? 1 : 0;

        if (
            this.AnimationContainer.isAnyAnimationLatched() && muliplier === 1) {
            return;
        }

        switch (kbInfo.event.key) {
            case playerData.up:
                this.inputDirection.x = -muliplier;
                break;
            case playerData.down:
                this.inputDirection.x = muliplier;
                break;
            case playerData.left:
                this.inputDirection.z = -muliplier;
                break;
            case playerData.right:
                this.inputDirection.z = muliplier;
                break;
            case playerData.throw:
                if (this.State.state === CharacterState.FALLING_TO_CRASH) return;
                this.State.wantsThrowFreesbe = Boolean(muliplier);
                break;
            case playerData.roll:
                if (this.State.state === CharacterState.FALLING_TO_CRASH) return;
                this.State.wantsToToll = Boolean(muliplier);
                break;
            case playerData.jump:
                if (this.State.state === CharacterState.IN_AIR || this.State.state === CharacterState.FALLING_TO_CRASH) return;
                this.State.wantJump = Boolean(muliplier);
                break;
            case 'bt':
                this.State.wantRun = Boolean(muliplier);
                break;
        }


        this.AnimationManager.updateAnimationFromKeyBoard(this.State.wantsThrowFreesbe,
            this.State.wantsToToll, this.State.wantJump,
            this.AnimationContainer.getCurrentPlayingAnimation(),
            this.State.state
        )

    }

    onDebugKeyboard(kbInfo: KeyboardInfo) {

        switch (kbInfo.event.key) {
            case '1':
                console.log(this.State.state, this.displayMeshAggregate.body.getLinearVelocity()._y, this.AnimationContainer.getCurrentPlayingAnimation()?.name)
                break;

            case '2':
                console.log(this.AnimationContainer.getLatchedAnimation())
                break;

        }

        this.AnimationManager.updateAnimationFromKeyBoard(this.State.wantsThrowFreesbe,
            this.State.wantsToToll, this.State.wantJump,
            this.AnimationContainer.getCurrentPlayingAnimation(),
            this.State.state
        )
    }
}