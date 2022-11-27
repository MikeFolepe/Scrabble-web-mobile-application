import { User } from '@common/user';
import { UserStatsDB } from '@common/user-stats';
import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user: User) {
        const salt = 10;
        const password = await bcrypt.hash(user.password, salt);
        await this.userService.insertUser(user.avatar, user.pseudonym, password, user.email);
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
        const userFound = await this.userService.getSingleUser(pseudonym);
        return Boolean(userFound);
    }

    @Get('/users')
    async getAllUsers(@Res() response: Response) {
        await this.userService
            .getUsers()
            .then((users: User[]) => {
                response.status(HttpStatus.OK).send(users);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get the users' + error.message);
            });
    }

    @Get('/userStats/:userId')
    async getUserStats(@Param('userId') userId: string, @Res() response: Response) {
        await this.userService
            .getUserStats(userId)
            .then((usersStats: UserStatsDB) => {
                response.status(HttpStatus.OK).send(usersStats);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get the stats' + error.message);
            });
    }
}
