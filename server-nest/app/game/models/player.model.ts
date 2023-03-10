import { Letter } from '@common/letter';

export class Player {
    avatar: string;
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
        avatar: string = '',
    ) {
        this.score = score;
        this.isTurn = isTurn;
        this.isCreator = isCreator;
        this.isAi = isAi;
        this.avatar = avatar;
    }

    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }
}
