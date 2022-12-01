import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    startDate: string;

    @ApiProperty()
    @Prop({ required: true })
    startTime: string;

    @ApiProperty()
    @Prop({ required: true })
    winnerName: string;
}

export const GAME_SCHEMA = SchemaFactory.createForClass(Game);
