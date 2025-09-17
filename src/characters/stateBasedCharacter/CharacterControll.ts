import { AbstractMesh, Color3, KeyboardEventTypes, KeyboardInfo, Mesh, MeshAssetTask, MeshBuilder, Observer, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, Ray, RayHelper, Scene, Space, Vector3 } from "@babylonjs/core";
import { IPlayerData } from "@/shared/class/PlayerData";
import { EventContainer } from "@/shared/class/EventContainer";
import { GameEvent } from "@/shared/types/CharacterTypes";
import { CharacterState } from "@/shared/enums/CharacterState";
import { CharacterIntention } from "@/shared/enums/CharacterIntention";
import { AnimationManager } from "./AnimationManager";
import { ThinSSRRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/thinSSRRenderingPipeline";
import { AnimationEnums } from "@/shared/class/CharacterAnimationContainer";
import { FreesbeManager } from "./FreesbeManager";


export class CharacterControll {

    private CHARACTER_MASS: number = 50;
    private CHARACTER_MATERIAL_FRICTION: number = 0.15;
    private CHARACTER_NORMAL_RUN_SPEED: number = 45;
    private CHARACTER_ROTATION_SPEED: number = 0.1;
    private CHARACTER_FORWARD_SPEED: number = 0.3;
    private CHARACTER_BACKWARDS_SPEED: number = 0.1;

    private inputDirection: Vector3 = Vector3.Zero();

    private characterState: CharacterState;
    private characterIntention: CharacterIntention;
    private animationManager: AnimationManager;

    //Character capsule
    public displayMesh: AbstractMesh;
    private freesbeManager:FreesbeManager;

    private V3_ZERO = Vector3.Zero();
    private ray = new Ray(Vector3.Zero().clone(), Vector3.Down(), 10);
    private rayViewer = new RayHelper(this.ray);
    private GRAVITY = new Vector3(0, -0.0049, 0);
    private gravityVelocity = Vector3.Zero().clone();
    private GROUND_STICKING_FACTOR = 25;

    constructor(private scene: Scene,
        private playerMeshAssetTask: MeshAssetTask,
        private playerData: IPlayerData,
        private eventContainer: EventContainer) {

        this.characterState = CharacterState.IDLE;
        this.animationManager = new AnimationManager(this.scene);
        this.createDisplayMeshForCharacter(playerData);
        this.freesbeManager = new FreesbeManager(this.scene,playerData);

        this.bindObservables(playerData);

        this.rayViewer.show(scene, new Color3(0, 1, 0));
    }


    private createDisplayMeshForCharacter(playerData: IPlayerData) {

        this.displayMesh = MeshBuilder.CreateCapsule(playerData.name,
            { radius: 0.6, height: 3 },
            this.scene);
        this.displayMesh.checkCollisions = true;
        this.displayMesh.isVisible = false;
        this.displayMesh.rotate(new Vector3(0, 1, 0), -Math.PI / 2, Space.WORLD)

        this.displayMesh.position._x = playerData.initPosition._x;
        this.displayMesh.position._y = 1.5;                         //at level 0
        this.displayMesh.position._z = playerData.initPosition._z;

        const playerMesh = this.playerMeshAssetTask.loadedMeshes[0];
        playerMesh.scaling.scaleInPlace(2)
        playerMesh.position._y = -1.5;              //at level 0
        playerMesh.parent = this.displayMesh;

    }

    public informGameEvent(gameEvent: GameEvent) {
        console.log(gameEvent);
    }


    // #region Observables 
    bindObservables(playerData: IPlayerData) {
        this.scene.onBeforeRenderObservable.add(() => this.onBeforeRender())
        //this.physicObserver = this.scene.onAfterPhysicsObservable.add(() => this.onAfterPhysics())
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => this.onKeyboard(kbInfo, playerData))
    }

    setRayInformation() {

    }

    onBeforeRender() {

        const DELTA_TIME = this.scene.getEngine().getDeltaTime();

        if (this.inputDirection._x === 1) {
            this.displayMesh.moveWithCollisions(this.displayMesh.forward.scaleInPlace(-this.CHARACTER_BACKWARDS_SPEED));
        }

        if (this.inputDirection.z === -1) {
            this.displayMesh.rotate(Vector3.Up(), -this.CHARACTER_ROTATION_SPEED);
        }

        if (this.inputDirection.z === 1) {
            this.displayMesh.rotate(Vector3.Up(), this.CHARACTER_ROTATION_SPEED);
        }


        if (this.characterIntention === CharacterIntention.WANTS_TO_JUMP) {
            this.setJumpImpulse()
        }

        this.setNextState();
        this.applyDisplacementVector(DELTA_TIME);
        this.animationManager.updateAnimation(this.characterState);

    }

    getDistanceToGround(): number | undefined {

        const rayOrigin = this.displayMesh.position.clone();
        rayOrigin.y -= 1.5; // Slightly above the character to ensure it's not inside the mesh
        this.ray.origin = rayOrigin;
        const pickInfo = this.scene.pickWithRay(this.ray);
        return pickInfo?.distance;
    }

    setNextState() {

        const downDistance = this.getDistanceToGround();
        if (downDistance === undefined) {
            return
        }

        // state resolver




        //release throw freesbe
        if (this.characterState === CharacterState.THROWING_FREESBE_GROUND) {

            if(this.animationManager.throwFreesbe){
                this.freesbeManager.thowFreesbe(this.displayMesh);
                this.animationManager.throwFreesbe = false;
            }

            if (this.animationManager.lastAnimationFinishes) {
                if (this.inputDirection._x !== 0) {
                    this.characterState = CharacterState.RUNNING
                }
                if (this.inputDirection._x === 0) {
                    this.characterState = CharacterState.IDLE
                }
            }
            return;
        }


        //detect throw freesbe
        if (this.characterState === CharacterState.IDLE || this.characterState === CharacterState.RUNNING) {
            if (downDistance === 0 && this.characterIntention === CharacterIntention.WANTS_TO_THROW_FREESBE) {
                this.characterState = CharacterState.THROWING_FREESBE_GROUND;
                return;
            }
        }

        //release close to land 
        if (this.characterState === CharacterState.CLOSE_TO_LAND) {

            if (this.animationManager.lastAnimationFinishes) {
                if (this.inputDirection._x !== 0) {
                    this.characterState = CharacterState.RUNNING
                }
                if (this.inputDirection._x === 0) {
                    this.characterState = CharacterState.IDLE
                }
            }
            return;
        }


        //detect close to land
        if ((this.characterState === CharacterState.JUMPING || this.characterState === CharacterState.FALLING) &&
            downDistance < 1 && this.gravityVelocity._y < 0) {
            this.characterState = CharacterState.CLOSE_TO_LAND;
            return;
        }

        if (this.characterState === CharacterState.START_JUMP) {
            this.characterState = CharacterState.JUMPING;
            return;
        }

        if (this.characterState === CharacterState.IDLE || this.characterState === CharacterState.RUNNING) {
            if (downDistance === 0 && this.characterIntention === CharacterIntention.WANTS_TO_JUMP) {
                this.characterState = CharacterState.START_JUMP;
                return;
            }
        }

        if ((this.characterState === CharacterState.IDLE || this.characterState === CharacterState.RUNNING) 
            && (this.inputDirection._x === 1) && downDistance === 0) {
            this.characterState = CharacterState.WALKING_BACKWARDS;
            return;
        }

        if ((this.characterState === CharacterState.IDLE || this.characterState === CharacterState.WALKING_BACKWARDS)
             && (this.inputDirection._x === -1) && downDistance === 0) {
            this.characterState = CharacterState.RUNNING;
            return;
        }

        if (this.inputDirection._x === 0 && this.inputDirection._z === 0 && downDistance === 0) {
            this.characterState = CharacterState.IDLE;
        }

    }

    applyDisplacementVector(dt: number) {

        const moveAdjust = this.V3_ZERO.clone();

        if (this.inputDirection._x === -1) {
            moveAdjust.addInPlace(this.displayMesh.forward.scaleInPlace(this.getHorizontalVelocity()));
        }

        if (this.characterState === CharacterState.JUMPING) {
            moveAdjust.addInPlace(this.gravityVelocity.addInPlace(this.GRAVITY.scale(dt)));
        }

        if (this.characterState === CharacterState.CLOSE_TO_LAND) {
            this.displayMesh.position._y = 1.5;
        }

        this.displayMesh.moveWithCollisions(moveAdjust);
    }

    setJumpImpulse() {
        if (this.characterState === CharacterState.START_JUMP) {
            this.gravityVelocity = this.GRAVITY.scale(-250)
        }
    }

    getHorizontalVelocity(): number {

        let horizontalVelocity = 0;
        if (this.characterState === CharacterState.RUNNING ||
            this.characterState === CharacterState.IDLE
        ) {
            horizontalVelocity = this.CHARACTER_FORWARD_SPEED;
        }

        if (this.characterState === CharacterState.JUMPING) {
            horizontalVelocity = this.CHARACTER_FORWARD_SPEED;
        }
        return horizontalVelocity;
    }

    onKeyboard(kbInfo: KeyboardInfo, playerData: IPlayerData) {

        const muliplier = (kbInfo.type == KeyboardEventTypes.KEYDOWN) ? 1 : 0;

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
                this.characterIntention = muliplier ? CharacterIntention.WANTS_TO_THROW_FREESBE : CharacterIntention.DO_NOTHING;
                break;
            case playerData.roll:
                this.characterIntention = muliplier ? CharacterIntention.WANTS_TO_ROLL : CharacterIntention.DO_NOTHING;
                break;
            case playerData.jump:
                this.characterIntention = muliplier ? CharacterIntention.WANTS_TO_JUMP : CharacterIntention.DO_NOTHING;
                break;
            case 'bt':
                this.characterIntention = muliplier ? CharacterIntention.WANTS_TO_RUN : CharacterIntention.DO_NOTHING;
                break;
        }
    }

    // #endregion

}