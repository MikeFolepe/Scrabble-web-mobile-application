/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND_DELAY, TWO_SECOND_DELAY } from '@app/classes/constants';
import { ErrorMessage } from '@app/classes/error-message-constants';
import { Player } from '@app/models/player.model';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { JoiningConfirmationDialogComponent } from '@app/modules/initialize-game/joining-confirmation-dialog/joining-confirmation-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { CommunicationService } from '@app/services/communication.service';
import { PlayerService } from '@app/services/player.service';
import { UserService } from '@app/services/user.service';
import { ERROR_MESSAGE_DELAY } from '@common/constants';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    status: string;
    isWaiting: boolean;
    shouldDisplayError: boolean;
    errorMessage: string;

    constructor(
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
        private router: Router,
        private clientSocket: ClientSocketService,
        public playerService: PlayerService,
        private dialog: MatDialog,
        private communicationService: CommunicationService,
        private userService: UserService,
        private authService: AuthService,
    ) {
        this.status = '';
        this.errorMessage = '';
        this.isWaiting = true;
    }

    ngOnInit(): void {
        // this.playAnimation();
        this.acceptNewPlayer();
        this.leaveToHome();
        this.routeToGameView();
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
        if (this.clientSocket.currentRoom.gameSettings.creatorName === '') {
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
        this.clientSocket.socket.emit('deleteGame', this.playerService.currentPlayer.name, this.clientSocket.currentRoom.id);
        console.log(this.clientSocket.currentRoom.id);
    }

    leaveToHome(): void {
        this.clientSocket.socket.on('leaveToHome', () => {
            console.log('leavetOhOME');
            this.displayErrorMessage(ErrorMessage.DeletedRoomByCreator);
            setTimeout(() => {
                this.router.navigate(['home']);
                this.playerService.clearPlayers();
            }, ERROR_MESSAGE_DELAY);
        });
    }
    startGame(): void {
        console.log('start exec', this.clientSocket.currentRoom);
        if (this.clientSocket.currentRoom.humanPlayersNumber < 2) {
            this.displayErrorMessage(ErrorMessage.NotEnoughPlayers);
            return;
        }
        this.clientSocket.socket.emit('startGame', this.clientSocket.currentRoom.id);
    }

    routeToGameView(): void {
        this.clientSocket.socket.on('goToGameView', () => {
            console.log('played');
            this.userService.userStats.gamesPlayed++;
            this.communicationService.updateGamesPlayed(this.authService.currentUser._id, this.userService.userStats.gamesPlayed).subscribe();
            this.router.navigate(['game']);
        });
    }

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    leaveGame(): void {
        this.clientSocket.socket.emit('sendLeaveGame', this.playerService.currentPlayer.name, this.clientSocket.currentRoom.id);
        this.playerService.currentPlayer = {} as Player;
    }
    private acceptNewPlayer(): void {
        this.clientSocket.socket.on('newRequest', (joiningUser: string, roomId: string) => {
            const joiningConfirmation = this.dialog.open(JoiningConfirmationDialogComponent, { disableClose: true });
            joiningConfirmation.componentInstance.message = "Acceptez vous d'ajouter " + joiningUser + ' dans la partie?';
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
