/* eslint-disable prettier/prettier */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_DICTIONARY_INDEX, GAME_TYPES, NumberOfPlayer } from '@app/classes/constants';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { ChannelHandlerService } from '@app/services/channel-handler.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameSettings, RoomType, StartingPlayer } from '@common/game-settings';
import { PasswordGameDialogComponent } from '@app/modules/initialize-game/password-game-dialog/password-game-dialog.component';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    dictionaries: Dictionary[];
    selectedDictionary: Dictionary;
    isDictionaryDeleted: boolean;
    fileName: string;
    channels: string[] = [];
    channel: string;
    gameTypes: string[];
    gameTypeInput: NumberOfPlayer = NumberOfPlayer.OneVone;
    gameTypeMessage: string;
    constructor(
        private clientSocket: ClientSocketService,
        public gameSettingsService: GameSettingsService,
        public channelHandlerService: ChannelHandlerService,
        private router: Router,
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
        private communicationService: CommunicationService,
        public adminService: AdministratorService,
        private authService: AuthService,
        public dialog: MatDialog,
    ) {
        this.gameSettingsService.ngOnDestroy();
        this.gameTypes = GAME_TYPES;
    }

    async ngOnInit(): Promise<void> {
        await this.initializeDictionaries();
        await this.selectGameDictionary(this.dictionaries[DEFAULT_DICTIONARY_INDEX]);
        this.form = new FormGroup({
            playerName: new FormControl(this.authService.currentUser.pseudonym),
            minuteInput: new FormControl(this.gameSettingsService.gameSettings.timeMinute),
            secondInput: new FormControl(this.gameSettingsService.gameSettings.timeSecond),
            visibilityInput: new FormControl('Publique'),
            levelInput: new FormControl('Débutant'),
            channelInput: new FormControl(''),
            dictionaryInput: new FormControl(this.selectedDictionary.title, [Validators.required]),
            gameType: new FormControl(this.gameTypes[0]),
        });
        this.adminService.initializeAiPlayers();
    }

    async initializeGame(): Promise<void> {
        await this.selectGameDictionary(this.selectedDictionary);
        if (this.isDictionaryDeleted) return;
        this.snapshotSettings();
    }

    selectGameType(gameType: number) {
        this.gameTypeInput = gameType === 0 ? NumberOfPlayer.OneVone : NumberOfPlayer.OneVthree;
        this.gameSettingsService.gameSettings.gameType = this.gameTypeInput;
    }

    async selectGameDictionary(dictionary: Dictionary): Promise<void> {
        const dictionaries = await this.communicationService.getDictionaries().toPromise();
        if (!dictionaries.find((dictionaryInArray: Dictionary) => dictionary.title === dictionaryInArray.title)) {
            this.isDictionaryDeleted = true;
            this.form.controls.dictionaryInput.setErrors({ incorrect: true });
            return;
        }
        this.isDictionaryDeleted = false;
        if (this.form) this.form.controls.dictionaryInput.setErrors(null);
        this.selectedDictionary = dictionary;
        this.fileName = this.selectedDictionary.fileName;
    }

    keyPressSubmit(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.form.valid) this.initializeGame();
    }

    ngOnDestroy(): void {
        this.gameSettingsService.isRedirectedFromMultiplayerGame = false;
    }

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }

    private async initializeDictionaries(): Promise<void> {
        this.dictionaries = await this.communicationService.getDictionaries().toPromise();
    }

    private snapshotSettings(): void {
        const type: RoomType = this.form.controls.visibilityInput.value === 'Publique' ? RoomType.public : RoomType.private;
        this.gameSettingsService.gameSettings = new GameSettings(
            this.form.controls.playerName.value,
            StartingPlayer.Player1,
            this.form.controls.minuteInput.value,
            this.form.controls.secondInput.value,
            this.getLevel(),
            this.fileName,
            type,
            this.gameTypeInput,
        );
        this.handleGameType(type);
    }

    private handleGameType(type: RoomType): void {
        if (type === RoomType.public) {
            const ref = this.dialog.open(PasswordGameDialogComponent, {
                disableClose: true,
                width: '500px',
                height: '300px',
            });
            ref.afterClosed().subscribe((password) => {
                // if user closes the dialog box without input nothing
                if (password == null) {
                    this.goToWaiting();
                    return;
                }
                // if decision is true the EndGame occurred
                this.gameSettingsService.gameSettings.password = password;
                this.goToWaiting();
            });
        } else {
            this.goToWaiting();
        }
    }

    private goToWaiting(): void {
        this.clientSocket.socket.emit('createRoom', this.gameSettingsService.gameSettings, this.authService.currentUser._id);
        const nextUrl = 'waiting-room';
        this.router.navigate([nextUrl]);
    }

    private getLevel(): AiType {
        return this.form.controls.levelInput.value === 'Débutant' ? AiType.beginner : AiType.expert;
    }
}
