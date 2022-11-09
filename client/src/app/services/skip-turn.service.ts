import { Injectable } from '@angular/core';
import { ONE_SECOND_DELAY, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { EndGameService } from './end-game.service';
import { PlayerService } from './player.service';
import { SendMessageService } from './send-message.service';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    minutes: number;
    seconds: number;
    // JUSTIFICATION : Next line is mandatory, NodeJS return an eslint issue
    // eslint-disable-next-line no-undef
    intervalID: NodeJS.Timeout;
    shouldNotBeDisplayed: boolean;

    constructor(
        public gameSettingsService: GameSettingsService,
        private endGameService: EndGameService,
        private clientSocket: ClientSocketService,
        private playerService: PlayerService,
        private sendMessageService: SendMessageService,
    ) {
        this.receiveNewTurn();
        this.receiveStartFromServer();
        this.receiveStopFromServer();
        this.switchAiTurn();
        this.shouldNotBeDisplayed = false;
    }

    receiveNewTurn(): void {
        this.clientSocket.socket.on('turnSwitched', (playerName: string) => {
            if (playerName === this.playerService.currentPlayer.name) {
                this.playerService.currentPlayer.isTurn = true;
            } else {
                const curPlayer = this.playerService.opponents.find((playerC) => playerC.name === playerName) as Player;
                curPlayer.isTurn = true;
            }
        });

        this.clientSocket.socket.on('updatePlayerTurnToFalse', (playerName: string) => {
            if (playerName === this.playerService.currentPlayer.name) {
                this.playerService.currentPlayer.isTurn = false;
            } else {
                const curPlayer = this.playerService.opponents.find((playerC) => playerC.name === playerName) as Player;
                curPlayer.isTurn = false;
            }
        });
    }

    receiveStartFromServer(): void {
        this.clientSocket.socket.on('startTimer', () => {
            this.stopTimer();
            this.startTimer();
        });
    }
    receiveStopFromServer(): void {
        this.clientSocket.socket.on('stopTimer', () => {
            this.stopTimer();
        });
    }

    switchAiTurn(): void {
        this.clientSocket.socket.on('switchAiTurn', (playerName: string) => {
            this.clientSocket.socket.emit('switchTurn', this.clientSocket.currentRoom.id, playerName);
        });
    }

    switchTurn(): void {
        this.checkEndGame();
        if (this.endGameService.isEndGame) return;
        if (this.playerService.currentPlayer.isTurn) this.shouldNotBeDisplayed = true;
        this.stopTimer();
        if (this.playerService.currentPlayer.isTurn) {
            setTimeout(() => {
                this.shouldNotBeDisplayed = false;
                this.clientSocket.socket.emit('switchTurn', this.clientSocket.currentRoom.id, this.playerService.currentPlayer.name);
            }, ONE_SECOND_DELAY);
        }
    }

    startTimer(): void {
        this.minutes = parseInt(this.clientSocket.currentRoom.gameSettings.timeMinute, 10);
        this.seconds = parseInt(this.clientSocket.currentRoom.gameSettings.timeSecond, 10);

        this.intervalID = setInterval(() => {
            if (this.seconds === 0 && this.minutes !== 0) {
                this.minutes = this.minutes - 1;
                this.seconds = 59;
            } else if (this.seconds === 0 && this.minutes === 0) {
                if (this.playerService.currentPlayer.isTurn) {
                    this.endGameService.actionsLog.push('AucuneAction');
                    this.clientSocket.socket.emit('sendActions', this.endGameService.actionsLog, this.clientSocket.currentRoom.id);
                    this.switchTurn();
                }
            } else {
                this.seconds = this.seconds - 1;
            }
        }, ONE_SECOND_DELAY);
    }

    stopTimer(): void {
        clearInterval(this.intervalID);
        this.minutes = 0;
        this.seconds = 0;
    }
    checkEndGame(): void {
        if (this.endGameService.isEndGame) return;
        this.endGameService.checkEndGame();
        if (this.endGameService.isEndGame) {
            this.endGameService.getFinalScore(PLAYER_ONE_INDEX);
            this.endGameService.getFinalScore(PLAYER_TWO_INDEX);
            this.stopTimer();
            this.clientSocket.socket.emit('sendEasel', this.playerService.opponents[PLAYER_ONE_INDEX].letterTable, this.clientSocket.currentRoom.id);
            this.sendMessageService.displayFinalMessage(PLAYER_ONE_INDEX);
            this.sendMessageService.displayFinalMessage(PLAYER_TWO_INDEX);
            this.shouldNotBeDisplayed = true;
        }
    }
}
