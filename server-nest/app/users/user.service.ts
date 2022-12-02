/* eslint-disable no-underscore-dangle */
// import user for common
import { ConnectionDocument } from '@app/model/connection-schema';
import { FriendDocument } from '@app/model/friend.schema';
import { GameDocument } from '@app/model/game-schema';
import { NotificationDocument } from '@app/model/notification-schema';
import { UserStatsDocument } from '@app/model/user-stats.schema';
import { UserDocument } from '@app/model/user.schema';
import { PreferenceService } from '@app/Preference/preference.service';
import { Friend } from '@common/friend';
import { Notification } from '@common/notification';
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
        @InjectModel('Notification') private readonly notificationModel: Model<NotificationDocument>,
        private preferenceService: PreferenceService,
    ) {
        this.activeUsers = [];
    }

    // fonction 1 de Mike
    addUser(userData: User): void {
        console.log('add active');
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
            notifications: user.notifications,
            invitations: user.invitations,
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
        const newDate = new Date().getFullYear().toString() + '/' + new Date().getMonth().toString() + '/' + new Date().getDate().toString();
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
        const newDate = new Date().getFullYear().toString() + '/' + new Date().getMonth().toString() + '/' + new Date().getDate().toString();
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
        console.log(userDB);
        console.log('ici');
        return userDB;
    }

    async getUserEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email });

        if (!user) return;
        const userToSend = new User(user.avatar, user.pseudonym, user.password, user.email);
        return userToSend;
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

    async addInvitation(pseudonym: string, invitation: Friend): Promise<Friend> {
        const newInvitation = new this.friendModel({
            avatar: invitation.avatar,
            pseudonym: invitation.pseudonym,
            xpPoints: invitation.xpPoints,
        });
        const user = await this.userModel.findOne({ pseudonym });
        user.invitations.push(newInvitation);
        await user.save();
        const invitationAdded = new Friend(newInvitation.pseudonym, newInvitation.avatar, newInvitation.xpPoints);
        invitationAdded._id = newInvitation._id;
        return invitationAdded;
    }

    async addNotification(pseudonym: string, notification: Notification): Promise<Notification> {
        const newNotif = new this.notificationModel({
            type: notification.type,
            sender: notification.sender,
            description: notification.description,
            title: notification.title,
            date: notification.date,
            time: notification.date,
        });
        const user = await this.userModel.findOne({ pseudonym });
        user.notifications.push(newNotif);
        await user.save();
        const notifAdded = new Notification(newNotif.type, newNotif.sender, newNotif.description);
        notifAdded._id = newNotif._id;
        return notifAdded;
    }
}
