import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND_DELAY, TWO_SECOND_DELAY } from '@app/classes/constants';
import { JoiningConfirmationDialogComponent } from '@app/modules/initialize-game/joining-confirmation-dialog/joining-confirmation-dialog.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { PlayerService } from '@app/services/player.service';
import { ERROR_MESSAGE_DELAY } from '@common/constants';
import { User } from '@common/user';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    status: string;
    isWaiting: boolean;
    shouldDisplayStartError: boolean;

    constructor(
        private router: Router,
        private gameSettingsService: GameSettingsService,
        private clientSocket: ClientSocketService,
        public playerService: PlayerService,
        private dialog: MatDialog,
        private clientSocketService: ClientSocketService,
    ) {
        this.status = '';
        this.isWaiting = true;
        this.clientSocket.routeToGameView();
    }

    ngOnInit(): void {
        this.playAnimation();
        this.acceptNewPlayer();
    }

    playAnimation(): void {
        const startMessage = 'Connexion au serveur...';
        this.waitBeforeChangeStatus(ONE_SECOND_DELAY, startMessage);

        this.handleReloadErrors();
        setTimeout(() => {
            if (this.clientSocket.socket.connected) {
                const connexionSuccess = 'Connexion réussie';
                this.isWaiting = true;
                this.waitBeforeChangeStatus(0, connexionSuccess);
                const waitingMessage = "En attente d'un joueur...";
                this.waitBeforeChangeStatus(TWO_SECOND_DELAY, waitingMessage);
            } else {
                this.status = 'Erreur de connexion... Veuillez réessayer';
                this.isWaiting = false;
            }
        }, TWO_SECOND_DELAY);
    }

    handleReloadErrors(): void {
        if (this.gameSettingsService.gameSettings.creatorName === '') {
            console.log('F');
            const errorMessage = 'Une erreur est survenue';
            this.waitBeforeChangeStatus(ONE_SECOND_DELAY, errorMessage);
            this.router.navigate(['home']);
            return;
        }
    }

    waitBeforeChangeStatus(waitingTime: number, message: string): void {
        setTimeout(() => {
            this.status = message;
        }, waitingTime);
    }

    deleteGame(): void {
        this.clientSocket.socket.emit('deleteGame', this.clientSocket.roomId);
    }

    startGame(): void {
        // let aiCount = 0;
        // for (const player of this.playerService.opponents) {
        //     if (player instanceof PlayerAI) {
        //         aiCount++;
        //     }
        // }

        if (this.playerService.opponents.length < 3 || !this.playerService.currentPlayer.isCreator) {
            this.shouldDisplayStartError = true;
            setTimeout(() => {
                this.shouldDisplayStartError = false;
            }, ERROR_MESSAGE_DELAY);
            return;
        }
        this.clientSocket.socket.emit('startGame', this.clientSocket.roomId);
    }

    routeToGameView(): void {
        console.log('never happens');
        this.gameSettingsService.isSoloMode = true;
        this.gameSettingsService.isRedirectedFromMultiplayerGame = true;
        this.deleteGame();
        this.router.navigate(['solo-game-ai']);
    }

    private acceptNewPlayer(): void {
        this.clientSocketService.socket.on('newRequest', (joiningUser: User, roomId: string) => {
            console.log('hererrrr');

            const joiningConfirmation = this.dialog.open(JoiningConfirmationDialogComponent, { disableClose: true });
            joiningConfirmation.componentInstance.message = "Acceptez vous d'ajouter " + joiningUser.pseudonym + ' dans la partie?';
            joiningConfirmation.afterClosed().subscribe((decision: boolean) => {
                // if user closes the dialog box without input nothing
                console.log(decision);
                this.clientSocketService.socket.emit('sendJoinResponse', decision, joiningUser, roomId);
                // if decision is true the EndGame occurred
            });
        });
    }
}
