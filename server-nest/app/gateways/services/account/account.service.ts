import { Account } from "@app/model/account.schema";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class AccountService {
    
    private accounts : Account[] = [];

    constructor(@InjectModel('Account') private readonly accountModel: Model<Account>) {}

    async insertAccount(avatar : string, pseudonym : string, password : string, email : string) {
        const newAccount = new this.accountModel({avatar, pseudonym, password, email});
        const result = await newAccount.save();
        return result.id as string;
    }

    async getAccounts() {
        const accounts = await this.accountModel.find().exec();
        return accounts.map((account) => ({
            id: account.id,
            avatar: account.avatar,
            pseudonym: account.pseudonym,
            password: account.password,
            email: account.email,
        }));

    }


    async getSingleAccount(pseudonym : string) {
        const account = await this.findAccount(pseudonym);
        return account;
    }
    


    private async findAccount(pseudonym : string): Promise<Account> {
        let account;

        try {
            account = await this.accountModel.findOne({pseudonym: pseudonym});
        } catch (error) {
            throw new NotFoundException('Could not find account');
        }

        if(!account) {
            throw new Error('Le pseudonyme n\'existe pas');
        }

        return {
            id: account.id,
            avatar: account.avatar,
            pseudonym: account.pseudonym,
            password: account.password,
            email: account.email,
        };
    }


 
}