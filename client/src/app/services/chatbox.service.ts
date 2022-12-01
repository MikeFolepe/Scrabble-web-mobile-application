import { Injectable } from '@angular/core';
import { MessageType } from '@app/classes/enum';
import { EndGameService } from '@app/services/end-game.service';
import { LetterService } from '@app/services/letter.service';
import { SendMessageService } from '@app/services/send-message.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Injectable({
    providedIn: 'root',
})
export class ChatboxService {
    private message: string;
    private messageType: MessageType;

    constructor(
        // private placeLetterService: PlaceLetterService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        public letterService: LetterService,
        public skipTurnService: SkipTurnService,
    ) {
        this.message = '';
    }

    sendPlayerMessage(message: string): void {
        this.messageType = MessageType.Player;
        this.message = message;
        this.sendMessageService.displayMessageByType(this.message, this.messageType);
    }
    // Method which check the different size of table of possibility for the debug
}
