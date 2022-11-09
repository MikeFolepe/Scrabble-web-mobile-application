import { Injectable } from '@angular/core';
import { ChatRoom } from '@common/chatRoom';
import { ClientSocketService } from './client-socket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  chatRooms : ChatRoom[] = [];
  private scrollDown: () => void;

  constructor(public clientSocketService: ClientSocketService) {
      
      this.clientSocketService.socket.on('updateChatRooms',(chatRooms: ChatRoom[]) => {
          console.log(chatRooms);
          this.chatRooms = chatRooms;
          this.scrollDown();
      });


      this.clientSocketService.socket.on('newChatRoom',(chatRoom: ChatRoom) => {
          this.chatRooms.push(chatRoom);
      });


    }

  displayBound(fn: () => void) {
    this.scrollDown = fn;
  }
  

  public getChatRooms() {
    this.clientSocketService.socket.emit('getChatRooms');
    
  }

}
