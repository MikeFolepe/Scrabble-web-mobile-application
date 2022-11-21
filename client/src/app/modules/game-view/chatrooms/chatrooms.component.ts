import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomIndexService } from '@app/services/chat-room-index.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
    selector: 'app-chatrooms',
    templateUrl: './chatrooms.component.html',
    styleUrls: ['./chatrooms.component.scss'],
})
export class ChatroomsComponent implements OnInit {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    currentMessage: string;
    isOpen: boolean;

    constructor(
        public chatRoomIndexService: ChatRoomIndexService,
        public chatRoomService: ChatRoomService,
        private clientSocketService: ClientSocketService,
        private authService: AuthService,
    ) {
        this.currentMessage = '';
        this.scrollToBottom();
        this.isOpen = false;
    }

    ngOnInit(): void {
        this.chatRoomService.displayBound(this.scrollToBottom.bind(this));
    }

    sendMessage(): void {
        this.scrollToBottom();
        console.log(this.authService.currentUser);
        this.clientSocketService.socket.emit(
            'newMessage',
            this.chatRoomIndexService.chatRoomIndex,
            this.authService.currentUser,
            this.currentMessage,
        );
        this.currentMessage = '';
    }

    closeChat(): void {
        this.isOpen = false;
    }

    openChat(): void {
        this.isOpen = true;
        this.scrollToBottom();
    }

    chatRoomInSelectedRooms(): boolean {
        if (!this.chatRoomService.chatRooms[this.chatRoomIndexService.chatRoomIndex]) {
            return false;
        }

        if (this.chatRoomIndexService.chatRoomIndex === 0) {
            return true;
        }

        const roomStillSelected = this.chatRoomIndexService.selectedChatRooms.find(
            (chatRoom) => chatRoom.chatRoomName === this.chatRoomService.chatRooms[this.chatRoomIndexService.chatRoomIndex].chatRoomName,
        );
        return Boolean(roomStillSelected);
    }

    handleKeyEvent(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.sendMessage();
        }
    }

    scrollToBottom(): void {
        setTimeout(() => {
            if (this.myScrollContainer) {
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
            }
        }, 10);
    }
}
