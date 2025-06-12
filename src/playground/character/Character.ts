import { ArcRotateCamera, AxesViewer, CharacterSupportedState, FreeCamera, KeyboardEventTypes, LoadAssetContainerAsync, MeshBuilder, PhysicsCharacterController, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { ThirdPersonCharacterController } from "./classes/ThirdPersonCharacterController";


export class Character {

    private scene: Scene;

    private state = "IN_AIR";
    private inAirSpeed = 8.0;
    private onGroundSpeed = 10.0;
    private jumpHeight = 1.5;
    private wantJump = false;
    private inputDirection = new Vector3(0, 0, 0);
    private forwardLocalSpace = new Vector3(0, 0, 1);
    private characterOrientation = Quaternion.Identity();
    private characterGravity = new Vector3(0, -18, 0);
    private characterController: PhysicsCharacterController;

    constructor(scene: Scene) {
        this.scene = scene;
        this._loadCharacter();
    }

    async _loadCharacter(): Promise<void> {

        // const res = await LoadAssetContainerAsync("./model/ybot.glb",
        //     this.scene, { pluginOptions: { gltf: { animationStartMode: 0 } } })
        // const root = res.meshes[0]
        // root.scaling.scaleInPlace(2)
        // root.position.y = 10
        // res.addAllToScene()

        let h = 1.8;
        let r = 0.6;
        let displayCapsule = MeshBuilder.CreateCapsule("CharacterDisplay", { height: h, radius: r }, this.scene);
        const localAxes = new AxesViewer(this.scene, 1);
        
        localAxes.xAxis.parent = displayCapsule;
        //localAxes.yAxis.parent = displayCapsule;
        localAxes.zAxis.parent = displayCapsule;


        let characterPosition = new Vector3(3., 0.3, -8.);
        this.characterController = new PhysicsCharacterController(characterPosition, { capsuleHeight: h, capsuleRadius: r }, this.scene);
        const camera = this.scene.getCameraByName('camera') as ArcRotateCamera;
        //camera.target = characterPosition;


        //#region observables
        this.scene.onBeforeRenderObservable.add((scene) => {
            displayCapsule.position.copyFrom(this.characterController.getPosition());

            // // camera following
            // var cameraDirection = camera.getDirection(new Vector3(0,0,1));
            // cameraDirection.y = 0;
            // cameraDirection.normalize();
            // camera.setTarget(BABYLON.Vector3.Lerp(camera.getTarget(), displayCapsule.position, 0.1));
            // var dist = BABYLON.Vector3.Distance(camera.position, displayCapsule.position);
            // const amount = (Math.min(dist - 6, 0) + Math.max(dist - 9, 0)) * 0.04;
            // cameraDirection.scaleAndAddToRef(amount, camera.position);
            // camera.position.y += (displayCapsule.position.y + 2 - camera.position.y) * 0.04;
        });

        // After physics update, compute and set new velocity, update the character controller state
        
        this.scene.onAfterPhysicsObservable.add((_) => {
            if (this.scene.deltaTime == undefined) return;
            let dt = this.scene.deltaTime / 1000.0;
            if (dt == 0) return;

            let down = new Vector3(0, -1, 0);
            let support = this.characterController.checkSupport(dt, down);

            Quaternion.FromEulerAnglesToRef(0, camera.rotation.y, 0, this.characterOrientation);
            let desiredLinearVelocity = this.getDesiredVelocity(dt, support, this.characterOrientation, this.characterController.getVelocity());
            this.characterController.setVelocity(desiredLinearVelocity);

            this.characterController.integrate(dt, support, this.characterGravity);
        });

        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                        this.inputDirection.z = 1;
                    } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                        this.inputDirection.z = -1;
                    } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                        this.inputDirection.x = -1;
                    } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                        this.inputDirection.x = 1;
                    } else if (kbInfo.event.key == ' ') {
                        this.wantJump = true;
                    }
                    break;
                case KeyboardEventTypes.KEYUP:
                    if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                        this.inputDirection.z = 0;    
                    }
                    if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                        this.inputDirection.x = 0;
                    } else if (kbInfo.event.key == ' ') {
                        this.wantJump = false;
                    }
                    break;
            }
        });

        //#endregion observables


    }

    getNextState(supportInfo) {
        if (this.state == "IN_AIR") {
            if (supportInfo.supportedState == CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (this.state == "ON_GROUND") {
            if (supportInfo.supportedState != CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }

            if (this.wantJump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (this.state == "START_JUMP") {
            return "IN_AIR";
        }
        return '';
    }

    getDesiredVelocity(deltaTime, supportInfo, characterOrientation, currentVelocity) {
        let nextState = this.getNextState(supportInfo);
        if (nextState != this.state) {
            this.state = nextState;
        }

        let upWorld = this.characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = this.forwardLocalSpace.applyRotationQuaternion(characterOrientation);
        if (this.state == "IN_AIR") {
            let desiredVelocity = this.inputDirection.scale(this.inAirSpeed).applyRotationQuaternion(characterOrientation);
            let outputVelocity = this.characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            // Add gravity
            outputVelocity.addInPlace(this.characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (this.state == "ON_GROUND") {
            // Move character relative to the surface we're standing on
            // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
            // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
            let desiredVelocity = this.inputDirection.scale(this.onGroundSpeed).applyRotationQuaternion(characterOrientation);

            let outputVelocity = this.characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            // Horizontal projection
            {
                outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                let inv1k = 1e-3;
                if (outputVelocity.dot(upWorld) > inv1k) {
                    let velLen = outputVelocity.length();
                    outputVelocity.normalizeFromLength(velLen);

                    // Get the desired length in the horizontal direction
                    let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

                    // Re project the velocity onto the horizontal plane
                    let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                    outputVelocity = c.cross(upWorld);
                    outputVelocity.scaleInPlace(horizLen);
                }
                outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
                return outputVelocity;
            }
        } else if (this.state == "START_JUMP") {
            let u = Math.sqrt(2 * this.characterGravity.length() * this.jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

}