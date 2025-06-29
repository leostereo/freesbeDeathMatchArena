import { AnimationGroup, Vector3 } from "@babylonjs/core";
import { AnimationEnums, CharacterAnimationContainer, CharacterAnimationItem } from "./CCAContainer";

export class CharacterControllerAnimationManager {

    private animationContainer: CharacterAnimationContainer;
    protected currentAnimation: CharacterAnimationItem;
    protected prevAnimation: CharacterAnimationItem;

    constructor(animationContainer: CharacterAnimationContainer) {

        this.animationContainer = animationContainer;
        this.currentAnimation = this.animationContainer.getAnimationByName(AnimationEnums.idle);

    }

    public updateAnimationFromKeyBoard(throwFreesbe: boolean, crossPunch: boolean): void {

        if (throwFreesbe && this.currentAnimation.name !== AnimationEnums.throw_freesbe) {
            const animation = this.animationContainer.getAnimationByName(AnimationEnums.throw_freesbe);
            animation.latched = true;
            this.playControlledAnimation(animation);
            return;
        }

        if (crossPunch && this.currentAnimation.name !== AnimationEnums.cross_punch) {
            this.playControlledAnimation(this.animationContainer.getAnimationByName(AnimationEnums.cross_punch))
            return;
        }

        // if (!throwFreesbe && this.currentAnimation.name === AnimationEnums.throw_freesbe) {
        //     this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.idle))
        //     return
        // }

        if (!crossPunch && this.currentAnimation.name === AnimationEnums.cross_punch) {
            this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.idle))
            return
        }
    }

    public updateAnimationFromVelocity(velocityVector: Vector3): void {

        if (this.animationContainer.isAnyAnimationLatched()) return;

        if (velocityVector._y > -15 && this.currentAnimation.name === AnimationEnums.falling_flat) {
            this.playControlledAnimation(this.animationContainer.getAnimationByName(AnimationEnums.falling_impact));
            return;
        }

        if (velocityVector._y > 2 && this.currentAnimation.name !== AnimationEnums.falling_idle) {
            this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.falling_idle));
            return;
        }

        if (velocityVector._y < -35) {
            if (this.currentAnimation.name === AnimationEnums.falling_flat) return;
            this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.falling_flat));
            return;
        }

        if (velocityVector._y < -15 && this.currentAnimation.name !== AnimationEnums.falling_idle) {
            this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.falling_idle));
            return;
        }

        if ((Math.abs(velocityVector._x) > 29 || Math.abs(velocityVector._z) > 29) && velocityVector._y === 0) {
            if (this.currentAnimation.name === AnimationEnums.run_fast) return;
            this.playAnimationLoop(this.animationContainer.getAnimationByName(AnimationEnums.run_fast))
            return;
        }

        if ((Math.abs(velocityVector._x) > 20 || Math.abs(velocityVector._z) > 20) && velocityVector._y === 0) {
            if (this.currentAnimation.name === AnimationEnums.run) return;

            this.playAnimationLoop(
                this.animationContainer.getAnimationByName(AnimationEnums.run)
            )

            return;
        }

        if ((Math.abs(velocityVector._x) > 2 || Math.abs(velocityVector._z) > 2) && velocityVector._y === 0) {
            if (this.currentAnimation.name === AnimationEnums.walk) {
                return;
            }

            this.playAnimationLoop(
                this.animationContainer.getAnimationByName(AnimationEnums.walk)
            )
            return
        }

        if ((Math.abs(velocityVector._x) >= 0 || Math.abs(velocityVector._z) >= 0) && velocityVector._y === 0) {

            if (this.currentAnimation.name === AnimationEnums.idle || this.currentAnimation.name === AnimationEnums.falling_impact) return;

            this.playAnimationLoop(
                this.animationContainer.getAnimationByName(AnimationEnums.idle)
            )

            return
        }

    }

    private playAnimationLoop(animation: CharacterAnimationItem): void {
        this.animationContainer.getPlayingAnimations()?.animation.stop();
        this.currentAnimation = animation
        this.currentAnimation.animation.play(true);
    }

    private playControlledAnimation(animation: CharacterAnimationItem) {
        this.animationContainer.getPlayingAnimations()?.animation.stop();
        if (animation.control) {
            animation.animation.start(
                animation.control.mustLoop,
                animation.control.speedRatio,
                animation.control.from,
                animation.control.to,
                animation.control.isAdditive
            )
        }
        this.currentAnimation = animation
    }


}