import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-board-theme-dialog',
    templateUrl: './board-theme-dialog.component.html',
    styleUrls: ['./board-theme-dialog.component.scss'],
})
export class BoardThemeDialogComponent implements OnInit {
    constructor(public boardTheme: MatDialogRef<BoardThemeDialogComponent>, public userService: UserService) {}

    ngOnInit(): void {}

    closeDialog() {
        this.boardTheme.close();
    }
}
