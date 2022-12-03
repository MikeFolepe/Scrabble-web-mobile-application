import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
    @ApiProperty()
    @Prop({ required: true })
    type: number;

    @ApiProperty()
    @Prop({ required: true })
    sender: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    date: string;

    @ApiProperty()
    @Prop({ required: true })
    time: string;
}

export const NOTIFICATION_SCHEMA = SchemaFactory.createForClass(Notification);
