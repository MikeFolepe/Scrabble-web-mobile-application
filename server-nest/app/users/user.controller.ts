import { User } from '@common/user';
import { UserStatsDB } from '@common/user-stats';
import * as emailS from '@nativescript/email';
import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { Response } from 'express';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
    composeOptions: emailS.ComposeOptions;

    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user: User) {
        const password = this.userService.encryptPassword(user.password); // await bcrypt.hash(user.password, salt);
        await this.userService.insertUser(user.avatar, user.pseudonym, password, user.email);
    }

    // check if the password is correct.
    @Get('/findUserInDb/:pseudonym/:password')
    async findUserInDb(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const password = req.params.password;
        Logger.log({ password, pseudonym });
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return false;
        const decryptedPassword = await this.userService.decryptPassword(pseudonym);
        if (password === decryptedPassword) {
            return true;
        }
        return false;
    }

    @Get('/checkPseudonym/:pseudonym')
    async checkPseudonym(@Req() req) {
        const pseudonym = req.params.pseudonym;
        Logger.log(pseudonym);
        const userFound = await this.userService.getSingleUser(pseudonym);
        Logger.log(userFound);
        return Boolean(userFound);
    }

    @Get('getEmail/:pseudonym')
    async checkPseudonymForPassword(@Req() req) {
        const pseudonym = req.params.pseudonym;
        Logger.log(pseudonym);
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return;
        return userFound.email;
    }

    @Get('sendEmailToUser/:pseudonym')
    async sendEmailToUser(@Req() req) {
        const pseudonym = req.params.pseudonym;
        Logger.log(pseudonym);
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return false;
        const email = userFound.email;
        const password = await this.userService.decryptPassword(pseudonym);

        sgMail.setApiKey('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');
        const msg = {
            to: email,
            from: 'log3900.110.22@gmail.com',
            subject: 'Mot de passe oublié - Scrabble',
            text: `- SRABBLE 110 - \n\n Utilisateur : ${pseudonym}. \n\n Bonjour, voici votre mot de passe : ${password}`,
        };
        sgMail.send(msg);
        return true;
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

    @Post('/userStats/login/:userId')
    async addLogin(@Param('userId') userId: string) {
        await this.userService.addLogin(userId);
    }

    @Post('/userStats/game/:userId')
    async addGame(@Param('userId') userId: string, @Req() req) {
        console.log(req.body);
        await this.userService.addGame(req.body, userId);
    }

    @Post('/userStats/gamesWon/:userId')
    async updateGamesWon(@Param('userId') userId: string, @Req() req) {
        await this.userService.updateGamesWon(userId, req.body.gamesWon);
    }

    @Post('/userStats/gamesPlayed/:userId')
    async updateGamesPlayed(@Param('userId') userId: string, @Req() req, @Body() gamesPlayed: number) {
        console.log('arrived in controller');
        await this.userService.updateGamesPlayed(userId, req.body.gamesPlayed);
    }

    @Post('/userStats/totalPoints/:userId')
    async updateTotalPoints(@Param('userId') userId: string, @Req() req) {
        await this.userService.updateTotalPoints(userId, req.body.totalPoints);
    }
    @Post('/users/xpPoints/:userId')
    async updateXpPoints(@Param('userId') userId: string, @Req() req) {
        await this.userService.updateXpPoints(userId, req.body.xpPoints);
    }
}
