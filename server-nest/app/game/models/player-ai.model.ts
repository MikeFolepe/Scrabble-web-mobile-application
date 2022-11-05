import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { LetterService } from '../services/letter/letter.service';
import { PlaceLetterService } from '../services/place-letter/place-letter.service';
import { WordValidationService } from '../services/word-validation/word-validation.service';
import { PlaceLetterStrategy } from './place-letter-strategy.model';
import { Player } from './player.model';

export class PlayerAI extends Player {
    strategy: PlaceLetterStrategy;
    placeLetter: PlaceLetterService;

    constructor(
        name: string,
        letterTable: Letter[],
        player: Player,
        gameSetting: GameSettings,
        placeLetterService: PlaceLetterService,
        letterService: LetterService,
        wordValidation: WordValidationService,
        score: number = 0,
    ) {
        super(name, letterTable, score);
        this.placeLetter = placeLetterService;
        this.strategy = new PlaceLetterStrategy(letterTable, player, gameSetting, this.placeLetter, letterService, wordValidation);
    }

    async play(index: number): Promise<void> {
        await this.strategy.execute(index);
    }
    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }
}
