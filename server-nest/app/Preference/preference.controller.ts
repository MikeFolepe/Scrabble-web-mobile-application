import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { Response } from 'express';

@Controller('user/preference')
export class PreferenceController {
    constructor(private readonly preferenceService: PreferenceService) {}

    @Get('/appTheme/:pseudonym')
    async getAppTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getAppTheme(pseudonym)
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/boardTheme/:pseudonym')
    async getBoardTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getBoardTheme(pseudonym)
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/chatTheme/:pseudonym')
    async getChatTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getChatTheme(pseudonym)
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/langage/:pseudonym')
    async getLangage(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getLangage(pseudonym)
            .then((langage: number) => {
                response.status(HttpStatus.OK).send(langage);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/boards/:pseudonym')
    async getBoards(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getBoards(pseudonym)
            .then((boards: string[]) => {
                response.status(HttpStatus.OK).send(boards);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/chats/:pseudonym')
    async getChats(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getChats(pseudonym)
            .then((chats: string[]) => {
                response.status(HttpStatus.OK).send(chats);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/appTheme/:pseudonym')
    async setAppTheme(@Req() req, @Body() newAppTheme: string, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setAppTheme(pseudonym, newAppTheme)
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/boardTheme/:pseudonym')
    async setBoardTheme(@Req() req, @Body() newBoard: string, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setAppTheme(pseudonym, newBoard)
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/chatTheme/:pseudonym')
    async setChatTheme(@Req() req, @Body() newChat: string, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setChatTheme(pseudonym, newChat)
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addBoard/:pseudonym')
    async addBoard(@Req() req, @Body() newBoard: string, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addBoard(pseudonym, newBoard)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addChat/:pseudonym')
    async addChat(@Req() req, @Body() newChat: string, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addChat(pseudonym, newChat)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/setLangage/:pseudonym')
    async setLangage(@Req() req, @Body() newLangage: number, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setLangage(pseudonym, newLangage)
            .then((langage: number) => {
                response.status(HttpStatus.OK).send(langage);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }
}
