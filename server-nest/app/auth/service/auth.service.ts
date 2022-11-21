import { UserService } from '@app/users/user.service';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async login(userData: User): Promise<User> {
        const isConnected = this.userService.checkIfConnected(userData.pseudonym);
        if (isConnected) return undefined;
        const userFromDB = await this.userService.getSingleUser(userData.pseudonym);
        // TODO a fix
        if (userFromDB === undefined || userFromDB === null) {
            this.userService.addUser(userData);
            return userData;
        }
        this.userService.addUser(userFromDB);
        return userFromDB;
    }
}
