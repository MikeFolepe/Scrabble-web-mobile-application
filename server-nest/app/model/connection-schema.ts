import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ConnectionDocument = Connection & Document;

@Schema()
export class Connection {
    @ApiProperty()
    @Prop({ required: true })
    date: string;

    @ApiProperty()
    @Prop({ required: true })
    time: string;

    @ApiProperty()
    @Prop({ required: true })
    isLogin: boolean;
}

export const CONNECTION_SCHEMA = SchemaFactory.createForClass(Connection);
