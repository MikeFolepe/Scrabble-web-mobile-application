/* eslint-disable no-underscore-dangle */
// import user for common
import { ConnectionDocument } from '@app/model/connection-schema';
import { FriendDocument } from '@app/model/friend.schema';
import { GameDocument } from '@app/model/game-schema';
import { UserStatsDocument } from '@app/model/user-stats.schema';
import { UserDocument } from '@app/model/user.schema';
import { User } from '@common/user';
import { UserStatsDB } from '@common/user-stats';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    activeUsers: User[];
    // private users: User[] = [];

    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('Friend') private readonly friendModel: Model<FriendDocument>,
        @InjectModel('UserStats') private readonly userStatsModel: Model<UserStatsDocument>,
        @InjectModel('Game') private readonly gameModel: Model<GameDocument>,
        @InjectModel('Connection') private readonly connectionModel: Model<ConnectionDocument>,
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
        const newUser = new this.userModel({ pseudonym, avatar, password, email, xpPoints: 0, friends: [] });
        await newUser.save();
        await this.initializeUserStat(newUser._id);
    }

    async initializeUserStat(userId: string) {
        const newStat = new this.userStatsModel({
            userId,
            gamesPlayed: 0,
            gamesWon: 0,
            totalPoints: 0,
            totalTimeMs: 0,
            logins: [],
            logouts: [],
            games: [],
        });
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
        console.log(userStats);
        return userStats;
    }
}
