import { GameSettings } from '@common/game-settings';
export enum State {
    Playing,
    Waiting,
    Finish,
}

export class Room {
    id: string;
    gameSettings: GameSettings;
    state: State;
    socketIds: string[];

    constructor(id: string, gameSettings: GameSettings, state: State, socketIds: string[]){
        this.id = id;
        this.gameSettings = gameSettings;
        this.state = state;
        this.socketIds = socketIds;
    }
}
