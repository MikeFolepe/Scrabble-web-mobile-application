import { CENTRAL_CASE_POSITION } from '@common/constants';
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
    async getPossibilities(easel: string) {
        const patterns = this.strategy.generateAllPatterns(easel, this.placeLetter.isFirstRound);
        let allPossibleWords = this.strategy.generateAllWords(this.strategy.dictionary, patterns);

        if (this.placeLetter.isFirstRound) {
            allPossibleWords.forEach((word) => (word.startIndex = CENTRAL_CASE_POSITION.x));
        } else {
            // Step4: Clip words that can not be on the board
            allPossibleWords = this.strategy.removeIfNotDisposable(allPossibleWords);
        }

        // Step3: Clip words containing more letter than playable
        // Step4: Clip words that can not be on the board
        // Step5: Add the earning points to all words and update the
        allPossibleWords = await this.strategy.calculatePoints(allPossibleWords);
        this.strategy.sortDecreasingPoints(allPossibleWords);
        return allPossibleWords;
    }
    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }
}
