import { CharacterShapeOptions, FreeCamera, KeyboardEventTypes, KeyboardInfo, Mesh, MeshBuilder, PhysicsCharacterController, PointerEventTypes, PointerInfo, Quaternion, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { CharacterControllerState } from "../CharacterControllerState";

export class CustomCharacterController {
    public height: number = 1.8;
    public radius: number = 0.6;
    public displayCapsule: Mesh;
    public lookTarget: Mesh;
    protected CoT: TransformNode;
    protected CC: PhysicsCharacterController;
    protected state: CharacterControllerState;
    protected scene: Scene;
    protected isMouseDown: boolean = false;
    protected isKeyDown: boolean = false;
    protected isBlockingKeyboard: boolean = false;

    public constructor(scene: Scene, position: Vector3, height?: number, radius?: number, displayCapsule?: Mesh) {
        this.scene = scene;
        if (height) {
            this.height = height;
        }
        if (radius) {
            this.radius = radius;
        }
        this.CoT = new TransformNode("CC-CoT", scene)
        this.CoT.position = position;
        this.lookTarget = MeshBuilder.CreateLines("CC-lookTarget", {
            points: [
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0),
            ], // Two points coincide to form a zero-length line segment
        }, scene);
        this.lookTarget.isVisible = false;
        this.lookTarget.isPickable = false;
        this.lookTarget.position = Vector3.Zero();
        this.lookTarget.parent = this.CoT;
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
        this.CC = new PhysicsCharacterController(position, shapeOptions, this.scene);
        // Player/Character state
        this.state = new CharacterControllerState(this.CC);
    }

    // #region Events
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
        return;
        // Display tick update: compute new camera position/target, update the capsule for the character display
        this.CoT.position.copyFrom(this.CC.getPosition())
        // camera following
        const camera = this.scene.activeCamera as FreeCamera
        if (!camera) {
            return
        }
        const cameraDirection = camera.getDirection(new Vector3(0, 0, 1))
        cameraDirection.y = 0
        cameraDirection.normalize()
        camera.setTarget(Vector3.Lerp(camera.getTarget(), this.CoT.position, 0.1))
        const dist = Vector3.Distance(camera.position, this.CoT.position)
        const amount = (Math.min(dist - 6, 0) + Math.max(dist - 9, 0)) * 0.04
        cameraDirection.scaleAndAddToRef(amount, camera.position)
        camera.position.y += (this.CoT.position.y + 2 - camera.position.y) * 0.04
    }

    onAfterPhysics() {
        return;
        // After physics update, compute and set new velocity, update the character controller state
        if (this.scene.deltaTime == undefined) {
            return
        }
        let dt = this.scene.deltaTime / 1000.0
        if (dt == 0) {
            return
        }
        let down = new Vector3(0, -1, 0)
        let support = this.CC.checkSupport(dt, down)

        const camera = this.scene.activeCamera as FreeCamera
        if (!camera) {
            return
        }
        Quaternion.FromEulerAnglesToRef(0, camera.rotation.y, 0, this.state.characterOrientation)
        let desiredLinearVelocity = this.state.getDesiredVelocity(dt, support, this.state.characterOrientation, this.CC.getVelocity())
        this.CC.setVelocity(desiredLinearVelocity)

        this.CC.integrate(dt, support, this.state.characterGravity)
    }

    onPointer(pointerInfo: PointerInfo) {
        return;
        // Rotate camera
        // Add a slide vector to rotate arount the character
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                this.isMouseDown = true
                break
            case PointerEventTypes.POINTERUP:
                this.isMouseDown = false
                break
            case PointerEventTypes.POINTERMOVE:
                return;
                if (this.isMouseDown) {
                    const camera = this.scene.activeCamera as FreeCamera
                    if (!camera) {
                        return
                    }
                    const tgt = camera.getTarget().clone()
                    camera.position.addInPlace(camera.getDirection(Vector3.Right()).scale(pointerInfo.event.movementX * -0.02))
                    camera.setTarget(tgt)
                }
                break
        }
    }

    onKeyboard(kbInfo: KeyboardInfo) {
        // Input to direction
        // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space
        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:
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
                }
                if (kbInfo.event.shiftKey) {
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
                }
                break
        }
    }
    // #endregion

    updateInputDirecion(x?: number, z?: number) {
        if (this.isKeyDown) {
            return
        }
        if (x !== undefined) {
            this.state.inputDirection.x = x
        }
        if (z !== undefined) {
            this.state.inputDirection.z = z
        }
    }

    updateBlockingKeyboard(value: boolean) {
        this.isBlockingKeyboard = value
    }
}