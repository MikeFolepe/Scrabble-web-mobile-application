import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_FONT_SIZE } from '@app/classes/constants';
import { GiveUpGameDialogComponent } from '@app/modules/game-view/give-up-game-dialog/give-up-game-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ChatRoomService } from '@app/services/chat-room.service';
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
import { AddChatRoomComponent } from '../add-chat-room/add-chat-room.component';
import { BestActionsDialogComponent } from '../best-actions-dialog/best-actions-dialog.component';
import { ChangeChatRoomComponent } from '../change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '../join-chat-rooms/join-chat-rooms.component';
// import { MainPageComponent } from '@app/pages/main-page/main-page.component';

@Component({
    selector: 'app-game-view',
    templateUrl: './game-view.component.html',
    styleUrls: ['./game-view.component.scss'],
})
export class GameViewComponent {
    @ViewChild('audio') audio: ElementRef;
    @ViewChild('encou') encou: ElementRef;
    @ViewChild('decou') decou: ElementRef;
    fontSize: number;
    selectedChatRooms: string[];
    chatRoomForm: boolean;
    isOpen: boolean;
    chatRoomName: string;

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
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
        public bestActionsDialog: MatDialog,
        public sendMessageService: SendMessageService,
        public giveUpHandlerService: GiveUpHandlerService,
        private placeLetterService: PlaceLetterService,
        public chatRoomService: ChatRoomService,
        public authService: AuthService,
    ) {
        this.fontSize = DEFAULT_FONT_SIZE;
        // this.giveUpHandlerService.receiveEndGameByGiveUp();
        this.chatRoomService.getChatRooms();
        this.selectedChatRooms = [];
        this.chatRoomForm = false;
        this.isOpen = false;
        this.playAudio();
        this.skipTurnService.activeSound.subscribe((res) => {
            this.encou.nativeElement.play();
        });
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
            console.log('here', this.authService.currentUser.pseudonym);
            this.clientSocketService.socket.emit('sendGiveUp', this.authService.currentUser.pseudonym, this.clientSocketService.currentRoom.id);
        });
    }

    confirmLeaveByObserver(): void {
        const ref = this.dialog.open(GiveUpGameDialogComponent, { disableClose: true });

        ref.afterClosed().subscribe((decision: boolean) => {
            // if user closes the dialog box without input nothing
            if (!decision) return;
            // if decision is true the EndGame occurred
            this.clientSocketService.socket.emit('sendObserverLeave', this.clientSocketService.currentRoom.id);
        });
    }
    leaveGame(): void {
        this.placeLetterService.ngOnDestroy();
        this.gridService.ngOnDestroy();
        this.endGameService.clearAllData();
        this.playerService.clearPlayers();
        this.gameSettingsService.ngOnDestroy();
    }

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }
    openBestActionsDialog(): void {
        this.clientSocketService.socket.emit('sendBest', this.clientSocketService.currentRoom.id, this.playerService.currentPlayer.name);
        this.bestActionsDialog.open(BestActionsDialogComponent, { disableClose: true });
    }
    playAudio(): void {
        this.clientSocketService.socket.on('playAudio', () => {
            this.audio.nativeElement.play();
        });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    openChat(): void {
        this.isOpen = true;
    }
}
