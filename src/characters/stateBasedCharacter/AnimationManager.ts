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
    private throw_freesbe_in_air_animation: CharacterAnimationItem;
    private walking_back_animation: CharacterAnimationItem;
    private in_air_animation: CharacterAnimationItem;
    private roll_animation: CharacterAnimationItem;
    private crash_animation: CharacterAnimationItem;

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
        this.throw_freesbe_in_air_animation = this.animationContainer.getAnimationByName(AnimationEnums.baseball_pitch);
        this.walking_back_animation = this.animationContainer.getAnimationByName(AnimationEnums.walking_backwards)
        this.in_air_animation = this.animationContainer.getAnimationByName(AnimationEnums.falling_idle);
        this.roll_animation = this.animationContainer.getAnimationByName(AnimationEnums.sprinting_roll); 
        this.crash_animation = this.animationContainer.getAnimationByName(AnimationEnums.falling_impact);

        this.bindNotificationEvents();

        //#endregion

    }

    private bindNotificationEvents = () => {
        this.landing_from_jump_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.landing_from_jump_animation.control?.to!, this.informFinishedAnimation, true));

        this.crash_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.crash_animation.control?.to!, this.informFinishedAnimation, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.throw_freesbe_animation.control?.to!, this.informFinishedAnimation, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.THROW_FREESBE_PARTICLES, () => this.releaseFreesbeParticles = true, true));

        this.throw_freesbe_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.THROW_FREESBE_SHOOT, () => this.throwFreesbe = true, true));

        this.jump_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.JUMPING_IMPULSE_IS_OVER, () => {
                this.jumpingImpulseIsOver = true;
                this.playInloopAnimation(this.in_air_animation);
            }, true));

        this.throw_freesbe_in_air_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.throw_freesbe_in_air_animation.control?.to!, this.informFinishedAnimation, true));

        this.throw_freesbe_in_air_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(EventFrameEnum.THROW_FREESBE_IN_AIR_SHOOT, () => this.throwFreesbe = true, true));

        this.roll_animation.animation.targetedAnimations[0].animation.addEvent(
            new AnimationEvent(this.roll_animation.control?.to!, this.informFinishedAnimation, true));

    }

    private informFinishedAnimation = () => {
        this.lastAnimationFinishes = true;
    }


    public updateAnimation(state: CharacterState) {
        const currenAnimation = this.animationContainer.getCurrentPlayingAnimation();

        if(state === CharacterState.ROLLING && currenAnimation?.name !== this.roll_animation.name){
            this.playControlledAnimation(this.roll_animation)
        }

        if (state === CharacterState.THROWING_FREESBE_IN_AIR && currenAnimation?.name !== this.throw_freesbe_in_air_animation.name) {
            this.playControlledAnimation(this.throw_freesbe_in_air_animation);
        }

        if (state === CharacterState.THROWING_FREESBE_GROUND && currenAnimation?.name !== this.throw_freesbe_animation.name) {
            this.playControlledAnimation(this.throw_freesbe_animation);
        }

        if (state === CharacterState.CLOSE_TO_CRASH && currenAnimation?.name !== this.crash_animation.name) {
            this.playControlledAnimation(this.crash_animation);
        }

        if (state === CharacterState.CLOSE_TO_LAND && currenAnimation?.name !== this.landing_from_jump_animation.name) {
            this.playControlledAnimation(this.landing_from_jump_animation);
        }

        //jump
        if (state === CharacterState.START_JUMP && currenAnimation?.name !== this.jump_animation.name) {
            this.currentAnimation = this.jump_animation;
            this.playControlledAnimation(this.jump_animation);
            return;
        }

        
        if(state === CharacterState.FALLING  && currenAnimation?.name !== this.in_air_animation.name ){
            
                this.playInloopAnimation(this.in_air_animation);
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
        this.currentAnimation = animationItem;
        if (animationItem?.control) {
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