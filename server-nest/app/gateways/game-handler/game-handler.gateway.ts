import { Room, State } from '@app/classes/room';
import { PlayerAI } from '@app/game/models/player-ai.model';
import { UsersService } from '@app/users/service/users.service';
import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { User } from '@common/user';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_PLAYING, DELAY_OF_DISCONNECT } from '../../classes/constants';
import { RoomManagerService } from '../services/room-manager/room-manager.service';
import { ChatEvents } from './../../../../common/chat.gateway.events';

@WebSocketGateway({ cors: true })
export class GameHandlerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    messages: string[] = [];

    constructor(private readonly logger: Logger, private userService: UsersService, private roomManagerService: RoomManagerService) {}

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
            this.server.in(roomId).emit('yourRoom', room);
            const player = room.playerService.players.find((curPlayer) => curPlayer.name === playerName);
            socket.emit('MyPlayer', player);
            // emit to opponents
            socket.in(roomId).emit('Opponent', player);
            socket.emit('goToWaiting');
        });

        socket.on('newRoomObserver', (observer: User, roomId: string) => {
            const room = this.roomManagerService.find(roomId);
            const players = room.playerService.players;
            socket.emit('roomPlayers', players);
            if (!this.roomManagerService.addObserver(observer, roomId)) {
                socket.emit('roomFullObservers');
                return;
            }
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            socket.emit('yourRoom', room);
            socket.join(roomId);
            socket.emit('ObserverToGameView');
            this.logger.log('borard', room.placeLetter.scrabbleBoard);
            socket.emit('giveBoardToObserver', room.placeLetter.scrabbleBoard);
            socket.emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
        });

        socket.on('sendRequestToCreator', (userJoining: string, roomId: string) => {
            console.log('requestSended');
            console.log(roomId);
            Logger.log(userJoining);
            const room = this.roomManagerService.find(roomId);
            console.log(room);
            this.logger.log(room.socketIds[0]);
            this.server.to(room.socketIds[0]).emit('newRequest', userJoining, roomId);
        });

        socket.on('sendJoinResponse', (decision: boolean, userJoining: string, roomId: string) => {
            const user = this.userService.activeUsers.find((curUser) => curUser.pseudonym === userJoining);
            Logger.log(user);
            this.server.to(user.socketId).emit('receiveJoinDecision', decision, roomId);
        });

        socket.on('startGame', (roomId: string) => {
            const room = this.roomManagerService.find(roomId);
            this.roomManagerService.setState(roomId, State.Playing);
            this.server.in(roomId).emit('goToGameView');
            this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
            this.server.emit('roomAvailable', this.roomManagerService.getNumberOfRoomInWaitingState());
            const players = room.playerService.players;
            this.server.to(roomId).emit('roomPlayers', players);
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
            if (room === undefined) {
                return;
            }
            room.turnCounter++;

            let index = room.playerService.players.findIndex((curPlayer) => playerName === curPlayer.name);
            room.playerService.players[index].isTurn = false;
            this.server.in(roomId).emit('updatePlayerTurnToFalse', room.playerService.players[index].name);

            index++;
            if (index >= room.playerService.players.length) index = 0;
            room.playerService.players[index].isTurn = true;
            this.server.in(roomId).emit('turnSwitched', room.playerService.players[index].name);
            this.server.in(roomId).emit('startTimer');

            if (room.playerService.players[index] instanceof PlayerAI) {
                setTimeout(async () => {
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

                    this.server.to(roomId).emit('switchAiTurn', room.playerService.players[index].name);
                }, DELAY_BEFORE_PLAYING);
            }
        });

        socket.on('objectiveAccomplished', (id: number, roomId: string) => {
            socket.to(roomId).emit('receiveObjectiveCompleted', id);
        });

        socket.on('sendActions', (actions: string[], roomId: string) => {
            socket.to(roomId).emit('receiveActions', actions);
        });

        socket.on('deleteGame', (roomId: string) => {
            // Send number of rooms available
            this.server.to(roomId).emit('leaveToHome');
            this.roomManagerService.deleteRoom(roomId);
            this.server.emit('roomConfiguration', this.roomManagerService.rooms);
            // a retirer car pour le placement aleatoire
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
                position: string,
                word: string,
                orientation: string,
                isRow: boolean,
                isEaselSize: boolean,
                board: string,
                roomId: string,
                player: string,
            ) => {
                const room = this.roomManagerService.find(roomId);
                const validationResult = await room.wordValidation.validateAllWordsOnBoard(JSON.parse(board), isEaselSize, isRow);
                const playerReceived = JSON.parse(player);
                this.logger.log(validationResult);
                this.logger.log(JSON.parse(orientation), isRow, isEaselSize, JSON.parse(position));
                if (validationResult.validation) {
                    const index = room.playerService.players.findIndex((curPlayer) => playerReceived.name === curPlayer.name);
                    room.playerService.players[index].letterTable = playerReceived.letterTable;
                    if (room.placeLetter.isFirstRound) {
                        room.placeLetter.firstOrientation = JSON.parse(orientation);
                    }
                    room.placeLetter.handleValidPlacement(validationResult, index);
                    room.placeLetter.scrabbleBoard = JSON.parse(board);
                    socket.emit('receiveSuccess');
                    socket.to(roomId).emit('receivePlacement', board, position, orientation, word);
                    this.server.to(roomId).emit('updatePlayer', room.playerService.players[index]);
                    this.server.to(roomId).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
                } else {
                    socket.emit('receiveFail', JSON.parse(position), JSON.parse(orientation), word);
                }
            },
        );

        socket.on(ChatEvents.UpdateUserSocket, async (user: User) => {
            const currentUser = await this.userService.findOne(user.pseudonym);
            if (currentUser) {
                currentUser.socketId = user.socketId;
            }
        });
    }

    onCreateRoom(socket: Socket): void {
        socket.on('createRoom', (gameSettings: GameSettings) => {
            Logger.log(gameSettings);
            const roomId = this.roomManagerService.createRoomId(gameSettings.creatorName, socket.id);
            const createdRoom = this.roomManagerService.createRoom(socket.id, roomId, gameSettings);
            this.logger.log(createdRoom);
            socket.join(roomId);
            // give the client his roomId to communicate later with server
            socket.emit('yourRoom', createdRoom);
            const room = this.roomManagerService.find(roomId);
            const player = room.playerService.players.find((curPlayer) => curPlayer.name === gameSettings.creatorName);
            console.log(player);
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
}
