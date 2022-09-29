import { Injectable } from '@angular/core';
import { User } from '@common/user';
import { Router } from '@angular/router';

import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatEvents } from '@common/chat.gateway.events';
import { ErrorHandlerService } from './error-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { io } from 'socket.io-client';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: User;
    serverUrl: string;
    constructor(
        private clientSocketService: ClientSocketService,
        private router: Router,
        private communicationService: CommunicationService,
        public errorHandler: ErrorHandlerService,
        public snackBar: MatSnackBar,
    ) {}

    signIn(userData: User) {
        this.serverUrl = 'http://' + userData.ipAddress;
        this.communicationService.baseUrl = this.serverUrl + '/api';

        this.communicationService.connectUser(userData).subscribe(
            (valid: boolean) => {
                if (valid) {
                    this.currentUser = userData;
                    this.clientSocketService.socket = io(this.serverUrl);
                    this.clientSocketService.socket.connect();
                    this.clientSocketService.socket.emit(ChatEvents.JoinRoom);
                    this.clientSocketService.socket.emit(ChatEvents.GetMessages);
                    localStorage.setItem('ACCESS_TOKEN', 'access_token');
                    this.router.navigate(['/chat']);
                    this.clientSocketService.socket.on(ChatEvents.SocketId, (socketId: string) => {
                        this.currentUser.socketId = socketId;
                        this.clientSocketService.socket.emit(ChatEvents.UpdateUserSocket, this.currentUser);
                    });
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
}
