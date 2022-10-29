import { Injectable } from '@angular/core';
import { TWO_SECOND_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Message } from '@app/classes/message';
import { ChatEvents } from '@common/chat.gateway.events';
import { AuthService } from './auth.service';
import { ClientSocketService } from './client-socket.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class SendMessageService {
    message: string = '';
    messageType: MessageType;
    private displayMessage: () => void;

    constructor(private clientSocketService: ClientSocketService, private playerService: PlayerService, private authService: AuthService) {
        // this.receiveMessageFromOpponent();
        // To display message in real time in chat box
        this.receiveConversionMessage();
    }

    // displayMessage() will call the method from chatBoxComponent to display the message
    displayBound(fn: () => void) {
        this.displayMessage = fn;
    }

    displayMessageByType(message: string, messageType: MessageType): void {
        this.messageType = messageType;
        const messageObject = new Message(message, this.authService.currentUser.pseudonym);
        if (this.messageType === MessageType.Player) this.sendMessageToOpponent(messageObject);

        // this.displayMessage();
    }

    sendMessageToOpponent(message: Message): void {
        this.clientSocketService.socket.emit(ChatEvents.RoomMessage, message, this.clientSocketService.roomId);
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
            const messageString = messageObject.messageUser + ' [' + messageObject.messageTime + ']' + ' : ' + messageObject.message;
            if (messageObject.messageUser === this.authService.currentUser.pseudonym) {
                this.messageType = MessageType.Player;
                this.message = messageString;
                this.displayMessage();
            } else this.sendOpponentMessage(messageString);
        });
    }

    displayFinalMessage(indexPlayer: number): void {
        setTimeout(() => {
            let endGameEasel = '';
            this.displayMessageByType('Fin de partie - lettres restantes', MessageType.System);
            for (const letter of this.playerService.opponents[indexPlayer].letterTable) {
                endGameEasel += letter.value;
            }
            this.displayMessageByType(this.playerService.opponents[indexPlayer].name + ' : ' + endGameEasel, MessageType.System);
        }, TWO_SECOND_DELAY);
    }
}
