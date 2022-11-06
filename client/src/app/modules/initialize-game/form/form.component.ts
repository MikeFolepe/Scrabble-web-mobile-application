import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_DICTIONARY_INDEX, PLAYER_ONE_INDEX } from '@app/classes/constants';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { AdministratorService } from '@app/services/administrator.service';
import { ChannelHandlerService } from '@app/services/channel-handler.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameSettings, StartingPlayer } from '@common/game-settings';

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
    channel:string;    

    constructor(
        public gameSettingsService: GameSettingsService,
        public channelHandlerService : ChannelHandlerService,
        private router: Router,
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog : MatDialog,
        private communicationService: CommunicationService,
        public adminService: AdministratorService,
    ) {
        this.gameSettingsService.ngOnDestroy();
    }

    async ngOnInit(): Promise<void> {
        await this.initializeDictionaries();
        await this.selectGameDictionary(this.dictionaries[DEFAULT_DICTIONARY_INDEX]);
        this.form = new FormGroup({
            playerName: new FormControl(this.gameSettingsService.gameSettings.playersNames[PLAYER_ONE_INDEX]),
            minuteInput: new FormControl(this.gameSettingsService.gameSettings.timeMinute),
            secondInput: new FormControl(this.gameSettingsService.gameSettings.timeSecond),
            levelInput: new FormControl('Débutant'),
            channelInput: new FormControl(''),
            dictionaryInput: new FormControl(this.selectedDictionary.title, [Validators.required]),
        });
        this.adminService.initializeAiPlayers();
    }

    async initializeGame(): Promise<void> {
        await this.selectGameDictionary(this.selectedDictionary);
        if (this.isDictionaryDeleted) return;
        this.snapshotSettings();
        const nextUrl = this.gameSettingsService.isSoloMode ? 'game' : 'waiting-room';
        this.router.navigate([nextUrl]);
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

    private async initializeDictionaries(): Promise<void> {
        this.dictionaries = await this.communicationService.getDictionaries().toPromise();
    }

    private chooseStartingPlayer(): StartingPlayer {
        return Math.floor((Math.random() * Object.keys(StartingPlayer).length) / 2);
    }

    private chooseRandomAIName(levelInput: AiType): string {
        let randomName = '';
        do {
            const randomNumber = Math.floor(Math.random() * this.adminService.aiBeginner.length);
            randomName =
                levelInput === AiType.beginner ? this.adminService.aiBeginner[randomNumber].aiName : this.adminService.aiExpert[randomNumber].aiName;
        } while (randomName === this.form.controls.playerName.value);
        return randomName;
    }

    private snapshotSettings(): void {
        const playersNames: string[] = [this.form.controls.playerName.value, this.chooseRandomAIName(this.form.controls.levelInput.value)];
        this.gameSettingsService.gameSettings = new GameSettings(
            playersNames,
            this.chooseStartingPlayer(),
            this.form.controls.minuteInput.value,
            this.form.controls.secondInput.value,
            this.getLevel(),
            this.fileName,
        );
    }

    private getLevel(): AiType {
        return this.form.controls.levelInput.value === AiType.beginner ? AiType.beginner : AiType.expert;
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
}
