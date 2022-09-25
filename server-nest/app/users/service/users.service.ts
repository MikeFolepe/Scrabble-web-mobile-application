import { Injectable } from '@nestjs/common';
import { User } from './../../../../common/user';

@Injectable()
export class UsersService {
    activeUsers: User[];

    constructor() {
        this.activeUsers = [];
    }

    async addUser(userData: User): Promise<void> {
        this.activeUsers.push(userData);
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.activeUsers.find((user) => user.pseudonym === username);
    }
}
