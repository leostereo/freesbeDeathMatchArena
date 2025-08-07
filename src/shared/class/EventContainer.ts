import { GameEvent } from "../types/CharacterTypes";

export class EventContainer {

    private eventsQueue: GameEvent[] = [];

    constructor(){

    }

    public getLastEvent():GameEvent|null{
        return this.eventsQueue.pop() ?? null;
    }

    public pushEvent(event:GameEvent):void{
        this.eventsQueue.push(event);
    }

}