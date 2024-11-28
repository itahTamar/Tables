import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";

export interface IDataObjectDocument extends Document {
  _id: ObjectId;
  [key: string]: any; //allows any additional field
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export class DataObject {
  _id: string | ObjectId;
  [key: string]: any;

  constructor(init: Partial<IDataObjectDocument>) {
    Object.assign(this, init);
  }
}

export const DataObjectSchema = new Schema(
  { strict: false } //allow any field in the schema
);

// Pre-save hook to auto-increment index - create new mongo-index for the DataObject index field
// DataObjectSchema.pre<IDataObjectDocument>("save", async function (next) {
//   if (this.isNew) {
//     const lastDataObject = await DataObjectModel.findOne().sort({ index: -1 });
//     this.index = lastDataObject ? lastDataObject.index + 1 : 1;
//   }
//   next();
// });

export const DataObjectModel: Model<IDataObjectDocument> =
  model<IDataObjectDocument>("DataObjects", DataObjectSchema); //the collection name is in plural!!!

export const allDataObject: DataObject[] = [];