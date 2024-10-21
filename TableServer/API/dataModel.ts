import mongoose, { Schema, model } from "mongoose";
import { ObjectId } from 'mongodb';

export class Data {
    _id: string | ObjectId;
    massage: string;

    constructor({massage}: {massage: string}){
        this.massage = massage;
    }
}

export const DataSchema = new Schema({
    massage: String
});

export const DataModel = model("tests", DataSchema) //the collection name is in plural!!!

export const allData: Data[] = [];