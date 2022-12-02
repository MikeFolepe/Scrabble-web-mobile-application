/* eslint-disable max-classes-per-file */
import { Connection, GameDB, UserStatsDB } from '@common/user-stats';
export class Game {
    startDate: string;
    startTime: string;
    winnerName: string;

    constructor(gameDB: GameDB) {
        this.startDate = gameDB.startDate;
        this.startTime = gameDB.startTime;
        this.winnerName = gameDB.winnerName;
    }

    isWinner(pseudonym: string): boolean {
        return pseudonym === this.winnerName;
    }
}

export class UserStats {
    userId: string;
    gamesPlayed: number;
    gamesWon: number;
    totalPoints: number;
    totalTimeMs: number;

    logins: Connection[];
    logouts: Connection[];
    games: Game[];

    constructor(userStatDB: UserStatsDB) {
        this.userId = userStatDB.userId;
        this.gamesPlayed = userStatDB.gamesPlayed;
        this.gamesWon = userStatDB.gamesWon;
        this.totalPoints = userStatDB.totalPoints;
        this.totalTimeMs = userStatDB.totalTimeMs;
        this.games = [];
        for (const game of userStatDB.games) {
            this.games.push(new Game(game));
        }
        this.logins = [];
        for (const login of userStatDB.logins) {
            this.logins.push(new Connection(login.date, login.time, login.isLogin));
        }
        this.logouts = [];
        for (const logout of userStatDB.logouts) {
            this.logouts.push(new Connection(logout.date, logout.time, logout.isLogin));
        }
    }

    getAveragePoints(): number {
        return Math.floor(this.totalPoints / this.gamesPlayed);
    }

    getAverageTime(): string {
        const averageTimeMs = this.totalTimeMs / this.gamesPlayed;

        const hour = Math.floor(averageTimeMs / (1000 * 60 * 60)) % 24;
        const minute = Math.floor(averageTimeMs / (1000 * 60)) % 60;
        const second = Math.floor(averageTimeMs / 1000) % 60;
        if (hour === 0) {
            const minutes = minute.toString() + 'm' + second.toString() + 's';
            return minutes;
        }
        const time = hour.toString() + 'h' + minute.toString() + 'm' + second.toString() + 's';
        return time;
    }
}
