import { GameSettings } from '@common/game-settings';
import { User } from '@common/user';
import { ChatRoomMessage } from './chatRoomMessage';
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
    observers: User[];
    roomMessages: ChatRoomMessage[];

    constructor(
        id: string,
        gameSettings: GameSettings,
        state: State,
        socketIds: string[],
        aiNumber: number,
        humanNumber: number,
        observers: User[],
        roomMessages: ChatRoomMessage[],
    ) {
        this.id = id;
        this.gameSettings = gameSettings;
        this.state = state;
        this.socketIds = socketIds;
        this.aiPlayersNumber = aiNumber;
        this.humanPlayersNumber = humanNumber;
        this.observers = observers;
        this.roomMessages = roomMessages;
    }
}
