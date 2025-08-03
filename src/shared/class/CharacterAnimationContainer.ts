import { AnimationGroup, Scene } from "@babylonjs/core";

export enum AnimationEnums {
    idle = "IDLE",
    walk = "WALK",
    run = "RUN",
    run_fast = "RUN_FAST",
    jump = "JUMP",
    run_jump = "RUN_JUMP",
    throw_freesbe = "THROW_FREESBE",
    falling_flat = "IS_FALLING_FLAT",
    falling_impact = "IS_FALLING_FLAT_IMPACT",
    falling_idle = "IS_FALLING_IDLE",
    cross_punch = "CROSS_PUNCH",
    landing_from_jump = "LANDING_FROM_JUMP",
    baseball_pitch = "BASEBALL_PITCH",
    sprinting_roll = "SPRINTING_ROLL"
}


export type AnimationPlayControllOptions = {
    mustLoop: boolean;
    speedRatio: number;
    from: number;
    to: number
    isAdditive: boolean;
}

export type CharacterAnimationItem = {
    animation: AnimationGroup;
    name: AnimationEnums;
    latched: boolean;
    currentlyPlay: boolean;
    control?: AnimationPlayControllOptions;
}

export class CharacterAnimationContainer {

    private characterAnimationGroup: AnimationGroup[];
    private characterAnimationVector: CharacterAnimationItem[] = [];
    private scene: Scene;
    private prefix: string;

    constructor(animationGroup: AnimationGroup[], prefix: string, scene: Scene) {
        this.characterAnimationGroup = animationGroup;
        this.prefix = prefix;
        this.scene = scene;
        this.characterAnimationVectorInit();
    }

    private characterAnimationVectorInit() {

        const idleAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_idle`)
        if (idleAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: idleAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.idle
            }
            this.characterAnimationVector.push(animationItem);
        }

        const walkAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_walking`)
        if (walkAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: walkAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.walk
            }
            this.characterAnimationVector.push(animationItem);
        }

        const runAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_slow running`)
        if (runAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: runAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.run
            }
            this.characterAnimationVector.push(animationItem);
        }

        const runFastAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_fast running`)
        if (runFastAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: runFastAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.run_fast
            }
            this.characterAnimationVector.push(animationItem);
        }

        const freesbeAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_fresbe throw`)
        if (freesbeAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: freesbeAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.throw_freesbe,
                control: {
                    from: 50,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 2.2,
                    to: 160
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        const fallingIdleAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_falling idle`)
        if (fallingIdleAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: fallingIdleAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.falling_idle
            }
            this.characterAnimationVector.push(animationItem);
        }

        const fallingFlatAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_falling impact`)
        if (fallingFlatAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: fallingFlatAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.falling_flat
            }
            this.characterAnimationVector.push(animationItem);
        }
        const fallingFlatImpactAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_falling flat impact`)
        if (fallingFlatImpactAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: fallingFlatImpactAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.falling_impact,
                control: {
                    from: 20,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 1,
                    to: 95
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        const crossPunchAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_cross punch`)
        if (crossPunchAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: crossPunchAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.cross_punch,
                control: {
                    from: 1,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 1.6,
                    to: 122
                }
            }
            this.characterAnimationVector.push(animationItem);
        }
        const jumpUpAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_jump up`)
        if (jumpUpAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: jumpUpAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.jump,
                control: {
                    from: 1,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 1.8,
                    to: 52
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        const jumpAndRunAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_running and jump`)
        if (jumpAndRunAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: jumpAndRunAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.run_jump,
                control: {
                    from: 1,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 1.2,
                    to: 62
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        const landingFromJumpAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_landing`)
        if (landingFromJumpAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: landingFromJumpAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.landing_from_jump,
                control: {
                    from: 25,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 2.2,
                    to: 100
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        const baseBallPitchJumpAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_baseball pitch`)
        if (baseBallPitchJumpAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: baseBallPitchJumpAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.baseball_pitch,
                control: {
                    from: 90,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 2.4,
                    to: 140
                }
            }
            this.characterAnimationVector.push(animationItem);
        }
        
        const sptrintingRollAnimation = this.scene.getAnimationGroupByName(`${this.prefix}_sprinting roll`)
        if (sptrintingRollAnimation) {
            let animationItem: CharacterAnimationItem = {
                animation: sptrintingRollAnimation,
                latched: false,
                currentlyPlay: false,
                name: AnimationEnums.sprinting_roll,
                control: {
                    from: 1,
                    isAdditive: false,
                    mustLoop: false,
                    speedRatio: 2.4,
                    to: 72
                }
            }
            this.characterAnimationVector.push(animationItem);
        }

        // this.CROSS_PUNCH = scene.getAnimationGroupByName('cross punch');

    }

    public getCurrentPlayingAnimation() {
        return this.characterAnimationVector.find((item) => item.animation.isPlaying)
    }

    public getAnimationByName(name: AnimationEnums): CharacterAnimationItem {
        const animationItem = this.characterAnimationVector.find((animation) => animation.name === name) as CharacterAnimationItem
        return animationItem;
    }

    public isAnyAnimationLatched(): boolean {
        return this.characterAnimationVector.some((animation) => animation.latched);
    }

    public getLatchedAnimation(): CharacterAnimationItem | null {
        return this.characterAnimationVector.find((animation) => animation.latched) ?? null;
    }

    public clearAllLatch():void{
        const latchedAnimation = this.characterAnimationVector.filter((animation)=>animation.latched);
        latchedAnimation.forEach(animation => {
            animation.latched = false;
        });
    }

}