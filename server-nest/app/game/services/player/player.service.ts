/* eslint-disable no-restricted-imports */
import { Letter } from '@common/letter';
import { DEFAULT_FONT_SIZE, EASEL_SIZE, FONT_SIZE_MAX, FONT_SIZE_MIN, INVALID_INDEX, RESERVE, WHITE_LETTER_INDEX } from '../../../classes/constants';
import { Player } from '../../models/player.model';
import { LetterService } from '../letter/letter.service';

export class PlayerService {
    fontSize: number;
    players: Player[];

    private updateEasel: () => void;

    constructor(public letterService: LetterService) {
        this.fontSize = DEFAULT_FONT_SIZE;
        this.players = new Array<Player>();
    }

    bindUpdateEasel(fn: () => void) {
        this.updateEasel = fn;
    }

    addPlayer(user: Player): void {
        this.players.push(user);
    }

    clearPlayers(): void {
        this.players = [];
    }

    getEasel(indexPlayer: number): Letter[] {
        return this.players[indexPlayer].letterTable;
    }


    swap(indexToSwap: number, indexPlayer: number): void {
        const letterFromReserve = this.letterService.getRandomLetter();
        // Add a copy of the random letter from the reserve
        const letterToAdd = {
            value: letterFromReserve.value,
            quantity: letterFromReserve.quantity,
            points: letterFromReserve.points,
            isSelectedForSwap: letterFromReserve.isSelectedForSwap,
            isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
        };
        this.players[indexPlayer].letterTable.splice(indexToSwap, 1, letterToAdd);
    }

    // Remove one letter from easel
    removeLetter(indexToRemove: number, indexPlayer: number): void {
        this.players[indexPlayer].letterTable.splice(indexToRemove, 1);
    }

    addLetterToEasel(letterToAdd: string, indexPlayer: number): void {
        // If it is a white letter
        if (letterToAdd === letterToAdd.toUpperCase()) {
            this.players[indexPlayer].letterTable.push({
                value: RESERVE[WHITE_LETTER_INDEX].value,
                quantity: RESERVE[WHITE_LETTER_INDEX].quantity,
                points: RESERVE[WHITE_LETTER_INDEX].points,
                isSelectedForSwap: RESERVE[WHITE_LETTER_INDEX].isSelectedForSwap,
                isSelectedForManipulation: RESERVE[WHITE_LETTER_INDEX].isSelectedForManipulation,
            });
            return;
        }

        for (const letter of RESERVE) {
            if (letterToAdd.toUpperCase() === letter.value) {
                this.players[indexPlayer].letterTable.push({
                    value: letter.value,
                    quantity: letter.quantity,
                    points: letter.points,
                    isSelectedForSwap: letter.isSelectedForSwap,
                    isSelectedForManipulation: letter.isSelectedForManipulation,
                });
            }
        }
    }

    addEaselLetterToReserve(indexInEasel: number, indexPlayer: number): void {
        this.letterService.addLetterToReserve(this.getEasel(indexPlayer)[indexInEasel].value);
    }

    refillEasel(indexPlayer: number): void {
        let letterToAdd: Letter;
        for (let i = this.players[indexPlayer].letterTable.length; i < EASEL_SIZE; i++) {
            letterToAdd = this.letterService.getRandomLetter();
            if (letterToAdd.value === '') break;

            // Add a copy of the letter found
            this.players[indexPlayer].letterTable[i] = {
                value: letterToAdd.value,
                quantity: letterToAdd.quantity,
                points: letterToAdd.points,
                isSelectedForSwap: letterToAdd.isSelectedForSwap,
                isSelectedForManipulation: letterToAdd.isSelectedForManipulation,
            };
        }
    }

    // Return the index of the letter found in the easel
    indexLetterInEasel(letter: string, startIndex: number, indexPlayer: number): number {
        for (let i = startIndex; i < this.players[indexPlayer].letterTable.length; i++) {
            if (letter === this.players[indexPlayer].letterTable[i].value.toLowerCase()) {
                return i;
            } else if (letter === letter.toUpperCase()) {
                // White letter
                if (this.players[indexPlayer].letterTable[i].value === '*') return i;
            }
        }
        return INVALID_INDEX;
    }

    addScore(score: number, indexPlayer: number): void {
        this.players[indexPlayer].score += score;
    }

    isEaselEmpty(indexPlayer: number): boolean {
        return this.players[indexPlayer].letterTable.length === 0;
    }
}
