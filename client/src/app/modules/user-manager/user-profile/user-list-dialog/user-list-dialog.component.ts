import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { UserService } from '@app/services/user.service';
import { User } from '@common/user';
import { interval } from 'rxjs';

@Component({
    selector: 'app-user-list-dialog',
    templateUrl: './user-list-dialog.component.html',
    styleUrls: ['./user-list-dialog.component.scss'],
})
export class UserListDialogComponent {
    buttonDisabled: Set<number>;
    usersToDisplay: User[];
    constructor(
        public userListDialog: MatDialogRef<UserListDialogComponent>,
        public userService: UserService,
        private clientSocket: ClientSocketService,
        private auth: AuthService,
    ) {
        this.buttonDisabled = new Set();

        const source = interval(3000);
        source.subscribe((val) => this.userService.getUsers());
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invite(index: number) {
        this.buttonDisabled.add(index);
        this.clientSocket.socket.emit('sendFriendRequest', this.auth.currentUser, this.userService.users[index]);
    }
}
