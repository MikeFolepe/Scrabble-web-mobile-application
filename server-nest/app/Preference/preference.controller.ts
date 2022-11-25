import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
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

    @Get('/language/:pseudonym')
    async getLanguage(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getLanguage(pseudonym)
            .then((language: string) => {
                response.status(HttpStatus.OK).send(language);
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
    async setAppTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setAppTheme(pseudonym, req.body.name)
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/boardTheme/:pseudonym')
    async setBoardTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        const newBoard = req.body.name;
        await this.preferenceService
            .setBoardTheme(pseudonym, newBoard)
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/chatTheme/:pseudonym')
    async setChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setChatTheme(req.params.pseudonym, req.body.name)
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addBoard/:pseudonym')
    async addBoard(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addBoard(pseudonym, req.body.name)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addChat/:pseudonym')
    async addChat(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addChat(pseudonym, req.body.name)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/setLanguage/:pseudonym')
    async setLanguage(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setLanguage(pseudonym, req.body.language)
            .then((language: number) => {
                response.status(HttpStatus.OK).send(language);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }
}
