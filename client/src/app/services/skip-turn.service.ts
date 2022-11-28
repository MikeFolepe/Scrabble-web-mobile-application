import { Injectable } from '@angular/core';
import { PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { Subject } from 'rxjs';
import { EndGameService } from './end-game.service';
import { PlayerService } from './player.service';
import { SendMessageService } from './send-message.service';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    minutes: number;
    seconds: number;
    activeSound: Subject<boolean>;
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
        this.activeSound = new Subject();
    }

    receiveNewTurn(): void {
        this.clientSocket.socket.on('turnSwitched', (playerName: string) => {
            if (playerName === this.playerService.currentPlayer.name) {
                this.playerService.currentPlayer.isTurn = true;
                this.activeSound.next(this.playerService.currentPlayer.isTurn);
            }
            const index = this.playerService.players.findIndex((playerC) => playerC.name === playerName);
            this.playerService.players[index].isTurn = true;
        });

        this.clientSocket.socket.on('updatePlayerTurnToFalse', (playerName: string) => {
            if (playerName === this.playerService.currentPlayer.name) {
                this.playerService.currentPlayer.isTurn = false;
            }
            const index = this.playerService.players.findIndex((playerC) => playerC.name === playerName);
            this.playerService.players[index].isTurn = false;
        });
    }

    receiveTimer(): void {
        this.clientSocket.socket.on('updateTimer', (minutes: number, seconds: number) => {
            this.minutes = minutes;
            this.seconds = seconds;
        });
    }

    switchAiTurn(): void {
        this.clientSocket.socket.on('switchAiTurn', () => {
            this.clientSocket.socket.emit('switchTurn', this.clientSocket.currentRoom.id);
        });
    }

    switchTurn(): void {
        this.checkEndGame();
        if (this.endGameService.isEndGame) return;
        if (this.playerService.currentPlayer.isTurn) this.shouldNotBeDisplayed = true;
        if (this.playerService.currentPlayer.isTurn) {
            console.log('turrrrrrrnnnnnn');
            this.shouldNotBeDisplayed = false;
            this.clientSocket.socket.emit('switchTurn', this.clientSocket.currentRoom.id);
            this.playerService.currentPlayer.isTurn = false;
        }
    }

    checkEndGame(): void {
        if (this.endGameService.isEndGame) return;
        this.endGameService.checkEndGame();
        if (this.endGameService.isEndGame) {
            this.endGameService.getFinalScore(PLAYER_ONE_INDEX);
            this.endGameService.getFinalScore(PLAYER_TWO_INDEX);
            this.clientSocket.socket.emit('stopTimer', this.clientSocket.currentRoom.id);
            this.clientSocket.socket.emit('sendEasel', this.playerService.opponents[PLAYER_ONE_INDEX].letterTable, this.clientSocket.currentRoom.id);
            this.sendMessageService.displayFinalMessage(PLAYER_ONE_INDEX);
            this.sendMessageService.displayFinalMessage(PLAYER_TWO_INDEX);
            this.shouldNotBeDisplayed = true;
        }
    }
}
