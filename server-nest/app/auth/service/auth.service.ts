import { UserService } from '@app/users/user.service';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async login(userData: User): Promise<boolean> {
        const user = await this.userService.findOne(userData.pseudonym);
        if (user) return false;
        await this.userService.addUser(userData);
        return true; 
    }
}
