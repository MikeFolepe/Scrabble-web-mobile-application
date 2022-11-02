import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlayerScore } from '@common/player';

@Component({
    selector: 'app-best-scores',
    templateUrl: './best-scores.component.html',
    styleUrls: ['./best-scores.component.scss'],
})
export class BestScoresComponent {
    bestPlayersInClassicMode: PlayerScore[];
    bestPlayersInLog2990Mode: PlayerScore[];

    constructor(public bestScoresDialogRef: MatDialogRef<BestScoresComponent>) {}
}
