/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SCORES_MODEL } from '@app/classes/database.schema';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as mongoose from 'mongoose';
import { Service } from 'typedi';

@Service()
export class BestScoresService {
    // TODO: revoir si nécessaire de mettre ceci dans une constante globale.
    private readonly numberOfBestPlayers;

    constructor() {
        this.numberOfBestPlayers = 5;
    }

    async addPlayers(players: PlayerScore[], gameType: GameType): Promise<void> {
        const scoresModel = SCORES_MODEL.get(gameType) as mongoose.Model<PlayerScore>;
        for (const player of players) {
            const scoreToAdd = new scoresModel({
                score: player.score,
                playerName: player.playerName,
                isDefault: player.isDefault,
            });
            const playerFound = await scoresModel.find({ playerName: player.playerName, score: player.score }).exec();
            if (playerFound.length === 0) await scoreToAdd.save();
        }
    }

    async getBestPlayers(gameType: GameType): Promise<PlayerScore[]> {
        const scoresModel = SCORES_MODEL.get(gameType) as mongoose.Model<PlayerScore>;
        const bestPlayers: PlayerScore[] = await scoresModel.find({}).sort({ score: -1 }).limit(this.numberOfBestPlayers).exec();
        return bestPlayers;
    }
}
