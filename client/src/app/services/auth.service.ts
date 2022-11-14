import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@common/user';

import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { ChatEvents } from '@common/chat.gateway.events';
import { io } from 'socket.io-client';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { ErrorHandlerService } from './error-handler.service';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: User;
    serverUrl: string;
    chosenAvatar : string;
    constructor(
        private clientSocketService: ClientSocketService,
        private router: Router,
        private communicationService: CommunicationService,
        public errorHandler: ErrorHandlerService,
        public snackBar: MatSnackBar,
    ) {
        this.chosenAvatar = '';
        if (this.clientSocketService.socket) {
            this.receiveUserSocket();
        }
    }

    signIn(userData: User) {
        this.serverUrl = 'http://localhost:3000';
        this.communicationService.baseUrl = this.serverUrl + '/api';

        this.communicationService.connectUser(userData).subscribe(
            (valid: boolean) => {
                if (valid) {
                    this.currentUser = userData;
                    this.clientSocketService.socket = io(this.serverUrl);
                    this.clientSocketService.socket.on(ChatEvents.SocketId, (socketId: string) => {
                        this.currentUser.socketId = socketId;
                    });
                    this.clientSocketService.socket.connect();

                    this.clientSocketService.socket.emit(ChatEvents.JoinRoom);
                    this.clientSocketService.socket.emit(ChatEvents.GetMessages);
                    this.clientSocketService.socket.emit('joinMainRoom', this.currentUser);
                    localStorage.setItem('ACCESS_TOKEN', 'access_token');
                    this.router.navigate(['/home']);
                    this.clientSocketService.initialize();
                } else {
                    this.displayMessage('Cet utilisateur est déjà connecté');
                }
            },
            (error: HttpErrorResponse) => {
                this.errorHandler.handleRequestError(error);
            },
        );
    }

    isLoggedIn() {
        return true;
    }
    logout() {
        this.clientSocketService.socket.disconnect();
        this.router.navigate(['/auth']);
        localStorage.removeItem('ACCESS_TOKEN');
    }

    private displayMessage(message: string): void {
        this.snackBar.open(message, 'OK', {
            duration: ERROR_MESSAGE_DELAY,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackBarStyle'],
        });
    }

    private receiveUserSocket(): void {
        this.clientSocketService.socket.on(ChatEvents.SocketId, (socketId: string) => {
            this.currentUser.socketId = socketId;
            this.clientSocketService.socket.emit(ChatEvents.UpdateUserSocket, this.currentUser);
        });
    }
}
