// import user for common
import { Preference } from 'app/model/preferences.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PreferenceService {
    constructor(@InjectModel(Preference.name) private readonly preferenceModel: Model<Preference>) {}

<<<<<<< HEAD
    async addPreference(userPseudonym: string) {
        const newPreference = new this.preferenceModel({ user: userPseudonym });
=======
    async addPreference(userId: string) {
        const newPreference = new this.preferenceModel({ user: userId });
>>>>>>> origin/develop
        try {
            await newPreference.save();
        } catch (error) {
            console.log(error);
        }
    }

<<<<<<< HEAD
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

    async getLanguage(userPseudonym: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
        return preference.language.toString();
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
=======
    async getAppTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.appTheme;
    }

    async getBoardTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.currentBoardTheme;
    }

    async getChatTheme(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.currentChatTheme;
    }

    async getLanguage(userId: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.language.toString();
    }

    async getBoards(userId: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.boughtBoards;
    }

    async getChats(userId: string): Promise<string[]> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
        return preference.boughtChats;
    }

    async setAppTheme(userId: string, newAppTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
        preference.appTheme = newAppTheme;
        preference.save();
        return preference.appTheme;
    }

<<<<<<< HEAD
    async setBoardTheme(userPseudonym: string, newBoardTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
=======
    async setBoardTheme(userId: string, newBoardTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
        preference.currentBoardTheme = newBoardTheme;
        preference.save();
        return preference.currentBoardTheme;
    }

<<<<<<< HEAD
    async setChatTheme(userPseudonym: string, newChatTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
=======
    async setChatTheme(userId: string, newChatTheme: string): Promise<string> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
        preference.currentChatTheme = newChatTheme;
        preference.save();
        return preference.currentChatTheme;
    }

<<<<<<< HEAD
    async addBoard(userPseudonym: string, newBoard: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
=======
    async addBoard(userId: string, newBoard: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
            preference.boughtBoards.push(newBoard);
            preference.save();
        } catch {
            return false;
        }
        return true;
    }

<<<<<<< HEAD
    async addChat(userPseudonym: string, newChat: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
=======
    async addChat(userId: string, newChat: string): Promise<boolean> {
        try {
            const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
            preference.boughtChats.push(newChat);
            preference.save();
        } catch {
            return false;
        }
        return true;
    }

<<<<<<< HEAD
    async setLanguage(userPseudonym: string, newLanguage: number): Promise<number> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userPseudonym }).exec();
=======
    async setLanguage(userId: string, newLanguage: number): Promise<number> {
        const preference: Preference = await this.preferenceModel.findOne({ user: userId }).exec();
>>>>>>> origin/develop
        preference.language = newLanguage;
        preference.save();
        return preference.language;
    }
}
