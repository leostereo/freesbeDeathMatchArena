import { AnimationEnums, CharacterAnimationContainer, CharacterAnimationItem } from "@/shared/CharacterAnimationContainer";
import { Vector3 } from "@babylonjs/core";
import { CharacterState } from "./State";



export class AnimationManager {

    private AnimationContainer: CharacterAnimationContainer;

    constructor(animationContainer: CharacterAnimationContainer) {

        this.AnimationContainer = animationContainer;

    }

    public updateAnimationFromKeyBoard(throwFreesbe: boolean, crossPunch: boolean, jump: boolean,
        currentAnimation: CharacterAnimationItem | undefined): void {

        if (jump && currentAnimation?.name !== AnimationEnums.jump) {
            const animation = this.AnimationContainer.getAnimationByName(AnimationEnums.jump);
            animation.latched = true;
            this.playControlledAnimation(animation);
            return;
        }
    }
    public updateAnimationFromVelocity(velocityVector: Vector3, inputDirection: Vector3,
        currentAnimation: CharacterAnimationItem | undefined, state: CharacterState): void {

        if (currentAnimation?.latched) return;


        //Ground animations
        if (state == CharacterState.ON_GROUND) {

            if ((Math.abs(velocityVector._x) >= 0 || Math.abs(velocityVector._z) >= 0) && velocityVector._y === 0) {

                if (currentAnimation?.name === AnimationEnums.idle || currentAnimation?.name === AnimationEnums.falling_impact) return;

                this.playAnimationLoop(
                    this.AnimationContainer.getAnimationByName(AnimationEnums.idle)
                )

                return
            }

            if ((Math.abs(velocityVector._x) > 29 || Math.abs(velocityVector._z) > 29)) {
                if (currentAnimation?.name === AnimationEnums.run_fast) return;
                this.playAnimationLoop(this.AnimationContainer.getAnimationByName(AnimationEnums.run_fast))
                return;
            }

            if ((Math.abs(velocityVector._x) > 20 || Math.abs(velocityVector._z) > 20)) {
                if (currentAnimation?.name === AnimationEnums.run) return;

                this.playAnimationLoop(
                    this.AnimationContainer.getAnimationByName(AnimationEnums.run)
                )

                return;
            }

            if (inputDirection._x || inputDirection._z) {
                if (currentAnimation?.name === AnimationEnums.walk) {
                    return;
                }

                this.playAnimationLoop(
                    this.AnimationContainer.getAnimationByName(AnimationEnums.walk)
                )
                return
            }

            // if ((Math.abs(velocityVector._x) > 2 || Math.abs(velocityVector._z) > 2)) {
            //     if (currentAnimation?.name === AnimationEnums.walk) {
            //         return;
            //     }
            //     this.playAnimationLoop(
            //         this.AnimationContainer.getAnimationByName(AnimationEnums.walk)
            //     )
            //     return
            // }



            return
        }

        if (state = CharacterState.IN_AIR) {

            if (velocityVector._y > -15 && currentAnimation?.name === AnimationEnums.falling_flat) {
                this.playControlledAnimation(this.AnimationContainer.getAnimationByName(AnimationEnums.falling_impact));
                return;
            }

            if (velocityVector._y < -35) {
                if (currentAnimation?.name === AnimationEnums.falling_flat) return;
                this.playAnimationLoop(this.AnimationContainer.getAnimationByName(AnimationEnums.falling_flat));
                return;
            }

            if (velocityVector._y < -15 && currentAnimation?.name !== AnimationEnums.falling_idle) {
                this.playAnimationLoop(this.AnimationContainer.getAnimationByName(AnimationEnums.falling_idle));
                return;
            }

            return
        }





    }

    private playAnimationLoop(animation: CharacterAnimationItem): void {
        this.AnimationContainer.getCurrentPlayingAnimation()?.animation.stop();
        animation.animation.play(true);
    }

    private playControlledAnimation(animation: CharacterAnimationItem) {
        this.AnimationContainer.getCurrentPlayingAnimation()?.animation.stop();
        if (animation.control) {
            animation.animation.start(
                animation.control.mustLoop,
                animation.control.speedRatio,
                animation.control.from,
                animation.control.to,
                animation.control.isAdditive
            )
        }
    }

}