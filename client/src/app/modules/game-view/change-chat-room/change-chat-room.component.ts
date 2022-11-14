import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomIndexService } from '@app/services/chat-room-index.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ChatRoom } from '@common/chatRoom';

@Component({
    selector: 'app-change-chat-room',
    templateUrl: './change-chat-room.component.html',
    styleUrls: ['./change-chat-room.component.scss'],
})
export class ChangeChatRoomComponent {
    userChatsRooms: ChatRoom[];
    selectedChatRoom?: ChatRoom;
    selectedChatRoomIndex: number;

    constructor(
        private chatRoomIndexService: ChatRoomIndexService,
        public changeChatRoomDialogRef: MatDialogRef<ChangeChatRoomComponent>,
        public chatRoomService: ChatRoomService,
        private authService: AuthService,
        private clientSocketService: ClientSocketService,
    ) {
        // this.chatRoomService.getChatRooms();
        this.userChatsRooms = [this.chatRoomService.chatRooms[0]];
        for (const chatRoom of this.chatRoomService.chatRooms) {
            // if the chatRoom is the main room, skip it
            if (chatRoom.chatRoomName === this.chatRoomService.chatRooms[0].chatRoomName) {
                continue;
            }
            const foundUser = chatRoom.users.find((user) => user.pseudonym === this.authService.currentUser.pseudonym);
            if (foundUser) {
                this.userChatsRooms.push(chatRoom);
            }
        }

        this.chatRoomIndexService.amountOfChatRooms = this.userChatsRooms.length;
        this.chatRoomIndexService.selectedChatRooms = this.userChatsRooms;

        if (this.chatRoomIndexService.firstSelection === false && this.userChatsRooms.length > 0) {
            this.chatRoomIndexService.chatRoomIndex = this.chatRoomService.chatRooms.findIndex(
                (chatRoom) => chatRoom.chatRoomName === this.userChatsRooms[0].chatRoomName,
            );
        }
    }

    firstSelection() {
        this.chatRoomIndexService.firstSelection = true;
    }

    changeChatRoom() {
        if (this.selectedChatRoom) {
            this.selectedChatRoomIndex = this.chatRoomService.chatRooms.findIndex(
                (chatRoom) => chatRoom.chatRoomId === this.selectedChatRoom?.chatRoomId,
            );
            this.chatRoomIndexService.chatRoomIndex = this.selectedChatRoomIndex;
        }
    }

    disableJoinCurrentRoom(chatRoom: ChatRoom) {
        return (
            this.chatRoomService.chatRooms.findIndex((chatRoomInService) => chatRoomInService.chatRoomName === chatRoom.chatRoomName) ===
            this.chatRoomIndexService.chatRoomIndex
        );
    }

    leaveChatRoom(chatRoom: ChatRoom) {
        const chatRoomIndexInService = this.chatRoomService.chatRooms.findIndex(
            (chatRoomInService) => chatRoomInService.chatRoomName === chatRoom.chatRoomName,
        );
        const message = 'a quitté le canal de communication';
        this.clientSocketService.socket.emit('newMessage', chatRoomIndexInService, this.authService.currentUser, message);
        this.clientSocketService.socket.emit('leaveChatRoom', this.authService.currentUser.pseudonym, chatRoom.chatRoomName);
        this.userChatsRooms.splice(this.userChatsRooms.indexOf(chatRoom), 1);
        this.chatRoomIndexService.amountOfChatRooms = this.userChatsRooms.length;
        this.chatRoomIndexService.selectedChatRooms = this.userChatsRooms;
    }
}
