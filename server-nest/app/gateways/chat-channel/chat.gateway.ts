import { Message } from '@app/model/message';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { User } from '@common/user';
import { Injectable, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../users/user.service';
import { ChatRoomService } from '../services/chat-room/chat-room.service';
import { ChatEvents } from './../../../../common/chat.gateway.events';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    messages: string[] = [];

    constructor(private readonly logger: Logger, private userService: UserService, private chatRoomService: ChatRoomService) {
    }

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage('createChatRoom')
    createChatRoom(@ConnectedSocket() socket, @MessageBody() creator: User, @MessageBody() chatRoomName: string) {


        const roomId = this.chatRoomService.createRoomId(creator[0].pseudonym, socket.id);

        this.chatRoomService.addCustomer(creator[0], roomId)
        socket.join(roomId);

        this.server.emit('newChatRoom', this.chatRoomService.createRoom(roomId, creator[0], chatRoomName[1]));

    }

    @SubscribeMessage('newMessage')
    addNewMessage(@ConnectedSocket() socket, @MessageBody() chatRoomIndex : number, @MessageBody() user : User, @MessageBody() message: string) {

        const newMessage = new ChatRoomMessage(message[2], "", user[1].pseudonym);
        this.chatRoomService.chatRooms[chatRoomIndex[0]].messages.push(newMessage);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }

    @SubscribeMessage('getChatRooms')
    getChatRooms(socket: Socket) {
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
    joinChatRoom(@ConnectedSocket() socket, @MessageBody() user: User, @MessageBody() roomNames:string[]) {

        for(let i = 0; i < this.chatRoomService.chatRooms.length; i++) {

            for(let j = 0; j < roomNames[1].length; j++) {
                if(this.chatRoomService.chatRooms[i].chatRoomName === roomNames[1][j]) {



                    const userInRoom = this.chatRoomService.chatRooms[i].users.find((currentUser) => currentUser.pseudonym === user[0].pseudonym);
                    if(!userInRoom) {

                        const newMessage = new ChatRoomMessage(`a rejoint le canal de communication`, "", user[0].pseudonym);
                        this.chatRoomService.chatRooms[i].messages.push(newMessage);

                        this.chatRoomService.addCustomer(user[0], this.chatRoomService.chatRooms[i].chatRoomId);
                        socket.join(this.chatRoomService.chatRooms[i].chatRoomId);
                        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);

                    }
                }
            }
        }
    }

    @SubscribeMessage('leaveChatRoom')
    leaveChatRoom(@ConnectedSocket() socket, @MessageBody() pseudonym : string, @MessageBody() chatRoomName : string) {

        const chatRoomIndex = this.chatRoomService.chatRooms.findIndex((currentChatRoom) => currentChatRoom.chatRoomName === chatRoomName[1]);
        const userIndex = this.chatRoomService.chatRooms[chatRoomIndex].users.findIndex((user) => user.pseudonym === pseudonym[0]);
        this.chatRoomService.chatRooms[chatRoomIndex].users.splice(userIndex, 1);
        this.server.emit('updateChatRooms', this.chatRoomService.chatRooms);
    }




    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }


    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: Message) {
        Logger.log(message);
        const messageObject = new Message(message.message, message.messageUser);
        const messageString = JSON.stringify(messageObject);
        this.messages.push(messageString);

    }

    @SubscribeMessage(ChatEvents.GetMessages)
    getMessages(socket: Socket) {
        socket.emit(ChatEvents.GetMessages, this.messages);
    }

    @SubscribeMessage(ChatEvents.UpdateUserSocket)
    updateUser(_: Socket, user: User) {

        for (const activeUser of this.userService.activeUsers) {
            if (activeUser.pseudonym === user.pseudonym) {
                activeUser.socketId = user.socketId;
            }
        }
    }


}
