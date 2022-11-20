import { Player } from '@app/game/models/player.model';
import { GameSettings } from '@common/game-settings';

export class SkipTurnService {
    minutes: number;
    seconds: number;
    intervalID: NodeJS.Timeout;

    startMinutes: number;
    startSeconds: number;

    players: Player[];
    activePlayerIndex: number;
    gameSettings: GameSettings;

    constructor(gameSettings: GameSettings) {
        this.startMinutes = parseInt(gameSettings.timeMinute, 10);
        this.startSeconds = parseInt(gameSettings.timeSecond, 10);

        this.gameSettings = gameSettings;
    }

    initializeTimer() {
        this.minutes = this.startMinutes;
        this.seconds = this.startSeconds;
    }

    stopTimer() {
        clearInterval(this.intervalID);
        this.minutes = 0;
        this.seconds = 0;
    }

    findStartingPlayerIndex(players: Player[]) {
        this.activePlayerIndex = players.findIndex((curPlayer) => this.gameSettings.creatorName === curPlayer.name);
    }
}
