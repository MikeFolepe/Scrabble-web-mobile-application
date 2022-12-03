/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { DEFAULT_PREF, Themes } from '@app/classes/themes';
import { UserStats } from '@app/classes/user-stats';
import { User } from '@common/user';
import { UserPreferences } from '@common/user-preferences';
import { UserStatsDB } from '@common/user-stats';
import { AdministratorService } from './administrator.service';
import { CommunicationService } from './communication.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    users: User[];
    userStats: UserStats;
    userPreferences: UserPreferences;
    themes: Themes;
    constructor(
        private communicationService: CommunicationService,
        private administratorService: AdministratorService,
        public errorHandler: ErrorHandlerService,
    ) {
        this.userPreferences = DEFAULT_PREF;
        this.themes = new Themes();
    }

    addUserToDatabase(user: User): void {
        this.addUser(user);
    }

    getUserStats(userId: string): void {
        this.communicationService.getUserStats(userId).subscribe((userStat: UserStatsDB) => {
            this.userStats = new UserStats(userStat);
            console.log(this.userStats);
        });
    }

    async getAppTheme(userId: string) {
        this.userPreferences.appThemeSelected = await this.communicationService.getAppTheme(userId).toPromise();
    }

    async getCurrentBoard(userId: string) {
        const board = await this.communicationService.getCurrentBoard(userId).toPromise();
        console.log(board);
        this.userPreferences.boardItemSelected = this.themes.getBoard(board);
        if (this.userPreferences.boardItemSelected === undefined) {
            this.userPreferences.boardItemSelected = this.themes.defaultItem;
        }
    }

    async getCurrentChat(userId: string) {
        const chat = await this.communicationService.getCurrentChat(userId).toPromise();
        this.userPreferences.chatItemSelected = this.themes.getChat(chat);
        if (this.userPreferences.chatItemSelected === undefined) {
            this.userPreferences.chatItemSelected = this.themes.defaultItem;
        }
    }

    async getBoards(userId: string) {
        const boards = await this.communicationService.getBoards(userId).toPromise();
        this.userPreferences.boardItems = [];
        this.userPreferences.boardItems.push(this.themes.defaultItem);
        for (const board of boards) {
            const item = this.themes.getBoard(board);
            if (item) {
                this.userPreferences.boardItems.push(item);
            }
        }
    }

    async getChats(userId: string) {
        const chats = await this.communicationService.getChats(userId).toPromise();
        this.userPreferences.chatItems = [];
        this.userPreferences.chatItems.push(this.themes.defaultItem);
        for (const chat of chats) {
            const item = this.themes.getChat(chat);
            if (item) {
                this.userPreferences.chatItems.push(item);
            }
        }
    }

    async getLanguage(userId: string) {
        this.userPreferences.language = Number(await this.communicationService.getLanguage(userId).toPromise());
    }

    getUsers(): void {
        this.communicationService.getUsers().subscribe((users: User[]) => {
            this.users = users;
        });
    }


    async findUserInDb(pseudonym: string, password: string): Promise<boolean> {
        return this.communicationService.findUserInDb(pseudonym, password);
    }

    async checkIfPseudonymExists(pseudonym: string): Promise<boolean> {
        return this.communicationService.checkPseudonym(pseudonym);
    }

    async getEmail(pseudonym: string): Promise<string> {
        return this.communicationService.getEmail(pseudonym);
    }

    async sendEmailToUser(pseudonym: string): Promise<boolean> {
        return this.communicationService.sendEmailToUser(pseudonym);
    }

    async getDecryptedPassword(pseudonym: string): Promise<string> {
        return this.communicationService.getDecryptedPassword(pseudonym);
    }

    private addUser(user: User): void {
        this.communicationService.addNewUserToDB(user).subscribe(() => {
            this.administratorService.displayMessage('Utilisateur ajouté');
        });
    }
}
