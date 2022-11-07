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
    aiPlayersNumber: number;
    humanPlayersNumber: number;

    constructor(id: string, gameSettings: GameSettings, state: State, socketIds: string[], aiNumber: number, humanNumber: number) {
        this.id = id;
        this.gameSettings = gameSettings;
        this.state = state;
        this.socketIds = socketIds;
        this.aiPlayersNumber = aiNumber;
        this.humanPlayersNumber = humanNumber;
    }
}
