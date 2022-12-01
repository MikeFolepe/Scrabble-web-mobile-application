import { Injectable } from '@angular/core';
import { MessageType } from '@app/classes/enum';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { AuthService } from './auth.service';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class SendMessageService {
    messageType: MessageType;
    listTypes: MessageType[];
    private scrollDown: () => void;

    constructor(public clientSocketService: ClientSocketService, private authService: AuthService) {
        this.receiveMessageFromOpponent();
        // To display message in real time in chat box
        this.receiveConversionMessage();
        this.listTypes = [];
    }

    // displayMessage() will call the method from chatBoxComponent to display the message

    displayMessageByType(message: string, messageType: MessageType): void {
        this.messageType = messageType;
        const messageObject = new ChatRoomMessage(message, this.authService.currentUser.avatar, this.authService.currentUser.pseudonym);
        if (this.messageType === MessageType.Player) {
            this.sendMessageToOpponent(messageObject);
            this.listTypes.push(messageType);
        } else if (this.messageType === MessageType.Error && message.length) {
            this.listTypes.push(this.messageType);
            this.clientSocketService.currentRoom.roomMessages.push(messageObject);
        }

        this.scrollDown();

        // this.displayMessage();
    }

    sendMessageToOpponent(messageToSend: ChatRoomMessage): void {
        this.clientSocketService.socket.emit('sendRoomMessage', messageToSend, this.clientSocketService.currentRoom.id);
    }

    // Function to send message of conversion to all players in the room
    sendConversionMessage(): void {
        this.clientSocketService.socket.emit(
            'sendGameConversionMessage',
            'Attention la partie est sur le point de se faire convertir en partie Solo.',
            this.clientSocketService.currentRoom.id,
        );
    }
    // Function to receive the conversion Message to the players which is the room
    receiveConversionMessage(): void {
        this.clientSocketService.socket.on('receiveGameConversionMessage', (message: string) => {
            this.displayMessageByType(message, MessageType.System);
        });
    }

    displayBound(fn: () => void) {
        this.scrollDown = fn;
    }

    receiveMessageFromOpponent(): void {
        this.clientSocketService.socket.on('receiveRoomMessage', (opponentMessage: ChatRoomMessage) => {
            this.clientSocketService.currentRoom.roomMessages.push(opponentMessage);
        });
    }
}
