import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { UserService } from '@app/services/user.service';
import { Friend } from '@common/friend';
import { Notification } from '@common/notification';
import { UserListDialogComponent } from './user-list-dialog/user-list-dialog.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    constructor(
        public authService: AuthService,
        public userService: UserService,
        private dialog: MatDialog,
        private clientSocket: ClientSocketService,
        public joinChatRoomsDialog: MatDialog, 
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog
    ) {
        console.log(authService.currentUser);
        this.receiveInvitations();
        this.addFriend();
    }

    ngOnInit(): void {
        this.userService.getUsers();
    }

    receiveInvitations() {
        this.clientSocket.socket.on('receiveFriendRequest', (friend: Friend) => {
            this.authService.currentUser.invitations.push(friend);
        });
    }

    inviteUser() {
        this.dialog.open(UserListDialogComponent, { disableClose: true });
    }
    acceptInvite(index: number) {
        const currentUserAsFriend = new Friend(
            this.authService.currentUser.pseudonym,
            this.authService.currentUser.avatar,
            this.authService.currentUser.xpPoints,
        );
        this.clientSocket.socket.emit('acceptFriendRequest', currentUserAsFriend, this.authService.currentUser.invitations[index]);
        this.authService.currentUser.friends.push(this.authService.currentUser.invitations[index]);
        this.authService.currentUser.invitations.splice(index, 1);
    }
    declineInvite(index: number) {
        this.clientSocket.socket.emit(
            'declineFriendRequest',
            this.authService.currentUser.pseudonym,
            this.authService.currentUser.invitations[index].pseudonym,
        );
        this.authService.currentUser.invitations.splice(index, 1);
    }
    receiveNotifications() {
        this.clientSocket.socket.on('receiveNotification', (notification: Notification) => {
            console.log('sadsadasdasdasd');
            this.authService.notifications.push(notification);
        });
    }
    addFriend() {
        this.clientSocket.socket.on('addFriend', (friend: Friend) => {
            this.authService.currentUser.friends.push(friend);
        });
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
