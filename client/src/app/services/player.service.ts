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
import { INVALID_INDEX, RESERVE, WHITE_LETTER_INDEX } from '@common/constants';
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

    constructor(private clientSocketService: ClientSocketService, private letterService: LetterService) {
        this.fontSize = 10;
        this.opponents = [];
        this.getMyPlayer();
        this.getOpponent();
        this.getExistingOpponents();
        this.updatePlayer();
    }



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

    addLetterToEasel(letterToAdd: string): void {
        // If it is a white letter
        if (letterToAdd === letterToAdd.toUpperCase()) {
            this.currentPlayer.letterTable.push({
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
                this.currentPlayer.letterTable.push({
                    value: letter.value,
                    quantity: letter.quantity,
                    points: letter.points,
                    isSelectedForSwap: letter.isSelectedForSwap,
                    isSelectedForManipulation: letter.isSelectedForManipulation,
                });
            }
        }
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

    private updatePlayer(): void {
        this.clientSocketService.socket.on('updatePlayer', (player: Player) => {
            if (player.name === this.currentPlayer.name) {
                this.currentPlayer.score = player.score;
                this.currentPlayer.letterTable = player.letterTable;
            } else {
                const curPlayer = this.opponents.find((playerC) => playerC.name === player.name);
                if (curPlayer) {
                    curPlayer.score = player.score;
                    curPlayer.letterTable = player.letterTable;
                }
            }
        });
    }

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

    // isEaselEmpty(indexPlayer: number): boolean {
    //     return this.players[indexPlayer].letterTable.length === 0;
    // }
}
