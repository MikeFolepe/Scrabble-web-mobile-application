import { Injectable } from '@angular/core';
import { Room } from '@common/room';

import { Player } from '@app/models/player.model';
import { INVALID_INDEX, RESERVE, WHITE_LETTER_INDEX } from '@common/constants';
import { Letter } from '@common/letter';

import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    fontSize: number;
    opponents: Player[];
    players: Player[];
    currentPlayer: Player;
    currentRoom: Room;

    private updateEasel: () => void;
    constructor(private clientSocketService: ClientSocketService) {
        this.currentPlayer = new Player('', []);
        this.fontSize = 14;
        this.players = [];
        this.getMyPlayer();
        // this.getAIs();
        this.updatePlayer();
        this.getPlayers();
        this.receiveSwap();
    }

    clearPlayers(): void {
        this.currentPlayer = new Player('', []);
        this.opponents = [];
        this.players = [];
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
    bindUpdateEasel(fn: () => void) {
        this.updateEasel = fn;
    }

    removeLetter(indexToRemove: number): void {
        this.currentPlayer.letterTable.splice(indexToRemove, 1);
        this.updateEasel();
    }
    receiveSwap() {
        this.clientSocketService.socket.on('swapped', (easel: string) => {
            this.currentPlayer.letterTable = JSON.parse(easel);
            this.updateEasel();
        });
    }
    swap(indexToSwap: number[]): void {
        // const letterFromReserve = this.letterService.getRandomLetter();
        // // Add a copy of the random letter from the reserve
        // const letterToAdd = {
        //     value: letterFromReserve.value,
        //     quantity: letterFromReserve.quantity,
        //     points: letterFromReserve.points,
        //     isSelectedForSwap: letterFromReserve.isSelectedForSwap,
        //     isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
        // };
        // this.opponents[indexPlayer].letterTable.splice(indexToSwap, 1, letterToAdd);
        this.clientSocketService.socket.emit('swap', this.clientSocketService.currentRoom.id, JSON.stringify(this.getEasel()), indexToSwap);
    }

    private getMyPlayer(): void {
        this.clientSocketService.socket.on('MyPlayer', (player: Player) => {
            this.currentPlayer = player;
        });
    }

    private updatePlayer(): void {
        this.clientSocketService.socket.on('updatePlayer', (player: Player) => {
            if (player.name === this.currentPlayer.name) {
                this.currentPlayer.score = player.score;
                this.currentPlayer.letterTable = player.letterTable;
            }

            const index = this.players.findIndex((playerC) => playerC.name === player.name);
            this.players[index].score = player.score;
            this.players[index].letterTable = player.letterTable;
        });
    }

    private getPlayers(): void {
        this.clientSocketService.socket.on('roomPlayers', (players) => {
            this.players = players;
        });
    }
}
