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
  secondErrorMessage : string;

  constructor(public addChatRoomDialogRef: MatDialogRef<AddChatRoomComponent>, private clientSocketService : ClientSocketService, private authService : AuthService, private chatRoomService : ChatRoomService) { 
  }

  ngOnInit(): void {
  }

  createChatRoom() {
    this.clientSocketService.socket.emit('createChatRoom', this.authService.currentUser, this.chatRoomName);
  }

  
  validChatRoomName() {

    const regex = /^[a-zA-Z0-9]+[a-zA-Z0-9 ]{3,20}[a-zA-Z0-9]$/;
    
    if (this.chatRoomName == null) {
      this.errorMessage = "Le nom du canal ne peut être vide.";
      return false;
    }
    else if (!regex.test(this.chatRoomName)) {
      this.errorMessage = "Le nom du canal doit contenir au moins 5 caractères, les caractères étant seulement des lettres et des chiffres."
      this.secondErrorMessage = "Les espaces doivent être suivis de caractères.";
      return false;
    }
    else if (Boolean(this.chatRoomService.chatRooms.find((chatRoom) => chatRoom.chatRoomName === this.chatRoomName))){
      this.errorMessage = "Le nom du canal est déjà utilisé."
      return false;
    }
    return true;
  }
}
