/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { BOARD_COLUMNS, BOARD_ROWS, EASEL_SIZE, PLAYER_AI_INDEX } from '@app/classes/constants';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { ScoreValidation } from '@app/classes/validation-score';
// eslint-disable-next-line import/no-unresolved
import { Vec2 } from '@common/vec2';
import { PlayerService } from '../player/player.service';
import { WordValidationService } from '../word-validation/word-validation.service';

export class PlaceLetterService {
    isFirstRound: boolean;
    lastPlacedWord: string;
    scrabbleBoard: string[][];
    finalResult: ScoreValidation;

    startPosition: Vec2;
    orientation: Orientation;
    word: string;
    // Array of the size of the word to place that tells which letter is valid
    private validLetters: boolean[];
    // If the bonus to form a word with all the letters from the easel applies
    private isEaselSize: boolean;
    // Number of letters used from the easel to form the word
    private numLettersUsedFromEasel: number;
    private isRow: boolean;

    constructor(
        // private playerService: PlayerService,
        // private gridService: GridService,
        private wordValidationService: WordValidationService,
        private playerService: PlayerService, // private skipTurnService: SkipTurnService, // private clientSocketService: ClientSocketService // private gameSettingsService: GameSettingsService, // private endGameService: EndGameService,
    ) {
        this.isFirstRound = true;
        this.scrabbleBoard = [];
        this.validLetters = [];
        this.isEaselSize = false;
        this.numLettersUsedFromEasel = 0;
        this.isRow = false;
        for (let i = 0; i < BOARD_ROWS; i++) {
            this.scrabbleBoard[i] = [];
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                this.scrabbleBoard[i][j] = '';
            }
        }
        this.finalResult = { validation: false, score: 0 };
        // this.playerService.updateScrabbleBoard(this.scrabbleBoard);
        // this.receivePlacement();
    }

    async placeCommand(position: Vec2, orientation: Orientation, word: string, indexPlayer = PLAYER_AI_INDEX): Promise<boolean> {
        const currentPosition: Vec2 = { x: position.x, y: position.y };
        this.startPosition = position;
        this.orientation = orientation;
        this.word = word;
        this.isRow = orientation === Orientation.Horizontal;
        this.validLetters = [];

        // Remove accents from the word to place
        const wordNoAccents = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Reset the array containing the valid letters by making them all valid
        for (let i = 0; i < word.length; i++) this.validLetters[i] = true;
        // Reset the number of letters used from the easel for next placement
        this.numLettersUsedFromEasel = 0;

        if (!this.isPossible(position, orientation, wordNoAccents, indexPlayer)) {
            //     this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
            return false;
        }

        // Placing all letters of the word
        for (let i = 0; i < wordNoAccents.length; i++) {
            if (!this.placeLetter(currentPosition, wordNoAccents[i], orientation, i, indexPlayer)) {
                // If the placement of one letter is invalid, we erase all letters placed
                this.handleInvalidPlacement(position, orientation, wordNoAccents, indexPlayer);
                // this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
                return false;
            }
            // this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        if (this.numLettersUsedFromEasel === EASEL_SIZE) this.isEaselSize = true;

        // Validation of the placement
        return await this.validatePlacement(position, orientation, wordNoAccents, indexPlayer);
    }

    placeLetter(position: Vec2, letter: string, orientation: Orientation, indexLetterInWord: number, indexPlayer: number): boolean {
        // If there's already a letter at this position, we verify that it's the same as the one we want to place
        if (this.scrabbleBoard[position.y][position.x] !== '') return this.scrabbleBoard[position.y][position.x].toLowerCase() === letter;

        // If the position is empty, we use a letter from the reserve
        this.scrabbleBoard[position.y][position.x] = letter;
        this.validLetters[indexLetterInWord] = false; // Here the letter is placed but not validated
        this.numLettersUsedFromEasel++;

        if (letter === letter.toUpperCase()) {
            // If we put an upper-case letter (white letter), we remove a '*' from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel('*', 0, indexPlayer), indexPlayer);
        } else {
            // Otherwise we remove the respective letter from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel(letter, 0, indexPlayer), indexPlayer);
        }
        // Display the letter on the scrabble board grid
        // this.gridService.drawLetter(this.gridService.gridContextLettersLayer, letter, position, this.playerService.fontSize);
        return true;
    }

    handleInvalidPlacement(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): void {
        const currentPosition = { x: position.x, y: position.y };
        for (let i = 0; i < this.validLetters.length; i++) {
            if (this.validLetters[i] === undefined) this.validLetters[i] = true;
            // If the word is invalid, we remove only the letters that we just placed on the grid and add them back to the easel.
            if (!this.validLetters[i]) this.removePlacedLetter(currentPosition, word[i], indexPlayer);

            // this.placementsService.goToNextPosition(currentPosition, orientation);
        }
    }

    async validatePlacement(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): Promise<boolean> {
        this.finalResult = await this.wordValidationService.validateAllWordsOnBoard(this.scrabbleBoard, this.isEaselSize, this.isRow);

        if (this.finalResult.validation) {
            this.handleValidPlacement(this.finalResult, indexPlayer);
            return true;
        }
        this.handleInvalidPlacement(position, orientation, word, indexPlayer);
        return false;
    }

    handleValidPlacement(finalResult: ScoreValidation, indexPlayer: number): void {
        this.playerService.addScore(finalResult.score, indexPlayer);
        this.playerService.refillEasel(indexPlayer);
        this.isFirstRound = false;
    }

    removePlacedLetter(position: Vec2, letter: string, indexPlayer: number) {
        this.scrabbleBoard[position.y][position.x] = '';
        this.playerService.addLetterToEasel(letter, indexPlayer);
    }

    isPossible(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): boolean {
        let isPossible = false;
        if (this.isFirstRound) {
            if (this.isWordFitting(position, orientation, word)) {
                isPossible =
                    // this.placementsService.isFirstWordValid(position, orientation, word) && // If the 1st word is placed onto the central position
                    this.isWordValid(position, orientation, word, indexPlayer); // If the letters of the word are in the easel or the scrabble board
            }
        } else {
            if (this.isWordFitting(position, orientation, word)) {
                isPossible = this.isWordValid(position, orientation, word, indexPlayer); // && // If the letters of the word are in the easel or the scrabble board
                // this.isWordTouchingOthers(position, orientation, word); // If the word is in contact with other letters on the board
            }
        }
        return isPossible;
    }

    isWordFitting(position: Vec2, orientation: Orientation, word: string): boolean {
        if (orientation === Orientation.Horizontal && position.x + word.length > BOARD_ROWS) {
            return false;
        } else if (orientation === Orientation.Vertical && position.y + word.length > BOARD_COLUMNS) {
            return false;
        }
        return true;
    }

    isWordValid(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): boolean {
        let isLetterExisting = false;
        // Array containing indexes of the easel that are used by the word we want to place.
        const indexLetters: number[] = [];
        const currentPosition = { x: position.x, y: position.y };

        for (const letter of word) {
            isLetterExisting = this.isLetterOnBoard(currentPosition, letter);
            // this.placementsService.goToNextPosition(currentPosition, orientation);

            // If the letter isn't on the board, we look into the easel, else we cannot place the word
            if (!isLetterExisting) {
                // isLetterExisting = this.placementsService.isLetterInEasel(letter, indexPlayer, indexLetters);
                if (!isLetterExisting) return false;
            }
        }
        return true;
    }

    // isWordTouchingOthers(position: Vec2, orientation: Orientation, word: string): boolean {
    //     let isWordTouching = false;
    //     const currentPosition = { x: position.x, y: position.y };
    //     let x = 0;
    //     let y = 0;
    //     if (orientation === Orientation.Horizontal) x = 1;
    //     else if (orientation === Orientation.Vertical) y = 1;

    //     // Search each position around the word that are in bounds of the board
    //     for (let i = 0; i < word.length; i++) {
    //         if (this.placementsService.isPositionFilled({ x: currentPosition.x + y, y: currentPosition.y + x }, this.scrabbleBoard))
    //             isWordTouching = true;
    //         if (this.placementsService.isPositionFilled({ x: currentPosition.x - y, y: currentPosition.y - x }, this.scrabbleBoard))
    //             isWordTouching = true;
    //         if (this.placementsService.isPositionFilled({ x: currentPosition.x + x, y: currentPosition.y + y }, this.scrabbleBoard)) {
    //             if (word.length === 1 || i === word.length - 1) isWordTouching = true;
    //             else if (this.validLetters[i + 1]) isWordTouching = true;
    //         }
    //         if (this.placementsService.isPositionFilled({ x: currentPosition.x - x, y: currentPosition.y - y }, this.scrabbleBoard)) {
    //             if (i === 0) isWordTouching = true;
    //             if (this.validLetters[i - 1]) isWordTouching = true;
    //         }
    //         this.placementsService.goToNextPosition(currentPosition, orientation);
    //     }
    //     return isWordTouching;
    // }

    // ngOnDestroy() {
    //     this.isFirstRound = true;
    //     this.scrabbleBoard = [];
    //     this.validLetters = [];
    //     this.isEaselSize = false;
    //     this.numLettersUsedFromEasel = 0;
    //     this.isRow = false;
    //     for (let i = 0; i < BOARD_ROWS; i++) {
    //         this.scrabbleBoard[i] = [];
    //         for (let j = 0; j < BOARD_COLUMNS; j++) {
    //             this.scrabbleBoard[i][j] = '';
    //         }
    //     }
    // }

    private isLetterOnBoard(position: Vec2, letter: string): boolean {
        return letter.toUpperCase() === this.scrabbleBoard[position.y][position.x].toUpperCase();
    }
}
