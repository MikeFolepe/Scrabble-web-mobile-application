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

    getAppTheme(userId: string) {
        this.communicationService.getAppTheme(userId).subscribe((appTheme: string) => {
            this.userPreferences.appThemeSelected = appTheme;
        });
    }

    getCurrentBoard(userId: string) {
        this.communicationService.getCurrentBoard(userId).subscribe((currentBoard: string) => {
            this.userPreferences.boardItemSelected = this.themes.getBoard(currentBoard);
        });
    }

    getCurrentChat(userId: string) {
        this.communicationService.getCurrentChat(userId).subscribe((currentChat: string) => {
            this.userPreferences.chatItemSelected = this.themes.getChat(currentChat);
        });
    }

    getBoards(userId: string) {
        this.communicationService.getBoards(userId).subscribe((boards: string[]) => {
            this.userPreferences.boardItems = [];
            this.userPreferences.boardItems.push(this.themes.defaultItem);
            for (const board of boards) {
                const item = this.themes.getBoard(board);
                if (item) {
                    this.userPreferences.boardItems.push(item);
                }
            }
        });
    }

    getChats(userId: string) {
        this.communicationService.getChats(userId).subscribe((chats: string[]) => {
            this.userPreferences.chatItems = [];
            this.userPreferences.chatItems.push(this.themes.defaultItem);
            for (const chat of chats) {
                const item = this.themes.getChat(chat);
                if (item) {
                    this.userPreferences.chatItems.push(item);
                }
            }
        });
    }

    getLanguage(userId: string) {
        this.communicationService.getLanguage(userId).subscribe((language: string) => {
            this.userPreferences.language = Number(language);
        });
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
