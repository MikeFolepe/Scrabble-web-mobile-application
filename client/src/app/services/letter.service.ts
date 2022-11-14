import { Injectable, OnDestroy } from '@angular/core';
import { INVALID_INDEX, RESERVE } from '@app/classes/constants';
import { Letter } from '@common/letter';
import { ClientSocketService } from './client-socket.service';
@Injectable({ providedIn: 'root' })
export class LetterService implements OnDestroy {
    reserve: Letter[];
    reserveSize: number;

    constructor(private clientSocketService: ClientSocketService) {
        this.reserve = [];
        if (clientSocketService.socket) {
            this.receiveReserve();
        }
    }

    receiveReserve(): void {
        this.clientSocketService.socket.on('receiveReserve', (reserve: Letter[], reserveSize: number) => {
            this.reserve = reserve;
            this.reserveSize = reserveSize;
        });
    }

    // Returns a random letter from the reserve if reserve is not empty
    getRandomLetter(): Letter {
        const emptyLetter: Letter = {
            value: '',
            quantity: 0,
            points: 0,
            isSelectedForSwap: false,
            isSelectedForManipulation: false,
        };

        if (this.reserveSize === 0) return emptyLetter;

        const completeReserve: Letter[] = [];
        for (const letterToAdd of this.reserve) {
            for (let i = 0; i < letterToAdd.quantity; i++) {
                completeReserve.push(letterToAdd);
            }
        }

        const randomIndex = Math.floor(Math.random() * completeReserve.length);
        const randomLetter = completeReserve[randomIndex];

        // Update reserve
        const reserveIndex = this.reserve.indexOf(randomLetter);

        if (reserveIndex === INVALID_INDEX) return emptyLetter;
        this.reserve[reserveIndex].quantity--;
        this.reserveSize--;
        // this.clientSocketService.socket.emit('sendReserve', this.reserve, this.reserveSize, this.clientSocketService.currentRoom.id);
        return randomLetter;
    }

    addLetterToReserve(letter: string): void {
        for (const letterReserve of this.reserve) {
            if (letter.toUpperCase() === letterReserve.value) {
                letterReserve.quantity++;
                this.reserveSize++;
                // this.clientSocketService.socket.emit('sendReserve', this.reserve, this.reserveSize, this.clientSocketService.currentRoom.id);
                return;
            }
        }
    }
    ngOnDestroy(): void {
        this.reserve = JSON.parse(JSON.stringify(RESERVE));
        let size = 0;
        for (const letter of this.reserve) {
            size += letter.quantity;
        }
        this.reserveSize = size;
    }
}
