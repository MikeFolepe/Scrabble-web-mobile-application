import { Injectable } from '@angular/core';
import { INVALID_INDEX, MIN_RESERVE_SIZE_TO_SWAP } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { LetterService } from '@app/services/letter.service';
import { PlayerService } from '@app/services/player.service';
import { EndGameService } from './end-game.service';
import { SendMessageService } from './send-message.service';

@Injectable({
    providedIn: 'root',
})
export class SwapLetterService {
    constructor(
        private playerService: PlayerService,
        private letterService: LetterService,
        private sendMessageService: SendMessageService,
        private endGameService: EndGameService,
    ) {}

    // Swap all the letters selected from the easel with new ones from the reserve
    swapCommand(lettersToSwap: string, indexPlayer: number): boolean {
        if (!this.isPossible(lettersToSwap)) {
            this.sendMessageService.displayMessageByType('ERREUR : La commande est impossible à réaliser', MessageType.Error);
            return false;
        }

        // const lettersToSwapIndexes: number[] = this.lettersToSwapIntoIndexes(lettersToSwap);
        // for (const indexLetter of lettersToSwapIndexes) {
        //     // this.swap(indexLetter, indexPlayer);
        // }
        this.endGameService.addActionsLog('echanger');
        return true;
    }

    swap(indexLetter: number[]): void {
        this.playerService.swap(indexLetter);
    }

    private lettersToSwapIntoIndexes(lettersToSwap: string): number[] {
        const usedLetterIndexes: number[] = [];
        let currentLetterIndex = 0;
        for (const letterToSwap of lettersToSwap) {
            currentLetterIndex = this.playerService.indexLetterInEasel(letterToSwap, 0);
            // If we swap multiple times the same letter, we verify that we're not using the same index in the easel
            for (const index of usedLetterIndexes) {
                while (currentLetterIndex === index && currentLetterIndex !== INVALID_INDEX) {
                    currentLetterIndex = this.playerService.indexLetterInEasel(letterToSwap, currentLetterIndex + 1);
                }
            }
            usedLetterIndexes.push(currentLetterIndex);
        }
        return usedLetterIndexes;
    }

    private isPossible(lettersToSwap: string): boolean {
        return this.reserveHasEnoughLetters() && this.areLettersInEasel(lettersToSwap);
    }

    private areLettersInEasel(lettersToSwap: string): boolean {
        const lettersToSwapIndexes: number[] = this.lettersToSwapIntoIndexes(lettersToSwap);
        for (const indexLetter of lettersToSwapIndexes) {
            if (indexLetter === INVALID_INDEX) return false;
        }
        return true;
    }

    // Reserve needs to have at least 7 letters to perform a swap
    private reserveHasEnoughLetters(): boolean {
        return this.letterService.reserveSize >= MIN_RESERVE_SIZE_TO_SWAP;
    }
}
