import { Injectable } from '@angular/core';
import { BOARD_COLUMNS, BOARD_ROWS, CENTRAL_CASE_POSITION, INVALID_INDEX } from '@app/classes/constants';
import { Direction } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@common/vec2';

import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class PlacementsHandlerService {
    lastLettersPlaced: Map<string, Vec2>;
    extendingPositions: string[];
    extendedWords: string[];

    constructor(private playerService: PlayerService) {
        this.lastLettersPlaced = new Map<string, Vec2>();
        this.extendingPositions = [];
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

    isFirstWordValid(position: Vec2, orientation: Orientation, word: string, dragWord?: Vec2[]): boolean {
        if (dragWord) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < word.length; i++) {
                if (dragWord[i].x === CENTRAL_CASE_POSITION.x && dragWord[i].y === CENTRAL_CASE_POSITION.y) return true;
            }
            return false;
        }
        const currentPosition = { x: position.x, y: position.y };
        // JUSTIFICATION : Neither the variable 'word' nor 'i' are used inside the loop
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < word.length; i++) {
            if (currentPosition.x === CENTRAL_CASE_POSITION.x && currentPosition.y === CENTRAL_CASE_POSITION.y) return true;
            this.goToNextPosition(currentPosition, orientation);
        }
        return false;
    }

    reverseString(string: string): string {
        return string.split('').reverse().join('');
    }

    isLetterInEasel(letter: string, indexPlayer: number, indexLetters: number[]): boolean {
        let isLetterExisting = false;
        let currentLetterIndex = this.playerService.indexLetterInEasel(letter, 0);

        if (currentLetterIndex !== INVALID_INDEX) isLetterExisting = true;
        for (const index of indexLetters) {
            while (currentLetterIndex === index) {
                currentLetterIndex = this.playerService.indexLetterInEasel(letter, currentLetterIndex + 1);
                if (currentLetterIndex === INVALID_INDEX) isLetterExisting = false;
            }
        }
        if (isLetterExisting) {
            indexLetters.push(currentLetterIndex); // We push the index so we know it is used
        }
        return isLetterExisting;
    }
}
