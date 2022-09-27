import { Injectable } from '@angular/core';
import { TWO_SECOND_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { ChatEvents } from '@common/chat.gateway.events';
import { ClientSocketService } from './client-socket.service';
import { PlayerService } from './player.service';
import { Message } from '@app/classes/message';

@Injectable({
    providedIn: 'root',
})
export class SendMessageService {
    message: string = '';
    messageType: MessageType;
    private displayMessage: () => void;

    constructor(private clientSocketService: ClientSocketService, private playerService: PlayerService, private authSer) {
        this.receiveMessageFromOpponent();
        // To display message in real time in chat box
        this.receiveConversionMessage();
    }

    // displayMessage() will call the method from chatBoxComponent to display the message
    displayBound(fn: () => void) {
        this.displayMessage = fn;
    }

    displayMessageByType(message: string, messageType: MessageType): void {
        this.message =
            this.authService.currentUser.pseudonym +
            ' : ' +
            message +
            '                                 ' +
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');

        this.messageType = messageType;
        const messageObject = new Message(message, this.authService.currentUser.pseudonym);
        if (this.messageType === MessageType.Player) this.sendMessageToOpponent(messageObject);

        this.displayMessage();
    }

    sendMessageToOpponent(message: Message): void {
        this.clientSocketService.socket.emit(ChatEvents.RoomMessage, message);
    }

    // Function to send message of conversion to all players in the room
    sendConversionMessage(): void {
        this.clientSocketService.socket.emit(
            'sendGameConversionMessage',
            'Attention la partie est sur le point de se faire convertir en partie Solo.',
            this.clientSocketService.roomId,
        );
    }
    // Function to receive the conversion Message to the players which is the room
    receiveConversionMessage(): void {
        this.clientSocketService.socket.on('receiveGameConversionMessage', (message: string) => {
            this.displayMessageByType(message, MessageType.System);
        });
    }
    sendOpponentMessage(opponentMessage: string): void {
        this.messageType = MessageType.Opponent;
        this.message = opponentMessage;
        this.displayMessage();
    }

    receiveMessageFromOpponent(): void {
        this.clientSocketService.socket.on(ChatEvents.RoomMessage, (message: string) => {
            const messageObject = JSON.parse(message);
            this.sendOpponentMessage(messageObject.messageUser + ' : ' + messageObject.message);
        });
    }

    displayFinalMessage(indexPlayer: number): void {
        setTimeout(() => {
            let endGameEasel = '';
            this.displayMessageByType('Fin de partie - lettres restantes', MessageType.System);
            for (const letter of this.playerService.players[indexPlayer].letterTable) {
                endGameEasel += letter.value;
            }
            this.displayMessageByType(this.playerService.players[indexPlayer].name + ' : ' + endGameEasel, MessageType.System);
        }, TWO_SECOND_DELAY);
    }
}
