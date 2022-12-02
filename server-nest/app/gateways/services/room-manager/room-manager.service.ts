import { OUT_BOUND_INDEX_OF_SOCKET } from '@app/classes/constants';
import { ServerRoom, State } from '@app/classes/server-room';
import { Player } from '@app/game/models/player.model';
import { UserService } from '@app/users/user.service';
import { MAX_LENGTH_OBSERVERS } from '@common/constants';
import { GameSettings, NumberOfPlayer } from '@common/game-settings';
import { Room } from '@common/room';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';
@Injectable()
export class RoomManagerService {
    rooms: ServerRoom[];

    constructor(private userService: UserService) {
        this.rooms = [];
    }

    createRoom(socketId: string, roomId: string, gameSettings: GameSettings): ServerRoom {
        const newRoom = new ServerRoom(roomId, socketId, gameSettings);
        const user = this.userService.activeUsers.find((curUser) => curUser.pseudonym === gameSettings.creatorName);
        newRoom.playerService.players[0].avatar = user.avatar;
        this.rooms.push(newRoom);
        return newRoom;
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

    addCustomer(customerName: string, roomId: string): boolean {
        const room = this.find(roomId);
        if (room === undefined) return false;
        if (room.gameSettings.gameType === NumberOfPlayer.OneVone && room.humanPlayersNumber === 2) return false;
        if (room.humanPlayersNumber === 4) return false;
        if (room.aiPlayersNumber !== 0) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < room.playerService.players.length; i++) {
                if (room.playerService.players[i].isAi) {
                    const user = this.userService.activeUsers.find((curUser) => curUser.pseudonym === customerName);
                    const humanPlayer = new Player(customerName, room.playerService.players[i].letterTable);
                    console.log(user);
                    humanPlayer.avatar = user.avatar;
                    room.playerService.players[i] = humanPlayer;
                    room.aiPlayersNumber--;
                    room.humanPlayersNumber++;
                    return true;
                }
            }
        }
        return false;
        // if (isAi) {
        //     room.playerService.players.push(new Player(room.createAi(), []));
        //     room.playerService.players[room.playerService.players.length - 1].isAI = true;
        //     return true;
        // }

        // room.playerService.players.push(new Player(customerName, room.letter.getRandomLetters()));
        // room.aiPlayersNumber--;
        // room.humanPlayersNumber++;
        // return true;
    }

    addObserver(observer: User, roomId: string): boolean {
        const room = this.find(roomId);
        if (room === undefined) return false;

        if (room.observers.length === MAX_LENGTH_OBSERVERS) return false;
        observer.isObserver = true;
        room.observers.push(observer);

        return true;
    }

    setState(roomId: string, state: State): void {
        const room = this.find(roomId) as ServerRoom;
        room.state = state;
    }

    setSocket(room: ServerRoom, socketId: string): void {
        room.socketIds.push(socketId);
    }

    setUser(room: ServerRoom, userId: string): void {
        room.userIds.push(userId);
    }

    removeSocket(room: ServerRoom, socketId: string): void {
        const index = room.socketIds.findIndex((socketIdIn) => socketIdIn === socketId);
        room.socketIds.splice(index, 1);
    }

    removeObserver(room: ServerRoom, socketId: string): void {
        const index = room.observers.findIndex((observer) => observer.socketId === socketId);
        room.observers.splice(index, 1);
    }

    getGameSettings(roomId: string): GameSettings {
        const room = this.find(roomId) as ServerRoom;
        return room.gameSettings;
    }

    deleteRoom(roomId: string): void {
        this.rooms.forEach((room, roomIndex) => {
            if (room.id === roomId) {
                this.rooms[roomIndex].userIds = [];
                this.rooms[roomIndex] = {} as ServerRoom;
                this.rooms.splice(roomIndex, 1);
            }
        });
    }

    findRoomIdOf(socketIdToCompare: string): string {
        for (const room of this.rooms) {
            for (const socketId of room.socketIds) {
                if (socketId === socketIdToCompare) return room.id;
            }
        }
        for (const room of this.rooms) {
            for (const observer of room.observers) {
                if (observer.socketId === socketIdToCompare) return room.id;
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
        const room = this.find(roomId) as ServerRoom;
        if (room === undefined) return '';
        return '';
    }

    isNotAvailable(roomId: string): boolean {
        const room = this.find(roomId);
        return room === undefined ? false : room.state === State.Playing;
    }

    find(roomId: string): ServerRoom | undefined {
        return this.rooms.find((room) => room.id === roomId);
    }

    findRoomInWaitingState(customerName: string): ServerRoom | undefined {
        const roomWaiting: ServerRoom[] = [];
        for (const room of this.rooms) {
            if (room.state === State.Waiting && room.gameSettings.creatorName !== customerName) {
                roomWaiting.push(room);
            }
        }
        if (roomWaiting.length === 0) return;
        const roomIndex = Math.floor(Math.random() * roomWaiting.length);
        return roomWaiting[roomIndex] as ServerRoom;
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

    getRoomsToSend(): Room[] {
        const roomsToSend: Room[] = [];
        for (const room of this.rooms) {
            roomsToSend.push(
                new Room(
                    room.id,
                    room.gameSettings,
                    room.state,
                    room.socketIds,
                    room.aiPlayersNumber,
                    room.humanPlayersNumber,
                    room.observers,
                    room.roomMessages,
                ),
            );
        }
        return roomsToSend;
    }

    getRoomToSend(room: ServerRoom): Room {
        return new Room(
            room.id,
            room.gameSettings,
            room.state,
            room.socketIds,
            room.aiPlayersNumber,
            room.humanPlayersNumber,
            room.observers,
            room.roomMessages,
        );
    }
}
