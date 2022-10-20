import { Message } from '@app/model/message';
import { UsersService } from '@app/users/service/users.service';
import { User } from '@common/user';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from '../chatbox/chat.gateway.constants';
import { RoomManagerService } from '../services/room-manager/room-manager.service';
import { ChatEvents } from './../../../../common/chat.gateway.events';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    messages: string[] = [];
    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private userService: UsersService, private roomManagerService: RoomManagerService) {}

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket) {
        socket.join(this.room);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: Message) {
        Logger.log(message);
        const messageObject = new Message(message.message, message.messageUser);
        const messageString = JSON.stringify(messageObject);
        this.messages.push(messageString);
        this.server.to(this.room).emit(ChatEvents.RoomMessage, messageString);
        // Seulement un membre de la salle peut envoyer un message aux autres
        // socket.to(this.room).emit(ChatEvents.RoomMessage, messageString);
    }

    @SubscribeMessage(ChatEvents.GetMessages)
    getMessages(socket: Socket) {
        socket.emit(ChatEvents.GetMessages, this.messages);
    }

    @SubscribeMessage(ChatEvents.UpdateUserSocket)
    updateUser(_: Socket, user: User) {
        // Seulement un membre de la salle peut envoyer un message aux autres

        for (const activeUser of this.userService.activeUsers) {
            if (activeUser.pseudonym === user.pseudonym) {
                activeUser.socketId = user.socketId;
            }
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
