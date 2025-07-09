import { Scene, Vector3 } from "@babylonjs/core";
import { DummyTarget } from "./classes/DummyTarget";

export class EnemySpawnClass {

    protected scene:Scene
    private dummyTarjets:DummyTarget[];

    
    constructor(scene:Scene){
        
        const dumyTargetPositions : Vector3[] =[
            
            // new Vector3(1,50,4),
            new Vector3(-34,1,-17),
            new Vector3(-23,10,2),
            new Vector3(8,10,26),
            new Vector3(13,10,-1),
            new Vector3(13,12,31),
            new Vector3(-23,10,2),
            new Vector3(18,10,26),
            new Vector3(13,10,-10),
        ]

        dumyTargetPositions.forEach((position,index)=>{
            const dummyTarget = new DummyTarget(scene,position,index);
            
        })

    }

}