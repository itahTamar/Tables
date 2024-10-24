import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../Table/tableModel";

export interface IDataDocument extends Document {
  _id: ObjectId
  index: number;
  dateCreated: Date;
  fieldOfInterest: string;
  details: string;
  dataLink: string;
  price: number;
  visible: boolean;
}

export interface ITableDataDocument extends Document {
  tableId: ObjectId;
  dataId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyJoinCollection<T extends MyDocument<ITableDataDocument>>
  extends Document<any, any, T> {
  _doc: ITableDataDocument;
}

export class Data {
  _id: string | ObjectId;
  index: number;
  dateCreated: Date;
  fieldOfInterest: string;
  details: string;
  dataLink: string;
  price: number;
  visible: boolean;

  constructor({
    index,
    dateCreated,
    fieldOfInterest,
    details = "",
    dataLink = "",
    price = 0,
    visible = true
  }: {
    index: number;
    dateCreated: Date;
    fieldOfInterest: string;
    details?: string;
    dataLink?: string;
    price?: number;
    visible?: boolean;
  }) {
    this.index = index;
    this.dateCreated = dateCreated;
    this.fieldOfInterest = fieldOfInterest;
    this.details = details;
    this.dataLink = dataLink;
    this.price = price;
    this.visible = visible;
  }
}

export const DataSchema = new Schema({
  index: Number,
  dateCreated: {
    type: Date,
    default: Date.now, //set the current date when a data is created
    required: true,
  },
  fieldOfInterest: String,
  details: String,
  dataLink: String,
  price: Number,
  visible: Boolean,
});

// Pre-save hook to auto-increment index
DataSchema.pre<IDataDocument>("save", async function (next) {
  if (this.isNew) {
    const lastData = await DataModel.findOne().sort({ index: -1 });
    this.index = lastData ? lastData.index + 1 : 1;
  }
  next();
});

export const DataModel: Model<IDataDocument> = model<IDataDocument>(
  "data",
  DataSchema
); //the collection name is in plural!!!

export const allData: Data[] = [];

const TableDataSchema = new mongoose.Schema({
  allDataId: { type: Schema.Types.ObjectId, ref: DataModel },
  tableId: { type: Schema.Types.ObjectId, ref: TableModel },
});

export const TableDataModel: Model<
  MyJoinCollection<MyDocument<ITableDataDocument>>
> = model<MyJoinCollection<MyDocument<ITableDataDocument>>>(
  "tableData",
  TableDataSchema
);
