import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type AiDocument = Ai & Document;

@Schema()
export class Ai {
    @ApiProperty()
    @Prop({ required: true })
    aiName: string;

    @ApiProperty()
    @Prop({ required: true })
    isDefault: boolean;

    @ApiProperty()
    @Prop()
    _id?: string;
}

export const AI_SCHEMA = SchemaFactory.createForClass(Ai);
