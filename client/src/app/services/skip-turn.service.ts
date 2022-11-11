import { Injectable } from '@angular/core';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
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
    shouldNotBeDisplayed: boolean;

    constructor(
        public gameSettingsService: GameSettingsService,
        private endGameService: EndGameService,
        private clientSocket: ClientSocketService,
        private playerService: PlayerService,
        private sendMessageService: SendMessageService,
    ) {
        this.receiveNewTurn();
        this.receiveTimer();
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

    receiveTimer(): void {
        this.clientSocket.socket.on('updateTimer', (minutes: number, seconds: number) => {
            this.minutes = minutes;
            this.seconds = seconds;
        });
    }

    switchAiTurn(): void {
        this.clientSocket.socket.on('switchAiTurn', (playerName: string) => {
            this.clientSocket.socket.emit('switchTurn', this.clientSocket.roomId, playerName);
        });
    }

    switchTurn(): void {
        this.checkEndGame();
        if (this.endGameService.isEndGame) return;
        if (this.playerService.currentPlayer.isTurn) this.shouldNotBeDisplayed = true;
        if (this.playerService.currentPlayer.isTurn) {
            this.shouldNotBeDisplayed = false;
            this.clientSocket.socket.emit('switchTurn', this.clientSocket.roomId, this.playerService.currentPlayer.name);
            this.playerService.currentPlayer.isTurn = false;
        }
    }

    checkEndGame(): void {
        if (this.endGameService.isEndGame) return;
        this.endGameService.checkEndGame();
        if (this.endGameService.isEndGame) {
            this.endGameService.getFinalScore(PLAYER_ONE_INDEX);
            this.endGameService.getFinalScore(PLAYER_TWO_INDEX);
            this.clientSocket.socket.emit('stopTimer', this.clientSocket.roomId);
            this.clientSocket.socket.emit('sendEasel', this.playerService.opponents[PLAYER_ONE_INDEX].letterTable, this.clientSocket.roomId);
            this.sendMessageService.displayFinalMessage(PLAYER_ONE_INDEX);
            this.sendMessageService.displayFinalMessage(PLAYER_TWO_INDEX);
            this.shouldNotBeDisplayed = true;
        }
    }
}
