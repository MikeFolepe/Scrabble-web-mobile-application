/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { ChatEvents } from '@common/chat.gateway.events';
import { Notification } from '@common/notification';
import { User } from '@common/user';
import { Language } from '@common/user-preferences';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
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
        public translate: TranslateService,
        public http: HttpClient,
    ) {
        this.chosenAvatar = '';
        this.serverUrl = environment.serverUrl;
        this.communicationService.baseUrl = this.serverUrl + '/api';
        this.notifications = [];
    }
    signIn(userData: User) {
        this.communicationService.connectUser(userData).subscribe(
            async (response: HttpResponse<User>) => {
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
                    await this.getPreferences(this.currentUser._id);
                    console.log(this.userService.userPreferences);
                    this.clientSocketService.socket.emit('joinMainRoom', this.currentUser);
                    await this.initLanguage();
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

    async initLanguage() {
        console.log('called');

        const defaultLocale = 'en';
        const translationsUrl = '/assets/i18n/translations';
        const sufix = '.json';
        console.log('here', this.userService.userPreferences.language);
        const storageLocale = this.userService.userPreferences.language === Language.French ? 'fr' : 'en';
        const locale = storageLocale || defaultLocale;
        console.log(locale);

        const response = await forkJoin([
            this.http.get('/assets/i18n/dev.json').pipe(),
            this.http.get(`${translationsUrl}/${locale}${sufix}`).pipe(),
        ]).toPromise();
        const devKeys = response[0];
        const translatedKeys = response[1];

        this.translate.setTranslation(defaultLocale, devKeys || {});
        this.translate.setTranslation(locale, translatedKeys || {}, true);

        this.translate.setDefaultLang(defaultLocale);
        this.translate.use(locale);
    }

    async getPreferences(userId: string) {
        await this.userService.getAppTheme(userId);
        await this.userService.getBoards(userId);
        await this.userService.getChats(userId);
        await this.userService.getCurrentBoard(userId);
        await this.userService.getCurrentChat(userId);
        await this.userService.getLanguage(userId);
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
