import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_DICTIONARY_INDEX } from '@app/classes/constants';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { ChannelHandlerService } from '@app/services/channel-handler.service';
import { ClientSocketService } from '@app/services/client-socket.service';
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
        private clientSocket: ClientSocketService,
        public gameSettingsService: GameSettingsService,
        public channelHandlerService : ChannelHandlerService,
        private router: Router,
        private communicationService: CommunicationService,
        public adminService: AdministratorService,
        private authService: AuthService,
    ) {
        this.gameSettingsService.ngOnDestroy();
    }

    async ngOnInit(): Promise<void> {
        await this.initializeDictionaries();
        await this.selectGameDictionary(this.dictionaries[DEFAULT_DICTIONARY_INDEX]);
        this.form = new FormGroup({
            playerName: new FormControl(this.authService.currentUser.pseudonym),
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
        this.clientSocket.socket.emit('createRoom', this.gameSettingsService.gameSettings);
        const nextUrl = 'waiting-room';
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

    private snapshotSettings(): void {
        this.gameSettingsService.gameSettings = new GameSettings(
            this.form.controls.playerName.value,
            StartingPlayer.Player1,
            this.form.controls.minuteInput.value,
            this.form.controls.secondInput.value,
            this.getLevel(),
            this.fileName,
        );
    }

    private getLevel(): AiType {
        return this.form.controls.levelInput.value === AiType.beginner ? AiType.beginner : AiType.expert;
    }
}
