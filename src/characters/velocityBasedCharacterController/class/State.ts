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
    // private onGroundWalkSpeed = 1000;
    private onGroundWalkSpeed = 21;

    private onGroundRunSpeed = this.onGroundWalkSpeed * 5 / 3;
    private opossiteOnGroundSpeed = 2 * this.onGroundWalkSpeed;
    private opossiteOnGroundRunSpeed = 2 * this.onGroundRunSpeed;
    private jumpForceImpulse = new Vector3(0, 3000, 0);
    public state: CharacterState = CharacterState.ON_GROUND;

    public wantRun = false;
    private maxDowndDistance = 0;

    constructor(){

        setTimeout(()=>this.maxDowndDistance = 0,5000);
    }

    getNextState(currentVelocity: Vector3, onMobileGround:boolean,downDistance:number) {

        //console.log(downDistance)


        if (downDistance > 0 && downDistance < 3.5) {
            this.state = CharacterState.ON_GROUND;
        }
        //jump
            if (downDistance > 3) {
            this.state = CharacterState.IN_AIR;
        }

        return this.state;
    }

    getForceToApply(currentVelocity: Vector3, inputDirection: Vector3, onMobileGround:boolean,downDistance:number): Vector3 {

        const state = this.getNextState(currentVelocity,onMobileGround,downDistance);
        let forceToApply = new Vector3(0,-8000,0);

        if (state == CharacterState.ON_GROUND) {

            //want to jump
            if (this.wantJump) {
                forceToApply = this.jumpForceImpulse;
                return forceToApply;
            }

        }

        return forceToApply;
    }

    getVelocityToApply(currentVelocity: Vector3, inputDirection: Vector3, onMobileGround:boolean,downDistance:number): Vector3 {

        const state = this.getNextState(currentVelocity,onMobileGround,downDistance);
        let velocityToApply = Vector3.Zero();

        if (state == CharacterState.ON_GROUND) {
            velocityToApply = inputDirection.scale(this.onGroundWalkSpeed);
        }
        return velocityToApply;

    }


}