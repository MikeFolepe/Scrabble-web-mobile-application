import { AI_MODELS, DbModel, SCORES_MODEL } from '@app/classes/database.schema';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameType } from '@common/game-type';
import * as mongoose from 'mongoose';
import * as fileSystem from 'fs';
import { Service } from 'typedi';
import { PlayerScore } from '@common/player';

@Service()
export class AdministratorService {
    private newAiPlayer: AiPlayerDB;
    private dictionaries: Dictionary[] = [];

    async getAllAiPlayers(aiType: AiType): Promise<AiPlayerDB[]> {
        const aiModel = AI_MODELS.get(aiType) as DbModel;
        const aiPlayers = await aiModel.find({}).exec();
        return aiPlayers;
    }

    async addAiPlayer(aiPlayer: AiPlayer, aiType: AiType): Promise<AiPlayerDB> {
        const aiModel = AI_MODELS.get(aiType) as DbModel;
        const aiToSave = new aiModel({
            aiName: aiPlayer.aiName,
            isDefault: aiPlayer.isDefault,
        });
        await aiToSave.save().then((ai: AiPlayerDB) => {
            this.newAiPlayer = ai;
        });
        return this.newAiPlayer;
    }

    async deleteAiPlayer(id: string, aiType: AiType): Promise<AiPlayerDB[]> {
        const aiModel = AI_MODELS.get(aiType) as DbModel;
        await aiModel.findByIdAndDelete(id).exec();
        return await this.getAllAiPlayers(aiType);
    }

    async updateAiPlayer(id: string, object: { aiBeginner: AiPlayer; aiType: AiType }): Promise<AiPlayerDB[]> {
        const aiModel = AI_MODELS.get(object.aiType) as DbModel;
        await aiModel.findByIdAndUpdate(id, { aiName: object.aiBeginner.aiName }).exec();
        return await this.getAllAiPlayers(object.aiType);
    }

    getDictionaries(): Dictionary[] {
        this.dictionaries = [];
        const files = fileSystem.readdirSync('./dictionaries/', 'utf8');
        for (const file of files) {
            const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${file}`, 'utf8'));
            const isDefault = file === 'dictionary.json';
            const dictionary: Dictionary = {
                fileName: file,
                title: readFile.title,
                description: readFile.description,
                isDefault,
            };
            this.dictionaries.push(dictionary);
        }
        return this.dictionaries;
    }

    updateDictionary(dictionary: Dictionary): Dictionary[] {
        const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${dictionary.fileName}`, 'utf8'));
        readFile.title = dictionary.title;
        readFile.description = dictionary.description;
        fileSystem.writeFileSync(`./dictionaries/${dictionary.fileName}`, JSON.stringify(readFile), 'utf8');
        return this.getDictionaries();
    }

    deleteDictionary(fileName: string): Dictionary[] {
        fileSystem.unlinkSync(`./dictionaries/${fileName}`);
        return this.getDictionaries();
    }

    async resetScores(gameType: GameType): Promise<void> {
        const scoresModel = SCORES_MODEL.get(gameType) as mongoose.Model<PlayerScore>;
        await scoresModel.deleteMany({ isDefault: false }).exec();
    }
}
