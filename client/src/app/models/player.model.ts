import { Letter } from '@common/letter';

export class Player {
    score: number;
    isTurn: boolean;
    isCreator: boolean;
    isAi: boolean;
    constructor(
        public name: string,
        public letterTable: Letter[],
        score: number = 0,
        isTurn: boolean = false,
        isCreator: boolean = false,
        isAi: boolean = false,
    ) {
        this.score = score;
        this.isTurn = isTurn;
        this.isCreator = isCreator;
        this.isAi = isAi;
    }
}
