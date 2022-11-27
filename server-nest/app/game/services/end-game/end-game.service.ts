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
    checkEndGame(players: Player[]): void {
        this.isEndGame = this.isEndGameByEasel(players) || this.isEndGameByGiveUp;
    }

    isEndGameByEasel(players: Player[]): boolean {
        for (const player of players) {
            if (player.letterTable.length !== 0) {
                return false;
            }
        }

        return true;
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
