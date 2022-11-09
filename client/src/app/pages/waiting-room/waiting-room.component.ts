import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND_DELAY, TWO_SECOND_DELAY } from '@app/classes/constants';
import { ErrorMessage } from '@app/classes/error-message-constants';
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
export class WaitingRoomComponent implements OnInit, OnDestroy {
    status: string;
    isWaiting: boolean;
    shouldDisplayError: boolean;
    errorMessage: string;

    constructor(
        private router: Router,
        private gameSettingsService: GameSettingsService,
        private clientSocket: ClientSocketService,
        public playerService: PlayerService,
        private dialog: MatDialog,
    ) {
        this.status = '';
        this.errorMessage = '';
        this.isWaiting = true;
        this.clientSocket.routeToGameView();
        this.clientSocket.initialize();
    }

    ngOnInit(): void {
        this.playAnimation();
        this.acceptNewPlayer();
        this.leaveToHome();
    }

    ngOnDestroy(): void {}

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
        this.clientSocket.socket.emit('deleteGame', this.clientSocket.currentRoom.id);
        console.log(this.clientSocket.currentRoom.id);
    }

    leaveToHome(): void {
        this.clientSocket.socket.on('leaveToHome', () => {
            console.log('leavetOhOME');
            this.displayErrorMessage(ErrorMessage.DeletedRoomByCreator);
            setTimeout(() => {
                this.router.navigate(['home']);
            }, ERROR_MESSAGE_DELAY);
        });
    }

    startGame(): void {
        if (this.clientSocket.currentRoom.humanPlayersNumber < 4) {
            this.displayErrorMessage(ErrorMessage.NotEnoughPlayers);
            return;
        }
        this.clientSocket.socket.emit('startGame', this.clientSocket.currentRoom.id);
    }

    routeToGameView(): void {
        this.gameSettingsService.isSoloMode = true;
        this.gameSettingsService.isRedirectedFromMultiplayerGame = true;
        this.deleteGame();
        this.router.navigate(['solo-game-ai']);
    }

    private acceptNewPlayer(): void {
        this.clientSocket.socket.on('newRequest', (joiningUser: User, roomId: string) => {
            const joiningConfirmation = this.dialog.open(JoiningConfirmationDialogComponent, { disableClose: true });
            joiningConfirmation.componentInstance.message = "Acceptez vous d'ajouter " + joiningUser.pseudonym + ' dans la partie?';
            joiningConfirmation.afterClosed().subscribe((decision: boolean) => {
                this.clientSocket.socket.emit('sendJoinResponse', decision, joiningUser, roomId);
            });
        });
    }

    private displayErrorMessage(message: string): void {
        this.errorMessage = message;
        this.shouldDisplayError = true;
        setTimeout(() => {
            this.shouldDisplayError = false;
            this.errorMessage = '';
        }, ERROR_MESSAGE_DELAY);
    }
}
