import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { DataObjectModel } from "./dataObjectModel";

//join
export interface IJoinDataObjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  DataObjectId1: ObjectId;
  DataObjectId2: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyJoinDataObjectCollection<
  T extends MyDocument<IJoinDataObjectDocument>
> extends Document<any, any, T> {
  _doc: IJoinDataObjectDocument;
}

const JoinDataObjectSchema = new mongoose.Schema({
  DataObjectId1: { type: Schema.Types.ObjectId, ref: DataObjectModel },
  DataObjectId2: { type: Schema.Types.ObjectId, ref: DataObjectModel },
});

export const JoinDataObjectModel: Model<
  MyJoinDataObjectCollection<MyDocument<IJoinDataObjectDocument>>
> = model<MyJoinDataObjectCollection<MyDocument<IJoinDataObjectDocument>>>(
  "JoinDataObjects",
  JoinDataObjectSchema
);
