import * as mongoose from 'mongoose';


export const AccountSchema = new mongoose.Schema({
    avatar: { type: String, required: true },
    pseudonym: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
});


export interface Account {
    id: string;
    avatar: string;
    pseudonym: string;
    password: string;
    email: string;
}

