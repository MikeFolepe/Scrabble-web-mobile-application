import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-notifications-dialog',
    templateUrl: './notifications-dialog.component.html',
    styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent implements OnInit {
    constructor(public notificationDialog: MatDialogRef<NotificationsDialogComponent>, public auth: AuthService) {}

    ngOnInit(): void {}
}
