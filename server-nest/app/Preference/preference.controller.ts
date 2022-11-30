import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { Response } from 'express';

@Controller('user/preference')
export class PreferenceController {
    constructor(private readonly preferenceService: PreferenceService) {}

    @Get('/appTheme/:id')
    async getAppTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getAppTheme(req.params.id)
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/boardTheme/:id')
    async getBoardTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getBoardTheme(req.params.id)
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/chatTheme/:id')
    async getChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getChatTheme(req.params.id)
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/language/:id')
    async getLanguage(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getLanguage(req.params.id)
            .then((language: string) => {
                response.status(HttpStatus.OK).send(language);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/boards/:id')
    async getBoards(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getBoards(req.params.id)
            .then((boards: string[]) => {
                response.status(HttpStatus.OK).send(boards);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Get('/chats/:id')
    async getChats(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getChats(req.params.id)
            .then((chats: string[]) => {
                response.status(HttpStatus.OK).send(chats);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/appTheme/:id')
    async setAppTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setAppTheme(req.params.id, req.body.name)
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/boardTheme/:id')
    async setBoardTheme(@Req() req, @Res() response: Response) {
        const newBoard = req.body.name;
        await this.preferenceService
            .setBoardTheme(req.params.id, newBoard)
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/chatTheme/:id')
    async setChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setChatTheme(req.params.id, req.body.name)
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addBoard/:id')
    async addBoard(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .addBoard(req.params.id, req.body.name)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/addChat/:id')
    async addChat(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .addChat(req.params.id, req.body.name)
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

    @Post('/setLanguage/:id')
    async setLanguage(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setLanguage(req.params.id, req.body.language)
            .then((language: number) => {
                response.status(HttpStatus.OK).send(language);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }
}
