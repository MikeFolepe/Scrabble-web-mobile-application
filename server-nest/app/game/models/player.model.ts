import { Letter } from '@common/letter';

export class Player {
    score: number;
    isTurn: boolean;
    isCreator: boolean;
    isAI: boolean;
    constructor(
        public name: string,
        public letterTable: Letter[],
        score: number = 0,
        isTurn: boolean = false,
        isCreator: boolean = false,
        isAi?: boolean,
    ) {
        this.score = score;
        this.isTurn = isTurn;
        this.isCreator = isCreator;
        if (isAi) this.isAI = isAi;
    }
    // getEasel(): string {
    //     let hand = '[';
    //     for (const letter of this.letterTable) {
    //         hand += letter.value;
    //     }

    //     return hand + ']';
    // }
}
