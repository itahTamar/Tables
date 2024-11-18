import { Document, Model, Schema, model } from "mongoose";
import mongoose from "mongoose";

// Define the User interface
export interface ITable extends Document {
  columnOfInterest: string;
  dateCreated: Date;
  creator: string;
  columnsOrder: string[];
}
export class Table {
  columnOfInterest: string;
  dateCreated: Date;
  creator: string;
  columnsOrder: string[];

  constructor({
    columnOfInterest,
    creator,
    columnsOrder = [ "details", "dataLink", "price", "dateCreated"],
  }: {
    columnOfInterest: string;
    creator: string;
    columnsOrder: string[];
  }) {
    this.columnOfInterest = columnOfInterest;
    this.dateCreated = new Date();
    this.creator = creator;
    this.columnsOrder = columnsOrder;
  }
}

//define a schema (It is like interface in typescript)
export const tableSchema = new mongoose.Schema<ITable>({
  columnOfInterest: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now }, //set the current date
  creator: String,
  columnsOrder: {
    type: [String],
    default: ["index", "dateCreated", "details", "dataLink", "price"],
  },
});

// Create the TableModel and extend it with custom methods
export interface ITableModel extends Model<ITable> {
  findOneAndUpdateDataOnMongoDB(
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<any>;
}

export const TableModel = model<ITable, ITableModel>("tables", tableSchema);

export const tables: Table[] = [];
