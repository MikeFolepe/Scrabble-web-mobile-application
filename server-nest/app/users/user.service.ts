// import user for common
import { User } from '@common/user';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    activeUsers: User[];
    private users: User[] = [];

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
        this.activeUsers = [];
    }

    // fonction 1 de Mike
    async addUser(userData: User): Promise<void> {
        this.activeUsers.push(userData);
    }

    // fonction 2 de Mike
    async findOne(pseudonym: string): Promise<User | undefined> {
        return this.activeUsers.find((user) => user.pseudonym === pseudonym);
    }

    async insertUser(avatar: string, pseudonym: string, password: string, email: string) {
        const newUser = new this.userModel({ avatar, pseudonym, password, email });
        const result = await newUser.save();
        return result.id as string;
    }

    // get all the users from the database

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
        const user = await this.findUser(pseudonym);
        return user;
    }

    private async findUser(pseudonym: string): Promise<User> {
        let user;

        try {
            user = await this.userModel.findOne({ pseudonym });
        } catch (error) {
            throw new NotFoundException('Could not find user');
        }

        if (!user) {
            return;
        }

        return {
            _id: user.id,
            ipAddress: user.ipAddress,
            avatar: user.avatar,
            pseudonym: user.pseudonym,
            password: user.password,
            email: user.email,
            socketId: user.socketId,
            isObserver: user.isObserver,
        };
    }
}
