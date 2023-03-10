/* eslint-disable max-lines */
import { Injectable, OnDestroy } from '@angular/core';
import { BOARD_COLUMNS, BOARD_ROWS, EASEL_SIZE, INVALID_INDEX, THREE_SECONDS_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { GridService } from '@app/services/grid.service';
import { PlayerService } from '@app/services/player.service';
import { Vec2 } from '@common/vec2';
import { ClientSocketService } from './client-socket.service';
import { PlacementsHandlerService } from './placements-handler.service';
import { SendMessageService } from './send-message.service';
import { SkipTurnService } from './skip-turn.service';
@Injectable({
    providedIn: 'root',
})
export class PlaceLetterService implements OnDestroy {
    isFirstRound: boolean;
    lastPlacedWord: string;
    scrabbleBoard: string[][];
    dragWord: Vec2[];

    private startPosition: Vec2;
    private orientation: Orientation;
    private word: string;
    // Array of the size of the word to place that tells which letter is valid
    private validLetters: boolean[];
    // If the bonus to form a word with all the letters from the easel applies
    private isEaselSize: boolean;
    // Number of letters used from the easel to form the word
    private numLettersUsedFromEasel: number;
    private isRow: boolean;

    constructor(
        private playerService: PlayerService,
        private gridService: GridService,
        private sendMessageService: SendMessageService,
        private skipTurnService: SkipTurnService,
        private clientSocketService: ClientSocketService,
        private placementsService: PlacementsHandlerService,
    ) {
        this.isFirstRound = true;
        this.scrabbleBoard = [];
        this.validLetters = [];
        this.isEaselSize = false;
        this.dragWord = [];
        this.numLettersUsedFromEasel = 0;
        this.isRow = false;
        for (let i = 0; i < BOARD_ROWS; i++) {
            this.scrabbleBoard[i] = [];
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                this.scrabbleBoard[i][j] = '';
            }
        }

        this.receiveFailure();
        this.receiveSuccess();
        this.receivePlacement();
        this.initBoard();
        this.receiveBoard();
        this.receiveDragPlacement();
    }

    async placeWithKeyboard(position: Vec2, letter: string, orientation: Orientation, indexLetterInWord: number): Promise<boolean> {
        // If we are placing the first letter of the word
        if (indexLetterInWord === 0) this.validLetters = [];

        // If the letter isn't fitting or isn't in the easel, the placement is invalid
        if (this.playerService.indexLetterInEasel(letter, 0) === INVALID_INDEX || !this.isWordFitting(position, orientation, letter)) return false;

        return this.placeLetter(position, letter, orientation, indexLetterInWord);
    }

    placeLetter(position: Vec2, letter: string, orientation: Orientation, indexLetterInWord: number, isDragActivated = false): boolean {
        // If there's already a letter at this position, we verify that it's the same as the one we want to place
        if (this.scrabbleBoard[position.y][position.x] !== '') return this.scrabbleBoard[position.y][position.x].toLowerCase() === letter;

        // If the position is empty, we use a letter from the reserve
        this.scrabbleBoard[position.y][position.x] = letter;
        this.validLetters[indexLetterInWord] = false; // Here the letter is placed but not validated
        this.numLettersUsedFromEasel++;

        if (letter === letter.toUpperCase()) {
            // If we put an upper-case letter (white letter), we remove a '*' from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel('*', 0));
        } else if (!isDragActivated) {
            // Otherwise we remove the respective letter from the easel
            this.playerService.removeLetter(this.playerService.indexLetterInEasel(letter, 0));
        }
        // Display the letter on the scrabble board grid
        this.gridService.drawLetter(this.gridService.gridContextLettersLayer, letter, position, this.playerService.fontSize);
        return true;
    }

    placeCommand(position: Vec2, orientation: Orientation, word: string, dragWord: Vec2[]): void {
        const currentPosition: Vec2 = { x: position.x, y: position.y };
        this.startPosition = position;
        this.orientation = orientation;
        this.word = word;
        this.isRow = orientation === Orientation.Horizontal;
        this.validLetters = [];
        this.dragWord = dragWord;

        // Remove accents from the word to place
        const wordNoAccents = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Reset the array containing the valid letters by making them all valid
        for (let i = 0; i < word.length; i++) this.validLetters[i] = true;
        // Reset the number of letters used from the easel for next placement
        this.numLettersUsedFromEasel = 0;
        if (!this.isPossible(position, orientation, wordNoAccents, JSON.parse(JSON.stringify(dragWord)))) {
            console.log('placement refus??e');
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            let index = 0;
            for (const i of dragWord) {
                this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, i);
                this.playerService.addLetterToEasel(this.playerService.letterForDrag[index].value.toLowerCase());
                index++;
            }
            this.skipTurnService.switchTurn();
            return;
        }
        // Placing all letters of the word
        for (let i = 0; i < wordNoAccents.length; i++) {
            while (this.scrabbleBoard[currentPosition.y][currentPosition.x] !== '') {
                this.placementsService.goToNextPosition(currentPosition, orientation);
            }
            if (!this.placeLetter(currentPosition, wordNoAccents[i], orientation, i, true)) {
                // If the placement of one letter is invalid, we erase all letters placed
                this.handleInvalidPlacement(position, orientation, wordNoAccents);
                this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
                return;
            }
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        if (this.numLettersUsedFromEasel === EASEL_SIZE) this.isEaselSize = true;
        // Validation of the placement
        console.log('placmeent envoy??');
        this.validateKeyboardPlacement(position, orientation, word, true);
    }

    validateKeyboardPlacement(position: Vec2, orientation: Orientation, word: string, isDragActivated = false): void {
        this.startPosition = position;
        this.orientation = orientation;
        this.word = word;
        if (this.numLettersUsedFromEasel === EASEL_SIZE) this.isEaselSize = true;
        // Placing the first word
        if (this.playerService.isFirstPlacement) {
            if (this.placementsService.isFirstWordValid(position, orientation, word)) {
                this.clientSocketService.socket.emit(
                    'validatePlacement',
                    JSON.stringify(position),
                    word,
                    JSON.stringify(orientation),
                    this.isRow,
                    this.isEaselSize,
                    JSON.stringify(this.scrabbleBoard),
                    this.clientSocketService.currentRoom.id,
                    JSON.stringify(this.playerService.currentPlayer),
                    isDragActivated,
                );
                return;
            }
            this.handleInvalidPlacement(position, orientation, word);
            this.sendMessageService.displayMessageByType('ERREUR : Un ou des mots form??s sont invalides', MessageType.Error);
            setTimeout(() => {
                this.skipTurnService.switchTurn();
            }, THREE_SECONDS_DELAY);
            return;
        }
        // Placing the following words
        if (this.isWordTouchingOthers(position, orientation, word)) {
            console.log('envoy??????????');
            this.clientSocketService.socket.emit(
                'validatePlacement',
                JSON.stringify(position),
                word,
                JSON.stringify(orientation),
                this.isRow,
                this.isEaselSize,
                JSON.stringify(this.scrabbleBoard),
                this.clientSocketService.currentRoom.id,
                JSON.stringify(this.playerService.currentPlayer),
                isDragActivated,
            );
            return;
        }

        this.handleInvalidPlacement(position, orientation, word);
        this.sendMessageService.displayMessageByType('ERREUR : Le placement est invalide', MessageType.Error);
    }

    handleInvalidPlacement(position: Vec2, orientation: Orientation, word: string, isDragActivated = false): void {
        const currentPosition = { x: position.x, y: position.y };
        console.log('acccccc');
        console.log(isDragActivated);
        if (isDragActivated) {
            for (const i of this.dragWord) {
                while (currentPosition.x !== i.x && currentPosition.y !== i.y) {
                    this.placementsService.goToNextPosition(currentPosition, orientation);
                }
                this.removePlacedLetter(i, (i.word as string).toLowerCase());
            }
            return;
        }
        for (let i = 0; i < this.validLetters.length; i++) {
            if (this.validLetters[i] === undefined) this.validLetters[i] = true;
            // If the word is invalid, we remove only the letters that we just placed on the grid and add them back to the easel.
            if (!this.validLetters[i]) this.removePlacedLetter(currentPosition, word[i].toLowerCase());
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
    }

    handleValidPlacement(): void {
        this.displayValid();
        this.isFirstRound = false;
        this.playerService.letterForDrag = [];
        this.dragWord = [];
        return;
    }

    removePlacedLetter(position: Vec2, letter: string) {
        this.scrabbleBoard[position.y][position.x] = '';
        this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, position);
        this.playerService.addLetterToEasel(letter);
    }

    isPossible(position: Vec2, orientation: Orientation, word: string, dragWord: Vec2[]): boolean {
        let isPossible = false;
        const pos = dragWord;
        if (this.playerService.isFirstPlacement) {
            if (this.isWordFitting(position, orientation, word)) {
                console.log('first');
                // eslint-disable-next-line max-len
                isPossible = this.placementsService.isFirstWordValid(position, orientation, word) && this.isPositionMatching(pos, orientation); // If the 1st word is placed onto the central position
            }
        } else {
            if (this.isWordFitting(position, orientation, word)) {
                // eslint-disable-next-line max-len
                isPossible = this.isWordTouchingOthers(position, orientation, word) && this.isPositionMatching(dragWord, orientation); // If the word is in contact with other letters on the board
            }
        }
        return isPossible;
    }

    isPositionMatching(positions: Vec2[], orientation: Orientation): boolean {
        console.log('orii');
        console.log(orientation);
        const currentPosition = { x: positions[0].x, y: positions[0].y };
        for (const i of positions) {
            while (this.scrabbleBoard[currentPosition.y][currentPosition.x] !== '') {
                this.placementsService.goToNextPosition(currentPosition, orientation);
            }
            // console.log('autre');
            // console.log(this.scrabbleBoard[currentPosition.x][currentPosition.y]);
            // console.log(currentPosition.x);
            // console.log(currentPosition.y);

            if (currentPosition.x !== i.x || currentPosition.y !== i.y) {
                console.log('erreur');
                console.log(i.x);
                console.log(currentPosition.x);
                console.log(i.y);
                console.log(currentPosition.y);
                console.log('oups');
                return false;
            }
            this.placementsService.goToNextPosition(currentPosition, orientation);
        }
        console.log('yesss');
        return true;
    }

    isWordFitting(position: Vec2, orientation: Orientation, word: string): boolean {
        if (orientation === Orientation.Horizontal && position.x + word.length > BOARD_ROWS) {
            return false;
        } else if (orientation === Orientation.Vertical && position.y + word.length > BOARD_COLUMNS) {
            return false;
        }
        return true;
    }

    isWordValid(position: Vec2, orientation: Orientation, word: string): boolean {
        let isLetterExisting = false;
        // Array containing indexes of the easel that are used by the word we want to place.
        const indexLetters: number[] = [];
        const currentPosition = { x: position.x, y: position.y };

        for (const letter of word) {
            isLetterExisting = this.isLetterOnBoard(currentPosition, letter);
            this.placementsService.goToNextPosition(currentPosition, orientation);

            // If the letter isn't on the board, we look into the easel, else we cannot place the word
            if (!isLetterExisting) {
                isLetterExisting = this.placementsService.isLetterInEasel(letter, indexLetters);
                if (!isLetterExisting) return false;
            }
        }
        return true;
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
        console.log('Reutrn ');
        console.log(isWordTouching);
        return isWordTouching;
    }

    displayValid(): void {
        const column = (this.startPosition.x + 1).toString();
        const row: string = String.fromCharCode(this.startPosition.y + 'a'.charCodeAt(0));
        const charOrientation = this.orientation === Orientation.Horizontal ? 'h' : 'v';
        this.sendMessageService.displayMessageByType(
            this.playerService.currentPlayer.name + ' a plac?? ' + row + column + charOrientation + ' ' + this.word,
            MessageType.Player,
        );
    }

    ngOnDestroy() {
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
    }

    private receiveSuccess() {
        this.clientSocketService.socket.on('receiveSuccess', () => {
            this.handleValidPlacement();
            this.skipTurnService.switchTurn();
        });
    }

    private receiveFailure() {
        this.clientSocketService.socket.on('receiveFail', (position: Vec2, orientation: Orientation, word: string, isDragActivated = false) => {
            this.handleInvalidPlacement(position, orientation, word, isDragActivated);
            this.sendMessageService.displayMessageByType('ERREUR : Un ou des mots form??s sont invalides', MessageType.Error);
            console.log('faillllllllllll');
            this.skipTurnService.switchTurn();
        });
    }

    private receiveBoard(): void {
        this.clientSocketService.socket.on('receiveBoard', (scrabbleBoard: string) => {
            this.scrabbleBoard = JSON.parse(scrabbleBoard);
        });
    }

    private receiveDragPlacement(): void {
        this.clientSocketService.socket.on('receiveDragPlacement', (word: string, scrabbleBoard: string, dragWord: string) => {
            this.placeDragByOpponent(JSON.parse(scrabbleBoard), word, JSON.parse(dragWord));
        });
    }

    private receivePlacement(): void {
        this.clientSocketService.socket.on('receivePlacement', (scrabbleBoard: string, startPosition: string, orientation: string, word: string) => {
            console.log(scrabbleBoard);
            this.placeByOpponent(JSON.parse(scrabbleBoard), JSON.parse(startPosition), JSON.parse(orientation), word);
        });
    }
    private placeDragByOpponent(scrabbleBoard: string[][], word: string, dragWord: Vec2[]): void {
        let index = 0;
        this.scrabbleBoard = scrabbleBoard;
        for (const letter of word) {
            const currentPosition = { x: dragWord[index].x, y: dragWord[index].y } as Vec2;
            if (currentPosition.x !== undefined && currentPosition.y !== undefined) {
                this.gridService.drawLetter(this.gridService.gridContextLettersLayer, letter, currentPosition, this.playerService.fontSize);
                index++;
            }
        }
        this.isFirstRound = false;
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

    private initBoard(): void {
        this.clientSocketService.socket.on('giveBoardToObserver', (scrabbleBoard: string[][]) => {
            for (let i = 0; i < BOARD_ROWS; i++) {
                for (let j = 0; j < BOARD_COLUMNS; j++) {
                    if (scrabbleBoard[j][i] !== '') {
                        this.gridService.drawLetter(
                            this.gridService.gridContextLettersLayer,
                            scrabbleBoard[j][i],
                            { x: i, y: j },
                            this.playerService.fontSize,
                        );
                    }
                }
            }
        });
    }
    private isLetterOnBoard(position: Vec2, letter: string): boolean {
        return letter.toUpperCase() === this.scrabbleBoard[position.y][position.x].toUpperCase();
    }
}
