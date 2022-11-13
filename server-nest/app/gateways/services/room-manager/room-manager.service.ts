import { Room, State } from '@app/classes/room';
import { Player } from '@app/game/models/player.model';
import { GameSettings } from '@common/game-settings';
import { Injectable } from '@nestjs/common';
import { OUT_BOUND_INDEX_OF_SOCKET } from '../../../classes/constants';
@Injectable()
export class RoomManagerService {
    rooms: Room[];

    constructor() {
        this.rooms = [];
    }

    createRoom(socketId: string, roomId: string, gameSettings: GameSettings) {
        this.rooms.push(new Room(roomId, socketId, gameSettings));
    }

    createRoomId(playerName: string, socketId: string) {
        return (
            new Date().getFullYear().toString() +
            new Date().getMonth().toString() +
            new Date().getHours().toString() +
            new Date().getMinutes().toString() +
            new Date().getSeconds().toString() +
            new Date().getMilliseconds().toString() +
            socketId +
            playerName
        );
    }

    addCustomer(customerName: string, roomId: string, isAi?: boolean): boolean {
        const room = this.find(roomId);
        if (room === undefined) return false;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // for (let i = 0; i < room.playerService.players.length; i++) {
        //     if (room.playerService.players[i] instanceof PlayerAI) {
        //         const humanPlayer = new Player(customerName, room.playerService.players[i].letterTable);
        //         room.playerService.players[i] = humanPlayer;
        //         return true;
        //     }
        // }
        if (isAi) {
            room.playerService.players.push(new Player(room.createAi(), []));
            room.playerService.players[room.playerService.players.length - 1].isAI = true;
            return true;
        }

        if (room.playerService.players.length === 4) return false;
        room.playerService.players.push(new Player(customerName, room.letter.getRandomLetters()));
        console.log('pushed new player');
        return true;
    }

    setState(roomId: string, state: State): void {
        const room = this.find(roomId) as Room;
        room.state = state;
    }

    setSocket(room: Room, socketId: string): void {
        room.socketIds.push(socketId);
    }

    getGameSettings(roomId: string): GameSettings {
        const room = this.find(roomId) as Room;
        return room.gameSettings;
    }

    deleteRoom(roomId: string): void {
        this.rooms.forEach((room, roomIndex) => {
            if (room.id === roomId) this.rooms.splice(roomIndex, 1);
        });
    }

    findRoomIdOf(socketIdToCompare: string): string {
        for (const room of this.rooms) {
            for (const socketId of room.socketIds) {
                if (socketId === socketIdToCompare) return room.id;
            }
        }
        return '';
    }

    findLooserIndex(socketId: string): number {
        for (const room of this.rooms) {
            for (const ids of room.socketIds) {
                if (ids === socketId) return room.socketIds.indexOf(ids) as number;
            }
        }
        return OUT_BOUND_INDEX_OF_SOCKET;
    }

    getWinnerName(roomId: string, indexOfLoser: number = 0): string {
        const room = this.find(roomId) as Room;
        if (room === undefined) return '';
        return '';
    }

    isNotAvailable(roomId: string): boolean {
        const room = this.find(roomId);
        return room === undefined ? false : room.state === State.Playing;
    }

    find(roomId: string): Room | undefined {
        return this.rooms.find((room) => room.id === roomId);
    }

    findRoomInWaitingState(customerName: string): Room | undefined {
        const roomWaiting: Room[] = [];
        for (const room of this.rooms) {
            if (room.state === State.Waiting && room.gameSettings.creatorName !== customerName) {
                roomWaiting.push(room);
            }
        }
        if (roomWaiting.length === 0) return;
        const roomIndex = Math.floor(Math.random() * roomWaiting.length);
        return roomWaiting[roomIndex] as Room;
    }

    getNumberOfRoomInWaitingState(): number {
        let numberOfRoom = 0;
        // special case
        if (this.rooms === undefined || this.rooms.length === 0) return numberOfRoom;

        for (const room of this.rooms) {
            if (room.state === State.Waiting) numberOfRoom++;
        }

        return numberOfRoom;
    }
}
