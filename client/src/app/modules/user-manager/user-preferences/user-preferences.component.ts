import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { BoardThemeDialogComponent } from '@app/modules/user-manager/board-theme-dialog/board-theme-dialog.component';
import { ChatroomThemeDialogComponent } from '@app/modules/user-manager/chatroom-theme-dialog/chatroom-theme-dialog.component';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-user-preferences',
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent implements OnInit {
    newPseudonym : string;
    constructor(public authService : AuthService, public avatarChoiceDialog : MatDialog, public changeBoardThemeDialog : MatDialog, public changeChatroomThemeDialog : MatDialog) {
        this.newPseudonym = '';
    }

    ngOnInit(): void {}

    openChangeAvatarDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }

    openChangeBoardTheme()  {
        this.changeBoardThemeDialog.open(BoardThemeDialogComponent, { disableClose: true });
    }

    openChatroomTheme() {
        this.changeChatroomThemeDialog.open(ChatroomThemeDialogComponent, { disableClose: true });
    }

    

    changePseudonym() {}
}
