export class Connection {
    constructor(public date: string, public time: string, public isLogin: boolean) {}
}

export class GameDB {
    constructor(public startDate: string, public startTime: string, public winnerName: string) {}
}

export interface UserStatsDB {
    userId: string;
    gamesPlayed: number;
    gamesWon: number;
    totalPoints: number;
    totalTimeMs: number;
    logins: Connection[];
    logouts: Connection[];
    games: GameDB[];
}
