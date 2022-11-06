import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomIndexService } from '@app/services/chat-room-index.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { ChatRoom } from '@common/chatRoom';

@Component({
  selector: 'app-join-chat-rooms',
  templateUrl: './join-chat-rooms.component.html',
  styleUrls: ['./join-chat-rooms.component.scss']
})
export class JoinChatRoomsComponent implements OnInit {

  selectedChatRooms : string[];

  constructor(public joinChatRoomsDialogRef: MatDialogRef<JoinChatRoomsComponent>, public chatRoomService : ChatRoomService, public authService : AuthService, private clientSocketService : ClientSocketService, private chatRoomIndexService : ChatRoomIndexService) {
    this.selectedChatRooms = [];
  }

  ngOnInit(): void {
    // this.chatRooms = this.chatRoomService.chatRooms;
  }

  joinRoom() {
    console.log(this.authService.currentUser.ipAddress, this.authService.currentUser.pseudonym, this.authService.currentUser.socketId);
    this.clientSocketService.socket.emit('joinChatRoom', this.authService.currentUser, this.selectedChatRooms);
    this.selectedChatRooms = [];
    setTimeout(() => console.log(this.chatRoomService.chatRooms), 2000);
  }

  deleteChatRoom(index : any) {
        console.log(this.chatRoomService.chatRooms[this.chatRoomIndexService.chatRoomIndex])
        this.chatRoomService.chatRooms.splice(index, 1);
        this.clientSocketService.socket.emit('deleteChatRoom', index);
  }

  alreadyInRoom(chatRoom : ChatRoom) : boolean {
    //find the user in the current room 
    var foundUser = chatRoom.users.find((user) => user.pseudonym === this.authService.currentUser.pseudonym);
    return Boolean(foundUser);
  }


  onChange(value : ChatRoom) {
    if(this.selectedChatRooms.includes(value.chatRoomName)) {
        this.selectedChatRooms.splice(this.selectedChatRooms.indexOf(value.chatRoomName), 1);
    } else {
        this.selectedChatRooms.push(value.chatRoomName);
    }
    console.log(this.selectedChatRooms.length);
    // this.chatRoomIndexService.amountOfChatRooms = this.selectedChatRooms.length;
  }
  
} 
