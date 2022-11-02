import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
  selector: 'app-add-chat-room',
  templateUrl: './add-chat-room.component.html',
  styleUrls: ['./add-chat-room.component.scss']
})
export class AddChatRoomComponent implements OnInit {

  chatRoomName: string;
  errorMessage: string;

  constructor(public addChatRoomDialogRef: MatDialogRef<AddChatRoomComponent>, private clientSocketService : ClientSocketService, private authService : AuthService, private chatRoomService : ChatRoomService) { 
  }

  ngOnInit(): void {
  }

  createChatRoom() {
    this.clientSocketService.socket.emit('createChatRoom', this.authService.currentUser, this.chatRoomName);
  }

  //function that checks if the chatroom name is a minimum of 8 characters, a maximum of 20 characters, and contains only letters and numbers
  validChatRoomName() {
    var regex = /^[a-zA-Z0-9]{8,20}$/;
    
    if (this.chatRoomName == null) {
      this.errorMessage = "Le nom du canal ne peut être vide.";
      return false;
    }
    else if (!regex.test(this.chatRoomName)) {
      this.errorMessage = "Le nom du canal doit contenir entre 8 et 20 caractères et ne peut contenir que des lettres et des chiffres.";
      return false;
    }
    else if (Boolean(this.chatRoomService.chatRooms.find((chatRoom) => chatRoom.chatRoomName === this.chatRoomName))){
      this.errorMessage = "Le nom du canal est déjà utilisé."
      return false;
    }
    return true;
  }
}
