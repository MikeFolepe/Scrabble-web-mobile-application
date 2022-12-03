import { Injectable } from '@angular/core';
import { Notification } from '@common/notification';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    notifications: Notification[];
    constructor(private clientService: ClientSocketService) {
        this.notifications = [];
        this.receiveNotifications();
    }
    receiveNotifications() {
        this.clientService.socket.on('receiveNotification', (notification) => {
            this.notifications.push(notification);
        });
    }
}
