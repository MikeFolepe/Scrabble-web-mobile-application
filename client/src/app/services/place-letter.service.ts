/* eslint-disable max-lines */
// TODO JUSTIFICATION : À confirmer  avec Étienne
import { Injectable, OnDestroy } from '@angular/core';
import {
    BOARD_COLUMNS,
    BOARD_ROWS,
    CENTRAL_CASE_POSITION,
    EASEL_SIZE,
    INVALID_INDEX,
    PLAYER_AI_INDEX,
    PLAYER_ONE_INDEX,
    THREE_SECONDS_DELAY,
} from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { ScoreValidation } from '@app/classes/validation-score';
import { GridService } from '@app/services/grid.service';
import { PlayerService } from '@app/services/player.service';
import { WordValidationService } from '@app/services/word-validation.service';
import { Vec2 } from '@common/vec2';
import { ClientSocketService } from './client-socket.service';
import { EndGameService } from './end-game.service';
import { GameSettingsService } from './game-settings.service';
import { ObjectivesService } from './objectives.service';
import { PlacementsHandlerService } from './placements-handler.service';
import { SendMessageService } from './send-message.service';
import { SkipTurnService } from './skip-turn.service';
@Injectable({
    providedIn: 'root',
})
export class PlaceLetterService implements OnDestroy {
    isFirstRound: boolean = true;
    lastPlacedWord: string;
    scrabbleBoard: string[][]; // 15x15 array

    private startPosition: Vec2;
    private orientation: Orientation;
    private word: string;
    private validLetters: boolean[]; // Array of the size of the word to place that tells which letter is valid
    private isEaselSize: boolean; // If the bonus to form a word with all the letters from the easel applies
    private numLettersUsedFromEasel: number; // Number of letters used from the easel to form the word
    private isRow: boolean;

    constructor(
        private playerService: PlayerService,
        private gridService: GridService,
        private wordValidationService: WordValidationService,
        private sendMessageService: SendMessageService,
        private skipTurnService: SkipTurnService,
        private clientSocketService: ClientSocketService,
        private gameSettingsService: GameSettingsService,
        private endGameService: EndGameService,
        private objectivesService: ObjectivesService,
        private placementsService: PlacementsHandlerService,
    ) {
        this.scrabbleBoard = []; // Initializes the array with empty letters
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
        this.playerService.updateScrabbleBoard(this.scrabbleBoard);
        this.receivePlacement();
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
        this.numLettersUsedFromEasel = 0; // Reset the number of letters used from the easel for next placement

        if (!this.isPossible(position, orientation, wordNoAccents, indexPlayer)) {
            this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
            return false;
        }

        // Placing all letters of the word
        for (let i = 0; i < wordNoAccents.length; i++) {
            if (!this.placeLetter(currentPosition, wordNoAccents[i], orientation, i, indexPlayer)) {
                // If the placement of one letter is invalid, we erase all letters placed
                this.handleInvalidPlacement(position, orientation, wordNoAccents, indexPlayer);
                this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
                return false;
            }
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        if (this.numLettersUsedFromEasel === EASEL_SIZE) this.isEaselSize = true;

        // Validation of the placement
        return await this.validatePlacement(position, orientation, wordNoAccents, indexPlayer);
    }

    async placeWithKeyboard(
        position: Vec2,
        letter: string,
        orientation: Orientation,
        indexLetterInWord: number,
        indexPlayer: number,
    ): Promise<boolean> {
        // If we are placing the first letter of the word
        if (indexLetterInWord === 0) {
            this.validLetters = [];
        }
        // If the letter isn't fitting or isn't in the easel, the placement is invalid
        if (this.playerService.indexLetterInEasel(letter, 0, indexPlayer) === INVALID_INDEX || !this.isWordFitting(position, orientation, letter)) {
            return false;
        }
        return this.placeLetter(position, letter, orientation, indexLetterInWord, indexPlayer);
    }

    placeLetter(position: Vec2, letter: string, orientation: Orientation, indexLetterInWord: number, indexPlayer: number): boolean {
        // If there's already a letter at this position, we verify that it's the same as the one we want to place
        if (this.scrabbleBoard[position.y][position.x] !== '') {
            return this.scrabbleBoard[position.y][position.x].toLowerCase() === letter;
        }
        // If the position is empty, we use a letter from the reserve
        this.scrabbleBoard[position.y][position.x] = letter;
        this.validLetters[indexLetterInWord] = false; // The letter is not yet validated
        this.numLettersUsedFromEasel++;

        if (letter === letter.toUpperCase()) {
            // If we put an upper-case letter (white letter), we remove a '*' from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel('*', 0, indexPlayer), indexPlayer);
        } else {
            // Otherwise we remove the respective letter from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel(letter, 0, indexPlayer), indexPlayer);
        }
        // Display the letter on the scrabble board grid
        this.gridService.drawLetter(this.gridService.gridContextLettersLayer, letter, position, this.playerService.fontSize);
        return true;
    }

    async validatePlacement(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): Promise<boolean> {
        // Validation of the placement
        const finalResult: ScoreValidation = await this.wordValidationService.validateAllWordsOnBoard(
            this.scrabbleBoard,
            this.isEaselSize,
            this.isRow,
        );

        if (finalResult.validation) {
            this.endGameService.addActionsLog('placerSucces');
            this.clientSocketService.socket.emit('sendActions', this.endGameService.actionsLog, this.clientSocketService.roomId);
            this.handleValidPlacement(finalResult, indexPlayer);
            const lastLetters = this.placementsService.getLastLettersPlaced(this.startPosition, this.orientation, this.word, this.validLetters);
            this.objectivesService.playerIndex = indexPlayer;
            this.objectivesService.extendedWords = this.placementsService.getExtendedWords(this.orientation, this.scrabbleBoard, lastLetters);
            this.objectivesService.checkObjectivesCompletion();
            this.skipTurnService.switchTurn();
            return true;
        }
        this.endGameService.addActionsLog('placerEchec');
        this.clientSocketService.socket.emit('sendActions', this.endGameService.actionsLog, this.clientSocketService.roomId);
        this.handleInvalidPlacement(position, orientation, word, indexPlayer);
        this.sendMessageService.displayMessageByType('ERREUR : Un ou des mots formés sont invalides', MessageType.Error);
        setTimeout(() => {
            if (this.gameSettingsService.isSoloMode && indexPlayer === PLAYER_ONE_INDEX) this.skipTurnService.switchTurn();
            else if (!this.gameSettingsService.isSoloMode) this.skipTurnService.switchTurn();
        }, THREE_SECONDS_DELAY);
        return false;
    }

    async validateKeyboardPlacement(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): Promise<boolean> {
        this.startPosition = position;
        this.orientation = orientation;
        this.word = word;
        // Placing the first word
        if (this.isFirstRound) {
            if (this.isFirstWordValid(position, orientation, word)) {
                return await this.validatePlacement(position, orientation, word, indexPlayer);
            }
            this.handleInvalidPlacement(position, orientation, word, indexPlayer);
            this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
            return false;
        } // Placing the following words
        if (this.isWordTouchingOthers(position, orientation, word)) {
            return await this.validatePlacement(position, orientation, word, indexPlayer);
        }
        this.handleInvalidPlacement(position, orientation, word, indexPlayer);
        this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
        return false;
    }

    handleInvalidPlacement(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): void {
        setTimeout(() => {
            const currentPosition = { x: position.x, y: position.y };
            for (let i = 0; i < this.validLetters.length; i++) {
                if (this.validLetters[i] === undefined) this.validLetters[i] = true;
                // If the word is invalid, we remove only the letters that we just placed on the grid and add them back to the easel.
                if (!this.validLetters[i]) {
                    this.removePlacedLetter(currentPosition, word[i], indexPlayer);
                }
                this.placementsService.goToNextPosition(currentPosition, orientation);
            }
        }, THREE_SECONDS_DELAY); // Waiting 3 seconds to erase the letters on the grid
    }

    handleValidPlacement(finalResult: ScoreValidation, indexPlayer: number): void {
        this.playerService.addScore(finalResult.score, indexPlayer);
        this.playerService.updateScrabbleBoard(this.scrabbleBoard);
        this.playerService.refillEasel(indexPlayer); // Fill the easel with new letters from the reserve
        this.isFirstRound = false;
        // Emit to server on multiplayer mode
        if (!this.gameSettingsService.isSoloMode) {
            this.clientSocketService.socket.emit(
                'sendPlacement',
                this.scrabbleBoard,
                this.startPosition,
                this.orientation,
                this.word,
                this.clientSocketService.roomId,
            );
        }
    }

    removePlacedLetter(position: Vec2, letter: string, indexPlayer: number) {
        this.scrabbleBoard[position.y][position.x] = '';
        this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, position);
        this.playerService.addLetterToEasel(letter, indexPlayer);
    }

    isPossible(position: Vec2, orientation: Orientation, word: string, indexPlayer: number): boolean {
        let isPossible = false;
        if (this.isFirstRound) {
            if (this.isWordFitting(position, orientation, word)) {
                isPossible =
                    this.isFirstWordValid(position, orientation, word) && // If the 1st word is placed onto the central position
                    this.isWordValid(position, orientation, word, indexPlayer); // If the letters of the word are in the easel or the scrabble board
            }
        } else {
            if (this.isWordFitting(position, orientation, word)) {
                isPossible =
                    this.isWordValid(position, orientation, word, indexPlayer) && // If the letters of the word are in the easel or the scrabble board
                    this.isWordTouchingOthers(position, orientation, word); // If the word is in contact with other letters on the board
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
        const indexLetters: number[] = []; // Array containing indexes of the easel that are used by the word we want to place.
        const currentPosition = { x: position.x, y: position.y };

        for (const letter of word) {
            isLetterExisting = this.isLetterOnBoard(currentPosition, letter);
            this.placementsService.goToNextPosition(currentPosition, orientation);

            // If the letter isn't on the board, we look into the easel
            if (!isLetterExisting) {
                isLetterExisting = this.isLetterInEasel(letter, indexPlayer, indexLetters);
                // If the letter isn't on the board or present in the easel, we can't place the word
                if (!isLetterExisting) return false;
            }
        }
        return true;
    }

    isLetterInEasel(letter: string, indexPlayer: number, indexLetters: number[]): boolean {
        let isLetterExisting = false;
        let currentLetterIndex = this.playerService.indexLetterInEasel(letter, 0, indexPlayer);

        if (currentLetterIndex !== INVALID_INDEX) isLetterExisting = true;
        for (const index of indexLetters) {
            while (currentLetterIndex === index) {
                currentLetterIndex = this.playerService.indexLetterInEasel(letter, currentLetterIndex + 1, indexPlayer);
                if (currentLetterIndex === INVALID_INDEX) isLetterExisting = false;
            }
        }
        if (isLetterExisting) {
            indexLetters.push(currentLetterIndex); // We push the index so we know it is used
        }
        return isLetterExisting;
    }

    isFirstWordValid(position: Vec2, orientation: Orientation, word: string): boolean {
        const currentPosition = { x: position.x, y: position.y };
        // JUSTIFICATION : Neither the variable 'word' nor 'i' are used inside the loop
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < word.length; i++) {
            if (currentPosition.x === CENTRAL_CASE_POSITION.x && currentPosition.y === CENTRAL_CASE_POSITION.y) return true;
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        return false;
    }

    isWordTouchingOthers(position: Vec2, orientation: Orientation, word: string): boolean {
        let isWordTouching = false;
        const currentPosition = { x: position.x, y: position.y };
        let x = 0;
        let y = 0;
        if (orientation === Orientation.Horizontal) x = 1;
        else if (orientation === Orientation.Vertical) y = 1;

        // Search each position around the word that are in bounds of the board
        for (let i = 0; i < word.length; i++) {
            if (this.placementsService.isPositionFilled({ x: currentPosition.x + y, y: currentPosition.y + x }, this.scrabbleBoard))
                isWordTouching = true;
            if (this.placementsService.isPositionFilled({ x: currentPosition.x - y, y: currentPosition.y - x }, this.scrabbleBoard))
                isWordTouching = true;
            if (this.placementsService.isPositionFilled({ x: currentPosition.x + x, y: currentPosition.y + y }, this.scrabbleBoard)) {
                if (word.length === 1 || i === word.length - 1) isWordTouching = true;
                else if (this.validLetters[i + 1]) isWordTouching = true;
            }
            if (this.placementsService.isPositionFilled({ x: currentPosition.x - x, y: currentPosition.y - y }, this.scrabbleBoard)) {
                if (i === 0) isWordTouching = true;
                if (this.validLetters[i - 1]) isWordTouching = true;
            }
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        return isWordTouching;
    }

    ngOnDestroy() {
        this.isFirstRound = true;
        this.scrabbleBoard = []; // Initializes the array with empty letters
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
    }

    private receivePlacement(): void {
        this.clientSocketService.socket.on(
            'receivePlacement',
            (scrabbleBoard: string[][], startPosition: Vec2, orientation: Orientation, word: string) => {
                this.placeByOpponent(scrabbleBoard, startPosition, orientation, word);
            },
        );
    }

    private placeByOpponent(scrabbleBoard: string[][], startPosition: Vec2, orientation: Orientation, word: string): void {
        const currentPosition = { x: startPosition.x, y: startPosition.y };
        this.scrabbleBoard = scrabbleBoard;
        for (const letter of word) {
            this.gridService.drawLetter(this.gridService.gridContextLettersLayer, letter, currentPosition, this.playerService.fontSize);
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        this.isFirstRound = false;
    }
    private isLetterOnBoard(position: Vec2, letter: string): boolean {
        return letter.toUpperCase() === this.scrabbleBoard[position.y][position.x].toUpperCase();
    }
}
