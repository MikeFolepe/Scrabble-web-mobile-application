import { Level } from '@common/level';

export enum StartingPlayer {
    Player1,
    Player2,
}

export class GameSettings {
    constructor(
        public playersNames: string[],
        public startingPlayer: StartingPlayer,
        public timeMinute: string,
        public timeSecond: string,
        public level: Level,
        public randomBonus: string,
        public bonusPositions: string,
        public dictionary: string,
        public objectiveIds: number[][] = [[], []],
    ) {}
}
