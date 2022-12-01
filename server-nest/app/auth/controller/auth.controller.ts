import { AuthService } from '@app/auth/service/auth.service';
import { User } from '@common/user';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiCreatedResponse({
        description: 'connect a new user to server',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/connect')
    async login(@Body() user: User, @Res() response: Response) {
        await this.authService
            .login(user)
            .then((newUser: User) => {
                console.log(newUser);
                if (newUser === undefined) response.sendStatus(HttpStatus.NOT_MODIFIED);
                else response.status(HttpStatus.OK).send(newUser);
            })
            .catch((error: Error) => {
                console.log('yepppp');
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }
}
