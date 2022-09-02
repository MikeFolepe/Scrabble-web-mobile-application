import { Injectable } from '@angular/core';
import { BOARD_COLUMNS, BOARD_ROWS } from '@app/classes/constants';
import { Direction } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@common/vec2';
import { ClientSocketService } from './client-socket.service';
import { WordValidationService } from './word-validation.service';

@Injectable({
    providedIn: 'root',
})
export class PlacementsHandlerService {
    lastLettersPlaced: Map<string, Vec2>;
    extendingPositions: string[];
    extendedWords: string[];

    constructor(private wordValidationService: WordValidationService, private clientSocketService: ClientSocketService) {
        this.lastLettersPlaced = new Map<string, Vec2>();
        this.extendingPositions = [];
        this.receiveCurrentWords();
    }

    receiveCurrentWords(): void {
        this.clientSocketService.socket.on('receiveCurrentWords', (currentWords: string, priorCurrentWords: string) => {
            this.wordValidationService.currentWords = new Map<string, string[]>(JSON.parse(currentWords));
            this.wordValidationService.priorCurrentWords = new Map<string, string[]>(JSON.parse(priorCurrentWords));
        });
    }

    getExtendedWords(orientation: Orientation, scrabbleBoard: string[][], lastLettersPlaced: Map<string, Vec2>): string[] {
        this.lastLettersPlaced = lastLettersPlaced;
        this.extendedWords = [];
        this.extendingPositions = [];
        for (const letter of this.lastLettersPlaced.keys()) {
            const position = this.lastLettersPlaced.get(letter) as Vec2;
            if (
                this.findExtendedWords({ x: position.x, y: position.y }, orientation, scrabbleBoard, Direction.Forwards) ||
                this.findExtendedWords({ x: position.x, y: position.y }, orientation, scrabbleBoard, Direction.Backwards)
            )
                this.extendingPositions.push(this.getCharPosition(position));
        }
        this.clientSocketService.socket.emit(
            'updateCurrentWords',
            JSON.stringify(Array.from(this.wordValidationService.currentWords)),
            JSON.stringify(Array.from(this.wordValidationService.priorCurrentWords)),
            this.clientSocketService.roomId,
        );
        return this.extendedWords;
    }

    findExtendedWords(position: Vec2, orientation: Orientation, scrabbleBoard: string[][], direction: Direction): boolean {
        const currentPosition: Vec2 = position;
        let extendedWord = '';
        let extendedWordPositions: string[] = [];
        this.goToNextPosition(currentPosition, orientation, direction);
        while (this.isPositionFilled(currentPosition, scrabbleBoard) && !this.isPositionUsed(currentPosition, this.lastLettersPlaced)) {
            extendedWord += scrabbleBoard[currentPosition.y][currentPosition.x];
            extendedWordPositions.push(this.getCharPosition(currentPosition));
            this.goToNextPosition(currentPosition, orientation, direction);
        }
        if (direction === Direction.Backwards) {
            extendedWordPositions = extendedWordPositions.reverse();
            extendedWord = this.reverseString(extendedWord);
        }
        // If the extended word found was already played at the same position
        if (this.wordValidationService.priorCurrentWords.has(extendedWord)) {
            if (
                this.arePositionsEqual(
                    extendedWordPositions,
                    this.wordValidationService.priorCurrentWords.get(extendedWord) as string[],
                    extendedWord,
                )
            ) {
                this.extendedWords.push(extendedWord);
                return true;
            }
        }
        return false;
    }

    getLastLettersPlaced(startPosition: Vec2, orientation: Orientation, word: string, validLetters: boolean[]): Map<string, Vec2> {
        const lastLettersPlaced = new Map<string, Vec2>();
        const lastLetterPosition: Vec2 = { x: startPosition.x, y: startPosition.y };
        for (let i = 0; i < word.length; i++) {
            if (!validLetters[i]) {
                lastLettersPlaced.set(word[i], { x: lastLetterPosition.x, y: lastLetterPosition.y });
            }
            this.goToNextPosition(lastLetterPosition, orientation);
        }
        return lastLettersPlaced;
    }

    isPositionUsed(position: Vec2, lettersPlaced: Map<string, Vec2>): boolean {
        for (const key of lettersPlaced.keys()) {
            const usedPosition = lettersPlaced.get(key) as Vec2;
            if (position.x === usedPosition.x && position.y === usedPosition.y) return true;
        }
        return false;
    }

    getCharPosition(position: Vec2): string {
        let charPosition = String.fromCharCode('A'.charCodeAt(0) + position.y);
        charPosition += (position.x + 1).toString();
        return charPosition;
    }

    isPositionFilled(position: Vec2, scrabbleBoard: string[][]): boolean {
        const isInBounds = position.x >= 0 && position.y >= 0 && position.x < BOARD_ROWS && position.y < BOARD_COLUMNS;
        return isInBounds ? scrabbleBoard[position.y][position.x] !== '' : false;
    }

    goToNextPosition(position: Vec2, orientation: Orientation, direction: Direction = Direction.Forwards): void {
        if (direction === Direction.Forwards)
            position = orientation === Orientation.Horizontal ? { x: position.x++, y: position.y } : { x: position.x, y: position.y++ };
        else if (direction === Direction.Backwards)
            position = orientation === Orientation.Horizontal ? { x: position.x--, y: position.y } : { x: position.x, y: position.y-- };
    }

    reverseString(string: string): string {
        return string.split('').reverse().join('');
    }

    arePositionsEqual(extendedPositions: string[], playedPositions: string[], extendedWord: string): boolean {
        let arePositionsEqual = false;
        for (let i = 0; i < playedPositions.length / extendedPositions.length; i++) {
            for (let j = 0; j < extendedPositions.length; j++) {
                if (playedPositions[i * extendedPositions.length + j] === extendedPositions[j]) arePositionsEqual = true;
                else arePositionsEqual = false;
            }
            if (arePositionsEqual) {
                this.removeExtendedWords(extendedWord, i, extendedPositions, playedPositions);
                return true;
            }
        }
        return false;
    }

    removeExtendedWords(extendedWord: string, index: number, extendedPositions: string[], playedPositions: string[]): void {
        this.wordValidationService.currentWords.get(extendedWord)?.splice(index * extendedPositions.length, extendedPositions.length);
        this.wordValidationService.priorCurrentWords.get(extendedWord)?.splice(index * extendedPositions.length, extendedPositions.length);
        if (playedPositions.length === 0) {
            this.wordValidationService.currentWords.delete(extendedWord);
            this.wordValidationService.priorCurrentWords.delete(extendedWord);
        }
    }
}
