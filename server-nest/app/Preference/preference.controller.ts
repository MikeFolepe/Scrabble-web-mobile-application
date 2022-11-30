import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { Response } from 'express';

@Controller('user/preference')
export class PreferenceController {
    constructor(private readonly preferenceService: PreferenceService) {}

<<<<<<< HEAD
    @Get('/appTheme/:pseudonym')
    async getAppTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getAppTheme(pseudonym)
=======
    @Get('/appTheme/:id')
    async getAppTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getAppTheme(req.params.id)
>>>>>>> origin/develop
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Get('/boardTheme/:pseudonym')
    async getBoardTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getBoardTheme(pseudonym)
=======
    @Get('/boardTheme/:id')
    async getBoardTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getBoardTheme(req.params.id)
>>>>>>> origin/develop
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Get('/chatTheme/:pseudonym')
    async getChatTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getChatTheme(pseudonym)
=======
    @Get('/chatTheme/:id')
    async getChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getChatTheme(req.params.id)
>>>>>>> origin/develop
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Get('/language/:pseudonym')
    async getLanguage(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getLanguage(pseudonym)
=======
    @Get('/language/:id')
    async getLanguage(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getLanguage(req.params.id)
>>>>>>> origin/develop
            .then((language: string) => {
                response.status(HttpStatus.OK).send(language);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Get('/boards/:pseudonym')
    async getBoards(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getBoards(pseudonym)
=======
    @Get('/boards/:id')
    async getBoards(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getBoards(req.params.id)
>>>>>>> origin/develop
            .then((boards: string[]) => {
                response.status(HttpStatus.OK).send(boards);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Get('/chats/:pseudonym')
    async getChats(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .getChats(pseudonym)
=======
    @Get('/chats/:id')
    async getChats(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .getChats(req.params.id)
>>>>>>> origin/develop
            .then((chats: string[]) => {
                response.status(HttpStatus.OK).send(chats);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/appTheme/:pseudonym')
    async setAppTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setAppTheme(pseudonym, req.body.name)
=======
    @Post('/appTheme/:id')
    async setAppTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setAppTheme(req.params.id, req.body.name)
>>>>>>> origin/develop
            .then((appTheme: string) => {
                response.status(HttpStatus.OK).send(appTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/boardTheme/:pseudonym')
    async setBoardTheme(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        const newBoard = req.body.name;
        await this.preferenceService
            .setBoardTheme(pseudonym, newBoard)
=======
    @Post('/boardTheme/:id')
    async setBoardTheme(@Req() req, @Res() response: Response) {
        const newBoard = req.body.name;
        await this.preferenceService
            .setBoardTheme(req.params.id, newBoard)
>>>>>>> origin/develop
            .then((boardTheme: string) => {
                response.status(HttpStatus.OK).send(boardTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/chatTheme/:pseudonym')
    async setChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setChatTheme(req.params.pseudonym, req.body.name)
=======
    @Post('/chatTheme/:id')
    async setChatTheme(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setChatTheme(req.params.id, req.body.name)
>>>>>>> origin/develop
            .then((chatTheme: string) => {
                response.status(HttpStatus.OK).send(chatTheme);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/addBoard/:pseudonym')
    async addBoard(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addBoard(pseudonym, req.body.name)
=======
    @Post('/addBoard/:id')
    async addBoard(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .addBoard(req.params.id, req.body.name)
>>>>>>> origin/develop
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/addChat/:pseudonym')
    async addChat(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .addChat(pseudonym, req.body.name)
=======
    @Post('/addChat/:id')
    async addChat(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .addChat(req.params.id, req.body.name)
>>>>>>> origin/develop
            .then((success: boolean) => {
                if (success) response.status(HttpStatus.OK).send(success);
                else response.status(HttpStatus.NOT_FOUND).send('An error occured while adding the board');
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }

<<<<<<< HEAD
    @Post('/setLanguage/:pseudonym')
    async setLanguage(@Req() req, @Res() response: Response) {
        const pseudonym = req.params.pseudonym;
        await this.preferenceService
            .setLanguage(pseudonym, req.body.language)
=======
    @Post('/setLanguage/:id')
    async setLanguage(@Req() req, @Res() response: Response) {
        await this.preferenceService
            .setLanguage(req.params.id, req.body.language)
>>>>>>> origin/develop
            .then((language: number) => {
                response.status(HttpStatus.OK).send(language);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to connect to the server' + error.message);
            });
    }
}
