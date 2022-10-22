/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { WordValidationService } from './services/word-validation/word-validation.service';

@Module({
    imports: [],
    controllers: [GameController],
    providers: [WordValidationService],
})
export class GameModuleModule {}
