import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fileSystem from 'fs';
@Controller('game')
export class GameController {
    constructor() {}

    @Get('/dictionary/:fileName')
    getDictionnary(@Req() request, @Res() response: Response) {
        const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${request.params.fileName}`, 'utf8'));
        const words = readFile.words;
        response.status(HttpStatus.OK).send(words);
    }

    // @Post('/validateWords/:fileName')
    // validateWords(@Req() request, @Res() response: Response) {
    //     const isValid = this.wordValidator.isValidInDictionary(request.body, request.params.fileName);
    //     response.status(HttpStatus.OK).send(isValid);
    // }
}
