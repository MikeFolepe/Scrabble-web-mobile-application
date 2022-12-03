import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
    selector: 'app-add-chat-room',
    templateUrl: './add-chat-room.component.html',
    styleUrls: ['./add-chat-room.component.scss'],
})
export class AddChatRoomComponent {
    chatRoomName: string;
    errorMessage: string;
    secondErrorMessage: string;

    constructor(
        public addChatRoomDialogRef: MatDialogRef<AddChatRoomComponent>,
        private clientSocketService: ClientSocketService,
        private authService: AuthService,
        private chatRoomService: ChatRoomService,
    ) {}

    createChatRoom() {
        this.clientSocketService.socket.emit('createChatRoom', this.authService.currentUser, this.chatRoomName);
    }

    validChatRoomName() {
        const regex = /^[a-zA-Z0-9]+[a-zA-Z0-9 ]{3,20}[a-zA-Z0-9]$/;

        if (this.chatRoomName == null) {
            this.errorMessage = 'emptyCanal';
            return false;
        } else if (!regex.test(this.chatRoomName)) {
            this.errorMessage = 'errorMin5carac';
            this.secondErrorMessage = 'spaceCharacter';
            return false;
        } else if (this.chatRoomService.chatRooms.find((chatRoom) => chatRoom.chatRoomName === this.chatRoomName)) {
            this.errorMessage = 'canalNameUsed';
            return false;
        }
        return true;
    }
}
