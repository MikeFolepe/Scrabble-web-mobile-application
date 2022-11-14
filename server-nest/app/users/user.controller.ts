import { User } from '@common/user';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Post('/users')
    async addUser(@Body() user : User) {

        const salt = 10;
        const bcrypt = require('bcrypt');
        const password = await bcrypt.hash(user.password, salt);
        
        const generatedId = await this.userService.insertUser(user.avatar, user.pseudonym, password, user.email);
        return { id: generatedId };
    }

    //check if the password is correct. 
    @Get('/checkPassword/:pseudonym/:password')
    async checkPassword(@Req() req) {
        const pseudonym = req.params.pseudonym;
        const password = req.params.password;
        const bcrypt = require('bcrypt');
        const userFound = await this.userService.getSingleUser(pseudonym);
        const hashed_password = userFound.password;
        const passwordMatch = await bcrypt.compare(password, hashed_password);
        return passwordMatch;
    }

    @Get('/users')
    async getAllUsers() {
        const accounts = await this.userService.getUsers();
        return accounts;
    }
}
