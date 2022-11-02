import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GiveUpHandlerService } from '@app/services/give-up-handler.service';
import { LetterService } from '@app/services/letter.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { ChatRoom } from '@common/chatRoom';
import { GameType } from '@common/game-type';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    selectedGameTypeIndex: number;
    selectedGameType: string | GameType;
    selectedGameMode?: string;
    selectedChatRooms : string[];
    chatRoomForm : boolean;
    isOpen : boolean;
    chatRoomName : string;
    readonly gameType: string[];
    readonly gameModes: string[];

    constructor(
        public gameSettingsService: GameSettingsService,
        private router: Router,
        public bestScoresDialog: MatDialog,
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog : MatDialog,
        private clientSocketService: ClientSocketService,
        private letterService: LetterService,
        private placeLetterService: PlaceLetterService,
        private giveUpHandlerService: GiveUpHandlerService,
        private endGameService: EndGameService,
        private authService: AuthService,
        public chatRoomService: ChatRoomService,
    ) {
        this.selectedGameTypeIndex = 0;
        this.gameType = ['Scrabble classique', 'Scrabble LOG2990'];
        this.gameModes = ['Jouer une partie en solo', 'Créer une partie multijoueur', 'Joindre une partie multijoueur'];
        this.chatRoomService.getChatRooms();
        this.selectedChatRooms = [];
        this.chatRoomForm = false;
        this.isOpen = false;
        this.resetServices();
    }

    routeToGameMode(): void {
        // Update game type and game mode, then route
        switch (this.selectedGameMode) {
            case this.gameModes[0]: {
                this.gameSettingsService.isSoloMode = true;
                this.router.navigate(['solo-game-ai']);
                break;
            }
            case this.gameModes[1]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['multiplayer-mode']);
                break;
            }
            case this.gameModes[2]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['join-room']);
                break;
            }
        }
    }

    openChatRoomForm() : void {
        this.chatRoomForm = true;
    }

    createChatRoom(): void {
        this.clientSocketService.socket.emit('createChatRoom', this.authService.currentUser, this.chatRoomName);
        // this.chatRoomService.getChatRooms();
    }

    deleteChatRoom(index : any) : void {
        this.chatRoomService.chatRooms.splice(index, 1);
        this.clientSocketService.socket.emit('deleteChatRoom', index);

    }

    closeChatRoomForm() : void {
        // this.chatRooms.push(this.chatRoomName);
        // // this.chatRoomName = "";
        this.chatRoomForm = false;
    }

    openChat() : void {
        this.isOpen = true;
    }

    onChange(value : ChatRoom) {
        if(this.selectedChatRooms.includes(value.chatRoomName)) {
            this.selectedChatRooms.splice(this.selectedChatRooms.indexOf(value.chatRoomName), 1);
        } else {
            this.selectedChatRooms.push(value.chatRoomName);
        }
    }

    joinRoom() {
        this.clientSocketService.socket.emit('joinChatRoom', this.authService.currentUser, this.selectedChatRooms);
        this.selectedChatRooms = [];
    }

    openBestScoresDialog(): void {
        this.bestScoresDialog.open(BestScoresComponent, { disableClose: true });
    }

    openChangeChatRoomDialog() : void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog() : void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog() : void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    resetServices() {
        this.giveUpHandlerService.isGivenUp = false;
        this.endGameService.actionsLog = [];
        this.letterService.ngOnDestroy();
        this.placeLetterService.ngOnDestroy();
        this.gameSettingsService.ngOnDestroy();
    }
}


