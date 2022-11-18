import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { EASEL_SIZE } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { AuthService } from '@app/services/auth.service';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { EndGameService } from '@app/services/end-game.service';
import { LetterService } from '@app/services/letter.service';
import { ManipulateService } from '@app/services/manipulate.service';
import { PlayerService } from '@app/services/player.service';
import { SendMessageService } from '@app/services/send-message.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { SwapLetterService } from '@app/services/swap-letter.service';
import { Letter } from '@common/letter';

@Component({
    selector: 'app-letter-easel',
    templateUrl: './letter-easel.component.html',
    styleUrls: ['./letter-easel.component.scss'],
})
export class LetterEaselComponent {
    @ViewChild('easel') easel: ElementRef;

    indexOfLetterToSwap: number[];

    constructor(
        public boardHandlerService: BoardHandlerService,
        public playerService: PlayerService,
        public authService: AuthService,
        private letterService: LetterService,
        private swapLetterService: SwapLetterService,
        private sendMessageService: SendMessageService,
        private manipulateService: ManipulateService,
        private skipTurnService: SkipTurnService,
        private endGameService: EndGameService,
    ) {}

    @HostListener('document:click', ['$event'])
    @HostListener('document:contextmenu', ['$event'])
    clickEvent(event: MouseEvent): void {
        if (this.easel.nativeElement.contains(event.target)) return;
        // Disable all easel selections made when a click occurs outside the easel
        for (const letterEasel of this.playerService.currentPlayer.letterTable) {
            letterEasel.isSelectedForSwap = false;
            letterEasel.isSelectedForManipulation = false;
            this.manipulateService.usedLetters.fill(false, 0, this.manipulateService.usedLetters.length);
        }
        this.manipulateService.enableScrolling();
    }

    @HostListener('keydown', ['$event'])
    onKeyPress(event: KeyboardEvent): void {
        if (this.easel.nativeElement.contains(event.target)) {
            this.manipulateService.onKeyPress(event);
        }
    }

    @HostListener('document:wheel', ['$event'])
    onMouseWheelTick(event: WheelEvent): void {
        if (this.playerService.currentPlayer.letterTable.some((letter) => letter.isSelectedForManipulation)) {
            this.manipulateService.onMouseWheelTick(event);
        }
    }

    // ngOnInit(): void {
    //     //     // this.playerService.bindUpdateEasel(this.update.bind(this));
    //     //     // this.update();
    //     //     this.manipulateService.sendEasel(this.letterEaselTab);
    //     //     this.boardHandlerService.updateDrag.subscribe((isDragged) => {
    //     //         if (isDragged) {
    //     //             this.letterFromBoard.nativeElement.drag();
    //     //         }
    //     //     });
    // }

    onDragEnd() {
        this.boardHandlerService.isDragged = true;
    }

    onRightClick(event: MouseEvent, indexLetter: number): void {
        event.preventDefault();
        this.handleSwapSelection(indexLetter);
    }

    onLeftClick(event: MouseEvent, indexLetter: number): void {
        event.preventDefault();
        this.manipulateService.selectWithClick(indexLetter);
    }

    onEaselClick(): void {
        this.boardHandlerService.cancelPlacement();
    }

    swap(): void {
        let lettersToSwap = '';
        this.indexOfLetterToSwap = [];
        for (let i = 0; i < this.playerService.currentPlayer.letterTable.length; i++) {
            if (this.playerService.currentPlayer.letterTable[i].isSelectedForSwap) {
                lettersToSwap += this.playerService.currentPlayer.letterTable[i].value.toLowerCase();
                this.indexOfLetterToSwap.push(i);
            }
        }
        this.swapLetterService.swap(this.indexOfLetterToSwap);
        // Display the respective message into the chatBox and pass the turn
        const message = this.playerService.currentPlayer + ' : !échanger ' + lettersToSwap;
        this.sendMessageService.displayMessageByType(message, MessageType.Player);
        this.endGameService.addActionsLog('echanger');
        this.skipTurnService.switchTurn();
    }

    cancelSelection(): void {
        for (const letter of this.playerService.currentPlayer.letterTable) {
            letter.isSelectedForSwap = false;
            letter.isSelectedForManipulation = false;
        }
    }

    isSwapButtonActive(): boolean {
        let isButtonActive = false;
        // Deactivated if it is not your turn
        if (!this.playerService.currentPlayer.isTurn) return isButtonActive;

        // Deactivated if there's less than 7 letters in the reserve
        if (this.letterService.reserveSize < EASEL_SIZE) return isButtonActive;

        // Activated if at least one letter is selected to swap
        for (const letter of this.playerService.currentPlayer.letterTable) {
            if (letter.isSelectedForSwap) isButtonActive = true;
        }
        return isButtonActive;
    }

    isCancelButtonActive(): boolean {
        // Activated if at least one letter is selected to swap or to manipulate
        for (const letter of this.playerService.currentPlayer.letterTable) {
            if (letter.isSelectedForSwap || letter.isSelectedForManipulation) return true;
        }
        return false;
    }

    isDragged(letter: Letter, index: number) {
        console.log('start');
        this.boardHandlerService.isDragged = false;
        this.boardHandlerService.currentDraggedLetter = letter;
        this.boardHandlerService.currentDraggedLetterIndex = index;
    }

    private handleSwapSelection(indexLetter: number): void {
        this.manipulateService.unselectManipulation();
        // Unselect swap
        if (this.playerService.currentPlayer.letterTable[indexLetter].isSelectedForSwap)
            this.playerService.currentPlayer.letterTable[indexLetter].isSelectedForSwap = false;
        // Select to swap if the letter is not already selected for manipulation
        else if (!this.playerService.currentPlayer.letterTable[indexLetter].isSelectedForManipulation) {
            this.playerService.currentPlayer.letterTable[indexLetter].isSelectedForSwap = true;
        }
    }
}
