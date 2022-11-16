/* eslint-disable max-lines */
import { BEGINNER_POINTING_RANGE, BOARD_COLUMNS, BOARD_ROWS, CENTRAL_CASE_POSITION, INVALID_INDEX } from '@app/classes/constants';
import { CustomRange } from '@app/classes/range';
import { BoardPattern, Orientation, PatternInfo, PossibleWords } from '@app/classes/scrabble-board-pattern';
import { EASEL_SIZE, MIN_RESERVE_SIZE_TO_SWAP } from '@common/constants';
import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { Vec2 } from '@common/vec2';
import { LetterService } from '../services/letter/letter.service';
import { PlaceLetterService } from '../services/place-letter/place-letter.service';
import { WordValidationService } from '../services/word-validation/word-validation.service';
import { PlayerAI } from './player-ai.model';
import { Player } from './player.model';

export class PlaceLetterStrategy {
    dictionary: string[];
    pointingRange: CustomRange;
    player: Player;
    gameSettings: GameSettings;
    placeLetterService: PlaceLetterService;
    letterService: LetterService;
    wordValidation: WordValidationService;
    letterTable: Letter[];
    private board: string[][][];
    private isFirstRoundAi: boolean;
    constructor(
        letterTable,
        player: Player,
        gameSettings: GameSettings,
        placeLetterService: PlaceLetterService,
        letterService: LetterService,
        wordValidation: WordValidationService,
    ) {
        this.dictionary = wordValidation.dictionary;
        this.pointingRange = BEGINNER_POINTING_RANGE;
        this.board = [];
        this.isFirstRoundAi = true;
        this.player = player;
        this.gameSettings = gameSettings;
        this.placeLetterService = placeLetterService;
        this.letterService = letterService;
        this.wordValidation = wordValidation;
        this.letterTable = letterTable;
    }
    placeWordOnBoard(scrabbleBoard: string[][], word: string, start: Vec2, orientation: Orientation): string[][] {
        for (let j = 0; orientation === Orientation.Horizontal && j < word.length; j++) {
            scrabbleBoard[start.x][start.y + j] = word[j];
        }

        for (let i = 0; orientation === Orientation.Vertical && i < word.length; i++) {
            scrabbleBoard[start.x + i] = [];
            scrabbleBoard[start.x + i][start.y] = word[i];
        }

        return scrabbleBoard;
    }
    async calculatePoints(allPossibleWords: PossibleWords[]): Promise<PossibleWords[]> {
        for (const word of allPossibleWords) {
            const start: Vec2 = word.orientation ? { x: word.startIndex, y: word.line } : { x: word.line, y: word.startIndex };
            const orientation: Orientation = word.orientation;
            const currentBoard = JSON.parse(JSON.stringify(this.placeLetterService.scrabbleBoard));
            const updatedBoard = this.placeWordOnBoard(currentBoard, word.word, start, orientation);
            const scoreValidation = await this.wordValidation.validateAllWordsOnBoard(
                updatedBoard,
                word.word.length === EASEL_SIZE + 1,
                word.orientation === Orientation.Horizontal,
                false,
            );
            word.point = scoreValidation.validation ? scoreValidation.score : 0;
        }
        allPossibleWords = allPossibleWords.filter((word) => word.point > 0);

        return allPossibleWords;
    }

    filterByRange(allPossibleWords: PossibleWords[], pointingRange: CustomRange): PossibleWords[] {
        return allPossibleWords.filter((word) => word.point >= pointingRange.min && word.point <= pointingRange.max);
    }

    async execute(index: number): Promise<void> {
        const isFirstRound = this.placeLetterService.isFirstRound;
        const scrabbleBoard = this.placeLetterService.scrabbleBoard;
        let allPossibleWords: PossibleWords[];

        this.initializeArray(scrabbleBoard);

        // Step1: Scan the board and retrieve all patterns
        const patterns = this.generateAllPatterns(this.getEasel(), isFirstRound);
        // Step2: Generate all words in the dictionary satisfying the patterns
        allPossibleWords = this.generateAllWords(this.dictionary, patterns);
        if (isFirstRound) {
            allPossibleWords.forEach((word) => (word.startIndex = CENTRAL_CASE_POSITION.x));
            this.placeLetterService.isFirstRound = false;
        } else {
            // Step4: Clip words that can not be on the board
            allPossibleWords = this.removeIfNotDisposable(allPossibleWords);
        }

        console.log('96place stra');
        // Step3: Clip words containing more letter than playable
        // allPossibleWords = this.removeIfNotEnoughLetter(allPossibleWords, playerAi);
        // Step4: Clip words that can not be on the board
        console.log('102place stra');
        // Step5: Add the earning points to all words and update the
        allPossibleWords = await this.calculatePoints(allPossibleWords);
        console.log('106place stra');
        // Step6: Sort the words
        this.sortDecreasingPoints(allPossibleWords);
        // matchingPointingRangeWords = this.filterByRange(allPossibleWords, this.pointingRange);
        // Step7: Place one word between all the words that have passed the steps
        // console.log(allPossibleWords);
        await this.computeResults(allPossibleWords, true, index);
        // await this.computeResults(matchingPointingRangeWords, false, index);

        // Step8: Alert the debug about the alternatives
        // playerAiService.debugService.receiveAIDebugPossibilities(allPossibleWords);
    }
    getEasel(): string {
        let hand = '[';
        for (const letter of this.letterTable) {
            hand += letter.value;
        }

        return hand + ']';
    }

    swap(isExpertLevel: boolean): boolean {
        const playerAi = this.player as PlayerAI;
        const lettersToSwap: string[] = [];

        // No swap possible
        if (this.letterService.reserveSize === 0) {
            // this.skip(true);
            return false;
        }
        // According to game mode some cases might not be possible according to rules
        if (!isExpertLevel && this.letterService.reserveSize < MIN_RESERVE_SIZE_TO_SWAP) {
            // this.skip(true);
            return false;
        }

        // Set the number of letter to be changed
        let numberOfLetterToChange: number;
        do {
            numberOfLetterToChange = this.generateRandomNumber(Math.min(playerAi.letterTable.length + 1, this.letterService.reserveSize + 1));
        } while (numberOfLetterToChange === 0);

        if (isExpertLevel) numberOfLetterToChange = Math.min(playerAi.letterTable.length, this.letterService.reserveSize);

        // Choose the index of letters to be changed
        const indexOfLetterToBeChanged: number[] = [];
        while (indexOfLetterToBeChanged.length < numberOfLetterToChange) {
            const candidate = this.generateRandomNumber(playerAi.letterTable.length);
            if (indexOfLetterToBeChanged.indexOf(candidate) === INVALID_INDEX) indexOfLetterToBeChanged.push(candidate);
        }

        for (const index of indexOfLetterToBeChanged) {
            lettersToSwap.push(playerAi.letterTable[index].value.toLowerCase());
        }

        // For each letter chosen to be changed : 1. add it to reserve ; 2.get new letter
        for (const index of indexOfLetterToBeChanged) {
            this.letterService.addLetterToReserve(playerAi.letterTable[index].value);
            playerAi.letterTable[index] = this.letterService.getRandomLetter();
        }

        // Alert the context about the operation performed
        // this.sendMessageService.displayMessageByType(
        //     this.playerService.players[PLAYER_AI_INDEX].name + ' : ' + '!échanger ' + lettersToSwap,
        //     MessageType.Opponent,
        // );

        // Switch turn
        // this.endGameService.actionsLog.push('echanger');
        // this.skip(false);
        return true;
    }

    generateRandomNumber(maxValue: number): number {
        // Number [0, maxValue[
        return Math.floor(Number(Math.random()) * maxValue);
    }

    sortDecreasingPoints(allPossibleWords: PossibleWords[]): void {
        allPossibleWords.sort(this.sortDecreasing);
    }
    sortDecreasing = (word1: PossibleWords, word2: PossibleWords) => {
        const equalSortNumbers = 0;
        const greaterSortNumber = 1;
        const lowerSortNumber = -1;

        if (word1.point === word2.point) return equalSortNumbers;
        return word1.point < word2.point ? greaterSortNumber : lowerSortNumber;
    };
    async place(word: PossibleWords, index: number): Promise<boolean> {
        const startPos = word.orientation ? { x: word.line, y: word.startIndex } : { x: word.startIndex, y: word.line };
        return await this.placeLetterService.placeCommand(startPos, word.orientation, word.word, index);
    }

    private async computeResults(possibilities: PossibleWords[], isExpertLevel = true, index: number): Promise<void> {
        if (possibilities.length === 0) {
            this.swap(isExpertLevel);
            return;
        }

        let wordIndex = 0;
        if (isExpertLevel) {
            let place = false;
            while (!place && possibilities.length !== 0) {
                place = await this.place(possibilities[wordIndex], index);
                possibilities.splice(0, 1);
            }
            return;
        }

        wordIndex = this.generateRandomNumber(possibilities.length);
        await this.place(possibilities[wordIndex], index);
        possibilities.splice(wordIndex, 1);
    }

    private initializeArray(scrabbleBoard: string[][]): void {
        const array: string[][][] = new Array(Object.keys(Orientation).length / 2);
        array[Orientation.Horizontal] = new Array(BOARD_COLUMNS);
        array[Orientation.Vertical] = new Array(BOARD_ROWS);
        // Initialize the tridimensional array representing the scrabble board
        // array[horizontal or Vertical][row number][letter] <=> array[2 dimensions][15 rows/dimensions][15 tile/row]
        for (let i = 0; i < BOARD_ROWS; i++) {
            array[Orientation.Horizontal][i] = scrabbleBoard[i];
            const column: string[] = [];
            for (let j = 0; j < BOARD_COLUMNS; j++) column.push(scrabbleBoard[j][i]);

            array[Orientation.Vertical][i] = column;
        }

        this.board = array;
    }

    private removeIfNotDisposable(allPossibleWords: PossibleWords[]): PossibleWords[] {
        const filteredWords: PossibleWords[] = [];
        const regex1 = new RegExp('(?<=[A-Za-z])(,?)(?=[A-Za-z])', 'g');
        const regex2 = new RegExp('[,]', 'g');
        const regex3 = new RegExp('[a-z]{1,}', 'g');
        for (const word of allPossibleWords) {
            // Fill the blank tiles with space
            let line = this.board[word.orientation][word.line]
                .map((element: string) => {
                    return element === '' ? ' ' : element;
                })
                .toString();
            line = line.replace(regex2, '');
            // BUG LINE 256 WHEN THE AI DOES THE FIRST PLACEMENT OF THE GAME
            const radixes = !this.placeLetterService.isEmpty
                ? (this.board[word.orientation][word.line].toString().toLowerCase().replace(regex1, '').match(regex3) as string[])
                : [];
            if (this.isWordMovableOnBoard(line, word, radixes)) filteredWords.push(word);
        }

        return filteredWords;
    }

    private isWordMovableOnBoard(line: string, wordToPlace: PossibleWords, radixes: string[]): boolean {
        const isEmptyCase = new Array<boolean>(wordToPlace.word.length);
        isEmptyCase.fill(true);

        let pattern = '';

        for (const root of radixes) {
            const startIndex = wordToPlace.word.search(root);
            const endIdx = startIndex + root.length;
            for (let i = startIndex; i < endIdx; i++) {
                isEmptyCase[i] = false;
            }
        }

        for (let i = 0; i < isEmptyCase.length; i++) {
            // Construct the word skeleton by replacing empty tiles in the row by spaces
            // and the filled tiles by the letter value actually in the row
            pattern += isEmptyCase[i] ? ' ' : wordToPlace.word[i];
        }

        // Search this skeleton in the row
        const start = line.search(pattern);
        const end = start + wordToPlace.word.length - 1;

        if (start === INVALID_INDEX) return false;

        // If found set the starting positing for later placing
        wordToPlace.startIndex = start;
        // If found the word must not touch the adjacent words
        return this.isWordOverWriting(line, start, end, wordToPlace.word.length) ? false : true;
    }

    private isWordOverWriting(line: string, startIndex: number, endIdx: number, wordLength: number): boolean {
        if (wordLength !== BOARD_ROWS) {
            const touchOtherWordByRight = startIndex === 0 && line[endIdx + 1] !== ' ';
            const touchOtherWordByLeft = endIdx === BOARD_ROWS && line[startIndex - 1] !== ' ';
            const touchOtherWordByRightOrLeft = startIndex !== 0 && endIdx !== BOARD_ROWS && line[startIndex - 1] !== ' ' && line[endIdx + 1] !== ' ';

            // The beginning and the end of the word must not touch another
            if (touchOtherWordByRight || touchOtherWordByLeft || touchOtherWordByRightOrLeft) return true;
        }
        return false;
    }

    private removeIfNotEnoughLetter(allPossibleWords: PossibleWords[], player: PlayerAI): PossibleWords[] {
        const filteredWords: PossibleWords[] = [];

        for (const wordObject of allPossibleWords) {
            let isWordValid = true;
            for (const letter of wordObject.word) {
                const regex1 = new RegExp(letter, 'g');
                const regex2 = new RegExp('[,]{1,}', 'g');
                const amountOfLetterNeeded: number = (wordObject.word.match(regex1) as string[]).length;
                const amountOfLetterPresent: number = (
                    this.board[wordObject.orientation][wordObject.line].toString().replace(regex2, '').match(regex1) || []
                ).length;
                const playerAmount = 0;

                if (amountOfLetterNeeded > playerAmount + amountOfLetterPresent) {
                    // Not add the words that need more letter than available
                    isWordValid = false;
                    break;
                }
            }

            if (isWordValid) filteredWords.push(wordObject);
        }

        return filteredWords;
    }

    private generateAllWords(dictionaryToLookAt: string[], patterns: BoardPattern): PossibleWords[] {
        // Generate all words satisfying the patterns found
        const allWords: PossibleWords[] = [];
        for (const pattern of patterns.horizontal) {
            const regex = new RegExp(pattern.pattern, 'g');
            for (const word of dictionaryToLookAt) {
                if (regex.test(word) && this.checkIfWordIsPresent(pattern.pattern, word))
                    allWords.push({ word, orientation: Orientation.Horizontal, line: pattern.line, startIndex: 0, point: 0 });
            }
        }

        for (const pattern of patterns.vertical) {
            const regex = new RegExp(pattern.pattern, 'g');
            for (const word of dictionaryToLookAt) {
                if (regex.test(word) && this.checkIfWordIsPresent(pattern.pattern, word))
                    allWords.push({ word, orientation: Orientation.Vertical, line: pattern.line, startIndex: 0, point: 0 });
            }
        }
        return allWords;
    }

    private checkIfWordIsPresent(pattern: string, word: string): boolean {
        const regex = new RegExp('(?<=[*])(([a-z]*)?)', 'g');
        const wordPresent = pattern.match(regex);

        for (let i = 0; wordPresent !== null && i < wordPresent.length; i++) {
            if (wordPresent[i] === word) return false;
        }

        return true;
    }

    private generateAllPatterns(playerHand: string, isFirstRound: boolean): BoardPattern {
        let horizontal: PatternInfo[] = [];
        let vertical: PatternInfo[] = [];

        if (isFirstRound) {
            // At first round the only pattern is the letter in the player's easel
            horizontal.push({ line: CENTRAL_CASE_POSITION.x, pattern: '^' + playerHand.toLowerCase() + '*$' });
            vertical.push({ line: CENTRAL_CASE_POSITION.y, pattern: '^' + playerHand.toLowerCase() + '*$' });
            return { horizontal, vertical };
        }

        horizontal = this.generatePattern(Orientation.Horizontal, playerHand);
        vertical = this.generatePattern(Orientation.Vertical, playerHand);
        return { horizontal, vertical };
    }

    private generatePattern(orientation: Orientation, playerHand: string): PatternInfo[] {
        const patternArray: PatternInfo[] = [];

        const regex1 = new RegExp('(?<=[A-Za-z])(,?)(?=[A-Za-z])', 'g');
        const regex2 = new RegExp('[,]{1,}', 'g');

        for (let line = 0; line < BOARD_COLUMNS; line++) {
            let pattern = this.board[orientation][line]
                .toString()
                .replace(regex1, '')
                .replace(regex2, playerHand + '*')
                .toLowerCase();
            // If it's not an empty row
            if (pattern !== playerHand.toLowerCase() + '*') {
                pattern = '^' + pattern + '$';
                patternArray.push({ line, pattern });
            }
        }
        return patternArray;
    }
}
