import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '@common/room';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ClientSocketService {
    socket: Socket;
    currentRoom: Room;

    constructor(private router: Router) {}

    initialize(): void {
        this.initializeRoomId();
        this.routeToGameView();
    }

    routeToGameView(): void {
        this.socket.on('goToGameView', () => {
            this.router.navigate(['game']);
        });
    }

    initializeRoomId(): void {
        this.socket.on('yourRoom', (roomFromServer) => {
            this.currentRoom = new Room(
                roomFromServer.id,
                roomFromServer.gameSettings,
                roomFromServer.state,
                roomFromServer.socketIds,
                roomFromServer.aiNumber,
                roomFromServer.humanNumber,
                roomFromServer.observers,
            );
        });
    }
}
