export class Friend {
    _id?: string;
    pseudonym: string;
    avatar: string;
    xpPoints: number;

    constructor(pseudonym: string, avatar: string, xpPoints: number) {
        this.pseudonym = pseudonym;
        this.avatar = avatar
        this.xpPoints = xpPoints
    }
}
