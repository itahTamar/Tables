import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";

export interface IColumnDocument extends Document {
  _id: ObjectId;
  columnIndex: number;
  visible: boolean;
}

export class Column {
  _id: string | ObjectId;
  columnIndex: number;
  visible: boolean;

  constructor({
    columnIndex,
    visible = true,
  }: {
    columnIndex: number;
    visible?: boolean;
  }) {
    this.columnIndex = columnIndex;
    this.visible = visible;
  }
}

export const ColumnSchema = new Schema(
  {
    columnIndex: Number,
    visible: Boolean,
  },
  { strict: false }  //allow any field in the schema
);


export const ColumnModel: Model<IColumnDocument> = model<IColumnDocument>(
  "Columns",
  ColumnSchema
); //the collection name is in plural!!!

export const columns: Column[] = [];