import { ChatRoom } from '@common/chatRoom';
// import { Room } from '@common/room';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ChatRoomService {
    chatRooms: ChatRoom[];

    constructor() {
        this.chatRooms = [];
    }

    createRoom(chatRoomId: string, creator: User, chatRoomName: string) : ChatRoom {

        const newRoom = new ChatRoom(chatRoomId, creator, chatRoomName);
        this.chatRooms.push(newRoom);
        return newRoom;
    }

    createRoomId(userPseudonym: string, socketId: string) {
        return (
            new Date().getFullYear().toString() +
            new Date().getMonth().toString() +
            new Date().getHours().toString() +
            new Date().getMinutes().toString() +
            new Date().getSeconds().toString() +
            new Date().getMilliseconds().toString() +
            socketId +
            userPseudonym
        );
    }

    addCustomer(customerName: User, roomId: string): boolean {
        const chatRoom = this.find(roomId);
        if (chatRoom === undefined) return false;
        chatRoom.users.push(customerName);

        return true;
    }


    find(roomId: string): ChatRoom | undefined {

        for (const room of this.chatRooms) {
            if (room.chatRoomId === roomId) return room;
        }
        return undefined;
        
    }


}
