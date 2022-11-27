import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { PlacementsHandlerService } from '@app/services/placements-handler.service';
import { PossibleWords } from '@common/constants';

@Component({
    selector: 'app-best-actions-dialog',
    templateUrl: './best-actions-dialog.component.html',
    styleUrls: ['./best-actions-dialog.component.scss'],
})
export class BestActionsDialogComponent implements OnInit {
    possibilities: PossibleWords[];
    constructor(
        public giveUpDialogRef: MatDialogRef<BestActionsDialogComponent>,
        private clientService: ClientSocketService,
        private placeLetter: PlaceLetterService,
        private placementService: PlacementsHandlerService,
    ) {
        this.receivePossibilities();
    }

    ngOnInit(): void {
        this.possibilities = [];
    }

    receivePossibilities() {
        this.clientService.socket.on('receiveBest', (possibilities: string) => {
            this.possibilities = JSON.parse(possibilities);
            console.log('meilleur');
            console.log(this.possibilities);
        });
    }
    play(line: number, startIndex: number, orientation: Orientation, word: string) {
        const position = { x: line, y: startIndex };
        let index = 0;
        for (const i of word) {
            this.placeLetter.placeWithKeyboard(position, i, orientation, index++);
            this.placementService.goToNextPosition(position, orientation);
        }
    }
}
