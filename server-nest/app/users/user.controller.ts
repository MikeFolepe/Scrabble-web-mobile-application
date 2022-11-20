import { User } from '@common/user';
import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user: User) {
        const salt = 10;
        const password = await bcrypt.hash(user.password, salt);
        await this.userService.insertUser(user.avatar, user.pseudonym, password, user.email);
        return { ...user };
    }

    // check if the password is correct.
    @Get('/findUserInDb/:pseudonym/:password')
    async findUserInDb(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const password = req.params.password;
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return false;
        const hashedPassword = userFound.password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        return passwordMatch;
    }

    @Get('/checkPseudonym/:pseudonym')
    async checkPseudonym(@Req() req) {
        const pseudonym = req.params.pseudonym;
        Logger.log(pseudonym);
        const userFound = await this.userService.getSingleUser(pseudonym);
        Logger.log(userFound);
        return Boolean(userFound);
    }

    @Get('/users')
    async getAllUsers() {
        const accounts = await this.userService.getUsers();
        return accounts;
    }
}
