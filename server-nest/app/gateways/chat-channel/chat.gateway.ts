import { ChatRoomService } from '@app/gateways/services/chat-room/chat-room.service';
import { ChatEvents } from '@common/chat.gateway.events';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { User } from '@common/user';
import { Injectable, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private chatRoomService: ChatRoomService) {}

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage('createChatRoom')
    createChatRoom(@ConnectedSocket() socket, @MessageBody() creator: User, @MessageBody() chatRoomName: string) {
        const roomId = this.chatRoomService.createRoomId(creator[0].pseudonym, socket.id);

        this.chatRoomService.addCustomer(creator[0], roomId);
        socket.join(roomId);
        this.server.emit('newChatRoom', this.chatRoomService.createRoom(roomId, creator[0], chatRoomName[1]));
    }

    @SubscribeMessage('newMessage')
    addNewMessage(@ConnectedSocket() socket, @MessageBody() chatRoomIndex: number, @MessageBody() user: User, @MessageBody() message: string) {
        Logger.log(user[1].avatar);
        const newMessage = new ChatRoomMessage(message[2], user[1].avatar, user[1].pseudonym);
        this.chatRoomService.chatRooms[chatRoomIndex[0]].messages.push(newMessage);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage('getChatRooms')
    getChatRooms() {
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage('deleteChatRoom')
    deleteChatRoom(@ConnectedSocket() socket, @MessageBody() index: number) {
        this.chatRoomService.chatRooms.splice(index, 1);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage('joinMainRoom')
    joinMainRoom(@ConnectedSocket() socket, @MessageBody() user: User) {
        this.chatRoomService.addCustomer(user[0], this.chatRoomService.chatRooms[0].chatRoomId);
        socket.join(this.chatRoomService.chatRooms[0].chatRoomId);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage('joinChatRoom')
    joinChatRoom(@ConnectedSocket() socket, @MessageBody() user: User, @MessageBody() roomNames: string[]) {
        for (const chatRoom of this.chatRoomService.chatRooms) {
            for (const roomName of roomNames[1]) {
                if (chatRoom.chatRoomName === roomName) {
                    const userInRoom = chatRoom.users.find((currentUser) => currentUser.pseudonym === user[0].pseudonym);
                    if (!userInRoom) {
                        const newMessage = new ChatRoomMessage('a rejoint le canal de communication', user[0].avatar, user[0].pseudonym);
                        chatRoom.messages.push(newMessage);

                        this.chatRoomService.addCustomer(user[0], chatRoom.chatRoomId);
                        socket.join(chatRoom.chatRoomId);
                        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
                    }
                }
            }
        }
    }

    @SubscribeMessage('leaveChatRoom')
    leaveChatRoom(@ConnectedSocket() socket, @MessageBody() pseudonym: string, @MessageBody() chatRoomName: string) {
        const chatRoomIndex = this.chatRoomService.chatRooms.findIndex((currentChatRoom) => currentChatRoom.chatRoomName === chatRoomName[1]);
        const userIndex = this.chatRoomService.chatRooms[chatRoomIndex].users.findIndex((user) => user.pseudonym === pseudonym[0]);
        this.chatRoomService.chatRooms[chatRoomIndex].users.splice(userIndex, 1);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }
}
