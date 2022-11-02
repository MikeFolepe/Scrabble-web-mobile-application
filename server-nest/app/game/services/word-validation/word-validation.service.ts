import { ALL_EASEL_BONUS, BOARD_COLUMNS, BOARD_ROWS, BONUS_POSITIONS, RESERVE } from '@common/constants';
import { ScoreValidation } from '@common/validation-score';
import * as fileSystem from 'fs';

export class WordValidationService {
    playedWords: Map<string, string[]>;
    dictionary: string[];
    private newWords: string[];
    private newPlayedWords: Map<string, string[]>;
    private newPositions: string[];
    private bonusesPositions: Map<string, string>;
    private foundWords: string[];

    constructor(dictFile: string) {
        this.newWords = [];
        this.playedWords = new Map<string, string[]>();
        this.newPlayedWords = new Map<string, string[]>();
        this.newPositions = [];
        this.bonusesPositions = new Map<string, string>(BONUS_POSITIONS);
        this.foundWords = [];
        if (dictFile !== undefined) {
            this.dictionary = JSON.parse(fileSystem.readFileSync(`./dictionaries/${dictFile}`, 'utf8')).words;
        }
    }
    receivePlayedWords(playedWords: string): void {
        this.playedWords = new Map<string, string[]>(JSON.parse(playedWords));
    }
    isValidInDictionary(word: string): boolean {
        if (word.length < 2) return false;
        for (const item of this.dictionary) {
            if (word === item) {
                return true;
            }
        }
        return false;
    }

    findWords(words: string[]): string[] {
        return words
            .toString()
            .replace(/[,][,]+/gi, ' ')
            .replace(/[,]/gi, '')
            .split(' ');
    }

    addToPlayedWords(word: string, positions: string[], map: Map<string, string[]>): void {
        let mapValues = new Array<string>();
        if (map.has(word)) {
            mapValues = map.get(word) as string[];
            for (const position of positions) {
                mapValues.push(position);
            }
            map.set(word, mapValues);
        } else {
            map.set(word, positions);
        }
    }

    containsArray(mainArray: string[], subArray: string[]): boolean {
        return subArray.every(
            (
                (i) => (v: string) =>
                    (i = mainArray.indexOf(v, i) + 1)
            )(0),
        );
    }

    checkIfPlayed(word: string, positions: string[]): boolean {
        if (this.playedWords.has(word)) {
            const mapValues = this.playedWords.get(word) as string[];
            return this.containsArray(mapValues, positions);
        }
        return false;
    }

    getWordHorizontalOrVerticalPositions(word: string, indexLine: number, indexColumn: number, isRow: boolean): string[] {
        let startIndex = 0;
        const positions: string[] = new Array<string>();
        for (const char of word) {
            if (isRow) {
                const indexChar = this.newWords.indexOf(char, startIndex) + 1;
                positions.push(this.getCharPosition(indexLine) + indexChar.toString());
                startIndex = indexChar;
            } else {
                const indexChar = this.newWords.indexOf(char, startIndex);
                const column = indexColumn + 1;
                positions.push(this.getCharPosition(indexChar) + column.toString());
                startIndex = indexChar + 1;
            }
        }

        return positions;
    }

    passThroughAllRowsOrColumns(scrabbleBoard: string[][], isRow: boolean): void {
        let x = 0;
        let y = 0;
        for (let i = 0; i < BOARD_ROWS; i++) {
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                x = isRow ? i : j;
                y = isRow ? j : i;
                this.newWords.push(scrabbleBoard[x][y]);
            }
            this.foundWords = this.findWords(this.newWords);
            this.newPositions = new Array<string>(this.foundWords.length);

            for (const word of this.foundWords) {
                if (word.length >= 2) {
                    this.newPositions = this.getWordHorizontalOrVerticalPositions(word, x, y, isRow);
                    if (!this.checkIfPlayed(word, this.newPositions)) this.addToPlayedWords(word, this.newPositions, this.newPlayedWords);
                }
                this.newPositions = [];
            }
            this.newWords = [];
            this.foundWords = [];
        }
    }

    getCharPosition(line: number): string {
        const charRef = 'A';
        const asciiCode = charRef.charCodeAt(0) + line;
        return String.fromCharCode(asciiCode);
    }

    calculateTotalScore(score: number, words: Map<string, string[]>): number {
        let scoreWord = 0;
        for (const word of words.keys()) {
            const scoreLetter = this.calculateLettersScore(score, word, words.get(word) as string[]);
            scoreWord += this.applyBonusesWord(scoreLetter, words.get(word) as string[]);
        }
        return scoreWord;
    }

    calculateLettersScore(score: number, word: string, positions: string[]): number {
        for (let i = 0; i < word.length; i++) {
            let char = word.charAt(i);
            if (char.toUpperCase() === char) char = '*';

            for (const letter of RESERVE) {
                if (char.toUpperCase() === letter.value)
                    switch (this.bonusesPositions.get(positions[i])) {
                        case 'doubleLetter': {
                            score += letter.points * 2;
                            break;
                        }
                        case 'tripleLetter': {
                            score += letter.points * 3;
                            break;
                        }
                        default: {
                            score += letter.points;
                            break;
                        }
                    }
            }
        }
        return score;
    }

    removeBonuses(map: Map<string, string[]>): void {
        for (const positions of map.values()) {
            for (const position of positions) {
                if (this.bonusesPositions.has(position)) this.bonusesPositions.delete(position);
            }
        }
    }

    applyBonusesWord(score: number, positions: string[]): number {
        for (const position of positions) {
            switch (this.bonusesPositions.get(position)) {
                case 'doubleWord': {
                    score = score * 2;
                    break;
                }
                case 'tripleWord': {
                    score = score * 3;
                    break;
                }
                default: {
                    break;
                }
            }
        }
        return score;
    }

    async validateAllWordsOnBoard(scrabbleBoard: string[][], isEaselSize: boolean, isRow: boolean, isPermanent = true): Promise<ScoreValidation> {
        let scoreTotal = 0;
        this.passThroughAllRowsOrColumns(scrabbleBoard, isRow);
        this.passThroughAllRowsOrColumns(scrabbleBoard, !isRow);
        for (const word of this.newPlayedWords.keys()) {
            const lowerCaseWord = word.toLowerCase();
            if (!this.isValidInDictionary(lowerCaseWord)) {
                this.newPlayedWords.clear();
                return { validation: false, score: scoreTotal };
            }
        }
        scoreTotal += this.calculateTotalScore(scoreTotal, this.newPlayedWords);

        if (isEaselSize) scoreTotal += ALL_EASEL_BONUS;
        if (!isPermanent) {
            this.newPlayedWords.clear();
            return { validation: false, score: scoreTotal };
        }

        this.removeBonuses(this.newPlayedWords);

        for (const word of this.newPlayedWords.keys()) this.addToPlayedWords(word, this.newPlayedWords.get(word) as string[], this.playedWords);
        this.newPlayedWords.clear();
        return { validation: true, score: scoreTotal };
    }
}
