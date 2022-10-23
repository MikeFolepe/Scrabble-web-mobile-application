/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { WordValidationService } from './services/word-validation/word-validation.service';
import { LetterService } from './services/letter/letter.service';

@Module({
    imports: [],
    controllers: [GameController],
    providers: [WordValidationService, LetterService],
})
export class GameModuleModule {}
