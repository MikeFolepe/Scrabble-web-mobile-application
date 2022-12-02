import { DEFAULT_AI_PLAYERS_NB, DEFAULT_HUMAN_PLAYERS_NB, DEFAULT_SOLO_AI_PLAYERS_NB } from '@app/classes/constants';
import { PlayerAI } from '@app/game/models/player-ai.model';
import { Player } from '@app/game/models/player.model';
import { EndGameService } from '@app/game/services/end-game/end-game.service';
import { LetterService } from '@app/game/services/letter/letter.service';
import { PlaceLetterService } from '@app/game/services/place-letter/place-letter.service';
import { PlayerService } from '@app/game/services/player/player.service';
import { SkipTurnService } from '@app/game/services/skip-turn-service/skip-turn-service';
import { WordValidationService } from '@app/game/services/word-validation/word-validation.service';
import { ChatRoomMessage } from '@common/chatRoomMessage';
import { bot } from '@common/defaultAvatars';
import { GameSettings, NumberOfPlayer } from '@common/game-settings';
import { User } from '@common/user';
import { AI_NAMES } from './aiNames';

export enum State {
    Playing,
    Waiting,
    Finish,
}

export class ServerRoom {
    id: string;
    gameSettings: GameSettings;
    state: State;
    socketIds: string[];
    userIds: string[];
    observers: User[];
    wordValidation: WordValidationService;
    letter: LetterService;
    placeLetter: PlaceLetterService;
    playerService: PlayerService;
    skipTurnService: SkipTurnService;
    endGameService: EndGameService;
    turnCounter: number;
    aiPlayersNumber: number;
    humanPlayersNumber: number;
    ais: PlayerAI[];
    aiTurn: number;
    aiForBestActions: PlayerAI;
    roomMessages: ChatRoomMessage[];
    constructor(roomId: string, socketId: string, gameSettings: GameSettings, state: State = State.Waiting) {
        this.aiPlayersNumber = DEFAULT_AI_PLAYERS_NB;
        this.humanPlayersNumber = DEFAULT_HUMAN_PLAYERS_NB;
        this.turnCounter = 0;
        this.id = roomId;
        this.socketIds = [];
        this.observers = [];
        this.userIds = [];
        this.socketIds.push(socketId);
        this.gameSettings = gameSettings;
        this.state = state;
        this.wordValidation = new WordValidationService(this.gameSettings.dictionary);
        this.letter = new LetterService();
        this.playerService = new PlayerService(this.letter);
        this.placeLetter = new PlaceLetterService(this.wordValidation, this.playerService);
        this.skipTurnService = new SkipTurnService(gameSettings);
        this.endGameService = new EndGameService();
        this.playerService.players[0] = new Player(this.gameSettings.creatorName, this.letter.getRandomLetters(), 0, true, true);
        this.ais = [];
        this.aiTurn = 0;
        this.initializeAiPlayers();
        this.roomMessages = [];
        // eslint-disable-next-line prettier/prettier, max-len
        this.aiForBestActions = new PlayerAI(
            'BOT',
            this.letter.getRandomLetters(),
            this.playerService.players[0],
            this.gameSettings,
            this.placeLetter,
            this.letter,
            this.wordValidation,
        );
    }

    createAi(player: Player) {
        this.ais.push(new PlayerAI(player.name, player.letterTable, player, this.gameSettings, this.placeLetter, this.letter, this.wordValidation));
    }

    initializeAiPlayers(): void {
        const defaultAiNumber = this.gameSettings.gameType === NumberOfPlayer.OneVthree ? DEFAULT_AI_PLAYERS_NB : DEFAULT_SOLO_AI_PLAYERS_NB;
        for (let i = 0; i < defaultAiNumber; i++) {
            this.playerService.players.push(
                new Player(AI_NAMES[this.playerService.players.length - 1], this.letter.getRandomLetters(), 0, false, false, true, bot),
            );
        }
    }

    aiIturn(): number {
        if (this.aiTurn === this.ais.length) this.aiTurn = 0;
        const turn = this.aiTurn;
        this.aiTurn++;
        return turn;
    }
}
