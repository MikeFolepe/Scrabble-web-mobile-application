import { Letter } from '@common/letter';

export class Player {
    score: number;
    isTurn: boolean;
    constructor(public name: string, public letterTable: Letter[], score: number = 0) {
        this.score = score;
        this.isTurn = false;
    }
    // getEasel(): string {
    //     let hand = '[';
    //     for (const letter of this.letterTable) {
    //         hand += letter.value;
    //     }

    //     return hand + ']';
    // }
}
