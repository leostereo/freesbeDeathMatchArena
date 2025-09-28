import { AnimationEnums, CharacterAnimationContainer, CharacterAnimationItem } from "@/shared/class/CharacterAnimationContainer";
import { CharacterState } from "@/shared/enums/CharacterState";
import { EventFrameEnum } from "@/shared/enums/EventFrameEnum";
import { AnimationGroup, Scene, AnimationEvent } from "@babylonjs/core";


export class AnimationManager {

    //Animations.
    private animationContainer: CharacterAnimationContainer;
    private idle_animation: CharacterAnimationItem;
    private running_animation: CharacterAnimationItem;
    private jump_animation: CharacterAnimationItem;
    private landing_from_jump_animation: CharacterAnimationItem;
    private throw_freesbe_animation: CharacterAnimationItem;
    private walking_back_animation: CharacterAnimationItem;

    private currentAnimation: CharacterAnimationItem | null;
    //events particular frames
    public lastAnimationFinishes = false;
    public releaseFreesbeParticles = false;
    public throwFreesbe = false;
    public jumpingImpulseIsOver = false;


    constructor(scene: Scene) {
        this.animationContainer = new CharacterAnimationContainer(undefined, scene);

        //#region animations
        this.idle_animation = this.animationContainer.getAnimationByName(AnimationEnums.idle);
        this.running_animation = this.animationContainer.getAnimationByName(AnimationEnums.run);
        this.jump_animation = this.animationContainer.getAnimationByName(AnimationEnums.jump);
        this.landing_from_jump_animation = this.animationContainer.getAnimationByName(AnimationEnums.landing_from_jump);
        this.throw_freesbe_animation = this.animationContainer.getAnimationByName(AnimationEnums.throw_freesbe);
        this.walking_back_animation = this.animationContainer.getAnimationByName(AnimationEnums.walking_backwards)

        this.bindNotificationEvents();

        //#endregion

    }

    private bindNotificationEvents = () => {
        this.landing_from_jump_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.landing_from_jump_animation.control?.to!, this.informFinishedAnimation, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.throw_freesbe_animation.control?.to!, this.informFinishedAnimation, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.THROW_FREESBE_PARTICLES, () => this.releaseFreesbeParticles = true, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.THROW_FREESBE_SHOOT, () => this.throwFreesbe = true, true));

        this.jump_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.JUMPING_IMPULSE_IS_OVER, () => this.jumpingImpulseIsOver = true, true));

    }

    private informFinishedAnimation = () => {
        this.lastAnimationFinishes = true;
    }

    public updateAnimation(state: CharacterState) {

        const currenAnimation = this.animationContainer.getCurrentPlayingAnimation();

        if (state === CharacterState.THROWING_FREESBE_GROUND && currenAnimation?.name !== this.throw_freesbe_animation.name) {
            this.playControlledAnimation(this.throw_freesbe_animation);
        }

        if (state === CharacterState.CLOSE_TO_LAND && currenAnimation?.name !== this.landing_from_jump_animation.name) {
            this.playControlledAnimation(this.landing_from_jump_animation);
        }

        if (state === CharacterState.START_JUMP) {
            this.playControlledAnimation(this.jump_animation);
            return;
        }

        if (state === CharacterState.WALKING_BACKWARDS && currenAnimation?.name !== this.walking_back_animation.name) {
            this.playInloopAnimation(this.walking_back_animation);
            return
        }

        if (state === CharacterState.IDLE && currenAnimation?.name !== this.idle_animation.name) {
            this.playInloopAnimation(this.idle_animation);
            return
        }

        if (state === CharacterState.RUNNING && currenAnimation?.name !== this.running_animation.name) {
            this.playInloopAnimation(this.running_animation);
            return
        }
    }

    private playInloopAnimation(animation: CharacterAnimationItem): void {
        this.animationContainer.getCurrentPlayingAnimation()?.animation.pause();
        this.currentAnimation = animation;
        this.lastAnimationFinishes = false;
        animation.animation.play(true);
    }

    private playControlledAnimation(animationItem: CharacterAnimationItem) {
        this.animationContainer.getCurrentPlayingAnimation()?.animation.stop();
        if (animationItem?.control) {
            this.currentAnimation = animationItem;
            this.lastAnimationFinishes = false;
            animationItem.animation.start(
                animationItem.control.mustLoop,
                animationItem.control.speedRatio,
                animationItem.control.from,
                animationItem.control.to,
                animationItem.control.isAdditive
            )
        }
    }
}