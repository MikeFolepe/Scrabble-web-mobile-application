import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageType } from '@app/classes/enum';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ChatboxService } from '@app/services/chatbox.service';
import { EndGameService } from '@app/services/end-game.service';
import { SendMessageService } from '@app/services/send-message.service';
import { DEFAULT_CHAT_HEIGHT } from '@common/constants';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    message: string;
    listMessages: string[];
    listTypes: MessageType[];

    // Used to access MessageType enum in the HTML
    htmlTypeMessage = MessageType;

    private messageType: MessageType;

    constructor(
        private chatBoxService: ChatboxService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        private boardHandlerService: BoardHandlerService,
    ) {
        this.message = '';
        this.listMessages = [];
        this.listTypes = [];
    }

    // Disable the current placement on the board when a click occurs in the chatbox
    @HostListener('mouseup', ['$event'])
    @HostListener('contextmenu', ['$event'])
    clickInChatBox(): void {
        this.boardHandlerService.cancelPlacement();
    }

    ngOnInit(): void {
        this.initializeChatHeight();
        this.sendMessageService.displayBound(this.displayMessageByType.bind(this));
    }

    handleKeyEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.chatBoxService.sendPlayerMessage(this.message);
            this.scrollToBottom();
        }
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

    initializeChatHeight(): void {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            chatBox.style.height = DEFAULT_CHAT_HEIGHT + 'vh';
        }
    }
}
