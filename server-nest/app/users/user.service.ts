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
        const userToSend = new User(user.avatar, user.pseudonym, user.password, user.email, false, '');
        return userToSend;
    }

    encryptPassword(password: string): string {

        const encryptedPassword = password
            .split('')
            .map((char) => char.charCodeAt(0) * 2 + 2).toString() 
            .split(',')
            .map((char) => (char.length === 2 ? '0' + char : char))
            .map((char) => (char.length === 1 ? '00' + char : char))
            .join('');

        return encryptedPassword;
    }

    async decryptPassword(pseudonym : string) {

        const user = await this.getSingleUser(pseudonym);
        if(!user) return;
        
        const encryptedPassword = user.password;

        const password = encryptedPassword
            .match(/.{1,3}/g)
            .map((char) => String.fromCharCode((parseInt(char, 10) - 2) / 2))
            .join('');
        
        return password;
    } 
}
