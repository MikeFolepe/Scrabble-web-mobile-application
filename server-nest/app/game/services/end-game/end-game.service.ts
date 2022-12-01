import { Player } from '@app/game/models/player.model';

export class EndGameService {
    isEndGame: boolean;
    isEndGameByGiveUp = false;
    gameStartDate: string;
    gameStartTime: string;
    startTimeMS: number;
    endTimeMs: number;

    constructor() {
        this.isEndGame = false;
    }

    getWinnerName(players: Player[]): string {
        const maxScore = players[0].score;
        let name = players[0].name;
        for (const player of players) {
            if (player.score >= maxScore) {
                name = player.name;
            }
        }
        return name;
    }
    checkEndGame(reserveSize: number): void {
        this.isEndGame = this.isEndGameByEasel(reserveSize) || this.isEndGameByGiveUp;
    }

    isEndGameByEasel(reserveSize: number): boolean {
        return reserveSize === 0;
    }

    computeTotalTime(): number {
        return this.endTimeMs - this.startTimeMS;
    }

    initStartGame() {
        this.gameStartDate = new Date().getFullYear().toString() + '/' + new Date().getMonth().toString() + '/' + new Date().getDate().toString();
        this.gameStartTime =
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');
    }

    initStartTime() {
        this.startTimeMS = Date.now();
    }

    initEndTime() {
        this.endTimeMs = Date.now();
    }
}
