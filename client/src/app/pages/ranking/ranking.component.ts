import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-ranking',
    templateUrl: './ranking.component.html',
    styleUrls: ['./ranking.component.scss'],
})
export class RankingComponent {
    constructor(public rankingDialogRef: MatDialogRef<RankingComponent>, public playerService: PlayerService) {}
}
