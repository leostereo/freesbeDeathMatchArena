import { CharacterShapeOptions, Color3, FollowCamera, KeyboardEventTypes, KeyboardInfo, Matrix, Mesh, MeshBuilder, PhysicsCharacterController, PointerEventTypes, PointerInfo, Quaternion, Scene, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { CharacterControllerState } from "./CCState";
import { CharacterAnimationContainer } from "./CCAContainer";
import { CharacterControllerAnimationManager } from "./CCAManager";
import { CharacterControllerAnimationEventBinder } from "./CCAEBinder";


/**
 *  CONTROLS THE CHARACTER
 */

export class ThirdPersonCharacterController {

    public height: number = 1.8;
    public radius: number = 0.6;
    public displayCapsule: Mesh;
    public lookTarget: Mesh;
    protected nose: Mesh;
    protected CoT: TransformNode;
    protected CC: PhysicsCharacterController;
    protected state: CharacterControllerState;
    protected scene: Scene;
    protected isMouseDown: boolean = false;
    protected isKeyDown: boolean = false;
    protected isBlockingKeyboard: boolean = false;

    protected CAC: CharacterAnimationContainer;
    protected CCAM: CharacterControllerAnimationManager;
    protected CCAEB: CharacterControllerAnimationEventBinder;

    /**
     * Creates a Cot - center of transformation.
     * Creates a capsule if not passed , set Cot as parent
     * Creates characterShape
     * Creates CharacterController(CC) , passing the characterShape.
     * Creates a CharacterState, pass the CC.
     * 
     */
    public constructor(scene: Scene, position: Vector3, animationContainer: CharacterAnimationContainer,
        height?: number, radius?: number, displayCapsule?: Mesh,

    ) {
        this.scene = scene;
        if (height) {
            this.height = height;
        }
        if (radius) {
            this.radius = radius;
        }
        this.CoT = new TransformNode("CC-CoT", scene)
        this.CoT.position = position;

        // Physics shape for the character
        if (displayCapsule) {
            this.displayCapsule = displayCapsule;
        } else {
            this.displayCapsule = MeshBuilder.CreateCapsule("CC-capsule", { height: this.height, radius: this.radius }, this.scene);
        }

        this.displayCapsule.position = Vector3.Zero();
        this.displayCapsule.parent = this.CoT;
        const shapeOptions: CharacterShapeOptions = {
            capsuleHeight: this.height,
            capsuleRadius: this.radius,
        }

        //nose
        this.nose = MeshBuilder.CreateBox("nose", {
            height: 0.4,
            width: 0.8,
            depth: 0.4,
        }, this.scene)
        this.nose.position = new Vector3(3.4, 1.8, 0)
        this.nose.parent = this.displayCapsule
        this.nose.isVisible = false;

        this.CC = new PhysicsCharacterController(position, shapeOptions, this.scene);
        // Player/Character state
        this.state = new CharacterControllerState(this.CC, this.scene);
        //this.CCAM = new CharacterControllerAnimationManager(this.scene);
        this.CAC = animationContainer;
        this.CCAM = new CharacterControllerAnimationManager(animationContainer)
        this.CCAEB = new CharacterControllerAnimationEventBinder(animationContainer, this.scene);
    }

    bindEvents() {
        this.scene.onBeforeRenderObservable.add(() => this.onBeforeRender())
        this.scene.onAfterPhysicsObservable.add(() => this.onAfterPhysics())
        this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => this.onPointer(pointerInfo))
        this.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => {
            if (this.isBlockingKeyboard) {
                return
            }
            this.onKeyboard(kbInfo)
        })
    }

    onBeforeRender() {
        // Display tick update: compute new camera position/target, update the capsule for the character display
        this.CoT.position.copyFrom(this.CC.getPosition());
        let x = this.state.inputDirection.x;
        let z = this.state.inputDirection.z;
        if (x !== 0 || z !== 0) {
            if (!this.displayCapsule.rotationQuaternion) {
                this.displayCapsule.rotationQuaternion = this.displayCapsule.rotation.toQuaternion();
            }

            const cameraQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
            const cameraMatrix = new Matrix();
            cameraQuaternion.toRotationMatrix(cameraMatrix);
            const worldInputDir = Vector3.TransformNormal(this.state.inputDirection.clone(), cameraMatrix).normalize();
            const targetAngle = Math.atan2(-worldInputDir.z, worldInputDir.x);
            const targetQuaternion = Quaternion.RotationYawPitchRoll(targetAngle, 0, 0);
            this.displayCapsule.rotationQuaternion = Quaternion.Slerp(
                this.displayCapsule.rotationQuaternion,
                targetQuaternion,
                0.2,
            );
        }
    }

    onAfterPhysics() {
        if (this.scene.deltaTime == undefined) {
            return
        }
        let dt = this.scene.deltaTime / 1000.0
        if (dt == 0) {
            return
        }
        let down = new Vector3(0, -1, 0)
        let support = this.CC.checkSupport(dt, down)

        const camera = this.scene.activeCamera as FollowCamera
        if (!camera) {
            return
        }
        Quaternion.FromEulerAnglesToRef(0, camera.rotation.y, 0, this.state.characterOrientation)

        let desiredLinearVelocity = this.state.getDesiredVelocity(dt, support, this.state.characterOrientation, this.CC.getVelocity(),this.CAC.isAnyAnimationLatched())

        this.CCAM.updateAnimationFromVelocity(desiredLinearVelocity);
        this.CC.setVelocity(desiredLinearVelocity)
        this.CC.integrate(dt, support, this.state.characterGravity)
    }

    onPointer(pointerInfo: PointerInfo) {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                this.isMouseDown = true
                break
            case PointerEventTypes.POINTERUP:
                this.isMouseDown = false
                break
            case PointerEventTypes.POINTERMOVE:
                if (this.isMouseDown) {
                    // const camera = this.scene.activeCamera as FollowCamera
                    // if (!camera) {
                    //     return
                    // }
                    // const tgt = camera.getTarget().clone()
                    // camera.position.addInPlace(camera.getDirection(Vector3.Right()).scale(pointerInfo.event.movementX * -0.02))
                    // camera.setTarget(tgt)
                }
                break
        }
    }

    onKeyboard(kbInfo: KeyboardInfo) {
        // Input to direction
        // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space

        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:
                if (this.CAC.isAnyAnimationLatched()) return;
                this.isKeyDown = true
                if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                    this.state.inputDirection.x = -1
                } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                    this.state.inputDirection.x = 1
                } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                    this.state.inputDirection.z = -1
                } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                    this.state.inputDirection.z = 1
                } else if (kbInfo.event.key == ' ') {
                    this.state.wantJump = true
                } else if (kbInfo.event.key == 'h') {
                    this.state.isThrowingFreesbe = true;
                } if (kbInfo.event.shiftKey) {
                } else if (kbInfo.event.key == 'j') {
                    this.state.isCrossPunching = true;
                } if (kbInfo.event.shiftKey) {
                    this.state.isRunning = true
                }
                break
            case KeyboardEventTypes.KEYUP:
                this.isKeyDown = false
                this.state.isRunning = false
                if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                    this.state.inputDirection.x = 0
                }
                if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                    this.state.inputDirection.z = 0
                } else if (kbInfo.event.key == ' ') {
                    this.state.wantJump = false
                } else if (kbInfo.event.key === 'h') {
                    this.state.isThrowingFreesbe = false;
                } else if (kbInfo.event.key === 'j') {
                    this.state.isCrossPunching = false;
                }
                break
        }

        this.CCAM.updateAnimationFromKeyBoard(this.state.isThrowingFreesbe, this.state.isCrossPunching)


        // if (this.CAC.isAnyAnimationLatched()) {
        //     this.state.inputDirection._x = 0;
        //     this.state.inputDirection._z = 0;
        // }

        //#region animation and event data update
        const euler = this.displayCapsule.rotationQuaternion?.toEulerAngles();
        if (euler) {
            const degrees = Tools.ToDegrees(euler._y);
            this.CCAEB.setEmitterAngle(degrees);
        }
        const normal = this.nose.getFacetNormal(4).normalize();
        this.CCAEB.setEmitterNormal(normal);
        this.CCAEB.setEmitterPosition(this.nose.getAbsolutePosition());
    }
}
