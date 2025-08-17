import { Vector3 } from "@babylonjs/core";

export type CharacterOrientationInfo = {
    position: Vector3;
    pointingVector: Vector3;
}

export type EventType = 'freesbehit' | 'itemPickUp' | 'hasWon' | 'hasLoosed'

export type FreesbeHitEvent = {
    target:string;
    shooter:string;
    damage:number;
}

export type ItemPickUpEvent = {
    target:string;
    shooter:string;
    damage:string;
}
export type GameEvent = {
    eventType:EventType|null;
    eventData:FreesbeHitEvent|ItemPickUpEvent|null;
}