/* eslint-disable no-underscore-dangle */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { AuthService } from '@app/services/auth.service';
import { ChatRoomService } from '@app/services/chat-room.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GiveUpHandlerService } from '@app/services/give-up-handler.service';
import { LetterService } from '@app/services/letter.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { UserService } from '@app/services/user.service';
import { GameType } from '@common/game-type';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    selectedGameTypeIndex: number;
    selectedGameType: string | GameType;
    selectedGameMode?: string;
    selectedChatRooms: string[];
    chatRoomForm: boolean;
    isOpen: boolean;
    chatRoomName: string;
    disconnect: boolean;
    readonly gameType: string[];
    readonly gameModes: string[];
    // @ViewChild('popoutWindow') private popoutWindow: PopoutWindowComponent;
    constructor(
        public authService: AuthService,
        public gameSettingsService: GameSettingsService,
        private router: Router,
        public bestScoresDialog: MatDialog,
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public notificationsDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
        private letterService: LetterService,
        private placeLetterService: PlaceLetterService,
        private giveUpHandlerService: GiveUpHandlerService,
        public chatRoomService: ChatRoomService,
        public userService: UserService,
    ) {
        this.selectedGameTypeIndex = 0;
        // this.gameType = ['Scrabble classique'];
        this.gameModes = ['Cr??er une partie multijoueur', 'Joindre une partie multijoueur'];
        this.chatRoomService.getChatRooms();
        this.selectedChatRooms = [];
        this.chatRoomForm = false;
        this.isOpen = false;
        this.resetServices();
        this.disconnect = false;
    }

    routeToGameMode(): void {
        // Update game type and game mode, then route
        switch (this.selectedGameMode) {
            case this.gameModes[0]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['multiplayer-mode']);
                break;
            }
            case this.gameModes[1]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['join-room']);
                break;
            }
        }
    }

    logout() {
        this.authService.logout();
    }
    openChatRoomForm(): void {
        this.chatRoomForm = true;
    }

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openNotificationDialog(): void {
        this.notificationsDialog.open(NotificationsDialogComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    resetServices() {
        this.giveUpHandlerService.isGivenUp = false;
        this.letterService.ngOnDestroy();
        this.placeLetterService.ngOnDestroy();
        this.gameSettingsService.ngOnDestroy();
    }

    // async changeLanguage(language: number) {
    //     console.log(language);
    //     this.userService.userPreferences.language = Number(
    //         await this.communicationService.updateLanguage(this.authService.currentUser._id, language).toPromise(),
    //     );
    //     console.log(this.userService.userPreferences.language);
    //     await this.authService.initLanguage();
    // }
}
