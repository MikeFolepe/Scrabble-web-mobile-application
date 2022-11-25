// import user for common
import { Preference } from 'app/model/preferences.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PreferenceService {
    constructor(@InjectModel(Preference.name) private readonly preferenceModel: Model<Preference>) {}

    async addPreference(userPseudonym: string) {
        const newPreference = new this.preferenceModel({ user: userPseudonym });
        try {
            await newPreference.save();
        } catch (error) {
            console.log(error);
        }
    }

    async getAppTheme(userPseudonym: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.appTheme;
    }

    async getBoardTheme(userPseudonym: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.currentBoardTheme;
    }

    async getChatTheme(userPseudonym: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.currentChatTheme;
    }

    async getLangage(userPseudonym: string): Promise<number> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.langage;
    }

    async getBoards(userPseudonym: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.boughtBoards;
    }

    async getChats(userPseudonym: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.boughtChats;
    }

    async setAppTheme(userPseudonym: string, newAppTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        preference.appTheme = newAppTheme;
        preference.save();
        return preference.appTheme;
    }

    async setBoardTheme(userPseudonym: string, newBoardTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        preference.currentBoardTheme = newBoardTheme;
        preference.save();
        return preference.currentBoardTheme;
    }

    async setChatTheme(userPseudonym: string, newChatTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        preference.currentChatTheme = newChatTheme;
        preference.save();
        return preference.currentChatTheme;
    }

    async addBoard(userPseudonym: string, newBoard: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
            preference.boughtBoards.push(newBoard);
            await preference.save();
        } catch {
            return false;
        }
        return true;
    }

    async addChat(userPseudonym: string, newChat: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
            preference.boughtChats.push(newChat);
            await preference.save();
        } catch {
            return false;
        }
        return true;
    }

    async setLangage(userPseudonym: string, newLangage: number): Promise<number> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        preference.langage = newLangage;
        preference.save();
        return preference.langage;
    }
}
