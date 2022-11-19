/* eslint-disable no-restricted-imports */
/* eslint-disable max-lines */
import { ServerRoom, State } from '@app/classes/server-room';
import { UserService } from '@app/users/user.service';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { DELAY_BEFORE_PLAYING, ONE_SECOND_DELAY, THREE_SECONDS_DELAY } from '@common/constants';
import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { User } from '@common/user';
import { Vec2 } from '@common/vec2';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from '../services/room-manager/room-manager.service';
import { ChatEvents } from './../../../../common/chat.gateway.events';

@WebSocketGateway({ cors: true })
export class GameHandlerGateway implements OnGatewayConnection {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private userService: UserService, private roomManagerService: RoomManagerService) {}

    // TODO: set a socket id in player class to easily find the player

    @SubscribeMessage('getRoomsConfiguration')
    getRoomsConfiguration(socket: Socket) {
        socket.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
    }

    @SubscribeMessage('newRoomCustomer')
    addNewRoomPlayer(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() roomId: string) {
        if (this.roomManagerService.isNotAvailable(roomId[1])) {
            // block someone else entry from dialog window
            socket.emit('roomAlreadyToken');
            return;
        }
        const room = this.roomManagerService.find(roomId[1]);
        if (!this.roomManagerService.addCustomer(playerName[0], roomId[1])) {
            socket.emit('roomAlreadyToken');
            return;
        }
        this.roomManagerService.setSocket(this.roomManagerService.find(roomId[1]) as ServerRoom, socket.id);
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        socket.join(roomId[1]);
        this.server.to(roomId[1]).emit('yourRoom', this.roomManagerService.getRoomToSend(room));
        const player = room.playerService.players.find((curPlayer) => curPlayer.name === playerName[0]);
        socket.emit('MyPlayer', player);
        this.server.to(roomId[1]).emit('roomPlayers', room.playerService.players);
        socket.emit('goToWaiting');
    }

    @SubscribeMessage('newRoomObserver')
    addNewRoomObserver(@ConnectedSocket() socket, @MessageBody() observer: User, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        const players = room.playerService.players;
        socket.emit('roomPlayers', players);
        if (!this.roomManagerService.addObserver(observer[0], roomId[1])) {
            socket.emit('roomFullObservers');
            return;
        }
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        socket.emit('yourRoom', this.roomManagerService.getRoomToSend(room));
        socket.join(roomId[1]);
        socket.emit('ObserverToGameView');
        socket.emit('giveBoardToObserver', room.placeLetter.scrabbleBoard);
        socket.emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
    }

    @SubscribeMessage('createRoom')
    createNewRoom(@ConnectedSocket() socket, @MessageBody() gameSettings: GameSettings) {
        this.logger.log(gameSettings);
        const roomId = this.roomManagerService.createRoomId(gameSettings.creatorName, socket.id);
        const createdRoom = this.roomManagerService.createRoom(socket.id, roomId, gameSettings);
        socket.join(roomId);
        // give the client his roomId to communicate later with server
        this.logger.log(createdRoom);
        socket.emit('yourRoom', this.roomManagerService.getRoomToSend(createdRoom));
        const room = this.roomManagerService.find(roomId);
        const player = room.playerService.players.find((curPlayer) => curPlayer.name === gameSettings.creatorName);
        socket.emit('MyPlayer', player);
        socket.emit('roomPlayers', room.playerService.players);
        // room creation alerts all clients on the new rooms configurations
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        // Send number of rooms available
    }

    @SubscribeMessage('sendRequestToCreator')
    sendObserverRequest(@ConnectedSocket() socket, @MessageBody() userJoining: string, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        this.logger.log(room.socketIds[0]);
        this.server.to(room.socketIds[0]).emit('newRequest', userJoining[0], roomId[1]);
    }

    @SubscribeMessage('sendJoinResponse')
    sendJoinResponse(@ConnectedSocket() socket, @MessageBody() decision: boolean, @MessageBody() userJoining: string, @MessageBody() roomId: string) {
        const user = this.userService.activeUsers.find((curUser) => curUser.pseudonym === userJoining[1]);
        Logger.log(user);
        this.server.to(user.socketId).emit('receiveJoinDecision', decision[0], roomId[2]);
    }

    @SubscribeMessage('startGame')
    startGame(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        for (const player of room.playerService.players) {
            if (player.isAi) {
                room.createAi(player);
            }
        }
        const players = room.playerService.players;
        this.roomManagerService.setState(roomId, State.Playing);
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        this.server.in(roomId).emit('goToGameView');
        this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
        setTimeout(() => {
            room.skipTurnService.findStartingPlayerIndex(room.playerService.players);
            room.skipTurnService.players = players;
            this.startTimer(roomId);
        }, 5000);
    }

    @SubscribeMessage('switchTurn')
    switchTurn(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        if (room === undefined) {
            return;
        }
        room.skipTurnService.stopTimer();
        this.server.in(roomId).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
        setTimeout(() => {
            this.updateTurns(room);
            this.startTimer(room.id);
            this.startAiTurn(room);
        }, THREE_SECONDS_DELAY);
        this.server.in(roomId).emit('eraseStartingCase');
    }

    @SubscribeMessage('stopTimer')
    stopTimer(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        room.skipTurnService.stopTimer();
    }
    @SubscribeMessage('swap')
    swap(@ConnectedSocket() socket, @MessageBody() data: { roomId: string; easel: Letter[]; indexToSwap: number[] }) {
        const room = this.roomManagerService.find(data[0]);
        room.playerService.players[room.skipTurnService.activePlayerIndex].letterTable = JSON.parse(data[1]);
        // eslint-disable-next-line guard-for-in
        for (const i in data[2]) {
            const letterFromReserve = room.letter.getRandomLetter();
            // Add a copy of the random letter from the reserve
            const letterToAdd = {
                value: letterFromReserve.value,
                quantity: letterFromReserve.quantity,
                points: letterFromReserve.points,
                isSelectedForSwap: letterFromReserve.isSelectedForSwap,
                isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
            };
            room.playerService.players[room.skipTurnService.activePlayerIndex].letterTable.splice(data[2][i], 1, letterToAdd);
        }
        socket.emit('swapped', JSON.stringify(room.playerService.players[room.skipTurnService.activePlayerIndex].letterTable));
    }

    @SubscribeMessage('deleteGame')
    deleteGame(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        this.server.to(roomId).emit('leaveToHome');
        this.roomManagerService.deleteRoom(roomId);
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        this.server.socketsLeave(roomId);
    }

    @SubscribeMessage('sendRoomMessage')
    sendRoomMessage(@ConnectedSocket() socket, @MessageBody() message: ChatRoomMessage, @MessageBody() roomId: string) {
        this.logger.log(message[0]);
        message[0].time =
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');

        this.server.to(roomId[1]).emit('receiveRoomMessage', message[0]);
    }

    @SubscribeMessage('validatePlacement')
    async validatePlacement(
        @ConnectedSocket() socket,
        @MessageBody() position: string,
        @MessageBody() word: string,
        @MessageBody() orientation: string,
        @MessageBody() isRow: boolean,
        @MessageBody() isEaselSize: boolean,
        @MessageBody() board: string,
        @MessageBody() roomId: string,
        @MessageBody() player: string,
    ) {
        const room = this.roomManagerService.find(roomId[6]);
        const validationResult = await room.wordValidation.validateAllWordsOnBoard(JSON.parse(board[5]), isEaselSize[4], isRow[3]);
        const playerReceived = JSON.parse(player[7]);
        if (validationResult.validation) {
            const index = room.playerService.players.findIndex((curPlayer) => playerReceived.name === curPlayer.name);
            room.playerService.players[index].letterTable = playerReceived.letterTable;
            if (room.placeLetter.isFirstRound) {
                room.placeLetter.firstOrientation = JSON.parse(orientation[2]);
            }
            room.placeLetter.handleValidPlacement(validationResult, index);
            room.placeLetter.scrabbleBoard = JSON.parse(board[5]);
            socket.emit('receiveSuccess');
            socket.to(roomId[6]).emit('receivePlacement', board[5], position[0], orientation[2], word[1]);
            this.server.to(roomId[6]).emit('updatePlayer', room.playerService.players[index]);
            this.server.to(roomId[6]).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
        } else {
            socket.emit('receiveFail', JSON.parse(position[0]), JSON.parse(orientation[2]), word[1]);
        }
    }

    @SubscribeMessage('sendStartingCase')
    sendStartingCase(@ConnectedSocket() socket, @MessageBody() startPosition: Vec2, @MessageBody() roomId: string) {
        socket.to(roomId[1]).emit('receiveStartingCase', startPosition[0]);
    }

    @SubscribeMessage('sendEraseStartingCase')
    sendEraseStartingCase(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        this.server.in(roomId).emit('eraseStartingCase');
    }

    @SubscribeMessage(ChatEvents.UpdateUserSocket)
    updateUserSocket(@ConnectedSocket() socket, @MessageBody() user: User) {
        const currentUser = this.userService.activeUsers.find((curUser) => curUser.pseudonym === user.pseudonym);
        if (currentUser) {
            currentUser.socketId = user.socketId;
        }
    }

    // onEndGameByGiveUp(socket: Socket): void {
    //     socket.on('sendEndGameByGiveUp', (isGiveUp: boolean, roomId: string) => {
    //         socket
    //             .to(roomId)
    //             .emit(
    //                 'receiveEndGameByGiveUp',
    //                 isGiveUp,
    //                 this.roomManagerService.getWinnerName(roomId, this.roomManagerService.findLooserIndex(socket.id)),
    //             );
    //         this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
    //         this.server.socketsLeave(roomId);
    //     });
    // }

    // sendWinnerName(socket: Socket, roomId: string): void {
    //     setTimeout(() => {
    //         socket
    //             .to(roomId)
    //             .emit(
    //                 'receiveEndGameByGiveUp',
    //                 true,
    //                 this.roomManagerService.getWinnerName(roomId, this.roomManagerService.findLooserIndex(socket.id)),
    //             );
    //         socket.to(roomId).emit('receiveGameConverservernMessage', 'Attention la partie est sur le point de se faire convertir en partie Solo.');
    //         socket.leave(roomId);
    //     }, DELAY_OF_DISCONNECT);
    // }

    handleConnection(socket: Socket) {
        socket.emit(ChatEvents.SocketId, socket.id);
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

        // socket.on('sendEndGame', (isEndGame: boolean, letterTable: Letter[], roomId: string) => {
        //     socket.to(roomId).emit('receiveEndGame', isEndGame, letterTable);
        //     this.server.in(roomId).emit('stopTimer');
        // });
    }

    handleDisconnect(socket: Socket) {
        const index = this.userService.activeUsers.findIndex((user) => user.socketId === socket.id);
        this.userService.activeUsers.splice(index, 1);
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);

        const room = this.roomManagerService.find(this.roomManagerService.findRoomIdOf(socket.id));
        const roomId = this.roomManagerService.findRoomIdOf(socket.id);

        if (room === undefined) return;
        room.skipTurnService.stopTimer();
        if (room.state === State.Waiting) {
            this.roomManagerService.deleteRoom(roomId);
            this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
            return;
        }
        if (room.state === State.Playing) {
            room.state = State.Finish;
            // Emit the event
            // this.sendWinnerName(socket, roomId);
            return;
        }
        // so after all if the state is finish, delete the room
        this.roomManagerService.deleteRoom(roomId);
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        this.server.socketsLeave(roomId);
    }

    private startTimer(roomId: string) {
        const room = this.roomManagerService.find(roomId);
        room.skipTurnService.initializeTimer();

        room.skipTurnService.intervalID = setInterval(() => {
            if (room.skipTurnService.seconds === 0 && room.skipTurnService.minutes !== 0) {
                room.skipTurnService.minutes = room.skipTurnService.minutes - 1;
                room.skipTurnService.seconds = 59;
            } else if (room.skipTurnService.seconds === 0 && room.skipTurnService.minutes === 0) {
                room.skipTurnService.stopTimer();
                this.server.in(roomId).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
                setTimeout(() => {
                    this.updateTurns(room);
                    this.startTimer(room.id);
                    this.startAiTurn(room);
                }, THREE_SECONDS_DELAY);
            } else {
                room.skipTurnService.seconds = room.skipTurnService.seconds - 1;
            }
            this.server.in(roomId).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
        }, ONE_SECOND_DELAY);
    }

    private updateTurns(room: ServerRoom) {
        room.playerService.players[room.skipTurnService.activePlayerIndex].isTurn = false;
        this.server.in(room.id).emit('updatePlayerTurnToFalse', room.playerService.players[room.skipTurnService.activePlayerIndex].name);

        room.skipTurnService.activePlayerIndex++;
        if (room.skipTurnService.activePlayerIndex >= room.playerService.players.length) room.skipTurnService.activePlayerIndex = 0;
        room.playerService.players[room.skipTurnService.activePlayerIndex].isTurn = true;
        this.server.in(room.id).emit('turnSwitched', room.playerService.players[room.skipTurnService.activePlayerIndex].name);
    }

    private startAiTurn(room: ServerRoom) {
        const activePlayerIndex = room.skipTurnService.activePlayerIndex;
        if (!room.playerService.players[activePlayerIndex].isAi) return;

        console.log('i am AI');
        setTimeout(async () => {
            const turn = room.aiIturn();
            await room.ais[turn].play(activePlayerIndex);
            this.server
                .in(room.id)
                .emit(
                    'receivePlacement',
                    JSON.stringify(room.placeLetter.scrabbleBoard),
                    JSON.stringify(room.placeLetter.startPosition),
                    JSON.stringify(room.placeLetter.orientation),
                    room.placeLetter.word,
                );
            this.server.to(room.id).emit('updatePlayer', room.playerService.players[activePlayerIndex]);
            this.server.to(room.id).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
            this.server.to(room.socketIds[0]).emit('switchAiTurn');
        }, DELAY_BEFORE_PLAYING);
    }
}
