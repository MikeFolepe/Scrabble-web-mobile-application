/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { ChatEvents } from '@common/chat.gateway.events';
import { Notification } from '@common/notification';
import { User } from '@common/user';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { ErrorHandlerService } from './error-handler.service';
import { UserService } from './user.service';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: User;
    serverUrl: string;
    notifications: Notification[];
    // srcData: SafeResourceUrl;
    chosenAvatar: string;
    constructor(
        private clientSocketService: ClientSocketService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private communicationService: CommunicationService,
        public errorHandler: ErrorHandlerService,
        public snackBar: MatSnackBar,
        public userService: UserService,
    ) {
        this.chosenAvatar = '';
        this.serverUrl = environment.serverUrl;
        this.communicationService.baseUrl = this.serverUrl + '/api';
        this.notifications = [];
    }
    signIn(userData: User) {
        this.communicationService.connectUser(userData).subscribe(
            (response: HttpResponse<User>) => {
                if (response.status === HttpStatusCode.Ok) {
                    this.currentUser = response.body as User;
                    this.setSocketConnection();
                    this.setMainChatRoom();
                    const sanitized = response.body?.avatar as string;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.currentUser.avatar = (this.sanitizer.bypassSecurityTrustResourceUrl(sanitized) as any).changingThisBreaksApplicationSecurity;
                    this.receiveUserSocket();
                    this.addLogin();
                    this.userService.getUserStats(this.currentUser._id);
                    this.clientSocketService.socket.emit('joinMainRoom', this.currentUser);
                    this.setAccess();
                } else if (response.status === HttpStatusCode.NotModified) {
                    this.displayMessage('Cet utilisateur est déjà connecté');
                }
            },
            (error: HttpErrorResponse) => {
                if (error.status === HttpStatusCode.NotModified) this.displayMessage('Cet utilisateur est déjà connecté');
                else this.errorHandler.handleRequestError(error);
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

    private setSocketConnection() {
        this.clientSocketService.socket = io(this.serverUrl);
        this.clientSocketService.socket.connect();
    }

    private addLogin(): void {
        this.communicationService.addLogin(this.currentUser._id).subscribe();
    }

    private setMainChatRoom() {
        this.clientSocketService.socket.emit(ChatEvents.JoinRoom);
        this.clientSocketService.socket.emit(ChatEvents.GetMessages);
    }

    private setAccess() {
        localStorage.setItem('ACCESS_TOKEN', 'access_token');
        this.router.navigate(['/home']);
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
