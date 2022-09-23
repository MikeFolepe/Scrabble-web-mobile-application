import { Message } from '@common/message';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { RoomManagerService } from '../services/room-manager/room-manager.service';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatboxGateway {
    // roomManagerService: RoomManagerService;

    @WebSocketServer()
    server: Server;
    nbCLients: number;

    // handleConnection(socket: io.Socket) {
    //   socket.on('createRoom', (gameSettings: GameSettings, gameType: GameType) => {
    //     const roomId = this.roomManagerService.createRoomId(gameSettings.playersNames[PlayerIndex.OWNER], socket.id);
    //     this.roomManagerService.createRoom(socket.id, roomId, gameSettings, gameType);
    //     socket.join(roomId);
    //     // give the client his roomId to communicate later with server
    //     socket.emit('yourRoomId', roomId);
    //     // room creation alerts all clients on the new rooms configurations
    //     this.sio.emit('roomConfiguration', this.roomManagerService.rooms);
    //     // Send number of rooms available
    //     this.sio.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
    // });
    // }

    @SubscribeMessage('sendRoomMessage')
    handleMessage(@MessageBody() message: Message): void {
        this.server.emit('receiveRoomMessage', message);
    }

    // @SubscribeMessage("getRoomsConfiguration")
    // roomConfiguration(client: Socket){
    //   client.emit('roomConfiguration', this.roomManagerService.rooms);
    // }

    // @SubscribeMessage("connection")
    // roomConfiguration(client: Socket){
    //   console.log("sdfds");
    // }
}
