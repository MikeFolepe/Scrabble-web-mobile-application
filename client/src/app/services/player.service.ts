import { Injectable } from '@angular/core';
import { Player } from '@app/models/player.model';
import { ERROR_MESSAGE_DELAY, INVALID_INDEX, RESERVE, WHITE_LETTER_INDEX } from '@common/constants';
import { Letter } from '@common/letter';
import { Room } from '@common/room';
import { AuthService } from './auth.service';

import { MatSnackBar } from '@angular/material/snack-bar';
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
    letterForDrag: Letter[];
    isFirstPlacement: boolean;

    constructor(private clientSocketService: ClientSocketService, private authService: AuthService, private snackBar: MatSnackBar) {
        this.currentPlayer = new Player('', []);
        this.letterForDrag = [];
        this.fontSize = 14;
        this.players = [];
        this.getMyPlayer();
        // this.getAIs();
        this.updatePlayer();
        this.getPlayers();
        this.receiveSwap();
        this.clientSocketService.initialize();
        this.onReplaceAi();
        this.isFirstPlacement = true;
        this.onReplaceHuman();
        this.onLeaveNotif();
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

    replaceAi(player: Player) {
        const index = this.players.findIndex((curPlayer) => curPlayer.name === player.name);
        this.authService.currentUser.isObserver = false;
        this.clientSocketService.socket.emit('replaceAi', this.authService.currentUser.pseudonym, index, this.clientSocketService.currentRoom.id);
    }

    onReplaceAi() {
        this.clientSocketService.socket.on('newPlayer', (player: Player, indexAiToReplace: number) => {
            console.log(indexAiToReplace);
            this.players[indexAiToReplace] = {} as Player;
            this.players[indexAiToReplace] = player;
            if (this.authService.currentUser.pseudonym === player.name) {
                this.currentPlayer = player;
            }
        });
    }

    onLeaveNotif(): void {
        this.clientSocketService.socket.on('leaveNotification', (message) => {
            if (message !== '') {
                this.snackBar.open(message, 'OK', {
                    duration: ERROR_MESSAGE_DELAY,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['snackBarStyle'],
                });
            }
        });
    }

    onReplaceHuman() {
        this.clientSocketService.socket.on('newPlayerAi', (player: Player, indexToReplace: number) => {
            this.players[indexToReplace] = {} as Player;
            this.players[indexToReplace] = player;
        });
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
    addLetterForDrag(indexToAdd: number) {
        this.letterForDrag.push(this.currentPlayer.letterTable[indexToAdd]);
    }
    receiveSwap() {
        this.clientSocketService.socket.on('swapped', (easel: string) => {
            this.currentPlayer.letterTable = JSON.parse(easel);
        });
    }
    swap(indexToSwap: number[]): void {
        this.clientSocketService.socket.emit('swap', this.clientSocketService.currentRoom.id, JSON.stringify(indexToSwap));
    }

    private getMyPlayer(): void {
        this.clientSocketService.socket.on('MyPlayer', (player: Player) => {
            this.currentPlayer = player;
            console.log(this.currentPlayer);
        });
    }

    private updatePlayer(): void {
        this.clientSocketService.socket.on('updatePlayer', (player: Player) => {
            this.isFirstPlacement = false;
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
