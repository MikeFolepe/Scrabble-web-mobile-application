import { Injectable, OnDestroy } from '@angular/core';
import { DEFAULT_GAME_SETTINGS } from '@app/classes/constants';
import { GameSettings } from '@common/game-settings';
@Injectable({
    providedIn: 'root',
})
export class GameSettingsService implements OnDestroy {
    gameSettings: GameSettings;
    isSoloMode: boolean;
    gameDictionary: string[];
    isRedirectedFromMultiplayerGame: boolean;
    constructor() {
        this.gameSettings = DEFAULT_GAME_SETTINGS;
    }

    ngOnDestroy(): void {
        this.gameSettings = DEFAULT_GAME_SETTINGS;
    }
}
