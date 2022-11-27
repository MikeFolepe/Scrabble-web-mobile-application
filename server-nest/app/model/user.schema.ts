import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Friend } from './friend.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty()
    @Prop({ required: true })
    pseudonym: string;

    @ApiProperty()
    @Prop({ required: true })
    avatar: string;

    @ApiProperty()
    @Prop({ required: true })
    email: string;

    @ApiProperty()
    @Prop({ required: true })
    password: string;

    @ApiProperty()
    @Prop({ required: true })
    xpPoints: number;

    @ApiProperty()
    @Prop({ required: true })
    friends: [Friend];
}

export const USER_SCHEMA = SchemaFactory.createForClass(User);
