import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-chatroom-theme-dialog',
    templateUrl: './chatroom-theme-dialog.component.html',
    styleUrls: ['./chatroom-theme-dialog.component.scss'],
})
export class ChatroomThemeDialogComponent implements OnInit {
    constructor(public chatroomTheme: MatDialogRef<ChatroomThemeDialogComponent>, public userService: UserService) {}

    ngOnInit(): void {}

    closeDialog() {
        this.chatroomTheme.close();
    }
}
