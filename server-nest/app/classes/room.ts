import { LetterService } from '@app/game/services/letter/letter.service';
import { WordValidationService } from '@app/game/word-validation.service';
import { GameSettings } from '@common/game-settings';
import { PlayerIndex } from '@common/player-index';

export enum State {
    Playing,
    Waiting,
    Finish,
}

export class Room {
    id: string;
    gameSettings: GameSettings;
    state: State;
    socketIds: string[];
    wordValidation: WordValidationService;
    letter: LetterService;

    constructor(roomId: string, socketId: string, gameSettings: GameSettings, state: State = State.Waiting) {
        this.id = roomId;
        this.socketIds = [];
        this.socketIds[PlayerIndex.OWNER] = socketId;
        this.gameSettings = gameSettings;
        this.state = state;
        this.wordValidation = new WordValidationService(this.gameSettings.dictionary);
        this.letter = new LetterService();
    }
}
