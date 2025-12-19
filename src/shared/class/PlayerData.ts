import { Color3, Vector3 } from "@babylonjs/core";

export interface IPlayerData {
    initPosition: Vector3;
    color: Color3;
    name: string;
    up: 'w' | 'ArrowUp';
    down: 's' | 'ArrowDown';
    left: 'a' | 'ArrowLeft';
    right: 'd' | 'ArrowRight';
    throw: 'c' | 'i';
    jump: 'v' | 'o';
    roll: 'b' | 'p';
}

export class Player1Data implements IPlayerData {
    initPosition = new Vector3(0, 10, 10);
    color = new Color3(1,0,0);
    up: "w" | "ArrowUp";
    left: "a" | "ArrowLeft";
    right: "d" | "ArrowRight";
    down: "s" | "ArrowDown";
    throw: "c" | "i";
    jump: "v" | "o";
    roll: "b" | "p";
    name: string;

    constructor() {
        this.up = "ArrowUp";
        this.down = "ArrowDown";
        this.left = "ArrowLeft";
        this.right = "ArrowRight";
        this.throw = "i";
        this.jump = "o";
        this.roll = "p";
        this.name = 'player1'
    }

}

export class Player2Data implements IPlayerData {
    initPosition = new Vector3(0, 10, -10);
    color = new Color3(0,1,0);
    up: "w" | "ArrowUp";
    left: "a" | "ArrowLeft";
    right: "d" | "ArrowRight";
    throw: "c" | "i";
    jump: "v" | "o";
    roll: "b" | "p";
    down: "s" | "ArrowDown";
    name: string;


    constructor() {
        this.up = "w";
        this.down = "s";
        this.left = "a";
        this.right = "d";
        this.throw = "c";
        this.jump = "v";
        this.roll = "b";
        this.name = 'player2'
    }

}

