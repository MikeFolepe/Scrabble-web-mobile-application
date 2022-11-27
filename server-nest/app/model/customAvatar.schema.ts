import * as mongoose from 'mongoose';

export const ImageSchema = new mongoose.Schema({
    name : { type : String, required : true },
    image : { data : Buffer, contentType : String, required : true},
});