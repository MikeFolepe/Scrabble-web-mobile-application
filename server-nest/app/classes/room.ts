import { PlayerAI } from '@app/game/models/player-ai.model';
import { Player } from '@app/game/models/player.model';
import { LetterService } from '@app/game/services/letter/letter.service';
import { PlaceLetterService } from '@app/game/services/place-letter/place-letter.service';
import { PlayerService } from '@app/game/services/player/player.service';
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
    playerAi: PlayerAI;
    placeLetter: PlaceLetterService;
    playerService: PlayerService;
    player: Player;

    constructor(roomId: string, socketId: string, gameSettings: GameSettings, state: State = State.Waiting) {
        this.id = roomId;
        this.socketIds = [];
        this.socketIds[PlayerIndex.OWNER] = socketId;
        this.gameSettings = gameSettings;
        this.state = state;
        this.wordValidation = new WordValidationService(this.gameSettings.dictionary);
        this.letter = new LetterService();
        this.placeLetter = new PlaceLetterService(this.wordValidation);
        this.player = new Player(0, 'ok, ', this.letter.reserve, 0);
        this.playerService = new PlayerService();
        this.playerService.players[0] = this.player;
        this.playerAi = new PlayerAI(
            0,
            'ok',
            this.letter.getRandomLetters(),
            0,
            this.playerService,
            this.player,
            this.gameSettings,
            this.placeLetter,
            this.letter,
            this.wordValidation,
        );
        // instancier placeLetterService avec wordValidation, instancier  world validation, instancier playerService           placer tout dans Ai
    }
}
