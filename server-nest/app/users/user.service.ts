// import user for common
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    activeUsers: User[];
    // private users: User[] = [];

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
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
    }

    async getUsers() {
        const users = await this.userModel.find().exec();
        return users.map((user) => ({
            _id: user.id,
            ipAddress: '',
            avatar: user.avatar,
            pseudonym: user.pseudonym,
            password: user.password,
            email: user.email,
            socketId: '',
        }));
    }

    async getSingleUser(pseudonym: string) {
        let user;

   
        user = await this.userModel.findOne({ pseudonym });

        if (!user) {
            return;
        }

        return user;
    }

}
