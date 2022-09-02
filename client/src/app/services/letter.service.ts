import { Injectable, OnDestroy } from '@angular/core';
import { EASEL_SIZE, RESERVE } from '@app/classes/constants';
import { ClientSocketService } from '@app/services/client-socket.service';
import { Letter } from '@common/letter';
@Injectable({
    providedIn: 'root',
})
export class LetterService implements OnDestroy {
    // Property witch return total number of letters available
    randomElement: number;
    reserve: Letter[];
    reserveSize: number;

    constructor(private clientSocketService: ClientSocketService) {
        this.reserve = JSON.parse(JSON.stringify(RESERVE));
        this.receiveReserve();
        let size = 0;
        for (const letter of this.reserve) {
            size += letter.quantity;
        }
        this.reserveSize = size;
    }

    receiveReserve(): void {
        this.clientSocketService.socket.on('receiveReserve', (reserve: Letter[], reserveSize: number) => {
            this.reserve = reserve;
            this.reserveSize = reserveSize;
        });
    }

    // Returns a random letter from the reserve if reserve is not empty
    getRandomLetter(): Letter {
        if (this.reserveSize === 0) {
            // Return an empty letter
            return {
                value: '',
                quantity: 0,
                points: 0,
                isSelectedForSwap: false,
                isSelectedForManipulation: false,
            };
        }
        let letter: Letter;
        do {
            this.randomElement = Math.floor(Math.random() * this.reserve.length);
            letter = this.reserve[this.randomElement];
        } while (letter.quantity === 0);

        // Update reserve
        letter.quantity--;
        this.reserveSize--;
        this.clientSocketService.socket.emit('sendReserve', this.reserve, this.reserveSize, this.clientSocketService.roomId);
        return letter;
    }

    addLetterToReserve(letter: string): void {
        for (const letterReserve of this.reserve) {
            if (letter.toUpperCase() === letterReserve.value) {
                letterReserve.quantity++;
                this.reserveSize++;
                this.clientSocketService.socket.emit('sendReserve', this.reserve, this.reserveSize, this.clientSocketService.roomId);
                return;
            }
        }
    }

    removeLettersFromReserve(letters: Letter[]): void {
        for (const letter of letters) {
            for (const letterReserve of this.reserve) {
                if (letter.value === letterReserve.value) {
                    letterReserve.quantity--;
                    this.reserveSize--;
                }
            }
        }
    }

    // Draw seven letters from the reserve
    // Useful for initialize player's easel
    getRandomLetters(): Letter[] {
        const tab: Letter[] = [];
        for (let i = 0; i < EASEL_SIZE; i++) {
            const letter = this.getRandomLetter();
            tab[i] = {
                value: letter.value,
                quantity: letter.quantity,
                points: letter.points,
                isSelectedForSwap: letter.isSelectedForSwap,
                isSelectedForManipulation: letter.isSelectedForManipulation,
            };
        }
        return tab;
    }

    ngOnDestroy() {
        this.reserve = JSON.parse(JSON.stringify(RESERVE));
        let size = 0;
        for (const letter of this.reserve) {
            size += letter.quantity;
        }
        this.reserveSize = size;
    }
}
