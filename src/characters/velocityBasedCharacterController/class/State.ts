import { Vector3 } from "@babylonjs/core";
import { ThinSSRRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/thinSSRRenderingPipeline";


export enum CharacterState {
    UNKNOWN = '',
    IN_AIR = 'IN_AIR',
    ON_GROUND = 'ON_GROUND',
    START_JUMP = 'START_JUMP',
    FALLING = 'FALLING',
    CLOSE_TO_LAND = 'CLOSE_TO_LAND',
    FALLING_TO_CRASH = 'FALLING_TO_CRASH',
    CLOSE_TO_CRASH = 'CLOSE_TO_CRASH',
    WAS_SHOOT = 'WAS_SHOOT',
    IS_DYING = 'IS_DYING',
    HAS_WON = 'HAS_WON'
}

export class State {


    public wantJump = false;
    public wantsThrowFreesbe = false;
    public wantsToToll = false;
    public wantRun = false;
    public state: CharacterState = CharacterState.ON_GROUND;

    private onGroundWalkSpeed = 15;
    private onGroundRunSpeed = this.onGroundWalkSpeed * 5 / 3;
    private opossiteOnGroundSpeed = 2 * this.onGroundWalkSpeed;
    private opossiteOnGroundRunSpeed = 2 * this.onGroundRunSpeed;
    private jumpForceImpulse = new Vector3(0, 2800, 0);
    private rollForceImpulseScale = 80;



    setNextState(currentVelocity: Vector3, downDistance: number) {

        //console.log(downDistance)
        if (this.state === CharacterState.FALLING_TO_CRASH
            && downDistance < 3.5 && downDistance > 0) {
            this.state = CharacterState.CLOSE_TO_CRASH;
            return;
        }

        if (this.state === CharacterState.FALLING
            && downDistance < 3.5 && downDistance > 0) {
            this.state = CharacterState.CLOSE_TO_LAND;
            return;
        }

        if (downDistance > 0 && downDistance < 3.5) {
            this.state = CharacterState.ON_GROUND;
            return;
        }

        if (currentVelocity._y < -60) {
            this.state = CharacterState.FALLING_TO_CRASH
            return;
        }

        if (currentVelocity._y < -15 && downDistance > 3.5) {
            this.state = CharacterState.FALLING
            return;
        }

        //jump
        if (downDistance > 3) {
            this.state = CharacterState.IN_AIR;
            return;
        }

    }

    getForceToApply(currentVelocity: Vector3, downDistance: number): Vector3 {

        this.setNextState(currentVelocity, downDistance);

        let forceToApply = new Vector3(0, -6000, 0);

        if (this.state == CharacterState.ON_GROUND) {

            //want to jump
            if (this.wantJump) {
                forceToApply = this.jumpForceImpulse;
                return forceToApply;
            }
            if (this.wantsToToll) {
                forceToApply._x = currentVelocity._x * this.rollForceImpulseScale;
                forceToApply._z = currentVelocity._z * this.rollForceImpulseScale;
                 forceToApply._y = currentVelocity._y * this.rollForceImpulseScale;
                return forceToApply;
            }

        }
        return forceToApply;
    }

    getVelocityToApply(currentVelocity: Vector3, inputDirection: Vector3, downDistance: number): Vector3 {

        const state = this.setNextState(currentVelocity, downDistance);
        let velocityToApply = Vector3.Zero();

        if (this.state == CharacterState.ON_GROUND) {
            velocityToApply = inputDirection.scale(this.onGroundWalkSpeed);
        }
        return velocityToApply;

    }


}