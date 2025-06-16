import { CharacterShapeOptions, FollowCamera, KeyboardInfo, Matrix, Mesh, MeshBuilder, PhysicsCharacterController, PointerEventTypes, PointerInfo, Quaternion, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { CustomCharacterController } from "./CustomCharacterController";

export class ThirdPersonCharacterController extends CustomCharacterController {
    public constructor(scene: Scene, position: Vector3, height?: number, radius?: number, displayCapsule?: Mesh) {
        super(scene, position, height, radius, displayCapsule);
    }

    onBeforeRender() {
        //console.log(this.state.state)
        // Display tick update: compute new camera position/target, update the capsule for the character display
        this.CoT.position.copyFrom(this.CC.getPosition());
        let x = this.state.inputDirection.x;
        let z = this.state.inputDirection.z;
        if (x !== 0 || z !== 0) {
            this.scene.getAnimationGroupByName('walking')?.play();
            if (!this.displayCapsule.rotationQuaternion) {
                this.displayCapsule.rotationQuaternion = this.displayCapsule.rotation.toQuaternion();
            }
            // const camera = this.scene.activeCamera as FollowCamera;
            // if (!camera) {
            //     return;
            // }
            // Convert the input direction from camera space to world space
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
        this.scene.getAnimationGroupByName('idle')?.play();
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
        let desiredLinearVelocity = this.state.getDesiredVelocity(dt, support, this.state.characterOrientation, this.CC.getVelocity())
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
        super.onKeyboard(kbInfo);
    }
}
