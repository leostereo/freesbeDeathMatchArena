import { Vector3 } from "@babylonjs/core";


export enum CharacterState {
    UNKNOWN = '',
    IN_AIR = 'IN_AIR',
    ON_GROUND = 'ON_GROUND',
    START_JUMP = 'START_JUMP',
    FALLING = 'FALLING',
    FALLING_TO_CRASH = 'FALLING_TO_CRASH',
}

export class State {


    public wantJump = false;
    public wantsThrowFreesbe = false;
    public wantsCrossPunch = false;
    private onGroundWalkSpeed = 21;

    private onGroundRunSpeed = this.onGroundWalkSpeed * 5 / 3;
    private opossiteOnGroundSpeed = 2 * this.onGroundWalkSpeed;
    private opossiteOnGroundRunSpeed = 2 * this.onGroundRunSpeed;
    private jumpForceImpulse = new Vector3(0, 3000, 0);
    public state: CharacterState = CharacterState.ON_GROUND;

    public wantRun = false;


    setNextState(currentVelocity: Vector3, downDistance:number) {

        //console.log(downDistance)

        if(currentVelocity._y < -60){
            this.state = CharacterState.FALLING_TO_CRASH
            return;
        }

        if(currentVelocity._y < -15){
            this.state = CharacterState.FALLING
            return;
        }
        
        if (downDistance > 0 && downDistance < 3.5) {
            this.state = CharacterState.ON_GROUND;
            return;
        }
        //jump
        if (downDistance > 3) {
            this.state = CharacterState.IN_AIR;
            return;
        }

        
    }

    getForceToApply(currentVelocity: Vector3, downDistance:number): Vector3 {

        this.setNextState(currentVelocity,downDistance);

        let forceToApply = new Vector3(0,-6000,0);

        if (this.state == CharacterState.ON_GROUND) {

            //want to jump
            if (this.wantJump) {
                forceToApply = this.jumpForceImpulse;
                return forceToApply;
            }

        }

        return forceToApply;
    }

    getVelocityToApply(currentVelocity: Vector3, inputDirection: Vector3, downDistance:number): Vector3 {

        const state = this.setNextState(currentVelocity,downDistance);
        let velocityToApply = Vector3.Zero();

        if (this.state == CharacterState.ON_GROUND) {
            velocityToApply = inputDirection.scale(this.onGroundWalkSpeed);
        }
        return velocityToApply;

    }


}