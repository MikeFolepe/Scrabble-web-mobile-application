import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { ChatEvents } from '@common/chat.gateway.events';
import { User } from '@common/user';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ClientSocketService } from './client-socket.service';
import { CommunicationService } from './communication.service';
import { ErrorHandlerService } from './error-handler.service';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: User;
    serverUrl: string;
    // srcData: SafeResourceUrl;
    chosenAvatar: string;
    constructor(
        private clientSocketService: ClientSocketService,
        private sanitizer: DomSanitizer,
        private router: Router,
        private communicationService: CommunicationService,
        public errorHandler: ErrorHandlerService,
        public snackBar: MatSnackBar,
    ) {
        this.chosenAvatar = '';
        this.serverUrl = environment.serverUrl;
        this.communicationService.baseUrl = this.serverUrl + '/api';
    }
    signIn(userData: User) {
        this.communicationService.connectUser(userData).subscribe(
            (response: HttpResponse<User>) => {
                if (response.status === HttpStatusCode.Ok) {
                    this.currentUser = response.body as User;
                    const sanitized = response.body?.avatar as string;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.currentUser.avatar = (this.sanitizer.bypassSecurityTrustResourceUrl(sanitized) as any).changingThisBreaksApplicationSecurity;
                    console.log(this.currentUser.avatar);
                    this.clientSocketService.socket = io(this.serverUrl);
                    this.clientSocketService.socket.connect();
                    this.clientSocketService.socket.emit(ChatEvents.JoinRoom);
                    this.clientSocketService.socket.emit(ChatEvents.GetMessages);
                    this.receiveUserSocket();
                    this.clientSocketService.socket.emit('joinMainRoom', this.currentUser);
                    localStorage.setItem('ACCESS_TOKEN', 'access_token');
                    this.router.navigate(['/home']);
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
