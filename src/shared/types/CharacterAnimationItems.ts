import { AnimationGroup } from "@babylonjs/core";

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
    sprinting_roll = "SPRINTING_ROLL",
    death_from_back_headshoot = "DEATH_FROM_BACK_HEADSHOOT",
    head_hit = "HEAD_HIT",
    dying = 'DYING',
    has_won = 'HAS_WON'
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