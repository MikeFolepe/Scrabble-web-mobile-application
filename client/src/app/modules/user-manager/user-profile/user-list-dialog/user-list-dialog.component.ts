import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-user-list-dialog',
    templateUrl: './user-list-dialog.component.html',
    styleUrls: ['./user-list-dialog.component.scss'],
})
export class UserListDialogComponent {
    constructor(public userListDialog: MatDialogRef<UserListDialogComponent>, public userService: UserService) {}
}
