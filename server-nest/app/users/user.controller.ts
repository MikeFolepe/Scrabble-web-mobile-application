/* eslint-disable no-underscore-dangle */
import { User } from '@common/user';
import * as email from '@nativescript/email';
import { Body, Controller, Get, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
    composeOptions: email.ComposeOptions;

    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user: User) {
        const password = this.userService.encryptPassword(user.password); // await bcrypt.hash(user.password, salt);
        await this.userService.insertUser(user.avatar, user.pseudonym, password, user.email);
        return { ...user };
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

        const sgMail = require('@sendgrid/mail');
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
    async getAllUsers() {
        const accounts = await this.userService.getUsers();
        return accounts;
    }

    @Post('/updateUser')
    async updateUserInDb(@Body() user: User, @Res() response: Response) {
        console.log('boo', user);
        const userFound = await this.userService.getSingleUser(user.pseudonym);
        if (userFound) {
            console.log('userfound');
            if (userFound._id !== user._id) {
                console.log('userfound');
                response.status(HttpStatus.FOUND).send();
            }
        }
        await this.userService.updateUser(user).then((newUser: User) => {
            response.status(HttpStatus.OK).send(newUser);
        });
    }
}
