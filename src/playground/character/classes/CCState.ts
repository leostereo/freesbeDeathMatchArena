import { CharacterSupportedState, CharacterSurfaceInfo, PhysicsCharacterController, Quaternion, Vector3 } from "@babylonjs/core";

enum CharacterState {
    UNKNOWN = '',
    IN_AIR = 'IN_AIR',
    ON_GROUND = 'ON_GROUND',
    START_JUMP = 'START_JUMP',
}

export class CharacterControllerState {
    public state: CharacterState = CharacterState.ON_GROUND;
    public inAirSpeed = 8.0;
    public onGroundSpeed = 10.0;
    public jumpHeight = 2.5;
    public wantJump = false;
    public isThrowingFreesbe = false;
    public isCrossPunching = false;
    public inputDirection = new Vector3(0, 0, 0);
    public forwardLocalSpace = new Vector3(0, 0, 1);
    public characterOrientation = Quaternion.Identity();
    public characterGravity = new Vector3(0, -18, 0);
    public isRunning = false;

    protected characterController: PhysicsCharacterController;

    public constructor(characterController: PhysicsCharacterController, private scene) {
        this.characterController = characterController

    }

    getNextState(supportInfo: CharacterSurfaceInfo): CharacterState {
        // State handling
        // depending on character state and support, set the new state
        if (this.state == CharacterState.IN_AIR) {
            if (supportInfo.supportedState == CharacterSupportedState.SUPPORTED) {
                return CharacterState.ON_GROUND
            }
            return CharacterState.IN_AIR
        } else if (this.state == CharacterState.ON_GROUND) {
            if (supportInfo.supportedState != CharacterSupportedState.SUPPORTED) {
                return CharacterState.IN_AIR
            }

            if (this.wantJump) {
                return CharacterState.START_JUMP
            }
            return CharacterState.ON_GROUND
        } else if (this.state == CharacterState.START_JUMP) {
            return CharacterState.IN_AIR
        }
        return CharacterState.UNKNOWN
    }

    getDesiredVelocity(deltaTime: number, supportInfo: CharacterSurfaceInfo, characterOrientation: Quaternion, currentVelocity: Vector3): Vector3 {
        // From aiming direction and state, compute a desired velocity
        // That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
        let nextState = this.getNextState(supportInfo)
        if (nextState != this.state) {
            this.state = nextState
        }

        let upWorld = this.characterGravity.normalizeToNew()
        upWorld.scaleInPlace(-1.0)
        let forwardWorld = this.forwardLocalSpace.applyRotationQuaternion(characterOrientation)
        if (this.state == CharacterState.IN_AIR) {
            let desiredVelocity = this.inputDirection.scale(this.inAirSpeed).applyRotationQuaternion(characterOrientation)
            let outputVelocity = this.characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, Vector3.ZeroReadOnly, desiredVelocity, upWorld)
            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)))
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)))
            // Add gravity
            outputVelocity.addInPlace(this.characterGravity.scale(deltaTime))
            return outputVelocity
        } else if (this.state == CharacterState.ON_GROUND) {
            // Move character relative to the surface we're standing on
            // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
            // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
            let speed = this.onGroundSpeed
            if (this.isRunning) {
                speed *= 3.0
            }
            if(this.isThrowingFreesbe || this.isCrossPunching){
                this.inputDirection = new Vector3(0,0,0);
            }
            let desiredVelocity = this.inputDirection.scale(speed).applyRotationQuaternion(characterOrientation)

            let outputVelocity = this.characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld)
            // Horizontal projection
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity)
            let inv1k = 1e-3
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length()
                outputVelocity.normalizeFromLength(velLen)

                // Get the desired length in the horizontal direction
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld)

                // Re project the velocity onto the horizontal plane
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity)
                outputVelocity = c.cross(upWorld)
                outputVelocity.scaleInPlace(horizLen)
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity)
            return outputVelocity
        } else if (this.state == CharacterState.START_JUMP) {
            let u = Math.sqrt(2 * this.characterGravity.length() * this.jumpHeight)
            let curRelVel = currentVelocity.dot(upWorld)
            return currentVelocity.add(upWorld.scale(u - curRelVel))
        }
        return Vector3.Zero()
    }

}