import { AiType } from './ai-name';

export enum StartingPlayer {
    Player1,
    Player2,
}

export enum RoomType {
    public,
    private,
}

export class GameSettings {
    constructor(
        public creatorName: string,
        public startingPlayer: StartingPlayer,
        public timeMinute: string,
        public timeSecond: string,
        public level: AiType,
        public dictionary: string,
        public type: RoomType,
    ) {}
}
