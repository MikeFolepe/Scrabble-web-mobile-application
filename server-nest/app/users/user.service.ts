// import user for common
import { PreferenceService } from '@app/Preference/preference.service';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    activeUsers: User[];
    // private users: User[] = [];

    constructor(@InjectModel('User') private readonly userModel: Model<User>, private preferenceService: PreferenceService) {
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
        const newUser = new this.userModel({ avatar, pseudonym, password, email });
        await newUser.save();
        this.preferenceService.addPreference(pseudonym);
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userModel.find().exec();
        return users.map((user) => ({
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id,
            ipAddress: '',
            avatar: user.avatar,
            pseudonym: user.pseudonym,
            password: user.password,
            email: user.email,
            socketId: '',
            isObserver: false,
        }));
    }

    async getSingleUser(pseudonym: string): Promise<User> {
        const user = await this.userModel.findOne({ pseudonym });

        if (!user) return;
        const userToSend = new User(user.avatar, user.pseudonym, user.password, user.email, user.isObserver, '');
        return userToSend;
    }
}
