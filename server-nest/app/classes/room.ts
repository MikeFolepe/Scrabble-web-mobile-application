import { PlayerAI } from '@app/game/models/player-ai.model';
import { Player } from '@app/game/models/player.model';
import { LetterService } from '@app/game/services/letter/letter.service';
import { PlaceLetterService } from '@app/game/services/place-letter/place-letter.service';
import { PlayerService } from '@app/game/services/player/player.service';
import { WordValidationService } from '@app/game/services/word-validation/word-validation.service';
import { GameSettings } from '@common/game-settings';

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
    placeLetter: PlaceLetterService;
    playerService: PlayerService;
    turnCounter: number;

    constructor(roomId: string, socketId: string, gameSettings: GameSettings, state: State = State.Waiting) {
        this.turnCounter = 0;
        this.id = roomId;
        this.socketIds = [];
        this.socketIds.push(socketId);
        this.gameSettings = gameSettings;
        this.state = state;
        this.wordValidation = new WordValidationService(this.gameSettings.dictionary);
        this.letter = new LetterService();
        this.playerService = new PlayerService(this.letter);
        this.placeLetter = new PlaceLetterService(this.wordValidation, this.playerService);
        this.playerService.players[0] = new Player(this.gameSettings.creatorName, this.letter.getRandomLetters(), 0, true, true);
        // this.playerService.players[1] = new PlayerAI(
        //     'BOT1',
        //     this.letter.getRandomLetters(),
        //     this.playerService,
        //     this.gameSettings,
        //     this.placeLetter,
        //     this.letter,
        //     this.wordValidation,
        // );

        // this.playerService.players[2] = new PlayerAI(
        //     'BOT2',
        //     this.letter.getRandomLetters(),
        //     this.playerService,
        //     this.gameSettings,
        //     this.placeLetter,
        //     this.letter,
        //     this.wordValidation,
        // );
        // this.playerService.players[3] = new PlayerAI(
        //     'BOT4',
        //     this.letter.getRandomLetters(),
        //     this.playerService,
        //     this.gameSettings,
        //     this.placeLetter,
        //     this.letter,
        //     this.wordValidation,
        // );



        // this.player = new Player('ok, ', this.letter.reserve, 0);

        // this.aiPlayers = new PlayerAI(
        //     'ok',
        //     this.letter.getRandomLetters(),
        //     this.playerService,
        //     this.player,
        //     this.gameSettings,
        //     this.placeLetter,
        //     this.letter,
        //     this.wordValidation,
        // );

        // instancier placeLetterService avec wordValidation, instancier  world validation, instancier playerService           placer tout dans Ai
    }
}
