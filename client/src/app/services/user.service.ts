/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserStats } from '@app/classes/user-stats';
import { User } from '@common/user';
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
    constructor(
        private communicationService: CommunicationService,
        private administratorService: AdministratorService,
        public errorHandler: ErrorHandlerService,
    ) {}

    addUserToDatabase(user: User): void {
        this.addUser(user);
    }

    getUserStats(userId: string): void {
        this.communicationService.getUserStats(userId).subscribe(
            (userStat: UserStatsDB) => {
                this.userStats = new UserStats(userStat);
                console.log(this.userStats);
            },
            (error: HttpErrorResponse) => this.errorHandler.handleRequestError(error),
        );
    }

    getUsers(): void {
        this.communicationService.getUsers().subscribe(
            (users: User[]) => {
                this.users = users;
            },
            (error: HttpErrorResponse) => this.errorHandler.handleRequestError(error),
        );
    }

    async findUserInDb(pseudonym: string, password: string): Promise<boolean> {
        return this.communicationService.findUserInDb(pseudonym, password);
    }

    async checkIfPseudonymExists(pseudonym: string): Promise<boolean> {
        return this.communicationService.checkPseudonym(pseudonym);
    }

    private addUser(user: User): void {
        this.communicationService.addNewUserToDB(user).subscribe(() => {
            this.administratorService.displayMessage('Utilisateur ajouté');
        });
    }
}
