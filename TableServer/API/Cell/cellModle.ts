import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../Table/newTableModel";

export interface ICellDocument extends Document {
  _id: ObjectId;
  index: number;
  dateCreated: Date;
  visible: boolean;
  [key: string]: any; //allows any additional field
}

export interface ITableCellDocument extends Document {
  _id: mongoose.Types.ObjectId;
  tableId: ObjectId;
  CellId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyJoinCollection<T extends MyDocument<ITableCellDocument>>
  extends Document<any, any, T> {
  _doc: ITableCellDocument;
}

export class Cell {
  _id: string | ObjectId;
  index: number;
  dateCreated: Date;
  visible: boolean;

  constructor({
    index,
    dateCreated,
    visible = true,
  }: {
    index: number;
    dateCreated: Date;
    visible?: boolean;
  }) {
    this.index = index;
    this.dateCreated = dateCreated;
    this.visible = visible;
  }
}

export const CellSchema = new Schema(
  {
    index: Number,
    dateCreated: {
      type: Date,
      default: Date.now, 
      required: true,
    },
    fieldOfInterest: String,
    details: String,
    CellLink: String,
    price: Number,
    visible: Boolean,
  },
  { strict: false }  //allow any field in the schema
);

// Pre-save hook to auto-increment index - create new mongo-index for the cell index field
// CellSchema.pre<ICellDocument>("save", async function (next) {
//   if (this.isNew) {
//     const lastCell = await CellModel.findOne().sort({ index: -1 });
//     this.index = lastCell ? lastCell.index + 1 : 1;
//   }
//   next();
// });

export const CellModel: Model<ICellDocument> = model<ICellDocument>(
  "Cells",
  CellSchema
); //the collection name is in plural!!!

export const allCell: Cell[] = [];

const TableCellSchema = new mongoose.Schema({
  tableId: { type: Schema.Types.ObjectId, ref: CellModel },
  CellId: { type: Schema.Types.ObjectId, ref: TableModel },
});

export const TableCellModel: Model<
  MyJoinCollection<MyDocument<ITableCellDocument>>
> = model<MyJoinCollection<MyDocument<ITableCellDocument>>>(
  "tableCells",
  TableCellSchema
);