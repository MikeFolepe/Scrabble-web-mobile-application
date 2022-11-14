/* eslint-disable max-lines */
import { AiPlayer, AiType } from '@common/ai-name';
import { StartingPlayer } from '@common/game-settings';
import { Letter } from '@common/letter';
import { PlayerScore } from '@common/player';
import { Vec2 } from '@common/vec2';
import { CustomRange } from './range';

export const OUT_BOUND_INDEX_OF_SOCKET = 5;
export const DELAY_OF_DISCONNECT = 5000;
export const NUMBER_OF_BEST_PLAYERS = 5;
export const DATABASE_URL = 'mongodb+srv://Team107:xxtyU48kHQ4ZqDW@cluster0.i7hu4.mongodb.net/database?retryWrites=true&w=majority';
export const DEFAULT_SCORES: PlayerScore[] = [
    {
        score: 5,
        playerName: 'Abba',
        isDefault: true,
    },
    {
        score: 7,
        playerName: 'Abbe',
        isDefault: true,
    },
    {
        score: 9,
        playerName: 'Abbi',
        isDefault: true,
    },
    {
        score: 11,
        playerName: 'Abbo',
        isDefault: true,
    },
    {
        score: 13,
        playerName: 'Abby',
        isDefault: true,
    },
];

export const AI_BEGINNERS: AiPlayer[] = [
    {
        aiName: 'Mister_Bucky',
        isDefault: true,
    },
    {
        aiName: 'Miss_Betty',
        isDefault: true,
    },
    {
        aiName: 'Mister_Samy',
        isDefault: true,
    },
];

export const AI_EXPERTS: AiPlayer[] = [
    {
        aiName: 'Mister_Felix',
        isDefault: true,
    },
    {
        aiName: 'Miss_Patty',
        isDefault: true,
    },
    {
        aiName: 'Miss_Judith',
        isDefault: true,
    },
];
export const DEFAULT_AI_PLAYERS_NB = 3;
export const DEFAULT_HUMAN_PLAYERS_NB = 1;
export const DEFAULT_WIDTH = 750;
export const DEFAULT_HEIGHT = 750;
export const BOARD_ROWS = 15;
export const BOARD_COLUMNS = 15;
export const CENTRAL_CASE_POSITION: Vec2 = { x: 7, y: 7 };
const boardSize = 16;
export const GRID_CASE_SIZE = DEFAULT_WIDTH / boardSize;
export const EASEL_SIZE = 7;
export const ALL_EASEL_BONUS = 50;
export const MAX_NUMBER_OF_POSSIBILITY = 3;
export const NUMBER_OF_SKIP = 6;
export const MINIMUM_TIME_PLAYING_AI = 6;
export const ONE_SECOND_DELAY = 1000;
export const TWO_SECOND_DELAY = 2000;
export const THREE_SECONDS_DELAY = 3000;
export const DELAY_BEFORE_PLAYING = 3000;
export const ERROR_MESSAGE_DELAY = 4000;
export const DELAY_TO_PASS_TURN = 5000;
export const ONE_MINUTE = 60;

export const DEFAULT_CHAT_HEIGHT = 90;
export const LOG2990_CHAT_HEIGHT = 45;

export const INVALID_INDEX = -1;
export const PLAYER_ONE_INDEX = 0;
export const PLAYER_TWO_INDEX = 1;
export const PLAYER_AI_INDEX = 1;
export const LAST_INDEX = -1;
export const DEFAULT_DICTIONARY_INDEX = 0;

export const FONT_SIZE_MAX = 20;
export const FONT_SIZE_MIN = 10;
export const DEFAULT_FONT_SIZE = 13;
export const SIZE_VARIATION = 1;

export const MIN_RESERVE_SIZE_TO_SWAP = 7;
export const WHITE_LETTER_INDEX = 26;

export const COLOR_BLACK = 'black';

export const BEGINNER_POINTING_RANGE: CustomRange = { min: 1, max: 18 };

export const NAME_SIZE: CustomRange = { min: 4, max: 12 };
export const SPECIAL_CHAR = '@#$%^&*_';
export const VALIDATION_PATTERN = '^([A-Za-z][A-Za-z][A-Za-z][A-Za-z])[A-Za-z0-9' + SPECIAL_CHAR + ']*';

// Positions are used for keys
// Bonuses string are use for value
export const BONUS_POSITIONS: Map<string, string> = new Map<string, string>([
    ['A1', 'tripleWord'],
    ['A4', 'doubleLetter'],
    ['A8', 'tripleWord'],
    ['A12', 'doubleLetter'],
    ['A15', 'tripleWord'],
    ['B2', 'doubleWord'],
    ['B6', 'tripleLetter'],
    ['B10', 'tripleLetter'],
    ['B14', 'doubleWord'],
    ['C3', 'doubleWord'],
    ['C7', 'doubleLetter'],
    ['C9', 'doubleLetter'],
    ['C13', 'doubleWord'],
    ['D1', 'doubleLetter'],
    ['D4', 'doubleWord'],
    ['D8', 'doubleLetter'],
    ['D12', 'doubleWord'],
    ['D15', 'doubleLetter'],
    ['E5', 'doubleWord'],
    ['E11', 'doubleWord'],
    ['F2', 'tripleLetter'],
    ['F6', 'tripleLetter'],
    ['F10', 'tripleLetter'],
    ['F14', 'tripleLetter'],
    ['G3', 'doubleLetter'],
    ['G7', 'doubleLetter'],
    ['G9', 'doubleLetter'],
    ['G13', 'doubleLetter'],
    ['H1', 'tripleWord'],
    ['H4', 'doubleLetter'],
    ['H12', 'doubleLetter'],
    ['H15', 'tripleWord'],
    ['I3', 'doubleLetter'],
    ['I7', 'doubleLetter'],
    ['I9', 'doubleLetter'],
    ['I13', 'doubleLetter'],
    ['J2', 'tripleLetter'],
    ['J6', 'tripleLetter'],
    ['J10', 'tripleLetter'],
    ['J14', 'tripleLetter'],
    ['K5', 'doubleWord'],
    ['K11', 'doubleWord'],
    ['L1', 'doubleLetter'],
    ['L4', 'doubleWord'],
    ['L8', 'doubleLetter'],
    ['L12', 'doubleWord'],
    ['M3', 'doubleWord'],
    ['M7', 'doubleLetter'],
    ['M9', 'doubleLetter'],
    ['M13', 'doubleWord'],
    ['N2', 'doubleWord'],
    ['N6', 'tripleLetter'],
    ['N10', 'tripleLetter'],
    ['N14', 'doubleWord'],
    ['O1', 'tripleWord'],
    ['O4', 'doubleLetter'],
    ['O8', 'tripleWord'],
    ['O12', 'doubleLetter'],
    ['O15', 'tripleWord'],
]);

export const DEFAULT_GAME_SETTINGS = {
    playersNames: ['', ''],
    startingPlayer: StartingPlayer.Player1,
    timeMinute: '01',
    timeSecond: '00',
    level: AiType.beginner,
    dictionary: '',
    objectiveIds: [],
};

export const RESERVE: Letter[] = [
    {
        value: 'A',
        quantity: 9,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'B',
        quantity: 2,
        points: 3,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'C',
        quantity: 2,
        points: 3,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'D',
        quantity: 3,
        points: 2,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'E',
        quantity: 15,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'F',
        quantity: 2,
        points: 4,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'G',
        quantity: 2,
        points: 2,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'H',
        quantity: 2,
        points: 4,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'I',
        quantity: 8,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'J',
        quantity: 1,
        points: 8,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'K',
        quantity: 1,
        points: 10,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'L',
        quantity: 5,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'M',
        quantity: 3,
        points: 2,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'N',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'O',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'P',
        quantity: 2,
        points: 3,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'Q',
        quantity: 1,
        points: 8,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'R',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'S',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'T',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'U',
        quantity: 6,
        points: 1,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'V',
        quantity: 2,
        points: 4,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'W',
        quantity: 1,
        points: 10,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
        // eslint-disable-next-line max-lines
    },
    {
        value: 'X',
        quantity: 1,
        points: 10,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'Y',
        quantity: 1,
        points: 10,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: 'Z',
        quantity: 1,
        points: 10,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
    {
        value: '*',
        quantity: 2,
        points: 0,
        isSelectedForSwap: false,
        isSelectedForManipulation: false,
    },
];
