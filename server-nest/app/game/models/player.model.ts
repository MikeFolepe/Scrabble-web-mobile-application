import { Letter } from '@common/letter';

export class Player {
    score: number;
    constructor(public id: number, public name: string, public letterTable: Letter[], score: number = 0) {
        this.score = score;
    }
    getEasel(): string {
        let hand = '[';
        for (const letter of this.letterTable) {
            hand += letter.value;
        }

        return hand + ']';
    }
}
