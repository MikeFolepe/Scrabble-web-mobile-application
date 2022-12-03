/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RankingComponent } from '@app/pages/ranking/ranking.component';
import { NumberOfPlayer } from '@common/game-settings';
import { GameDB } from '@common/user-stats';
import { AuthService } from './auth.service';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { GameSettingsService } from './game-settings.service';
import { GridService } from './grid.service';
import { LetterService } from './letter.service';
import { PlaceLetterService } from './place-letter.service';
import { PlayerService } from './player.service';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    isEndGame: boolean = false;

    constructor(
        public clientSocketService: ClientSocketService,
        public letterService: LetterService,
        public playerService: PlayerService,
        private authService: AuthService,
        private userService: UserService,
        private communicationService: CommunicationService,
        private router: Router,
        private placeLetterService: PlaceLetterService,
        private gridService: GridService,
        private dialog: MatDialog,
        private gameSettingsService: GameSettingsService,
    ) {
        this.clearAllData();
        this.receiveEndGameFromServer();
        this.leave();
    }

    receiveEndGameFromServer(): void {
        this.clientSocketService.socket.on('receiveEndGame', (winnerName: string, startDate: string, startTime: string) => {
            this.isEndGame = true;
            console.log('winner', winnerName);
            console.log('user');

            const newGame = new GameDB(startDate, startTime, winnerName);
            this.communicationService.addNewGameToStats(newGame, this.authService.currentUser._id).subscribe();
            this.communicationService.updateTotalPoints(this.authService.currentUser._id, this.playerService.currentPlayer.score).subscribe();
            if (this.authService.currentUser.pseudonym === winnerName) {
                console.log('winner');
                const gamesWon = this.userService.userStats.gamesWon + 1;
                this.communicationService.updateGamesWon(this.authService.currentUser._id, gamesWon).subscribe();
            }
            this.getFinalScore();
        });
    }

    getFinalScore(): void {
        this.playerService.players.sort((player1, player2) => player2.score - player1.score);

        const myIndex = this.playerService.players.findIndex((currentPlayer) => currentPlayer.name === this.playerService.currentPlayer.name);

        if (this.clientSocketService.currentRoom.gameSettings.gameType === NumberOfPlayer.OneVone) {
            switch (myIndex) {
                case 0: {
                    this.authService.currentUser.xpPoints += 50;
                    break;
                }
                case 1: {
                    this.authService.currentUser.xpPoints += 10;
                    break;
                }
                default: {
                    break;
                }
            }
        } else {
            switch (myIndex) {
                case 0: {
                    this.authService.currentUser.xpPoints += 75;
                    break;
                }
                case 1: {
                    this.authService.currentUser.xpPoints += 40;
                    break;
                }
                case 2: {
                    this.authService.currentUser.xpPoints += 25;
                    break;
                }
                case 3: {
                    this.authService.currentUser.xpPoints += 10;
                    break;
                }
                default: {
                    break;
                }
            }
        }

        this.communicationService.updateXps(this.authService.currentUser._id, this.authService.currentUser.xpPoints).subscribe();
        const ref = this.dialog.open(RankingComponent, { disableClose: true });
        ref.afterClosed().subscribe(() => {
            this.leaveGame();
            this.router.navigate(['/home']);
        });
    }

    clearAllData(): void {
        this.isEndGame = false;
    }

    leave(): void {
        this.clientSocketService.socket.on('leave', () => {
            this.leaveGame();
            this.router.navigate(['home']);
        });
    }

    leaveGame(): void {
        this.placeLetterService.ngOnDestroy();
        this.gridService.ngOnDestroy();
        this.playerService.clearPlayers();
        this.gameSettingsService.ngOnDestroy();
        this.clearAllData();
    }
}
