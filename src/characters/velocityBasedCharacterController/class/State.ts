import { Vector3 } from "@babylonjs/core";


export enum CharacterState {
    UNKNOWN = '',
    IN_AIR = 'IN_AIR',
    ON_GROUND = 'ON_GROUND',
    START_JUMP = 'START_JUMP',
}

export class State {


    public wantJump = false;
    public wantsThrowFreesbe = false;
    public wantsCrossPunch = false;
    private onGroundWalkSpeed = 1000;
    private onGroundRunSpeed = this.onGroundWalkSpeed * 5 / 3;
    private opossiteOnGroundSpeed = 2 * this.onGroundWalkSpeed;
    private opossiteOnGroundRunSpeed = 2 * this.onGroundRunSpeed;
    private jumpForceImpulse = new Vector3(0, 1000, 0);
    public state: CharacterState = CharacterState.ON_GROUND;

    public wantRun = false;

    constructor() {

    }

    getNextState(currentVelocity: Vector3, onMobileGround:boolean) {
        if (currentVelocity._y === 0) {
            this.state = CharacterState.ON_GROUND;
        }
        //jump
        if (currentVelocity._y > 1 && !onMobileGround) {
            this.state = CharacterState.IN_AIR;
        }
        //is falling
        if (currentVelocity._y < -1 && !onMobileGround) {
            this.state = CharacterState.IN_AIR;
        }
        return this.state;
    }

    getForceToApply(currentVelocity: Vector3, inputDirection: Vector3, onMobileGround:boolean): Vector3 {

        const state = this.getNextState(currentVelocity,onMobileGround);
        let forceToApply = Vector3.Zero();

        if (state == CharacterState.ON_GROUND) {

            //want to jump
            if (this.wantJump) {
                forceToApply = this.jumpForceImpulse;
                return forceToApply;
            }

            //is Running and need to brake
            if ((Math.abs(currentVelocity._x) > 20 || Math.abs(currentVelocity._z) > 20)) {
                if ((inputDirection._x === 0 && inputDirection._z === 0)) {
                    forceToApply = currentVelocity.clone().normalize().scaleInPlace(-this.opossiteOnGroundRunSpeed);
                    return forceToApply;
                }
            }

            //lets run
            if ((inputDirection._x !== 0 || inputDirection._z !== 0) && this.wantRun) {
                forceToApply = inputDirection.scale(this.onGroundRunSpeed);
                return forceToApply;
            }

            //is walking
            if ((Math.abs(currentVelocity._x) > 2 || Math.abs(currentVelocity._z) > 2)) {
                //need to stop                
                if ((inputDirection._x === 0 && inputDirection._z === 0)) {
                    forceToApply = currentVelocity.clone().normalize().scaleInPlace(-this.opossiteOnGroundSpeed);
                    return forceToApply;
                }
            }

            //lets walk normally
            if ((inputDirection._x !== 0 || inputDirection._z !== 0)) {
                forceToApply = inputDirection.scale(this.onGroundWalkSpeed);
            }

            //need to push down character so it wont fly
            if(onMobileGround){
                forceToApply._y = -1000;
            }
            //FINAL                    
            return forceToApply;
        }

        if(state === CharacterState.IN_AIR){
            forceToApply._y = -1000;
        }

        return forceToApply;
    }

}