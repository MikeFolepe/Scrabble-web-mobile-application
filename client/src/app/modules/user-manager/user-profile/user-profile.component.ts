import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { UserService } from '@app/services/user.service';
import { Friend } from '@common/friend';
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
    ) {
        console.log(authService.currentUser);
        this.receiveInvitations();
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
        // adapter
    }
    declineInvite(index: number) {
        this.clientSocket.socket.emit(
            'declineFriendRequest',
            this.authService.currentUser.pseudonym,
            this.authService.currentUser.invitations[index].pseudonym,
        );
        this.authService.currentUser.invitations.splice(index, 1);
        // adapter
    }
}
