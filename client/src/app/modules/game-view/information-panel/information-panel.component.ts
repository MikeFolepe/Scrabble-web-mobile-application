import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { LetterService } from '@app/services/letter.service';
import { PlayerService } from '@app/services/player.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent implements OnDestroy {
    constructor(
        public letterService: LetterService,
        public playerService: PlayerService,
        public skipTurnService: SkipTurnService,
        public endGameService: EndGameService,
        public clientSocket: ClientSocketService,
        public authService: AuthService,
    ) {}

    displaySeconds(): string {
        let secondsFormatted: string;
        const seconds = this.skipTurnService.seconds;
        secondsFormatted = seconds > 0 ? seconds.toString() : '0';
        const BIGGER_NUMBER_ONE_DIGIT = 9;
        if (seconds <= BIGGER_NUMBER_ONE_DIGIT) secondsFormatted = '0' + secondsFormatted;
        return secondsFormatted;
    }

    ngOnDestroy(): void {
        this.playerService.clearPlayers();
        // this.clientSocket.socket.emit('stopTimer', this.clientSocket.currentRoom.id);
    }
}
