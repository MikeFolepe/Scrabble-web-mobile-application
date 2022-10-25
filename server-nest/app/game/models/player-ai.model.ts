import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { LetterService } from '../services/letter/letter.service';
import { PlaceLetterService } from '../services/place-letter/place-letter.service';
import { PlayerService } from '../services/player/player.service';
import { WordValidationService } from '../word-validation.service';
import { PlaceLetterStrategy } from './place-letter-strategy.model';
import { Player } from './player.model';

export class PlayerAI extends Player {
    strategy: PlaceLetterStrategy;

    constructor(
        id: number,
        name: string,
        letterTable: Letter[],
        score: number = 0,
        playerService: PlayerService,
        player: Player,
        gameSetting: GameSettings,
        placeLetterService: PlaceLetterService,
        letterService: LetterService,
        wordValidation: WordValidationService,
    ) {
        super(id, name, letterTable, score);
        this.strategy = new PlaceLetterStrategy(playerService, player, gameSetting, placeLetterService, letterService, wordValidation);
    }

    play(): void {
        this.strategy.execute();
    }

    getEasel(): string {
        let hand = '[';
        for (const letter of this.letterTable) {
            hand += letter.value;
        }

        return hand + ']';
    }

    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }
}
