/* eslint-disable no-underscore-dangle */
// import user for common
import { ConnectionDocument } from '@app/model/connection-schema';
import { FriendDocument } from '@app/model/friend.schema';
import { GameDocument } from '@app/model/game-schema';
import { UserStatsDocument } from '@app/model/user-stats.schema';
import { UserDocument } from '@app/model/user.schema';
import { PreferenceService } from '@app/Preference/preference.service';
import { User } from '@common/user';
import { GameDB, UserStatsDB } from '@common/user-stats';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    activeUsers: User[];

    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('Friend') private readonly friendModel: Model<FriendDocument>,
        @InjectModel('UserStats') private readonly userStatsModel: Model<UserStatsDocument>,
        @InjectModel('Game') private readonly gameModel: Model<GameDocument>,
        @InjectModel('Connection') private readonly connectionModel: Model<ConnectionDocument>,
        private preferenceService: PreferenceService,
    ) {
        this.activeUsers = [];
    }

    // fonction 1 de Mike
    addUser(userData: User): void {
        this.activeUsers.push(userData);
    }

    // fonction 2 de Mike
    checkIfConnected(pseudonym: string): boolean {
        return Boolean(this.activeUsers.find((user) => user.pseudonym === pseudonym));
    }

    async insertUser(avatar: string, pseudonym: string, password: string, email: string) {
        const newUser = new this.userModel({ pseudonym, avatar, password, email });
        await newUser.save();
        await this.initializeUserStat(newUser._id);
        this.preferenceService.addPreference(newUser._id);
    }

    async initializeUserStat(userId: string) {
        const newStat = new this.userStatsModel({ userId });
        await newStat.save();
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userModel.find().exec();
        return users.map((user) => ({
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id,
            pseudonym: user.pseudonym,
            avatar: user.avatar,
            password: user.password,
            email: user.email,
            xpPoints: user.xpPoints,
            friends: user.friends,
        }));
    }

    async getSingleUser(pseudonym: string): Promise<User> {
        const user = await this.userModel.findOne({ pseudonym });
        if (!user) return;
        const userToSend = new User(user.avatar, user.pseudonym, user.password, user.email);
        userToSend._id = user._id;
        userToSend.xpPoints = user.xpPoints;
        userToSend.friends = user.friends;
        console.log(userToSend);
        return userToSend;
    }

    async getUserStats(userId: string): Promise<UserStatsDB> {
        const statsFromDB = await this.userStatsModel.findOne({ userId }).exec();
        const userStats: UserStatsDB = {
            userId: statsFromDB.userId,
            gamesPlayed: statsFromDB.gamesPlayed,
            gamesWon: statsFromDB.gamesWon,
            totalPoints: statsFromDB.totalPoints,
            totalTimeMs: statsFromDB.totalTimeMs,
            logins: statsFromDB.logins,
            logouts: statsFromDB.logouts,
            games: statsFromDB.games,
        };
        return userStats;
    }

    async addLogin(userId: string): Promise<void> {
        const month = (new Date().getMonth() + 1).toString();
        const newDate = new Date().getFullYear().toString() + '/' + month + '/' + new Date().getDate().toString();
        const newHour =
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');

        const newLogin = new this.connectionModel({
            date: newDate,
            time: newHour,
            isLogin: true,
        });

        const userStat = await this.userStatsModel.findOne({ userId }).exec();
        const lastTab = userStat.logins;
        lastTab.push(newLogin);

        await this.userStatsModel.updateOne({ userId }, { logins: lastTab });
    }

    async addLogout(userId: string): Promise<void> {
        const month = (new Date().getMonth() + 1).toString();
        const newDate = new Date().getFullYear().toString() + '/' + month + '/' + new Date().getDate().toString();
        const newHour =
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');

        const newLogout = new this.connectionModel({
            date: newDate,
            time: newHour,
            isLogin: false,
        });

        const userStat = await this.userStatsModel.findOne({ userId }).exec();
        const lastTab = userStat.logouts;
        lastTab.push(newLogout);

        await this.userStatsModel.updateOne({ userId }, { logouts: lastTab });
    }

    async addGame(game: GameDB, userId: string): Promise<void> {
        const newGame = new this.gameModel({
            startDate: game.startDate,
            startTime: game.startTime,
            winnerName: game.winnerName,
        });
        console.log(userId);
        const userStat = await this.userStatsModel.findOne({ userId }).exec();
        const lastTab = userStat.games;
        lastTab.push(newGame);

        await this.userStatsModel.updateOne({ userId }, { games: lastTab });
    }

    async updateGamesWon(userId: string, gamesWon: number): Promise<void> {
        await this.userStatsModel.findOneAndUpdate({ userId }, { gamesWon });
    }

    async updateGamesPlayed(userId: string, gamesPlayed: number): Promise<void> {
        await this.userStatsModel.findOneAndUpdate({ userId }, { gamesPlayed });
    }

    async updateTotalPoints(userId: string, totalPoints: number): Promise<void> {
        console.log(totalPoints);
        const userStat = await this.userStatsModel.findOne({ userId });
        const newPoints = userStat.totalPoints + totalPoints;
        await this.userStatsModel.findOneAndUpdate({ userId }, { totalPoints: newPoints });
    }

    async updateXpPoints(userId: string, xpPoints: number): Promise<void> {
        await this.userModel.findOneAndUpdate({ _id: userId }, { xpPoints });
    }

    async updateTimesPlayed(totalTimeMs: number, userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            console.log(userId);
            const userStats = await this.userStatsModel.findOne({ userId });

            const newTime = userStats.totalTimeMs + totalTimeMs;
            await this.userStatsModel.updateOne({ userId }, { totalTimeMs: newTime });
        }
    }

    async updateUser(user: User): Promise<User> {
        await this.userModel.findByIdAndUpdate({ _id: user._id }, { pseudonym: user.pseudonym, avatar: user.avatar });
        const userDB = await this.getSingleUser(user.pseudonym);
        return userDB;
    }

    encryptPassword(password: string): string {
        const encryptedPassword = password
            .split('')
            .map((char) => char.charCodeAt(0) * 2 + 2)
            .toString()
            .split(',')
            .map((char) => (char.length === 2 ? '0' + char : char))
            .map((char) => (char.length === 1 ? '00' + char : char))
            .join('');

        return encryptedPassword;
    }

    async decryptPassword(pseudonym: string) {
        const user = await this.getSingleUser(pseudonym);
        if (!user) return;

        const encryptedPassword = user.password;

        const password = encryptedPassword
            .match(/.{1,3}/g)
            .map((char) => String.fromCharCode((parseInt(char, 10) - 2) / 2))
            .join('');

        return password;
    }
}
