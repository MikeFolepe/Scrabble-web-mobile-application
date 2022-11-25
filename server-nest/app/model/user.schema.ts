import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class User extends mongoose.Document {
    @Prop({ required: true })
    avatar: string;

    @Prop({ required: true })
    pseudonym: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserSchema = SchemaFactory.createForClass(User);
