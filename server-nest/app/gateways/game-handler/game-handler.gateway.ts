import { Room, State } from '@app/classes/room';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { PlayerAI } from '@app/game/models/player-ai.model';
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

    // TODO: set a socket id in player class to easily find the player

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
            if (!this.roomManagerService.addCustomer(playerName, roomId)) {
                socket.emit('roomAlreadyToken');
                return;
            }

            this.roomManagerService.setSocket(this.roomManagerService.find(roomId) as Room, socket.id);
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            socket.join(roomId);
            this.server.in(roomId).emit('yourRoomId', roomId);
            const player = room.playerService.players.find((curPlayer) => curPlayer.name === playerName);
            socket.emit('MyPlayer', player);
            // emit to opponents
            socket.in(roomId).emit('Opponent', player);
            this.server.in(roomId).emit('yourGameSettings', this.roomManagerService.getGameSettings(roomId));
            socket.emit("goToWaiting")
        });

        socket.on('startGame', (roomId: string) => {
            const room = this.roomManagerService.find(roomId);
            this.server.in(roomId).emit('yourRoomId', roomId);
            this.roomManagerService.setState(roomId, State.Playing);
            this.server.in(roomId).emit('goToGameView');
            this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
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
        socket.on('sendReserve', (reserve: Letter[], reserveSize: number, roomId: string) => {
            socket.to(roomId).emit('receiveReserve', reserve, reserveSize);
        });

        socket.on('sendRoomMessage', (message: string, roomId: string) => {
            socket.to(roomId).emit('receiveRoomMessage', message);
        });

        socket.on('sendGameConverservernMessage', (message: string, roomId: string) => {
            socket.to(roomId).emit('receiveGameConverservernMessage', message);
        });

        socket.on('switchTurn', async (roomId: string, playerName: string) => {
            const room = this.roomManagerService.find(roomId);
            if(room.turnCounter === undefined) room.turnCounter = 0 
            room.turnCounter++;

            let index = room.playerService.players.findIndex((curPlayer) => playerName === curPlayer.name);
            if (room.playerService.players[index].name === playerName) {
                room.playerService.players[index].isTurn = false;
                this.server.in(roomId).emit('updatePlayerTurnToFalse', room.playerService.players[index].name);
            }
            
            index++
            if(index === room.playerService.players.length) index = 0
            
            room.playerService.players[index].isTurn = true;
            this.server.in(roomId).emit('turnSwitched', room.playerService.players[index].name);
            this.logger.log("on start")
            this.server.in(roomId).emit('startTimer');
            
            if (room.playerService.players[index] instanceof PlayerAI) {
                await (room.playerService.players[index] as PlayerAI).play(index);
                if (room.placeLetter.finalResult.validation) {
                    socket
                        .to(roomId)
                        .emit(
                            'receivePlacement',
                            room.placeLetter.scrabbleBoard,
                            room.placeLetter.startPosition,
                            room.placeLetter.orientation,
                            room.placeLetter.word,
                        );
                    this.server.to(roomId).emit('updatePlayer', room.playerService.players[index]);
                    this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
                }
            }
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

        socket.on(
            'validatePlacement',
            async (
                position: Vec2,
                word: string,
                orientation: Orientation,
                isRow: boolean,
                isEaselSize: boolean,
                board: string,
                roomId: string,
                player: string,
            ) => {
                const room = this.roomManagerService.find(roomId);
                const validationResult = await room.wordValidation.validateAllWordsOnBoard(JSON.parse(board), isEaselSize, isRow);
                const playerReceived = JSON.parse(player)
                this.logger.log(validationResult)
                if (validationResult.validation) {
                    const index = room.playerService.players.findIndex((curPlayer) => playerReceived.name === curPlayer.name);
                    room.playerService.players[index].letterTable = playerReceived.letterTable;
                    room.placeLetter.handleValidPlacement(validationResult, index);
                    room.placeLetter.scrabbleBoard = JSON.parse(board);
                    socket.emit('receiveSuccess');
                    socket.to(roomId).emit('receivePlacement', board, position, orientation, word);
                    this.server.to(roomId).emit('updatePlayer', room.playerService.players[index]);
                    this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
                } else {
                    socket.emit('receiveFail', position, orientation, word);
                }
            },
        );
    }

    onCreateRoom(socket: Socket): void {
        socket.on('createRoom', (gameSettings: GameSettings) => {
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
