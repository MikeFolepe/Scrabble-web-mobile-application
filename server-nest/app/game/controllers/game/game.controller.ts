import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import * as fileSystem from 'fs';
@Controller('game')
export class GameController {
    @Get('/dictionary/:fileName')
    getDictionnary(@Req() request, @Res() response) {
        const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${request.params.fileName}`, 'utf8'));
        const words = readFile.words;
        response.status(HttpStatus.OK).send(words);
    }
}
