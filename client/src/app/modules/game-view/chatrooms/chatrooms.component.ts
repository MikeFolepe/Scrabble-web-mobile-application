import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomIndexService } from '@app/services/chat-room-index.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
  selector: 'app-chatrooms',
  templateUrl: './chatrooms.component.html',
  styleUrls: ['./chatrooms.component.scss']
})
export class ChatroomsComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  currentMessage : string;

  constructor(public chatRoomIndexService : ChatRoomIndexService, public chatRoomService: ChatRoomService, private clientSocketService: ClientSocketService, private authService: AuthService, private mainPageComponent: MainPageComponent) { 
    this.chatRoomService.getChatRooms();
    this.currentMessage = "";
    this.scrollToBottom();

  }

  ngOnInit(): void {

    this.chatRoomService.displayBound(this.scrollToBottom.bind(this));
  }

  sendMessage() : void {
    console.log(this.chatRoomIndexService.chatRoomIndex);
    this.scrollToBottom();
    this.clientSocketService.socket.emit("newMessage", this.chatRoomIndexService.chatRoomIndex, this.authService.currentUser, this.currentMessage);
    this.currentMessage = "";
    
  }

  closeChat() : void {
    this.mainPageComponent.isOpen = false;
  }

  chatRoomInSelectedRooms() : boolean {
    if(!this.chatRoomService.chatRooms[this.chatRoomIndexService.chatRoomIndex]) {
      return false;
    }
    
    const roomStillSelected = this.chatRoomIndexService.selectedChatRooms.find((chatRoom) => chatRoom.chatRoomName === this.chatRoomService.chatRooms[this.chatRoomIndexService.chatRoomIndex].chatRoomName);
    return Boolean(roomStillSelected);
  }

  handleKeyEvent(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }, 10);
  }
}
