/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { BoardThemeDialogComponent } from '@app/modules/user-manager/board-theme-dialog/board-theme-dialog.component';
import { ChatroomThemeDialogComponent } from '@app/modules/user-manager/chatroom-theme-dialog/chatroom-theme-dialog.component';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { UserService } from '@app/services/user.service';
import { User } from '@common/user';

@Component({
    selector: 'app-user-preferences',
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent implements OnInit {
    newPseudonym: string;
    isNewPseudonym = true;
    constructor(
        public authService: AuthService,
        public avatarChoiceDialog: MatDialog,
        public changeBoardThemeDialog: MatDialog,
        private communicationService: CommunicationService,
        public userService: UserService,
        public adminService: AdministratorService,
        public changeChatroomThemeDialog: MatDialog,
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
    ) {
        this.newPseudonym = '';
    }

    async ngOnInit() {
        await this.authService.getPreferences(this.authService.currentUser._id);
    }

    openChangeAvatarDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }

    changeUser() {
        if (this.newPseudonym === '') {
            this.newPseudonym = this.authService.currentUser.pseudonym;
            this.isNewPseudonym = false;
        }

        if (this.authService.chosenAvatar === '') {
            this.authService.chosenAvatar = this.authService.currentUser.avatar;
        }

        if (this.newPseudonym === this.authService.currentUser.pseudonym) {
            this.isNewPseudonym = false;
        }

        this.authService.currentUser.pseudonym = this.newPseudonym;
        this.authService.currentUser.avatar = this.authService.chosenAvatar;

        this.communicationService.updateUser(this.authService.currentUser, this.isNewPseudonym).subscribe((newUser: User) => {
            this.authService.currentUser = newUser;
            this.adminService.displayMessage('Changements ??ffectu??s');
        });
    }
    openChangeBoardTheme() {
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
}
