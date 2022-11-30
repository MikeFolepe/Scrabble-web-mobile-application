import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

@Schema()
export class Preference extends mongoose.Document {
    @Prop({ type: String, required: true, ref: User.name })
    user: string;

    @Prop({ type: String, required: true, default: 'Default' })
    appTheme: string;

    @Prop({ type: String, required: true, default: 'Par défaut' })
    currentBoardTheme: string;

    @Prop({ type: String, required: true, default: 'Par défaut' })
    currentChatTheme: string;

    @Prop({ type: [String], required: true, default: [] })
    boughtBoards: [string];

    @Prop({ type: [String], required: true, default: [] })
    boughtChats: [string];

    @Prop({ type: Number, required: true, default: 0 })
    language: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PreferenceSchema = SchemaFactory.createForClass(Preference);
