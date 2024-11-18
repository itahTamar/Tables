import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../Table/tableModel";

export interface IColumnDocument extends Document {
  _id: ObjectId;
  colNum: number;
  headerName: string;
  visible: boolean;
}

export interface ITableColumnDocument extends Document {
  _id: mongoose.Types.ObjectId;
  tableId: ObjectId;
  columnId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyJoinTCCollection<T extends MyDocument<ITableColumnDocument>>
  extends Document<any, any, T> {
  _doc: ITableColumnDocument;
}

export class Column {
  _id: string | ObjectId;
  colNum: number;
  headerName: string;
  visible: boolean;

  constructor({
    colNum,
    headerName,
    visible = true,
  }: {
    colNum: number;
    headerName: string;
    visible?: boolean;
  }) {
    this.colNum = colNum;
    this.headerName = headerName;
    this.visible = visible;
  }
}

export const ColumnSchema = new Schema(
  {
    colNum: Number,
    headerName: String,
    visible: Boolean,
  }
);

// Pre-save hook to auto-increment colNum
ColumnSchema.pre<IColumnDocument>("save", async function (next) {
    if (this.isNew) {
      const lastColumn = await ColumnModel.findOne().sort({ colNum: -1 });
      this.colNum = lastColumn ? lastColumn.colNum + 1 : 1;
    }
    next();
  });

export const ColumnModel: Model<IColumnDocument> = model<IColumnDocument>(
  "columns",
  ColumnSchema
); //the collection name is in plural!!!

export const columns: Column[] = [];

const TableColumnSchema = new mongoose.Schema({
  tableId: { type: Schema.Types.ObjectId, ref: ColumnModel },
  dataId: { type: Schema.Types.ObjectId, ref: TableModel },
});

export const TableColumnModel: Model<
  MyJoinTCCollection<MyDocument<ITableColumnDocument>>
> = model<MyJoinTCCollection<MyDocument<ITableColumnDocument>>>(
  "tableColumns",
  TableColumnSchema
);
