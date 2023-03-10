/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-imports */
/* eslint-disable max-lines */
import { AI_NAMES } from '@app/classes/aiNames';
import { ServerRoom, State } from '@app/classes/server-room';
import { PlayerAI } from '@app/game/models/player-ai.model';
import { Player } from '@app/game/models/player.model';
import { UserService } from '@app/users/user.service';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { DELAY_BEFORE_PLAYING, EASEL_SIZE, INVALID_INDEX, ONE_SECOND_DELAY, THREE_SECONDS_DELAY } from '@common/constants';
import { bot } from '@common/defaultAvatars';
import { Friend } from '@common/friend';
import { GameSettings, NumberOfPlayer } from '@common/game-settings';
import { Notification } from '@common/notification';
import { User } from '@common/user';
import { GameDB } from '@common/user-stats';
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

    @SubscribeMessage('sendFriendRequest')
    async sendFriendRequest(@ConnectedSocket() socket, @MessageBody() sender: User, @MessageBody() receiver: User) {
        let activeReceiver: User;
        for (const user of this.userService.activeUsers) {
            if (user.pseudonym === receiver[1].pseudonym) activeReceiver = user;
        }
        let notifToAdd = new Notification(0, sender[0].pseudonym, "Cliquez pour être redirigé vers la page d'invitations");
        notifToAdd = await this.userService.addNotification(receiver[1].pseudonym, notifToAdd);
        const invitationAdded = await this.userService.addInvitation(
            receiver[1].pseudonym,
            new Friend(sender[0].pseudonym, sender[0].avatar, sender[0].xpPoints),
        );
        if (activeReceiver !== undefined) {
            socket.to(activeReceiver.socketId).emit('receiveNotification', notifToAdd);
            socket.to(activeReceiver.socketId).emit('receiveFriendRequest', invitationAdded);
        }
    }

    @SubscribeMessage('acceptFriendRequest')
    async acceptFriendRequest(@ConnectedSocket() socket, @MessageBody() receiver: Friend, @MessageBody() sender: Friend) {
        this.userService.acceptInvite(receiver[0], sender[1]);

        let activeSender: User;
        for (const user of this.userService.activeUsers) {
            if (user.pseudonym === sender[1].pseudonym) activeSender = user;
        }
        if (activeSender !== undefined) {
            socket.to(activeSender.socketId).emit('addFriend', receiver[0]);
        }
        socket.emit('removeFriendNotification', sender[1].pseudonym);
    }

    @SubscribeMessage('declineFriendRequest')
    async declineFriendRequest(@ConnectedSocket() socket, @MessageBody() receiverpseudonym: string, @MessageBody() senderPseudonym: string) {
        this.userService.declineInvite(receiverpseudonym[0], senderPseudonym[1]);
        socket.emit('removeFriendNotification', senderPseudonym[1]);
    }

    @SubscribeMessage('sendEmail')
    sendEmail(@ConnectedSocket() socket, @MessageBody() email: string, @MessageBody() decryptedPassword: string) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey('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');
        const msg = {
            to: 'cherkaoui_08@hotmail.fr', // Change to your recipient
            from: 'log3900.110.22@gmail.com', // Change to your verified sender
            subject: 'Mot de passe oublié - Scrabble',
            text: `Bonjour, voici votre mot de passe : ${decryptedPassword[1]}`,
        };
        sgMail.send(msg);
    }

    @SubscribeMessage('getRoomsConfiguration')
    getRoomsConfiguration(socket: Socket) {
        socket.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
    }

    @SubscribeMessage('newRoomCustomer')
    addNewRoomPlayer(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() roomId: string, @MessageBody() userId: string) {
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
        this.roomManagerService.setSocket(room, socket.id);
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        socket.join(roomId[1]);
        this.server.to(roomId[1]).emit('yourRoom', this.roomManagerService.getRoomToSend(room));
        const player = room.playerService.players.find((curPlayer) => curPlayer.name === playerName[0]);
        socket.emit('MyPlayer', player);
        this.server.to(roomId[1]).emit('roomPlayers', room.playerService.players);
        this.roomManagerService.setUser(room, userId[2]);
        socket.emit('goToWaiting');
    }

    @SubscribeMessage('previewPlayers')
    previewPlayers(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        this.server.to(socket.id).emit('previewRoomPlayers', room.playerService.players);
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
        setTimeout(() => {
            socket.emit('giveBoardToObserver', room.placeLetter.scrabbleBoard);
            socket.emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
        }, 500);
    }

    @SubscribeMessage('createRoom')
    createNewRoom(@ConnectedSocket() socket, @MessageBody() gameSettings: GameSettings, @MessageBody() userId: string) {
        if (gameSettings[0].password === undefined) gameSettings[0].password = '';
        this.logger.log(gameSettings[0]);
        const roomId = this.roomManagerService.createRoomId(gameSettings[0].creatorName, socket.id);
        const createdRoom = this.roomManagerService.createRoom(socket.id, roomId, gameSettings[0]);
        socket.join(roomId);
        // give the client his roomId to communicate later with server
        this.logger.log(createdRoom);
        socket.emit('yourRoom', this.roomManagerService.getRoomToSend(createdRoom));
        const room = this.roomManagerService.find(roomId);
        const player = room.playerService.players.find((curPlayer) => curPlayer.name === gameSettings[0].creatorName);
        socket.emit('MyPlayer', player);
        socket.emit('roomPlayers', room.playerService.players);
        // room creation alerts all clients on the new rooms configurations
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        this.roomManagerService.setUser(createdRoom, userId[1]);
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
        room.endGameService.initStartGame();
        room.endGameService.initStartTime();
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
            this.startTimer(room);
        }, 5000);

        const interval = setInterval(async () => {
            room.endGameService.checkEndGame(room.letter.reserveSize);
            if (room.endGameService.isEndGame) {
                const name = room.endGameService.getWinnerName(players);
                room.skipTurnService.stopTimer();
                this.server.in(roomId).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
                this.server.in(roomId).emit('receiveEndGame', name, room.endGameService.gameStartDate, room.endGameService.gameStartTime);
                room.endGameService.initEndTime();
                await this.userService.updateTimesPlayed(room.endGameService.computeTotalTime(), room.userIds);
                this.server.socketsLeave(roomId);
                this.roomManagerService.deleteRoom(roomId);
                this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
                clearInterval(interval);
            }
        }, 1000);
    }

    @SubscribeMessage('switchTurn')
    switchTurn(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        if (room === undefined) {
            return;
        }
        this.switchTimer(room);
    }

    @SubscribeMessage('stopTimer')
    stopTimer(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        room.skipTurnService.stopTimer();
    }
    @SubscribeMessage('swap')
    swap(@ConnectedSocket() socket, @MessageBody() data: { roomId: string; indexToSwap: number[] }) {
        const room = this.roomManagerService.find(data[0]);
        const indexes: number[] = JSON.parse(data[1]);

        for (const i of indexes) {
            const letterFromReserve = room.letter.getRandomLetter();
            // Add a copy of the random letter from the reserve
            const letterToAdd = {
                value: letterFromReserve.value,
                quantity: letterFromReserve.quantity,
                points: letterFromReserve.points,
                isSelectedForSwap: letterFromReserve.isSelectedForSwap,
                isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
            };
            room.playerService.players[room.skipTurnService.activePlayerIndex].letterTable.splice(i, 1, letterToAdd);
            room.letter.addLetterToReserve(letterToAdd.value);
        }
        socket.emit('swapped', JSON.stringify(room.playerService.players[room.skipTurnService.activePlayerIndex].letterTable));
        this.server.to(room.id).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
    }

    @SubscribeMessage('deleteGame')
    deleteGame(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        const index = room.playerService.players.findIndex((curPlayer) => curPlayer.name === playerName[0]);
        this.leaveGame(socket, room, index);
    }

    @SubscribeMessage('sendObserverLeave')
    sendObserverLeave(@ConnectedSocket() socket, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId);
        this.leaveGame(socket, room);
    }

    @SubscribeMessage('sendGiveUp')
    sendGiveUp(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        const index = room.playerService.players.findIndex((curPlayer) => curPlayer.name === playerName[0]);
        const user = this.userService.activeUsers.find((curUser) => curUser.pseudonym === playerName[0]);
        this.leaveGame(socket, room, index, user._id);
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
        const room = this.roomManagerService.find(roomId[1]);
        room.roomMessages.push(message);
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
        @MessageBody() isDragActivated = false,
    ) {
        if (word[1].length === EASEL_SIZE) socket.emit('playAudio');
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
            if (word.length === 7) socket.emit('playAudio');
            socket.emit('receiveSuccess');
            socket.to(roomId[6]).emit('receivePlacement', board[5], position[0], orientation[2], word[1]);
            this.server.to(roomId[6]).emit('updatePlayer', room.playerService.players[index]);
            this.server.to(roomId[6]).emit('receiveReserve', room.letter.reserve, room.letter.reserveSize);
        } else {
            socket.emit('receiveFail', JSON.parse(position[0]), JSON.parse(orientation[2]), word[1], isDragActivated[9]);
        }
    }

    @SubscribeMessage(ChatEvents.UpdateUserSocket)
    updateUserSocket(@ConnectedSocket() socket, @MessageBody() user: User) {
        const currentUser = this.userService.activeUsers.find((curUser) => curUser.pseudonym === user.pseudonym);
        if (currentUser) {
            currentUser.socketId = user.socketId;
        }
    }

    @SubscribeMessage('sendLeaveGame')
    sendLeaveGame(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        const index = room.playerService.players.findIndex((curPlayer) => curPlayer.name === playerName[0]);
        this.leaveGame(socket, room, index);
    }

    @SubscribeMessage('checkingWord')
    checkingWord(@ConnectedSocket() socket, @MessageBody() word: string, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[1]);
        if (room.wordValidation.isWordInDictionary(word[0])) socket.emit('receiveChecking', true);
        else {
            socket.emit('receiveChecking', false);
        }
    }

    @SubscribeMessage('replaceAi')
    replaceAi(@ConnectedSocket() socket, @MessageBody() playerName: string, @MessageBody() indexAiToReplace: number, @MessageBody() roomId: string) {
        const room = this.roomManagerService.find(roomId[2]);
        const indexToRemove = room.ais.findIndex((curPlayer) => curPlayer.name === room.playerService.players[indexAiToReplace[1]].name);
        const indexToRemoveObserver = room.observers.findIndex((curPlayer) => curPlayer.pseudonym === playerName[0]);
        room.ais[indexToRemove] = {} as PlayerAI;
        room.ais.splice(indexToRemove, 1);
        room.observers.splice(indexToRemoveObserver, 1);
        room.aiTurn = room.ais.length;
        this.roomManagerService.setSocket(room, socket.id);

        room.playerService.players[indexAiToReplace[1]] = new Player(
            playerName[0],
            room.playerService.players[indexAiToReplace[1]].letterTable,
            room.playerService.players[indexAiToReplace[1]].score,
            room.playerService.players[indexAiToReplace[1]].isTurn,
        );
        room.aiPlayersNumber--;
        room.humanPlayersNumber++;
        this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
        this.server.to(roomId[2]).emit('newPlayer', room.playerService.players[indexAiToReplace[1]], indexAiToReplace[1]);
        socket.emit('giveBoardToObserver', room.placeLetter.scrabbleBoard);
        socket.emit('giveRackToObserver', room.playerService.players[indexAiToReplace[1]].letterTable);
    }

    @SubscribeMessage('sendActiveUsers')
    sendActiveUsers(@ConnectedSocket() socket, @MessageBody() senderName) {
        const simplifiedUsers: Friend[] = [];
        for (const user of this.userService.activeUsers) {
            if (senderName !== user.pseudonym) simplifiedUsers.push(new Friend(user.pseudonym, '', 0));
        }
        socket.emit('activeUsers', simplifiedUsers);
    }
    @SubscribeMessage('sendBest')
    async bestActions(@ConnectedSocket() socket, @MessageBody() roomId: string, @MessageBody() playerName: string) {
        const room = this.roomManagerService.find(roomId[0]);
        const playerReceived = room.playerService.players.find((player) => player.name === playerName[1]);

        room.aiForBestActions.strategy.initializeArray(room.placeLetter.scrabbleBoard);
        room.aiForBestActions.strategy.player = playerReceived;
        const allPossibilities = await room.aiForBestActions.getPossibilities(room.aiForBestActions.strategy.getEasel(playerReceived.letterTable));
        socket.emit('receiveBest', JSON.stringify(allPossibilities));
    }

    handleConnection(socket: Socket) {
        socket.emit(ChatEvents.SocketId, socket.id);
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    async handleDisconnect(socket: Socket) {
        if (this.userService.activeUsers.length !== 0) {
            console.log(this.userService.activeUsers);
            const room = this.roomManagerService.find(this.roomManagerService.findRoomIdOf(socket.id));
            const userIndex = this.userService.activeUsers.findIndex((curUser) => curUser.socketId === socket.id);
            if (userIndex !== INVALID_INDEX) {
                await this.userService.addLogout(this.userService.activeUsers[userIndex]._id);
            }

            if (room !== undefined) {
                let pseudonym;
                if (userIndex !== INVALID_INDEX) {
                    pseudonym = this.userService.activeUsers[userIndex].pseudonym;
                }
                const indexPlayer = room.playerService.players.findIndex((player) => player.name === pseudonym);
                await this.leaveGame(socket, room, indexPlayer, this.userService.activeUsers[userIndex]._id);
            }
            if (userIndex !== INVALID_INDEX) {
                this.userService.activeUsers.splice(userIndex, 1);
                this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
            }
        }
    }

    private async leaveGame(socket: Socket, room: ServerRoom, indexPlayer: number = 0, userId: string = '') {
        const observer = room.observers.find((observerCur) => observerCur.socketId === socket.id);
        if (observer) {
            this.roomManagerService.removeObserver(room, socket.id);
            socket.leave(room.id);
            this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
            socket.emit('leave');
            return;
        }
        if (room.state === State.Waiting) {
            if (room.playerService.players[indexPlayer].isCreator) {
                this.server.to(room.id).emit('leaveToHome');
                this.roomManagerService.deleteRoom(room.id);
                this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
                this.server.socketsLeave(room.id);
                return;
            }
            socket.emit('leave');
            socket.to(room.id).emit('leaveNotification', room.playerService.players[indexPlayer].name + ' a quitté le salon');
            room.playerService.players[indexPlayer] = new Player(
                AI_NAMES[room.playerService.players.length],
                room.playerService.players[indexPlayer].letterTable,
                room.playerService.players[indexPlayer].score,
                false,
                false,
                true,
                bot,
            );
            room.aiPlayersNumber++;
            room.humanPlayersNumber--;
            this.roomManagerService.removeSocket(room, socket.id);
            this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
            this.server.to(room.id).emit('newPlayerAi', room.playerService.players[indexPlayer], indexPlayer);
            socket.leave(room.id);
            return;
        }
        if (room.state === State.Playing) {
            if (room.gameSettings.gameType === NumberOfPlayer.OneVone) {
                room.endGameService.isEndGameByGiveUp = true;
                return;
            }
            if (room.aiPlayersNumber === 2 || room.humanPlayersNumber <= 1) {
                // room.skipTurnService.stopTimer();
                // this.server.to(room.id).emit('leave');
                // room.state = State.Finish;
                // this.roomManagerService.deleteRoom(room.id);
                // this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
                // this.server.socketsLeave(room.id);
                room.endGameService.isEndGameByGiveUp = true;
            } else if (room.aiPlayersNumber < 2) {
                const game = new GameDB(room.endGameService.gameStartDate, room.endGameService.gameStartTime, '');
                await this.userService.addGame(game, userId);
                await this.userService.updateTotalPoints(userId, room.playerService.players[indexPlayer].score);
                socket.emit('leave');
                socket.to(room.id).emit('leaveNotification', room.playerService.players[indexPlayer].name + ' a quitté la partie');
                room.playerService.players[indexPlayer] = new Player(
                    AI_NAMES[room.playerService.players.length],
                    room.playerService.players[indexPlayer].letterTable,
                    room.playerService.players[indexPlayer].score,
                    room.playerService.players[indexPlayer].isTurn,
                    false,
                    true,
                    bot,
                );
                room.aiPlayersNumber++;
                room.humanPlayersNumber--;
                socket.leave(room.id);
                this.roomManagerService.removeSocket(room, socket.id);
                this.server.emit('roomConfiguration', this.roomManagerService.getRoomsToSend());
                this.server.to(room.id).emit('newPlayerAi', room.playerService.players[indexPlayer], indexPlayer);
                room.createAi(room.playerService.players[indexPlayer]);
            }
            return;
        }
    }

    private startTimer(room: ServerRoom) {
        room.skipTurnService.initializeTimer();

        room.skipTurnService.intervalID = setInterval(() => {
            if (room.skipTurnService.seconds === 0 && room.skipTurnService.minutes !== 0) {
                room.skipTurnService.minutes = room.skipTurnService.minutes - 1;
                room.skipTurnService.seconds = 59;
            } else if (room.skipTurnService.seconds === 0 && room.skipTurnService.minutes === 0) {
                room.skipTurnService.stopTimer();
                this.server.in(room.id).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
                setTimeout(() => {
                    this.updateTurns(room);
                    this.startTimer(room);
                    this.startAiTurn(room);
                }, THREE_SECONDS_DELAY);
            } else {
                room.skipTurnService.seconds = room.skipTurnService.seconds - 1;
            }
            this.server.in(room.id).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
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
            this.switchTimer(room);
        }, DELAY_BEFORE_PLAYING);
    }

    private switchTimer(room: ServerRoom) {
        // Waiting 1 second before reseting timer to zero for the current second to finish
        setTimeout(() => {
            room.skipTurnService.stopTimer();
            this.server.in(room.id).emit('updateTimer', room.skipTurnService.minutes, room.skipTurnService.seconds);
            this.server.in(room.id).emit('eraseStartingCase');
            setTimeout(() => {
                this.updateTurns(room);
                this.startTimer(room);
                this.startAiTurn(room);
            }, THREE_SECONDS_DELAY);
        }, ONE_SECOND_DELAY);
    }
}
