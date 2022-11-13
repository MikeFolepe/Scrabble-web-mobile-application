//import user for common
import { User } from '@common/user';
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class UserService {

    activeUsers: User[];
    private users : User[] = [];

    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
        this.activeUsers = [];
    }

    // fonction 1 de Mike
    async addUser(userData: User): Promise<void> {
        this.activeUsers.push(userData);
    }

    // fonction 2 de Mike
    async findOne(username: string): Promise<User | undefined> {
        return this.activeUsers.find((user) => user.pseudonym === username);
    }


    async insertUser(avatar : string, pseudonym : string, password : string, email : string) {
        const newUser = new this.userModel({avatar, pseudonym, password, email});
        const result = await newUser.save();
        return result.id as string;
    }

    // get all the users from the database

    async getUsers() {
        const users = await this.userModel.find().exec();
        return users.map((user) => ({
            id: user.id,
            ipAddress: "",
            avatar: user.avatar,
            pseudonym: user.pseudonym,
            password: user.password,
            email: user.email,
            socketId: "",
        }));
    }


    async getSingleUser(pseudonym : string) {
        const user = await this.findUser(pseudonym);
        console.log(user.pseudonym);
        return user;
    }
    


    private async findUser(pseudonym : string): Promise<User> {
        let user;

        try {
            user = await this.userModel.findOne({pseudonym: pseudonym});
        } catch (error) {
            throw new NotFoundException('Could not find user');
        }

        if(!user) {
            throw new Error('Le pseudonyme n\'existe pas');
        }

        return {
            id: user.id,
            ipAddress: user.ipAddress,
            avatar: user.avatar,
            pseudonym: user.pseudonym,
            password: user.password,
            email: user.email,
        };
    }


 
}