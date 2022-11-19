import * as mongoose from 'mongoose';


export const UserSchema = new mongoose.Schema({
    avatar: { type: String, required: true },
    pseudonym: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

