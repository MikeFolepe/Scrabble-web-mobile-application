import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Friend } from './friend.schema';
import { Notification } from './notification-schema';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty()
    @Prop({ type: String, required: true })
    pseudonym: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    avatar: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    email: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    password: string;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    xpPoints: number;

    @ApiProperty()
    @Prop({ required: true, default: [] })
    friends: [Friend];

    @ApiProperty()
    @Prop({ required: true, default: [] })
    notifications: [Notification];

    @ApiProperty()
    @Prop({ required: true, default: [] })
    invitations: [Friend];
}

export const USER_SCHEMA = SchemaFactory.createForClass(User);
