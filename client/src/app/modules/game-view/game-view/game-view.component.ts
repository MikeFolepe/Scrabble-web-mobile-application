import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_FONT_SIZE } from '@app/classes/constants';
import { GiveUpGameDialogComponent } from '@app/modules/game-view/give-up-game-dialog/give-up-game-dialog.component';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ChatboxService } from '@app/services/chatbox.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GiveUpHandlerService } from '@app/services/give-up-handler.service';
import { GridService } from '@app/services/grid.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { PlayerService } from '@app/services/player.service';
import { SendMessageService } from '@app/services/send-message.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-game-view',
    templateUrl: './game-view.component.html',
    styleUrls: ['./game-view.component.scss'],
})
export class GameViewComponent {
    fontSize: number;

    constructor(
        public endGameService: EndGameService,
        public clientSocketService: ClientSocketService,
        private gridService: GridService,
        public gameSettingsService: GameSettingsService,
        public chatBoxService: ChatboxService,
        public boardHandlerService: BoardHandlerService,
        public skipTurnService: SkipTurnService,
        public playerService: PlayerService,
        public dialog: MatDialog,
        public sendMessageService: SendMessageService,
        public giveUpHandlerService: GiveUpHandlerService,
        // public objectiveService: ObjectivesService,
        private placeLetterService: PlaceLetterService,
    ) {
        this.fontSize = DEFAULT_FONT_SIZE;
        // this.giveUpHandlerService.receiveEndGameByGiveUp();
        // this.objectiveService.ngOnDestroy();
    }

    handleFontSizeEvent(fontSizeEvent: number): void {
        this.fontSize = fontSizeEvent;
        // this.playerService.updateFontSize(this.fontSize);
    }

    confirmGiveUpGame(): void {
        const ref = this.dialog.open(GiveUpGameDialogComponent, { disableClose: true });

        ref.afterClosed().subscribe((decision: boolean) => {
            // if user closes the dialog box without input nothing
            if (!decision) return;
            // if decision is true the EndGame occurred
            this.sendMessageService.sendConversionMessage();
            this.clientSocketService.socket.emit('sendEndGameByGiveUp', decision, this.clientSocketService.currentRoom.id);
        });
    }

    leaveGame(): void {
        this.skipTurnService.stopTimer();
        this.placeLetterService.ngOnDestroy();
        this.gridService.ngOnDestroy();
        this.endGameService.clearAllData();
        // this.playerService.clearPlayers();
        this.gameSettingsService.ngOnDestroy();
        if (this.giveUpHandlerService.isGivenUp) this.clientSocketService.socket.emit('deleteGame', this.clientSocketService.currentRoom.id);
    }
}
