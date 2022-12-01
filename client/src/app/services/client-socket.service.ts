import { Injectable } from '@angular/core';
import { Room } from '@common/room';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ClientSocketService {
    socket: Socket;
    currentRoom: Room;

    initialize(): void {
        this.initializeRoomId();
    }

    initializeRoomId(): void {
        this.socket.on('yourRoom', (roomFromServer: Room) => {
            console.log('myRoom', roomFromServer);
            this.currentRoom = new Room(
                roomFromServer.id,
                roomFromServer.gameSettings,
                roomFromServer.state,
                roomFromServer.socketIds,
                roomFromServer.aiPlayersNumber,
                roomFromServer.humanPlayersNumber,
                roomFromServer.observers,
                roomFromServer.roomMessages,
            );
        });
    }
}
