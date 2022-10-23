/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { WordValidationService } from './services/word-validation/word-validation.service';
import { LetterService } from './services/letter/letter.service';
import { PlacementHandlerService } from './services/placement-handler/placement-handler.service';
import { PlayerService } from './services/player/player.service';
import { PlaceLetterService } from './services/place-letter/place-letter.service';

@Module({
    imports: [],
    controllers: [GameController],
    providers: [WordValidationService, LetterService, PlacementHandlerService, PlayerService, PlaceLetterService],
})
export class GameModuleModule {}
