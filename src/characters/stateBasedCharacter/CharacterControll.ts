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
import { GroundTypeEnum } from "@/shared/enums/GroundType";
import { TextureLineComponent } from "@babylonjs/inspector/components/actionTabs/lines/textureLineComponent";


export class CharacterControll {

    private V3_ZERO = Vector3.Zero();

    private CHARACTER_ROTATION_SPEED: number = 0.1;
    private inputDirection: Vector3 = this.V3_ZERO.clone();
    private characterState: CharacterState;
    private characterIntention: CharacterIntention;

    private animationManager: AnimationManager;

    //Character capsule
    public displayMesh: AbstractMesh;
    private freesbeManager: FreesbeManager;
    private distanceToGround: number = 0;

    //Character physics parameters
    private EPSILON = 1e-10;
    private FRICTION = 0.25;
    private GRAVITY = new Vector3(0, -0.0049, 0);
    private MOVE_SPEED = 0.004;
    private MOVE_SPEED_BACK = 0.001;
    private JUMP_FORCE = 350;
    private GROUND_STICKING_FACTOR = 25;
    private MAX_GROUND_SLOPE = Math.PI * 0.25;

    private currentGroundType = GroundTypeEnum.ON_SHALLOW;
    private moveVelocity = this.V3_ZERO.clone();
    private gravityVelocity = this.V3_ZERO.clone();

    private ray = new Ray(Vector3.Zero().clone(), Vector3.Down(), 10);
    private rayViewer = new RayHelper(this.ray);

    constructor(private scene: Scene,
        private playerMeshAssetTask: MeshAssetTask,
        private playerData: IPlayerData,
        private eventContainer: EventContainer) {

        this.characterState = CharacterState.IDLE;
        this.animationManager = new AnimationManager(this.scene);
        this.createDisplayMeshForCharacter(playerData);

        this.freesbeManager = new FreesbeManager(this.scene, playerData);

        this.bindObservables(playerData);

        this.rayViewer.show(scene, new Color3(0, 1, 0));
    }


    private createDisplayMeshForCharacter(playerData: IPlayerData) {

        this.displayMesh = MeshBuilder.CreateCapsule(playerData.name,
            { radius: 0.6, height: 2 },
            this.scene);
        this.displayMesh.checkCollisions = true;
        this.displayMesh.isVisible = false;
        this.displayMesh.rotate(new Vector3(0, 1, 0), -Math.PI / 2, Space.WORLD)

        this.displayMesh.position._x = playerData.initPosition._x;
        this.displayMesh.position._y = 1;                         //at level 0
        this.displayMesh.position._z = playerData.initPosition._z;

        const playerMesh = this.playerMeshAssetTask.loadedMeshes[0];
        playerMesh.scaling.scaleInPlace(1.4)
        playerMesh.position._y = -1;              //at level 0
        playerMesh.parent = this.displayMesh;

    }


    public informGameEvent(gameEvent: GameEvent) {
        //console.lxg(gameEvent);
    }


    // #region Observables 
    bindObservables(playerData: IPlayerData) {
        this.scene.onBeforeRenderObservable.add(() => this.onBeforeRender())
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => this.onKeyboard(kbInfo, playerData))
    }

    private shoudMoveHorizontally(): boolean {
        if (this.characterState === CharacterState.CLOSE_TO_LAND ||
            this.characterState === CharacterState.THROWING_FREESBE_GROUND
        ) {
            return false;
        }
        return true;
    }

    onBeforeRender() {
        if (this.displayMesh.position.y < -10) {
            this.displayMesh.position = new Vector3(0, 10, 10);
        }
        const DELTA_TIME = this.scene.getEngine().getDeltaTime();
        this.setNextState();

        if (this.inputDirection.z === -1) {
            this.displayMesh.rotate(Vector3.Up(), -this.CHARACTER_ROTATION_SPEED);
        }

        if (this.inputDirection.z === 1) {
            this.displayMesh.rotate(Vector3.Up(), this.CHARACTER_ROTATION_SPEED);
        }

        //Physic main loop.

        // Key input moves the character (only if on shallow ground)
        if (this.currentGroundType === GroundTypeEnum.ON_SHALLOW) {

            // Convert key input to a movement change vector
            var moveAdjust = this.V3_ZERO.clone();
            if (this.inputDirection.x === -1) {
                moveAdjust.addInPlace(this.displayMesh.forward)
            }

            if (this.inputDirection._x === 1) {
                moveAdjust.subtractInPlace(this.displayMesh.forward)
            }

            if (this.characterState === CharacterState.JUMPING) {
                this.gravityVelocity = this.GRAVITY.scale(this.JUMP_FORCE * -1);
            }
            // moveVelocity adjusted by the movement change vector
            if (moveAdjust.lengthSquared() != 0) {
                if (this.inputDirection.x === -1) {
                    moveAdjust.normalize().scaleInPlace(this.MOVE_SPEED * DELTA_TIME);
                }

                if (this.inputDirection.x === 1) {
                    moveAdjust.normalize().scaleInPlace(this.MOVE_SPEED_BACK * DELTA_TIME);
                }
                this.moveVelocity.addInPlace(moveAdjust);
            }
        }

        // Friction (if ON any ground, shallow OR steep, but not OVER it)
        if (this.currentGroundType === GroundTypeEnum.ON_SHALLOW ||
            this.currentGroundType === GroundTypeEnum.ON_STEEP) {
            this.moveVelocity.copyFrom(
                Vector3.Lerp(this.moveVelocity, this.V3_ZERO, this.FRICTION));
        }

        this.shoudMoveHorizontally() && this.displayMesh.moveWithCollisions(this.moveVelocity);
        this.displayMesh.computeWorldMatrix(true);

        //chech surface angle
        this.ray.origin.copyFrom(this.displayMesh.position);

        const pick = this.scene.pickWithRay(this.ray, o => o.checkCollisions && o != this.displayMesh);

        if (pick && pick.hit) {
            this.distanceToGround = pick.distance;
            var normal = pick.getNormal(true);
            var groundAngle =
                Math.acos(Vector3.Dot(normal!, Vector3.Up()));
            if (groundAngle < this.MAX_GROUND_SLOPE) {
                this.currentGroundType = GroundTypeEnum.OVER_SHALLOW;
            } else {
                this.currentGroundType = GroundTypeEnum.OVER_STEEP;
            }
        } else {
            // If we don't detect ground, default to "over steep"
            this.currentGroundType = GroundTypeEnum.OVER_STEEP;
        }

        // Gravity velocity increases every frame
        this.gravityVelocity.addInPlace(this.GRAVITY.scale(DELTA_TIME));

        // Calculate the destination to be expected if no collision occurs
        var uncollidedTargetPosition = this.displayMesh.position.add(this.gravityVelocity);

        // Move character by gravity velocity
        if (this.currentGroundType == GroundTypeEnum.OVER_SHALLOW) {
            // No sliding over shallow ground
            this.displayMesh.moveWithCollisions(this.gravityVelocity);
        } else {
            // Sliding over steep ground
            this.displayMesh.moveWithCollisions(this.gravityVelocity);
        }

        const collisionOccurred = !this.displayMesh.position.equalsWithEpsilon(uncollidedTargetPosition, this.EPSILON);

        if (collisionOccurred) {
            if (this.currentGroundType == GroundTypeEnum.OVER_SHALLOW) {
                this.currentGroundType = GroundTypeEnum.ON_SHALLOW;
                // Keep gravity velocity at a "sticking" force, while on shallow
                // ground
                this.gravityVelocity.copyFrom(this.GRAVITY.scale(this.GROUND_STICKING_FACTOR));

            } else {
                this.currentGroundType = GroundTypeEnum.ON_STEEP;
            }
        }

        this.animationManager.updateAnimation(this.characterState);

    }


    setNextState() {

        const STANDING_ON_GROUND_DISTANCE = 1.02;
        //Ray meassures 1.01 when standing on ground.
        //Not sure where it comes yet.
        //That value was taken from lxgs.

        const downDistance = this.distanceToGround;
        if (downDistance === undefined) {
            return
        }

        // state resolver
        
        // release throw freesbe in air
        if (this.characterState === CharacterState.THROWING_FREESBE_IN_AIR) {

            if (this.animationManager.throwFreesbe) {
                this.freesbeManager.thowFreesbe(this.displayMesh);
                this.animationManager.throwFreesbe = false;
            }

            if (this.animationManager.lastAnimationFinishes) {

                if (downDistance < 5 && this.gravityVelocity._y < 0) {
                    this.characterState = CharacterState.CLOSE_TO_LAND
                    return;
                }

                this.characterState = CharacterState.JUMPING;
            }

            return;
        }

        // detect throw freesbe in air
        if (this.characterState === CharacterState.JUMPING &&
            this.characterIntention === CharacterIntention.WANTS_TO_THROW_FREESBE) {
            this.characterState = CharacterState.THROWING_FREESBE_IN_AIR;
            return;
        }

        //release throw freesbe
        if (this.characterState === CharacterState.THROWING_FREESBE_GROUND) {

            if (this.animationManager.throwFreesbe) {
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
            if (downDistance < STANDING_ON_GROUND_DISTANCE && this.characterIntention === CharacterIntention.WANTS_TO_THROW_FREESBE) {
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
            downDistance < 5 && this.gravityVelocity._y < 0) {
            this.characterState = CharacterState.CLOSE_TO_LAND;
            return;
        }

        if (this.characterState === CharacterState.START_JUMP && this.animationManager.jumpingImpulseIsOver) {
            this.characterState = CharacterState.JUMPING;
            this.animationManager.jumpingImpulseIsOver = false;
            return;
        }

        if (this.characterState === CharacterState.IDLE || this.characterState === CharacterState.RUNNING) {
            if (downDistance < STANDING_ON_GROUND_DISTANCE && this.characterIntention === CharacterIntention.WANTS_TO_JUMP) {
                this.characterState = CharacterState.START_JUMP;
                return;
            }
        }
        //#endregion

        //#region Horizontal move
        if ((this.characterState === CharacterState.IDLE || this.characterState === CharacterState.RUNNING)
            && (this.inputDirection._x === 1) && downDistance < STANDING_ON_GROUND_DISTANCE) {
            this.characterState = CharacterState.WALKING_BACKWARDS;
            return;
        }

        if ((this.characterState === CharacterState.IDLE || this.characterState === CharacterState.WALKING_BACKWARDS)
            && (this.inputDirection._x === -1) && downDistance < STANDING_ON_GROUND_DISTANCE) {
            this.characterState = CharacterState.RUNNING;
            return;
        }

        if (this.inputDirection._x === 0 && this.inputDirection._z === 0 && downDistance < STANDING_ON_GROUND_DISTANCE
            && this.characterState !== CharacterState.START_JUMP && this.characterState !== CharacterState.JUMPING
        ) {
            this.characterState = CharacterState.IDLE;
        }

        //#endregion
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