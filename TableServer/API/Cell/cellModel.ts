import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";

export interface ICellDocument extends Document {
  _id: ObjectId;
  rowIndex: number;
  visible: boolean;
  [key: string]: any; //allows any additional field
}

export class Cell {
  _id: string | ObjectId;
  rowIndex: number;
  visible: boolean;

  constructor({
    rowIndex,
    visible = true,
  }: {
    rowIndex: number;
    visible: boolean;
  }) {
    this.rowIndex = rowIndex;
    this.visible = visible;
  }
}

export const CellSchema = new Schema(
  {
    rowIndex: Number,
    visible: { type: Boolean, default: true },
  },
  { strict: false }  //allow any field in the schema
);

// give a new number for every added cell at rowIndex field (count up) 
//!need to check how it works with the columns
// CellSchema.pre<ICellDocument>("save", async function (next) {
//   if (this.isNew) {
//     const lastCell = await CellModel.findOne().sort({ index: -1 });
//     this.rowIndex = lastCell ? lastCell.rowIndex + 1 : 1;
//   }
//   next();
// });

export const CellModel: Model<ICellDocument> = model<ICellDocument>(
  "Cells",
  CellSchema
); //the collection name is in plural!!!

export const allCell: Cell[] = [];