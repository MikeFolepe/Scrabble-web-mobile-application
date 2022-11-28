/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RankingComponent } from '@app/pages/ranking/ranking.component';
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
            this.getFinalScore();
        });
    }

    getFinalScore(): void {
        this.playerService.players.sort((player1, player2) => player2.score - player1.score);

        const myIndex = this.playerService.players.findIndex((currentPlayer) => currentPlayer.name === this.playerService.currentPlayer.name);
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

        this.communicationService.updateXps(this.authService.currentUser._id, this.authService.currentUser.xpPoints).subscribe();
        const ref = this.dialog.open(RankingComponent, { disableClose: true });
        ref.afterClosed().subscribe(() => {
            this.leaveGame();
        });
    }

    clearAllData(): void {
        this.isEndGame = false;
    }

    leaveGame(): void {
        this.placeLetterService.ngOnDestroy();
        this.gridService.ngOnDestroy();
        this.playerService.clearPlayers();
        this.gameSettingsService.ngOnDestroy();
        this.router.navigate(['/home']);

        this.clearAllData();
    }
}
