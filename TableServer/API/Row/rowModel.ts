import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { ColumnModel } from "../Column/columnModel";

export interface ICellDocument extends Document {
  _id: ObjectId;
  rowNum: number;
  dateCreated: Date;
  value: string;
  visible: boolean;
}

export interface IColumnCellDocument extends Document {
  _id: mongoose.Types.ObjectId;
  ColumnId: ObjectId;
  CellId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyJoinCRCollection<T extends MyDocument<IColumnCellDocument>>
  extends Document<any, any, T> {
  _doc: IColumnCellDocument;
}

export class Cell {
  _id: string | ObjectId;
  rowNum: number;
  dateCreated: Date;
  value: string;
  visible: boolean;

  constructor({
    rowNum,
    dateCreated,
    value = "",
    visible = true,
  }: {
    rowNum: number;
    dateCreated: Date;
    value: string;
    visible?: boolean;
  }) {
    this.rowNum = rowNum;
    this.dateCreated = dateCreated;
    this.value = value;
    this.visible = visible;
  }
}

export const CellSchema = new Schema(
  {
    rowNum: Number,
    dateCreated: {
      type: Date,
      default: Date.now, //set the current date when a cell is created
      required: true,
    },
    value: String,
    visible: Boolean,
  },
  { strict: false }  //allow any field in the schema
);

// Pre-save hook to auto-increment index
CellSchema.pre<ICellDocument>("save", async function (next) {
  if (this.isNew) {
    const lastCell = await CellModel.findOne().sort({ rowNum: -1 });
    this.rowNum = lastCell ? lastCell.rowNum + 1 : 1;
  }
  next();
});

export const CellModel: Model<ICellDocument> = model<ICellDocument>(
  "Cells",
  CellSchema
); //the collection name is in plural!!!

export const allCell: Cell[] = [];

const ColumnCellSchema = new mongoose.Schema({
  ColumnId: { type: Schema.Types.ObjectId, ref: CellModel },
  CellId: { type: Schema.Types.ObjectId, ref: ColumnModel },
});

export const ColumnCellModel: Model<
  MyJoinCRCollection<MyDocument<IColumnCellDocument>>
> = model<MyJoinCRCollection<MyDocument<IColumnCellDocument>>>(
  "ColumnCell",
  ColumnCellSchema
);
