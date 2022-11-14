import { Injectable } from '@angular/core';
import { ChatRoom } from '@common/chatRoom';
import { ChatRoomService } from './chat-room.service';

@Injectable({
    providedIn: 'root',
})
export class ChatRoomIndexService {
    chatRoomIndex: number;
    amountOfChatRooms: number;
    firstSelection: boolean = false;
    selectedChatRooms: ChatRoom[];
    constructor(private chatRoomService: ChatRoomService) {
        // add the first chatRoom to the array
        this.selectedChatRooms = [this.chatRoomService.chatRooms[0]];
        this.amountOfChatRooms = this.selectedChatRooms.length;
        this.chatRoomIndex = 0;
    }

    ngOnInit() {}
}
