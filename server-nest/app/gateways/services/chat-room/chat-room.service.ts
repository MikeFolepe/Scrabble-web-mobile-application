import { ChatRoom } from '@common/chatRoom';
// import { Room } from '@common/room';
import { SERVER_ROOM } from '@app/gateways/chat-channel/chat.gateway.constants';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@Injectable()
export class ChatRoomService {
    @WebSocketServer() private server: Server;
    chatRooms: ChatRoom[];
    // give the initUser initial values to never be undefined

    constructor() {
        this.chatRooms = [];
        const initUser = new User('', 'ADMIN', '');
        const initRoom = new ChatRoom(SERVER_ROOM, initUser, 'Canal Général');
        this.chatRooms.push(initRoom);
    }

    createRoom(chatRoomId: string, creator: User, chatRoomName: string): ChatRoom {
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
