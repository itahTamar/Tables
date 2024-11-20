import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../Table/tableModel";
import { CellModel } from "../Cell/cellModel";

export interface ITableCellDocument extends Document {
  _id: mongoose.Types.ObjectId;
  tableId: ObjectId;
  CellId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyTableCellJoinCollection<
  T extends MyDocument<ITableCellDocument>
> extends Document<any, any, T> {
  _doc: ITableCellDocument;
}
const TableCellSchema = new mongoose.Schema({
  tableId: { type: Schema.Types.ObjectId, ref: CellModel },
  CellId: { type: Schema.Types.ObjectId, ref: TableModel },
});

export const TableCellModel: Model<
  MyTableCellJoinCollection<MyDocument<ITableCellDocument>>
> = model<MyTableCellJoinCollection<MyDocument<ITableCellDocument>>>(
  "tableCells",
  TableCellSchema
);
