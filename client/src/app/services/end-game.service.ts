import { Injectable } from '@angular/core';
import { NUMBER_OF_SKIP, PLAYER_AI_INDEX, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { DebugService } from '@app/services/debug.service';
import { PlayerScore } from '@common/player';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { GameSettingsService } from './game-settings.service';
// import { GridService } from './grid.service';
import { LetterService } from './letter.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    actionsLog: string[] = [];
    isEndGame: boolean = false;
    isEndGameByGiveUp = false;
    winnerNameByGiveUp = '';

    constructor(
        private httpServer: CommunicationService,
        public clientSocketService: ClientSocketService,
        public letterService: LetterService,
        public playerService: PlayerService,
        public debugService: DebugService,
        public gameSettingsService: GameSettingsService, // private gridService: GridService,
    ) {
        this.clearAllData();
        this.actionsLog = [];
        this.isEndGame = false;
        this.receiveEndGameFromServer();
        this.receiveActionsFromServer();
    }

    receiveEndGameFromServer(): void {
        this.clientSocketService.socket.on('receiveEndGame', (isEndGame: boolean) => {
            this.isEndGame = isEndGame;
        });
    }

    receiveActionsFromServer(): void {
        this.clientSocketService.socket.on('receiveActions', (actionsLog: string[]) => {
            this.actionsLog = actionsLog;
        });
    }

    getWinnerName(): string {
        if (this.playerService.players[PLAYER_ONE_INDEX].score > this.playerService.players[PLAYER_TWO_INDEX].score) {
            return this.playerService.players[PLAYER_ONE_INDEX].name;
        }
        if (this.playerService.players[PLAYER_ONE_INDEX].score < this.playerService.players[PLAYER_TWO_INDEX].score) {
            return this.playerService.players[PLAYER_TWO_INDEX].name;
        }
        return this.playerService.players[PLAYER_ONE_INDEX].name + '  ' + this.playerService.players[PLAYER_TWO_INDEX].name;
    }

    addActionsLog(actionLog: string): void {
        this.actionsLog.push(actionLog);
        this.clientSocketService.socket.emit('sendActions', this.actionsLog, this.clientSocketService.roomId);
    }

    checkEndGame(): void {
        this.isEndGame = this.isEndGameByActions() || this.isEndGameByEasel() || this.isEndGameByGiveUp;

        if (this.isEndGame) {
            this.clientSocketService.socket.emit('sendEndGame', this.isEndGame, this.clientSocketService.roomId);
        }
    }

    getFinalScore(indexPlayer: number): void {
        if (this.playerService.players[indexPlayer].score === 0) return;

        for (const letter of this.playerService.players[indexPlayer].letterTable) {
            this.playerService.players[indexPlayer].score -= letter.points;
            // Check if score decrease under 0 after substraction

            if (this.playerService.players[indexPlayer].score < 0) {
                this.playerService.players[indexPlayer].score = 0;
                break;
            }
        }
        // TODO: décommenter la ligne suivante si jamais le JV apparaît dans les classements
        // if (this.playerService.players[indexPlayer].name in AI_NAME_DATABASE) return;

        const players: PlayerScore[] = [];
        players[indexPlayer] = {
            score: this.playerService.players[indexPlayer].score,
            playerName: this.playerService.players[indexPlayer].name,
            isDefault: false,
        };
        this.httpServer.addPlayersScores(players, this.gameSettingsService.gameType).subscribe();
    }

    clearAllData(): void {
        this.playerService.players = [];
        // this.gridService.ngOnDestroy();
        // this.letterService.reserve = JSON.parse(JSON.stringify(RESERVE));
        this.isEndGameByGiveUp = false;
        this.winnerNameByGiveUp = '';
        this.isEndGame = false;
        this.actionsLog = [];
        this.debugService.debugServiceMessage = [];
    }

    isEndGameByActions(): boolean {
        if (this.actionsLog.length < NUMBER_OF_SKIP) {
            return false;
        }
        const lastIndex = this.actionsLog.length - 1;
        for (let i = lastIndex; i > lastIndex - NUMBER_OF_SKIP; i--) {
            if (this.actionsLog[i] !== 'passer') {
                return false;
            }
        }
        return true;
    }

    isEndGameByEasel(): boolean {
        return (
            this.letterService.reserveSize === 0 &&
            (this.playerService.isEaselEmpty(PLAYER_ONE_INDEX) || this.playerService.isEaselEmpty(PLAYER_AI_INDEX))
        );
    }
}
