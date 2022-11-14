import { Injectable } from '@angular/core';
import { Room } from '@app/classes/room';

import { Player } from '@app/models/player.model';
import { INVALID_INDEX, RESERVE, WHITE_LETTER_INDEX } from '@common/constants';
import { Letter } from '@common/letter';

import { ClientSocketService } from './client-socket.service';
import { LetterService } from './letter.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    fontSize: number;
    opponents: Player[];
    players: Player[];
    currentPlayer: Player;
    currentRoom: Room;

    constructor(private clientSocketService: ClientSocketService, private letterService: LetterService) {
        this.currentPlayer = new Player('', []);
        this.fontSize = 14;
        this.opponents = [];
        this.players = [];
        this.getMyPlayer();
        this.getOpponent();
        // this.getAIs();
        this.getExistingOpponents();
        this.updatePlayer();
        this.getUpdateEasel();
        this.getPlayers();
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

        this.clientSocketService.socket.emit('swap', this.getEasel(), indexToSwap, this.clientSocketService.currentRoom.id);
    }

    private getUpdateEasel(): void {
        this.clientSocketService.socket.on('swapped', (easel: string) => {
            this.currentPlayer.letterTable = JSON.parse(easel);
        });
    }

    private getMyPlayer(): void {
        this.clientSocketService.socket.on('MyPlayer', (player: Player) => {
            this.currentPlayer = player;
        });
    }

    private getOpponent(): void {
        this.clientSocketService.socket.on('Opponent', (player: Player, indexAi: number) => {
            this.opponents[indexAi] = player;
        });
    }

    // private getAIs(): void {
    //     this.clientSocketService.socket.on('curAis', (player: Player) => {
    //         this.opponents.push(player);
    //     });
    // }

    private getExistingOpponents(): void {
        this.clientSocketService.socket.on('curOps', (players: Player[]) => {
            console.log(players);
            this.opponents = players;
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
