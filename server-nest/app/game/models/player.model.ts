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
    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }

    // getEasel(): string {
    //     let hand = '[';
    //     for (const letter of this.letterTable) {
    //         hand += letter.value;
    //     }

    //     return hand + ']';
    // }
}
