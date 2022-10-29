/* eslint-disable no-restricted-imports */
import { Room, State } from '@app/classes/room';
import { Player } from '@app/game/models/player.model';
import { UsersService } from '@app/users/service/users.service';
import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { Vec2 } from '@common/vec2';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_OF_DISCONNECT } from '../../classes/constants';
import { RoomManagerService } from '../services/room-manager/room-manager.service';
import { ChatEvents } from './../../../../common/chat.gateway.events';

@WebSocketGateway({ cors: true })
export class GameHandlerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    messages: string[] = [];

    constructor(private readonly logger: Logger, private userService: UsersService, private roomManagerService: RoomManagerService) {}

    // afterInit() {
    //     setInterval(() => {
    //         this.emitTime();
    //     }, DELAY_BEFORE_EMITTING_TIME);
    // }

    onNewRoomPlayer(socket: Socket): void {
        socket.on('newRoomCustomer', (playerName: string, roomId: string) => {
            if (this.roomManagerService.isNotAvailable(roomId)) {
                // block someone else entry from dialog window
                socket.emit('roomAlreadyToken');
                return;
            }
            const room = this.roomManagerService.find(roomId);
            const players = room.playerService.players;
            socket.emit('curOps', players);

            this.roomManagerService.addCustomer(playerName, roomId);
            this.roomManagerService.setSocket(this.roomManagerService.find(roomId) as Room, socket.id);
            this.roomManagerService.setState(roomId, State.Playing);
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            socket.join(roomId);
            this.server.in(roomId).emit('yourRoomId', roomId);
            const player = room.playerService.players.find((curPlayer) => curPlayer.name === playerName);
            socket.emit('MyPlayer', player);
            // emit to opponents
            socket.in(roomId).emit('Opponent', player);
            this.server.in(roomId).emit('yourGameSettings', this.roomManagerService.getGameSettings(roomId));
            this.server.in(roomId).emit('goToGameView');
            this.server.emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
            // Send number of rooms available
            this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
            setTimeout(() => {
                this.server.in(roomId).emit('startTimer');

            }, 3000);
        });
    }

    onEndGameByGiveUp(socket: Socket): void {
        socket.on('sendEndGameByGiveUp', (isGiveUp: boolean, roomId: string) => {
            socket
                .to(roomId)
                .emit(
                    'receiveEndGameByGiveUp',
                    isGiveUp,
                    this.roomManagerService.getWinnerName(roomId, this.roomManagerService.findLooserIndex(socket.id)),
                );
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            this.server.socketsLeave(roomId);
        });
    }

    sendWinnerName(socket: Socket, roomId: string): void {
        setTimeout(() => {
            socket
                .to(roomId)
                .emit(
                    'receiveEndGameByGiveUp',
                    true,
                    this.roomManagerService.getWinnerName(roomId, this.roomManagerService.findLooserIndex(socket.id)),
                );
            socket.to(roomId).emit('receiveGameConverservernMessage', 'Attention la partie est sur le point de se faire convertir en partie Solo.');
            socket.leave(roomId);
        }, DELAY_OF_DISCONNECT);
    }

    handleConnection(socket: Socket) {
        socket.emit(ChatEvents.SocketId, socket.id);
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

        this.onCreateRoom(socket);

        socket.on('getRoomsConfiguration', () => {
            // getRoomsConfigurations only alerts the asker about the rooms configurations
            socket.emit('roomConfiguration', this.roomManagerService.rooms);
        });

        this.onNewRoomPlayer(socket);
        socket.on('sendPlacement', (scrabbleBoard: string[][], startPosition: Vec2, orientation: string, word: string, roomId: string) => {
            const room = this.roomManagerService.find(roomId) as Room;
            room.placeLetter.scrabbleBoard = scrabbleBoard;
            // room.playerAi.play();
            // console.log(scrabbleBoard === room.playerAi.strategy.placeLetterService.scrabbleBoard);
            socket.to(roomId).emit('receivePlacement', room.placeLetter.scrabbleBoard);
        });

        socket.on('sendReserve', (reserve: Letter[], reserveSize: number, roomId: string) => {
            socket.to(roomId).emit('receiveReserve', reserve, reserveSize);
        });

        socket.on('sendRoomMessage', (message: string, roomId: string) => {
            socket.to(roomId).emit('receiveRoomMessage', message);
        });

        socket.on('sendGameConverservernMessage', (message: string, roomId: string) => {
            socket.to(roomId).emit('receiveGameConverservernMessage', message);
        });

        socket.on('switchTurn', (roomId: string, playerName: string) => {
            this.server.in(roomId).emit('stopTimer');
            const room = this.roomManagerService.find(roomId);
            room.turnCounter++;
            for (let i = 0; i < room.playerService.players.length; i++) {
                if (room.playerService.players[i].name === playerName) {
                    room.playerService.players[i].isTurn = false;
                    this.server.in(roomId).emit('updatePlayerTurnToFalse', room.playerService.players[i].name);
                }
                if (i === room.turnCounter % room.playerService.players.length) {
                    room.playerService.players[i].isTurn = true;
                    this.server.in(roomId).emit('turnSwitched', room.playerService.players[i].name);
                    this.server.in(roomId).emit('startTimer');
                }
            }
        });

        socket.on('sendEasel', (letterTable: Letter[], roomId: string) => {
            socket.to(roomId).emit('receiveOpponentEasel', letterTable);
        });

        socket.on('updatePlayedWords', (playedWords: string, roomId: string) => {
            socket.to(roomId).emit('receivePlayedWords', playedWords);
        });

        socket.on('updateCurrentWords', (currentWords: string, priorCurrentWords: string, roomId: string) => {
            socket.to(roomId).emit('receiveCurrentWords', currentWords, priorCurrentWords);
        });
        socket.on('updateScoreInfo', (score: number, indexPlayer: number, roomId: string) => {
            socket.to(roomId).emit('receiveScoreInfo', score, indexPlayer);
        });

        socket.on('objectiveAccomplished', (id: number, roomId: string) => {
            socket.to(roomId).emit('receiveObjectiveCompleted', id);
        });

        socket.on('sendActions', (actions: string[], roomId: string) => {
            socket.to(roomId).emit('receiveActions', actions);
        });

        socket.on('deleteGame', (roomId: string) => {
            this.roomManagerService.deleteRoom(roomId);
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            // Send number of rooms available
            this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
            this.server.socketsLeave(roomId);
        });
        // Receive the Endgame from the give up game or the natural EndGame by easel or by actions
        this.onEndGameByGiveUp(socket);

        socket.on('sendEndGame', (isEndGame: boolean, letterTable: Letter[], roomId: string) => {
            socket.to(roomId).emit('receiveEndGame', isEndGame, letterTable);
            this.server.in(roomId).emit('stopTimer');
        });

        socket.on('sendPlayerTwo', (letterTable: Letter[], roomId: string) => {
            socket.to(roomId).emit('receivePlayerTwo', letterTable);
        });

        // Method handler by click on placement aléatoire
        socket.on('newRoomCustomerOfRandomPlacement', (customerName: string) => {
            const room = this.roomManagerService.findRoomInWaitingState(customerName);
            if (room === undefined) return;
            socket.emit('receiveCustomerOfRandomPlacement', customerName, room.id);
        });

        // Method to get to update the room available when you access join-room page
        socket.on('getRoomAvailable', () => {
            this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
        });
    }

    onCreateRoom(socket: Socket): void {
        socket.on('createRoom', (gameSettings: GameSettings) => {
            // Logger.log('wefww');
            // const roomId = this.roomManagerService.createRoomId(gameSettings.playersNames[PlayerIndex.OWNER], socket.id);
            // this.roomManagerService.createRoom(socket.id, roomId, gameSettings);
            // this.roomManagerService.addCustomer('ok', roomId);
            // // this.roomManagerService.setSocket(this.roomManagerService.find(roomId) as Room, socket.id);
            // this.roomManagerService.setState(roomId, State.Playing);
            // this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            // // socket.join(roomId);
            // // this.server.in(roomId).emit('yourRoomId', roomId);
            // this.server.in(roomId).emit('yourGameSettings', this.roomManagerService.formatGameSettingsForCustomerIn(roomId));
            // socket.to(roomId).emit('yourGameSettings', this.roomManagerService.getGameSettings(roomId));
            // // this.server.in(roomId).emit('goToGameView');
            // // this.server.in(roomId).emit('startTimer');
            // // Send number of rooms available
            // this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
            // const room = this.roomManagerService.find(roomId) as Room;
            // socket.join(roomId);
            // // give the client his roomId to communicate later with server
            // socket.emit('yourRoomId', roomId);
            // Logger.log(roomId);
            // // room creation alerts all clients on the new rooms configurations
            // this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            // // Send number of rooms available
            // // this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
            // this.server.in(roomId).emit('goToGameView');
            // this.server.in(roomId).emit('startTimer');

            const roomId = this.roomManagerService.createRoomId(gameSettings.creatorName, socket.id);
            this.roomManagerService.createRoom(socket.id, roomId, gameSettings);
            socket.join(roomId);
            // give the client his roomId to communicate later with server
            socket.emit('yourRoomId', roomId);
            const room = this.roomManagerService.find(roomId);
            const player = room.playerService.players.find((curPlayer) => curPlayer.name === gameSettings.creatorName);
            player.isTurn = true;
            socket.emit('MyPlayer', player);
            // room creation alerts all clients on the new rooms configurations
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            // Send number of rooms available
            this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
        });
    }

    handleDisconnect(socket: Socket) {
        const index = this.userService.activeUsers.findIndex((user) => user.socketId === socket.id);
        this.userService.activeUsers.splice(index, 1);
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        const room = this.roomManagerService.find(this.roomManagerService.findRoomIdOf(socket.id));
        const roomId = this.roomManagerService.findRoomIdOf(socket.id);

        if (room === undefined) return;
        if (room.state === State.Waiting) {
            this.roomManagerService.deleteRoom(roomId);
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            return;
        }
        if (room.state === State.Playing) {
            room.state = State.Finish;
            // Emit the event
            this.sendWinnerName(socket, roomId);
            return;
        }
        // so after all if the state is finish, delete the room
        this.roomManagerService.deleteRoom(roomId);
        this.server.emit('roomConfiguration', this.roomManagerService.rooms);
        this.server.socketsLeave(roomId);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
