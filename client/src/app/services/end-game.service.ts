/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { PlayerScore } from '@common/player';
import { GameDB } from '@common/user-stats';
import { AuthService } from './auth.service';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { LetterService } from './letter.service';
import { PlayerService } from './player.service';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    actionsLog: string[] = [];
    isEndGame: boolean = false;
    isEndGameByGiveUp = false;
    winnerNameByGiveUp = '';
    playersScores: PlayerScore[] = [];

    constructor(
        public clientSocketService: ClientSocketService,
        public letterService: LetterService,
        public playerService: PlayerService,
        private authService: AuthService,
        private userService: UserService,
        private communicationService: CommunicationService,
    ) {
        this.clearAllData();
        this.actionsLog = [];
        this.isEndGame = false;
        this.receiveEndGameFromServer();
    }

    receiveEndGameFromServer(): void {
        this.clientSocketService.socket.on('receiveEndGame', (winnerName: string, startDate: string, startTime: string) => {
            this.isEndGame = true;

            const newGame = new GameDB(startDate, startTime, winnerName);
            this.communicationService.addNewGameToStats(newGame, this.authService.currentUser._id).subscribe();
            this.communicationService
                .updateTotalPoints(this.authService.currentUser._id, this.playerService.currentPlayer.score + this.userService.userStats.totalPoints)
                .subscribe();
            if (this.playerService.currentPlayer.name === winnerName) {
                this.communicationService.updateGamesWon(this.authService.currentUser._id, this.userService.userStats.gamesWon++).subscribe();
            }
        });
    }

    getFinalScore(): void {
        this.playerService.players.sort((player1, player2) => player1.score - player2.score);
    }

    clearAllData(): void {
        this.playerService.opponents = [];
        this.isEndGameByGiveUp = false;
        this.winnerNameByGiveUp = '';
        this.isEndGame = false;
        this.actionsLog = [];
    }
}
