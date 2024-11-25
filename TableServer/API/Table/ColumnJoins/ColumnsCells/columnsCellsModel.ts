import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { CellModel } from "../../../Cell/cellModel";
import { ColumnModel } from "../columnModel";

export interface IColumnsCellDocument extends Document {
  _id: mongoose.Types.ObjectId;
  ColumnsId: ObjectId;
  CellId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyColumnsCellJoinCollection<
  T extends MyDocument<IColumnsCellDocument>
> extends Document<any, any, T> {
  _doc: IColumnsCellDocument;
}
const ColumnsCellSchema = new mongoose.Schema({
  ColumnsId: { type: Schema.Types.ObjectId, ref: CellModel },
  CellId: { type: Schema.Types.ObjectId, ref: ColumnModel },
});

export const ColumnsCellsModel: Model<
  MyColumnsCellJoinCollection<MyDocument<IColumnsCellDocument>>
> = model<MyColumnsCellJoinCollection<MyDocument<IColumnsCellDocument>>>(
  "ColumnsCells",
  ColumnsCellSchema
);
