import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../../tableModel";
import { ColumnModel } from "../columnModel";

export interface ITableColumnDocument extends Document {
  _id: mongoose.Types.ObjectId;
  tableId: ObjectId;
  ColumnId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyTableColumnJoinCollection<
  T extends MyDocument<ITableColumnDocument>
> extends Document<any, any, T> {
  _doc: ITableColumnDocument;
}
const TableColumnSchema = new mongoose.Schema({
  tableId: { type: Schema.Types.ObjectId, ref: ColumnModel },
  ColumnId: { type: Schema.Types.ObjectId, ref: TableModel },
});

export const TableColumnModel: Model<
  MyTableColumnJoinCollection<MyDocument<ITableColumnDocument>>
> = model<MyTableColumnJoinCollection<MyDocument<ITableColumnDocument>>>(
  "tableColumns",
  TableColumnSchema
);
