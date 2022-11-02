import { Injectable } from '@angular/core';
import { ChatRoom } from '@common/chatRoom';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomIndexService {

  chatRoomIndex : number;
  amountOfChatRooms : number;
  firstSelection : boolean = false;
  selectedChatRooms : ChatRoom[];
  constructor() { 
    this.amountOfChatRooms = 0;
  }
}
