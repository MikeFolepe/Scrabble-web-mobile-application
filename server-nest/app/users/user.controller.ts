import { User } from '@common/user';
import * as email from '@nativescript/email';
import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    composeOptions : email.ComposeOptions;

    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user: User) {
        const password = this.userService.encryptPassword(user.password) //await bcrypt.hash(user.password, salt);
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
        const decryptedPassword = await this.userService.decryptPassword(pseudonym);
        Logger.log(hashedPassword);
        Logger.log(decryptedPassword);
        if(password === decryptedPassword) {
            return true;
        }
        return false;
    }

    @Get('/checkPseudonym/:pseudonym')
    async checkPseudonym(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const userFound = await this.userService.getSingleUser(pseudonym);
        return Boolean(userFound);
    }

    @Get('getEmail/:pseudonym')
    async checkPseudonymForPassword(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return;
        return userFound.email;
    }

    @Get('sendEmailToUser/:pseudonym')
    async sendEmailToUser(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const userFound = await this.userService.getSingleUser(pseudonym);
        if (!userFound) return false;
        const email = userFound.email;
        const password = await this.userService.decryptPassword(pseudonym);

        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey('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')
        const msg = {
          to: email, 
          from: 'log3900.110.22@gmail.com', 
          subject: 'Mot de passe oublié - Scrabble', 
          text: `Bonjour, voici votre mot de passe : ${password}`,
          
        };
        sgMail.send(msg);

        return true;
    }

    @Get('/users')
    async getAllUsers() {
        const accounts = await this.userService.getUsers();
        return accounts;
    }

}
