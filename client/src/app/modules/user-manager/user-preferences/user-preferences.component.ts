import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
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
    constructor(public authService : AuthService, public avatarChoiceDialog : MatDialog, public changeBoardThemeDialog : MatDialog, public changeChatroomThemeDialog : MatDialog, public joinChatRoomsDialog: MatDialog, public changeChatRoomDialog: MatDialog,public addChatRoomDialog: MatDialog) {
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

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    

    changePseudonym() {}
}
