import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@app/services/notification.service';

@Component({
    selector: 'app-notifications-dialog',
    templateUrl: './notifications-dialog.component.html',
    styleUrls: ['./notifications-dialog.component.scss'],
})
export class NotificationsDialogComponent implements OnInit {
    constructor(public notificationDialog: MatDialogRef<NotificationsDialogComponent>, public notificationsService: NotificationService) {}

    ngOnInit(): void {}
}
