import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-room-players-dialog',
    templateUrl: './room-players-dialog.component.html',
    styleUrls: ['./room-players-dialog.component.scss'],
})
export class RoomPlayersDialogComponent implements OnInit {
    constructor(public roomPlayersDialog: MatDialogRef<RoomPlayersDialogComponent>, public playerService: PlayerService) {}

    ngOnInit(): void {}

    closeDialog() {
        this.roomPlayersDialog.close();
    }
}
