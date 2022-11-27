import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Connection } from './connection-schema';
import { Game } from './game-schema';

export type UserStatsDocument = UserStats & Document;

@Schema()
export class UserStats {
    @ApiProperty()
    @Prop({ required: true })
    userId: string;

    @ApiProperty()
    @Prop({ required: true })
    gamesPlayed: number;

    @ApiProperty()
    @Prop({ required: true })
    gamesWon: number;

    @ApiProperty()
    @Prop({ required: true })
    totalPoints: number;

    @ApiProperty()
    @Prop({ required: true })
    totalTimeMs: number;

    @ApiProperty()
    @Prop({ required: true })
    logins: [Connection];

    @ApiProperty()
    @Prop({ required: true })
    logouts: [Connection];

    @ApiProperty()
    @Prop({ required: true })
    games: [Game];
}

export const USER_STATS_SCHEMA = SchemaFactory.createForClass(UserStats);
