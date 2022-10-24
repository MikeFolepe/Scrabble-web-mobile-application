import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageType } from '@app/classes/enum';
import { AuthService } from '@app/services/auth.service';
import { ChatboxService } from '@app/services/chatbox.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { SendMessageService } from '@app/services/send-message.service';
import { ChatEvents } from '@common/chat.gateway.events';

@Component({
    selector: 'app-prototype-chat-box',
    templateUrl: './prototype-chat-box.component.html',
    styleUrls: ['./prototype-chat-box.component.scss'],
})
export class PrototypeChatBoxComponent implements OnInit {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    @ViewChild('input') private inputBar: ElementRef;

    message: string;
    validMessage: boolean = true;
    listMessages: string[];
    listTypes: MessageType[];

    // Used to access MessageType enum in the HTML
    htmlTypeMessage = MessageType;

    private messageType: MessageType;
    constructor(
        private chatBoxService: ChatboxService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        // private boardHandlerService: BoardHandlerService,
        private clientsSocket: ClientSocketService,
        public authService: AuthService,
    ) {
        this.message = '';
        this.listMessages = [];
        this.listTypes = [];
        this.clientsSocket.socket.on(ChatEvents.GetMessages, (messages: string[]) => {
            for (const message of messages) {
                const messageObject = JSON.parse(message);
                if (messageObject.messageUser !== this.authService.currentUser.pseudonym) this.listTypes.push(MessageType.Opponent);
                else this.listTypes.push(MessageType.Player);
                this.listMessages.push(messageObject.messageUser + ' [' + messageObject.messageTime + ']' + ' : ' + messageObject.message);
            }
            this.scrollToBottom();
        });
    }

    // Disable the current placement on the board when a click occurs in the chatbox
    // @HostListener('mouseup', ['$event'])
    // @HostListener('contextmenu', ['$event'])
    // clickInChatBox(): void {
    //     this.boardHandlerService.cancelPlacement();
    // }
    ngOnInit(): void {
        this.sendMessageService.displayBound(this.displayMessageByType.bind(this));
        this.sendSystemMessage('Bienvenue sur le prototype');
        this.sendMessageService.receiveMessageFromOpponent();
    }

    handleKeyEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.isMessageNotEmpty(this.message)) {
                this.validMessage = true;
                this.chatBoxService.sendPlayerMessage(this.message);
            } else this.validMessage = false;
            this.scrollToBottom();
        }
    }

    sendMessage() {
        if (this.isMessageNotEmpty(this.message)) {
            this.validMessage = true;
            this.chatBoxService.sendPlayerMessage(this.message);
        } else this.validMessage = false;
        this.scrollToBottom();
        this.inputBar.nativeElement.focus();
    }

    isMessageNotEmpty(message: string): boolean {
        if (message === null) return false;
        return /\S/.test(message);
    }

    displayMessageByType(): void {
        if (this.sendMessageService.messageType === MessageType.Error && this.message.length) {
            this.listTypes.push(this.sendMessageService.messageType);
            this.listMessages.push(this.message);
        }
        this.listTypes.push(this.sendMessageService.messageType);
        this.listMessages.push(this.sendMessageService.message);
        // Clear input
        this.message = '';
        this.scrollToBottom();
    }

    sendSystemMessage(systemMessage: string): void {
        this.messageType = MessageType.System;
        this.listTypes.push(this.messageType);
        this.listMessages.push(systemMessage);
    }

    scrollToBottom(): void {
        setTimeout(() => {
            // Timeout is used to update the scroll after the last element added
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        }, 1);
    }

}
