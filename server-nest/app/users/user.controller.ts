import { User } from '@common/user';
import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('/users')
    async addUser(@Body() user : User) {
        const generatedId = await this.userService.insertUser(user.avatar, user.pseudonym, user.password, user.email);
        return { id: generatedId };
    }

    @Get('/users')
    async getAllUsers() {
        const accounts = await this.userService.getUsers();
        return accounts;
    }

    //get an account by pseudonym
    @Get(':pseudonym')
    getUser(@Res() response, @Body('pseudonym') pseudonym : string) {
        const account = this.userService.getSingleUser(pseudonym);
        if (!account) {
            response.status(HttpStatus.NOT_FOUND).send('Le compte n\'existe pas.');
        }
        response.status(HttpStatus.OK).send(account);
    }
}
