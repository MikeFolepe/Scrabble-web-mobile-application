import { Injectable } from '@angular/core';
// import {
//     BOARD_COLUMNS,
//     BOARD_ROWS,
//     DEFAULT_FONT_SIZE,
//     EASEL_SIZE,
//     FONT_SIZE_MAX,
//     FONT_SIZE_MIN,
//     INVALID_INDEX,
//     PLAYER_TWO_INDEX,
//     RESERVE,
//     WHITE_LETTER_INDEX
// } from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { INVALID_INDEX } from '@common/constants';
import { Letter } from '@common/letter';
// import { GridService } from '@app/services/grid.service';
// import { LetterService } from '@app/services/letter.service';
// import { Letter } from '@common/letter';
import { ClientSocketService } from './client-socket.service';
import { LetterService } from './letter.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    fontSize: number;
    opponents: Player[];
    currentPlayer: Player;
    // private scrabbleBoard: string[][];

    // private updateEasel: () => void;

    constructor(private clientSocketService: ClientSocketService, private letterService: LetterService) {
        // this.receiveScoreFromServer();
        // this.receiveOpponentEasel();
        this.fontSize = 10;
        this.opponents = [];
        this.getMyPlayer();
        this.getOpponent();
        this.getExistingOpponents();
    }

    // bindUpdateEasel(fn: () => void) {
    //     this.updateEasel = fn;
    // }


    clearPlayers(): void {
        this.opponents = [];
    }

    indexLetterInEasel(letter: string, startIndex: number): number {
        for (let i = startIndex; i < this.currentPlayer.letterTable.length; i++) {
            if (letter === this.currentPlayer.letterTable[i].value.toLowerCase()) {
                return i;
            } else if (letter === letter.toUpperCase()) {
                // White letter
                if (this.currentPlayer.letterTable[i].value === '*') return i;
            }
        }
        return INVALID_INDEX;
    }

    addEaselLetterToReserve(indexInEasel: number): void {
        this.letterService.addLetterToReserve(this.getEasel()[indexInEasel].value);
    }

    getEasel(): Letter[] {
        return this.currentPlayer.letterTable;
    }

    removeLetter(indexToRemove: number): void {
        this.currentPlayer.letterTable.splice(indexToRemove, 1);
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
        this.opponents[indexPlayer].letterTable.splice(indexToSwap, 1, letterToAdd);
    }

    private getMyPlayer(): void {
        this.clientSocketService.socket.on('MyPlayer', (player: Player) => {
            this.currentPlayer = player;
        });
    }

    private getOpponent(): void {
        this.clientSocketService.socket.on('Opponent', (player: Player) => {
            this.opponents.push(player);
        });
    }

    private getExistingOpponents(): void {
        this.clientSocketService.socket.on('curOps', (players: Player[]) => {
            for (const player of players) {
                this.opponents.push(player);
            }
        });
    }

    // receiveScoreFromServer(): void {
    //     this.clientSocketService.socket.on('receiveScoreInfo', (score: number, indexPlayer: number) => {
    //         this.players[indexPlayer].score = score;
    //     });
    // }

    // receiveOpponentEasel(): void {
    //     this.clientSocketService.socket.on('receiveOpponentEasel', (letterTable: Letter[]) => {
    //         this.players[PLAYER_TWO_INDEX].letterTable = letterTable;
    //     });
    // }

    // addPlayer(user: Player): void {
    //     this.players.push(user);
    // }

    // updateScrabbleBoard(scrabbleBoard: string[][]): void {
    //     this.scrabbleBoard = scrabbleBoard;
    // }

    // updateFontSize(fontSize: number): void {
    //     if (fontSize < FONT_SIZE_MIN) {
    //         fontSize = FONT_SIZE_MIN;
    //     } else if (fontSize > FONT_SIZE_MAX) {
    //         fontSize = FONT_SIZE_MAX;
    //     }
    //     this.fontSize = fontSize;
    //     this.updateGridFontSize();
    // }

    // // Update the font size of the letters placed on the grid
    // updateGridFontSize(): void {
    //     for (let i = 0; i < BOARD_ROWS; i++) {
    //         for (let j = 0; j < BOARD_COLUMNS; j++) {
    //             if (this.scrabbleBoard[i][j] !== '') {
    //                 this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, { x: j, y: i });
    //                 this.gridService.drawLetter(this.gridService.gridContextLettersLayer, this.scrabbleBoard[i][j], { x: j, y: i }, this.fontSize);
    //             }
    //         }
    //     }
    // }

    // Remove one letter from easel

    // addLetterToEasel(letterToAdd: string, indexPlayer: number): void {
    //      If it is a white letter
    //     if (letterToAdd === letterToAdd.toUpperCase()) {
    //         this.players[indexPlayer].letterTable.push({
    //             value: RESERVE[WHITE_LETTER_INDEX].value,
    //             quantity: RESERVE[WHITE_LETTER_INDEX].quantity,
    //             points: RESERVE[WHITE_LETTER_INDEX].points,
    //             isSelectedForSwap: RESERVE[WHITE_LETTER_INDEX].isSelectedForSwap,
    //             isSelectedForManipulation: RESERVE[WHITE_LETTER_INDEX].isSelectedForManipulation,
    //     });
    //     letter = letterToAdd;
    //     index = indexPlayer;
    //     return;
    // }

    //     for (const letter of RESERVE) {
    //         if (letterToAdd.toUpperCase() === letter.value) {
    //             this.players[indexPlayer].letterTable.push({
    //                 value: letter.value,
    //                 quantity: letter.quantity,
    //                 points: letter.points,
    //                 isSelectedForSwap: letter.isSelectedForSwap,
    //                 isSelectedForManipulation: letter.isSelectedForManipulation,
    //             });
    //         }
    //     }
    // }

    // refillEasel(indexPlayer: number): void {
    //     let letterToAdd: Letter;
    //     for (let i = this.players[indexPlayer].letterTable.length; i < EASEL_SIZE; i++) {
    //         letterToAdd = this.letterService.getRandomLetter();
    //         if (letterToAdd.value === '') break;

    //         // Add a copy of the letter found
    //         this.players[indexPlayer].letterTable[i] = {
    //             value: letterToAdd.value,
    //             quantity: letterToAdd.quantity,
    //             points: letterToAdd.points,
    //             isSelectedForSwap: letterToAdd.isSelectedForSwap,
    //             isSelectedForManipulation: letterToAdd.isSelectedForManipulation,
    //         };
    //     }
    // }

    // Return the index of the letter found in the easel

    // addScore(score: number, indexPlayer: number): void {
    //     this.players[indexPlayer].score += score;
    //     this.clientSocketService.socket.emit('updateScoreInfo', this.players[indexPlayer].score, 1, this.clientSocketService.roomId);
    // }

    // isEaselEmpty(indexPlayer: number): boolean {
    //     return this.players[indexPlayer].letterTable.length === 0;
    // }
}
