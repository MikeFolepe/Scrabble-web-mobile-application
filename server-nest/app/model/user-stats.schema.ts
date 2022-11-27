import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Connection } from './connection-schema';
import { Game } from './game-schema';

export type UserStatsDocument = UserStats & Document;

@Schema()
export class UserStats {
    @ApiProperty()
    @Prop({ type: String, required: true })
    userId: string;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    gamesPlayed: number;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    gamesWon: number;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    totalPoints: number;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    totalTimeMs: number;

    @ApiProperty()
    @Prop({ required: true, default: [] })
    logins: [Connection];

    @ApiProperty()
    @Prop({ required: true, default: [] })
    logouts: [Connection];

    @ApiProperty()
    @Prop({ required: true, default: [] })
    games: [Game];
}

export const USER_STATS_SCHEMA = SchemaFactory.createForClass(UserStats);
