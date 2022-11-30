import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';
import { UserListDialogComponent } from './user-list-dialog/user-list-dialog.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    constructor(public authService: AuthService, public userService: UserService, private dialog: MatDialog) {
        console.log(authService.currentUser);
    }

    ngOnInit(): void {
        this.userService.getUsers();
    }

    inviteUser() {
        this.dialog.open(UserListDialogComponent, { disableClose: true });
    }
}
