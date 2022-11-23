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
}
