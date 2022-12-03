// import user for common
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Preference } from 'app/model/preferences.schema';
import { Model } from 'mongoose';

@Injectable()
export class PreferenceService {
    constructor(@InjectModel(Preference.name) private readonly preferenceModel: Model<Preference>) {}

    async addPreference(userId: string) {
        const newPreference = new this.preferenceModel({ user: userId });
        try {
            await newPreference.save();
        } catch (error) {
            console.log(error);
        }
    }

    async getAppTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        Logger.log(preference.appTheme);
        return preference.appTheme;
    }

    async getBoardTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        Logger.log(preference.currentBoardTheme);
        return preference.currentBoardTheme;
    }

    async getChatTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        Logger.log(preference.currentChatTheme);
        return preference.currentChatTheme;
    }

    async getLanguage(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.language.toString();
    }

    async getBoards(userId: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        Logger.log(preference.boughtBoards);
        return preference.boughtBoards;
    }

    async getChats(userId: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        Logger.log(preference.boughtChats);
        return preference.boughtChats;
    }

    async setAppTheme(userId: string, newAppTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        preference.appTheme = newAppTheme;
        preference.save();
        return preference.appTheme;
    }

    async setBoardTheme(userId: string, newBoardTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        preference.currentBoardTheme = newBoardTheme;
        preference.save();
        return preference.currentBoardTheme;
    }

    async setChatTheme(userId: string, newChatTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        preference.currentChatTheme = newChatTheme;
        preference.save();
        return preference.currentChatTheme;
    }

    async addBoard(userId: string, newBoard: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
            preference.boughtBoards.push(newBoard);
            preference.save();
        } catch {
            return false;
        }
        return true;
    }

    async addChat(userId: string, newChat: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
            preference.boughtChats.push(newChat);
            preference.save();
        } catch {
            return false;
        }
        return true;
    }

    async setLanguage(userId: string, language: number): Promise<string> {
        console.log(language);
        await this.preferenceModel.findOneAndUpdate({ user: userId }, { language }).exec();
        const newPreference = await this.preferenceModel.findOne({ user: userId });
        return newPreference.language.toString();
    }
}
