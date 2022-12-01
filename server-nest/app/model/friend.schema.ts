import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type FriendDocument = Friend & Document;

@Schema()
export class Friend {
    @ApiProperty()
    @Prop({ required: true })
    pseudonym: string;

    @ApiProperty()
    @Prop({ required: true })
    avatar: string;

    @ApiProperty()
    @Prop({ required: true })
    xpPoints: number;
}

export const FRIEND_SCHEMA = SchemaFactory.createForClass(Friend);
